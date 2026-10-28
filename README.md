# JEDA: ragu? jeda dulu, cek dulu

Aplikasi web untuk MIT-Week 2026 (studi kasus *The Trust Trap*). Mesin aturan berbasis pola membantu orang mengenali pesan yang mencurigakan, lengkap dengan alasan yang bisa dijelaskan.

**Status:** kerangka awal. Mode Cek Dulu (Recognize) sudah berjalan. Latihan (Learn) dan Langkah Darurat (Act) belum dibuat.

## Arsitektur
```
React (web/) ──panggil analyze(text)──▶ Rust → WASM (engine/) ──baca──▶ engine/rules.json
```
Semua analisis berjalan di browser. Teks pengguna tidak dikirim ke server mana pun.

## Menjalankan
Prasyarat: Node 20+, Rust stable, `wasm-pack`, dan target `wasm32-unknown-unknown`.
```bash
rustup target add wasm32-unknown-unknown && cargo install wasm-pack
cd engine && cargo test            # uji mesin aturan
cd ../web && npm install
npm run build:wasm                 # hasil ke web/src/wasm (COMMIT hasilnya)
npm run dev
```

## Deploy (Vercel/Netlify)
Hasil build WASM di-commit, jadi server deploy cukup menjalankan `npm run build` di folder `web`. Rewrite SPA sudah diatur (`vercel.json`, `public/_redirects`).

## Menambah aturan
Edit `engine/rules.json`: `any_of` (salah satu pola cocok), `also_requires` (pola pendamping opsional), `weight`, `tactic`, `why`. Regex Rust tidak mendukung lookahead/lookbehind. Jalankan `cargo test` setelah mengubah.

## Batasan
Berbasis pola kata, bukan pembuktian. Pesan sah bisa memicu aturan, dan penipu yang sopan bisa lolos. Hasil tidak pernah menyatakan sebuah pesan "aman".

## Sumber daya pihak ketiga
React, Vite, regex, serde, wasm-bindgen, font Bricolage Grotesque (Google Fonts, OFL).
