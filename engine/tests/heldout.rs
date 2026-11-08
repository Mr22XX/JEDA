//! Uji "held-out": pesan yang ditulis SETELAH aturan dikunci dan TIDAK dipakai untuk menyetel aturan.
//! Ini perkiraan yang lebih jujur daripada korpus utama. Hasilnya dilaporkan, bukan dijadikan syarat lulus.
//! Jalankan:  cargo test --test heldout -- --ignored --nocapture
//! Catatan: begitu aturan disetel memakai pesan di sini, set ini tidak lagi held-out dan harus diganti dengan yang baru.
use jeda_engine::analyze_text;
fn rank(l: &str) -> u8 { match l { "tidak_ditemukan" => 0, "ringan" => 1, "sedang" => 2, _ => 3 } }

const SCAM_EN: &[&str] = &[
    "Hello dear, I am a widow with $4.5 million I want to donate. Please send your bank details so I can transfer the funds to you.",
    "Your Amazon order was flagged. To cancel the charge of $899, call our support line immediately and have your card ready.",
    "Hi, I saw your resume online. We're offering $40 an hour for remote data entry. Reply with your email and phone number to begin.",
    "Your Facebook page violates our policy and will be deleted in 24 hours. Appeal here: http://fb-appeal-center.top",
    "I'm your cousin Mike. I got arrested and need bail money right now. Please wire $1,500 and don't tell my parents.",
    "Invest $500 today and receive $5,000 in two weeks. Our members earn 50% weekly profit with zero risk.",
    "Your Social Security number has been suspended due to suspicious activity. Call this number to verify your identity.",
    "Congratulations, your email won the international lottery! To claim $1 million, send a processing fee of $200.",
    "We could not process your toll payment. Pay the outstanding balance now to avoid a late fee: https://toll-pay-online.xyz",
    "Please purchase 4 Steam gift cards and message me the codes. I'm in a meeting and can't talk.",
];
const LEGIT_EN: &[&str] = &[
    "Your table for 4 is confirmed at 7:30 pm on Saturday. Reply C to cancel.",
    "Hi, this is Dr. Lee's office reminding you of your appointment tomorrow at 9. Please arrive 10 minutes early.",
    "Your flight BA245 is boarding at gate 12. Have a pleasant trip.",
    "We've received your application and will be in touch within two weeks. Thank you for your interest.",
    "Your monthly statement is ready. Log in to the app to view it. We'll never ask for your password.",
    "Can you send me the slides when you get a chance? No rush.",
];
const SCAM_ID: &[&str] = &[
    "Selamat siang, saya petugas Bea Cukai. Paket kiriman luar negeri Anda tertahan, mohon bayar biaya denda 1,2 juta agar bisa dikirim.",
    "Mama, ini Dika. HP-ku rusak jadi pakai nomor ini dulu. Bisa tolong beliin pulsa dan transfer 1 juta? Penting banget.",
    "Saldo DANA Anda akan kedaluwarsa. Perbarui data di https://dana-update.click sebelum jam 12 malam ini.",
    "Lowongan CS online, gaji 4 juta per bulan, kerja dari rumah, tidak perlu pengalaman. Kirim fotokopi KTP dan nomor rekening untuk mendaftar.",
    "Kami dari Polda, nama Anda tercantum sebagai saksi kasus pencucian uang. Segera hubungi penyidik kami di nomor ini, jangan beri tahu siapa pun.",
    "Trading kripto sinyal VIP, profit 20% per minggu pasti, setor modal 1 juta, kuota tinggal 5 orang.",
    "Anda memenangkan hadiah umrah dari bank. Kirim kode OTP yang masuk ke HP untuk verifikasi pemenang.",
    "Pinjaman online cair cepat tanpa BI checking, plafon 15 juta. Unduh aplikasinya di http://pinjam-kilat.example/app.apk",
    "Akun Instagram Anda melanggar kebijakan dan akan dihapus. Ajukan banding di tautan ini: https://ig-banding.top",
    "Mohon bantu transfer 500 ribu dulu ke rekening ini, saya lagi di luar kota dan dompet hilang. Jangan bilang siapa-siapa ya.",
];
const LEGIT_ID: &[&str] = &[
    "Rapat evaluasi diundur jadi hari Kamis pukul 10.00 di ruang rapat lantai 2.",
    "Paket Anda sudah sampai di loket pengambilan. Tunjukkan kode QR di aplikasi untuk mengambilnya.",
    "Transaksi QRIS Rp25.000 di Warung Bu Sari berhasil. Terima kasih.",
    "Tolong kirim file laporan ke email saya ya sebelum jam 5 sore.",
    "Kami tidak pernah meminta PIN atau OTP Anda melalui telepon, SMS, maupun WhatsApp.",
    "Jadwal vaksin anak Anda hari Sabtu pukul 9 di puskesmas. Bawa buku KIA.",
];

fn run(name: &str, scam: &[&str], legit: &[&str]) {
    let (mut hit, mut ok) = (0, 0);
    println!("\n--- {name}: pesan penipuan (harus >= sedang) ---");
    for t in scam {
        let a = analyze_text(t);
        let good = rank(a.level) >= 2; if good { hit += 1 }
        println!("{} skor {:>2} {:<16} {:?} | {}", if good { "OK  " } else { "MISS" }, a.score, a.level, a.findings.iter().map(|f| f.rule_id.as_str()).collect::<Vec<_>>(), &t[..t.char_indices().nth(58).map(|(i, _)| i).unwrap_or(t.len())]);
    }
    println!("--- {name}: pesan sah (harus <= ringan) ---");
    for t in legit {
        let a = analyze_text(t);
        let good = rank(a.level) <= 1; if good { ok += 1 }
        println!("{} skor {:>2} {:<16} {:?} | {}", if good { "OK   " } else { "SALAH" }, a.score, a.level, a.findings.iter().map(|f| f.rule_id.as_str()).collect::<Vec<_>>(), &t[..t.char_indices().nth(58).map(|(i, _)| i).unwrap_or(t.len())]);
    }
    println!("HELD-OUT {name}: penipuan {hit}/{} | sah {ok}/{}", scam.len(), legit.len());
}

#[test]
#[ignore = "laporan, bukan syarat lulus"]
fn heldout() {
    run("INGGRIS", SCAM_EN, LEGIT_EN);
    run("INDONESIA", SCAM_ID, LEGIT_ID);
}