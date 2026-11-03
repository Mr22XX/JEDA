//! Korpus uji akurasi. Semua contoh fiktif. Jalankan dengan:  cargo test --test korpus -- --nocapture
//!
//! CATATAN JUJUR: korpus ini ditulis oleh penyusun aturan, jadi fungsinya uji regresi dan pemeriksaan
//! kewajaran, BUKAN evaluasi independen. Angka akurasi di sini tidak boleh diklaim berlaku di dunia nyata.
use jeda_engine::{analyze_link, analyze_text};

fn rank(level: &str) -> u8 {
    match level { "tidak_ditemukan" => 0, "ringan" => 1, "sedang" => 2, _ => 3 }
}

/// Pesan penipuan fiktif: diharapkan minimal "sedang".
const PENIPUAN: &[(&str, &str)] = &[
    ("OTP bank + blokir", "PT Bank Nusantara: akun Anda akan diblokir permanen dalam 1x24 jam. Segera sebutkan kode OTP yang masuk ke HP Anda untuk verifikasi ulang."),
    ("Lowongan + biaya", "Lowongan admin online dari HP, tanpa pengalaman, gaji jutaan per minggu. Transfer dulu biaya pendaftaran Rp100.000 untuk amankan slot."),
    ("Giveaway + pajak hadiah", "Selamat anda terpilih sebagai pemenang giveaway! Hadiah Rp10 juta. Klik https://hadiah-nusantara.xyz dan bayar pajak hadiah Rp250.000."),
    ("Pinjol ancam sebar data", "Anda menunggak pinjaman. Bayar sekarang atau kami sebarkan foto Anda dan hubungi seluruh kontak di HP Anda."),
    ("Investasi bebas risiko", "Investasi profit harian bebas risiko! Modal kecil hasil besar. Deposit Rp500.000 untuk membuka akun, tinggal 3 slot."),
    ("Teman nomor baru", "Ini aku, nomor baru ya. Tolong transfer dulu Rp750.000, darurat banget. Jangan bilang siapa-siapa dulu."),
    ("Resi paket APK", "Paket Anda gagal dikirim. Unduh resi paket di https://resi-paket.example/resi.apk untuk memperbarui alamat."),
    ("Mengaku polisi", "Kami dari kepolisian. Anda terlibat tindak pidana dan akan dilaporkan ke polisi. Hubungi petugas kami sekarang juga dan jangan bilang siapa-siapa."),
    ("Surat tilang", "Surat tilang elektronik atas nama Anda. Segera bayar denda lewat https://bit.ly/tilang-online sebelum diblokir."),
    ("Pinjaman + KTP", "Pengajuan pinjaman Anda disetujui, langsung cair tanpa BI checking. Kirim foto KTP dan selfie dengan KTP sekarang juga untuk verifikasi."),
    ("Love scam", "Aku nyambung banget sama kamu. Dompet dan pasporku dicuri, bisa transfer Rp5 juta dulu? Jangan cerita ke keluargamu, rahasiakan ini ya."),
    ("Tugas like + deposit", "Kerja dari HP, cukup like video, gaji jutaan per hari. Pindah ke Telegram untuk tugas pertama, deposit Rp200.000 untuk membuka akun."),
    ("Poin reward hangus", "Poin rewards Anda akan hangus hari ini terakhir. Tukar sekarang di http://bca-reward.top/tukar sebelum diblokir."),
    ("Listrik akan diputus", "Tagihan listrik Anda menunggak. Listrik akan diputus malam ini. Segera bayar lewat https://pln-bayar.click atau hubungi petugas."),
    ("Saldo gratis", "Kamu menang undian saldo gratis Rp2.000.000! Klik tautan untuk klaim sebelum kuota terbatas habis: https://klaim-saldo.example"),
    ("Anak minta transfer", "Mah, aku kecelakaan, ini nomor baru. Tolong transfer dulu Rp3 juta ke rekening rumah sakit, cepat ya jangan bilang papa."),
    ("Penipuan pemulihan dana", "Kami bantu pulihkan dana korban investasi. Bayar biaya administrasi pencairan Rp1.500.000 dulu, dana langsung cair, rahasiakan ini dari pihak lain."),
    ("Meniru bahasa waspada", "Jangan khawatir, ini prosedur resmi. Segera sebutkan kode OTP Anda sekarang juga agar akun tidak diblokir."),
    ("Phishing email + IP", "Akun email Anda ada transaksi mencurigakan. Konfirmasi password Anda di http://192.168.10.5/login sekarang juga."),
];

/// Pesan sah fiktif: diharapkan paling tinggi "ringan" (tidak boleh "sedang" atau "tinggi").
const SAH: &[(&str, &str)] = &[
    ("OTP sah + peringatan", "Kode OTP Anda: 482910. JANGAN BERIKAN kode OTP ini kepada siapa pun, termasuk pihak bank. Berlaku 5 menit."),
    ("Edukasi bank", "Pihak bank tidak pernah meminta Anda memberikan PIN atau kode OTP lewat telepon maupun chat. Waspada penipuan."),
    ("Rapat panitia", "Pengumuman: rapat panitia besok jam 3 sore di ruang himpunan. Mohon hadir tepat waktu dan bawa laptop."),
    ("Resi toko online", "Pesanan Anda #A1234 sudah dikirim. Lacak paket di aplikasi atau https://www.tokopedia.com/order. Estimasi tiba 2 hari."),
    ("Ojek online tiba", "Driver sudah tiba di titik jemput. Mohon segera menuju kendaraan ya."),
    ("Undangan wawancara resmi", "Halo Bu, terima kasih sudah wawancara kemarin. Kami mengundang Ibu ke tahap berikutnya hari Senin pukul 10.00. Konfirmasi lewat email hrd@perusahaan.co.id."),
    ("Promo gajian", "Promo gajian: diskon 50% semua menu, berlaku sampai tanggal 5. Cek menu lengkap di aplikasi."),
    ("Chat keluarga", "Mah, aku sudah sampai kos. Besok pulang naik kereta jam 8 ya."),
    ("Tagihan listrik resmi", "Tagihan listrik bulan Oktober Rp215.000 jatuh tempo tanggal 20. Bayar lewat aplikasi PLN Mobile atau minimarket terdekat."),
    ("Info beasiswa", "Info kampus: pendaftaran beasiswa dibuka hingga 15 November. Syarat dan berkas ada di https://www.kampus.ac.id/beasiswa."),
    ("Imbauan keamanan", "Peringatan keamanan: jangan klik tautan dari pengirim tak dikenal dan rahasiakan password Anda."),
    ("Notifikasi transaksi", "Transaksi Rp50.000 di Kedai Kopi berhasil. Jika bukan Anda, hubungi layanan pelanggan di aplikasi."),
];

/// Batasan yang diketahui: contoh yang SENGAJA sulit. Tidak dijadikan syarat lulus, hanya dilaporkan.
const SULIT: &[(&str, &str)] = &[
    ("Penipu sopan tanpa kata kunci", "Halo kak, saya Rina dari tim promosi. Boleh minta nomor rekening kakak? Ada bonus khusus pelanggan setia yang mau kami kirim."),
    ("Formulir data pribadi", "Kak, tolong isi data lengkap di formulir ini ya, hanya 2 menit: https://forms.example/isi"),
    ("Pesan bahasa Inggris", "Congratulations! You have won a prize. Send your bank details today to claim your reward."),
];

/// (tautan, level minimal yang diharapkan)
const TAUTAN_BERBAHAYA: &[(&str, u8)] = &[
    ("https://bca-verifikasi.xyz/login", 3),
    ("https://www.bca.co.id@akun-aman.example/masuk", 2),
    ("http://192.168.1.10/login", 2),
    ("https://resi-paket.example/resi.apk", 2),
    ("https://bca.co.id.verifikasi-akun.xyz", 2),
    ("https://tokopedi4.com/promo", 2),
    ("https://klaim-hadiah-dana.top/claim?url=http://x.example", 2),
    ("https://bit.ly/3xYz", 1),
];
const TAUTAN_SAH: &[&str] = &[
    "https://www.bca.co.id/",
    "https://www.tokopedia.com/",
    "https://mail.google.com/",
    "https://www.kemdikbud.go.id/main",
    "https://shopee.co.id/product/123",
    "https://id.wikipedia.org/wiki/Penipuan",
    "https://www.bankmandiri.co.id/",
    "https://www.kompas.com/tren/read/2026/10/01/bca-naikkan-suku-bunga",
];

fn level_link(u: &str) -> (String, u64) {
    let v: serde_json::Value = serde_json::from_str(&analyze_link(u)).unwrap();
    (v["level"].as_str().unwrap().to_string(), v["score"].as_u64().unwrap())
}

#[test]
fn korpus_pesan() {
    println!("\n=== PESAN PENIPUAN (harus >= sedang) ===");
    let (mut hit, mut miss) = (0, vec![]);
    for (nama, t) in PENIPUAN {
        let a = analyze_text(t);
        let ok = rank(a.level) >= 2;
        println!("{} {:<28} skor {:>2} {}", if ok { "OK  " } else { "MISS" }, nama, a.score, a.level);
        if ok { hit += 1 } else { miss.push(*nama) }
    }
    println!("\n=== PESAN SAH (harus <= ringan) ===");
    let (mut aman, mut salah) = (0, vec![]);
    for (nama, t) in SAH {
        let a = analyze_text(t);
        let ok = rank(a.level) <= 1;
        let ids: Vec<_> = a.findings.iter().map(|f| f.rule_id.as_str()).collect();
        println!("{} {:<28} skor {:>2} {} {:?}", if ok { "OK  " } else { "SALAH" }, nama, a.score, a.level, ids);
        if ok { aman += 1 } else { salah.push(*nama) }
    }
    println!("\n=== BATASAN YANG DIKETAHUI (tidak mempengaruhi lulus) ===");
    for (nama, t) in SULIT {
        let a = analyze_text(t);
        println!("{:<34} skor {:>2} {}", nama, a.score, a.level);
    }
    println!("\nRINGKASAN PESAN: penipuan terdeteksi {}/{} | pesan sah lolos {}/{}", hit, PENIPUAN.len(), aman, SAH.len());
    assert!(miss.is_empty(), "penipuan yang lolos: {:?}", miss);
    assert!(salah.is_empty(), "pesan sah yang salah ditandai: {:?}", salah);
}

#[test]
fn korpus_tautan() {
    println!("\n=== TAUTAN BERBAHAYA ===");
    let (mut hit, mut miss) = (0, vec![]);
    for (u, min) in TAUTAN_BERBAHAYA {
        let (lv, sc) = level_link(u);
        let ok = rank(&lv) >= *min;
        println!("{} {:<60} skor {:>2} {}", if ok { "OK  " } else { "MISS" }, u, sc, lv);
        if ok { hit += 1 } else { miss.push(*u) }
    }
    println!("\n=== TAUTAN SAH (harus <= ringan) ===");
    let (mut aman, mut salah) = (0, vec![]);
    for u in TAUTAN_SAH {
        let (lv, sc) = level_link(u);
        let ok = rank(&lv) <= 1;
        println!("{} {:<60} skor {:>2} {}", if ok { "OK  " } else { "SALAH" }, u, sc, lv);
        if ok { aman += 1 } else { salah.push(*u) }
    }
    println!("\nRINGKASAN TAUTAN: berbahaya terdeteksi {}/{} | sah lolos {}/{}", hit, TAUTAN_BERBAHAYA.len(), aman, TAUTAN_SAH.len());
    assert!(miss.is_empty(), "tautan berbahaya yang lolos: {:?}", miss);
    assert!(salah.is_empty(), "tautan sah yang salah ditandai: {:?}", salah);
}