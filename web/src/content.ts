/**
 * Konten dan tipe kecil lintas halaman: LEVELS (tingkat kewaspadaan dan kelas Tailwind-nya), contoh pesan dan tautan,
 * serta tipe Tab dan Goto. Nama kelas di LEVELS harus ditulis utuh agar terdeteksi Tailwind.
 * Urutan contoh harus sama dengan urutan nama tombolnya di i18n/dict.ts (sampleNames, linkSampleNames). Contoh harus fiktif.
 */

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
  { name: "Manipulasi Karakter", text: "D3P0 20RB W3D3 JUT44N J4NG4N S4MP41 K3L3W4T4N " },
  { name: "Pesan biasa", text: "Halo, besok rapat panitia jam 3 di ruang himpunan ya. Jangan lupa bawa laptop." },
];

export const label = (t: string) => t.charAt(0) + t.slice(1).toLowerCase();
export type Tab = "cek" | "latihan" | "darurat" | "tentang";
/** Pindah halaman. `arg` opsional, misalnya id skenario Latihan yang langsung dibuka. */
export type Goto = (t: Tab, arg?: string) => void;

// Semua tautan contoh bersifat fiktif (domain .example dipakai agar tidak mengarah ke situs nyata).
export const LINK_SAMPLES = [
  { name: "Domain tiruan", text: "https://bca-verifikasi.xyz/login" },
  { name: "File APK", text: "https://resi-paket.example/resi.apk" },
  { name: "Pengecoh @", text: "https://www.bca.co.id@akun-aman.example/masuk" },
  { name: "Tautan resmi", text: "https://www.bca.co.id/" },
];

export const LINK_NOTE: Partial<Record<Level, string>> = {
  tidak_ditemukan: "Bentuk tautan ini tidak menunjukkan tanda bahaya yang kami kenali. Kami tidak membuka situsnya, jadi isi halaman dan reputasinya belum diperiksa.",
};

// Contoh pesan berbahasa Inggris (nama tombol diterjemahkan lewat kamus). Semua fiktif.
export const SAMPLES_EN = [
  { name: "Giveaway", text: "Congratulations! You have been selected as the winner of a $5,000 gift card. Pay a small processing fee to claim your prize at https://prize-center.example" },
  { name: "Fake job", text: "Work from home, no experience needed, earn $500 per day. Pay a registration fee of $50 to start today and message me on Telegram." },
  { name: "Account blocked", text: "URGENT: Your bank account has been suspended. Verify now at http://secure-bank-login.xyz and send your one-time password to reactivate." },
  { name: "Character Manipulation", text: "D3P0 20RB W3D3 JUT44N J4NG4N S4MP41 K3L3W4T4N " },
  { name: "Normal message", text: "Hi team, the meeting is moved to 3 pm tomorrow. Please bring your laptop." },
];