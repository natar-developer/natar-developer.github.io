# natar-developer.github.io

## Houdini's Notebook: Encrypted Data Workflow

Project ini memakai file terenkripsi untuk data aplikasi:

- Source plaintext (lokal): `apps/HoudinisNotebook/data.json`
- Output terenkripsi (dipakai aplikasi): `apps/HoudinisNotebook/data.enc`
- Script enkripsi: `scripts/encrypt-houdini-data.mjs`

Halaman `apps/HoudinisNotebook/index.html` hanya membaca `data.enc` dan meminta password untuk dekripsi di browser.

---

## Menjalankan Script Enkripsi

Jalankan dari root repository.

### Password via argumen

```bash
node scripts/encrypt-houdini-data.mjs --password=PASSWORD_BARU
```

## Ganti Password (Password Rotation)

Kalau ingin ganti password, cukup ulang enkripsi dari `data.json` dengan password baru.

1. Pastikan data terbaru sudah ada di `apps/HoudinisNotebook/data.json`.
2. Jalankan script enkripsi dengan password baru.
3. File `apps/HoudinisNotebook/data.enc` akan ter-overwrite otomatis.
4. Deploy perubahan file `data.enc` (dan perubahan kode jika ada).
5. Saat aplikasi dibuka, password lama tidak berlaku lagi; gunakan password baru.

Contoh cepat:

```bash
node scripts/encrypt-houdini-data.mjs --password=PASSWORD_BARU_2026
```

---

## Opsi Parameter Script

Script mendukung parameter berikut:

- `--in=` path file input (default: `apps/HoudinisNotebook/data.json`)
- `--out=` path file output (default: `apps/HoudinisNotebook/data.enc`)
- `--password=` password enkripsi (jika tidak diisi, ambil dari `HOUDINI_DATA_PASSWORD`)
- `--iter=` jumlah iterasi PBKDF2 (default: `310000`, minimum `100000`)

Contoh custom:

```bash
node scripts/encrypt-houdini-data.mjs \
	--in=apps/HoudinisNotebook/data.json \
	--out=apps/HoudinisNotebook/data.enc \
	--password=PASSWORD_BARU \
	--iter=350000
```

---

## Catatan Keamanan

- Jangan hardcode password di HTML/JS.
- Simpan password di password manager, bukan di repo.
- Jangan deploy `data.json` plaintext ke publik.
- Setiap kali password diganti, wajib regenerate `data.enc`.