import React, { useState } from 'react';
import { ALL_CLASSES, ALL_DAYS, SUBJECTS_MAP, TIME_SLOTS } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, ScheduleItem } from '../types';
import { Search, Printer, Filter, Grid, Info, Sparkles } from 'lucide-react';

interface FullMatrixViewProps {
  schedules: ScheduleItem[];
  currentDay: DayOfWeek | null;
  onSelectClass: (c: ClassGroup) => void;
  onEditItem: (item: ScheduleItem) => void;
}

export const FullMatrixView: React.FC<FullMatrixViewProps> = ({
  schedules,
  currentDay,
  onSelectClass,
  onEditItem,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDay || 'Senin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<'ALL' | '1-3' | '4-6'>('ALL');

  const visibleClasses = ALL_CLASSES.filter((cls) => {
    if (filterGrade === '1-3') return ['1A', '1B', '2A', '2B', '3A', '3B'].includes(cls);
    if (filterGrade === '4-6') return ['4A', '4B', '5A', '5B', '6A', '6B'].includes(cls);
    return true;
  });

  const getCellItem = (classGroup: ClassGroup, slotId: number) => {
    return schedules.find(
      (s) => s.classGroup === classGroup && s.day === selectedDay && s.slotId === slotId
    );
  };

  const isMatchesSearch = (subjectCode?: string) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const info = subjectCode ? SUBJECTS_MAP[subjectCode] : null;
    return (
      (subjectCode && subjectCode.toLowerCase().includes(query)) ||
      (info && info.fullName.toLowerCase().includes(query))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters - Vibrant Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-4 border-blue-100 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black tracking-wider text-blue-950 bg-yellow-400 px-3 py-1 rounded-full border border-yellow-500 shadow-sm uppercase">
              YAYASAN AMKUR FLORES (YAMKURES)
            </span>
            <h2 className="text-2xl font-black text-blue-950 dark:text-white mt-2">
              Matriks Jadwal Pelajaran SDK St. Teresia Danga - Mbay
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
              Tabel Lengkap Semua Kelas (1A - 6B) TAPEL 2025/2026. Klik sel untuk mengubah jadwal.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Printer className="w-4 h-4 text-blue-950" />
            CETAK MATRIKS
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-slate-800 p-2 rounded-2xl border-2 border-blue-200 dark:border-slate-700 overflow-x-auto">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#1e3a8a] border-2 border-blue-500'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border-2 border-slate-200 hover:bg-sky-100'
                }`}
              >
                HARI {day}
              </button>
            ))}
          </div>

          {/* Grade filter & search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-sky-50 dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-blue-200 dark:border-slate-700">
              <Filter className="w-4 h-4 text-blue-600 ml-1" />
              <button
                onClick={() => setFilterGrade('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                  filterGrade === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterGrade('1-3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                  filterGrade === '1-3' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Kelas 1-3
              </button>
              <button
                onClick={() => setFilterGrade('4-6')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                  filterGrade === '4-6' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Kelas 4-6
              </button>
            </div>

            {/* Search subject */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari mapel (cth: PJOK)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Legend Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border-4 border-blue-100 dark:border-slate-800 shadow-lg text-xs">
        <span className="font-black text-blue-950 dark:text-white block mb-3 flex items-center gap-2 text-sm uppercase">
          <Sparkles className="w-4 h-4 text-yellow-500" /> Kode Warna Mata Pelajaran (Resmi TAPEL):
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.values(SUBJECTS_MAP).map((sub) => (
            <div
              key={sub.code}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border-2 shadow-sm ${sub.colorBg} ${sub.colorText} ${sub.colorBorder}`}
            >
              {sub.code}: <span className="font-semibold">{sub.fullName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-blue-600 text-white font-black border-b-4 border-blue-700 text-xs">
                <th className="py-3.5 px-2 border-r-2 border-blue-500 w-16">JAM</th>
                <th className="py-3.5 px-3 border-r-2 border-blue-500 w-28">WAKTU</th>
                {visibleClasses.map((cls) => (
                  <th
                    key={cls}
                    onClick={() => onSelectClass(cls)}
                    className="py-3.5 px-2 border-r-2 border-blue-500 hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <div className="text-base font-black text-yellow-300">{cls}</div>
                    <div className="text-[10px] font-bold text-blue-100">Buka Kelas</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <tr key={slot.id} className="bg-yellow-400 font-black text-blue-950 border-b-2 border-yellow-500">
                      <td className="py-3 px-2 border-r-2 border-yellow-500 font-black">{slot.id}</td>
                      <td className="py-3 px-2 border-r-2 border-yellow-500 font-mono text-[11px]">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td colSpan={visibleClasses.length} className="py-3 text-center tracking-widest uppercase font-black">
                        🍿 ISTIRAHAT DAN MAKAN 🥪
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id} className="border-b-2 border-slate-100 dark:border-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-2 border-r-2 border-slate-100 dark:border-slate-800 font-black bg-sky-50 dark:bg-slate-800/60 text-blue-950 dark:text-white">
                      {slot.id === 0 ? 'Awal' : slot.id}
                    </td>
                    <td className="py-2.5 px-2 border-r-2 border-slate-100 dark:border-slate-800 font-mono text-[11px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/40">
                      {slot.startTime} - {slot.endTime}
                    </td>

                    {visibleClasses.map((cls) => {
                      const item = getCellItem(cls, slot.id);
                      const code = item?.subjectCode || '-';
                      const subInfo = SUBJECTS_MAP[code];
                      const highlighted = isMatchesSearch(code);

                      return (
                        <td
                          key={cls}
                          onClick={() => {
                            if (item) onEditItem(item);
                          }}
                          className={`py-2 px-1 border-r-2 border-slate-100 dark:border-slate-800 font-black cursor-pointer transition-all hover:scale-[1.05] ${
                            highlighted
                              ? 'ring-4 ring-yellow-400 ring-offset-1 z-10 font-black bg-yellow-200'
                              : ''
                          } ${
                            subInfo
                              ? `${subInfo.colorBg} ${subInfo.colorText}`
                              : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={subInfo ? `${subInfo.fullName} (${cls})` : `Kelas ${cls}`}
                        >
                          <div className="text-[11px] font-black leading-tight truncate px-1">
                            {code}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
