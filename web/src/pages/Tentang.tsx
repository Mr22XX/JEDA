import { CHECKED } from "../data/facts";

const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
    <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
  </section>
);
const List = ({ items }: { items: React.ReactNode[] }) => <ul className="list-disc space-y-1.5 pl-5">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>;
const A = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-brand">{children}</a>;

export default function Tentang() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:pt-14">
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Tentang dan batasan</h1>
      <p className="mt-4 text-lg text-muted">JEDA membantu kamu berhenti sejenak saat ragu. Halaman ini menjelaskan cara kerjanya, dan yang terpenting, apa yang tidak bisa dilakukannya.</p>

      <Box title="Tiga fungsi">
        <List items={[<><b>Kenali:</b> periksa pesan atau tautan, lalu lihat bagian mencurigakan beserta alasannya.</>, <><b>Belajar:</b> simulasi chat bercabang dengan umpan balik langsung atas setiap pilihan.</>, <><b>Bertindak:</b> langkah berurutan dan kanal pelaporan resmi saat sudah terlanjur.</>]} />
      </Box>

      <Box title="Cara kerja pemeriksaan pesan">
        <p>Mesin berisi 28 aturan yang mencari pola, misalnya permintaan kode OTP, biaya di muka, atau ancaman. Tiap aturan punya <b>bobot 1 sampai 5</b> dan satu <b>label taktik</b>. Bobot semua aturan yang terpicu dijumlahkan, ditambah bonus bila beberapa taktik muncul bersamaan.</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[20rem] text-left text-sm">
          <thead><tr className="border-b border-line text-muted"><th className="py-2 pr-4">Skor</th><th className="py-2">Tingkat</th></tr></thead>
          <tbody className="divide-y divide-line">
            <tr><td className="py-2 pr-4">0</td><td>Tidak ada tanda yang kami kenali</td></tr>
            <tr><td className="py-2 pr-4">1 sampai 3</td><td>Waspada ringan</td></tr>
            <tr><td className="py-2 pr-4">4 sampai 7</td><td>Waspada sedang</td></tr>
            <tr><td className="py-2 pr-4">8 ke atas</td><td>Waspada tinggi</td></tr>
          </tbody></table></div>
        <p>Satu tanda berbobot 5 (misalnya meminta OTP) langsung menaikkan hasil minimal ke sedang. Kalimat yang menyangkal, seperti "jangan berikan kode OTP", tidak dihitung sebagai permintaan.</p>
      </Box>

      <Box title="Cara kerja pemeriksaan tautan">
        <p>Tautan diuraikan menjadi domain utama, subdomain, dan jalur, lalu dicocokkan dengan tanda-tanda seperti tanda @ pengecoh, alamat IP, file APK, domain yang meniru merek, dan pemendek tautan. <b>Situsnya tidak dibuka dan tautannya tidak dikirim ke mana pun.</b></p>
      </Box>

      <Box title="Yang tidak bisa dilakukan JEDA">
        <List items={[
          "JEDA tidak pernah menyatakan sebuah pesan atau tautan aman. Hasil hijau hanya berarti tidak ada tanda yang kami kenali.",
          "Saat mengecek tautan, isi halaman, umur domain, dan reputasi situs tidak diperiksa.",
          "Tautan pendek tidak bisa dibuka, jadi tujuan akhirnya tidak diketahui.",
          "Penipu yang sopan dan tidak memakai kata yang kami kenali bisa lolos.",
          "Pesan berbahasa selain Indonesia hampir tidak terdeteksi.",
          "Pesan sah yang kebetulan memakai kata seperti \"segera\" bisa ditandai ringan.",
          "Domain utama pada cek tautan hanya perkiraan dari daftar akhiran sederhana.",
        ]} />
      </Box>

      <Box title="Seberapa akurat?">
        <p>Kami menguji mesin dengan contoh fiktif yang kami tulis sendiri: <b>19 dari 19</b> pesan penipuan terdeteksi dan <b>12 dari 12</b> pesan sah tidak salah ditandai. Untuk tautan: 8 dari 8 berbahaya terdeteksi, 8 dari 8 sah lolos. Tiga contoh sulit sengaja dimasukkan dan <b>tidak satu pun terdeteksi</b>.</p>
        <p>Angka ini <b>tidak boleh dibaca sebagai akurasi di dunia nyata</b>: contohnya ditulis oleh pembuat aturan, jumlahnya kecil, dan bukan evaluasi independen. Uji pertama sempat menemukan 3 pesan sah (imbauan keamanan bank) yang salah ditandai. Itu kami perbaiki, dan perbaikannya diuji agar penipu yang meniru bahasa waspada tetap terdeteksi.</p>
      </Box>

      <Box title="Privasi">
        <List items={[
          "Teks dan tautan yang kamu tempel diproses di perangkatmu dan tidak dikirim ke server mana pun.",
          "Tidak ada akun dan tidak ada database. Progres Latihan hanya disimpan di browsermu.",
          "Jangan memasukkan data pribadi asli seperti nomor KTP atau kode OTP.",
          "Font dimuat dari Google Fonts, jadi browser menghubungi Google untuk mengambil huruf. Isi pesanmu tidak ikut terkirim.",
        ]} />
      </Box>

      <Box title="Dasar penyusunan">
        <p>Label taktik dirujuk ke kajian psikologi penipuan, bobot ditetapkan dengan tiga kriteria yang dijelaskan di dokumentasi, skenario dipilih dari modus yang paling banyak dilaporkan ke OJK, dan langkah darurat bersumber dari kanal resmi. Penjelasan lengkapnya ada di berkas <code className="rounded bg-brand/10 px-1.5 py-0.5 text-sm">docs/DASAR-PENYUSUNAN.md</code> pada repositori.</p>
        <List items={[
          <>Stajano, F. dan Wilson, P. (2011). Understanding scam victims: seven principles for systems security. <i>Communications of the ACM</i> 54(3), 70-75. <A href="https://doi.org/10.1145/1897852.1897872">doi.org/10.1145/1897852.1897872</A></>,
          <>Cialdini, R. B. <i>Influence: The Psychology of Persuasion</i>.</>,
          <>Indonesia Anti-Scam Centre (OJK) dan Satgas PASTI: data laporan dan daftar modus, lihat tautan sumber pada setiap angka di halaman Cek dan Latihan.</>,
        ]} />
      </Box>

      <Box title="Kanal pelaporan">
        <p>Daftar kanal di halaman Langkah darurat diambil dari rilis OJK, Komdigi, dan Polri, dan terakhir dicek pada <b>{CHECKED}</b>. Kanal bisa berubah, jadi pastikan lewat situs resminya.</p>
      </Box>

      <Box title="Pihak ketiga">
        <p>React, Vite, Tailwind CSS, GSAP, serta Rust dengan crate regex, serde, dan wasm-bindgen. Font Bricolage Grotesque (lisensi OFL).</p>
      </Box>
    </main>
  );
}