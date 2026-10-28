//! Mesin aturan JEDA: aturan di rules.json, logika penilaian di sini.
//! Semua berjalan di browser (WASM), teks pengguna tidak dikirim ke server.
mod domain;
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
        let set: RuleSet = serde_json::from_str(RULES_JSON).expect("rules.json tidak valid");
        let rules = set
            .rules
            .into_iter()
            .map(|def| {
                let any: Vec<Regex> = def.any_of.iter().map(|p| build(p)).collect();
                let also: Vec<Regex> = def.also_requires.iter().map(|p| build(p)).collect();
                Compiled { def, any, also }
            })
            .collect();
        Engine { rules, combos: set.combos, brands: set.brands }
    })
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
    let mut findings = Vec::new();

    for r in &eng.rules {
        if !r.also.is_empty() && !r.also.iter().any(|re| re.is_match(&norm.text)) {
            continue;
        }
        // Satu aturan dihitung sekali per teks (tidak ada double count).
        let first = r.any.iter().filter_map(|re| re.find(&norm.text)).min_by_key(|m| m.start());
        if let Some(m) = first {
            let si = norm.starts.partition_point(|&b| b < m.start());
            let ei = norm.starts.partition_point(|&b| b < m.end());
            if si >= ei {
                continue;
            }
            // Petakan kembali ke posisi di teks asli supaya sorotan tepat.
            let (start, end) = (norm.spans[si].0, norm.spans[ei - 1].1);
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
}