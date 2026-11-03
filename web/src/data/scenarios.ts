export type Choice = { text: string; next: string; good: boolean; feedback: string; tactics?: string[] };
export type Node = { messages: string[]; choices?: Choice[]; end?: { good: boolean; title: string; summary: string } };
export type Scenario = { id: string; title: string; persona: string; contact: string; audience?: string; fact: string; factUrl: string; start: string; nodes: Record<string, Node> };

// Semua nama, nomor, dan tautan di bawah ini fiktif.
export const SCENARIOS: Scenario[] = [
  {
    id: "loker", title: "Tawaran kerja yang terlalu bagus", persona: "Kamu mahasiswa yang lagi cari kerja sampingan.", contact: "Admin Karya Digital",
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
    id: "kurir", title: "Paket yang tidak kamu ingat", persona: "Kamu baru belanja online minggu lalu.", contact: "Kurir Ekspedisi",
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
    id: "teman", title: "Teman yang tiba-tiba minta transfer", persona: "Kamu dapat pesan dari nomor yang tidak tersimpan.", contact: "Rani (nomor baru)",
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
  {
    id: "pinjol", title: "Pinjaman cair 10 menit", persona: "Kamu butuh uang cepat untuk bayar kos dan tidak punya banyak pilihan.", contact: "PinjamCepat Nusa",
    fact: "Antara Januari dan Juni 2026, OJK menerima 19.169 pengaduan pinjaman online ilegal dan 2.878 pengaduan investasi ilegal.",
    factUrl: "https://keuangan.kontan.co.id/news/satgas-pasti-hentikan-951-pinjol-ilegal-dan-238-investasi-ilegal-per-juni-2026",
    start: "n1",
    nodes: {
      n1: { messages: ["Butuh dana cepat? Pinjaman cair 10 menit, tanpa BI checking, tanpa jaminan, langsung masuk rekening.", "Unduh aplikasi PinjamCepat Nusa di sini: https://pinjam-cepat.example/app.apk"], choices: [
        { text: "Unduh aplikasinya, lagi butuh banget", next: "n2", good: false, tactics: ["IMING-IMING", "TAUTAN MENCURIGAKAN"], feedback: "Janji cair cepat tanpa pengecekan adalah umpan yang sering dipakai pinjol ilegal, dan aplikasinya dibagikan lewat file di luar toko aplikasi resmi. Wajar kalau kamu tergoda saat sedang butuh uang. Justru di saat itulah paling mudah terpancing." },
        { text: "Cek dulu apakah penyedianya berizin OJK lewat Kontak OJK 157", next: "e_good", good: true, tactics: ["IMING-IMING"], feedback: "Tepat. Pastikan penyedia pinjaman berizin dan diawasi OJK sebelum meminjam. Kamu bisa menanyakannya ke Kontak OJK 157." },
      ] },
      n2: { messages: ["Aplikasi meminta izin akses kontak, galeri foto, dan lokasi agar pinjamanmu disetujui."], choices: [
        { text: "Izinkan semua, biar cepat disetujui", next: "n3", good: false, tactics: ["DATA RAHASIA"], feedback: "Akses ke kontak dan foto sering dipakai untuk menekan peminjam saat penagihan. Izin sebesar itu biasanya tidak diperlukan untuk meminjam uang." },
        { text: "Tolak izin berlebihan dan hapus aplikasinya", next: "e_good", good: true, tactics: ["DATA RAHASIA"], feedback: "Tepat. Izin yang tidak masuk akal untuk fungsi aplikasi adalah tanda untuk berhenti." },
      ] },
      n3: { messages: ["Pengajuan Rp1.000.000 disetujui, dana yang masuk Rp700.000. Jatuh tempo 7 hari.", "Hari ke-8: Kamu menunggak! Bayar sekarang atau kami sebarkan fotomu dan hubungi seluruh kontak di HP-mu."], choices: [
        { text: "Pinjam di aplikasi lain untuk melunasi", next: "e_bad", good: false, tactics: ["RASA TAKUT"], feedback: "Menutup pinjaman dengan pinjaman baru memperbesar masalah dan memberi akses ke lebih banyak aplikasi sejenis." },
        { text: "Tetap tenang, simpan bukti ancaman, ceritakan ke orang tepercaya, lalu lapor ke OJK", next: "e_good2", good: true, tactics: ["RASA TAKUT"], feedback: "Tepat. Ancaman menyebarkan data adalah pemerasan. Simpan tangkapan layarnya dan laporkan ke sipasti.ojk.go.id, Kontak OJK 157, atau polisi." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu berhenti di awal", summary: "Memeriksa izin dan menolak izin berlebihan melindungi uang dan datamu. Pinjol ilegal bisa dilaporkan di sipasti.ojk.go.id." } },
      e_good2: { messages: [], end: { good: true, title: "Kamu tidak menuruti ancaman", summary: "Menyimpan bukti dan melapor adalah langkah yang tepat. Buka Langkah darurat untuk urutan lengkapnya." } },
      e_bad: { messages: [], end: { good: false, title: "Kamu masuk lingkaran pinjaman", summary: "Kalau ini nyata, jangan menambah pinjaman baru untuk menutup yang lama. Hubungi Kontak OJK 157 dan buka Langkah darurat." } },
    },
  },
  {
    id: "investasi", title: "Ajakan investasi dari teman lama", persona: "Kamu orang tua yang baru pensiun dan ingin tabunganmu berkembang.", contact: "Bu Ratna", audience: "Sudut pandang orang tua",
    fact: "Antara Januari dan Juni 2026, OJK menerima 2.878 pengaduan investasi ilegal, selain 19.169 pengaduan pinjol ilegal.",
    factUrl: "https://keuangan.kontan.co.id/news/satgas-pasti-hentikan-951-pinjol-ilegal-dan-238-investasi-ilegal-per-juni-2026",
    start: "n1",
    nodes: {
      n1: { messages: ["Bu, ini Bu Ratna, teman arisan dulu. Ikut grup investasi kami yuk. Modal Rp5 juta, untung 10% per bulan, pasti cair. Banyak ibu-ibu sudah berhasil.", "Katanya diawasi OJK juga lho."], choices: [
        { text: "Wah menarik, gimana caranya ikut?", next: "n2", good: false, tactics: ["IMING-IMING", "OTORITAS PALSU", "KEDEKATAN PALSU"], feedback: "Untung tinggi yang dijanjikan pasti, klaim diawasi OJK, dan ajakan dari kenalan adalah kombinasi yang sering muncul pada penawaran investasi ilegal. OJK mengimbau waspada pada imbal hasil tinggi yang tidak masuk akal." },
        { text: "Terima kasih, saya cek dulu izinnya ke Kontak OJK 157 dan tanya anak saya", next: "n3", good: true, tactics: ["OTORITAS PALSU"], feedback: "Tepat. Klaim diawasi OJK harus kamu cek sendiri, bukan dari pengakuan di chat." },
      ] },
      n2: { messages: ["Gampang, Bu. Transfer ke rekening atas nama pribadi saya dulu, nanti ibu lihat untung hariannya di aplikasi kami.", "Tinggal 3 slot untuk gelombang ini."], choices: [
        { text: "Transfer Rp1 juta dulu untuk mencoba", next: "n4", good: false, tactics: ["BIAYA DI MUKA", "URGENSI"], feedback: "Menyetor ke rekening pribadi dan tekanan slot adalah tanda bahaya. Mencoba dengan nominal kecil terasa aman, padahal sering menjadi tahap awal." },
        { text: "Saya cek izin dan legalitasnya dulu", next: "n3", good: true, tactics: ["URGENSI"], feedback: "Tepat. Menunda memberimu waktu memeriksa. Penipu justru butuh kamu memutuskan cepat." },
      ] },
      n3: { messages: ["Ibu terlalu banyak mikir. Besok gelombang ditutup, yang ragu nanti menyesal.", "Kalau ibu ajak 3 teman ikut, ibu dapat bonus."], choices: [
        { text: "Saya tetap cek ke Kontak OJK 157 dan sipasti.ojk.go.id, tidak ikut dulu", next: "e_good", good: true, tactics: ["URGENSI", "IMING-IMING"], feedback: "Tepat. Bonus karena mengajak teman dan batas waktu sering menjadi ciri skema yang bergantung pada anggota baru." },
        { text: "Ya sudah, ikut supaya tidak ketinggalan", next: "e_bad", good: false, tactics: ["URGENSI"], feedback: "Takut ketinggalan adalah perasaan yang sengaja dimainkan. Keputusan soal tabungan layak diambil dengan tenang." },
      ] },
      n4: { messages: ["Untung Rp100.000 sudah masuk, Bu! Terbukti kan? Tambah modal Rp20 juta, untungnya berlipat. Ajak keluarga supaya dapat bonus."], choices: [
        { text: "Terbukti! Saya tambah modal dan ajak keluarga", next: "e_bad2", good: false, tactics: ["IMING-IMING", "KEDEKATAN PALSU"], feedback: "Pembayaran kecil di awal sering dipakai untuk membangun kepercayaan sebelum korban menyetor jumlah besar. Itu bukan bukti usahanya nyata." },
        { text: "Cukup. Saya hentikan dan bicarakan dengan anak sebelum menyetor lagi", next: "e_good2", good: true, tactics: ["IMING-IMING"], feedback: "Tepat. Berhenti dan meminta pendapat orang tepercaya adalah langkah yang melindungimu." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu memeriksa sebelum menyetor", summary: "Dengan mengecek izin dan menunda keputusan, kamu menghindari risiko kehilangan tabungan. Tawaran mencurigakan bisa dilaporkan di sipasti.ojk.go.id atau Kontak OJK 157." } },
      e_good2: { messages: [], end: { good: true, title: "Kamu berhenti sebelum rugi lebih besar", summary: "Berhenti setelah setoran kecil menyelamatkan sisa tabunganmu. Kalau sudah ada uang yang masuk, buka Langkah darurat dan laporkan ke OJK." } },
      e_bad: { messages: [], end: { good: false, title: "Kamu hampir ikut karena takut ketinggalan", summary: "Kalau ini nyata, jangan menyetor dulu. Cek izin lewat Kontak OJK 157 dan bicarakan dengan keluarga." } },
      e_bad2: { messages: [], end: { good: false, title: "Setoran besar masuk ke skema yang meragukan", summary: "Kalau ini nyata, segera hubungi bank untuk meminta penundaan, laporkan ke IASC, dan beri tahu keluarga. Ini bukan salahmu: skema seperti ini memang dirancang meyakinkan." } },
    },
  },
  {
    id: "lovescam", title: "Teman baru yang terasa pas banget", persona: "Kamu baru kenal seseorang lewat media sosial dua minggu lalu.", contact: "Daniel",
    fact: "OJK mencantumkan love scam sebagai salah satu modus penipuan yang memanfaatkan rasa kesepian korban.",
    factUrl: "https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Documents/Pages/Satgas-PASTI-Blokir-507-Aktivitas-dan-Entitas-Keuangan-Ilegal-Minta-Masyarakat-Waspadai-Penipuan-yang-Semakin-Marak/Satgas%20PASTI%20Blokir%20507%20Aktivitas%20dan%20Entitas%20Keuangan%20Ilegal%20Minta%20Masyarakat%20Waspadai%20Penipuan%20yang%20Semakin%20Marak.pdf",
    start: "n1",
    nodes: {
      n1: { messages: ["Aku nggak pernah ngerasa senyambung ini sama siapa pun. Rasanya kita memang ditakdirkan ketemu.", "Maaf ya aku belum bisa video call, sinyal di tempat kerjaku di luar negeri jelek banget."], choices: [
        { text: "Aku juga ngerasa gitu. Aku percaya sama kamu", next: "n2", good: false, tactics: ["KEDEKATAN PALSU"], feedback: "Wajar kalau kamu merasa dekat. Pelaku love scam memang ahli membangun kedekatan dengan cepat. Alasan yang terus berulang untuk tidak bisa video call adalah tanda yang perlu diperhatikan." },
        { text: "Aku senang ngobrol sama kamu, tapi aku mau video call dulu sebelum lebih dekat", next: "n3", good: true, tactics: ["KEDEKATAN PALSU"], feedback: "Langkah yang sehat. Orang yang tulus akan mengerti kamu ingin memastikan." },
      ] },
      n2: { messages: ["Sayang, aku butuh bantuan. Dompet dan pasporku dicuri, aku nggak bisa pulang.", "Bisa transfer Rp5 juta dulu? Aku ganti begitu sampai. Jangan cerita ke keluargamu dulu ya, mereka belum tentu paham."], choices: [
        { text: "Aku transfer sekarang", next: "e_bad", good: false, tactics: ["BIAYA DI MUKA", "ISOLASI", "URGENSI"], feedback: "Permintaan uang mendesak dari orang yang belum pernah ditemui, ditambah permintaan merahasiakannya dari keluarga, adalah pola khas love scam." },
        { text: "Aku nggak bisa kirim uang ke orang yang belum pernah kutemui", next: "n3", good: true, tactics: ["BIAYA DI MUKA"], feedback: "Tepat. Batas yang jelas melindungimu, meski rasanya berat." },
      ] },
      n3: { messages: ["Kalau kamu benar-benar sayang aku, kamu pasti percaya. Jangan bikin aku kecewa ya."], choices: [
        { text: "Aku cerita ke sahabatku dan cek foto profilnya dengan pencarian gambar terbalik", next: "e_good", good: true, tactics: ["ISOLASI", "KEDEKATAN PALSU"], feedback: "Tepat. Pelaku ingin kamu menyimpannya sendiri. Pendapat kedua dan pengecekan foto sering cukup untuk membongkarnya." },
        { text: "Maaf, aku transfer", next: "e_bad2", good: false, tactics: ["KEDEKATAN PALSU", "RASA TAKUT"], feedback: "Rasa bersalah dan takut kehilangan sengaja dimainkan di sini. Perasaanmu nyata, tapi tekanan itu bagian dari cara pelaku bekerja." },
      ] },
      e_good: { messages: [], end: { good: true, title: "Kamu menjaga jarak yang aman", summary: "Kamu meminta bukti nyata, menolak transfer, dan melibatkan orang tepercaya. Akun semacam ini bisa kamu laporkan ke platform tempat kalian berkenalan." } },
      e_bad: { messages: [], end: { good: false, title: "Uang sudah terkirim", summary: "Ini bukan salahmu: pelaku love scam memang mahir membangun kedekatan. Kalau ini nyata, buka Langkah darurat dan laporkan ke IASC secepatnya." } },
      e_bad2: { messages: [], end: { good: false, title: "Kamu menuruti tekanan emosional", summary: "Ini bukan salahmu. Kalau ini nyata, buka Langkah darurat dan laporkan ke IASC secepatnya." } },
    },
  },
];