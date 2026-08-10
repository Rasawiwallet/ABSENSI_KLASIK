import pandas as pd
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

# 1. Buka/Buat folder untuk menyimpan hasil gambar karcis
output_folder = "Hasil_Karcis"
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

print("Memulai proses pembuatan karcis...")

# 2. Baca data dari file CSV
try:
    df = pd.read_csv('data_siswa.csv', dtype={'NISN': str})
except FileNotFoundError:
    print("❌ Error: File 'data_siswa.csv' tidak ditemukan di folder ini.")
    exit()

# 3. Pengaturan Font 
try:
    font_judul = ImageFont.truetype("arial.ttf", 28)
    font_nama = ImageFont.truetype("arialbd.ttf", 24)
    font_label = ImageFont.truetype("arial.ttf", 18)
except IOError:
    print("⚠️ Font Arial tidak ditemukan, menggunakan font bawaan sistem.")
    font_judul = font_nama = font_label = ImageFont.load_default()

# 4. Looping: Proses pembuatan karcis satu per satu
for index, row in df.iterrows():
    # Ambil data NISN dan hilangkan akhiran .0 jika terbawa dari Excel
    nisn_mentah = str(row['NISN']).strip().replace('.0', '')
    nama = str(row['NAMA SISWA']).strip()

    # Lewati jika barisnya kosong (NaN)
    if pd.isna(row['NISN']) or nisn_mentah.lower() == 'nan' or nisn_mentah == '':
        continue

    # KUNCI RAHASIA: Paksa NISN menjadi 10 digit 
    nisn = nisn_mentah.zfill(10)

    # --- MEMBUAT DESAIN GAMBAR KARCIS ---
    
    # A. Buat Canvas / Kertas Karcis (DILEBARKAN MENJADI 800x300 pixel)
    karcis = Image.new('RGB', (800, 300), color=(240, 248, 255))
    draw = ImageDraw.Draw(karcis)

    # B. Buat QR Code dari NISN
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=8,
        border=2,
    )
    qr.add_data(nisn)
    qr.make(fit=True)
    
    img_qr = qr.make_image(fill_color="black", back_color="white").convert('RGB')

    # C. Tempel QR Code ke dalam Karcis
    karcis.paste(img_qr, (30, 40))

    # D. Tulis Teks ke dalam Karcis
    # Judul
    draw.text((260, 40), "KARTU ABSENSI SISWA", fill=(23, 37, 84), font=font_judul)
    
    # Garis pembatas (DIPERPANJANG hingga titik X=760 agar selaras dengan lebar canvas)
    draw.line((260, 80, 760, 80), fill=(37, 99, 235), width=4) 

    # Label Nama
    draw.text((260, 130), "Nama Siswa:", fill=(100, 100, 100), font=font_label)
    
    # Teks Nama Siswa
    draw.text((260, 160), nama, fill=(0, 0, 0), font=font_nama)

    # E. Simpan Karcis sebagai gambar PNG
    nama_file = f"{output_folder}/Karcis_{nisn}.png"
    karcis.save(nama_file)
    print(f"✅ Berhasil membuat: Karcis_{nisn}.png ({nama})")

print("\n🎉 SELESAI! Semua karcis berhasil dibuat dan disimpan di folder 'Hasil_Karcis'.")