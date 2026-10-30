//! Pemeriksa tautan: hanya membaca bentuk URL (situs tidak dibuka), berbasis aturan yang bisa dijelaskan.
use crate::domain;
use crate::Finding;
use serde::Serialize;
use std::collections::BTreeSet;

const TACTIC: &str = "TAUTAN MENCURIGAKAN";
const DISCLAIMER: &str = "Pemeriksaan ini hanya membaca bentuk tautan. Situsnya tidak dibuka, jadi isi halaman, umur domain, dan reputasinya tidak diperiksa. Hasil bukan jaminan.";
const SECOND_LEVEL: &[&str] = &["co.id", "go.id", "or.id", "ac.id", "sch.id", "web.id", "my.id", "biz.id", "desa.id", "mil.id", "net.id", "ponpes.id", "co.uk", "com.au"];
const CHEAP_TLDS: &[&str] = &["xyz", "top", "click", "icu", "site", "online", "vip", "cc", "buzz", "cfd", "sbs", "monster"];
const SHORTENERS: &[&str] = &["bit.ly", "tinyurl.com", "cutt.ly", "s.id", "t.ly", "is.gd", "rb.gy", "shorturl.at", "ow.ly"];
const BAIT: &[&str] = &["login", "masuk", "verifikasi", "verify", "secure", "akun", "account", "update", "perbarui", "konfirmasi", "klaim", "claim", "hadiah", "bonus", "promo", "undian", "pencairan", "reset"];
const BAD_EXT: &[&str] = &["apk", "exe", "msi", "scr", "bat", "cmd", "vbs", "jar"];

type R = (usize, usize);

#[derive(Serialize)]
pub struct Parts {
    pub scheme: Option<String>,
    pub host: String,
    pub subdomain: String,
    pub registrable: String,
    pub port: Option<String>,
    pub path: String,
}

#[derive(Serialize)]
pub struct LinkAnalysis {
    pub error: Option<String>,
    pub input: String,
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
    LinkAnalysis { error: Some(msg.into()), input: input.into(), score: 0, level: "tidak_ditemukan", findings: vec![], combos: vec![], tactics: vec![], disclaimer: DISCLAIMER, parts: None }
}

fn parse(s: &str) -> Result<P, &'static str> {
    const ONLY_HTTP: &str = "Hanya tautan http dan https yang bisa diperiksa.";
    if s.is_empty() { return Err("Tempel tautan terlebih dahulu."); }
    if s.chars().any(|c| c.is_whitespace()) { return Err("Tautan tidak boleh mengandung spasi. Tempel satu tautan saja."); }
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

fn ip_ok(host: &str) -> bool {
    if host.contains('.') { host.split('.').count() == 4 && host.split('.').all(|x| x.parse::<u8>().is_ok()) } else { host.len() >= 8 }
}

pub fn analyze_link(raw: &str, brands: &[String]) -> LinkAnalysis {
    let s: String = raw.trim().chars().take(2048).collect();
    let p = match parse(&s) { Ok(p) => p, Err(e) => return fail(&s, e) };
    let host = &s[p.host.0..p.host.1];
    if host.is_empty() { return fail(&s, "Tautan tidak memiliki nama domain."); }

    let numeric = host.chars().all(|c| c.is_ascii_digit() || c == '.');
    let is_ip = host.starts_with('[') || (numeric && ip_ok(host));
    if !is_ip {
        if numeric { return fail(&s, "Alamat tidak valid."); }
        if !host.contains('.') { return fail(&s, "Ini tampaknya bukan alamat situs karena tidak ada titik, misalnya contoh.com."); }
        if host.starts_with('.') || host.ends_with('.') || host.contains("..") { return fail(&s, "Nama domain tidak valid."); }
        if !host.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '.') { return fail(&s, "Nama domain mengandung karakter yang tidak valid."); }
        let tld = host.rsplit('.').next().unwrap_or("");
        if tld.chars().count() < 2 || !tld.chars().all(|c| c.is_alphabetic()) { return fail(&s, "Bagian akhir domain tidak valid."); }
    }

    // Bagian-bagian domain. Domain utama diperkirakan dengan daftar akhiran sederhana.
    let mut labels: Vec<R> = Vec::new();
    let mut st = p.host.0;
    for (i, c) in host.char_indices() {
        if c == '.' { labels.push((st, p.host.0 + i)); st = p.host.0 + i + 1; }
    }
    labels.push((st, p.host.1));
    let lower = |r: R| s[r.0..r.1].to_lowercase();
    let n = labels.len();
    let suffix_len = if n >= 2 && SECOND_LEVEL.contains(&format!("{}.{}", lower(labels[n - 2]), lower(labels[n - 1])).as_str()) { 2 } else { 1 };
    let reg_idx = n.saturating_sub(suffix_len + 1);
    let registrable: R = if is_ip { p.host } else { (labels[reg_idx].0, p.host.1) };
    let subdomain: Option<R> = if !is_ip && reg_idx > 0 { Some((p.host.0, labels[reg_idx].0 - 1)) } else { None };

    let mut out: Vec<Finding> = Vec::new();
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
        let pp = &s[p.path.0..p.path.1];
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
    }
    if s.chars().count() > 150 {
        add(&s, &mut out, "L15", 1, (0, s.len()), "Tautan sangat panjang. Bagian ujung yang panjang sering dipakai untuk menyembunyikan tujuan.");
    }

    if is_ip {
        add(&s, &mut out, "L03", 4, p.host, "Tautan memakai alamat IP, bukan nama domain. Situs resmi hampir selalu memakai nama domain.");
    } else {
        let hl = host.to_lowercase();
        if SHORTENERS.iter().any(|d| hl == *d || hl.ends_with(&format!(".{d}"))) {
            add(&s, &mut out, "L04", 2, p.host, "Tautan dipendekkan sehingga tujuan sebenarnya tidak terlihat. Kami tidak bisa membukanya untuk melihat tujuannya.");
        }
        let last = labels[n - 1];
        if CHEAP_TLDS.contains(&lower(last).as_str()) {
            add(&s, &mut out, "L05", 2, last, "Akhiran domain ini murah dan sering dipakai situs tiruan, tetapi banyak situs sah juga memakainya.");
        }
        if let Some(sd) = subdomain {
            if s[sd.0..sd.1].split('.').count() >= 3 {
                add(&s, &mut out, "L06", 2, sd, "Banyak lapisan subdomain dipakai untuk menyembunyikan domain utama yang sebenarnya.");
            }
            if let Some(b) = tokens(&s[sd.0..sd.1], sd.0).iter().find_map(|(_, t)| brands.iter().find(|b| *b == t || domain::fold(t) == **b)) {
                let _ = b;
                add(&s, &mut out, "L08", 4, sd, "Nama merek muncul sebagai subdomain, sedangkan domain utamanya milik pihak lain. Yang menentukan pemilik situs adalah domain utamanya.");
            }
        }
        let reg_text = &s[registrable.0..registrable.1];
        let first_label = reg_text.split('.').next().unwrap_or("");
        if first_label.matches('-').count() >= 3 || first_label.chars().filter(|c| c.is_ascii_digit()).count() >= 4 {
            add(&s, &mut out, "L07", 2, registrable, "Domain utama berisi banyak tanda hubung atau angka, pola yang sering muncul pada situs tiruan.");
        }
        if let Some((r, _)) = tokens(host, p.host.0).into_iter().find(|(_, t)| BAIT.contains(&t.as_str())) {
            add(&s, &mut out, "L10", 2, r, "Nama domain memuat kata pancingan seperti login atau verifikasi. Situs resmi biasanya tidak menaruhnya di nama domain.");
        }
        out.extend(domain::check(&s, brands));
    }

    // Jalur URL: hanya dihitung bila sudah ada tanda lain, supaya halaman login situs resmi tidak ikut ditandai.
    let path_text = &s[p.path.0..p.path.1];
    let reg_tokens: BTreeSet<String> = tokens(&s[registrable.0..registrable.1], 0).into_iter().map(|(_, t)| t).collect();
    let ptoks = tokens(path_text, p.path.0);
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
        host: host.to_string(),
        subdomain: subdomain.map(|r| s[r.0..r.1].to_string()).unwrap_or_default(),
        registrable: s[registrable.0..registrable.1].to_string(),
        port: p.port.map(|r| s[r.0..r.1].to_string()).filter(|x| !x.is_empty()),
        path: s[p.path.0..p.path.1].to_string(),
    };
    LinkAnalysis { error: None, input: s.clone(), score, level, findings: out, combos, tactics, disclaimer: DISCLAIMER, parts: Some(parts) }
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
    fn domain_tiruan_tanpa_skema_jadi_tinggi() {
        assert_eq!(run("bca-verifikasi.xyz/login").level, "tinggi");
    }
    #[test]
    fn tanda_at_dan_posisi_sorotan() {
        let a = run("https://bca.co.id@evil.xyz/");
        let f = a.findings.iter().find(|f| f.rule_id == "L02").unwrap();
        assert_eq!((f.start, f.end), (8, 17));
        assert!(a.score >= 4);
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
    fn port_dan_http() {
        let a = run("http://situs.example:8080/");
        assert!(has(&a, "L13") && has(&a, "L01"));
    }
    #[test]
    fn angka_pengganti_huruf_di_domain() { assert!(has(&run("https://tokopedi4.com"), "D01")); }
    #[test]
    fn masukan_tidak_valid_ditolak() {
        for bad in ["", "javascript:alert(1)", "https://contoh .com", "bca", "Rp50.000"] {
            assert!(run(bad).error.is_some(), "harus ditolak: {bad}");
        }
    }
    #[test]
    fn spasi_di_pinggir_dibuang() {
        let a = run("   https://www.bca.co.id/   ");
        assert_eq!(a.input, "https://www.bca.co.id/");
    }
}