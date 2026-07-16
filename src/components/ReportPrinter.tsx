/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { Student, Class, Musyrif, Capaian } from "../types";
import { Printer, ArrowLeft, Download, CheckCircle2, LayoutGrid, FileText } from "lucide-react";

interface ReportPrinterProps {
  students: Student[];
  classes: Class[];
  musyrifs: Musyrif[];
  capaians: Capaian[];
  selectedClassId?: string;
  selectedLevel?: string; // "7", "8", "9"
  selectedMusyrifId?: string;
  selectedBulan: string;
  onClose: () => void;
}

export default function ReportPrinter({
  students,
  classes,
  musyrifs,
  capaians,
  selectedClassId,
  selectedLevel,
  selectedMusyrifId,
  selectedBulan,
  onClose,
}: ReportPrinterProps) {
  // Filter students based on selection
  let filteredStudents = [...students];

  if (selectedClassId) {
    filteredStudents = filteredStudents.filter((s) => s.kelasId === selectedClassId);
  } else if (selectedLevel) {
    // Level is first character of class ID, e.g. "7A" starts with "7"
    filteredStudents = filteredStudents.filter((s) => s.kelasId.startsWith(selectedLevel));
  }

  if (selectedMusyrifId) {
    filteredStudents = filteredStudents.filter((s) => s.musyrifId === selectedMusyrifId);
  }

  // Set default format to "kolektif" if filtered by class or level, otherwise "individu"
  const [printFormat, setPrintFormat] = useState<"kolektif" | "individu">(
    selectedLevel || selectedClassId ? "kolektif" : "individu"
  );

  // Group students by class
  const studentsByClass: { [classId: string]: Student[] } = {};
  filteredStudents.forEach((student) => {
    if (!studentsByClass[student.kelasId]) {
      studentsByClass[student.kelasId] = [];
    }
    studentsByClass[student.kelasId].push(student);
  });

  const sortedClassIds = Object.keys(studentsByClass).sort();

  // Map month string e.g. "2026-07" to Indonesian Month Name
  const formatIndonesianMonth = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex] || ""} ${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to get achievement for a student
  const getCapaianForStudent = (studentId: string) => {
    return capaians.find((c) => c.studentId === studentId && c.bulan === selectedBulan);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 no-print">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition-colors mb-2"
              id="btn-back-print"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Panel
            </button>
            <h1 className="text-2xl font-bold text-slate-800">
              Pratinjau Cetak Laporan Capaian Tahfidz
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Periode: <span className="font-semibold text-brand-600">{formatIndonesianMonth(selectedBulan)}</span>
              {selectedLevel && ` | Jenjang: Kelas ${selectedLevel}`}
              {selectedClassId && ` | Kelas: ${selectedClassId}`}
              {selectedMusyrifId && ` | Musyrif: ${musyrifs.find(m => m.id === selectedMusyrifId)?.nama}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95"
              id="btn-trigger-print"
            >
              <Printer className="w-5 h-5" /> Cetak Laporan (PDF)
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800">
            <p className="font-medium">Tips Cetak & Simpan PDF:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Pilih opsi <strong>"Save as PDF"</strong> pada dialog print untuk menyimpan laporan digital.</li>
              <li>Pastikan mencentang <strong>"Background graphics"</strong> agar warna tabel tercetak dengan indah.</li>
              <li>Gunakan orientasi kertas <strong>Portrait</strong> dengan ukuran kertas <strong>A4</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mt-6 border-t border-slate-150 pt-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Format Cetak Laporan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setPrintFormat("kolektif")}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                printFormat === "kolektif"
                  ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              id="opt-print-kolektif"
            >
              <LayoutGrid className={`w-5 h-5 shrink-0 mt-0.5 ${printFormat === "kolektif" ? "text-brand-600" : "text-slate-400"}`} />
              <div>
                <p className={`font-bold text-sm ${printFormat === "kolektif" ? "text-brand-900" : "text-slate-700"}`}>
                  Laporan Kolektif (Akumulasi Per Kelas / Per Jenjang)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Menampilkan semua santri dalam satu tabel rekapitulasi per kelas. Sangat hemat kertas dan rapi.
                </p>
              </div>
            </button>

            <button
              onClick={() => setPrintFormat("individu")}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                printFormat === "individu"
                  ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              id="opt-print-individu"
            >
              <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${printFormat === "individu" ? "text-brand-600" : "text-slate-400"}`} />
              <div>
                <p className={`font-bold text-sm ${printFormat === "individu" ? "text-brand-900" : "text-slate-700"}`}>
                  Laporan Individu (Satu Santri Per Lembar)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Menampilkan lembar rapot individu lengkap dengan tanda tangan terpisah untuk masing-masing santri.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="max-w-4xl mx-auto space-y-8 bg-slate-100">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            Tidak ada data siswa atau laporan capaian untuk kriteria yang dipilih.
          </div>
        ) : printFormat === "kolektif" ? (
          // =================== KOLEKTIF VIEW ===================
          sortedClassIds.map((classId, classIdx) => {
            const classStudents = studentsByClass[classId] || [];
            const classMusyrifs = Array.from(new Set(classStudents.map((s) => s.musyrifNama).filter(Boolean)));
            const musyrifSignName = classMusyrifs.length === 1 ? classMusyrifs[0] : "PJ Tahfidz / Musyrif Kelas";
            const musyrifSignId = classMusyrifs.length === 1 ? classStudents[0]?.musyrifId : "";

            return (
              <div
                key={classId}
                className="bg-white shadow-lg border border-slate-200 p-10 md:p-12 text-black print-card relative print-page-break"
                style={{ minHeight: "297mm", contentVisibility: "auto" }}
              >
                {/* School Header / Kop Surat */}
                <div className="flex items-center justify-between border-b-[3px] border-slate-800 pb-4 mb-6">
                  <img
                    src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png"
                    alt="Logo Al Irsyad"
                    className="w-20 h-20 object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-2xl font-extrabold tracking-wide uppercase text-brand-800 leading-tight">
                      SMP AL IRSYAD SURAKARTA
                    </h1>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Jl. Kapten Mulyadi No.117, Surakarta, Jawa Tengah | (0271) 647730
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Website : alirsyadsolo.sch.id | Email : smpalirsyadsolo@gmail.com
                    </p>
                  </div>
                  <div className="w-20 h-20 shrink-0 hidden md:block"></div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-6">
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800">
                    LAPORAN CAPAIAN TAHFIDZ AL-QUR'AN (KOLEKTIF)
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
                    Periode Bulan: {formatIndonesianMonth(selectedBulan)}
                  </p>
                </div>

                {/* Class Metadata */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 text-xs">
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-500">Kelas</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold text-slate-800 uppercase">{classId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-500">Jumlah Santri</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold text-slate-800">{classStudents.length} Santri</span>
                  </div>
                </div>

                {/* Performance Table */}
                <div className="overflow-x-auto border border-slate-300 rounded-lg mb-8">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-800 text-white uppercase text-[9px] tracking-wider text-center">
                        <th className="py-2 px-1.5 border-r border-brand-700 w-8">No</th>
                        <th className="py-2 px-1.5 border-r border-brand-700 w-16">NIS</th>
                        <th className="py-2 px-2.5 border-r border-brand-700 text-left">Nama Santri</th>
                        <th className="py-2 px-1.5 border-r border-brand-700 w-10">Juz</th>
                        <th className="py-2 px-2 border-r border-brand-700 text-left">Awal Periode</th>
                        <th className="py-2 px-2 border-r border-brand-700 text-left">Akhir Periode</th>
                        <th className="py-2 px-1 border-r border-brand-700 w-12">Brs</th>
                        <th className="py-2 px-1.5 border-r border-brand-700 w-16">Juziyyah</th>
                        <th className="py-2 px-2 text-left">Catatan Musyrif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {classStudents.map((student, sIdx) => {
                        const capaian = getCapaianForStudent(student.id);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 align-top">
                            <td className="py-2 px-1.5 text-center font-medium text-slate-500 border-r border-slate-300">
                              {sIdx + 1}
                            </td>
                            <td className="py-2 px-1.5 text-center font-mono text-slate-700 border-r border-slate-300">
                              {student.noInduk}
                            </td>
                            <td className="py-2 px-2.5 font-bold text-slate-900 border-r border-slate-300">
                              {student.nama}
                            </td>
                            <td className="py-2 px-1.5 text-center font-bold text-brand-800 border-r border-slate-300">
                              {capaian?.juz || "-"}
                            </td>
                            <td className="py-2 px-2 text-slate-800 border-r border-slate-300 leading-tight">
                              {capaian?.capaianAwal || "-"}
                            </td>
                            <td className="py-2 px-2 text-slate-800 border-r border-slate-300 leading-tight">
                              {capaian?.capaianAkhir || "-"}
                            </td>
                            <td className="py-2 px-1 text-center font-mono font-bold text-slate-700 border-r border-slate-300">
                              {capaian?.totalBaris !== undefined ? `${capaian.totalBaris}` : "-"}
                            </td>
                            <td className="py-2 px-1.5 text-center border-r border-slate-300">
                              {capaian ? (
                                <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                                  capaian.juziyyah === "Lancar" || capaian.juziyyah?.toLowerCase().includes("lancar")
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {capaian.juziyyah || "Belum"}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-2 text-slate-600 italic text-[10px] leading-relaxed">
                              {capaian?.catatan || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-2 gap-12 text-xs mt-12 pt-4">
                  <div className="text-center">
                    <p className="text-slate-500 mb-16">Mengetahui,<br/><strong>Penanggungjawab Tahfidz</strong></p>
                    <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900">Muhammat Imam Syafi'i S.Pd.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-16">Surakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/><strong>Musyrif Halaqoh</strong></p>
                    <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900">{musyrifSignName}</p>
                    <p className="text-[10px] text-slate-400">{musyrifSignId ? `NIK. ${musyrifSignId}` : "Pembina Tahfidz"}</p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="absolute bottom-4 left-10 right-10 flex justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-2 print:flex hidden">
                  <span>SMP Al Irsyad Surakarta - Laporan Capaian Tahfidz Kolektif</span>
                  <span>Dicetak otomatis via Sistem Informasi Tahfidz</span>
                  <span>Halaman {classIdx + 1} dari {sortedClassIds.length}</span>
                </div>
              </div>
            );
          })
        ) : (
          // =================== INDIVIDUAL VIEW (Original) ===================
          filteredStudents.map((student, idx) => {
            const capaian = getCapaianForStudent(student.id);
            return (
              <div
                key={student.id}
                className="bg-white shadow-lg border border-slate-200 p-10 md:p-12 text-black print-card relative print-page-break"
                style={{ minHeight: "297mm", contentVisibility: "auto" }}
              >
                {/* School Header / Kop Surat */}
                <div className="flex items-center justify-between border-b-[3px] border-slate-800 pb-4 mb-6">
                  <img
                    src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png"
                    alt="Logo Al Irsyad"
                    className="w-20 h-20 object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-2xl font-extrabold tracking-wide uppercase text-brand-800 leading-tight">
                      SMP AL IRSYAD SURAKARTA
                    </h1>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Jl. Kapten Mulyadi No.117, Surakarta, Jawa Tengah | (0271) 647730
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Website : alirsyadsolo.sch.id | Email : smpalirsyadsolo@gmail.com
                    </p>
                  </div>
                  <div className="w-20 h-20 shrink-0 hidden md:block"></div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 decoration-brand-600">
                    LAPORAN CAPAIAN TAHFIDZ AL-QUR'AN
                  </h3>
                  <p className="text-sm font-medium text-slate-600 mt-1 uppercase tracking-wide">
                    Periode Bulan: {formatIndonesianMonth(selectedBulan)}
                  </p>
                </div>

                {/* Student Metadata Card */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-sm">
                  <div className="flex">
                    <span className="w-32 font-medium text-slate-500">Nama Siswa</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold text-slate-800 uppercase">{student.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-medium text-slate-500">Kelas</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold text-slate-800">{student.kelasId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-medium text-slate-500">No. Induk Siswa</span>
                    <span className="mr-2">:</span>
                    <span className="font-mono text-slate-800">{student.noInduk}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-medium text-slate-500">Musyrif Tahfidz</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold text-slate-800">{student.musyrifNama}</span>
                  </div>
                </div>

                {/* Performance Table */}
                <div className="overflow-hidden border border-slate-300 rounded-lg mb-8">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-800 text-white uppercase text-[11px] tracking-wider text-center">
                        <th className="py-3 px-4 border-r border-brand-700 w-16">Juz</th>
                        <th className="py-3 px-4 border-r border-brand-700">Capaian Awal Bulan</th>
                        <th className="py-3 px-4 border-r border-brand-700">Capaian Akhir Bulan</th>
                        <th className="py-3 px-4 border-r border-brand-700 w-24">Total Baris</th>
                        <th className="py-3 px-4 w-32">Juziyyah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capaian ? (
                        <tr className="border-t border-slate-300 hover:bg-slate-50/50">
                          <td className="py-4 px-4 text-center font-bold text-lg text-brand-800 border-r border-slate-300 bg-brand-50/20">
                            {capaian.juz}
                          </td>
                          <td className="py-4 px-4 border-r border-slate-300 text-slate-800 align-top">
                            <div className="font-semibold text-slate-900">{capaian.capaianAwal || "-"}</div>
                            <span className="text-[10px] text-slate-400 block mt-1">Materi hafalan awal periode</span>
                          </td>
                          <td className="py-4 px-4 border-r border-slate-300 text-slate-800 align-top">
                            <div className="font-semibold text-slate-900">{capaian.capaianAkhir || "-"}</div>
                            <span className="text-[10px] text-slate-400 block mt-1">Hafalan terakhir dicapai</span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 border-r border-slate-300 align-middle">
                            {capaian.totalBaris || 0} Baris
                          </td>
                          <td className="py-4 px-4 text-center align-middle">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                              capaian.juziyyah === "Lancar" 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                : capaian.juziyyah?.toLowerCase().includes("lancar")
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {capaian.juziyyah || "Belum Juziyyah"}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 px-4 text-center text-slate-400 italic">
                            Belum ada input capaian tahfidz dari Musyrif untuk bulan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Teacher's Feedback Card */}
                <div className="border border-slate-300 rounded-lg p-5 mb-10 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Catatan & Rekomendasi Musyrif:
                  </h4>
                  <p className="text-sm text-slate-800 italic leading-relaxed min-h-[60px]">
                    {capaian?.catatan ? `"${capaian.catatan}"` : "Belum ada catatan pembinaan."}
                  </p>
                </div>
                 {/* Signature Section */}
                <div className="grid grid-cols-2 gap-12 text-sm mt-12 pt-4">
                  <div className="text-center">
                    <p className="text-slate-500 mb-16">Mengetahui,<br/><strong>Penanggungjawab Tahfidz</strong></p>
                    <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900">Muhammat Imam Syafi'i S.Pd.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-16">Surakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/><strong>Musyrif Halaqoh</strong></p>
                    <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900">{student.musyrifNama}</p>
                    <p className="text-xs text-slate-400">NIK. {student.musyrifId}</p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="absolute bottom-4 left-10 right-10 flex justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-2 print:flex hidden">
                  <span>SMP Al Irsyad Surakarta - Laporan Capaian Tahfidz</span>
                  <span>Dicetak otomatis via Sistem Informasi Tahfidz</span>
                  <span>Halaman {idx + 1} dari {filteredStudents.length}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
