# Course Landing Page Template / Templat Halaman Utama Kursus

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24213008.svg)](https://doi.org/10.5281/zenodo.24213008)

A free, static landing page for one course. No server, no database, no student data.
Halaman utama kursus yang statik dan percuma. Tiada pelayan, tiada pangkalan data, tiada data pelajar.

---

## Bahasa Melayu

### Apa yang ada
Hero (tajuk, kod, banner), "Mula di sini", pautan pantas, jadual mingguan mengikut kumpulan, kad eksperimen, aliran kerja, penilaian, peraturan, serta pensyarah dan sokongan. Bahagian pilihan boleh dimatikan. Halaman boleh dipaparkan dalam Bahasa Melayu atau English.

### 1. Cuba dahulu (tanpa pemasangan)
1. Muat turun folder ini dan **ekstrak sepenuhnya** (klik kanan, Extract All). Jangan buka dari dalam zip.
2. Dwi-klik `index.html`. Anda akan nampak halaman contoh (data fiksyen).

### 2. Sunting halaman anda (tanpa menulis kod)
1. Buka `index.html` dalam pelayar, kemudian tambah `?edit` pada hujung alamat. Contoh:
   `file:///C:/Users/NAMA/Downloads/course-landing-template/index.html?edit`
2. Klik teks yang bergaris putus dan taip untuk menukar. Gunakan × untuk memadam item, **+ Tambah** untuk menambah, dan 🔗 untuk memilih pautan.
3. Bar di atas ada:
   - **Page setup**: bahasa, tema, banner, pensyarah, bahagian yang dipaparkan, senarai pautan.
   - **Schedule panel**: kumpulan, minggu, jenis, tarikh, cuti, eksperimen.
   - **Assessment panel**: wajaran, kad laporan dan kriteria markah.
   - **Check**: senarai ralat dan amaran sebelum anda simpan.
4. Tekan **Muat turun content.js**. Fail itu dimuat turun ke folder Downloads. Jika pelayar memberi amaran fail `.js` "could harm your device", klik **Keep**; ini amaran biasa untuk semua fail `.js`, bukan masalah pada halaman.
5. **Gantikan** `content.js` lama dalam folder halaman dengan fail baharu, kemudian muat semula halaman.

Suntingan disimpan dalam memori pelayar sahaja sehingga anda muat turun. Pelayar akan memberi amaran jika anda keluar sebelum memuat turun.

### 3. Terbitkan untuk pelajar (GitHub Pages)
1. Daftar akaun di github.com dan buat repositori baharu (**Public**; GitHub Pages percuma memerlukan repositori awam).
2. Pilih **Add file → Upload files**, seret semua fail dan folder (termasuk `.nojekyll`), kemudian **Commit changes**.
3. Buka **Settings → Pages**. Di bawah *Build and deployment*, pilih *Deploy from a branch*, cawangan `main`, folder `/ (root)`, dan **Save**.
4. Tunggu seminit. Alamat halaman akan dipaparkan di situ. Berikan alamat itu kepada pelajar.
5. Untuk mengemas kini: buka `alamat-anda/?edit`, sunting, muat turun `content.js`, kemudian di GitHub pilih **Add file → Upload files** dan muat naik fail itu (ia menggantikan yang lama).

### Gambar
Letakkan gambar dalam folder `assets/` (contoh `assets/lecturer.jpg`, `assets/banner.jpg`), kemudian tulis namanya dalam **Page setup**. Tambah penerangan gambar untuk pembaca skrin. Jika fail tiada, halaman menggunakan inisial atau lukisan lalai.

### Aksesibiliti
Pautan langkau ke kandungan, struktur tajuk, fokus papan kekunci yang jelas, kontras teks sekurang-kurangnya 4.5:1 (warna utama dilaraskan automatik), dan tiada fon atau skrip luaran melainkan anda mengaktifkan analitik. Sila uji dengan pembaca skrin dan telefon sebenar sebelum menerbitkan.

### Privasi
Halaman tidak menyimpan data pelajar. Tanda semak "Mula di sini" dan pilihan kumpulan disimpan hanya dalam pelayar pelajar sendiri. GoatCounter (pengiraan lawatan) **mati** kecuali anda isi kod dalam **Page setup**.

### Masalah biasa
| Masalah | Penyelesaian |
|---|---|
| Halaman "Loading…" atau mesej fail tiada | Ekstrak zip sepenuhnya, buka `index.html` daripada folder yang diekstrak. |
| Tiada bar sunting | Pastikan alamat berakhir dengan `?edit`. |
| Perubahan tidak muncul | Anda perlu memuat turun `content.js` dan menggantikan fail lama. |
| Gambar tidak keluar | Semak nama fail dan huruf besar/kecil, dan fail ada dalam `assets/`. |
| Halaman GitHub tidak berubah | Tunggu seminit, kemudian muat semula dengan Ctrl+F5. |

### Kemas kini bahagian (rujukan ringkas `content.js`)
`course`, `design`, `lecturer`, `links`, `startHere`, `quickLinks`, `sections`, `schedule`, `experiments`, `workflow`, `assessment`, `rules`, `support`, `analytics`, `feedback`, `prepwise`, `footer`, `strings`. Warna utama (pilihan) ditetapkan dengan `design.accent`, contohnya `"#0F766E"`; tiada medan dalam Page setup. Kredit kecil di kaki halaman tidak dipaparkan secara lalai; hidupkan dengan `footer.credit: true`, atau diubah dengan `footer.creditText` dan `footer.creditUrl`. Pautan ditulis sekali dalam `links` dan dirujuk dengan kuncinya. Kunci `email` = e-mel pensyarah. `#schedule` dsb. memaut ke bahagian dalam halaman. Dalam teks, `{testDate}`, `{group}` dan `{session}` digantikan secara automatik. Pengguna lanjutan boleh menyunting `content.js` terus, atau menggunakan `content.json` (letak di sebelah `index.html`, buang `content.js`; perlu dihos atau `python -m http.server`).

---

## English

### What it includes
Hero (title, code, banner), "Start here", quick links, weekly schedule per class group, experiment cards, workflow, assessment, rules, and lecturer and support. Optional sections can be turned off. The page can be shown in English or Bahasa Melayu.

### 1. Try it (nothing to install)
1. Download this folder and **extract it fully** (right-click, Extract All). Do not open it from inside the zip.
2. Double-click `index.html` to see the sample page (fictional data).

### 2. Edit your page (no coding)
1. Open `index.html` in your browser and add `?edit` to the end of the address, for example
   `file:///C:/Users/NAME/Downloads/course-landing-template/index.html?edit`
2. Click any dashed text and type. Use × to remove an item, **+ Tambah** to add one, and 🔗 to choose a link.
3. The top bar has **Page setup**, **Schedule panel**, **Assessment panel**, and **Check**.
4. Press **Muat turun content.js** to download your content. If the browser warns that a `.js` file "could harm your device", choose **Keep**; browsers show this for every `.js` file.
5. **Replace** the old `content.js` in the page folder with the new one and reload.

Edits live in the browser's memory until you download. The browser warns you if you leave with unsaved changes. The editor interface is in Bahasa Melayu.

### 3. Publish for students (GitHub Pages)
1. Create a GitHub account and a new **public** repository (free GitHub Pages needs a public repository).
2. **Add file → Upload files**, drag in every file and folder (including `.nojekyll`), then **Commit changes**.
3. **Settings → Pages**: *Deploy from a branch*, branch `main`, folder `/ (root)`, **Save**.
4. After a minute the page address appears there. Share it with students.
5. To update, open `your-address/?edit`, edit, download `content.js`, then upload it to GitHub the same way (it replaces the old file).

### Images
Put images in `assets/` (for example `assets/lecturer.jpg`, `assets/banner.jpg`) and type the file name in **Page setup**. Add an image description for screen readers. If a file is missing, the page falls back to initials or the default art.

### Accessibility
Skip link, heading structure, visible keyboard focus, text contrast of at least 4.5:1 (the accent colour is adjusted automatically), and no external fonts or scripts unless you turn on analytics. Please test with a screen reader and a real phone before publishing.

### Privacy
The page stores no student data. "Start here" ticks and the chosen group are kept only in the student's own browser. GoatCounter (visit counting) is **off** unless you enter a code in **Page setup**.

### Advanced
Content lives in `content.js` (`window.__courseContent = {...}`). You can edit it by hand, or use `content.json` instead (put it next to `index.html`, delete `content.js`; it must be hosted or served with `python -m http.server`). `?content=name.json` loads another file for testing, and `?debug` shows warnings.

---

`design.theme` = `"light"` (lalai) atau `"dark"` (hijau zamrud gelap); boleh ditukar dalam Page setup > Theme. / `design.theme` = `"light"` (default) or `"dark"` (dark emerald); change it in Page setup > Theme. Butang bulan/matahari di header membolehkan pelajar menukar sendiri (disimpan dalam pelayar mereka); matikan dengan `design.themeToggle: false`. / A moon/sun button in the header lets students switch themselves (saved in their browser); turn it off with `design.themeToggle: false`.

## Licence / Lesen
Code (`index.html`, `css/`, `js/`): MIT, see `LICENSE`. Sample text and documentation: CC BY 4.0, see `LICENSE-CONTENT.md`. Citation: `CITATION.cff`.

## Cite / Petikan

**English.** If you use this template in your teaching, a publication or a presentation, please cite it. When the article about the template is published, please cite the article; until then cite the software record below. Use the GitHub button "Cite this repository" (top right of the repository page) for ready-made APA or BibTeX text. The DOI below always points to the latest version.

**Bahasa Melayu.** Jika anda menggunakan templat ini dalam pengajaran, penerbitan atau pembentangan, sila sitasikannya. Apabila artikel tentang templat ini diterbitkan, sila sitasikan artikel itu; sebelum itu gunakan rekod perisian di bawah. Butang "Cite this repository" di GitHub (kanan atas halaman repositori) menyediakan teks APA atau BibTeX siap pakai. DOI di bawah sentiasa menuju ke versi terkini.

Sharudin, R. W. (2026). *Course Landing Page Template* (v1.0.0). Zenodo. https://doi.org/10.5281/zenodo.24213008

Concept DOI (all versions) / DOI konsep (semua versi): shown on the Zenodo record page, under "Versions".
