//! Normalisasi teks sebelum dicocokkan dengan aturan, dengan peta posisi kembali ke teks asli
//! (satuan UTF-16) supaya sorotan di layar tetap tepat sasaran.

pub struct Norm {
    pub text: String,
    /// Untuk tiap karakter hasil normalisasi: (awal, akhir) di teks asli, satuan UTF-16.
    pub spans: Vec<(usize, usize)>,
    /// Untuk tiap karakter hasil normalisasi: offset byte di `text`.
    pub starts: Vec<usize>,
}

/// Huruf Kiril/Yunani yang tampak sama dengan huruf Latin.
pub fn homoglyph(c: char) -> char {
    match c {
        '\u{0430}' => 'a', '\u{0435}' => 'e', '\u{043e}' => 'o', '\u{0440}' => 'p',
        '\u{0441}' => 'c', '\u{0445}' => 'x', '\u{0456}' => 'i', '\u{03bf}' => 'o',
        _ => c,
    }
}

/// Angka yang sering dipakai menggantikan huruf ("s3gera", "0tp").
pub fn leet(c: char) -> char {
    match c {
        '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't',
        _ => c,
    }
}

fn is_sep(c: char) -> bool {
    matches!(c, ' ' | '.' | '-' | '_' | '*')
}

pub fn normalize(input: &str) -> Norm {
    // 1. Hapus karakter tak terlihat, huruf kecil, ganti huruf kembaran.
    let mut v: Vec<(char, usize, usize)> = Vec::new();
    let mut pos = 0usize;
    for ch in input.chars() {
        let (s, e) = (pos, pos + ch.len_utf16());
        pos = e;
        if matches!(ch, '\u{200b}'..='\u{200f}' | '\u{2060}' | '\u{feff}') {
            continue;
        }
        for lc in ch.to_lowercase() {
            v.push((homoglyph(lc), s, e));
        }
    }

    // 2. Angka pengganti huruf: hanya di kata yang hurufnya lebih banyak dari angkanya.
    //    Jadi "s3gera" dan "0tp" dipulihkan, tetapi "1x24" dan "Rp50" dibiarkan.
    let mut i = 0;
    while i < v.len() {
        if v[i].0.is_alphanumeric() {
            let mut j = i;
            while j < v.len() && v[j].0.is_alphanumeric() {
                j += 1;
            }
            let letters = v[i..j].iter().filter(|x| x.0.is_alphabetic()).count();
            let digits = v[i..j].iter().filter(|x| x.0.is_ascii_digit()).count();
            if letters >= 2 && letters > digits {
                for x in &mut v[i..j] {
                    x.0 = leet(x.0);
                }
            }
            i = j;
        } else {
            i += 1;
        }
    }

    // 3. Gabungkan huruf yang dipisah ("o t p", "o.t.p"), minimal 3 huruf tunggal berurutan.
    let mut w: Vec<(char, usize, usize)> = Vec::with_capacity(v.len());
    let mut i = 0;
    while i < v.len() {
        if v[i].0.is_alphabetic() && (i == 0 || !v[i - 1].0.is_alphanumeric()) {
            let (mut j, mut n) = (i, 1);
            while j + 2 < v.len()
                && is_sep(v[j + 1].0)
                && v[j + 2].0.is_alphabetic()
                && (j + 3 >= v.len() || !v[j + 3].0.is_alphanumeric())
            {
                j += 2;
                n += 1;
            }
            if n >= 3 {
                let mut k = i;
                while k <= j {
                    w.push(v[k]);
                    k += 2;
                }
                i = j + 1;
                continue;
            }
        }
        w.push(v[i]);
        i += 1;
    }

    let mut text = String::new();
    let (mut spans, mut starts) = (Vec::new(), Vec::new());
    for (c, s, e) in w {
        starts.push(text.len());
        spans.push((s, e));
        text.push(c);
    }
    Norm { text, spans, starts }
}