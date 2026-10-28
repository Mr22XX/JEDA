export type Choice = { text: string; next: string; good: boolean; feedback: string; tactics?: string[] };
export type Node = { messages: string[]; choices?: Choice[]; end?: { good: boolean; title: string; summary: string } };
export type Scenario = { id: string; title: string; persona: string; fact: string; factUrl: string; start: string; nodes: Record<string, Node> };

// Semua nama, nomor, dan tautan di bawah ini fiktif.
export const SCENARIOS: Scenario[] = [
  {
    id: "loker", title: "Tawaran kerja yang terlalu bagus", persona: "Kamu mahasiswa yang lagi cari kerja sampingan.",
    fact: "Penipuan lowongan kerja tercatat 23.469 laporan di IASC (data Januari 2026), termasuk modus yang paling banyak dilaporkan.",
    factUrl: "https://keuangan.kontan.co.id/news/hingga-14-januari-2026-kerugian-masyarakat-akibat-penipuan-scam-rp-91-triliun",
    start: "n1",
    nodes: {
      n1: { messages: ["Halo kak, kami dari Karya Digital Nusantara. CV kakak lolos untuk posisi Admin Input Data, kerja dari HP, gaji Rp3 juta per minggu. Tanpa pengalaman.", "Mau lanjut ke tahap berikutnya?"], choices: [
        { text: "Mau banget! Gimana prosedurnya?", next: "n2", good: false, tactics: ["IMING-IMING"], feedback: "Kamu belum pernah melamar ke sini, tapi sudah dikabari lolos. Gaji besar tanpa syarat adalah umpan klasik. Belum tentu penipuan, tapi cukup alasan untuk bertanya dulu." },
        { text: "Saya tidak merasa melamar ke sini. Dapat kontak saya dari mana?", next: "n3", good: true, tactics: ["IMING-IMING"], feedback: "Pertanyaan bagus. Perekrut asli bisa menjelaskan asal data kamu dan biasanya memakai email perusahaan." },
      ] },
      n2: { messages: ["Mudah kak. Transfer Rp150.000 untuk biaya registrasi dan seragam digital, nanti dikembalikan bersama gaji pertama.", "Slot tinggal 3 orang dan hari ini terakhir ya kak."], choices: [
        { text: "Oke, saya transfer sekarang", next: "e_bad", good: false, tactics: ["BIAYA DI MUKA", "URGENSI"], feedback: "Diminta membayar sebelum bekerja, plus tekanan slot dan batas waktu. Perusahaan resmi umumnya tidak memungut biaya dari pelamar." },
        { text: "Saya cek dulu perusahaannya, nanti saya kabari", next: "n3", good: true, tactics: ["URGENSI"], feedback: "Menunda adalah senjata terkuat. Penipu butuh kamu memutuskan cepat." },
      ] },
      n3: { messages: ["Kalau banyak tanya, slotnya kami berikan ke orang lain ya kak.", "Komunikasi hanya lewat WhatsApp ini, jangan bilang ke siapa-siapa dulu sampai kontrak resmi."], choices: [
        { text: "Saya blokir dan laporkan nomor ini", next: "e_good", good: true, tactics: ["ISOLASI", "URGENSI"], feedback: "Tepat. Ancaman kehilangan slot dan permintaan merahasiakan adalah dua tanda bahaya sekaligus." },
        { text: "Ya sudah, saya ikuti saja", next: "e_bad2", good: false, tactics: ["ISOLASI"], feedback: "Diminta merahasiakan membuat kamu jauh dari orang yang bisa menyadarkan. Itu tujuannya." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu menghentikan penipuan ini", summary: "Kamu menunda, bertanya, dan memutus kontak sebelum kehilangan apa pun. Nomor pengirim bisa dilaporkan ke aduannomor.id." } },
      e_bad: { messages: [], end: { good: false, title: "Kamu sudah mengirim uang", summary: "Kalau ini nyata, buka Langkah darurat sekarang: hubungi bank, laporkan ke IASC, dan simpan bukti. Semakin cepat melapor, semakin besar kesempatan transaksi ditunda atau dana diblokir." } },
      e_bad2: { messages: [], end: { good: false, title: "Kamu terus mengikuti arahan penipu", summary: "Saat ada yang meminta rahasia, ceritakan ke orang yang kamu percaya. Satu pendapat kedua sering cukup untuk membongkar penipuan." } },
    },
  },
  {
    id: "kurir", title: "Paket yang tidak kamu ingat", persona: "Kamu baru belanja online minggu lalu.",
    fact: "OJK mencatat penipuan APK lewat WhatsApp sebagai salah satu modus penipuan keuangan yang perlu diwaspadai.",
    factUrl: "https://brida.bulelengkab.go.id/informasi/download/67_pengenalan-ojk-dan-waspada-pinjaman-online-serta-bijak-atur-keuangan_2026-04-30-15-44-53.pdf",
    start: "n1",
    nodes: {
      n1: { messages: ["Selamat siang, ini kurir ekspedisi. Paket Anda gagal terkirim karena alamat kurang lengkap.", "Unduh aplikasi Resi_Paket.apk di tautan ini untuk lihat resi dan perbarui alamat: https://resi-paket.example/resi.apk"], choices: [
        { text: "Unduh dan pasang aplikasinya", next: "e_bad", good: false, tactics: ["OTORITAS PALSU", "TAUTAN MENCURIGAKAN"], feedback: "File berakhiran .apk dari tautan chat tidak lewat toko aplikasi resmi. Aplikasi seperti ini bisa membaca SMS dan membuka akses ke akunmu." },
        { text: "Cek status paket di aplikasi atau situs resmi ekspedisi", next: "e_good", good: true, tactics: ["OTORITAS PALSU"], feedback: "Tepat. Cari kanal resmi sendiri, jangan lewat tautan dari pesan." },
        { text: "Balas: paket apa ya? Saya tidak ingat belanja", next: "n2", good: false, tactics: ["OTORITAS PALSU"], feedback: "Membalas belum berbahaya, tapi menandakan nomormu aktif dan membuka percakapan lebih jauh." },
      ] },
      n2: { messages: ["Paketnya titipan dari toko online kak. Agar bisa dikirim ulang, sebutkan kode 6 digit yang baru masuk ke HP Anda untuk verifikasi."], choices: [
        { text: "Sebutkan kodenya", next: "e_bad2", good: false, tactics: ["DATA RAHASIA"], feedback: "Kode OTP itu kunci akunmu. Pihak resmi tidak meminta kode lewat chat." },
        { text: "Tidak. Saya blokir nomor ini", next: "e_good", good: true, tactics: ["DATA RAHASIA"], feedback: "Tepat. Permintaan kode verifikasi oleh orang lain adalah tanda bahaya besar." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu tidak terpancing", summary: "Kamu memverifikasi lewat kanal resmi dan tidak menyerahkan apa pun. Laporkan nomor pengirim di aduannomor.id supaya orang lain terbantu." } },
      e_bad: { messages: [], end: { good: false, title: "Aplikasi mencurigakan terpasang", summary: "Kalau ini nyata: putuskan internet, hapus aplikasinya, ganti password dari perangkat lain, lalu buka Langkah darurat." } },
      e_bad2: { messages: [], end: { good: false, title: "Kamu menyerahkan kode OTP", summary: "Kalau ini nyata: ganti password dan PIN, hubungi call center resmi bank untuk memblokir akses, lalu buka Langkah darurat." } },
    },
  },
  {
    id: "teman", title: "Teman yang tiba-tiba minta transfer", persona: "Kamu dapat pesan dari nomor yang tidak tersimpan.",
    fact: "Penipuan lewat media sosial tercatat 19.983 laporan di IASC (data Januari 2026).",
    factUrl: "https://keuangan.kontan.co.id/news/hingga-14-januari-2026-kerugian-masyarakat-akibat-penipuan-scam-rp-91-triliun",
    start: "n1",
    nodes: {
      n1: { messages: ["Ini aku Rani, nomor baru ya. HP lama rusak.", "Tolong transfer dulu Rp750.000 buat bayar tagihan, darurat banget. Nanti sore aku ganti."], choices: [
        { text: "Oke, aku transfer sekarang", next: "e_bad", good: false, tactics: ["KEDEKATAN PALSU", "BIAYA DI MUKA"], feedback: "Nomor baru, minta uang, dan mendesak. Itu pola umum akun yang menyamar sebagai teman." },
        { text: "Aku telepon Rani lewat nomor lamanya dulu", next: "e_good", good: true, tactics: ["KEDEKATAN PALSU"], feedback: "Tepat. Konfirmasi lewat jalur yang sudah kamu kenal, bukan lewat nomor baru itu." },
        { text: "Boleh video call dulu?", next: "n2", good: true, tactics: ["KEDEKATAN PALSU"], feedback: "Langkah verifikasi yang baik. Lihat bagaimana ia merespons." },
      ] },
      n2: { messages: ["Duh nggak bisa, kamera juga rusak. Pokoknya tolong cepat ya, jangan bilang siapa-siapa, aku malu."], choices: [
        { text: "Oke, aku transfer", next: "e_bad2", good: false, tactics: ["ISOLASI", "URGENSI"], feedback: "Menolak video call, mendesak, dan meminta rahasia. Tiga tanda bahaya dalam satu pesan." },
        { text: "Aku hentikan dan hubungi Rani lewat nomor lama", next: "e_good", good: true, tactics: ["ISOLASI"], feedback: "Tepat. Teman asli akan paham kamu ingin memastikan dulu." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu memastikan dulu", summary: "Satu telepon ke nomor lama cukup untuk membongkar penyamaran ini. Kabari teman aslinya bahwa nomornya dipakai orang lain." } },
      e_bad: { messages: [], end: { good: false, title: "Kamu sudah mentransfer uang", summary: "Kalau ini nyata, buka Langkah darurat sekarang dan laporkan secepatnya ke IASC." } },
      e_bad2: { messages: [], end: { good: false, title: "Kamu menuruti tekanan", summary: "Kalau ini nyata, buka Langkah darurat sekarang dan laporkan secepatnya ke IASC." } },
    },
  },
];