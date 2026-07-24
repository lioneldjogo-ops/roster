import React, { useState } from 'react';
import { ALL_DAYS, SUBJECTS_MAP, TIME_SLOTS } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, ScheduleItem, SubjectInfo } from '../types';
import { 
  BookOpen, Calculator, FlaskConical, GraduationCap, HeartHandshake, 
  Languages, Palette, Shield, Sparkles, Trophy, Flag, Clock, Plus, 
  Edit, Trash2, CheckCircle, AlertCircle, Info, Printer
} from 'lucide-react';
import { SubjectGearChecklist } from './SubjectGearChecklist';

interface ClassScheduleViewProps {
  selectedClass: ClassGroup;
  schedules: ScheduleItem[];
  currentDay: DayOfWeek | null;
  onEditItem: (item: ScheduleItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddNewItem: (classGroup: ClassGroup, day: DayOfWeek) => void;
  onOpenPrintRoster?: () => void;
  isTeacher?: boolean;
}

export const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({
  selectedClass,
  schedules,
  currentDay,
  onEditItem,
  onDeleteItem,
  onAddNewItem,
  onOpenPrintRoster,
  isTeacher = false,
}) => {
  const [activeDayFilter, setActiveDayFilter] = useState<DayOfWeek | 'ALL'>(
    currentDay || 'Senin'
  );

  const [classSubjectTeachers, setClassSubjectTeachers] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    try {
      const savedSubjectTeachers = localStorage.getItem('sdk_teresia_subject_teachers_v1');
      if (savedSubjectTeachers) {
        const parsed = JSON.parse(savedSubjectTeachers);
        setClassSubjectTeachers(parsed[selectedClass] || {});
      } else {
        setClassSubjectTeachers({});
      }
    } catch (e) {}
  }, [selectedClass]);

  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Languages': return <Languages className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Flag': return <Flag className="w-5 h-5" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  const filteredDays = activeDayFilter === 'ALL' ? ALL_DAYS : [activeDayFilter];

  return (
    <div className="space-y-8">
      {/* Top Controls & Day Selector - Vibrant Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-4 border-blue-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-blue-950 dark:text-white flex items-center flex-wrap gap-2 sm:gap-3">
            <span className="text-3xl">🏫</span> Jadwal Belajar Kelas {selectedClass}
            {currentDay && (
              <span className="text-xs bg-green-400 text-green-950 font-black px-3 py-1 rounded-full border-2 border-green-500 shadow-sm uppercase">
                HARI INI: {currentDay}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Pilih hari untuk melihat susunan mata pelajaran dan peralatan yang perlu dibawa siswa.
          </p>
        </div>

        {onOpenPrintRoster && (
          <button
            onClick={onOpenPrintRoster}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-3 rounded-2xl border-2 border-purple-500 shadow-[3px_3px_0px_#4c1d95] active:translate-y-0.5 active:shadow-none transition-all uppercase shrink-0"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>CETAK ROSTER (TABEL RESMI)</span>
          </button>
        )}
      </div>

        {/* Day Pills - Vibrant Neo-brutalism Style */}
        <div className="flex flex-wrap items-center gap-2 bg-sky-50 dark:bg-slate-800 p-2 rounded-2xl border-2 border-blue-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveDayFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              activeDayFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#1e3a8a] border-2 border-blue-500'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border-2 border-slate-200 hover:bg-sky-100'
            }`}
          >
            Semua Hari
          </button>
          {ALL_DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDayFilter(day)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                activeDayFilter === day
                  ? 'bg-red-500 text-white shadow-[3px_3px_0px_#991b1b] border-2 border-red-400'
                  : currentDay === day
                  ? 'bg-green-400 text-green-950 border-2 border-green-500 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border-2 border-slate-200 hover:bg-sky-100'
              }`}
            >
              {day}
              {currentDay === day && (
                <span className="w-2 h-2 rounded-full bg-green-950 animate-ping"></span>
              )}
            </button>
          ))}
        </div>

      {/* Days Schedule Sections */}
      <div className="space-y-8">
        {filteredDays.map((day) => {
          const dayItems = schedules.filter(
            (s) => s.classGroup === selectedClass && s.day === day
          );

          return (
            <div
              key={day}
              className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-[3px_3px_0px_#1e3a8a] border-2 border-blue-400">
                    {day.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
                      HARI {day}
                      {currentDay === day && (
                        <span className="text-[11px] bg-green-400 text-green-950 border-2 border-green-500 px-3 py-0.5 rounded-full font-black">
                          HARI INI
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      SDK St. Teresia Danga • {dayItems.length} Sesi Pembelajaran
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onAddNewItem(selectedClass, day)}
                  className="flex items-center gap-2 text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-4 py-2 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Plus className="w-4 h-4 text-blue-950" />
                  <span>TAMBAH SESI +</span>
                </button>
              </div>

              {/* Time Slot Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {TIME_SLOTS.map((slot) => {
                  const scheduleItem = dayItems.find((item) => item.slotId === slot.id);
                  const subjectInfo: SubjectInfo | undefined = scheduleItem
                    ? SUBJECTS_MAP[scheduleItem.subjectCode]
                    : undefined;

                  const isBreak = slot.isBreak || scheduleItem?.subjectCode === 'ISTIRAHAT';

                  // Assign Vibrant palette thick border colors based on slot or subject
                  const colorBorders = [
                    'border-green-500',
                    'border-blue-500',
                    'border-orange-500',
                    'border-purple-500',
                    'border-rose-500',
                    'border-amber-500',
                    'border-sky-500',
                    'border-emerald-500',
                  ];
                  const borderClass = isBreak 
                    ? 'border-yellow-400' 
                    : colorBorders[slot.id % colorBorders.length];

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-[28px] border-b-8 border-r-8 ${borderClass} border-2 border-slate-200 dark:border-slate-800 p-5 transition-all relative group flex flex-col justify-between shadow-lg hover:scale-[1.02] ${
                        isBreak
                          ? 'bg-amber-50 dark:bg-amber-950/20'
                          : subjectInfo
                          ? `${subjectInfo.colorBg}`
                          : 'bg-white dark:bg-slate-800/50'
                      }`}
                    >
                      {/* Card Header: Slot time */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black text-blue-950 dark:text-white flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {slot.label} ({slot.startTime} - {slot.endTime})
                          </span>

                          {/* Quick action overlay */}
                          {isTeacher && scheduleItem && !isBreak && (
                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditItem(scheduleItem)}
                                className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 rounded-xl text-blue-600 border border-blue-200 shadow-sm"
                                title="Edit Pelajaran"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(scheduleItem.id)}
                                className="p-1.5 bg-white hover:bg-rose-50 dark:bg-slate-800 text-rose-600 rounded-xl border border-rose-200 shadow-sm"
                                title="Hapus Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        {isBreak ? (
                          <div className="py-4 text-center space-y-1">
                            <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                              🍿 ISTIRAHAT & MAKAN
                            </span>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                              Kudapan sehat & bermain 🥪
                            </span>
                          </div>
                        ) : subjectInfo ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-12 h-12 rounded-2xl text-white shadow-md flex items-center justify-center text-xl shrink-0 border-2 border-white/20"
                                style={{ backgroundColor: subjectInfo.badgeColor }}
                              >
                                {renderSubjectIcon(subjectInfo.iconName)}
                              </div>
                              <div>
                                <h4 className={`text-base font-black leading-tight ${subjectInfo.colorText}`}>
                                  {subjectInfo.fullName}
                                </h4>
                                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 block mt-0.5 uppercase tracking-wide">
                                  {scheduleItem?.subjectCode}
                                </span>
                              </div>
                            </div>

                            {/* Teacher info */}
                            <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1 pt-2 border-t-2 border-dashed border-black/10 dark:border-white/10 font-bold">
                              <p className="flex items-center gap-1.5">
                                👩‍🏫 {(scheduleItem && classSubjectTeachers[scheduleItem.subjectCode]) || scheduleItem?.teacherName || subjectInfo.teacherDefault || 'Guru Pengajar'}
                              </p>
                              {scheduleItem?.notes && (
                                <p className="text-[11px] text-blue-900 dark:text-blue-300 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-blue-200 dark:border-slate-700 font-bold">
                                  📌 {scheduleItem.notes}
                                </p>
                              )}
                            </div>

                            {/* Required Gear preview */}
                            {subjectInfo.requiredGear && subjectInfo.requiredGear.length > 0 && (
                              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1 shadow-sm">
                                <span className="font-black text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Perlengkapan Siswa:
                                </span>
                                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-bold space-y-0.5">
                                  {subjectInfo.requiredGear.map((gear, idx) => (
                                    <li key={idx} className="truncate">{gear}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <p className="text-xs font-bold text-slate-400 italic">Kosong / Libur</p>
                            {isTeacher && (
                              <button
                                onClick={() => onAddNewItem(selectedClass, day)}
                                className="mt-2 text-[11px] bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                + TAMBAH
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checklist Perlengkapan & Informasi Mata Pelajaran Murid (dengan Tombol Tambah, Edit, dan Hapus) */}
      <SubjectGearChecklist isTeacher={isTeacher} selectedClass={selectedClass} />
    </div>
  );
};
