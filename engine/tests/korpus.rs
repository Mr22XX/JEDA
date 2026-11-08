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
    ("https://bca-verifikasi.vercel.app/login", 3),
    ("http://0x7f.0.0.1/login", 3),
    ("https://situs.example/login?user=a&password=123", 1),
    ("Klik https://bca-verifikasi.xyz/login sekarang ya", 3),
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
    "https://my-portfolio.vercel.app/",
    "https://www.bbc.co.uk/news",
    "https://docs.google.com/document/d/abc123",
    "https://forms.gle/xyz789",
    "https://github.com/rust-lang/rust",
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

/// Pesan penipuan fiktif berbahasa Inggris: diharapkan minimal "sedang".
const PENIPUAN_EN: &[(&str, &str)] = &[
    ("Bank suspended + OTP", "URGENT: Your bank account has been suspended. Verify now at http://secure-bank-login.xyz and send your one-time password to reactivate."),
    ("Prize + processing fee", "Congratulations! You have been selected as the winner of a $5,000 gift card. Pay a small processing fee to claim your prize."),
    ("Work from home + fee", "Work from home, no experience needed, earn $500 per day. Pay a registration fee of $50 to start today."),
    ("Recruiter on Telegram", "I am a recruiter at a big tech company. Contact me on Telegram for a remote job, deposit $100 to activate your account."),
    ("Family new number", "Mom, my phone broke, this is my new number. I need money urgently, please transfer $800 today and don't tell dad."),
    ("Parcel customs fee", "Your package is on hold due to unpaid customs fees. Click the link to reschedule delivery: http://parcel-track.top/pay"),
    ("Tax office gift cards", "IRS notice: you owe back taxes. Pay immediately with gift cards or you will be arrested."),
    ("Unusual activity", "We detected unusual activity on your account. Confirm your password at https://login-verify.click within 24 hours."),
    ("Crypto guaranteed", "Guaranteed profit! Double your money in 7 days with our crypto trading signals. Deposit to unlock withdrawals."),
    ("Tech support remote", "Hi, this is Microsoft support. Your computer is infected. Install AnyDesk so we can fix it."),
    ("Romance emergency", "I've never felt this way about anyone. I'm stuck abroad and need $2,000 sent urgently. Please keep this between us."),
    ("Loan + ID + fee", "Your loan is approved, no credit check! Send a copy of your ID and pay the insurance fee first."),
    ("Extortion in bitcoin", "We will leak your photos and contact all your contacts unless you pay $300 in bitcoin today."),
    ("Overdue invoice", "Final notice: your invoice is overdue. Download the attached file or legal action will be taken."),
    ("Boss gift cards", "Hi, I'm your new boss. Buy 5 Apple gift cards and send me the codes. Keep it confidential."),
    ("Refund overpaid", "Refund available: you were overpaid. Verify your account details at the link below to receive your refund."),
    ("Mimics warning language", "Don't worry, this is the official process. Immediately send your OTP code to confirm your identity."),
    ("Wallet airdrop", "Exclusive crypto airdrop! Only 50 spots left. Connect your wallet and send your recovery phrase now."),
];

/// Pesan sah fiktif berbahasa Inggris: diharapkan paling tinggi "ringan".
const SAH_EN: &[(&str, &str)] = &[
    ("OTP + warning", "Your verification code is 482910. Do not share your verification code with anyone, including bank staff. It expires in 5 minutes."),
    ("Bank education", "Your bank will never ask you for your PIN or password by phone, email or text. Stay alert for scams."),
    ("Meeting moved", "Hi team, the meeting is moved to 3 pm tomorrow. Please bring your laptop."),
    ("Order shipped", "Your order #A1234 has shipped. Track it at https://www.amazon.com/orders. Estimated delivery: Friday."),
    ("Ride arriving", "Your ride is arriving now. Please head to the pickup point."),
    ("Appointment reminder", "Reminder: your appointment is tomorrow at 10:00. Reply YES to confirm."),
    ("Interview invite", "Thanks for interviewing yesterday. We'd like to invite you to the next round on Monday. Please confirm via hr@company.com."),
    ("Sale notice", "Sale ends Sunday: 30% off all items. Shop in the app."),
    ("Family chat", "Hey mom, I got home safe. See you at dinner."),
    ("Security alert legit", "Security alert: a new device signed in to your account. If this was you, no action is needed."),
    ("Password hygiene", "Don't tell anyone your password. Use a password manager and enable two-factor authentication."),
    ("Payment receipt", "Payment of $49.00 to Netflix was successful. If you did not make this payment, contact support in the app."),
    ("Congratulations", "Congratulations on your promotion! Drinks on Friday?"),
];

/// Batasan yang diketahui untuk bahasa Inggris.
const SULIT_EN: &[(&str, &str)] = &[
    ("Polite no keywords", "Hi, I found your profile and think you would be perfect for an opportunity. Can we chat on another app?"),
    ("Form request", "Please fill in this short form with your details, it only takes two minutes: https://forms.example/start"),
    ("Spanish message", "Felicidades, ha ganado un premio. Envie sus datos bancarios hoy para reclamarlo."),
];

#[test]
fn korpus_pesan_inggris() {
    println!("\n=== ENGLISH SCAM MESSAGES (must be >= sedang) ===");
    let (mut hit, mut miss) = (0, vec![]);
    for (nama, t) in PENIPUAN_EN {
        let a = analyze_text(t);
        let ok = rank(a.level) >= 2;
        let ids: Vec<_> = a.findings.iter().map(|f| f.rule_id.as_str()).collect();
        println!("{} {:<26} skor {:>2} {} {:?}", if ok { "OK  " } else { "MISS" }, nama, a.score, a.level, ids);
        if ok { hit += 1 } else { miss.push(*nama) }
    }
    println!("\n=== ENGLISH LEGIT MESSAGES (must be <= ringan) ===");
    let (mut aman, mut salah) = (0, vec![]);
    for (nama, t) in SAH_EN {
        let a = analyze_text(t);
        let ok = rank(a.level) <= 1;
        let ids: Vec<_> = a.findings.iter().map(|f| f.rule_id.as_str()).collect();
        println!("{} {:<26} skor {:>2} {} {:?}", if ok { "OK  " } else { "SALAH" }, nama, a.score, a.level, ids);
        if ok { aman += 1 } else { salah.push(*nama) }
    }
    println!("\n=== KNOWN LIMITS (not asserted) ===");
    for (nama, t) in SULIT_EN {
        let a = analyze_text(t);
        println!("{:<26} skor {:>2} {}", nama, a.score, a.level);
    }
    println!("\nRINGKASAN INGGRIS: penipuan terdeteksi {}/{} | pesan sah lolos {}/{}", hit, PENIPUAN_EN.len(), aman, SAH_EN.len());
    assert!(miss.is_empty(), "english scams missed: {:?}", miss);
    assert!(salah.is_empty(), "english legit flagged: {:?}", salah);
}

/// Regresi (set A): sudah dipakai menyetel aturan, jadi BUKAN ukuran akurasi.
const REGRESI_PENIPUAN_ID: &[(&str, &str)] = &[
    ("Rekrutmen reseller", "Halo kak, kami dari tim rekrutmen Tokopedia. Kakak terpilih jadi reseller, gaji 500 ribu per hari. Hubungi kami di WhatsApp wa.me/6281200000000"),
    ("Minta PIN ATM", "Rekening Anda bermasalah dan akan kami tutup. Silakan konfirmasi data dengan membalas nomor PIN ATM Anda sekarang."),
    ("Bunda nomor baru", "Bunda, aku lagi di rumah sakit, nomor ini nomor baru. Tolong kirim uang 2 juta ke rekening ini ya, nanti aku jelasin."),
    ("Modal tanpa agunan", "Dapatkan modal usaha 20 juta tanpa agunan, proses 5 menit, cukup bayar biaya asuransi 300 ribu."),
    ("Hadiah mobil", "Anda mendapat hadiah mobil dari program undian. Hubungi admin untuk klaim dan siapkan dana pengurusan pajak."),
    ("Login mencurigakan", "Kami melihat aktivitas login mencurigakan di akun Anda. Klik tautan berikut untuk mengamankan akun: http://akun-aman.top/masuk"),
    ("Tugas + deposit aktivasi", "Kak, tugas tambahan: like dan follow, dapat 50rb per tugas. Gabung grup Telegram kami, deposit 100rb untuk aktivasi member."),
    ("Tagihan + sebar data", "Anda telah menunggak tagihan, kami akan menyebarkan data pribadi Anda ke semua kontak jika tidak segera dilunasi."),
    ("Ayah HP hilang", "Ini ayah, HP ayah hilang. Tolong transfer dulu 3 juta ke rekening teman ayah, nanti diganti ya."),
    ("Undangan APK", "Undangan pernikahan digital: unduh aplikasinya di sini http://undangan-digital.example/undangan.apk"),
    ("BPJS dinonaktifkan", "Info penting dari BPJS: kartu Anda akan dinonaktifkan hari ini. Verifikasi data lewat link berikut bit.ly/bpjs-cek"),
    ("Emas untung harian", "Investasi emas digital, untung 5% per hari dijamin, member lama sudah menarik jutaan. Daftar sekarang kuota terbatas."),
];

/// Regresi pesan sah Indonesia (set A).
const REGRESI_SAH_ID: &[(&str, &str)] = &[
    ("Kuliah besok", "Besok kuliah jam 7 ya, jangan telat. Tugas sudah dikumpulin kan?"),
    ("Pesanan dikemas", "Pesanan Anda sedang dikemas dan akan dikirim hari ini. Lacak paket lewat aplikasi."),
    ("OTP sah", "Kode verifikasi Anda 553210. Jangan bagikan kode ini ke siapa pun. Berlaku 5 menit."),
    ("Tagihan internet", "Tagihan internet bulan ini Rp350.000, jatuh tempo tanggal 25. Bayar lewat aplikasi resmi."),
    ("Ulang tahun", "Selamat ulang tahun! Semoga sehat dan sukses selalu. Traktiran ya hehe."),
    ("Libur nasional", "Pengumuman: libur nasional tanggal 17, kantor tutup. Kembali masuk hari Selasa."),
    ("Konfirmasi rapat", "Mohon konfirmasi kehadiran rapat besok lewat email panitia@kampus.ac.id sebelum pukul 16.00."),
    ("Promo akhir bulan", "Promo akhir bulan: diskon 30% untuk semua kategori, berlaku sampai Minggu. Cek aplikasi."),
];

/// Regresi (set A) bahasa Inggris, sudah dipakai menyetel aturan.
const REGRESI_PENIPUAN_EN: &[(&str, &str)] = &[
    ("Billing update", "Dear customer, we noticed a problem with your payment method. Please log in at http://billing-update.top and re-enter your card number to avoid service interruption."),
    ("HR on WhatsApp", r#"Hello, I'm Sarah from the HR team at Google. We have a part-time role paying $300 daily, message me on WhatsApp to get started."#),
    ("Netflix billing", "Your Netflix subscription failed. Update your payment information now: https://netflix-billing.click/update"),
    ("Lost phone Venmo", r#"Hey it's me, I lost my phone and I'm using a friend's. Can you send me $400 through Venmo? I'll pay you back tomorrow, it's urgent."#),
    ("Pending refund", "You have a pending refund of $213. Provide your bank login to receive the money."),
    ("Coinbase code", "Send me your Coinbase code so I can help you recover the account."),
    ("Redelivery fee", "Your parcel could not be delivered. Pay a $2.99 redelivery fee here: http://post-office-track.xyz"),
    ("Trading bot", "Earn passive income with our trading bot, 5% daily returns, minimum deposit $250."),
    ("Fraud team code", "This is the bank fraud team. Someone tried to withdraw from your account. Read us the code we just texted you."),
    ("Apple ID locked", "Your Apple ID has been locked for security reasons. Restore access: http://appleid-verify.icu/login"),
    ("Soldier overseas", r#"I'm a soldier serving overseas and I'd like to get to know you. I need help paying for my leave papers."#),
    ("Lucky winner", "Congrats, you are our lucky winner this week! Reply with your full name and address to receive your free iPhone."),
];

/// Regresi pesan sah Inggris (set A).
const REGRESI_SAH_EN: &[(&str, &str)] = &[
    ("Quarterly report", r#"Hi Sam, can you review the quarterly report before Friday's meeting? Thanks!"#),
    ("Package tomorrow", "Your package will arrive tomorrow between 2 and 4 pm. You can track it in the app."),
    ("OTP valid 10 min", "Your one-time code is 771204. It is valid for 10 minutes. We will never call you to ask for it."),
    ("Electricity bill", "Reminder: your electricity bill of $82.40 is due on the 15th. Pay through the official app."),
    ("Welcome", "Welcome to the team! Your first day is Monday at 9am. HR will send your onboarding schedule by email."),
    ("Late tonight", r#"Mom, I'll be late tonight, don't wait up for dinner."#),
    ("Receipt attached", "Thanks for your payment. Your receipt is attached. Contact support@shop.com with any questions."),
    ("Flash sale", "Flash sale: 40% off shoes, ends tonight at midnight. Shop now in the app."),
];

#[test]
fn regresi_set_a() {
    let mut bad = vec![];
    for (n, t) in REGRESI_PENIPUAN_ID.iter().chain(REGRESI_PENIPUAN_EN) { if rank(analyze_text(t).level) < 2 { bad.push(format!("penipuan lolos: {n}")); } }
    for (n, t) in REGRESI_SAH_ID.iter().chain(REGRESI_SAH_EN) { if rank(analyze_text(t).level) > 1 { bad.push(format!("sah salah ditandai: {n}")); } }
    assert!(bad.is_empty(), "{:?}", bad);
}