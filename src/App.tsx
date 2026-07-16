/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { dbService } from "./lib/db";
import { isFirebaseConfigured } from "./lib/firebase";
import { Student, Class, Musyrif, Capaian } from "./types";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/AdminPanel";
import MusyrifPanel from "./components/MusyrifPanel";
import ReportPrinter from "./components/ReportPrinter";
import { Database, WifiOff, RefreshCw, BookOpen } from "lucide-react";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "musyrif" | null>(null);
  const [currentMusyrif, setCurrentMusyrif] = useState<Musyrif | null>(null);

  // Core collections
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [musyrifs, setMusyrifs] = useState<Musyrif[]>([]);
  const [capaians, setCapaians] = useState<Capaian[]>([]);
  const [adminPass, setAdminPass] = useState("admin");

  // Print view state
  const [printActive, setPrintActive] = useState(false);
  const [printFilters, setPrintFilters] = useState<{
    classId?: string;
    level?: string;
    musyrifId?: string;
    bulan: string;
  } | null>(null);

  // Fetch all data from DB
  const loadAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [clsList, mList, sList, cList, aPass] = await Promise.all([
        dbService.getClasses(),
        dbService.getMusyrifs(),
        dbService.getStudents(),
        dbService.getCapaians(),
        dbService.getAdminPassword(),
      ]);

      setClasses(clsList);
      setMusyrifs(mList);
      setStudents(sList);
      setCapaians(cList);
      setAdminPass(aPass);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- SAVE ACTIONS IN SYNC WITH RE-FETCH ---

  const handleSaveStudent = async (student: Student) => {
    await dbService.saveStudent(student);
    await loadAllData(true);
  };

  const handleSaveStudentsBatch = async (studentsList: Student[]) => {
    await dbService.saveStudentsBatch(studentsList);
    await loadAllData(true);
  };

  const handleDeleteStudent = async (id: string) => {
    await dbService.deleteStudent(id);
    await loadAllData(true);
  };

  const handleSaveClass = async (classData: Class) => {
    await dbService.saveClass(classData);
    await loadAllData(true);
  };

  const handleDeleteClass = async (id: string) => {
    await dbService.deleteClass(id);
    await loadAllData(true);
  };

  const handleSaveMusyrif = async (musyrif: Musyrif) => {
    await dbService.saveMusyrif(musyrif);
    await loadAllData(true);
  };

  const handleDeleteMusyrif = async (id: string) => {
    await dbService.deleteMusyrif(id);
    await loadAllData(true);
  };

  const handleUpdateAdminPassword = async (newPass: string) => {
    await dbService.updateAdminPassword(newPass);
    setAdminPass(newPass);
  };

  const handleSaveCapaian = async (capaian: Capaian) => {
    await dbService.saveCapaian(capaian);
    await loadAllData(true);
  };

  const handleUpdateMusyrifPassword = async (musyrifId: string, newPass: string) => {
    const found = musyrifs.find((m) => m.id === musyrifId);
    if (found) {
      const updated = { ...found, passwordHash: newPass };
      await dbService.saveMusyrif(updated);
      await loadAllData(true);
      // Update session musyrif details
      setCurrentMusyrif(updated);
    }
  };

  // Trigger preview print view
  const handleTriggerPrint = (filters: {
    classId?: string;
    level?: string;
    musyrifId?: string;
    bulan: string;
  }) => {
    setPrintFilters(filters);
    setPrintActive(true);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentMusyrif(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin"></div>
          <RefreshCw className="w-6 h-6 text-brand-700 absolute top-5 animate-pulse" />
          <h2 className="text-slate-800 font-extrabold text-lg mt-6">Memuat Data...</h2>
          <p className="text-slate-400 text-xs mt-1">Sistem Capaian Tahfidz SMP Al Irsyad Surakarta</p>
        </div>
      </div>
    );
  }

  // Render Print View
  if (printActive && printFilters) {
    return (
      <ReportPrinter
        students={students}
        classes={classes}
        musyrifs={musyrifs}
        capaians={capaians}
        selectedClassId={printFilters.classId}
        selectedLevel={printFilters.level}
        selectedMusyrifId={printFilters.musyrifId}
        selectedBulan={printFilters.bulan}
        onClose={() => {
          setPrintActive(false);
          setPrintFilters(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative flex flex-col">
      {/* Main Routing Screen */}
      {!userRole ? (
        <LoginScreen
          musyrifs={musyrifs}
          adminPass={adminPass}
          onLoginSuccess={(role, musyrif) => {
            setUserRole(role);
            if (musyrif) setCurrentMusyrif(musyrif);
          }}
        />
      ) : userRole === "admin" ? (
        <AdminPanel
          students={students}
          classes={classes}
          musyrifs={musyrifs}
          capaians={capaians}
          adminPass={adminPass}
          onSaveStudent={handleSaveStudent}
          onSaveStudentsBatch={handleSaveStudentsBatch}
          onDeleteStudent={handleDeleteStudent}
          onSaveClass={handleSaveClass}
          onDeleteClass={handleDeleteClass}
          onSaveMusyrif={handleSaveMusyrif}
          onDeleteMusyrif={handleDeleteMusyrif}
          onUpdateAdminPassword={handleUpdateAdminPassword}
          onTriggerPrint={handleTriggerPrint}
          onLogout={handleLogout}
        />
      ) : (
        currentMusyrif && (
          <MusyrifPanel
            currentMusyrif={currentMusyrif}
            students={students}
            classes={classes}
            capaians={capaians}
            onSaveCapaian={handleSaveCapaian}
            onUpdateMusyrifPassword={handleUpdateMusyrifPassword}
            onTriggerPrint={handleTriggerPrint}
            onLogout={handleLogout}
          />
        )
      )}
    </div>
  );
}
