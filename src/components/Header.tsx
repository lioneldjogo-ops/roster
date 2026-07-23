import React from 'react';
import { ALL_CLASSES } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek } from '../types';
import { Bell, BellOff, Calendar, Clock, Edit3, Grid, School, Sparkles, CheckSquare, RefreshCw } from 'lucide-react';
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
  return (
    <header className="bg-blue-600 text-white shadow-xl sticky top-0 z-30 border-b-4 border-blue-700">
      {/* Top Notice Bar */}
      <div className="bg-blue-800 text-blue-100 text-xs py-1.5 px-4 border-b border-blue-700 font-bold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full text-[11px] font-black uppercase shadow-sm">
              YAMKURES
            </span>
            <span className="tracking-wide">SDK ST. TERESIA DANGA - MBAY | TAPEL 2025 / 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-blue-950/60 px-3 py-0.5 rounded-full text-[11px] font-black text-yellow-300 border border-blue-700">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>{currentDay || 'Hari Libur'} • {currentTimeStr} WITA</span>
            </div>
            {activePeriodName && (
              <div className="flex items-center gap-1.5 bg-yellow-400 text-blue-950 font-black px-3 py-0.5 rounded-full text-[11px] shadow-[2px_2px_0px_#1e3a8a] animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-blue-900" />
                <span>{activePeriodName}: {activeSubjectName || 'Istirahat'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Controls Section */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full p-1 shadow-lg border-2 border-yellow-400 flex items-center justify-center shrink-0">
            <img 
              src={schoolLogo} 
              alt="Logo SDK St. Teresia Danga" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
              SD Katolik Santa Theresia
              <span className="text-[11px] bg-yellow-400 text-blue-950 font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                SD
              </span>
            </h1>
            <p className="text-xs text-blue-100 font-bold tracking-wide">
              Jadwal Pelajaran & Notifikasi Harian Siswa
            </p>
          </div>
        </div>

        {/* Controls & Class Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
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
            className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-2xl transition-all shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none ${
              notificationsEnabled
                ? 'bg-green-400 hover:bg-green-300 text-green-950 border-2 border-green-300'
                : 'bg-yellow-400 hover:bg-yellow-300 text-blue-950 border-2 border-yellow-300'
            }`}
            title={notificationsEnabled ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4 text-green-950 animate-bounce" />
                <span className="hidden sm:inline">ALARM AKTIF</span>
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
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-blue-700 px-4 py-2 border-t-2 border-blue-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('class')}
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
            onClick={() => onSelectTab('matrix')}
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
            onClick={() => onSelectTab('reminders')}
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
            onClick={() => onSelectTab('manage')}
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
    </header>
  );
};
