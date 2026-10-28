export type Situation = { id: string; title: string; desc: string; now: string[]; after: string[]; channels: string[]; warn: string };

export const SITUATIONS: Situation[] = [
  {
    id: "transfer", title: "Saya sudah transfer uang", desc: "Ke rekening atau e-wallet orang yang ternyata mencurigakan.",
    now: [
      "Hubungi bank atau e-wallet kamu lewat call center resmi (cari nomornya di aplikasi atau kartu, bukan dari chat), lalu minta transaksi ditunda atau rekening tujuan diblokir.",
      "Laporkan ke IASC di iasc.ojk.go.id secepatnya agar transaksi bisa ditunda atau dana diblokir.",
      "Berhenti membalas pelaku. Jangan transfer lagi, termasuk untuk \"biaya pengembalian dana\".",
    ],
    after: [
      "Simpan bukti: tangkapan layar chat, bukti transfer, nomor rekening, dan nomor telepon pelaku.",
      "Laporkan rekening tujuan di cekrekening.id dan nomor telepon di aduannomor.id.",
      "Buat laporan polisi lewat patrolisiber.id atau kantor polisi terdekat, dengan bukti yang sudah disimpan.",
      "Peringatkan teman dan keluarga supaya tidak jadi korban berikutnya.",
    ],
    channels: ["iasc", "kontak157", "cekrekening", "aduannomor", "patrolisiber"],
    warn: "Waspada! Aku hampir/baru saja jadi korban penipuan: diminta transfer duluan untuk sesuatu yang tidak jelas. Kalau ada yang minta uang lewat chat, cek dulu lewat telepon atau kanal resmi, jangan terburu-buru transfer.",
  },
  {
    id: "otp", title: "Saya sudah kirim OTP, PIN, atau password", desc: "Kode verifikasi atau data login sudah terlanjur diberikan.",
    now: [
      "Ganti password dan PIN akun yang terkait (bank, e-wallet, email) dari aplikasi resmi, sebaiknya di perangkat yang kamu yakini aman.",
      "Hubungi call center resmi bank atau e-wallet untuk memblokir sementara kartu atau akun.",
      "Cek mutasi dan riwayat transaksi. Kalau ada dana keluar yang bukan darimu, laporkan ke IASC sekarang.",
    ],
    after: [
      "Aktifkan verifikasi dua langkah di akun-akun penting.",
      "Keluarkan perangkat asing dari daftar perangkat yang sedang login di akunmu.",
      "Ganti password yang sama di akun lain.",
      "Simpan bukti percakapan dan laporkan nomor pelaku di aduannomor.id.",
    ],
    channels: ["iasc", "kontak157", "aduannomor"],
    warn: "Waspada! Ada modus minta kode OTP atau PIN lewat chat dan telepon. Pihak resmi tidak pernah memintanya. Kalau ada yang meminta, hentikan dan hubungi kanal resmi sendiri.",
  },
  {
    id: "apk", title: "Saya klik tautan atau pasang file APK", desc: "Dari pesan yang ternyata mencurigakan (resi, undangan, tagihan).",
    now: [
      "Matikan data seluler dan Wi-Fi (atau aktifkan mode pesawat) agar aplikasi tidak terus berkomunikasi.",
      "Hapus aplikasi yang baru dipasang dari file APK. Kalau tidak bisa dihapus, cabut izin administrator perangkat lebih dulu di pengaturan.",
      "Dari perangkat lain yang aman, ganti password email dan akun penting, lalu hubungi call center resmi bank untuk memblokir akses mobile banking.",
    ],
    after: [
      "Cek mutasi rekening dan e-wallet. Kalau ada transaksi yang tidak kamu lakukan, laporkan ke IASC.",
      "Pertimbangkan reset pabrik setelah mencadangkan foto dan kontak, bila ragu perangkat sudah bersih.",
      "Laporkan nomor pengirim di aduannomor.id.",
      "Peringatkan kontak yang mungkin menerima pesan serupa dari nomormu.",
    ],
    channels: ["iasc", "kontak157", "aduannomor", "patrolisiber"],
    warn: "Waspada! Ada pesan berkedok resi paket atau undangan yang mengajak memasang file .apk. Jangan dipasang. Cek status paket lewat aplikasi atau situs resmi ekspedisi.",
  },
  {
    id: "ancaman", title: "Saya diancam atau data saya akan disebar", desc: "Misalnya penagihan pinjol ilegal atau pemerasan lewat foto dan kontak.",
    now: [
      "Jangan membayar dan jangan menuruti ancaman. Pemerasan sering berlanjut setelah korban membayar.",
      "Berhenti membalas dan simpan bukti: tangkapan layar ancaman, nomor, akun, dan waktu kejadian.",
      "Ceritakan ke orang yang kamu percaya. Kamu tidak perlu menanggungnya sendirian.",
    ],
    after: [
      "Atur akun media sosial ke privat dan beri tahu kontak dekat agar mengabaikan pesan dari pelaku.",
      "Kalau berasal dari pinjaman online, laporkan yang ilegal lewat sipasti.ojk.go.id atau Kontak OJK 157.",
      "Laporkan ancaman ke polisi lewat patrolisiber.id atau kantor polisi terdekat.",
    ],
    channels: ["sipasti", "kontak157", "patrolisiber"],
    warn: "Waspada! Ada penagihan dan ancaman penyebaran data dari pinjol ilegal dan pemeras. Jangan bayar atau panik, simpan bukti, dan laporkan ke OJK atau polisi.",
  },
];