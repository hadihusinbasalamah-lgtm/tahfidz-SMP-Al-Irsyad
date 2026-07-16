import React, { useState, useRef } from "react";
import { Student, Class, Musyrif } from "../types";
import {
  X,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles
} from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  musyrifs: Musyrif[];
  onImport: (students: Student[]) => Promise<void>;
}

interface ParsedRow {
  noInduk: string;
  nama: string;
  kelasId: string;
  musyrifId: string;
  musyrifNama: string;
  status: "valid" | "warning" | "error";
  message: string;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  classes,
  musyrifs,
  onImport
}: BulkUploadModalProps) {
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download template CSV
  const handleDownloadTemplate = () => {
    // We can list some example musyrif NIKs or usernames to help them fill it
    const exampleMusyrif = musyrifs.length > 0 ? musyrifs[0] : { nik: "19920101", nama: "Ust. Ahmad Fauzi" };
    const exampleClass = classes.length > 0 ? classes[0].id : "7A";

    const csvContent = [
      "noInduk,nama,kelasId,musyrifId",
      `1006,Ahmad Fulan,${exampleClass},${exampleMusyrif.nik}`,
      `1007,Zaidan Karim,${exampleClass},${exampleMusyrif.nik}`,
      `1008,Umar Al-Faruq,${exampleClass},${exampleMusyrif.nik}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe CSV Parser
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    // Detect separator
    const firstLine = lines[0];
    let sep = ",";
    if (firstLine.includes("\t")) {
      sep = "\t";
    } else if (firstLine.includes(";")) {
      sep = ";";
    }

    const result: string[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row: string[] = [];
      let insideQuote = false;
      let current = "";

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === sep && !insideQuote) {
          row.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      result.push(row);
    }
    return result;
  };

  const processDataText = (text: string) => {
    const rows = parseCSV(text);
    if (rows.length === 0) {
      alert("Format data kosong atau tidak dikenali.");
      return;
    }

    let startIndex = 0;
    // Check if first row is header
    const firstRowCombined = rows[0].join(" ").toLowerCase();
    if (
      firstRowCombined.includes("noinduk") ||
      firstRowCombined.includes("no. induk") ||
      firstRowCombined.includes("induk") ||
      firstRowCombined.includes("nama") ||
      firstRowCombined.includes("kelas") ||
      firstRowCombined.includes("musyrif")
    ) {
      startIndex = 1; // skip header
    }

    const list: ParsedRow[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue; // Skip invalid short rows

      const noIndukRaw = row[0] || "";
      const namaRaw = row[1] || "";
      const kelasIdRaw = (row[2] || "").trim().toUpperCase();
      const musyrifIdRaw = (row[3] || "").trim();

      const noInduk = noIndukRaw.trim();
      const nama = namaRaw.trim();

      if (!noInduk || !nama) {
        list.push({
          noInduk,
          nama,
          kelasId: kelasIdRaw,
          musyrifId: musyrifIdRaw,
          musyrifNama: "",
          status: "error",
          message: "No Induk atau Nama tidak boleh kosong"
        });
        continue;
      }

      // Validate class
      const classExists = classes.some((c) => c.id.toUpperCase() === kelasIdRaw);
      let classStatusMessage = "";
      if (kelasIdRaw && !classExists) {
        classStatusMessage = `⚠️ Kelas [${kelasIdRaw}] tidak terdaftar. `;
      } else if (!kelasIdRaw) {
        classStatusMessage = "⚠️ Kelas kosong. ";
      }

      // Match musyrif
      const matchedMusyrif = musyrifs.find(
        (m) =>
          m.nik === musyrifIdRaw ||
          m.id === musyrifIdRaw ||
          m.username.toLowerCase() === musyrifIdRaw.toLowerCase() ||
          m.nama.toLowerCase().includes(musyrifIdRaw.toLowerCase())
      );

      let musyrifId = "";
      let musyrifNama = "";
      let musyrifStatusMessage = "";

      if (matchedMusyrif) {
        musyrifId = matchedMusyrif.id;
        musyrifNama = matchedMusyrif.nama;
      } else if (musyrifIdRaw) {
        musyrifStatusMessage = `⚠️ Musyrif ID [${musyrifIdRaw}] tidak terdaftar. `;
      } else {
        musyrifStatusMessage = "⚠️ Musyrif kosong. ";
      }

      // Determine overall row status
      let status: "valid" | "warning" | "error" = "valid";
      let message = "Data siap diimpor.";

      if (!kelasIdRaw || !musyrifId) {
        status = "warning";
        message = `${classStatusMessage}${musyrifStatusMessage}`.trim();
      }
      if (!classExists && kelasIdRaw) {
        status = "warning";
        message = `${classStatusMessage}${musyrifStatusMessage}`.trim();
      }

      list.push({
        noInduk,
        nama,
        kelasId: kelasIdRaw || "",
        musyrifId: musyrifId || "",
        musyrifNama: musyrifNama || "Belum ditugaskan",
        status,
        message
      });
    }

    setParsedStudents(list);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      alert("Silakan tempel teks CSV/Excel terlebih dahulu.");
      return;
    }
    processDataText(pasteText);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processDataText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    const toImport = parsedStudents.filter((s) => s.status !== "error");
    if (toImport.length === 0) {
      alert("Tidak ada data valid yang bisa diimpor.");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    const studentsToSave: Student[] = toImport.map((p) => ({
      id: p.noInduk,
      noInduk: p.noInduk,
      nama: p.nama,
      kelasId: p.kelasId,
      musyrifId: p.musyrifId,
      musyrifNama: p.musyrifNama
    }));

    try {
      // Import students sequentially to avoid batch writing issues if we have custom listeners
      // or we can batch them.
      const batchSize = 10;
      for (let i = 0; i < studentsToSave.length; i += batchSize) {
        const batch = studentsToSave.slice(i, i + batchSize);
        await onImport(batch);
        const progress = Math.min(100, Math.round(((i + batch.length) / studentsToSave.length) * 100));
        setImportProgress(progress);
      }

      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setParsedStudents([]);
        setPasteText("");
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal mengimpor data. Periksa koneksi internet.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-800 to-brand-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Upload className="w-5 h-5 text-brand-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                Import Masal Data Siswa <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-xs text-brand-100 mt-0.5">
                Tambahkan puluhan hingga ratusan data siswa secara cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {importSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Import Berhasil Selesai!</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Semua data siswa berhasil disinkronkan dengan database.
                </p>
              </div>
            </div>
          ) : isImporting ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin"></div>
                <span className="absolute text-xs font-black text-brand-700">{importProgress}%</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-slate-800">Sedang Mengunggah & Menyimpan Data</h4>
                <p className="text-xs text-slate-400 mt-1">Harap jangan menutup jendela ini...</p>
              </div>
            </div>
          ) : parsedStudents.length > 0 ? (
            /* Preview State */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Pratinjau Data ({parsedStudents.length} siswa terdeteksi)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Silakan periksa kembali kecocokan data kelas dan musyrif sebelum mengimpor.
                  </p>
                </div>
                <button
                  onClick={() => setParsedStudents([])}
                  className="text-xs text-brand-600 hover:text-brand-800 font-bold"
                >
                  Ulangi Input
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[40vh] overflow-y-auto shadow-inner">
                <table className="w-full text-left text-[11px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold tracking-wider uppercase border-b border-slate-100 sticky top-0">
                      <th className="py-2.5 px-4">No. Induk</th>
                      <th className="py-2.5 px-4">Nama</th>
                      <th className="py-2.5 px-4">Kelas</th>
                      <th className="py-2.5 px-4">Musyrif</th>
                      <th className="py-2.5 px-4">Status / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          row.status === "error"
                            ? "bg-rose-50/40"
                            : row.status === "warning"
                            ? "bg-amber-50/40"
                            : ""
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                          {row.noInduk || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {row.nama || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="py-2.5 px-4">
                          {row.kelasId ? (
                            <span className="px-2 py-0.5 font-black text-[9px] rounded bg-brand-50 text-brand-700 border border-brand-100">
                              {row.kelasId}
                            </span>
                          ) : (
                            <span className="text-amber-500 italic">Kosong</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {row.musyrifNama}
                        </td>
                        <td className="py-2.5 px-4">
                          {row.status === "error" ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {row.message}
                            </span>
                          ) : row.status === "warning" ? (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {row.message}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Siap Impor
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Warnings explanation */}
              {parsedStudents.some((s) => s.status === "warning") && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Perhatian:</span> Beberapa baris data memiliki kelas atau musyrif yang tidak terdaftar di sistem. Siswa tersebut tetap dapat diimpor, tetapi kelas/musyrif pembimbingnya mungkin perlu Anda perbarui secara manual nanti.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Input State */
            <div className="space-y-6">
              {/* Instructions and Download Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-600" /> Aturan Format Template
                  </h4>
                  <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                    <li>Gunakan file CSV atau format teks yang dipisahkan koma/tab.</li>
                    <li>
                      Kolom wajib diisi berurutan: <span className="font-bold">No Induk, Nama Lengkap, Kode Kelas, NIK/Username Musyrif</span>.
                    </li>
                    <li>Sistem akan mencocokkan musyrif berdasarkan NIK, ID, nama, atau username secara otomatis.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border border-brand-100 bg-brand-50/50 rounded-2xl text-center space-y-2">
                  <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                    Unduh Format
                  </span>
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Template CSV
                  </button>
                </div>
              </div>

              {/* Upload choice area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Method A: File Upload */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all ${
                    dragActive
                      ? "border-brand-500 bg-brand-50/30"
                      : "border-slate-200 hover:border-brand-400 hover:bg-slate-50/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.txt"
                    className="hidden"
                  />
                  <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Pilih File CSV</h5>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Seret & taruh file CSV Anda di sini, atau klik untuk menelusuri komputer
                    </p>
                  </div>
                </div>

                {/* Method B: Copy Paste */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Atau Tempel (Copy-Paste) dari Excel / Sheets
                  </label>
                  <textarea
                    rows={4}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Contoh:&#10;1006,Ahmad Fulan,7A,19920101&#10;1007,Zaidan Karim,7B,19940202"
                    className="w-full border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                  ></textarea>
                  <button
                    onClick={handlePasteSubmit}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                  >
                    Proses Teks Tempel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedStudents.length > 0 && !isImporting && !importSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setParsedStudents([])}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleStartImport}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mulai Impor ({parsedStudents.filter(s => s.status !== "error").length} Siswa)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
