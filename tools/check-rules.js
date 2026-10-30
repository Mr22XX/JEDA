// Memeriksa engine/rules.json terhadap syarat yang dipakai mesin Rust.
// Cara Menjalankan:  node tools/check-rules.js
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "engine", "rules.json");
const raw = fs.readFileSync(file, "utf8");
const problems = [];
const warn = [];

if (raw.charCodeAt(0) === 0xfeff) warn.push("File diawali BOM (sudah ditangani mesin, tapi sebaiknya disimpan sebagai UTF-8 tanpa BOM).");

let j;
try { j = JSON.parse(raw.replace(/^\uFEFF/, "")); }
catch (e) { console.log("JSON RUSAK:", e.message); process.exit(1); }

if (!Array.isArray(j.rules)) problems.push("'rules' harus berupa daftar.");
if (!Array.isArray(j.combos)) problems.push("'combos' harus berupa daftar.");

const seen = new Set();
for (const r of j.rules || []) {
  const id = r && r.id ? r.id : "(tanpa id)";
  for (const k of ["id", "tactic", "why"]) if (typeof r[k] !== "string" || !r[k]) problems.push(`${id}: '${k}' harus teks dan tidak boleh kosong`);
  if (!Number.isInteger(r.weight) || r.weight < 0) problems.push(`${id}: 'weight' harus bilangan bulat 0 atau lebih (sekarang: ${JSON.stringify(r.weight)})`);
  if (!Array.isArray(r.any_of) || r.any_of.length === 0) problems.push(`${id}: 'any_of' harus daftar yang berisi minimal satu pola`);
  if (r.also_requires !== undefined && !Array.isArray(r.also_requires)) problems.push(`${id}: 'also_requires' harus daftar`);
  if (seen.has(id)) problems.push(`ID ganda: ${id}`);
  seen.add(id);
  for (const p of [...(r.any_of || []), ...(r.also_requires || [])]) {
    if (typeof p !== "string") { problems.push(`${id}: ada pola yang bukan teks`); continue; }
    if (p === "") problems.push(`${id}: ada pola kosong (akan cocok dengan semua teks)`);
    if (/\(\?<?[=!]/.test(p) || /\\[1-9]/.test(p)) problems.push(`${id}: lookahead, lookbehind, atau backreference tidak didukung Rust -> ${p}`);
    try { new RegExp(p, "i"); } catch (e) { problems.push(`${id}: pola regex rusak -> ${p}`); }
  }
}
for (const c of j.combos || []) {
  if (typeof c.name !== "string" || !Array.isArray(c.needs) || !Number.isInteger(c.bonus)) problems.push(`kombo rusak: ${JSON.stringify(c).slice(0, 80)}`);
}
if (j.brands !== undefined) {
  if (!Array.isArray(j.brands) || !j.brands.every((b) => typeof b === "string")) problems.push("'brands' harus daftar teks");
  else for (const b of j.brands) {
    if (b === "") problems.push("Ada merek kosong di 'brands'");
    else if (b !== b.toLowerCase() || /[\s.]/.test(b)) warn.push(`Merek "${b}" sebaiknya huruf kecil tanpa spasi atau titik (pencocokan memakai huruf kecil).`);
  }
  const dup = j.brands.filter((b, i) => j.brands.indexOf(b) !== i);
  if (dup.length) warn.push(`Merek ganda: ${dup.join(", ")}`);
}

console.log(`Aturan: ${(j.rules || []).length} | Kombo: ${(j.combos || []).length} | Merek: ${(j.brands || []).length}`);
if (j.brands) console.log("Merek:", j.brands.join(", "));
warn.forEach((w) => console.log("PERHATIAN:", w));
if (problems.length) { console.log("\nMASALAH DITEMUKAN:"); problems.forEach((p) => console.log(" -", p)); process.exit(1); }
console.log("\nSkema OK. Tidak ada masalah yang akan membuat mesin gagal dimuat.");