# RECOVERY RUNBOOK: CLOSINGAN Database

Dokumen ini adalah panduan langkah demi langkah untuk memulihkan (*restore*) database CLOSINGAN jika terjadi insiden atau kehilangan data.

## Prasyarat
- `aws-cli` terinstal dan sudah terotentikasi.
- `openssl` dan `gunzip` terinstal di server tujuan.
- Memiliki `BACKUP_PASSWORD` yang digunakan saat proses enkripsi (tersimpan di *Secret Manager* atau brankas aman).
- Akses kredensial database target (PostgreSQL).

## Langkah Pemulihan (Recovery)

### 1. Download Backup dari S3
Cari dan download file backup terbaru dari *bucket* S3.
```bash
# Ganti tanggal dengan versi backup yang diinginkan
aws s3 cp s3://<nama-bucket>/backups/backup_20260709080000.sql.gz.enc ./backup_restore.sql.gz.enc
```

### 2. Dekripsi File Backup
Dekripsi file menggunakan *password* enkripsi.
```bash
openssl enc -d -aes-256-cbc -pbkdf2 -in backup_restore.sql.gz.enc -out backup_restore.sql.gz -pass pass:"<MASUKKAN_BACKUP_PASSWORD>"
```

### 3. Ekstrak File Backup
Unzip hasil dekripsi.
```bash
gunzip backup_restore.sql.gz
# Akan menghasilkan file backup_restore.sql
```

### 4. Restore ke Database PostgreSQL
Ganti `<DATABASE_URL>` dengan URL koneksi database tujuan (contoh: `postgresql://user:password@localhost:5432/closingan_prod`).

> **PERINGATAN**: Pastikan Anda me-restore ke database yang benar. Sangat disarankan untuk me-restore ke database *staging* atau database kosong terlebih dahulu untuk verifikasi!

```bash
psql "<DATABASE_URL>" -f backup_restore.sql
```

### 5. Verifikasi Data (Sanity Check)
Setelah *restore* selesai, lakukan verifikasi data minimal dengan cara:
1. Hitung jumlah *Tenant*: `SELECT count(*) FROM "Tenant";`
2. Cek user aktif.
3. Pastikan tidak ada data sensitif yang hilang.

## Point-in-Time Recovery (PITR)
Jika Anda menggunakan *managed database* (seperti AWS RDS atau Supabase), proses PITR sebaiknya dilakukan lewat *dashboard* *provider* karena jauh lebih cepat dan akurat (biasanya < 5 menit). Skrip manual ini bertindak sebagai asuransi *backup* level-aplikasi (*off-site backup*).
