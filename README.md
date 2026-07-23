# Bilens Booth

> **MAKE THE MOMENT FOR FREE.**

Bilens Booth adalah aplikasi Web Photobooth Analog yang 100% berjalan di sisi klien (_client-side_) dengan memprioritaskan privasi. Didesain dengan estetika _brutalist_ yang tegas, aplikasi ini memungkinkan pengguna untuk mengambil foto, memproses, dan mencetak _photo strip_ berkualitas tinggi langsung di dalam browser tanpa pernah mengirim satu piksel pun ke server.

## Features

- **100% Client-Side Processing**: Zero server uploads. Absolute privacy.
- **Native Canvas Graphics Engine**: Pixel-level image manipulation and layout rendering using pure HTML5 Canvas API—no external libraries like Fabric.js or CamanJS.
- **Chemical Filters**: 6 carefully crafted analog filters including Silver B&W, Sepia Grain, Cross Process, Lomo, and Expired Film, featuring a seeded PRNG for consistent film grain.
- **Format Options**: Choose between the classic vertical **Standard Strip (1×4)** (complete with film sprocket holes) or the square **Evidence Grid (2×2)**.
- **Customization**:
  - 4 brutalist frame colors (Paper Base, Ink Black, Blood Red, Kodak Yellow).
  - Custom text stamping for event names.
- **Progressive Web App (PWA)**: Installable on mobile and desktop, fully offline capable.
- **Session Archive**: Automatically saves a history of your photo sessions locally to your device.
- **Web Share API**: Share your final evidence directly to social media or other apps (on supported devices).
- **Responsive & Accessible**: Works flawlessly on desktop and mobile, with support for `prefers-reduced-motion` and camera flipping.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS (Custom configuration)
- **APIs**: Native WebRTC (Camera), HTML5 Canvas (Rendering Engine), Web Share API (Export)

## Cara Instalasi

### Prasyarat

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 16 ke atas).

### Langkah-langkah

1. Clone repositori ini:

   ```bash
   git clone https://github.com/yourusername/bilens-booth.git
   cd bilens-booth
   ```

2. Instal semua dependensi:

   ```bash
   npm install
   ```

3. Jalankan development server:

   ```bash
   npm run dev
   ```

4. Buka browser Anda dan akses URL `http://localhost:5173` (atau port lain yang tertera di terminal).

## Build untuk Produksi

Untuk membuat _build_ produksi yang sudah dioptimasi:

```bash
npm run build
```

Perintah ini akan menghasilkan folder `dist` yang berisi aset siap pakai, yang bisa langsung di-_hosting_ di layanan statis manapun (seperti Vercel, Netlify, atau GitHub Pages).

## Kebijakan Privasi

**TANPA UNGGAHAN. TANPA PELACAKAN. TANPA ANALITIK.**
Semua proses terjadi secara lokal di perangkat Anda. Akses video langsung digambar ke elemen `<canvas>` di dalam memori, dan hasil akhir di-_generate_ sebagai `dataURL` untuk diunduh atau dibagikan. Riwayat sesi disimpan secara eksklusif hanya di `localStorage` browser Anda.
