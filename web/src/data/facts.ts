/**
 * Data fakta dan kanal pelaporan.
 * - CHECKED: tanggal terakhir data diverifikasi. Perbarui setiap kali data dicek ulang.
 * - STATS: statistik penipuan dari OJK/pemberitaan (dipakai FactStrip).
 * - CHANNELS: kanal pelaporan resmi (IASC, Kontak 157, SiPasti, CekRekening, AduanNomor, Patroli Siber).
 * Kanal bisa berubah, jadi verifikasi ke situs resmi sebelum mengubah.
 * Terjemahan Inggris: STATS_EN dan CHANNELS_EN di data/en.ts.
 */
export type Link = { label: string; href: string };
export type Channel = { id: string; name: string; use: string; links: Link[] };

// Data diambil dari rilis OJK dan pemberitaan, dicek pada tanggal ini. Kanal bisa berubah: verifikasi di situs resmi.
export const CHECKED = "28 Oktober 2026";

export const STATS = [
  { value: "702.342", label: "laporan penipuan diterima Indonesia Anti-Scam Centre (IASC)", period: "22 Nov 2024 – Sep 2026", src: "OJK, via Kontan", url: "https://keuangan.kontan.co.id/news/iasc-terima-702342-laporan-kasus-penipuan-hingga-september-2026" },
  { value: "Rp9,1 triliun", label: "total kerugian masyarakat yang dilaporkan lewat IASC", period: "hingga 14 Jan 2026", src: "OJK, via Kontan", url: "https://keuangan.kontan.co.id/news/hingga-14-januari-2026-kerugian-masyarakat-akibat-penipuan-scam-rp-91-triliun" },
  { value: "Rp638,9 miliar", label: "dana korban yang berhasil diblokir IASC", period: "hingga Mei 2026", src: "OJK, via Investortrust", url: "https://investortrust.id/financial/105549/perangi-penipuan-digital-iasc-ojk-berhasil-blokir-dana-korban-rp-638-9-miliar" },
  { value: "23.469", label: "laporan penipuan lowongan kerja di IASC (media sosial: 19.983)", period: "data Jan 2026", src: "OJK, via Kontan", url: "https://keuangan.kontan.co.id/news/hingga-14-januari-2026-kerugian-masyarakat-akibat-penipuan-scam-rp-91-triliun" },
];

export const CHANNELS: Record<string, Channel> = {
  iasc: { id: "iasc", name: "Indonesia Anti-Scam Centre (OJK)", use: "Penipuan transaksi keuangan. Dirancang untuk mempercepat penundaan transaksi atau pemblokiran dana.", links: [{ label: "iasc.ojk.go.id", href: "https://iasc.ojk.go.id" }, { label: "iasc@ojk.go.id", href: "mailto:iasc@ojk.go.id" }] },
  kontak157: { id: "kontak157", name: "Kontak OJK 157", use: "Bertanya, mengecek legalitas, dan melapor. Telepon 157 kini melayani 24 jam.", links: [{ label: "Telepon 157", href: "tel:157" }, { label: "WhatsApp 081157157157", href: "https://wa.me/6281157157157" }, { label: "kontak157.ojk.go.id", href: "https://kontak157.ojk.go.id" }] },
  sipasti: { id: "sipasti", name: "SiPasti OJK (Satgas PASTI)", use: "Lapor pinjaman online ilegal, investasi ilegal, dan gadai ilegal.", links: [{ label: "sipasti.ojk.go.id", href: "https://sipasti.ojk.go.id" }] },
  cekrekening: { id: "cekrekening", name: "CekRekening.id (Komdigi)", use: "Cek apakah rekening pernah dilaporkan, dan laporkan rekening penipu.", links: [{ label: "cekrekening.id", href: "https://cekrekening.id" }] },
  aduannomor: { id: "aduannomor", name: "AduanNomor.id (Komdigi)", use: "Laporkan nomor telepon yang dipakai untuk penipuan atau spam.", links: [{ label: "aduannomor.id", href: "https://aduannomor.id" }] },
  patrolisiber: { id: "patrolisiber", name: "Patroli Siber (Polri)", use: "Laporan kejahatan siber ke kepolisian. Kamu mungkin diminta datang ke kantor polisi untuk keterangan lanjutan.", links: [{ label: "patrolisiber.id", href: "https://patrolisiber.id" }] },
};