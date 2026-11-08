# Dasar Penyusunan JEDA

Dokumen ini menjelaskan **dari mana** aturan deteksi, label taktik, bobot, skenario Latihan, dan langkah darurat berasal, serta **seberapa kuat** dasar masing-masing. Tujuannya agar setiap keputusan desain bisa dipertanggungjawabkan di dokumentasi dan sesi tanya jawab.

> **Prinsip penulisan:** setiap bagian dibedakan menjadi (a) *bersumber*, yaitu ada rujukan yang bisa dicek; (b) *interpretasi penyusun*, yaitu penilaian kami yang dijelaskan alasannya; dan (c) *belum divalidasi*. Jangan menyajikan (b) atau (c) sebagai fakta.

---

## 1. Ringkasan metode

| Komponen | Dasar utama | Status |
|---|---|---|
| Label taktik (8 jenis) | Kajian psikologi penipuan (Stajano dan Wilson, 2011; Cialdini) | Sebagian bersumber, sebagian interpretasi (lihat tabel bagian 2) |
| Aturan dan pola kata (63: 28 Indonesia, 35 Inggris) | Modus yang dilaporkan OJK/IASC dan pola umum penipuan berbahasa Inggris, ditulis penyusun | Interpretasi penyusun. Pada pesan baru yang tidak dipakai menyetel aturan, sekitar separuh penipuan terdeteksi (bagian 6) |
| Bobot 1 sampai 5 dan ambang tingkat | Tiga kriteria penilaian penyusun, dengan preseden skor aditif pada filter spam | Interpretasi penyusun, **belum dikalibrasi dengan data nyata** |
| Skenario Latihan (6) | Modus yang paling banyak dilaporkan ke IASC dan daftar modus OJK | Bersumber untuk pemilihan topik, interpretasi untuk isi dialog |
| Langkah darurat | Kanal dan imbauan resmi OJK, Komdigi, Polri | Bersumber untuk kanal, praktik umum untuk langkah keamanan akun |

---

## 2. Dasar label taktik

### Kerangka rujukan

- **Stajano dan Wilson (2011)** menganalisis ratusan penipuan yang direkonstruksi dalam acara BBC *The Real Hustle* dan merumuskan **tujuh prinsip** yang dieksploitasi penipu: *Distraction*, *Social Compliance* (otoritas), *Herd*, *Dishonesty*, *Kindness*, *Need and Greed*, dan *Time*. Mereka juga mencatat bahwa satu penipuan umumnya memakai beberapa prinsip sekaligus.
- Penulis yang sama mencatat kemiripan prinsip itu dengan **prinsip pengaruh Cialdini** (misalnya otoritas, kelangkaan, kesukaan) yang diamati pada tenaga penjual.

### Pemetaan label JEDA

| Label JEDA | Jenis label | Rujukan | Kekuatan dasar |
|---|---|---|---|
| **Urgensi** | Pengungkit psikologis | Stajano dan Wilson: *Time*. Cialdini: kelangkaan | Langsung |
| **Otoritas palsu** | Pengungkit psikologis | Stajano dan Wilson: *Social Compliance*. Cialdini: otoritas | Langsung |
| **Iming-iming** | Pengungkit psikologis | Stajano dan Wilson: *Need and Greed* | Langsung |
| **Kedekatan palsu** | Pengungkit psikologis | Stajano dan Wilson: *Kindness*. Cialdini: kesukaan (*liking*) | Langsung |
| **Rasa takut** | Pengungkit psikologis | Paling dekat dengan *Distraction* (emosi kuat merebut perhatian) | **Interpretasi penyusun**: kerangka rujukan tidak memuat prinsip "takut" tersendiri |
| **Isolasi** | Pengungkit psikologis | Memutus verifikasi sosial, berlawanan dengan efek *Herd* (korban mengikuti perilaku orang lain) | **Interpretasi penyusun** |
| **Data rahasia** | Tujuan penipu | Bukan prinsip psikologis: ini barang yang dicari (kode OTP, PIN, data identitas) | Pengelompokan penyusun |
| **Biaya di muka** | Mekanisme penipuan | Penipuan biaya di muka (*advance fee*) adalah kategori yang dikenal luas dan memiliki aturan khusus di filter spam | Pengelompokan penyusun |
| **Tautan mencurigakan** | Indikator teknis | Pola URL tiruan (domain meniru merek, alamat IP, file APK) | Pengamatan umum, tanpa satu rujukan tunggal |

Aturan berbahasa Inggris (E01 sampai E35) memakai **label taktik yang sama** dengan aturan Indonesia, sehingga satu taksonomi berlaku untuk dua bahasa dan rekomendasi skenario Latihan tetap bekerja.

### Hal yang perlu diakui

1. **Label JEDA mencampur tiga tingkat** (pengungkit psikologis, tujuan penipu, indikator teknis). Itu disengaja demi kegunaan edukasi: pengguna perlu tahu *mengapa* sebuah pesan berbahaya, *apa* yang diincar, dan *tanda teknis* apa yang tampak. Ini bukan taksonomi akademik yang rapi.
2. Prinsip *Herd* dan *Dishonesty* **tidak punya label sendiri**, karena sulit dikenali lewat pola kata.
3. Pemetaan "Rasa takut" dan "Isolasi" adalah interpretasi kami. Jangan menyebutnya sebagai temuan Stajano dan Wilson.

---

## 3. Dasar bobot dan ambang

### Preseden

Filter spam **SpamAssassin** memakai skor **aditif**: tiap aturan yang cocok menambah skor, dan pesan ditandai bila total melewati ambang (bawaan 5,0). Skor aturannya dihasilkan lewat *perceptron* pada korpus pesan besar (*mass-check*), dengan target kira-kira 1 salah-tuduh per 2.500 pesan sah (menurut komentar pada berkas `50_scores.cf`).

**JEDA memakai bentuk yang sama (skor aditif dengan ambang) tetapi tidak punya korpus sebesar itu.** Karena itu bobot kami ordinal (1 sampai 5), ditetapkan berdasarkan penilaian, dan **belum dikalibrasi secara statistik**.

### Tiga kriteria penetapan bobot

| Kriteria | Pertanyaan |
|---|---|
| **Spesifisitas** | Seberapa jarang pola ini muncul di pesan sah? |
| **Dampak** | Seberapa besar kerugian bila pengguna menurutinya? |
| **Risiko salah-tuduh** | Seberapa sering pesan sah memakai pola ini? |

### Skala bobot

| Bobot | Kondisi |
|---|---|
| **5** | Spesifik tinggi, dampak tinggi (akun atau uang terambil alih, pemerasan), risiko salah-tuduh rendah |
| **4** | Spesifik tinggi, dampak sedang sampai tinggi, risiko salah-tuduh rendah |
| **3** | Spesifik sedang, atau pesan sah kadang memakainya |
| **2** | Spesifik rendah, bermakna terutama bila digabung tanda lain |
| **1** | Tanda lemah |

### Contoh penerapan (penilaian penyusun)

| Aturan | Spesifisitas | Dampak | Salah-tuduh | Bobot |
|---|---|---|---|---|
| R04 meminta OTP | Tinggi | Tinggi | Rendah | **5** |
| R19 ancaman menyebar data | Tinggi | Tinggi | Rendah | **5** |
| R08 biaya administrasi di muka | Tinggi | Sedang | Rendah | **4** |
| R13 "untung pasti" | Tinggi | Sedang | Rendah | **4** |
| R12 "menang undian" | Sedang | Sedang | Sedang | **3** |
| R17 "akun diblokir" | Sedang | Sedang | Sedang | **3** |
| R01 "segera" | Rendah | Rendah | Tinggi | **2** |
| R03 "kesempatan langka" | Rendah | Rendah | Tinggi | **1** |

Tabel ini **menjelaskan alasan**, bukan rumus yang menghasilkan angka. Bobot awal ditetapkan berdasarkan pertimbangan, lalu dicek dengan korpus (bagian 6). Daftar lengkap aturan beserta alasan yang tampil ke pengguna ada di `engine/rules.json` (kolom `why`).

### Ambang tingkat kewaspadaan

| Skor | Tingkat | Alasan |
|---|---|---|
| 0 | Tidak ada tanda yang dikenali | Tidak pernah disebut "aman" |
| 1 sampai 3 | Ringan | Satu tanda lemah atau sedang |
| 4 sampai 7 | Sedang | Satu tanda kuat (bobot 4 ke atas), atau dua tanda sedang |
| 8 ke atas | Tinggi | Beberapa tanda kuat atau kombinasi taktik |

Ambang ini juga **heuristik, belum dikalibrasi**.

### Aturan tambahan dan alasannya

- **Bonus kombinasi (+2 atau +3):** kerangka rujukan mencatat bahwa satu penipuan biasanya memadukan beberapa prinsip, jadi kemunculan beberapa taktik sekaligus lebih mengkhawatirkan daripada jumlah biasa.
- **Lantai "sedang" untuk bobot 5:** satu tanda seperti permintaan OTP sudah cukup berbahaya tanpa perlu tanda lain.
- **Penyangkalan (`unless`):** kalimat seperti "jangan berikan kode OTP" tidak dihitung sebagai permintaan. Ditambahkan setelah uji korpus menemukan imbauan keamanan bank salah ditandai (bagian 6).

---

## 3b. Dasar pemeriksa tautan

Pemeriksa tautan **tidak membuka situs**. Ia membaca bentuk URL dan mencocokkannya dengan tanda-tanda yang bisa dijelaskan.

| Kelompok tanda | Contoh | Dasar |
|---|---|---|
| Struktur URL | Teks sebelum `@` hanyalah informasi pengguna, tujuan sebenarnya adalah host setelahnya | Sintaks URL pada RFC 3986 (https://www.rfc-editor.org/rfc/rfc3986) |
| Penyamaran alamat | IP tertulis heksadesimal, oktal, atau satu angka panjang; karakter terenkode (%) di host | Pengamatan umum; tidak ada satu rujukan tunggal |
| Peniruan merek | Angka atau huruf Kiril pengganti huruf, salah satu huruf, merek ditambah kata, merek sebagai subdomain atau nama situs di hosting gratis | Pengamatan umum |
| Platform hosting gratis | Subdomain bebas di `vercel.app`, `github.io`, dan sejenisnya, sehingga nama situs dikuasai pengguna | Banyak platform seperti ini terdaftar di bagian privat Public Suffix List (https://publicsuffix.org) |
| Isi tautan | File APK atau EXE, parameter `password`, `otp`, `pin`, pengalihan ke alamat lain | Pengamatan umum |

**Domain utama** diperkirakan dengan daftar kecil akhiran dua tingkat dan daftar platform hosting, **bukan** Public Suffix List lengkap. Itu perkiraan, dan antarmuka menyebutnya begitu.

Bobot tautan memakai skala dan alasan yang sama dengan bagian 3, dan sama-sama **heuristik yang belum dikalibrasi**. Daftar merek di `engine/rules.json` (39 nama) sengaja **tidak** dibandingkan dengan daftar domain resmi, karena daftar yang salah akan menandai situs sah. Pemeriksaan hanya struktural, dan situs yang rapi serta bersih dari tanda di atas bisa lolos.

---

## 4. Dasar skenario Latihan

### Pemilihan topik

Topik dipilih dari modus yang **paling banyak dilaporkan** dan yang disebut dalam materi OJK.

| Skenario | Modus yang mendasari | Data pendukung | Taktik yang dilatih |
|---|---|---|---|
| Tawaran kerja yang terlalu bagus | Penipuan lowongan kerja | 23.469 laporan ke IASC (data Januari 2026) | Iming-iming, urgensi, biaya di muka, isolasi |
| Paket yang tidak kamu ingat | Penipuan APK lewat WhatsApp | Termasuk modus yang disebut dalam materi OJK | Otoritas palsu, tautan mencurigakan, data rahasia |
| Teman yang tiba-tiba minta transfer | Penipuan lewat media sosial dan impersonasi | 19.983 laporan ke IASC (data Januari 2026) | Kedekatan palsu, biaya di muka, isolasi |
| Pinjaman cair 10 menit | Pinjaman online ilegal | 19.169 pengaduan, Januari sampai Juni 2026 | Iming-iming, data rahasia, rasa takut |
| Ajakan investasi dari teman lama | Investasi ilegal | 2.878 pengaduan, Januari sampai Juni 2026 | Iming-iming, otoritas palsu, urgensi, kedekatan palsu |
| Teman baru yang terasa pas banget | *Love scam* | Termasuk modus yang disebut dalam materi OJK | Kedekatan palsu, isolasi, biaya di muka, rasa takut |

Dua sudut pandang pengguna dipakai sengaja: mahasiswa dan pencari kerja (lima skenario) serta orang tua (investasi), untuk menunjukkan bahwa target penipuan beragam.

### Prinsip desain dialog (keputusan desain, bukan temuan penelitian)

1. **Satu keputusan, satu pelajaran:** tiap pilihan dipetakan ke minimal satu label taktik.
2. **Umpan balik langsung** setelah setiap pilihan, dengan penjelasan mengapa.
3. **Tidak menyalahkan korban:** bahasa umpan balik mengakui bahwa tergoda itu wajar.
4. **Semua fiktif:** nama, nomor, dan tautan fiktif, domain `.example` dipakai agar tidak mengarah ke situs nyata (sesuai batasan studi kasus).
5. **Akhir yang buruk menjembatani ke Langkah darurat**, supaya pembelajaran berlanjut ke tindakan.

### Status

Pilihan topik bersumber. **Isi dialog dan alur percabangan adalah karya penyusun**, belum diuji pada pengguna sungguhan.

---

## 5. Dasar Langkah darurat

| Situasi | Langkah utama | Dasar |
|---|---|---|
| Sudah transfer | Hubungi bank atau e-wallet lewat call center resmi, laporkan ke IASC secepatnya, simpan bukti, laporkan rekening dan nomor | IASC dirancang untuk mempercepat penundaan transaksi dan pemblokiran dana. Kanal pelaporan rekening dan nomor oleh Komdigi (CekRekening.id, AduanNomor.id) |
| Sudah kirim OTP, PIN, atau password | Ganti kredensial, blokir lewat call center resmi, cek mutasi, laporkan bila ada dana keluar | Kanal OJK dan IASC. Langkah penguncian akun adalah **praktik keamanan umum** |
| Klik tautan atau pasang APK | Putus internet, hapus aplikasi, ganti password dari perangkat lain, cek mutasi | **Praktik keamanan umum**; kanal pelaporan dari OJK, Komdigi, Polri |
| Diancam atau data akan disebar | Jangan bayar, simpan bukti, ceritakan ke orang tepercaya, laporkan | SiPasti dan Kontak OJK 157 untuk pinjol ilegal; Patroli Siber (Polri) untuk ancaman |

**Alasan urutan "Lakukan sekarang" dan "Setelah itu":** langkah yang menahan kerugian (menghubungi bank, melapor ke IASC) diutamakan karena waktu menentukan peluang dana tertahan. Pengumpulan bukti dan pelaporan lanjutan menyusul.

### Hal yang perlu diakui

- Kanal dan angka diambil dari rilis OJK, Komdigi, Polri, dan pemberitaan, **dicek terakhir 28 Oktober 2026**. Rincian layanan (misalnya jam layanan Kontak OJK 157) bisa berubah. **Verifikasi ulang di situs resminya sebelum mengumpulkan karya.**
- Langkah pengamanan akun (ganti password, hapus aplikasi, verifikasi dua langkah) adalah praktik umum. **Belum dirujuk ke satu dokumen resmi tunggal.**
- Panduan ini umum dan bukan nasihat hukum atau keuangan.

---

## 6. Hasil uji

Berkas: `engine/tests/korpus.rs` (regresi, dijalankan CI) dan `engine/tests/heldout.rs` (laporan held-out). Jalankan dengan `cargo test --test korpus -- --nocapture` dan `cargo test --test heldout -- --ignored --nocapture`.

### 6.1 Korpus regresi: dipakai untuk menyetel aturan

| Kelompok | Penipuan terdeteksi | Sah lolos |
|---|---|---|
| Pesan Indonesia | 31 dari 31 | 20 dari 20 |
| Pesan Inggris | 30 dari 30 | 21 dari 21 |
| Tautan | 12 dari 12 | 13 dari 13 |
| Contoh sulit sengaja (3 Indonesia, 3 Inggris) | 0 dari 6 | tidak berlaku |

**Angka ini bukan ukuran akurasi.** Aturan dibuat dan disetel dari contoh yang sama. Fungsinya mencegah aturan mundur saat diubah.

### 6.2 Uji held-out: ukuran yang lebih jujur

Pesan ditulis **setelah aturan dikunci** dengan kata-kata yang sengaja berbeda, lalu dijalankan **sekali** tanpa menyetel aturan dari hasilnya.

| Kelompok | Penipuan terdeteksi | Sah salah ditandai |
|---|---|---|
| Indonesia | **5 dari 10** | 0 dari 6 |
| Inggris | **6 dari 10** | 0 dari 6 |

Dengan hanya 10 contoh per bahasa, ketidakpastiannya besar. Selang kepercayaan 95% kasarnya sekitar 24% sampai 76% (Indonesia) dan 31% sampai 83% (Inggris). Nol salah-tuduh dari 6 pesan sah terlalu sedikit untuk menyimpulkan bahwa tingkat salah-tuduh rendah.

### 6.3 Temuan selama pengujian

1. **Imbauan keamanan bank salah ditandai.** Uji pertama menemukan 3 dari 12 pesan sah ("jangan berikan kode OTP", "pihak bank tidak pernah meminta PIN") salah ditandai. Diperbaiki dengan pola penyangkalan (`unless` dan `unless_after`), dan penipu yang meniru bahasa waspada tetap terdeteksi.
2. **Kesenjangan antara korpus yang disetel dan pesan baru.** Pada set held-out pertama, hanya 4 dari 12 (Indonesia) dan 3 dari 12 (Inggris) pesan penipuan terdeteksi, padahal korpus yang disetel menunjukkan hampir semuanya terdeteksi. Aturan lalu diperluas berdasarkan **jenis** kekurangan (nominal gaji, kalimat permintaan uang, pola penonaktifan akun, tautan tanpa skema, dan sejenisnya). Set pertama itu kemudian masuk ke korpus regresi, dan set kedua yang benar-benar baru ditulis untuk angka di 6.2.
3. **Aturan kata kunci menangkap parafrase dengan buruk.** Penipu yang mengubah susunan kalimat sering lolos. Ini keterbatasan mendasar pendekatan ini, bukan sekadar kurang aturan.

### 6.4 Batas klaim

Kalimat yang aman: *"Dalam uji dengan 20 pesan baru (10 Indonesia, 10 Inggris) yang tidak dipakai menyetel aturan, 11 pesan penipuan terdeteksi dan tidak ada dari 12 pesan sah yang salah ditandai. Contohnya sedikit dan ditulis oleh pembuat aturan, jadi ini perkiraan kasar, bukan akurasi di dunia nyata."*

Jangan menyebut angka dari 6.1 sebagai akurasi.

---

## 7. Keterbatasan dan langkah lanjutan

**Keterbatasan:** hanya pola kata berbahasa Indonesia dan Inggris; situs tidak dibuka saat cek tautan; bobot dan ambang belum dikalibrasi; korpus kecil dan tidak independen; dialog skenario belum diuji pada pengguna.

**Langkah lanjutan yang masuk akal:**
1. Kumpulkan pesan penipuan nyata yang sudah dianonimkan dan **dengan persetujuan**, lalu kalibrasi bobot secara statistik seperti pada preseden filter spam.
2. Minta pihak lain menulis korpus uji, supaya evaluasi independen.
3. Uji skenario Latihan pada beberapa pengguna dan perbaiki bagian yang membingungkan.
4. Tambah deteksi untuk bahasa daerah dan campuran bahasa.

---

## 8. Panduan menjawab pertanyaan juri

| Pertanyaan | Jawaban singkat yang jujur |
|---|---|
| Dari mana bobotnya? | Ditetapkan dengan tiga kriteria (spesifisitas, dampak, risiko salah-tuduh) mengikuti bentuk skor aditif filter spam. Belum dikalibrasi dengan data nyata, dan itu kami akui. |
| Apakah hasilnya akurat? | Pada pesan baru yang tidak dipakai menyetel aturan, 11 dari 20 pesan penipuan terdeteksi dan 0 dari 12 pesan sah salah ditandai. JEDA menangkap sebagian pola dan jarang salah menuduh, tetapi tidak menangkap semuanya. Sampelnya kecil dan ditulis oleh penyusun aturan. |
| Kenapa tidak pakai AI? | Studi kasus menyebut pendekatan berbasis aturan yang bisa dijelaskan sudah cukup. Aturan membuat setiap hasil punya alasan yang bisa ditunjukkan, dan privasi terjaga karena semua berjalan di perangkat. |
| Bagaimana menangani salah deteksi? | Hasilnya berupa tingkat waspada, bukan vonis. Kami menemukan dan memperbaiki salah-tuduh pada imbauan bank lewat korpus, dan dokumentasi mencantumkan batasannya. |
| Dari mana label taktik? | Dari kajian psikologi penipuan (Stajano dan Wilson, 2011). Untuk "rasa takut" dan "isolasi" itu interpretasi kami, bukan temuan penulis tersebut. |
| Kenapa enam skenario ini? | Dipilih dari modus yang paling banyak dilaporkan ke IASC dan yang disebut OJK, dengan dua sudut pandang pengguna. |
| Apa yang tidak bisa dilakukan aplikasi? | Tidak membuka situs, tidak menilai reputasi, tidak menyatakan sesuatu aman, dan bisa lolos pada penipu yang sopan. Semua tertulis di halaman Tentang. |

---

## 9. Pustaka

**Kajian psikologi penipuan**
- Stajano, F. dan Wilson, P. (2011). Understanding scam victims: seven principles for systems security. *Communications of the ACM*, 54(3), 70-75. https://doi.org/10.1145/1897852.1897872. Versi laporan teknis: https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-754.html
- Cialdini, R. B. *Influence: The Psychology of Persuasion*.

**Preseden pemberian skor**
- Apache SpamAssassin, berkas skor aturan `50_scores.cf` (komentar tentang pembuatan skor dengan *perceptron* dan ambang 5,0): https://svn.apache.org/repos/asf/spamassassin/trunk/rules/50_scores.cf

**Data laporan dan modus (OJK, Satgas PASTI, IASC)**
- Total laporan IASC dan kerugian, serta laporan per modus (data Januari 2026): https://keuangan.kontan.co.id/news/hingga-14-januari-2026-kerugian-masyarakat-akibat-penipuan-scam-rp-91-triliun
- Laporan IASC hingga September 2026: https://keuangan.kontan.co.id/news/iasc-terima-702342-laporan-kasus-penipuan-hingga-september-2026
- Dana korban yang diblokir IASC: https://investortrust.id/financial/105549/perangi-penipuan-digital-iasc-ojk-berhasil-blokir-dana-korban-rp-638-9-miliar
- Pengaduan pinjol dan investasi ilegal, Januari sampai Juni 2026: https://keuangan.kontan.co.id/news/satgas-pasti-hentikan-951-pinjol-ilegal-dan-238-investasi-ilegal-per-juni-2026
- Daftar modus penipuan (termasuk *love scam*), Satgas PASTI: https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Documents/Pages/Satgas-PASTI-Blokir-507-Aktivitas-dan-Entitas-Keuangan-Ilegal-Minta-Masyarakat-Waspadai-Penipuan-yang-Semakin-Marak/Satgas%20PASTI%20Blokir%20507%20Aktivitas%20dan%20Entitas%20Keuangan%20Ilegal%20Minta%20Masyarakat%20Waspadai%20Penipuan%20yang%20Semakin%20Marak.pdf
- Materi OJK tentang modus penipuan dan pinjol: https://brida.bulelengkab.go.id/informasi/download/67_pengenalan-ojk-dan-waspada-pinjaman-online-serta-bijak-atur-keuangan_2026-04-30-15-44-53.pdf

**Kanal pelaporan**
- IASC: https://iasc.ojk.go.id. Kontak OJK 157: https://kontak157.ojk.go.id. SiPasti: https://sipasti.ojk.go.id
- AduanNomor.id (Kominfo): https://infopublik.id/kategori/siaran-pers/798078/siaran-pers-tekan-kasus-penipuan-online-kominfo-buka-aduannomorid
- CekRekening.id: https://rri.co.id/bengkulu/ekonomi/keuangan/2599265/cekrekeningid-bantu-cegah-penipuan
- Cara melapor ke polisi dan Komdigi: https://inet.detik.com/security/d-8013809/cara-laporkan-penipuan-online-ke-polisi-dan-komdigi

> Semua tautan di atas dibuka saat riset pada 28 Oktober 2026. Periksa ulang sebelum pengumpulan karya, terutama angka statistik yang diperbarui berkala.