# ABSENSI_KLASIK
Google Sheets, Google Appscript, Android Studio

# 📱 ScannerKu - Sistem Absensi Siswa Berbasis QR Code

ScannerKu adalah aplikasi Android berbasis Kotlin yang dirancang untuk mempermudah proses absensi siswa menggunakan pindai (scan) QR Code. Aplikasi ini terintegrasi secara langsung dengan **Google Sheets** secara *real-time* menggunakan Google Apps Script (tanpa perlu *database* eksternal seperti MySQL atau Firebase).

## ✨ Fitur Utama

- **🚀 Pindai Cepat & Kustom:** Menggunakan *library* ZXing dengan antarmuka kamera (garis bidik laser) yang sudah dikustomisasi agar terlihat modern.
- **📊 Sinkronisasi Google Sheets Real-Time:** Data absensi langsung masuk ke Google Sheets saat itu juga.
- **🤖 Automatisasi Bulan & Kolom:** Sistem di *server* akan otomatis membuat *Sheet* baru setiap berganti bulan (contoh: "Agustus 2026") dan membuat kolom tanggal secara otomatis.
- **🛡️ Anti-Spam / Absen Ganda:** Terdapat logika validasi untuk memblokir siswa yang mencoba absen lebih dari satu kali pada hari yang sama.
- **📈 Dasbor Rekapitulasi:** Terdapat menu Dasbor untuk melihat rekapitulasi kehadiran (Total Hadir, Sakit, Izin) langsung dari dalam aplikasi.
- **🔗 Jalan Pintas (Shortcut) Google Sheets:** Tersedia tombol untuk langsung membuka *file* Google Sheets asli di *browser* / aplikasi HP.

## 🛠️ Teknologi yang Digunakan

- **Bahasa Pemrograman:** Kotlin
- **IDE:** Android Studio
- **HTTP Client:** OkHttp3 (untuk mengirim dan menerima data JSON)
- **Barcode Scanner:** ZXing (Zebra Crossing) Android Embedded
- **Database/Backend:** Google Sheets & Google Apps Script (JavaScript)

## 📋 Cara Instalasi & Pengaturan

### 1. Pengaturan Google Sheets & Apps Script
1. Buat file Google Sheets baru dengan format berikut:
   - Buat *sheet* bernama **MASTERDATA** (Kolom A: NISN, Kolom C: Nama Siswa).
   - Buat *sheet* bernama **PERHITUNGAN** (Untuk menampung rumus rekapitulasi data).
2. Klik **Ekstensi > Apps Script** di Google Sheets Anda.
3. Masukkan kode *backend* (JavaScript) yang menangani `doGet` dan `doPost`.
4. Lakukan **Deploy** sebagai "Aplikasi Web" (Web App) dengan hak akses disetel ke **Siapa saja (Anyone)**.
5. Salin URL Web App yang dihasilkan.

### 2. Pengaturan Android Studio
1. *Clone* repositori ini:
   ```bash
   git clone [https://github.com/username-anda/nama-repo-anda.git](https://github.com/username-anda/nama-repo-anda.git)
