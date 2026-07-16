/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, Class, Musyrif, Capaian } from "../types";
import {
  Users,
  School,
  UserCheck,
  FileText,
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  Lock,
  Printer,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Upload
} from "lucide-react";
import BulkUploadModal from "./BulkUploadModal";

interface AdminPanelProps {
  students: Student[];
  classes: Class[];
  musyrifs: Musyrif[];
  capaians: Capaian[];
  onSaveStudent: (student: Student) => Promise<void>;
  onSaveStudentsBatch: (students: Student[]) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onSaveClass: (classData: Class) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  onSaveMusyrif: (musyrif: Musyrif) => Promise<void>;
  onDeleteMusyrif: (id: string) => Promise<void>;
  onUpdateAdminPassword: (newPass: string) => Promise<void>;
  onClearAllCapaians: () => Promise<void>;
  onTriggerPrint: (filters: { classId?: string; level?: string; musyrifId?: string; bulan: string }) => void;
  onLogout: () => void;
  adminPass: string;
}

type TabType = "siswa" | "kelas" | "musyrif" | "laporan" | "pengaturan";

export default function AdminPanel({
  students,
  classes,
  musyrifs,
  capaians,
  onSaveStudent,
  onSaveStudentsBatch,
  onDeleteStudent,
  onSaveClass,
  onDeleteClass,
  onSaveMusyrif,
  onDeleteMusyrif,
  onUpdateAdminPassword,
  onClearAllCapaians,
  onTriggerPrint,
  onLogout,
  adminPass,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("siswa");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterMusyrif, setFilterMusyrif] = useState("");
  const [studentPage, setStudentPage] = useState(1);

  useEffect(() => {
    setStudentPage(1);
  }, [searchQuery, filterClass, filterMusyrif]);

  // Report filters state
  const [reportFilterClass, setReportFilterClass] = useState("");
  const [reportFilterLevel, setReportFilterLevel] = useState("");
  const [reportFilterMusyrif, setReportFilterMusyrif] = useState("");
  const [reportBulan, setReportBulan] = useState("2026-07");

  // Form states for modals/editors
  const [studentForm, setStudentForm] = useState<Partial<Student> | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [classForm, setClassForm] = useState<Partial<Class> | null>(null);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [musyrifForm, setMusyrifForm] = useState<Partial<Musyrif> | null>(null);

  // Settings form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- STUDENT HANDLERS ---
  const handleSaveStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm?.noInduk || !studentForm?.nama || !studentForm?.kelasId || !studentForm?.musyrifId) {
      showNotification("Semua field siswa harus diisi!", "error");
      return;
    }

    // Find musyrif name for storage
    const m = musyrifs.find((x) => x.id === studentForm.musyrifId);
    const mNama = m ? m.nama : "";

    const studentToSave: Student = {
      id: studentForm.id || studentForm.noInduk,
      noInduk: studentForm.noInduk,
      nama: studentForm.nama,
      kelasId: studentForm.kelasId,
      musyrifId: studentForm.musyrifId,
      musyrifNama: mNama,
    };

    try {
      await onSaveStudent(studentToSave);
      showNotification("Siswa berhasil disimpan!");
      setStudentForm(null);
    } catch (err) {
      showNotification("Gagal menyimpan siswa", "error");
    }
  };

  const handleDeleteStudentClick = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        await onDeleteStudent(id);
        showNotification("Siswa berhasil dihapus!");
      } catch (err) {
        showNotification("Gagal menghapus siswa", "error");
      }
    }
  };

  // --- CLASS HANDLERS ---
  const handleSaveClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm?.id || !classForm?.nama) {
      showNotification("Semua field kelas harus diisi!", "error");
      return;
    }

    const classToSave: Class = {
      id: classForm.id.trim().toUpperCase(),
      nama: classForm.nama,
    };

    try {
      await onSaveClass(classToSave);
      showNotification("Kelas berhasil disimpan!");
      setClassForm(null);
    } catch (err) {
      showNotification("Gagal menyimpan kelas", "error");
    }
  };

  const handleDeleteClassClick = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      try {
        await onDeleteClass(id);
        showNotification("Kelas berhasil dihapus!");
      } catch (err) {
        showNotification("Gagal menghapus kelas", "error");
      }
    }
  };

  // --- MUSYRIF HANDLERS ---
  const handleSaveMusyrifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musyrifForm?.nik || !musyrifForm?.nama || !musyrifForm?.username || !musyrifForm?.passwordHash) {
      showNotification("Semua field musyrif harus diisi!", "error");
      return;
    }

    const musyrifToSave: Musyrif = {
      id: musyrifForm.id || musyrifForm.nik,
      nik: musyrifForm.nik,
      nama: musyrifForm.nama,
      jumlahSiswa: musyrifForm.jumlahSiswa || 0,
      username: musyrifForm.username.toLowerCase(),
      passwordHash: musyrifForm.passwordHash,
    };

    try {
      await onSaveMusyrif(musyrifToSave);
      showNotification("Musyrif berhasil disimpan!");
      setMusyrifForm(null);
    } catch (err) {
      showNotification("Gagal menyimpan musyrif", "error");
    }
  };

  const handleDeleteMusyrifClick = async (id: string) => {
    if (confirm("Menghapus Musyrif akan melepaskan relasi dari siswa terkait. Lanjutkan?")) {
      try {
        await onDeleteMusyrif(id);
        showNotification("Musyrif berhasil dihapus!");
      } catch (err) {
        showNotification("Gagal menghapus musyrif", "error");
      }
    }
  };

  const handleClearAllCapaiansClick = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data hasil inputan capaian tahfidz? Tindakan ini bersifat permanen dan tidak dapat dibatalkan!")) {
      try {
        await onClearAllCapaians();
        showNotification("Semua data hasil capaian tahfidz berhasil dihapus!");
      } catch (err) {
        showNotification("Gagal menghapus data capaian", "error");
      }
    }
  };

  // --- PASSWORD UPDATE ---
  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPassword !== adminPass) {
      showNotification("Password lama salah!", "error");
      return;
    }
    if (newPassword.length < 4) {
      showNotification("Password baru minimal 4 karakter!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("Konfirmasi password tidak cocok!", "error");
      return;
    }

    try {
      await onUpdateAdminPassword(newPassword);
      showNotification("Password Admin berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showNotification("Gagal memperbarui password", "error");
    }
  };

  // --- FILTERED ARRAYS ---
  const filteredStudentsList = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.noInduk.includes(searchQuery);
    const matchClass = filterClass ? s.kelasId === filterClass : true;
    const matchMusyrif = filterMusyrif ? s.musyrifId === filterMusyrif : true;
    return matchSearch && matchClass && matchMusyrif;
  });

  const ITEMS_PER_PAGE = 20;
  const totalStudentsCount = filteredStudentsList.length;
  const totalStudentPages = Math.ceil(totalStudentsCount / ITEMS_PER_PAGE) || 1;
  const safeStudentPage = Math.min(Math.max(1, studentPage), totalStudentPages);
  const paginatedStudentsList = filteredStudentsList.slice(
    (safeStudentPage - 1) * ITEMS_PER_PAGE,
    safeStudentPage * ITEMS_PER_PAGE
  );
  const startIdx = totalStudentsCount === 0 ? 0 : (safeStudentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(safeStudentPage * ITEMS_PER_PAGE, totalStudentsCount);

  const filteredCapaiansReport = capaians.filter((c) => {
    const matchClass = reportFilterClass ? c.kelasId === reportFilterClass : true;
    const matchLevel = reportFilterLevel ? c.kelasId.startsWith(reportFilterLevel) : true;
    const matchMusyrif = reportFilterMusyrif ? c.musyrifId === reportFilterMusyrif : true;
    const matchBulan = c.bulan === reportBulan;
    return matchClass && matchLevel && matchMusyrif && matchBulan;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-brand-800 text-white shrink-0 shadow-lg hidden md:flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-3 border-b border-brand-700 pb-5 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-inner shrink-0">
              <img
                src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png"
                alt="Logo Al Irsyad"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-tight">TAFHIDZ AL IRSYAD</h1>
              <span className="text-[10px] text-brand-100 font-semibold tracking-wider uppercase">ADMIN PORTAL</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("siswa"); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "siswa" ? "bg-white text-brand-800 shadow-md" : "text-brand-100 hover:bg-brand-700/50"
              }`}
              id="sidebar-tab-siswa"
            >
              <Users className="w-4 h-4" /> Kelola Siswa
            </button>
            <button
              onClick={() => setActiveTab("kelas")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "kelas" ? "bg-white text-brand-800 shadow-md" : "text-brand-100 hover:bg-brand-700/50"
              }`}
              id="sidebar-tab-kelas"
            >
              <School className="w-4 h-4" /> Kelola Kelas
            </button>
            <button
              onClick={() => setActiveTab("musyrif")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "musyrif" ? "bg-white text-brand-800 shadow-md" : "text-brand-100 hover:bg-brand-700/50"
              }`}
              id="sidebar-tab-musyrif"
            >
              <UserCheck className="w-4 h-4" /> Kelola Musyrif
            </button>
            <button
              onClick={() => setActiveTab("laporan")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "laporan" ? "bg-white text-brand-800 shadow-md" : "text-brand-100 hover:bg-brand-700/50"
              }`}
              id="sidebar-tab-laporan"
            >
              <FileText className="w-4 h-4" /> Data Laporan
            </button>
            <button
              onClick={() => setActiveTab("pengaturan")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "pengaturan" ? "bg-white text-brand-800 shadow-md" : "text-brand-100 hover:bg-brand-700/50"
              }`}
              id="sidebar-tab-pengaturan"
            >
              <SettingsIcon className="w-4 h-4" /> Pengaturan
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-brand-700 bg-brand-900/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold border border-brand-500">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-brand-200 truncate">SMP Al Irsyad</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-600/30 hover:bg-rose-600 hover:text-white text-rose-200 text-xs font-bold rounded-lg transition-all border border-rose-500/30"
            id="btn-logout-admin"
          >
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header navbar for mobile */}
        <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="md:hidden font-extrabold text-brand-800 text-sm">Tahfidz Al Irsyad</span>
            <span className="text-xs text-slate-400 hidden md:inline">SMP Al Irsyad Surakarta &bull; Dashboard Utama</span>
          </div>
          <button
            onClick={onLogout}
            className="md:hidden text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            Keluar
          </button>
        </header>

        {/* Mobile quick tabs */}
        <div className="md:hidden flex bg-white border-b border-slate-200 p-1.5 overflow-x-auto scrollbar-none sticky top-[53px] z-10 gap-1">
          <button
            onClick={() => setActiveTab("siswa")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === "siswa" ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
          >
            Siswa
          </button>
          <button
            onClick={() => setActiveTab("kelas")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === "kelas" ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
          >
            Kelas
          </button>
          <button
            onClick={() => setActiveTab("musyrif")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === "musyrif" ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
          >
            Musyrif
          </button>
          <button
            onClick={() => setActiveTab("laporan")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === "laporan" ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
          >
            Laporan
          </button>
          <button
            onClick={() => setActiveTab("pengaturan")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === "pengaturan" ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
          >
            Sandi
          </button>
        </div>

        {/* Main interactive stage */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Universal notification banner */}
          {notification && (
            <div className={`p-4 rounded-xl shadow-md flex items-center gap-3 border ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            } animate-slideIn`}>
              <CheckCircle className={`w-5 h-5 shrink-0 ${notification.type === "success" ? "text-emerald-500" : "text-rose-500"}`} />
              <p className="text-sm font-semibold">{notification.text}</p>
            </div>
          )}

          {/* ----------------- TAB SISWA ----------------- */}
          {activeTab === "siswa" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Data Siswa</h2>
                  <p className="text-sm text-slate-500 mt-1">Daftar siswa tahfidz SMP Al Irsyad Surakarta.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsBulkUploadOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-brand-700 border border-brand-200 font-bold rounded-xl shadow-sm transition-all text-sm transform active:scale-95"
                    id="btn-bulk-siswa"
                  >
                    <Upload className="w-4 h-4" /> Import Masal (CSV)
                  </button>
                  <button
                    onClick={() => setStudentForm({ noInduk: "", nama: "", kelasId: "", musyrifId: "" })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm transition-all text-sm transform active:scale-95"
                    id="btn-add-siswa"
                  >
                    <Plus className="w-4 h-4" /> Tambah Siswa
                  </button>
                </div>
              </div>

              {/* Student form modal */}
              {studentForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 max-w-xl">
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    {studentForm.id ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                  </h3>
                  <form onSubmit={handleSaveStudentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. Induk</label>
                        <input
                          type="text"
                          required
                          disabled={!!studentForm.id}
                          value={studentForm.noInduk || ""}
                          onChange={(e) => setStudentForm({ ...studentForm, noInduk: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm disabled:bg-slate-100"
                          placeholder="Contoh: 1006"
                          id="form-siswa-noinduk"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={studentForm.nama || ""}
                          onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          placeholder="Nama lengkap siswa"
                          id="form-siswa-nama"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kelas</label>
                        <select
                          required
                          value={studentForm.kelasId || ""}
                          onChange={(e) => setStudentForm({ ...studentForm, kelasId: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                          id="form-siswa-kelas"
                        >
                          <option value="">Pilih Kelas</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Musyrif Pembimbing</label>
                        <select
                          required
                          value={studentForm.musyrifId || ""}
                          onChange={(e) => setStudentForm({ ...studentForm, musyrifId: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                          id="form-siswa-musyrif"
                        >
                          <option value="">Pilih Musyrif</option>
                          {musyrifs.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStudentForm(null)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50"
                        id="form-siswa-cancel"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-700 text-white font-bold rounded-lg text-sm hover:bg-brand-800"
                        id="form-siswa-submit"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filters & Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari siswa berdasarkan nama atau No Induk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-700 bg-white"
                      id="search-siswa-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700"
                      id="filter-siswa-kelas"
                    >
                      <option value="">Semua Kelas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nama}</option>
                      ))}
                    </select>
                    <select
                      value={filterMusyrif}
                      onChange={(e) => setFilterMusyrif(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 max-w-xs"
                      id="filter-siswa-musyrif"
                    >
                      <option value="">Semua Musyrif</option>
                      {musyrifs.map((m) => (
                        <option key={m.id} value={m.id}>{m.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                        <th className="py-3 px-6">No. Induk</th>
                        <th className="py-3 px-6">Nama Siswa</th>
                        <th className="py-3 px-6">Kelas</th>
                        <th className="py-3 px-6">Nama Musyrif</th>
                        <th className="py-3 px-6 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedStudentsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 px-6 text-center text-slate-400 italic">
                            Tidak ada data siswa yang cocok dengan kriteria pencarian.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudentsList.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-700">{s.noInduk}</td>
                            <td className="py-3.5 px-6 font-semibold text-slate-900">{s.nama}</td>
                            <td className="py-3.5 px-6">
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
                                {s.kelasId}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-slate-600">{s.musyrifNama || "Belum ditugaskan"}</td>
                            <td className="py-3.5 px-6">
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => setStudentForm(s)}
                                  className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                                  title="Edit Siswa"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudentClick(s.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Menampilkan <strong>{startIdx} - {endIdx}</strong> dari total <strong>{totalStudentsCount}</strong> siswa terfilter (Total {students.length} siswa).
                    </span>
                  </div>

                  {totalStudentPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setStudentPage(1)}
                        disabled={safeStudentPage === 1}
                        className="px-2 py-1 rounded border border-slate-200 text-[11px] bg-white text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Halaman Pertama"
                      >
                        Awal
                      </button>
                      <button
                        onClick={() => setStudentPage((prev) => Math.max(1, prev - 1))}
                        disabled={safeStudentPage === 1}
                        className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Render numbered buttons with smart ellipses */}
                      {Array.from({ length: totalStudentPages }, (_, i) => i + 1)
                        .filter((p) => {
                          return p === 1 || p === totalStudentPages || Math.abs(p - safeStudentPage) <= 1;
                        })
                        .map((p, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && p - prevPage > 1;

                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span className="px-1 text-xs text-slate-400">...</span>}
                              <button
                                onClick={() => setStudentPage(p)}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                                  safeStudentPage === p
                                    ? "bg-brand-700 border-brand-700 text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setStudentPage((prev) => Math.min(totalStudentPages, prev + 1))}
                        disabled={safeStudentPage === totalStudentPages}
                        className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Halaman Selanjutnya"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setStudentPage(totalStudentPages)}
                        disabled={safeStudentPage === totalStudentPages}
                        className="px-2 py-1 rounded border border-slate-200 text-[11px] bg-white text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Halaman Terakhir"
                      >
                        Akhir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Upload Modal */}
              <BulkUploadModal
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                classes={classes}
                musyrifs={musyrifs}
                onImport={async (batchStudents) => {
                  try {
                    await onSaveStudentsBatch(batchStudents);
                    showNotification(`Berhasil mengimpor ${batchStudents.length} siswa!`);
                  } catch (err) {
                    showNotification("Gagal mengimpor data siswa", "error");
                    throw err;
                  }
                }}
              />
            </div>
          )}

          {/* ----------------- TAB KELAS ----------------- */}
          {activeTab === "kelas" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Data Kelas</h2>
                  <p className="text-sm text-slate-500 mt-1">Daftar kelas aktif di lingkungan SMP Al Irsyad Surakarta.</p>
                </div>
                <button
                  onClick={() => {
                    setClassForm({ id: "", nama: "" });
                    setIsEditingClass(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm transition-all text-sm transform active:scale-95"
                  id="btn-add-kelas"
                >
                  <Plus className="w-4 h-4" /> Tambah Kelas
                </button>
              </div>

              {/* Class Form Modal */}
              {classForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 max-w-xl">
                  <h3 className="text-base font-bold text-slate-800 mb-4">
                    {isEditingClass ? "Edit Data Kelas" : "Tambah Kelas Baru"}
                  </h3>
                  <form onSubmit={handleSaveClassSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID / Kode Kelas</label>
                        <input
                          type="text"
                          required
                          disabled={isEditingClass} // ID is unique key e.g. KELAS7A
                          value={classForm.id || ""}
                          onChange={(e) => setClassForm({ ...classForm, id: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm disabled:bg-slate-100 uppercase font-mono"
                          placeholder="Huruf & angka, bisa > 5 karakter"
                          id="form-kelas-id"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">Bisa kombinasi huruf dan angka, tanpa batasan panjang karakter (contoh: KELAS7A, SMP1B).</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Deskriptif</label>
                        <input
                          type="text"
                          required
                          value={classForm.nama || ""}
                          onChange={(e) => setClassForm({ ...classForm, nama: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          placeholder="Contoh: Kelas 7A"
                          id="form-kelas-nama"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setClassForm(null)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50"
                        id="form-kelas-cancel"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-700 text-white font-bold rounded-lg text-sm hover:bg-brand-800"
                        id="form-kelas-submit"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Classes Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                        <th className="py-3.5 px-6">Kode Kelas</th>
                        <th className="py-3.5 px-6">Nama Kelas</th>
                        <th className="py-3.5 px-6 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-10 px-6 text-center text-slate-400 italic">
                            Belum ada data kelas yang didaftarkan.
                          </td>
                        </tr>
                      ) : (
                        classes.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-6 font-bold text-brand-700">{c.id}</td>
                            <td className="py-3 px-6 font-semibold text-slate-800">{c.nama}</td>
                            <td className="py-3 px-6">
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setClassForm(c);
                                    setIsEditingClass(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                                  title="Edit Kelas"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClassClick(c.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Hapus Kelas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB MUSYRIF ----------------- */}
          {activeTab === "musyrif" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Data Musyrif</h2>
                  <p className="text-sm text-slate-500 mt-1">Mengelola akun dan biodata pembimbing tahfidz (Musyrif).</p>
                </div>
                <button
                  onClick={() => setMusyrifForm({ nik: "", nama: "", username: "", passwordHash: "" })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm transition-all text-sm transform active:scale-95"
                  id="btn-add-musyrif"
                >
                  <Plus className="w-4 h-4" /> Tambah Musyrif
                </button>
              </div>

              {/* Musyrif Form Modal */}
              {musyrifForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 max-w-xl">
                  <h3 className="text-base font-bold text-slate-800 mb-4">
                    {musyrifForm.id ? "Edit Akun Musyrif" : "Tambah Musyrif Baru"}
                  </h3>
                  <form onSubmit={handleSaveMusyrifSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIK (Nomor Induk Karyawan)</label>
                        <input
                          type="text"
                          required
                          disabled={!!musyrifForm.id}
                          value={musyrifForm.nik || ""}
                          onChange={(e) => setMusyrifForm({ ...musyrifForm, nik: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm disabled:bg-slate-100 font-mono"
                          placeholder="Contoh: 19940101"
                          id="form-musyrif-nik"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap & Gelar</label>
                        <input
                          type="text"
                          required
                          value={musyrifForm.nama || ""}
                          onChange={(e) => setMusyrifForm({ ...musyrifForm, nama: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          placeholder="Ust. Fulan, Lc"
                          id="form-musyrif-nama"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username Login</label>
                        <input
                          type="text"
                          required
                          value={musyrifForm.username || ""}
                          onChange={(e) => setMusyrifForm({ ...musyrifForm, username: e.target.value.replace(/\s+/g, "") })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono lowercase"
                          placeholder="contoh: fulan"
                          id="form-musyrif-username"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sandi / Password</label>
                        <input
                          type="text"
                          required
                          value={musyrifForm.passwordHash || ""}
                          onChange={(e) => setMusyrifForm({ ...musyrifForm, passwordHash: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          placeholder="Password akun"
                          id="form-musyrif-password"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setMusyrifForm(null)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50"
                        id="form-musyrif-cancel"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-700 text-white font-bold rounded-lg text-sm hover:bg-brand-800"
                        id="form-musyrif-submit"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Musyrif Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                        <th className="py-3.5 px-6">NIK</th>
                        <th className="py-3.5 px-6">Nama Lengkap</th>
                        <th className="py-3.5 px-6">Binaan Siswa</th>
                        <th className="py-3.5 px-6 font-mono">Username</th>
                        <th className="py-3.5 px-6">Sandi Aktif</th>
                        <th className="py-3.5 px-6 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {musyrifs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 px-6 text-center text-slate-400 italic">
                            Belum ada musyrif yang terdaftar.
                          </td>
                        </tr>
                      ) : (
                        musyrifs.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-6 font-mono text-slate-500">{m.nik}</td>
                            <td className="py-3 px-6 font-semibold text-slate-900">{m.nama}</td>
                            <td className="py-3 px-6 font-bold text-slate-700">
                              {m.jumlahSiswa} Siswa
                            </td>
                            <td className="py-3 px-6 font-mono text-slate-600 bg-slate-50/50">{m.username}</td>
                            <td className="py-3 px-6 text-slate-500 font-mono">{m.passwordHash}</td>
                            <td className="py-3 px-6">
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => setMusyrifForm(m)}
                                  className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                                  title="Edit Musyrif"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMusyrifClick(m.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Hapus Musyrif"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB LAPORAN CHECKER ----------------- */}
          {activeTab === "laporan" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Data Laporan & Capaian</h2>
                <p className="text-sm text-slate-500 mt-1">Mengontrol inputan Musyrif berdasarkan filter kelas dan pembina.</p>
              </div>

              {/* Filtering Controls Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Filter Laporan & Cetak</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Bulan Periode</label>
                    <input
                      type="month"
                      value={reportBulan}
                      onChange={(e) => setReportBulan(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                      id="report-bulan-select"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Kelas (Spesifik)</label>
                    <select
                      value={reportFilterClass}
                      onChange={(e) => {
                        setReportFilterClass(e.target.value);
                        setReportFilterLevel(""); // Clear level to avoid double filters
                      }}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                      id="report-kelas-select"
                    >
                      <option value="">Semua Kelas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Atau Jenjang (Perjenjang)</label>
                    <select
                      value={reportFilterLevel}
                      onChange={(e) => {
                        setReportFilterLevel(e.target.value);
                        setReportFilterClass(""); // Clear specific class to avoid conflicts
                      }}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                      id="report-level-select"
                    >
                      <option value="">Semua Jenjang</option>
                      <option value="7">Jenjang Kelas 7</option>
                      <option value="8">Jenjang Kelas 8</option>
                      <option value="9">Jenjang Kelas 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Berdasarkan Musyrif</label>
                    <select
                      value={reportFilterMusyrif}
                      onChange={(e) => setReportFilterMusyrif(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                      id="report-musyrif-select"
                    >
                      <option value="">Semua Musyrif</option>
                      {musyrifs.map((m) => (
                        <option key={m.id} value={m.id}>{m.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onTriggerPrint({
                      classId: reportFilterClass || undefined,
                      level: reportFilterLevel || undefined,
                      musyrifId: reportFilterMusyrif || undefined,
                      bulan: reportBulan
                    })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm text-xs transition-all transform active:scale-95"
                    id="btn-print-from-admin"
                  >
                    <Printer className="w-4 h-4" /> Buka Cetak Laporan
                  </button>
                </div>
              </div>

              {/* Report Tables of Musyrif Input */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hasil Inputan Capaian Tahfidz</h3>
                  {capaians.length > 0 && (
                    <button
                      onClick={handleClearAllCapaiansClick}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors shadow-sm border border-rose-200 transform active:scale-95"
                      id="btn-delete-all-capaian"
                    >
                      <Trash2 className="w-3.5 h-3.5 animate-pulse" /> Hapus Semua Data Capaian
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Siswa</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4 w-12 text-center">Juz</th>
                        <th className="py-3 px-4">Awal Bulan</th>
                        <th className="py-3 px-4">Akhir Bulan</th>
                        <th className="py-3 px-4 w-20 text-center">Baris</th>
                        <th className="py-3 px-4 text-center">Juziyyah</th>
                        <th className="py-3 px-4">Catatan Musyrif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCapaiansReport.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 px-6 text-center text-slate-400 italic">
                            Belum ada input capaian untuk kriteria & bulan yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        filteredCapaiansReport.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-950">{c.namaSiswa}</div>
                              <span className="text-[10px] text-slate-400 font-mono">Induk: {c.noInduk}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[10px]">
                                {c.kelasId}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-brand-800">{c.juz}</td>
                            <td className="py-3 px-4 text-slate-700">{c.capaianAwal || "-"}</td>
                            <td className="py-3 px-4 text-slate-700">{c.capaianAkhir || "-"}</td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{c.totalBaris}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.juziyyah === "Lancar" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {c.juziyyah}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate" title={c.catatan}>
                              {c.catatan || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB PENGATURAN PASSWORD ----------------- */}
          {activeTab === "pengaturan" && (
            <div className="space-y-6">
              <div className="max-w-md">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pengaturan Keamanan</h2>
                <p className="text-sm text-slate-500 mt-1">Ubah kata sandi administrator utama di sini.</p>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
                  <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sandi Lama</label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="Sandi admin saat ini"
                        id="setting-old-password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sandi Baru</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="Minimal 4 karakter"
                        id="setting-new-password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Konfirmasi Sandi Baru</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="Ulangi sandi baru"
                        id="setting-confirm-password"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-sm text-xs transition-all transform active:scale-95"
                        id="btn-update-admin-pass"
                      >
                        <Lock className="w-4 h-4" /> Perbarui Sandi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Copyright Footer */}
          <div className="pt-8 border-t border-slate-200/60 text-center text-[11.5px] text-slate-400 font-medium tracking-wide">
            Copyright © 2026 HUMAS SMP AL IRSYAD SURAKARTA
          </div>
        </div>
      </main>
    </div>
  );
}
