<div align="center">

# ⚡ SkorLive

### Sistem Skor Olahraga Multi-Cabang

**Catat, tampilkan, dan arsipkan skor pertandingan secara real-time**  
Sepak Bola · Basket · Futsal · Voli · Badminton

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square)](https://zustand-demo.pmnd.rs)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Demo](#demo) · [Fitur](#-fitur) · [Instalasi](#-instalasi) · [Tech Stack](#-tech-stack) · [Kontribusi](#-kontribusi)

</div>

---

## 📌 Tentang Proyek

**SkorLive** adalah aplikasi web statis untuk mencatat dan menampilkan skor pertandingan olahraga secara *real-time*. Dibangun untuk panitia turnamen komunitas, operator scoring lapangan, dan penonton yang ingin mengikuti skor terkini.

> **Filosofi desain:** *"Stadion dalam Layar"* — energi tribun penonton yang hidup, informasi padat namun terorganisir, antarmuka yang terasa dibuat oleh manusia untuk manusia.

**Tidak butuh server. Tidak butuh login. Buka dan langsung pakai.**

---

## ✨ Fitur

### 🏆 Manajemen Pertandingan
- ⚡ **Live Scoring** — Input skor dengan satu klik, respons UI < 1 detik
- ↩️ **Undo** — Batalkan skor terakhir yang salah input
- ⏱️ **Timer Terintegrasi** — Stopwatch & countdown per cabang olahraga
- 📺 **Fullscreen Display Mode** — Tampilan proyektor/TV yang bersih
- 📋 **Histori Lengkap** — Timeline event skor per pertandingan

### 🏅 Turnamen
- 🗓️ **Generate Jadwal Otomatis** — Round Robin & Single Eliminasi
- 📊 **Klasemen Real-time** — Poin, GD, GF otomatis dihitung
- 🥇 **Penetapan Juara Otomatis** — Berdasarkan hasil akhir turnamen
- 📤 **Export JSON** — Download data pertandingan & turnamen

### 👥 Manajemen Tim
- 🎨 **Warna & Logo Kustom** — Upload logo lokal, pilih warna primer/sekunder
- 💾 **Library Tim** — Simpan tim untuk reuse di berbagai pertandingan
- 🔤 **Nama Singkat** — 4 karakter untuk display scoreboard kompak

### 🎨 Tampilan & Tema
- 5 tema visual yang bisa dipilih dan tersimpan persisten:
  - 🏟️ **Stadium** — Gelap profesional, aksen hijau lapangan *(default)*
  - 🏀 **Court** — Warm tone parket basket, oranye NBA
  - 🌙 **Night Game** — Biru malam dramatis, sorot kuning
  - 🔥 **Retro Pitch** — Merah bold komunitas lokal
  - 📋 **Minimal Sport** — Bersih formal, cocok presentasi
- 📱 **Mobile-First Responsive** — Touch target minimal 44×44px
- 🔠 **Typography Atletik** — Oswald + Inter + Roboto Mono

### 💾 Data & Privasi
- **Zero Backend** — Semua berjalan di browser, data tidak dikirim ke server
- **LocalStorage Persist** — Data tidak hilang saat tab ditutup
- **Immutable History** — Setiap perubahan skor tersimpan sebagai event

---

## 🚀 Instalasi

### Prasyarat
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/faizabdillahh/skorlive.git
cd skorlive

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
```

Buka browser di `http://localhost:5173`

### Build Production

```bash
npm run build
npm run preview
```

Output tersimpan di folder `dist/` — bisa langsung di-deploy ke Vercel, Netlify, atau GitHub Pages.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **UI Framework** | React 19 + TypeScript 5 (strict mode) |
| **Build Tool** | Vite (latest) |
| **Routing** | React Router 7 |
| **State Management** | Zustand 5 + Immer (immutable updates) |
| **Styling** | TailwindCSS 4 via `@tailwindcss/vite` + Vanilla CSS |
| **Icons** | Lucide React + Custom SVG Sport Icons |
| **Typography** | Oswald · Inter · Roboto Mono (via Fontsource) |
| **Tanggal/Waktu** | Day.js |
| **Persistence** | localStorage (Zustand persist middleware) |

---

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── icons/          # Custom SVG sport icons (no emoji)
│   ├── layout/         # AppLayout shell (sidebar + mobile drawer)
│   ├── match/          # MatchCard component
│   └── ui/             # TeamAvatar, StatusBadge, ConfirmDialog
├── lib/
│   ├── theme.ts        # 5 tema CSS custom properties
│   ├── sports-config.ts # Konfigurasi per cabang olahraga
│   └── utils.ts        # Helper functions
├── pages/
│   ├── DashboardPage.tsx
│   ├── LiveMatchPage.tsx    # Live scoreboard + timer
│   ├── MatchDetailPage.tsx
│   ├── HistoryPage.tsx
│   ├── TournamentsPage.tsx
│   ├── TournamentDetailPage.tsx
│   ├── NewMatchPage.tsx
│   ├── NewTournamentPage.tsx
│   ├── TeamsPage.tsx
│   └── SettingsPage.tsx
├── stores/
│   └── app-store.ts    # Zustand store (matches, teams, tournaments)
└── types/
    └── core.ts         # TypeScript types
```

---

## 🏈 Cabang Olahraga yang Didukung

| Olahraga | Periode | Timer | Tombol Skor |
|---|---|---|---|
| **Sepak Bola** | 2 Babak | Stopwatch | Gol, Bunuh Diri, Penalti |
| **Basket** | 4 Quarter | Countdown 10 min | +1 Free Throw, +2 Field Goal, +3 Three Point |
| **Futsal** | 2 Babak | Countdown 20 min | Gol, Bunuh Diri, Penalti |
| **Voli** | 5 Set (maks) | Stopwatch | Poin, Service Ace |
| **Badminton** | 3 Set (maks) | Stopwatch | Poin |

---

## 🗺️ Roadmap

- [x] Live scoring untuk 5 cabang olahraga
- [x] Turnamen round-robin & single eliminasi
- [x] 5 tema visual persisten
- [x] Undo skor, period advance
- [x] Export data ke JSON
- [x] Fullscreen display mode
- [ ] Export ringkasan ke PDF
- [ ] Animasi angka skor (number-flow)
- [ ] Double elimination bracket
- [ ] Mode suara (sound feedback)
- [ ] PWA support (offline-first)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

```bash
# Fork repository, lalu:
git checkout -b feat/nama-fitur
git commit -m "feat: deskripsi perubahan"
git push origin feat/nama-fitur
# Buat Pull Request
```

Harap ikuti konvensi commit: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">

Dibuat dengan ❤️ untuk komunitas olahraga Indonesia

**[⬆ Kembali ke atas](#-skorlive)**

</div>
