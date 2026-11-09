//! Mesin aturan JEDA: aturan di rules.json, logika penilaian di sini.
//! Semua berjalan di browser (WASM), teks pengguna tidak dikirim ke server.
//!
//! Isi file ini: pemuatan rules.json, penilaian pesan (analyze_text), dan dua fungsi yang diekspor ke
//! JavaScript: analyze(text) dan analyze_link(url). Keduanya mengembalikan string JSON.
//! Alur pesan: norm.rs membersihkan teks, aturan dicocokkan, domain.rs memeriksa tiruan merek, lalu skor dan tingkat dihitung.
//! Catatan: rules.json ikut terkompilasi ke WASM, jadi setelah mengubahnya jalankan `npm run build:wasm` (di web/).
//! Bentuk JSON harus tetap cocok dengan tipe di web/src/engine.ts. Tambahkan uji untuk setiap aturan baru.
mod domain;
mod link;
mod norm;

use regex::{Regex, RegexBuilder};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use std::sync::OnceLock;
use wasm_bindgen::prelude::*;

const RULES_JSON: &str = include_str!("../rules.json");
const MAX_CHARS: usize = 10_000;
const DISCLAIMER: &str = "Hasil ini berbasis pola kata dan bukan jaminan. Tetap verifikasi lewat kanal resmi.";

#[derive(Deserialize)]
struct RuleDef {
    id: String,
    tactic: String,
    weight: u32,
    why: String,
    any_of: Vec<String>,
    #[serde(default)]
    also_requires: Vec<String>,
    /// Pola penyangkalan di depan temuan, misalnya "jangan berikan kode OTP". Temuan seperti itu diabaikan.
    #[serde(default)]
    unless: Vec<String>,
    /// Pola penyangkalan setelah temuan, misalnya "pihak bank tidak pernah meminta".
    #[serde(default)]
    unless_after: Vec<String>,
    /// Pola untuk teks "dirapatkan" (tanpa spasi dan tanda baca) supaya kata yang sengaja dipecah,
    /// misalnya "KEME NAN GAN", tetap terbaca. Dipakai hanya bila pola biasa tidak menemukan apa pun.
    #[serde(default)]
    squeeze: Vec<String>,
}
#[derive(Deserialize)]
struct ComboDef {
    name: String,
    needs: Vec<Vec<String>>,
    bonus: u32,
}
#[derive(Deserialize)]
struct RuleSet {
    rules: Vec<RuleDef>,
    combos: Vec<ComboDef>,
    #[serde(default)]
    brands: Vec<String>,
}
struct Compiled {
    def: RuleDef,
    any: Vec<Regex>,
    also: Vec<Regex>,
    unless: Vec<Regex>,
    unless_after: Vec<Regex>,
    sq: Vec<Regex>,
}
struct Engine {
    rules: Vec<Compiled>,
    combos: Vec<ComboDef>,
    brands: Vec<String>,
}

fn build(p: &str) -> Regex {
    RegexBuilder::new(p)
        .case_insensitive(true)
        .build()
        .unwrap_or_else(|e| panic!("pola tidak valid '{p}': {e}"))
}

fn engine() -> &'static Engine {
    static E: OnceLock<Engine> = OnceLock::new();
    E.get_or_init(|| {
        let set: RuleSet = serde_json::from_str(RULES_JSON.trim_start_matches('\u{feff}')).unwrap_or_else(|e| panic!("rules.json tidak valid: {e}"));
        let rules = set
            .rules
            .into_iter()
            .map(|def| {
                let any: Vec<Regex> = def.any_of.iter().map(|p| build(p)).collect();
                let also: Vec<Regex> = def.also_requires.iter().map(|p| build(p)).collect();
                let unless: Vec<Regex> = def.unless.iter().map(|p| build(p)).collect();
                let unless_after: Vec<Regex> = def.unless_after.iter().map(|p| build(p)).collect();
                let sq: Vec<Regex> = def.squeeze.iter().map(|p| build(p)).collect();
                Compiled { def, any, also, unless, unless_after, sq }
            })
            .collect();
        Engine { rules, combos: set.combos, brands: set.brands }
    })
}

/// Apakah temuan ini sebenarnya kalimat penyangkalan (imbauan keamanan, bukan permintaan)?
fn negated(r: &Compiled, text: &str, s: usize, e: usize) -> bool {
    if r.unless.is_empty() && r.unless_after.is_empty() {
        return false;
    }
    let pre = &text[..s];
    let pre = &pre[pre.char_indices().rev().nth(79).map(|(i, _)| i).unwrap_or(0)..];
    let post = &text[e..];
    let post = &post[..post.char_indices().nth(60).map(|(i, _)| i).unwrap_or(post.len())];
    r.unless.iter().any(|re| re.is_match(pre)) || r.unless_after.iter().any(|re| re.is_match(post))
}

#[derive(Serialize, Clone)]
pub struct Finding {
    pub rule_id: String,
    pub tactic: String,
    pub weight: u32,
    /// Posisi dalam satuan UTF-16 agar cocok dengan String.slice di JavaScript.
    pub start: usize,
    pub end: usize,
    pub snippet: String,
    pub why: String,
}

#[derive(Serialize)]
pub struct Analysis {
    pub score: u32,
    pub level: &'static str,
    pub findings: Vec<Finding>,
    pub combos: Vec<String>,
    pub tactics: Vec<String>,
    pub disclaimer: &'static str,
}

pub fn analyze_text(input: &str) -> Analysis {
    let text: String = input.chars().take(MAX_CHARS).collect();
    let eng = engine();
    let units: Vec<u16> = text.encode_utf16().collect();
    let norm = norm::normalize(&text);
    let sqz = norm::squeeze(&norm);
    let mut findings = Vec::new();

    for r in &eng.rules {
        if !r.also.is_empty() && !r.also.iter().any(|re| re.is_match(&norm.text)) {
            continue;
        }
        // Satu aturan dihitung sekali per teks (tidak ada double count).
        let first = r
            .any
            .iter()
            .flat_map(|re| re.find_iter(&norm.text))
            .filter(|m| !negated(r, &norm.text, m.start(), m.end()))
            .min_by_key(|m| m.start());
        // Bila pola biasa tidak menemukan apa pun, coba teks rapat untuk kata yang dipecah-pecah.
        let hit = match first {
            Some(m) => Some((&norm, m.start(), m.end())),
            None => r
                .sq
                .iter()
                .flat_map(|re| re.find_iter(&sqz.text))
                .min_by_key(|m| m.start())
                .map(|m| (&sqz, m.start(), m.end())),
        };
        if let Some((n, ms, me)) = hit {
            let si = n.starts.partition_point(|&b| b < ms);
            let ei = n.starts.partition_point(|&b| b < me);
            if si >= ei {
                continue;
            }
            // Petakan kembali ke posisi di teks asli supaya sorotan tepat.
            let (start, end) = (n.spans[si].0, n.spans[ei - 1].1);
            findings.push(Finding {
                rule_id: r.def.id.clone(),
                tactic: r.def.tactic.clone(),
                weight: r.def.weight,
                start,
                end,
                snippet: String::from_utf16_lossy(&units[start..end]),
                why: r.def.why.clone(),
            });
        }
    }
    findings.extend(domain::check(&text, &eng.brands));

    let mut score: u32 = findings.iter().map(|f| f.weight).sum();
    let hit = |k: &str| findings.iter().any(|f| f.rule_id == k || f.tactic == k);

    let mut combos = Vec::new();
    for c in &eng.combos {
        if c.needs.iter().all(|group| group.iter().any(|k| hit(k))) {
            score += c.bonus;
            combos.push(c.name.clone());
        }
    }

    let tactics: Vec<String> = findings
        .iter()
        .map(|f| f.tactic.as_str())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .map(String::from)
        .collect();
    if tactics.len() >= 3 {
        score += 2;
    }
    // Satu tanda berbobot 5 (OTP, PIN, ancaman sebar data) sudah cukup berbahaya.
    if findings.iter().any(|f| f.weight >= 5) {
        score = score.max(4);
    }

    let level = match score {
        0 => "tidak_ditemukan",
        1..=3 => "ringan",
        4..=7 => "sedang",
        _ => "tinggi",
    };
    Analysis { score, level, findings, combos, tactics, disclaimer: DISCLAIMER }
}

#[wasm_bindgen]
pub fn analyze(text: &str) -> String {
    serde_json::to_string(&analyze_text(text)).unwrap_or_else(|_| "{}".into())
}

#[wasm_bindgen]
pub fn analyze_link(url: &str) -> String {
    serde_json::to_string(&link::analyze_link(url, &engine().brands)).unwrap_or_else(|_| "{}".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pesan_biasa_tidak_memicu_aturan() {
        assert_eq!(analyze_text("Halo, besok kuliah jam 8 ya").score, 0);
    }
    #[test]
    fn otp_dan_urgensi_jadi_tinggi() {
        let a = analyze_text("Segera kirim kode OTP Anda sekarang juga");
        assert_eq!(a.level, "tinggi");
        assert!(a.combos.iter().any(|c| c.contains("OTP")));
    }
    #[test]
    fn posisi_utf16_benar_dengan_emoji() {
        let a = analyze_text("🎉 Selamat anda terpilih");
        assert_eq!(a.findings[0].start, 3);
    }
    #[test]
    fn loker_palsu_terdeteksi() {
        let a = analyze_text("Lowongan kerja dari HP tanpa pengalaman, transfer dulu biaya administrasi Rp50.000");
        assert!(a.score >= 8);
    }
    #[test]
    fn satu_aturan_dihitung_sekali() {
        let a = analyze_text("segera segera segera");
        assert_eq!(a.findings.len(), 1);
    }

    #[test]
    fn angka_pengganti_huruf_dipulihkan() {
        let a = analyze_text("S3GERA kirim kode 0TP");
        assert!(a.findings.iter().any(|f| f.rule_id == "R01"));
        assert!(a.findings.iter().any(|f| f.rule_id == "R04"));
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn huruf_terpisah_digabung_dan_sorotan_mencakup_aslinya() {
        let a = analyze_text("Tolong kirim kode O T P ya");
        let f = a.findings.iter().find(|f| f.rule_id == "R04").expect("R04 harus terdeteksi");
        assert!(f.snippet.ends_with("O T P"));
    }
    #[test]
    fn posisi_sorotan_tetap_benar_setelah_normalisasi() {
        let a = analyze_text("S3gera ya");
        let f = a.findings.iter().find(|f| f.rule_id == "R01").unwrap();
        assert_eq!((f.start, f.end), (0, 6));
    }
    #[test]
    fn angka_biasa_tidak_diubah() {
        let a = analyze_text("Batas waktu dalam 1x24 jam");
        assert!(a.findings.iter().any(|f| f.rule_id == "R01"));
    }
    #[test]
    fn domain_dengan_angka_pengganti_huruf() {
        let a = analyze_text("Klik https://tokopedi4.com sekarang");
        assert!(a.findings.iter().any(|f| f.rule_id == "D01"));
    }
    #[test]
    fn domain_dengan_huruf_kiril() {
        let a = analyze_text("Buka https://b\u{0441}\u{0430}.co.id untuk verifikasi");
        assert!(a.findings.iter().any(|f| f.rule_id == "D01"));
    }
    #[test]
    fn domain_salah_satu_huruf() {
        let a = analyze_text("Belanja di https://tokopedla.com");
        assert!(a.findings.iter().any(|f| f.rule_id == "D02"));
    }
    #[test]
    fn domain_merek_plus_kata_tambahan() {
        let a = analyze_text("Verifikasi di https://bca-verifikasi.com");
        assert!(a.findings.iter().any(|f| f.rule_id == "D03"));
    }
    #[test]
    fn domain_resmi_tidak_ditandai() {
        let a = analyze_text("Info resmi ada di https://www.bca.co.id dan https://www.bankmandiri.co.id");
        assert!(a.findings.iter().all(|f| !f.rule_id.starts_with('D')));
    }

    // --- Bahasa Inggris: pastikan aturan E01-E35 benar-benar ikut terbuild ke WASM ---
    #[test]
    fn inggris_aturan_ikut_terbuild() {
        let a = analyze_text("Act now! Send me your OTP code immediately.");
        assert!(a.findings.iter().any(|f| f.rule_id.starts_with('E')), "aturan Inggris tidak aktif: build ulang WASM");
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn inggris_hadiah_dan_biaya() {
        let a = analyze_text("Congratulations! You have been selected as the winner of a $5,000 gift card. Pay a small processing fee to claim your prize.");
        assert!(a.findings.iter().any(|f| f.rule_id == "E13"));
        assert!(a.findings.iter().any(|f| f.rule_id == "E08"));
        assert!(a.score >= 4);
    }
    #[test]
    fn inggris_akun_ditangguhkan_dan_otp() {
        let a = analyze_text("URGENT: Your bank account has been suspended. Verify now and send your one-time password to reactivate.");
        assert_eq!(a.level, "tinggi");
        assert!(a.combos.iter().any(|c| c.contains("OTP")));
    }
    #[test]
    fn inggris_paket_gagal_dengan_biaya() {
        let a = analyze_text("Your package could not be delivered. Please pay a $2.99 fee at http://post-track.example to reschedule delivery.");
        assert!(a.findings.iter().any(|f| f.rule_id == "E24"));
        assert!(a.score >= 4);
    }
    #[test]
    fn inggris_tagihan_tak_terbayar() {
        let a = analyze_text("You have an unpaid toll. Pay immediately to avoid a fine: http://toll-pay.example");
        assert!(a.findings.iter().any(|f| f.rule_id == "E24"));
    }
    #[test]
    fn inggris_pesan_sah_tidak_ditandai() {
        for t in [
            "Hi team, the meeting is moved to 3 pm tomorrow. Please bring your laptop.",
            "Hey, are we still on for lunch tomorrow at noon?",
            "Your OTP is 482913. Do not share this code with anyone.",
            "Never share your OTP with anyone. Our bank will never ask for it.",
        ] {
            assert_eq!(analyze_text(t).score, 0, "salah tandai: {t}");
        }
    }

    // --- Judi online, saldo palsu, dan teks yang sengaja disamarkan ---
    fn ada(a: &Analysis, id: &str) -> bool {
        a.findings.iter().any(|f| f.rule_id == id)
    }
    #[test]
    fn judi_dengan_tanda_sisipan_dan_domain() {
        let a = analyze_text("Cuma mai'n disini yg past'i GACO'R\nModa'l 50k doang udah bisa J'P\nLlNK : maxasia777.org/ModalMinimal");
        assert!(ada(&a, "J01") && ada(&a, "J03") && ada(&a, "J07") && ada(&a, "J13"));
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn judi_jarang_wede_dan_garansi() {
        let a = analyze_text("JARANG WEDE BOSSKU?\nJOIN LANGSUNG LINK DIBAWAH INI\nAK'UN ANDA KITA BANTU JEPE 100%\n1X DEPO DlJAMIN W3'DE BERKALI KALI\nGAR'ANSl KEMENANGAN 100%\ns.id/pELzZ");
        for id in ["J02", "J05", "J06", "J07", "R27"] {
            assert!(ada(&a, id), "harus terdeteksi: {id}");
        }
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn judi_kata_dipecah_dengan_garis_miring_dan_spasi() {
        let a = analyze_text("AKUN GAC/OR JEPE 100%\n1X DE/PO DIJAM/IN WEDE BERKALI-KALI!\nGARANSI KEME NAN GAN 100%\ns.id/ZmBvk");
        assert!(ada(&a, "J01") && ada(&a, "J02") && ada(&a, "J05") && ada(&a, "J07"));
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn judi_wd_jp_dengan_spasi_dan_koma() {
        let a = analyze_text("Situs terbesar di Indo, yang pasti ,W  D, Cepat dan aman https://wde.la/ODN41\nPasti ,J P,");
        assert!(ada(&a, "J03") && ada(&a, "J13"));
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn judi_zeus_pengali_dan_vokal_dibuang() {
        let a = analyze_text("pr'omo akhir bulan telah datang!\nrasakan sensasi z3'u5 x5OO\nj-pe smakin bsar hnya dgn mdl receh\nsiap menang besar skrg ??\ngas dftr & main di : ln.run/iTKtc");
        assert!(ada(&a, "J07") && ada(&a, "J09") && ada(&a, "J10") && ada(&a, "R27"));
        assert_eq!(a.level, "tinggi");
    }
    #[test]
    fn judi_saldo_gratis_dan_chip_otomatis() {
        let a = analyze_text("A,da 5al,d0 25,k l,gi");
        assert!(ada(&a, "J08"));
        assert!(analyze_text("c,hi,p au-t,o m-suk").findings.iter().any(|f| f.rule_id == "J09"));
        let b = analyze_text("KAK AK'U KSH KM SAL'DO 100K UTK M'A1N\nID BARU WAJIB D1KASIH MENANG\nSL'0T P'GSOFT BAGI2 RE'JEKI\nM'AHJONG 5 MENIT W'D 2JT\nD'P&KLA1M: https://ln.run/ploFr");
        assert!(ada(&b, "J05") && ada(&b, "J08") && ada(&b, "J10"));
        assert_eq!(b.level, "tinggi");
    }
    #[test]
    fn judi_huruf_unicode_bergaya() {
        for t in ["\u{ff27}\u{ff21}\u{ff23}\u{ff2f}\u{ff32} hari ini", "\u{1d5ac}\u{1d5a0}\u{1d5b7}\u{1d5b6}\u{1d5a8}\u{1d5ad} hari ini", "\u{0262}\u{1d00}\u{1d04}\u{1d0f}\u{0280} hari ini", "\u{24bc}\u{24d0}\u{24d2}\u{24de}\u{24e1} hari ini"] {
            assert!(ada(&analyze_text(t), "J01"), "huruf bergaya lolos: {t}");
        }
    }
    #[test]
    fn saldo_palsu_dengan_tautan() {
        let a = analyze_text("ID:81377***302  Deposit Anda sebesar 1 juta telah dikreditkan ke akun Anda. Silakan periksa saldo Anda sesegera mungkin. ln.run/W-eKv?X3");
        assert!(ada(&a, "N01") && ada(&a, "N04") && ada(&a, "N05"));
        assert_eq!(a.level, "tinggi");
        let b = analyze_text("5302  Kakak akun Anda 1 ju'ta anda bisa memilih untuk menarik atau melanjutkan.  https://ln.run/dZ5wW?fBqc");
        assert!(ada(&b, "N03"));
        assert_eq!(b.level, "tinggi");
        let c = analyze_text("Rp1.725.000 udah ditransfer ke dompetmu. Verifikasi maksimal 1 jam.\nhttps://ln.run/6f8XV");
        assert!(ada(&c, "N01") && ada(&c, "N02"));
        let d = analyze_text("hallo kak, 081377845302 , segera d ambil ya\nhttps://s.id/prodg1");
        assert!(ada(&d, "N06") && ada(&d, "N07"));
    }
    #[test]
    fn pesan_biasa_dengan_kata_mirip_tidak_ditandai() {
        for t in [
            "Slot praktikum hari Selasa masih tersisa, silakan daftar di portal kampus.",
            "Bu, ini aku Dina. Dana praktikum 50k sudah aku kirim ke ibu bendahara.",
            "Saldo rekening kamu sudah masuk ya, tadi aku transfer Rp150.000 buat patungan.",
            "Rp1.200.000 gaji bulan ini sudah masuk, alhamdulillah. Nanti kita makan-makan.",
            "Don't forget the party tonight, it's at Rina's house. You've got the cake right?",
            "Kode pesananmu 88123. Driver sedang menuju lokasi, jangan bagikan kode ini ke siapa pun.",
        ] {
            assert_eq!(analyze_text(t).score, 0, "salah tandai: {t}");
        }
    }
}