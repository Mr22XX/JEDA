//! Pemeriksaan domain yang meniru merek. Berbasis aturan sederhana dan bisa dijelaskan.
use crate::norm::{homoglyph, leet};
use crate::Finding;
use regex::Regex;
use std::sync::OnceLock;

const TACTIC: &str = "TAUTAN MENCURIGAKAN";

fn host_re() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    R.get_or_init(|| Regex::new(r"(?i)(?:https?://)?((?:[\p{L}\p{N}-]+\.)+\p{L}{2,})").unwrap())
}

fn fold(token: &str) -> String {
    let lower: String = token.chars().flat_map(|c| c.to_lowercase()).map(homoglyph).collect();
    let letters = lower.chars().filter(|c| c.is_alphabetic()).count();
    let digits = lower.chars().filter(|c| c.is_ascii_digit()).count();
    if letters >= 2 && letters > digits { lower.chars().map(leet).collect() } else { lower }
}

fn distance(a: &str, b: &str) -> usize {
    let (a, b): (Vec<char>, Vec<char>) = (a.chars().collect(), b.chars().collect());
    let mut prev: Vec<usize> = (0..=b.len()).collect();
    for i in 1..=a.len() {
        let mut cur = vec![i];
        for j in 1..=b.len() {
            let cost = if a[i - 1] == b[j - 1] { 0 } else { 1 };
            cur.push((prev[j] + 1).min(cur[j - 1] + 1).min(prev[j - 1] + cost));
        }
        prev = cur;
    }
    prev[b.len()]
}

pub fn check(text: &str, brands: &[String]) -> Vec<Finding> {
    let mut out: Vec<Finding> = Vec::new();
    let mut seen: Vec<&'static str> = Vec::new();

    for caps in host_re().captures_iter(text) {
        let Some(m) = caps.get(1) else { continue };
        let host = m.as_str();
        let mut hits: Vec<(&'static str, u32, &'static str)> = Vec::new();

        if host.to_lowercase().contains("xn--") {
            hits.push(("D04", 3, "Domain memakai penyandian khusus (punycode) yang bisa menyamarkan huruf mirip."));
        }
        if host.chars().any(|c| c.is_alphabetic() && !c.is_ascii()) {
            hits.push(("D01", 4, "Domain memuat huruf non-Latin yang bisa tampak sama dengan huruf biasa, trik umum untuk menyamar sebagai situs resmi."));
        }
        for token in host.split(|c| c == '.' || c == '-') {
            let raw = token.to_lowercase();
            let folded = fold(token);
            for b in brands {
                if raw != *b && folded == *b {
                    hits.push(("D01", 4, "Nama domain meniru merek dengan angka atau huruf kembaran, misalnya angka 4 menggantikan huruf a."));
                } else if raw != *b && b.chars().count() >= 5 && distance(&folded, b) == 1 {
                    hits.push(("D02", 3, "Nama domain nyaris sama dengan nama merek dan berbeda satu huruf. Salah ketik yang disengaja sering dipakai situs tiruan."));
                }
            }
        }
        for label in host.split('.') {
            let parts: Vec<&str> = label.split('-').collect();
            if parts.len() >= 2 && parts.iter().any(|p| brands.iter().any(|b| fold(p) == *b)) {
                hits.push(("D03", 2, "Nama merek digabung dengan kata lain dalam satu domain. Pola ini sering dipakai situs tiruan, tapi periksa dulu karena tidak selalu berbahaya."));
            }
        }

        for (id, weight, why) in hits {
            if seen.contains(&id) { continue; }
            seen.push(id);
            out.push(Finding {
                rule_id: id.into(),
                tactic: TACTIC.into(),
                weight,
                start: text[..m.start()].encode_utf16().count(),
                end: text[..m.end()].encode_utf16().count(),
                snippet: host.to_string(),
                why: why.into(),
            });
        }
    }
    out
}