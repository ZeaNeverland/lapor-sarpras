-- Database Schema untuk Sistem Laporan Sarana dan Prasarana

CREATE DATABASE IF NOT EXISTS sarpras_db;
USE sarpras_db;

-- Tabel Users (Admin & Pengguna)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Sarana Prasarana
CREATE TABLE sarpras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_sarpras VARCHAR(50) UNIQUE NOT NULL,
    nama_sarpras VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    lokasi VARCHAR(100) NOT NULL,
    kondisi ENUM('baik', 'rusak_ringan', 'rusak_berat') DEFAULT 'baik',
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Laporan Kerusakan
CREATE TABLE laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sarpras_id INT NOT NULL,
    user_id INT NOT NULL,
    deskripsi TEXT NOT NULL,
    lokasi VARCHAR(100) NOT NULL,
    foto VARCHAR(255),
    tanggal_laporan DATE NOT NULL,
    status ENUM('menunggu', 'diproses', 'selesai') DEFAULT 'menunggu',
    catatan_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sarpras_id) REFERENCES sarpras(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert data dummy untuk testing

-- Insert Admin dan User
INSERT INTO users (username, password, nama, email, role) VALUES
('admin', '$2a$10$xqZF7b0vYJKQ5b0Xj8k7rO8qC4v4Xx1.H3fCZYzN.mZY2cP7/jh5K', 'Administrator', 'admin@sarpras.com', 'admin'),
('user1', '$2a$10$xqZF7b0vYJKQ5b0Xj8k7rO8qC4v4Xx1.H3fCZYzN.mZY2cP7/jh5K', 'User Satu', 'user1@sarpras.com', 'user');
-- Password untuk keduanya: password123

-- Insert Sarana Prasarana
INSERT INTO sarpras (kode_sarpras, nama_sarpras, kategori, lokasi, kondisi) VALUES
('SPR-001', 'Proyektor Epson', 'Elektronik', 'Ruang Kelas A1', 'baik'),
('SPR-002', 'Kursi Kuliah', 'Furniture', 'Ruang Kelas A2', 'rusak_ringan'),
('SPR-003', 'AC Split 1.5 PK', 'Elektronik', 'Ruang Kelas B1', 'baik'),
('SPR-004', 'Papan Tulis Whiteboard', 'Perlengkapan', 'Ruang Kelas B2', 'rusak_ringan'),
('SPR-005', 'Komputer Lab', 'Elektronik', 'Lab Komputer', 'baik');

-- Insert Laporan
INSERT INTO laporan (sarpras_id, user_id, deskripsi, lokasi, tanggal_laporan, status) VALUES
(2, 2, 'Kursi patah di bagian kaki, tidak stabil saat diduduki', 'Ruang Kelas A2', '2025-12-20', 'menunggu'),
(4, 2, 'Papan tulis tidak bisa dihapus dengan bersih, perlu diganti', 'Ruang Kelas B2', '2025-12-22', 'diproses');
