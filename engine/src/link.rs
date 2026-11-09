//! Pemeriksa tautan: hanya membaca bentuk URL (situs tidak dibuka), berbasis aturan yang bisa dijelaskan.
//!
//! Alur: prepare (rapikan, ambil tautan pertama) -> parse -> validasi host -> pecah domain -> aturan L01 sampai L25
//! dan domain::check -> skor. Daftar konstanta di bagian atas (HOSTING, SHORTENERS, BAIT, GAMBLE, dst.) paling sering diubah.
//! Catatan: pesan galat dan nama kombinasi menjadi kunci terjemahan di front-end (LINK_ERRORS_EN, COMBOS_EN),
//! jadi ubah keduanya bersamaan. Tipe keluaran harus sejajar dengan web/src/engine.ts.
use crate::domain;
use crate::Finding;
use regex::Regex;
use serde::Serialize;
use std::collections::BTreeSet;
use std::sync::OnceLock;

const TACTIC: &str = "TAUTAN MENCURIGAKAN";
const DISCLAIMER: &str = "Pemeriksaan ini hanya membaca bentuk tautan. Situsnya tidak dibuka, jadi isi halaman, umur domain, dan reputasinya tidak diperiksa. Hasil bukan jaminan.";
const NO_URL: &str = "Tautan tidak boleh mengandung spasi dan tidak ada tautan yang bisa diambil dari teks ini. Tempel satu tautan, atau pakai Cek pesan untuk teks panjang.";
const ONLY_HTTP: &str = "Hanya tautan http dan https yang bisa diperiksa.";

/// Akhiran dua tingkat (perkiraan, bukan Public Suffix List lengkap).
const SECOND_LEVEL: &[&str] = &[
    "co.id", "go.id", "or.id", "ac.id", "sch.id", "web.id", "my.id", "biz.id", "desa.id", "mil.id", "net.id", "ponpes.id",
    "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "org.au", "edu.au", "co.nz", "co.jp", "or.jp", "co.kr", "co.in",
    "net.in", "org.in", "com.sg", "com.my", "com.cn", "com.br", "com.mx", "com.tr", "com.hk", "com.tw", "com.ph", "com.vn",
    "co.th", "co.za", "com.ar", "com.co", "com.pe",
];
/// Platform hosting tempat siapa saja bisa membuat subdomain bebas. Nama situs di depannya dikuasai pengguna.
const HOSTING: &[&str] = &[
    "github.io", "gitlab.io", "vercel.app", "netlify.app", "pages.dev", "workers.dev", "web.app", "firebaseapp.com", "blogspot.com",
    "wordpress.com", "herokuapp.com", "onrender.com", "glitch.me", "weebly.com", "wixsite.com", "000webhostapp.com", "repl.co",
    "replit.app", "carrd.co", "notion.site", "webflow.io", "framer.website", "bubbleapps.io", "azurewebsites.net", "appspot.com",
    "ngrok.io", "ngrok-free.app", "trycloudflare.com", "duckdns.org", "ddns.net", "surge.sh", "fly.dev", "railway.app", "deno.dev",
    "my.canva.site",
];
const USER_CONTENT: &[&str] = &["forms.gle", "sites.google.com", "linktr.ee", "bio.link"];
const CRED_KEYS: &[&str] = &["password", "passwd", "pwd", "pass", "otp", "pin", "cvv", "cardnumber", "card", "ssn"];
const CHEAP_TLDS: &[&str] = &["xyz", "top", "click", "icu", "site", "online", "vip", "cc", "buzz", "cfd", "sbs", "monster"];
const SHORTENERS: &[&str] = &["bit.ly", "tinyurl.com", "cutt.ly", "s.id", "t.ly", "is.gd", "rb.gy", "shorturl.at", "ow.ly", "ln.run", "lnkl.st", "rebrand.ly", "v.gd", "clck.ru", "bitly.ws", "shorturl.gg","bitly.com", "wa.link", "bit.do", "tiny.cc", "soo.gd", "kutt.it", "adf.ly", "buff.ly", "shorturl.asia", "qrco.de", "urlz.fr", "tr.ee", "wde.la"];
const BAIT: &[&str] = &["login", "masuk", "verifikasi", "verify", "secure", "akun", "account", "update", "perbarui", "konfirmasi", "klaim", "claim", "hadiah", "bonus", "promo", "undian", "pencairan", "reset", "claim", "saldo", "reward", "winner", "withdraw", "confirm", "giveaway", "voucher", "gratis", "penarikan"];
/// Kata khas situs judi online dan angka merek yang sering menempel di belakang nama situs judi.
const GAMBLE: &[&str] = &["gacor", "maxwin", "togel", "judol", "casino", "kasino", "sbobet", "jepe", "wede", "scatter", "mahjong", "jackpot", "baccarat", "sicbo"];
const GAMBLE_NUM: &[&str] = &["77", "88", "138", "168", "188", "303", "777", "888", "999"];
const GAMBLE_TOKEN: &[&str] = &["slot", "slots", "rtp", "toto", "zeus", "bonanza"];
const GAMBLE_WEAK: &[&str] = &["depo", "wd", "jp", "wede"];
const BAD_EXT: &[&str] = &["apk", "exe", "msi", "scr", "bat", "cmd", "vbs", "jar"];

type R = (usize, usize);

#[derive(Serialize)]
pub struct Parts {
    pub scheme: Option<String>,
    pub userinfo: Option<String>,
    pub host: String,
    pub subdomain: String,
    pub registrable: String,
    pub port: Option<String>,
    pub path: String,
}

#[derive(Serialize)]
pub struct LinkAnalysis {
    pub error: Option<String>,
    /// Tautan yang sudah dirapikan. Posisi sorotan merujuk ke teks ini.
    pub input: String,
    /// "EXTRACTED" bila tautan diambil dari teks yang lebih panjang.
    pub note: Option<String>,
    /// Jumlah tautan lain yang ada di teks tetapi tidak diperiksa.
    pub extra_links: usize,
    pub score: u32,
    pub level: &'static str,
    pub findings: Vec<Finding>,
    pub combos: Vec<String>,
    pub tactics: Vec<String>,
    pub disclaimer: &'static str,
    pub parts: Option<Parts>,
}

struct P { scheme: Option<R>, userinfo: Option<R>, host: R, port: Option<R>, path: R }

fn fail(input: &str, msg: &str) -> LinkAnalysis {
    LinkAnalysis { error: Some(msg.into()), input: input.into(), note: None, extra_links: 0, score: 0, level: "tidak_ditemukan", findings: vec![], combos: vec![], tactics: vec![], disclaimer: DISCLAIMER, parts: None }
}

fn url_re() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r#"(?i)(?:https?://|www\.)[^\s<>"'“”‘’]+"#).unwrap())
}

fn trim_url(s: &str) -> &str {
    s.trim_start_matches(|c| matches!(c, '<' | '(' | '[' | '{' | '"' | '\'' | '“' | '‘'))
        .trim_end_matches(|c| matches!(c, '>' | ')' | ']' | '}' | '"' | '\'' | '”' | '’' | '.' | ',' | ';' | ':' | '!' | '?'))
}

/// Rapikan masukan: buang pembungkus dan tanda baca, ubah \ jadi /, dan ambil tautan pertama bila yang ditempel berupa teks.
fn prepare(raw: &str) -> Result<(String, bool, usize), &'static str> {
    let t: String = raw.trim().replace('\\', "/").chars().take(4096).collect();
    if t.chars().any(|c| c.is_whitespace()) {
        let found: Vec<&str> = url_re().find_iter(&t).map(|m| m.as_str()).collect();
        if found.is_empty() { return Err(NO_URL); }
        return Ok((trim_url(found[0]).chars().take(2048).collect(), true, found.len() - 1));
    }
    Ok((trim_url(&t).chars().take(2048).collect(), false, 0))
}

fn parse(s: &str) -> Result<P, &'static str> {
    if s.is_empty() { return Err("Tempel tautan terlebih dahulu."); }
    if s.chars().any(|c| c.is_whitespace()) { return Err(NO_URL); }
    let (scheme, start) = if let Some(i) = s.find("://") {
        let sc = &s[..i];
        if !sc.eq_ignore_ascii_case("http") && !sc.eq_ignore_ascii_case("https") { return Err(ONLY_HTTP); }
        (Some((0, i)), i + 3)
    } else {
        if let Some(i) = s.find(':') {
            let (pre, post) = (&s[..i], &s[i + 1..]);
            if !pre.is_empty() && pre.chars().all(|c| c.is_ascii_alphabetic()) && !post.starts_with(|c: char| c.is_ascii_digit()) { return Err(ONLY_HTTP); }
        }
        (None, 0)
    };
    let rest = &s[start..];
    let auth_end = start + rest.find(|c| c == '/' || c == '?' || c == '#').unwrap_or(rest.len());
    let auth = &s[start..auth_end];
    let (host_start, userinfo) = match auth.rfind('@') {
        Some(i) => (start + i + 1, Some((start, start + i))),
        None => (start, None),
    };
    let hp = &s[host_start..auth_end];
    let (host_end, port) = if hp.starts_with('[') {
        match hp.find(']') {
            Some(i) => {
                let after = &hp[i + 1..];
                if after.starts_with(':') { (host_start + i + 1, Some((host_start + i + 2, auth_end))) } else { (host_start + i + 1, None) }
            }
            None => return Err("Alamat IPv6 tidak valid."),
        }
    } else if let Some(i) = hp.rfind(':') {
        (host_start + i, Some((host_start + i + 1, auth_end)))
    } else {
        (auth_end, None)
    };
    Ok(P { scheme, userinfo, host: (host_start, host_end), port, path: (auth_end, s.len()) })
}

fn add(s: &str, out: &mut Vec<Finding>, id: &str, weight: u32, r: R, why: &str) {
    out.push(Finding {
        rule_id: id.into(), tactic: TACTIC.into(), weight,
        start: s[..r.0].encode_utf16().count(), end: s[..r.1].encode_utf16().count(),
        snippet: s[r.0..r.1].to_string(), why: why.into(),
    });
}

fn tokens(s: &str, base: usize) -> Vec<(R, String)> {
    let mut out = Vec::new();
    let mut st: Option<usize> = None;
    for (i, c) in s.char_indices() {
        if c.is_alphanumeric() {
            if st.is_none() { st = Some(i); }
        } else if let Some(b) = st.take() {
            out.push(((base + b, base + i), s[b..i].to_lowercase()));
        }
    }
    if let Some(b) = st { out.push(((base + b, base + s.len()), s[b..].to_lowercase())); }
    out
}

/// Apakah host berupa alamat IP? Some(true) bila ditulis dengan cara yang disamarkan (heksadesimal, oktal, satu angka panjang).
fn ip_kind(host: &str, labels: &[&str]) -> Option<bool> {
    if host.starts_with('[') { return Some(false); }
    let num = |l: &str| !l.is_empty() && l.chars().all(|c| c.is_ascii_digit());
    let hex = |l: &str| l.len() > 2 && (l.starts_with("0x") || l.starts_with("0X")) && l[2..].chars().all(|c| c.is_ascii_hexdigit());
    if labels.is_empty() || labels.len() > 4 || !labels.iter().all(|l| num(l) || hex(l)) { return None; }
    let any_hex = labels.iter().any(|l| hex(l));
    match labels.len() {
        4 => {
            let plain = labels.iter().all(|l| num(l) && l.parse::<u8>().is_ok() && !(l.len() > 1 && l.starts_with('0')));
            Some(!plain)
        }
        1 if hex(labels[0]) || (num(labels[0]) && labels[0].len() >= 8) => Some(true),
        2 | 3 if any_hex => Some(true),
        _ => None,
    }
}

pub fn analyze_link(raw: &str, brands: &[String]) -> LinkAnalysis {
    let (s, extracted, extra) = match prepare(raw) { Ok(x) => x, Err(e) => return fail(raw.trim(), e) };
    let p = match parse(&s) { Ok(p) => p, Err(e) => return fail(&s, e) };
    let host = &s[p.host.0..p.host.1];
    if host.is_empty() { return fail(&s, "Tautan tidak memiliki nama domain."); }

    let encoded = host.contains('%');
    let host_labels: Vec<&str> = host.split('.').collect();
    let ip = if encoded { None } else { ip_kind(host, &host_labels) };
    let skip_domain = encoded || ip.is_some();
    if !skip_domain {
        if host.chars().all(|c| c.is_ascii_digit() || c == '.') { return fail(&s, "Alamat tidak valid."); }
        if !host.contains('.') { return fail(&s, "Ini tampaknya bukan alamat situs karena tidak ada titik, misalnya contoh.com."); }
        if host.starts_with('.') || host.ends_with('.') || host.contains("..") { return fail(&s, "Nama domain tidak valid."); }
        if !host.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '.') { return fail(&s, "Nama domain mengandung karakter yang tidak valid."); }
        let tld = host.rsplit('.').next().unwrap_or("");
        if tld.chars().count() < 2 || !tld.chars().all(|c| c.is_alphabetic()) { return fail(&s, "Bagian akhir domain tidak valid."); }
    }

    // Bagian-bagian domain. Domain utama diperkirakan dengan daftar akhiran sederhana dan daftar platform hosting.
    let mut labels: Vec<R> = Vec::new();
    let mut st = p.host.0;
    for (i, c) in host.char_indices() {
        if c == '.' { labels.push((st, p.host.0 + i)); st = p.host.0 + i + 1; }
    }
    labels.push((st, p.host.1));
    let lower = |r: R| s[r.0..r.1].to_lowercase();
    let n = labels.len();
    let hl = host.to_lowercase();
    let hosting = if skip_domain { None } else { HOSTING.iter().find(|h| hl.ends_with(&format!(".{h}"))) };
    let suffix_len = if let Some(h) = hosting { h.split('.').count() }
        else if n >= 2 && SECOND_LEVEL.contains(&format!("{}.{}", lower(labels[n - 2]), lower(labels[n - 1])).as_str()) { 2 } else { 1 };
    let reg_idx = n.saturating_sub(suffix_len + 1);
    let registrable: R = if skip_domain { p.host } else { (labels[reg_idx].0, p.host.1) };
    let subdomain: Option<R> = if !skip_domain && reg_idx > 0 { Some((p.host.0, labels[reg_idx].0 - 1)) } else { None };

    let mut out: Vec<Finding> = Vec::new();
    let pp = &s[p.path.0..p.path.1];

    if let Some(sc) = p.scheme {
        if s[sc.0..sc.1].eq_ignore_ascii_case("http") {
            add(&s, &mut out, "L01", 1, sc, "Tautan memakai http tanpa enkripsi. Situs resmi umumnya memakai https. Perlu diingat, https sendiri bukan jaminan situs itu aman.");
        }
    }
    if let Some(u) = p.userinfo {
        add(&s, &mut out, "L02", 5, u, "Bagian sebelum tanda @ hanya hiasan. Tujuan sebenarnya adalah alamat setelah @, jadi tautan bisa tampak resmi padahal membuka situs lain.");
    }
    if let Some(pt) = p.port {
        let t = &s[pt.0..pt.1];
        if !t.is_empty() && t != "80" && t != "443" {
            add(&s, &mut out, "L13", 2, pt, "Tautan memakai nomor port yang tidak lazim untuk situs biasa.");
        }
    }
    {
        let cut = pp.find(|c| c == '?' || c == '#').unwrap_or(pp.len());
        let pathonly = &pp[..cut];
        if let Some(dot) = pathonly.rfind('.') {
            if BAD_EXT.contains(&pathonly[dot + 1..].to_lowercase().as_str()) {
                let seg = pathonly.rfind('/').map(|i| i + 1).unwrap_or(0);
                add(&s, &mut out, "L12", 4, (p.path.0 + seg, p.path.0 + cut), "Tautan mengarah ke file yang bisa dijalankan, seperti aplikasi APK. File seperti ini sebaiknya hanya dipasang dari toko aplikasi resmi.");
            }
        }
        let lowpp = pp.to_lowercase();
        if lowpp.contains("=http") || lowpp.contains("=%68ttp") || lowpp.contains("%3a%2f%2f") {
            add(&s, &mut out, "L14", 2, p.path, "Tautan membawa alamat lain di dalamnya dan bisa mengarahkan ulang ke situs yang berbeda.");
        }
        // Parameter yang tampak seperti kata sandi, PIN, atau OTP.
        if let Some(qi) = pp.find('?') {
            let qend = pp[qi..].find('#').map(|x| qi + x).unwrap_or(pp.len());
            let mut off = qi + 1;
            for seg in pp[qi + 1..qend].split('&') {
                let key = seg.split('=').next().unwrap_or("").to_lowercase();
                if seg.contains('=') && CRED_KEYS.contains(&key.as_str()) {
                    add(&s, &mut out, "L18", 3, (p.path.0 + off, p.path.0 + off + seg.len()), "Tautan membawa parameter yang tampak seperti kata sandi, PIN, atau OTP. Situs sah tidak meminta data rahasia lewat tautan.");
                    break;
                }
                off += seg.len() + 1;
            }
        }
    }
    if s.chars().count() > 150 {
        add(&s, &mut out, "L15", 1, (0, s.len()), "Tautan sangat panjang. Bagian ujung yang panjang sering dipakai untuk menyembunyikan tujuan.");
    }
    if encoded {
        add(&s, &mut out, "L19", 3, p.host, "Nama domain memakai karakter terenkode (tanda %) yang menyamarkan alamat sebenarnya.");
    }

    if let Some(obf) = ip {
        add(&s, &mut out, "L03", 4, p.host, "Tautan memakai alamat IP, bukan nama domain. Situs resmi hampir selalu memakai nama domain.");
        if obf { add(&s, &mut out, "L20", 3, p.host, "Alamat IP ditulis dengan cara yang disamarkan (heksadesimal, oktal, atau satu angka panjang) untuk menyembunyikan tujuan."); }
    } else if !encoded {
        if SHORTENERS.iter().any(|d| hl == *d || hl.ends_with(&format!(".{d}"))) {
            add(&s, &mut out, "L04", 2, p.host, "Tautan dipendekkan sehingga tujuan sebenarnya tidak terlihat. Kami tidak bisa membukanya untuk melihat tujuannya.");
        }
        let last = labels[n - 1];
        if CHEAP_TLDS.contains(&lower(last).as_str()) {
            add(&s, &mut out, "L05", 2, last, "Akhiran domain ini murah dan sering dipakai situs tiruan, tetapi banyak situs sah juga memakainya.");
        }
        if hosting.is_some() {
            add(&s, &mut out, "L16", 2, (labels[n - suffix_len].0, p.host.1), "Situs ini dipasang di platform hosting gratis tempat siapa saja bisa membuat alamat bebas. Banyak situs sah memakainya, tetapi situs tiruan juga sering begitu.");
            let rl = labels[reg_idx];
            if tokens(&s[rl.0..rl.1], rl.0).iter().any(|(_, t)| brands.iter().any(|b| b == t || domain::fold(t) == *b)) {
                add(&s, &mut out, "L17", 4, rl, "Nama merek dipakai sebagai nama situs di platform hosting gratis. Pemilik merek asli hampir selalu memakai domainnya sendiri.");
            }
        }
        if let Some(sd) = subdomain {
            if s[sd.0..sd.1].split('.').count() >= 3 {
                add(&s, &mut out, "L06", 2, sd, "Banyak lapisan subdomain dipakai untuk menyembunyikan domain utama yang sebenarnya.");
            }
            if tokens(&s[sd.0..sd.1], sd.0).iter().any(|(_, t)| brands.iter().any(|b| b == t || domain::fold(t) == *b)) {
                add(&s, &mut out, "L08", 4, sd, "Nama merek muncul sebagai subdomain, sedangkan domain utamanya milik pihak lain. Yang menentukan pemilik situs adalah domain utamanya.");
            }
        }
        let reg_text = &s[registrable.0..registrable.1];
        let first_label = reg_text.split('.').next().unwrap_or("");
        if first_label.matches('-').count() >= 3 || first_label.chars().filter(|c| c.is_ascii_digit()).count() >= 4 {
            add(&s, &mut out, "L07", 2, registrable, "Domain utama berisi banyak tanda hubung atau angka, pola yang sering muncul pada situs tiruan.");
        }
        {
            // Nama domain bernuansa judi online ("gacor88", "maxasia777", "promo-slot").
            let raw = first_label.to_lowercase();
            let folded = domain::fold(first_label);
            let toks: Vec<&str> = raw.split(|c: char| !c.is_alphanumeric()).filter(|t| !t.is_empty()).collect();
            let word = GAMBLE.iter().any(|g| raw.contains(g) || folded.contains(g))
                || (raw.contains("slot") && raw.chars().any(|c| c.is_ascii_digit()))
                || toks.iter().any(|t| GAMBLE_TOKEN.contains(t));
            let weak = toks.len() > 1 && toks.iter().any(|t| GAMBLE_WEAK.contains(t));
            let digits_tail = raw.chars().filter(|c| c.is_alphabetic()).count() >= 3 && GAMBLE_NUM.iter().any(|d| raw.ends_with(d));
            if word {
                add(&s, &mut out, "L22", 4, registrable, "Nama domain memuat istilah khas situs judi online. Judi online ilegal di Indonesia dan situs seperti ini sering menjebak korban agar terus menyetor.");
            } else if digits_tail {
                add(&s, &mut out, "L23", 2, registrable, "Nama domain berakhiran angka yang lazim dipakai situs judi online, misalnya 777 atau 88. Pola ini tidak selalu berbahaya, tetapi perlu dicek.");
            } else if weak {
                add(&s, &mut out, "L24", 2, registrable, "Nama domain memuat singkatan khas situs judi online, seperti depo, wd, atau jp. Pola ini tidak selalu berbahaya, tetapi perlu dicek.");
            }
        }
            if labels.iter().any(|l| lower(*l).starts_with("xn--")) {
            add(&s, &mut out, "L25", 3, p.host, "Nama domain memakai punycode (xn--) yang bisa menyamarkan huruf mirip sebagai nama resmi.");
        }
        if let Some((r, _)) = tokens(host, p.host.0).into_iter().find(|(_, t)| BAIT.contains(&t.as_str())) {
            add(&s, &mut out, "L10", 2, r, "Nama domain memuat kata pancingan seperti login atau verifikasi. Situs resmi biasanya tidak menaruhnya di nama domain.");
        }
        if USER_CONTENT.iter().any(|d| hl == *d || hl.ends_with(&format!(".{d}"))) || (hl == "docs.google.com" && pp.starts_with("/forms")) {
            add(&s, &mut out, "L21", 1, p.host, "Platform ini memungkinkan siapa saja menerbitkan halaman atau formulir. Isinya belum tentu dari pihak yang disebut dalam pesan.");
        }
        out.extend(domain::check(&s, brands));
    }

    // Jalur URL: hanya dihitung bila sudah ada tanda lain, supaya halaman login situs resmi tidak ikut ditandai.
    let reg_tokens: BTreeSet<String> = tokens(&s[registrable.0..registrable.1], 0).into_iter().map(|(_, t)| t).collect();
    let ptoks = tokens(pp, p.path.0);
    if let Some((r, _)) = ptoks.iter().find(|(_, t)| brands.contains(t) && !reg_tokens.contains(t)) {
        add(&s, &mut out, "L09", 2, *r, "Nama merek muncul di jalur tautan, bukan di nama domain. Jalur bisa diisi siapa saja.");
    }
    if !out.is_empty() {
        if let Some((r, _)) = ptoks.iter().find(|(_, t)| BAIT.contains(&t.as_str())) {
            add(&s, &mut out, "L11", 1, *r, "Jalur tautan memuat kata pancingan seperti login atau verifikasi.");
        }
    }

    let mut score: u32 = out.iter().map(|f| f.weight).sum();
    let mut combos = Vec::new();
    if out.len() >= 3 {
        score += 2;
        combos.push("Beberapa tanda muncul bersamaan".to_string());
    }
    if out.iter().any(|f| f.weight >= 5) { score = score.max(4); }
    let level = match score { 0 => "tidak_ditemukan", 1..=3 => "ringan", 4..=7 => "sedang", _ => "tinggi" };
    let tactics: Vec<String> = out.iter().map(|f| f.tactic.clone()).collect::<BTreeSet<_>>().into_iter().collect();

    let parts = Parts {
        scheme: p.scheme.map(|r| s[r.0..r.1].to_lowercase()),
        userinfo: p.userinfo.map(|r| s[r.0..r.1].to_string()),
        host: host.to_string(),
        subdomain: subdomain.map(|r| s[r.0..r.1].to_string()).unwrap_or_default(),
        registrable: s[registrable.0..registrable.1].to_string(),
        port: p.port.map(|r| s[r.0..r.1].to_string()).filter(|x| !x.is_empty()),
        path: s[p.path.0..p.path.1].to_string(),
    };
    LinkAnalysis { error: None, input: s.clone(), note: extracted.then(|| "EXTRACTED".to_string()), extra_links: extra, score, level, findings: out, combos, tactics, disclaimer: DISCLAIMER, parts: Some(parts) }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn run(u: &str) -> LinkAnalysis { analyze_link(u, &crate::engine().brands) }
    fn has(a: &LinkAnalysis, id: &str) -> bool { a.findings.iter().any(|f| f.rule_id == id) }

    #[test]
    fn situs_resmi_bersih_dan_bagian_dibaca_benar() {
        let a = run("https://www.bca.co.id/login");
        assert!(a.error.is_none() && a.findings.is_empty());
        assert_eq!(a.level, "tidak_ditemukan");
        let p = a.parts.unwrap();
        assert_eq!((p.registrable.as_str(), p.subdomain.as_str()), ("bca.co.id", "www"));
    }
    #[test]
    fn domain_tiruan_tanpa_skema_jadi_tinggi() { assert_eq!(run("bca-verifikasi.xyz/login").level, "tinggi"); }
    #[test]
    fn tanda_at_dan_posisi_sorotan() {
        let a = run("https://bca.co.id@evil.xyz/");
        let f = a.findings.iter().find(|f| f.rule_id == "L02").unwrap();
        assert_eq!((f.start, f.end), (8, 17));
        assert!(a.score >= 4);
        assert_eq!(a.parts.unwrap().userinfo.as_deref(), Some("bca.co.id"));
    }
    #[test]
    fn alamat_ip() { assert!(has(&run("http://192.168.1.10/login"), "L03")); }
    #[test]
    fn merek_di_subdomain() { assert!(has(&run("https://bca.co.id.verifikasi-akun.xyz"), "L08")); }
    #[test]
    fn pemendek_tautan() { assert!(has(&run("https://bit.ly/abc123"), "L04")); }
    #[test]
    fn file_apk() { assert!(has(&run("https://toko.example/files/resi.apk"), "L12")); }
    #[test]
    fn port_dan_http() { let a = run("http://situs.example:8080/"); assert!(has(&a, "L13") && has(&a, "L01")); }
    #[test]
    fn angka_pengganti_huruf_di_domain() { assert!(has(&run("https://tokopedi4.com"), "D01")); }
    #[test]
    fn masukan_tidak_valid_ditolak() {
        for bad in ["", "javascript:alert(1)", "https://contoh .com", "bca", "Rp50.000", "halo apa kabar"] {
            assert!(run(bad).error.is_some(), "harus ditolak: {bad}");
        }
    }
    #[test]
    fn spasi_dan_pembungkus_dibuang() {
        assert_eq!(run("   https://www.bca.co.id/   ").input, "https://www.bca.co.id/");
        assert_eq!(run("<https://www.bca.co.id/>").input, "https://www.bca.co.id/");
        assert_eq!(run("(https://www.bca.co.id/login).").input, "https://www.bca.co.id/login");
    }
    #[test]
    fn tautan_diambil_dari_teks() {
        let a = run("Klik https://bca-verifikasi.xyz/login sekarang ya, atau https://bit.ly/xx");
        assert!(a.error.is_none());
        assert_eq!(a.input, "https://bca-verifikasi.xyz/login");
        assert_eq!(a.note.as_deref(), Some("EXTRACTED"));
        assert_eq!(a.extra_links, 1);
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn garis_miring_terbalik_diperbaiki() {
        let a = run("https:\\\\www.bca.co.id\\login");
        assert!(a.error.is_none());
        assert_eq!(a.parts.unwrap().registrable, "bca.co.id");
    }
    #[test]
    fn platform_hosting_gratis() {
        let a = run("https://bca-verifikasi.vercel.app/login");
        assert!(has(&a, "L16") && has(&a, "L17"));
        assert_eq!(a.parts.as_ref().unwrap().registrable, "bca-verifikasi.vercel.app");
        assert_eq!(a.level, "tinggi");
        let b = run("https://my-portfolio.vercel.app/");
        assert!(has(&b, "L16") && !has(&b, "L17"));
        assert_eq!(b.level, "ringan");
    }
    #[test]
    fn ip_yang_disamarkan() {
        let a = run("http://0x7f.0.0.1/login");
        assert!(has(&a, "L03") && has(&a, "L20"));
        assert!(has(&run("http://3232235777/"), "L20"));
        assert!(!has(&run("http://192.168.1.10/"), "L20"));
    }
    #[test]
    fn host_terenkode() {
        let a = run("https://bca%2eco%2eid.evil.xyz/");
        assert!(a.error.is_none() && has(&a, "L19"));
    }
    #[test]
    fn parameter_kredensial() {
        assert!(has(&run("https://situs.example/login?user=a&password=123"), "L18"));
        assert!(!has(&run("https://situs.example/reset?token=abc"), "L18"));
    }
    #[test]
    fn platform_konten_pengguna() {
        assert!(has(&run("https://forms.gle/abc"), "L21"));
        assert!(has(&run("https://docs.google.com/forms/d/x"), "L21"));
        assert!(!has(&run("https://docs.google.com/document/d/x"), "L21"));
    }
    #[test]
    fn domain_judi_dan_pemendek_baru() {
        assert!(has(&run("https://slot-gacor88.xyz/"), "L22"));
        assert!(has(&run("https://maxasia777.org/ModalMinimal"), "L23"));
        assert!(has(&run("https://ln.run/dZ5wW?fBqc"), "L04"));
        assert!(!has(&run("https://www.bca.co.id/"), "L22"));
    }
    #[test]
    fn akhiran_dua_tingkat_luar_negeri() {
        assert_eq!(run("https://www.bbc.co.uk/news").parts.unwrap().registrable, "bbc.co.uk");
    }

    #[test]
    fn token_judi_dan_punycode() {
        assert!(has(&run("https://promo-slot.invalid/"), "L22"));
        assert!(has(&run("https://depo-minimal.invalid/"), "L24"));
        assert!(has(&run("https://xn--bca-9ua.com/"), "L25"));
        assert!(!has(&run("https://www.bca.co.id/"), "L24"));
    }
}