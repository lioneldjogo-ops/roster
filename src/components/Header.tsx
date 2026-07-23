import React, { useState } from 'react';
import { ALL_CLASSES } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek } from '../types';
import { Bell, BellOff, Calendar, Clock, Edit3, Grid, School, Sparkles, CheckSquare, RefreshCw, Menu, X, ChevronRight } from 'lucide-react';
import schoolLogo from '../assets/images/school_logo_st_teresia_1784846232480.jpg';

interface HeaderProps {
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  activeTab: 'class' | 'matrix' | 'reminders' | 'manage';
  onSelectTab: (tab: 'class' | 'matrix' | 'reminders' | 'manage') => void;
  currentDay: DayOfWeek | null;
  currentTimeStr: string;
  activePeriodName?: string;
  activeSubjectName?: string;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
  onResetDefaultSchedule: () => void;
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
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'class' | 'matrix' | 'reminders' | 'manage') => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-blue-600 text-white shadow-xl sticky top-0 z-40 border-b-4 border-blue-700">
      {/* Top Notice Bar */}
      <div className="bg-blue-800 text-blue-100 text-xs py-1.5 px-3 md:px-4 border-b border-blue-700 font-bold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-black uppercase shadow-sm shrink-0">
              YAMKURES
            </span>
            <span className="tracking-wide truncate text-[11px] md:text-xs">
              SDK ST. TERESIA DANGA - MBAY
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 bg-blue-950/70 px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-black text-yellow-300 border border-blue-700">
              <Clock className="w-3 h-3 text-yellow-400" />
              <span>{currentDay || 'Libur'} • {currentTimeStr} WITA</span>
            </div>
            {activePeriodName && (
              <div className="flex items-center gap-1.5 bg-yellow-400 text-blue-950 font-black px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] shadow-[2px_2px_0px_#1e3a8a] animate-bounce">
                <Sparkles className="w-3 h-3 text-blue-900" />
                <span className="truncate max-w-[150px] sm:max-w-none">{activePeriodName}: {activeSubjectName || 'Istirahat'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Section */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 md:py-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Logo & School Name */}
        <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full p-0.5 md:p-1 shadow-lg border-2 border-yellow-400 flex items-center justify-center shrink-0">
            <img 
              src={schoolLogo} 
              alt="Logo SDK St. Teresia Danga" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm truncate">
              <span className="truncate">SDK St. Teresia Danga</span>
              <span className="text-[9px] sm:text-[11px] bg-yellow-400 text-blue-950 font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase shadow-sm shrink-0">
                SD
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-100 font-bold tracking-wide truncate">
              Jadwal Pelajaran & Notifikasi Harian Siswa
            </p>
          </div>
        </div>

        {/* Desktop Controls (Class Selector & Buttons) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Class selector */}
          <div className="flex items-center gap-2 bg-blue-700 p-1.5 rounded-2xl border-2 border-blue-500 shadow-inner">
            <span className="text-xs font-black text-white px-2 flex items-center gap-1 uppercase tracking-tight">
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

          {/* Notification permission button */}
          <button
            onClick={onRequestNotificationPermission}
            className={`flex items-center gap-2 text-xs font-black px-3.5 py-2 rounded-2xl transition-all shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none ${
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

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('Aplikasi akan memuat ulang Jadwal Resmi TAPEL 2025/2026. Lanjutkan?')) {
                onResetDefaultSchedule();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-black bg-blue-800 hover:bg-blue-700 text-blue-100 px-3 py-2 rounded-2xl border-2 border-blue-600 transition-colors shadow-sm"
            title="Reset ke Jadwal Asli TAPEL 2025/2026"
          >
            <RefreshCw className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden lg:inline">RESET</span>
          </button>
        </div>

        {/* Mobile Hamburger Menu Button (Garis Tiga) */}
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
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => handleTabClick('class')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === 'class'
                ? 'bg-yellow-400 text-blue-950 shadow-[4px_4px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            JADWAL KELAS {selectedClass}
          </button>

          <button
            onClick={() => handleTabClick('matrix')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-yellow-400 text-blue-950 shadow-[4px_4px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Grid className="w-4 h-4" />
            MATRIKS SEMUA KELAS
          </button>

          <button
            onClick={() => handleTabClick('reminders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === 'reminders'
                ? 'bg-yellow-400 text-blue-950 shadow-[4px_4px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            PENGINGAT & CHECKLIST
          </button>

          <button
            onClick={() => handleTabClick('manage')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-yellow-400 text-blue-950 shadow-[4px_4px_0px_#1e3a8a] border-2 border-yellow-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            INPUT & EDIT JADWAL +
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (Menu Garis Tiga Container) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t-4 border-yellow-400 p-4 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-blue-600 text-xs font-black text-yellow-300 uppercase">
            <span>MENU NAVIGASI APPS</span>
            <span>PILIH KELAS & MENU</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
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
              onClick={() => handleTabClick('reminders')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === 'reminders'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'bg-blue-700 text-white hover:bg-blue-600 border border-blue-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>PENGINGAT & CHECKLIST TAS</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

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
          </div>

          {/* Quick Action Controls in Mobile Drawer */}
          <div className="pt-3 border-t border-blue-600 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onRequestNotificationPermission();
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-black py-2.5 px-3 rounded-xl border-2 transition-all shadow-sm ${
                notificationsEnabled
                  ? 'bg-green-400 text-green-950 border-green-300'
                  : 'bg-yellow-400 text-blue-950 border-yellow-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{notificationsEnabled ? 'ALARM AKTIF' : 'AKTIFKAN ALARM'}</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (confirm('Aplikasi akan memuat ulang Jadwal Resmi TAPEL 2025/2026. Lanjutkan?')) {
                  onResetDefaultSchedule();
                }
              }}
              className="flex items-center gap-1.5 bg-blue-900 text-blue-100 text-xs font-black py-2.5 px-3 rounded-xl border border-blue-600"
            >
              <RefreshCw className="w-3.5 h-3.5 text-yellow-300" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

