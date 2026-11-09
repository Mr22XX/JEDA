//! Normalisasi teks sebelum dicocokkan dengan aturan, dengan peta posisi kembali ke teks asli
//! (satuan UTF-16) supaya sorotan di layar tetap tepat sasaran.
//!
//! Yang dipulihkan: huruf kembaran (Kiril, Yunani, fullwidth, huruf tebal/miring Unicode, huruf
//! berlingkar, huruf beraksen), karakter tak terlihat, tanda sisipan di tengah kata ("mai'n",
//! "GAC/OR", "au-t,o"), angka pengganti huruf ("s3gera", "z3'u5"), huruf kecil "l" yang
//! menyamar sebagai "i" di kata kapital ("LlNK"), huruf berulang ("nyaaaa"), dan huruf terpisah ("o t p").
//!
//! Dipakai oleh lib.rs (normalize, squeeze) dan domain.rs (homoglyph, leet).
//! Langkah normalize: tandai tautan, buang karakter tak terlihat dan ganti huruf kembaran, buang tanda sisipan,
//! pulihkan angka pengganti huruf, ringkas huruf berulang, gabungkan huruf terpisah.
//! Aturan emas: `text`, `spans`, dan `starts` harus selalu sejajar per karakter. Posisi memakai UTF-16.
//! Setelah mengubah langkah apa pun, jalankan seluruh `cargo test` (terutama uji judi online dan pesan sah).

pub struct Norm {
    pub text: String,
    /// Untuk tiap karakter hasil normalisasi: (awal, akhir) di teks asli, satuan UTF-16.
    pub spans: Vec<(usize, usize)>,
    /// Untuk tiap karakter hasil normalisasi: offset byte di `text`.
    pub starts: Vec<usize>,
}

/// Akhiran domain yang umum. Titik sebelum akhiran ini tidak dibuang walau hurufnya tunggal ("s.id").
const TLDS: &[&str] = &[
    "com", "org", "net", "id", "io", "co", "xyz", "top", "click", "icu", "site", "online", "vip", "cc", "buzz", "cfd", "sbs",
    "monster", "app", "dev", "me", "ly", "la", "st", "run", "gl", "link", "info", "biz", "store", "shop", "live", "win", "bet",
    "fun", "club", "pro", "asia", "in", "to", "us", "uk", "tv", "ws",
];

/// Huruf kecil yang tampak sama dengan huruf Latin biasa. Dipakai juga oleh pemeriksa domain.
pub fn homoglyph(c: char) -> char {
    let u = c as u32;
    if (0xFF01..=0xFF5E).contains(&u) {
        // Fullwidth: "ＧＡＣＯＲ"
        return char::from_u32(u - 0xFEE0).map(|x| x.to_ascii_lowercase()).unwrap_or(c);
    }
    if (0x1D400..=0x1D6A3).contains(&u) {
        // Huruf matematika (tebal, miring, monospace, dll.): "𝗚𝗔𝗖𝗢𝗥"
        return (b'a' + ((u - 0x1D400) % 26) as u8) as char;
    }
    if u == 0x1D6A4 { return 'i'; }
    if u == 0x1D6A5 { return 'j'; }
    if (0x1D7CE..=0x1D7FF).contains(&u) {
        return (b'0' + ((u - 0x1D7CE) % 10) as u8) as char;
    }
    if (0x24B6..=0x24CF).contains(&u) { return (b'a' + (u - 0x24B6) as u8) as char; } // Ⓐ
    if (0x24D0..=0x24E9).contains(&u) { return (b'a' + (u - 0x24D0) as u8) as char; } // ⓐ
    for start in [0x1F130u32, 0x1F150, 0x1F170] {
        // Huruf berkotak
        if (start..=start + 25).contains(&u) { return (b'a' + (u - start) as u8) as char; }
    }
    match u {
        0x1D00 => return 'a', 0x0299 => return 'b', 0x1D04 => return 'c', 0x1D05 => return 'd', 0x1D07 => return 'e',
        0xA730 => return 'f', 0x0262 => return 'g', 0x029C => return 'h', 0x026A => return 'i', 0x1D0A => return 'j',
        0x1D0B => return 'k', 0x029F => return 'l', 0x1D0D => return 'm', 0x0274 => return 'n', 0x1D0F => return 'o',
        0x1D18 => return 'p', 0x0280 => return 'r', 0xA731 => return 's', 0x1D1B => return 't', 0x1D1C => return 'u',
        0x1D20 => return 'v', 0x1D21 => return 'w', 0x028F => return 'y', 0x1D22 => return 'z',
        _ => {}
    }
    match c {
        // Kiril dan Yunani yang mirip huruf Latin
        '\u{0430}' | '\u{03b1}' => 'a',
        '\u{0432}' => 'b',
        '\u{0435}' => 'e',
        '\u{043e}' | '\u{03bf}' => 'o',
        '\u{0440}' | '\u{03c1}' => 'p',
        '\u{0441}' => 'c',
        '\u{0445}' => 'x',
        '\u{0456}' | '\u{03b9}' => 'i',
        '\u{043a}' | '\u{03ba}' => 'k',
        '\u{043c}' => 'm',
        '\u{043d}' => 'h',
        '\u{0442}' | '\u{03c4}' => 't',
        '\u{0443}' => 'y',
        '\u{0455}' => 's',
        '\u{0458}' => 'j',
        '\u{0501}' => 'd',
        '\u{0261}' => 'g',
        '\u{03bd}' => 'v',
        '\u{03c5}' => 'u',
        // Huruf beraksen
        'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'ā' | 'ă' | 'ą' => 'a',
        'ç' | 'ć' | 'ĉ' | 'č' | 'ċ' => 'c',
        'ď' | 'đ' => 'd',
        'è' | 'é' | 'ê' | 'ë' | 'ē' | 'ĕ' | 'ė' | 'ę' | 'ě' => 'e',
        'ĝ' | 'ğ' | 'ġ' | 'ģ' => 'g',
        'ĥ' | 'ħ' => 'h',
        'ì' | 'í' | 'î' | 'ï' | 'ĩ' | 'ī' | 'ĭ' | 'į' | 'ı' => 'i',
        'ĵ' => 'j',
        'ķ' => 'k',
        'ĺ' | 'ļ' | 'ľ' | 'ŀ' | 'ł' => 'l',
        'ñ' | 'ń' | 'ņ' | 'ň' => 'n',
        'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ø' | 'ō' | 'ŏ' | 'ő' => 'o',
        'ŕ' | 'ŗ' | 'ř' => 'r',
        'ś' | 'ŝ' | 'ş' | 'š' => 's',
        'ţ' | 'ť' | 'ŧ' => 't',
        'ù' | 'ú' | 'û' | 'ü' | 'ũ' | 'ū' | 'ŭ' | 'ů' | 'ű' | 'ų' => 'u',
        'ŵ' => 'w',
        'ý' | 'ÿ' | 'ŷ' => 'y',
        'ź' | 'ż' | 'ž' => 'z',
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

fn is_apos(c: char) -> bool {
    matches!(c, '\'' | '\u{2019}' | '\u{2018}' | '`' | '\u{b4}' | '\u{2bc}')
}

/// Karakter yang tidak terlihat atau hanya hiasan (spasi lebar nol, kontrol arah, tanda gabung, penanda variasi).
fn is_invisible(ch: char) -> bool {
    matches!(ch,
        '\u{200b}'..='\u{200f}' | '\u{2060}' | '\u{feff}' | '\u{00ad}' | '\u{034f}' | '\u{061c}' | '\u{180e}'
        | '\u{202a}'..='\u{202e}' | '\u{2066}'..='\u{2069}' | '\u{fe00}'..='\u{fe0f}' | '\u{0300}'..='\u{036f}')
}

/// Apakah potongan teks (tanpa spasi) tampak seperti tautan? Tautan tidak boleh dirusak oleh pembuangan tanda sisipan.
fn url_like(tok: &str) -> bool {
    let t = tok.to_lowercase();
    if t.contains("://") || t.starts_with("www.") { return true; }
    let hostish = |h: &str| h.chars().all(|c| c.is_alphanumeric() || c == '.' || c == '-');
    if let Some(i) = t.find('/') {
        let h = &t[..i];
        if h.contains('.') && hostish(h) { return true; }
    }
    let t = t.trim_matches(|c: char| !c.is_alphanumeric());
    if let Some(i) = t.rfind('.') {
        let (head, tld) = (&t[..i], &t[i + 1..]);
        if i > 0 && TLDS.contains(&tld) && hostish(head) { return true; }
    }
    false
}

#[derive(Clone, Copy)]
struct Ch {
    c: char,
    s: usize,
    e: usize,
    /// Bagian dari tautan: tanda sisipan dan huruf berulang di sini dibiarkan.
    prot: bool,
}

pub fn normalize(input: &str) -> Norm {
    let chars: Vec<char> = input.chars().collect();
    let n = chars.len();

    // 0. Tandai tiap potongan teks tanpa spasi: tautan, dan kata kapital yang disusupi huruf kecil "l".
    let mut prot = vec![false; n];
    let mut capl = vec![false; n];
    let mut i = 0;
    while i < n {
        if chars[i].is_whitespace() {
            i += 1;
            continue;
        }
        let mut j = i;
        while j < n && !chars[j].is_whitespace() {
            j += 1;
        }
        let tok: String = chars[i..j].iter().collect();
        let is_url = url_like(&tok);
        let upper = chars[i..j].iter().filter(|c| c.is_uppercase()).count();
        let lower_other = chars[i..j].iter().filter(|c| c.is_lowercase() && **c != 'l').count();
        let caps = upper >= 3 && lower_other == 0;
        for k in i..j {
            prot[k] = is_url;
            capl[k] = caps && chars[k] == 'l';
        }
        i = j;
    }

    // 1. Hapus karakter tak terlihat, huruf kecil, ganti huruf kembaran.
    let mut v: Vec<Ch> = Vec::with_capacity(n);
    let mut pos = 0usize;
    for (idx, &ch) in chars.iter().enumerate() {
        let (s, e) = (pos, pos + ch.len_utf16());
        pos = e;
        if is_invisible(ch) {
            continue;
        }
        for lc in ch.to_lowercase() {
            let mut c = homoglyph(lc);
            if capl[idx] && c == 'l' {
                c = 'i';
            }
            v.push(Ch { c, s, e, prot: prot[idx] });
        }
    }

    // 1b. Buang tanda sisipan di tengah kata ("mai'n", "GAC/OR", "c,hi,p", "m-suk", "g.oogle").
    //     Hanya bila salah satu potongan di sisinya pendek, supaya "kirim,tolong" atau "berkali-kali" tetap utuh.
    //     Apostrof pada kata kerja bantu bahasa Inggris ("don't", "you've") dibiarkan.
    let m = v.len();
    let mut rl = vec![0usize; m];
    let mut i = 0;
    while i < m {
        if v[i].c.is_alphanumeric() {
            let mut j = i;
            while j < m && v[j].c.is_alphanumeric() {
                j += 1;
            }
            for k in i..j {
                rl[k] = j - i;
            }
            i = j;
        } else {
            i += 1;
        }
    }
    let mut keep = vec![true; m];
    for i in 1..m.saturating_sub(1) {
        let c = v[i].c;
        if c.is_alphanumeric() || v[i].prot {
            continue;
        }
        let (a, b) = (v[i - 1].c, v[i + 1].c);
        if !(a.is_alphanumeric() && b.is_alphanumeric()) || (a.is_ascii_digit() && b.is_ascii_digit()) {
            continue;
        }
        let mn = rl[i - 1].min(rl[i + 1]);
        let right: String = v[i + 1..].iter().take_while(|x| x.c.is_alphanumeric()).map(|x| x.c).collect();
        if is_apos(c) {
            let contraction = matches!(right.as_str(), "s" | "t" | "m" | "d" | "ll" | "re" | "ve") && (rl[i - 1] >= 2 || a == 'i');
            if !contraction {
                keep[i] = false;
            }
        } else if matches!(c, ',' | '/' | '\\') {
            if mn <= 2 {
                keep[i] = false;
            }
        } else if matches!(c, '-' | '_' | '*' | '+' | '.' | '\u{b7}' | '\u{2022}')
            && mn <= 1
            && a.is_alphabetic()
            && b.is_alphabetic()
            && !(c == '.' && TLDS.contains(&right.as_str()))
        {
            keep[i] = false;
        }
    }
    let mut v: Vec<Ch> = v.into_iter().zip(keep).filter(|(_, k)| *k).map(|(x, _)| x).collect();

    // 2. Angka pengganti huruf: hanya di kata yang hurufnya lebih banyak dari angkanya, atau yang angkanya
    //    terselip di tengah huruf ("z3u5"). "1x24", "Rp50", "Rp1", dan angka ekor seperti "maxasia777" dibiarkan.
    //    Pengali seperti "x5OO" dibaca sebagai "x500". Potongan yang berupa tautan tidak diubah.
    let m = v.len();
    let mut i = 0;
    while i < m {
        if v[i].c.is_alphanumeric() {
            let mut j = i;
            while j < m && v[j].c.is_alphanumeric() {
                j += 1;
            }
            let tok: String = v[i..j].iter().map(|x| x.c).collect();
            let special_rp = tok.len() > 2 && tok.starts_with("rp") && tok[2..].chars().all(|c| c.is_ascii_digit());
            let special_x = (4..=6).contains(&tok.chars().count())
                && tok.starts_with('x')
                && tok[1..].chars().all(|c| c.is_ascii_digit() || c == 'o')
                && tok.chars().any(|c| c.is_ascii_digit());
            if special_rp {
                // biarkan
            } else if special_x {
                for x in &mut v[i..j] {
                    if x.c == 'o' {
                        x.c = '0';
                    }
                }
            } else {
                let letters = v[i..j].iter().filter(|x| x.c.is_alphabetic()).count();
                let digit_idx: Vec<usize> = (i..j).filter(|&k| v[k].c.is_ascii_digit()).collect();
                let digits = digit_idx.len();
                let internal = digit_idx
                    .iter()
                    .any(|&k| v[i..k].iter().any(|x| x.c.is_alphabetic()) && v[k + 1..j].iter().any(|x| x.c.is_alphabetic()));
                let trailing_only = digits >= 2 && digit_idx[0] == j - digits;
                let in_url = v[i..j].iter().any(|x| x.prot);
                if letters >= 2 && (letters > digits || internal) && !trailing_only && !in_url {
                    for x in &mut v[i..j] {
                        x.c = leet(x.c);
                    }
                }
            }
            i = j;
        } else {
            i += 1;
        }
    }

    // 2b. Huruf yang diulang tiga kali atau lebih diringkas jadi dua ("nyaaaa" -> "nyaa").
    //     Sorotan tetap mencakup seluruh huruf asli. Huruf "w" dikecualikan agar "www." utuh.
    let mut o: Vec<Ch> = Vec::with_capacity(v.len());
    let mut i = 0;
    while i < v.len() {
        let c = v[i].c;
        if c.is_alphabetic() && c != 'w' && !v[i].prot {
            let mut j = i;
            while j < v.len() && v[j].c == c && !v[j].prot {
                j += 1;
            }
            if j - i >= 3 {
                o.push(v[i]);
                o.push(Ch { c, s: v[i + 1].s, e: v[j - 1].e, prot: false });
                i = j;
                continue;
            }
        }
        o.push(v[i]);
        i += 1;
    }
    let v = o;

    // 3. Gabungkan huruf yang dipisah ("o t p", "o.t.p"), minimal 3 huruf tunggal berurutan.
    let mut w: Vec<Ch> = Vec::with_capacity(v.len());
    let mut i = 0;
    while i < v.len() {
        if v[i].c.is_alphabetic() && (i == 0 || !v[i - 1].c.is_alphanumeric()) {
            let (mut j, mut cnt) = (i, 1);
            while j + 2 < v.len()
                && is_sep(v[j + 1].c)
                && v[j + 2].c.is_alphabetic()
                && (j + 3 >= v.len() || !v[j + 3].c.is_alphanumeric())
            {
                j += 2;
                cnt += 1;
            }
            if cnt >= 3 {
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
    for x in w {
        starts.push(text.len());
        spans.push((x.s, x.e));
        text.push(x.c);
    }
    Norm { text, spans, starts }
}

/// Versi "dirapatkan": hanya huruf dan angka, tanpa spasi atau tanda baca. Dipakai untuk kata yang sengaja
/// dipecah ("KEME NAN GAN", "gh ac or"). Posisi tetap dipetakan ke teks asli.
pub fn squeeze(n: &Norm) -> Norm {
    let mut text = String::new();
    let (mut spans, mut starts) = (Vec::new(), Vec::new());
    for (c, sp) in n.text.chars().zip(n.spans.iter()) {
        if c.is_alphanumeric() {
            starts.push(text.len());
            spans.push(*sp);
            text.push(c);
        }
    }
    Norm { text, spans, starts }
}