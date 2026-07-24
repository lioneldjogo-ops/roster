import React, { useState } from 'react';
import { ALL_CLASSES } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, UserRole } from '../types';
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  Edit3,
  Grid,
  School,
  Sparkles,
  CheckSquare,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Gamepad2,
  FileSpreadsheet,
  Lock,
  Unlock,
  Users,
  GraduationCap,
  Award,
  Heart,
  Printer,
  BarChart3
} from 'lucide-react';
import schoolLogo from '../assets/images/school_logo_st_teresia_1784846232480.jpg';

export type ActiveTab =
  | 'class'
  | 'matrix'
  | 'reminders'
  | 'homework'
  | 'quiz'
  | 'manage'
  | 'parent_portal'
  | 'teacher_reports'
  | 'students';

interface HeaderProps {
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentDay: DayOfWeek | null;
  currentTimeStr: string;
  activePeriodName?: string;
  activeSubjectName?: string;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
  onResetDefaultSchedule: () => void;
  onOpenGoogleSheetsModal: () => void;
  isLoggedInGoogle?: boolean;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isTeacherAuthenticated: boolean;
  onOpenPinModal: () => void;
  onLogoutTeacher: () => void;
  onOpenPrintRoster?: () => void;
  onOpenDevAnalytics?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedClass,
  onSelectClass,
  activeTab,
  onSelectTab,
  currentDay,
  currentTimeStr,
  activePeriodName,
  activeSubjectName,
  notificationsEnabled,
  onRequestNotificationPermission,
  onResetDefaultSchedule,
  onOpenGoogleSheetsModal,
  isLoggedInGoogle,
  userRole,
  onSelectRole,
  isTeacherAuthenticated,
  onOpenPinModal,
  onLogoutTeacher,
  onOpenPrintRoster,
  onOpenDevAnalytics,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleRoleClick = (role: UserRole) => {
    if (role === 'teacher') {
      if (!isTeacherAuthenticated) {
        onOpenPinModal();
      } else {
        onSelectRole('teacher');
      }
    } else {
      onSelectRole(role);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-xl sticky top-0 z-40 border-b-4 border-blue-700">
      {/* Top Notice Bar */}
      <div className="bg-blue-800 text-blue-100 text-[10px] sm:text-xs py-1 px-2.5 sm:px-4 border-b border-blue-700 font-bold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5 max-w-full truncate">
            <span className="bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shadow-sm shrink-0">
              YAMKURES
            </span>
            <span className="tracking-wide truncate text-[10px] sm:text-xs">
              SDK ST. TERESIA DANGA - MBAY
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <div className="flex items-center gap-1 bg-blue-950/70 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black text-yellow-300 border border-blue-700">
              <Clock className="w-3 h-3 text-yellow-400 shrink-0" />
              <span>{currentDay || 'Libur'} • {currentTimeStr} WITA</span>
            </div>
            {activePeriodName && (
              <div className="flex items-center gap-1 bg-yellow-400 text-blue-950 font-black px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] shadow-[2px_2px_0px_#1e3a8a]">
                <Sparkles className="w-3 h-3 text-blue-900 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{activePeriodName}: {activeSubjectName || 'Istirahat'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Switcher Bar (Sisi Murid, Sisi Orang Tua, Sisi Sekolah/Guru) */}
      <div className="bg-blue-900/90 py-1.5 px-2 sm:px-3 border-b-2 border-yellow-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 w-full">
            <span className="text-[10px] font-black uppercase text-yellow-300 bg-blue-950 px-2 py-1 rounded-lg border border-blue-800 shrink-0 hidden md:inline">
              MODE AKSEBILITAS:
            </span>

            {/* Role 1: Sisi Murid */}
            <button
              onClick={() => handleRoleClick('student')}
              className={`flex items-center justify-center gap-1 px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all text-center ${
                userRole === 'student'
                  ? 'bg-yellow-400 text-blue-950 shadow-[2px_2px_0px_#1e3a8a] border-2 border-amber-300'
                  : 'bg-blue-800 hover:bg-blue-700 text-blue-100 border border-blue-700'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span className="truncate">MURID</span>
            </button>

            {/* Role 2: Sisi Orang Tua */}
            <button
              onClick={() => handleRoleClick('parent')}
              className={`flex items-center justify-center gap-1 px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all text-center ${
                userRole === 'parent'
                  ? 'bg-emerald-400 text-blue-950 shadow-[2px_2px_0px_#14532d] border-2 border-emerald-300'
                  : 'bg-blue-800 hover:bg-blue-700 text-blue-100 border border-blue-700'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-950 shrink-0" />
              <span className="truncate">ORANG TUA</span>
            </button>

            {/* Role 3: Sisi Sekolah / Guru */}
            <button
              onClick={() => handleRoleClick('teacher')}
              className={`flex items-center justify-center gap-1 px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all text-center ${
                userRole === 'teacher'
                  ? 'bg-amber-400 text-blue-950 shadow-[2px_2px_0px_#1e3a8a] border-2 border-amber-500'
                  : 'bg-blue-800 hover:bg-blue-700 text-yellow-300 border border-blue-700'
              }`}
            >
              {isTeacherAuthenticated ? (
                <Unlock className="w-3.5 h-3.5 text-green-950 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              )}
              <span className="truncate">GURU</span>
              {isTeacherAuthenticated && (
                <span className="bg-green-700 text-white text-[8px] sm:text-[9px] px-1 py-0.2 rounded-full font-black shrink-0 hidden sm:inline">
                  OK
                </span>
              )}
            </button>
          </div>

          {/* Teacher Logout button if authenticated */}
          {isTeacherAuthenticated && (
            <div className="flex items-center justify-end w-full sm:w-auto mt-0.5 sm:mt-0">
              <button
                onClick={onLogoutTeacher}
                className="w-full sm:w-auto text-[10px] sm:text-[11px] font-black bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-xl border border-rose-400 uppercase transition-all shadow-sm text-center"
                title="Kunci Akses Guru"
              >
                🔒 KUNCI MODE GURU
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Branding & Navigation Section */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo & School Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-full p-0.5 shadow-lg border-2 border-yellow-400 flex items-center justify-center shrink-0">
            <img 
              src={schoolLogo} 
              alt="Logo SDK St. Teresia Danga" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm leading-tight">
              <span className="truncate">SDK St. Teresia Danga</span>
              <span className="text-[9px] sm:text-[10px] bg-yellow-400 text-blue-950 font-black px-1.5 py-0.2 rounded-full uppercase shadow-sm shrink-0">
                SD
              </span>
            </h1>
            <p className="text-[9px] sm:text-xs text-blue-100 font-bold tracking-wide truncate">
              {userRole === 'parent'
                ? '👨‍👩‍👧 Mode Orang Tua: Laporan Belajar & Prestasi'
                : userRole === 'teacher'
                ? '🏫 Mode Sekolah & Guru: Kelola Jadwal & Murid'
                : '🎓 Mode Murid: Jadwal Pelajaran & Game Kuis'}
            </p>
          </div>
        </div>

        {/* Desktop Controls (Class Selector & Buttons) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Class selector */}
          <div className="flex items-center gap-1.5 bg-blue-700 p-1.5 rounded-2xl border-2 border-blue-500 shadow-inner">
            <span className="text-xs font-black text-white px-1.5 flex items-center gap-1 uppercase tracking-tight">
              <School className="w-4 h-4 text-yellow-300" /> Kelas:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => onSelectClass(e.target.value as ClassGroup)}
              className="bg-yellow-400 text-blue-950 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-yellow-300 focus:outline-none cursor-pointer shadow-[2px_2px_0px_#1e3a8a]"
            >
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  KELAS {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Developer Analytics Button (dvv.cacing) */}
          {onOpenDevAnalytics && (
            <button
              onClick={onOpenDevAnalytics}
              className="flex items-center gap-1.5 text-xs font-black bg-indigo-950 hover:bg-indigo-900 text-indigo-300 hover:text-white px-3 py-2 rounded-2xl border-2 border-indigo-700 transition-all shadow-[3px_3px_0px_#1e1b4b] active:translate-y-0.5"
              title="Dashboard Analitik Kunjungan (PIN: dvv.cacing)"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="uppercase">DEV ANALYTICS</span>
            </button>
          )}

          {/* Cetak Roster Button */}
          {onOpenPrintRoster && (
            <button
              onClick={onOpenPrintRoster}
              className="flex items-center gap-1.5 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-2xl border-2 border-purple-300 transition-all shadow-[3px_3px_0px_#4c1d95] active:translate-y-0.5"
              title="Cetak & Lihat Tabel Roster Resmi Kelas"
            >
              <Printer className="w-4 h-4 text-white" />
              <span className="uppercase">CETAK ROSTER</span>
            </button>
          )}

          {/* Google Sheets Sync Button */}
          {userRole === 'teacher' && (
            <button
              onClick={onOpenGoogleSheetsModal}
              className="flex items-center gap-1.5 text-xs font-black bg-green-500 hover:bg-green-400 text-white px-3.5 py-2 rounded-2xl border-2 border-green-300 transition-all shadow-[3px_3px_0px_#14532d] active:translate-y-0.5"
              title="Integrasi & Sync Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span className="uppercase">GOOGLE SHEETS</span>
            </button>
          )}

          {/* Notification permission button */}
          <button
            onClick={onRequestNotificationPermission}
            className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-2xl transition-all shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none ${
              notificationsEnabled
                ? 'bg-green-400 hover:bg-green-300 text-green-950 border-2 border-green-300'
                : 'bg-yellow-400 hover:bg-yellow-300 text-blue-950 border-2 border-yellow-300'
            }`}
            title={notificationsEnabled ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4 text-green-950 animate-bounce" />
                <span>ALARM AKTIF</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-blue-950" />
                <span>AKTIFKAN ALARM</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <select
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value as ClassGroup)}
            className="bg-yellow-400 text-blue-950 text-xs font-black py-1.5 px-2 rounded-xl border-2 border-yellow-300 focus:outline-none shadow-[2px_2px_0px_#1e3a8a]"
          >
            {ALL_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-yellow-400 text-blue-950 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center font-black"
            aria-label="Buka Menu Navigasi"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-blue-950" />
            ) : (
              <Menu className="w-6 h-6 text-blue-950" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Tabs Navigation Bar */}
      <div className="hidden md:block bg-blue-700 px-4 py-2 border-t-2 border-blue-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-blue-400">
          <button
            onClick={() => handleTabClick('class')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'class'
                ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            JADWAL KELAS {selectedClass}
          </button>

          {/* Standalone Tambah & Data Murid Tab (Guru Only) */}
          {userRole === 'teacher' && (
            <button
              onClick={() => handleTabClick('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'students'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                  : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border-2 border-amber-400/40'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              📋 TAMBAH & DATA MURID
            </button>
          )}

          <button
            onClick={() => handleTabClick('parent_portal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'parent_portal'
                ? 'bg-emerald-400 text-blue-950 shadow-[3px_3px_0px_#14532d] border-2 border-emerald-300 scale-[1.02]'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border-2 border-emerald-500/40'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-200" />
            PORTAL ORANG TUA
          </button>

          <button
            onClick={() => handleTabClick('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Grid className="w-4 h-4" />
            MATRIKS KELAS
          </button>

          <button
            onClick={() => handleTabClick('homework')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'homework'
                ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            TUGAS RUMAH (PR)
          </button>

          <button
            onClick={() => handleTabClick('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-300" />
            GAME KUIS SAYA
          </button>

          <button
            onClick={() => handleTabClick('reminders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'reminders'
                ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            PENGINGAT TAS
          </button>
        </div>
      </div>

      {/* Dedicated Teacher Control Toolbar (Responsive & Grid on Mobile) */}
      {userRole === 'teacher' && (
        <div className="bg-amber-950/95 text-amber-100 border-t-2 border-b-2 border-amber-400 px-2 sm:px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex items-center justify-between gap-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase bg-amber-400 text-blue-950 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                MENU AKSES GURU:
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-1.5 sm:gap-2 w-full">
              <button
                onClick={() => handleTabClick('students')}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase transition-all ${
                  activeTab === 'students'
                    ? 'bg-amber-400 text-blue-950 border-2 border-amber-300 shadow-sm scale-[1.02]'
                    : 'bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-500/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>KELOLA MURID</span>
              </button>

              <button
                onClick={() => handleTabClick('teacher_reports')}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase transition-all ${
                  activeTab === 'teacher_reports'
                    ? 'bg-amber-400 text-blue-950 border-2 border-amber-300 shadow-sm scale-[1.02]'
                    : 'bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-500/50'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>INPUT PRESTASI</span>
              </button>

              <button
                onClick={() => handleTabClick('manage')}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase transition-all ${
                  activeTab === 'manage'
                    ? 'bg-amber-400 text-blue-950 border-2 border-amber-300 shadow-sm scale-[1.02]'
                    : 'bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-500/50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>KELOLA ROSTER</span>
              </button>

              <button
                onClick={() => onOpenGoogleSheetsModal()}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase bg-green-600 hover:bg-green-500 text-white border border-green-300 transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-green-200 shrink-0" />
                <span>GOOGLE SHEETS</span>
              </button>

              {onOpenPrintRoster && (
                <button
                  onClick={() => onOpenPrintRoster()}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase bg-purple-600 hover:bg-purple-500 text-white border border-purple-300 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                  <span>CETAK ROSTER</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t-4 border-yellow-400 p-4 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-blue-600 text-xs font-black text-yellow-300 uppercase">
            <span>MENU NAVIGASI APPS</span>
            {userRole === 'teacher' && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenGoogleSheetsModal();
                }}
                className="text-[11px] bg-green-500 text-white px-2.5 py-1 rounded-full font-black uppercase flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> GOOGLE SHEETS
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {onOpenDevAnalytics && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDevAnalytics();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border-2 border-indigo-700 shadow-[3px_3px_0px_#1e1b4b]"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>📊 DEVELOPER ANALYTICS (PIN: dvv.cacing)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </button>
            )}

            {onOpenPrintRoster && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPrintRoster();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-300 shadow-[3px_3px_0px_#4c1d95]"
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>🖨️ CETAK ROSTER (TABEL RESMI)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </button>
            )}

            {userRole === 'teacher' && (
              <button
                onClick={() => handleTabClick('students')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                  activeTab === 'students'
                    ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                    : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>📋 DATA & KELOLA MURID</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            )}

            <button
              onClick={() => handleTabClick('class')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'class'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>JADWAL KELAS {selectedClass}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabClick('parent_portal')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'parent_portal'
                  ? 'bg-emerald-400 text-blue-950 shadow-[3px_3px_0px_#14532d] border-2 border-emerald-300'
                  : 'bg-emerald-800 text-white hover:bg-emerald-700 border border-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-200" />
                <span>PORTAL ORANG TUA (PRESTASI & RAPOR)</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabClick('matrix')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'matrix'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4" />
                <span>MATRIKS SEMUA KELAS</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabClick('homework')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'homework'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>TUGAS RUMAH (PR)</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleTabClick('quiz')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'quiz'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-4 h-4" />
                <span>GAME KUIS MATA PELAJARAN</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            {userRole === 'teacher' && (
              <button
                onClick={() => handleTabClick('teacher_reports')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                  activeTab === 'teacher_reports'
                    ? 'bg-amber-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-amber-300'
                    : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>INPUT PRESTASI & PERKEMBANGAN MURID</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            )}

            {userRole === 'teacher' && (
              <button
                onClick={() => handleTabClick('manage')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                  activeTab === 'manage'
                    ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                    : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Edit3 className="w-4 h-4" />
                  <span>INPUT & EDIT JADWAL +</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
