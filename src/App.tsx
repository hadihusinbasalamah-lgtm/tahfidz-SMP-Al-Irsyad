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
  const [userRole, setUserRole] = useState<"admin" | "musyrif" | null>(() => {
    try {
      const stored = localStorage.getItem("tahfidz_userRole");
      if (stored === "admin" || stored === "musyrif") return stored;
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [currentMusyrif, setCurrentMusyrif] = useState<Musyrif | null>(() => {
    try {
      const stored = localStorage.getItem("tahfidz_currentMusyrif");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [sessionExpired, setSessionExpired] = useState(false);

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
    // Check if the persisted session has already expired prior to loading
    try {
      const lastActivityStr = localStorage.getItem("tahfidz_lastActivity");
      const storedRole = localStorage.getItem("tahfidz_userRole");
      if (storedRole && lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const now = Date.now();
        const IDLE_TIMEOUT = 15 * 60 * 1000;
        if (now - lastActivity > IDLE_TIMEOUT) {
          handleLogout();
          setSessionExpired(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
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

  const handleClearAllCapaians = async () => {
    await dbService.clearAllCapaians();
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
      try {
        localStorage.setItem("tahfidz_currentMusyrif", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
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
    try {
      localStorage.removeItem("tahfidz_userRole");
      localStorage.removeItem("tahfidz_currentMusyrif");
      localStorage.removeItem("tahfidz_lastActivity");
    } catch (e) {
      console.error(e);
    }
  };

  // Track user activity and check for idle timeout
  useEffect(() => {
    if (!userRole) return;

    // Set initial last activity timestamp on login or refresh
    try {
      localStorage.setItem("tahfidz_lastActivity", Date.now().toString());
    } catch (e) {
      // ignore
    }

    const handleActivity = () => {
      try {
        localStorage.setItem("tahfidz_lastActivity", Date.now().toString());
      } catch (e) {
        // ignore
      }
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    const interval = setInterval(() => {
      try {
        const lastActivityStr = localStorage.getItem("tahfidz_lastActivity");
        if (lastActivityStr) {
          const lastActivity = parseInt(lastActivityStr, 10);
          const now = Date.now();
          // 15 minutes of idle time
          const IDLE_TIMEOUT = 15 * 60 * 1000;
          if (now - lastActivity > IDLE_TIMEOUT) {
            handleLogout();
            setSessionExpired(true);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 5000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [userRole]);

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
          sessionExpired={sessionExpired}
          onLoginSuccess={(role, musyrif) => {
            setUserRole(role);
            setSessionExpired(false);
            try {
              localStorage.setItem("tahfidz_userRole", role);
              if (musyrif) {
                setCurrentMusyrif(musyrif);
                localStorage.setItem("tahfidz_currentMusyrif", JSON.stringify(musyrif));
              } else {
                setCurrentMusyrif(null);
                localStorage.removeItem("tahfidz_currentMusyrif");
              }
            } catch (e) {
              console.error(e);
            }
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
          onClearAllCapaians={handleClearAllCapaians}
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
