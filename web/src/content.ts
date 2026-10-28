import type { Level } from "./engine";

// Nama kelas ditulis lengkap agar terdeteksi Tailwind.
export const LEVELS: Record<Level, { title: string; note: string; filled: number; text: string; bar: string; steps: string[] }> = {
  tidak_ditemukan: {
    title: "Tidak ada tanda bahaya yang kami kenali",
    note: "Ini bukan jaminan aman. Pesan penipuan yang rapi bisa lolos dari aturan kami.",
    filled: 0, text: "text-calm", bar: "bg-calm",
    steps: [
      "Kalau pesan meminta uang, data, atau kode, tetap cek lewat kontak resmi yang kamu cari sendiri.",
      "Masih ragu? Tanyakan ke orang yang kamu percaya.",
    ],
  },
  ringan: {
    title: "Waspada ringan",
    note: "Ada tanda yang perlu dicek ulang sebelum kamu membalas.",
    filled: 1, text: "text-ringan", bar: "bg-ringan",
    steps: ["Cek pengirim lewat kanal resmi, bukan lewat nomor atau tautan di pesan.", "Tunda membalas sampai kamu yakin."],
  },
  sedang: {
    title: "Waspada sedang",
    note: "Beberapa tanda bahaya muncul. Jangan membalas atau mengklik apa pun dulu.",
    filled: 2, text: "text-sedang", bar: "bg-sedang",
    steps: [
      "Jangan klik tautan atau kirim data apa pun.",
      "Hubungi pihak yang diklaim lewat kontak resmi yang kamu cari sendiri.",
      "Tanyakan ke teman atau keluarga sebelum bertindak.",
    ],
  },
  tinggi: {
    title: "Waspada tinggi",
    note: "Polanya mirip modus penipuan yang umum. Hentikan interaksi dan verifikasi lewat kanal resmi.",
    filled: 3, text: "text-tinggi", bar: "bg-tinggi",
    steps: [
      "Hentikan percakapan. Jangan kirim uang, OTP, PIN, atau data pribadi.",
      "Jangan klik tautan atau membuka file dari pesan itu.",
      "Verifikasi lewat kontak resmi yang kamu cari sendiri.",
      "Kalau sudah terlanjur mengirim sesuatu, segera hubungi bank atau penyedia layanan terkait.",
    ],
  },
};

export const SAMPLES = [
  { name: "Giveaway", text: "Selamat anda terpilih jadi pemenang giveaway! Segera kirim kode OTP yang masuk ke HP Anda dan bayar biaya administrasi Rp50.000. Klik https://bca-verifikasi.xyz sekarang juga. Jangan bilang siapa-siapa." },
  { name: "Lowongan kerja", text: "Lowongan admin online dari HP, tanpa pengalaman, gaji jutaan per minggu. Transfer dulu biaya pendaftaran Rp100.000 untuk amankan slot. Hubungi HRD kami lewat WhatsApp sekarang juga." },
  { name: "Akun diblokir", text: "Pihak bank menginformasikan akun Anda akan diblokir permanen. Segera klik https://bit.ly/verif-akun dan sebutkan kode OTP untuk verifikasi." },
  { name: "Pesan biasa", text: "Halo, besok rapat panitia jam 3 di ruang himpunan ya. Jangan lupa bawa laptop." },
];

export const label = (t: string) => t.charAt(0) + t.slice(1).toLowerCase();
export type Tab = "cek" | "latihan" | "darurat";