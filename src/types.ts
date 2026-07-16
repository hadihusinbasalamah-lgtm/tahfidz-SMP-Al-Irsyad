/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // usually auto-generated or same as noInduk
  noInduk: string;
  nama: string;
  kelasId: string; // e.g. "7A"
  musyrifId: string; // NIK of Musyrif
  musyrifNama: string;
}

export interface Class {
  id: string; // e.g. "7A"
  nama: string; // e.g. "7A"
}

export interface Musyrif {
  id: string; // NIK is the id
  nik: string;
  nama: string;
  jumlahSiswa: number;
  username: string;
  passwordHash: string; // stored as plain text or MD5/SHA in simple local app, but plain text is standard here for easy editing by admin and verification
}

export interface Capaian {
  id: string; // unique id (studentId + "_" + bulan)
  studentId: string;
  noInduk: string;
  namaSiswa: string;
  kelasId: string;
  kelasNama: string;
  musyrifId: string;
  musyrifNama: string;
  juz: string; // e.g. "30", "1", etc.
  capaianAwal: string; // e.g. "An-Naba 1-10"
  capaianAkhir: string; // e.g. "An-Nazi'at 1-20"
  totalBaris: number; // number of lines
  juziyyah: string; // "Lancar", "Belum Lancar", "Sudah Juziyyah", etc. or yes/no
  catatan: string;
  bulan: string; // e.g. "2026-07"
  updatedAt: string; // ISO String
}

export interface Settings {
  id: string;
  adminPassword?: string;
}
