import React, { useState, useEffect } from 'react';
import { ALL_CLASSES, ALL_DAYS, SUBJECTS_MAP, TIME_SLOTS } from '../data/defaultSchedule';
import { ClassGroup, ScheduleItem } from '../types';
import { Printer, X, Sparkles, UserCheck, ChevronDown, ChevronUp, Edit3, Heart, Star, Award } from 'lucide-react';

import sdKidsKelas1Img from '../assets/images/sd_kids_kelas1_1784863874884.jpg';
import sdKidsKelas3Img from '../assets/images/sd_kids_kelas3_1784863892434.jpg';
import sdKidsKelas5Img from '../assets/images/sd_kids_kelas5_1784863903182.jpg';

interface PrintRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleItem[];
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
}

interface ClassTheme {
  gradeLabel: string;
  subTitle: string;
  themeGradient: string;
  headerBg: string;
  borderStyle: string;
  tableHeaderBg: string;
  mascots: string[];
  motto: string;
  badgeBg: string;
  badgeText: string;
  accentIcon: string;
  cartoonImg: string;
  cartoonCaption: string;
}

const getClassTheme = (cls: string): ClassTheme => {
  if (cls.startsWith('1')) {
    return {
      gradeLabel: 'DUNIA KECIL CERIA 🎈 A B C',
      subTitle: 'Fase A • Fondasi Karakter & Literasi Ceria',
      themeGradient: 'from-amber-400 via-rose-400 to-sky-400',
      headerBg: 'bg-rose-50/90 border-rose-300',
      borderStyle: 'border-rose-400',
      tableHeaderBg: 'bg-gradient-to-r from-rose-600 to-pink-600',
      mascots: ['🎒', '✏️', '🧸', '🐥', '🎨', '🌟', '🎈'],
      motto: '“Belajar Ceria, Bermain Gembira, Tumbuh Baik Setiap Hari!”',
      badgeBg: 'bg-rose-500 text-white',
      badgeText: 'FASE A - KELAS 1',
      accentIcon: '🚌',
      cartoonImg: sdKidsKelas1Img,
      cartoonCaption: 'Siswa Kelas 1 SD • Semangat Belajar & Bermain Ceria',
    };
  } else if (cls.startsWith('2')) {
    return {
      gradeLabel: 'PETUALANG CILIK KREATIF 🎨 🌱',
      subTitle: 'Fase A • Mengasah Kreativitas & Kebiasaan Mandiri',
      themeGradient: 'from-emerald-400 via-teal-400 to-amber-300',
      headerBg: 'bg-emerald-50/90 border-emerald-300',
      borderStyle: 'border-emerald-400',
      tableHeaderBg: 'bg-gradient-to-r from-emerald-700 to-teal-700',
      mascots: ['🌱', '🦋', '🎨', '⚽', '📚', '🌈', '🌻'],
      motto: '“Kreatif, Mandiri, Berani Mencoba & Sayang Teman!”',
      badgeBg: 'bg-emerald-600 text-white',
      badgeText: 'FASE A - KELAS 2',
      accentIcon: '🌱',
      cartoonImg: sdKidsKelas1Img,
      cartoonCaption: 'Siswa Kelas 2 SD • Mandiri, Rajin & Sayang Teman',
    };
  } else if (cls.startsWith('3')) {
    return {
      gradeLabel: 'EKSPLORASI SAINS & CERITA 🚀 📚',
      subTitle: 'Fase B • Menjelajah Ilmu & Kemandirian Belajar',
      themeGradient: 'from-sky-400 via-blue-500 to-indigo-500',
      headerBg: 'bg-sky-50/90 border-sky-300',
      borderStyle: 'border-sky-400',
      tableHeaderBg: 'bg-gradient-to-r from-sky-700 to-blue-800',
      mascots: ['🚀', '🦉', '🔍', '📖', '🧩', '⚡', '🌌'],
      motto: '“Penasaran dengan Ilmu Baru, Tekun & Pantang Menyerah!”',
      badgeBg: 'bg-sky-600 text-white',
      badgeText: 'FASE B - KELAS 3',
      accentIcon: '🚀',
      cartoonImg: sdKidsKelas3Img,
      cartoonCaption: 'Siswa Kelas 3 SD • Gemar Membaca & Eksplorasi Sains',
    };
  } else if (cls.startsWith('4')) {
    return {
      gradeLabel: 'PENJELAJAH NUSANTARA & DUNIA 🌍 🗺️',
      subTitle: 'Fase B • Cinta Tanah Air & Karakter Pancasila',
      themeGradient: 'from-teal-400 via-emerald-500 to-amber-400',
      headerBg: 'bg-teal-50/90 border-teal-300',
      borderStyle: 'border-teal-400',
      tableHeaderBg: 'bg-gradient-to-r from-teal-800 to-emerald-800',
      mascots: ['🌍', '🧭', '🇮🇩', '🏛️', '🔬', '🏆', '⭐'],
      motto: '“Bangga Bermartabat, Berwawasan Nusantara & Berprestasi!”',
      badgeBg: 'bg-teal-600 text-white',
      badgeText: 'FASE B - KELAS 4',
      accentIcon: '🌍',
      cartoonImg: sdKidsKelas3Img,
      cartoonCaption: 'Siswa Kelas 4 SD • Cinta Tanah Air & Karakter Pancasila',
    };
  } else if (cls.startsWith('5')) {
    return {
      gradeLabel: 'GENERASI CERDAS & JUARA 🏆 💡',
      subTitle: 'Fase C • Kepemimpinan, Bernalar Kritis & Inovasi',
      themeGradient: 'from-blue-600 via-indigo-600 to-amber-400',
      headerBg: 'bg-indigo-50/90 border-indigo-300',
      borderStyle: 'border-indigo-400',
      tableHeaderBg: 'bg-gradient-to-r from-indigo-800 to-blue-900',
      mascots: ['🏆', '💡', '💻', '📐', '👑', '🥇', '⚡'],
      motto: '“Bernalar Kritis, Berjiwa Pemimpin & Berakhlak Mulia!”',
      badgeBg: 'bg-indigo-600 text-white',
      badgeText: 'FASE C - KELAS 5',
      accentIcon: '🏆',
      cartoonImg: sdKidsKelas5Img,
      cartoonCaption: 'Siswa Kelas 5 SD • Cerdas, Berprestasi & Berjiwa Pemimpin',
    };
  } else {
    return {
      gradeLabel: 'TUNAS LEADER & KELULUSAN 🎓 ✨',
      subTitle: 'Fase C • Teladan Utama, Persiapan Masa Depan & Kelulusan',
      themeGradient: 'from-purple-600 via-violet-600 to-amber-400',
      headerBg: 'bg-purple-50/90 border-purple-300',
      borderStyle: 'border-purple-400',
      tableHeaderBg: 'bg-gradient-to-r from-purple-900 to-slate-900',
      mascots: ['🎓', '✨', '📜', '🌟', '🚀', '⭐', '🥇'],
      motto: '“Menjadi Teladan Terbaik, Siap Meraih Cita-Cita Tinggi!”',
      badgeBg: 'bg-purple-700 text-white',
      badgeText: 'FASE C - KELAS 6',
      accentIcon: '🎓',
      cartoonImg: sdKidsKelas5Img,
      cartoonCaption: 'Siswa Kelas 6 SD • Teladan Utama & Siap Sukses Kelulusan',
    };
  }
};

export const PrintRosterModal: React.FC<PrintRosterModalProps> = ({
  isOpen,
  onClose,
  schedules,
  selectedClass,
  onSelectClass,
}) => {
  const [homeroomTeacher, setHomeroomTeacher] = useState<string>('Ibu Maria S.Pd');
  const [subjectTeachersMap, setSubjectTeachersMap] = useState<Record<string, string>>({});
  const [showQuickEditTeachers, setShowQuickEditTeachers] = useState<boolean>(false);

  // Load Homeroom & Subject Teachers whenever selectedClass or isOpen changes
  useEffect(() => {
    try {
      const savedHomeroom = localStorage.getItem('sdk_teresia_homeroom_teachers_v1');
      if (savedHomeroom) {
        const parsed = JSON.parse(savedHomeroom);
        setHomeroomTeacher(parsed[selectedClass] || 'Ibu Maria S.Pd');
      }

      const savedSubjectTeachers = localStorage.getItem('sdk_teresia_subject_teachers_v1');
      if (savedSubjectTeachers) {
        const parsed = JSON.parse(savedSubjectTeachers);
        setSubjectTeachersMap(parsed[selectedClass] || {});
      } else {
        setSubjectTeachersMap({});
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedClass, isOpen]);

  if (!isOpen) return null;

  const theme = getClassTheme(selectedClass);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateHomeroomTeacher = (name: string) => {
    setHomeroomTeacher(name);
    try {
      const savedHomeroom = localStorage.getItem('sdk_teresia_homeroom_teachers_v1');
      const allMap = savedHomeroom ? JSON.parse(savedHomeroom) : {};
      allMap[selectedClass] = name;
      localStorage.setItem('sdk_teresia_homeroom_teachers_v1', JSON.stringify(allMap));
    } catch (e) {}
  };

  const handleUpdateSubjectTeacher = (subjectCode: string, name: string) => {
    const updated = { ...subjectTeachersMap, [subjectCode]: name };
    setSubjectTeachersMap(updated);

    try {
      const savedSubjectTeachers = localStorage.getItem('sdk_teresia_subject_teachers_v1');
      const allMap = savedSubjectTeachers ? JSON.parse(savedSubjectTeachers) : {};
      allMap[selectedClass] = updated;
      localStorage.setItem('sdk_teresia_subject_teachers_v1', JSON.stringify(allMap));
    } catch (e) {}
  };

  const getItem = (day: string, slotId: number) => {
    return schedules.find(
      (s) => s.classGroup === selectedClass && s.day === day && s.slotId === slotId
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-[32px] border-4 border-amber-400 max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto my-auto print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Controls Bar (Hidden during window.print) */}
        <div className="print:hidden flex items-center justify-between pb-4 border-b-2 border-dashed border-slate-200">
          <div>
            <span className="text-[10px] font-black tracking-wider bg-amber-400 text-blue-950 px-3 py-1 rounded-full border border-amber-300 uppercase shadow-sm">
              ✨ ROSTER ATRAKTIF DENGAN TEMA ANIMASI KELAS
            </span>
            <h3 className="text-xl font-black text-blue-950 uppercase flex items-center gap-2 mt-1">
              <Printer className="w-6 h-6 text-purple-600" />
              CETAK ROSTER TABEL BERGAMBAR - KELAS {selectedClass}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-purple-700 shadow-md flex items-center gap-2 uppercase"
            >
              <Printer className="w-4 h-4" /> CETAK SEKARANG (PRINT)
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Class Selector & Quick Controls Bar (Hidden in print) */}
        <div className="print:hidden bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-blue-950">Pilih Kelas:</span>
              <div className="flex flex-wrap gap-1">
                {ALL_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      onSelectClass(cls);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      selectedClass === cls
                        ? 'bg-purple-600 text-white shadow-sm scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-700">Wali Kelas:</span>
              <input
                type="text"
                value={homeroomTeacher}
                onChange={(e) => handleUpdateHomeroomTeacher(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg w-48 focus:border-amber-500 outline-none"
                placeholder="Nama Wali Kelas"
              />

              <button
                type="button"
                onClick={() => setShowQuickEditTeachers(!showQuickEditTeachers)}
                className="text-xs font-black bg-amber-400 hover:bg-amber-300 text-blue-950 px-3 py-1 rounded-lg border border-amber-500 uppercase flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>NAMA GURU MAPEL</span>
                {showQuickEditTeachers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Subject Teachers Quick Edit Form */}
          {showQuickEditTeachers && (
            <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  UBAH / SESUAIKAN NAMA GURU MATA PELAJARAN (KELAS {selectedClass}):
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Data otomatis terupdate secara instan pada tabel roster cetak di bawah.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {Object.keys(SUBJECTS_MAP).map((code) => {
                  const sub = SUBJECTS_MAP[code];
                  const currentInputTeacher = subjectTeachersMap[code] || '';

                  return (
                    <div key={code} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <span className="font-black text-blue-950 uppercase block truncate">
                        {sub.fullName} ({code})
                      </span>
                      <input
                        type="text"
                        placeholder={sub.teacherDefault}
                        value={currentInputTeacher}
                        onChange={(e) => handleUpdateSubjectTeacher(code, e.target.value)}
                        className="w-full bg-white text-xs font-bold py-1 px-2 rounded border border-slate-300 focus:border-amber-500 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PRINTABLE ARTISTIC & FORMAL TABLE AREA */}
        <div id="printable-roster-area" className="bg-white p-5 rounded-3xl border-4 border-slate-800 font-sans space-y-4 text-slate-900 print:border-2 print:border-slate-800 print:p-2">
          {/* Top Decorative Banner with Cartoon Illustration of SD Students */}
          <div className={`p-4 rounded-2xl border-2 ${theme.borderStyle} ${theme.headerBg} relative overflow-hidden space-y-3`}>
            {/* Mascot Emojis Row */}
            <div className="flex items-center justify-between border-b border-slate-300/60 pb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${theme.badgeBg} shadow-sm border border-white/40`}>
                  {theme.badgeText}
                </span>
                <span className="text-xs font-black text-blue-950 uppercase flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  {theme.gradeLabel}
                </span>
              </div>

              {/* Animated Mascots Header Row */}
              <div className="flex items-center gap-2 text-xl select-none">
                {theme.mascots.map((m, i) => (
                  <span key={i} className="hover:scale-125 transition-transform cursor-pointer animate-pulse" title="Karakter Animasi Kelas">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* School Header Title Block with Cartoon SD Kids Illustrations */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
              {/* Left Cartoon Mascot Box */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-md bg-white p-1 hover:scale-105 transition-transform duration-300 relative group">
                  <img
                    src={theme.cartoonImg}
                    alt={theme.cartoonCaption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full text-[10px] animate-bounce shadow">
                    🎒
                  </div>
                </div>
                <span className="text-[10px] font-black text-blue-950 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300 mt-1 uppercase text-center max-w-[130px] leading-tight">
                  Siswa Kelas {selectedClass}
                </span>
              </div>

              {/* Center Title Content */}
              <div className="text-center space-y-1.5 flex-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl animate-bounce">🏫</span>
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">
                    YAYASAN AMKUR FLORES • SDK SANTA THERESIA DANGA
                  </h2>
                  <span className="text-2xl animate-pulse">⭐</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-blue-950 uppercase tracking-tight flex items-center justify-center gap-2">
                  <span>ROSTER JADWAL PELAJARAN KELAS {selectedClass}</span>
                </h1>

                <p className="text-xs font-extrabold text-slate-700 uppercase">
                  TAHUN PELAJARAN 2025/2026 • {theme.subTitle}
                </p>

                <div className="inline-block bg-amber-200/90 text-blue-950 px-4 py-1 rounded-full border border-amber-300 text-xs font-black shadow-sm">
                  👩‍🏫 Wali Kelas: <span className="text-blue-900 underline font-black">{homeroomTeacher}</span>
                </div>
              </div>

              {/* Right Cartoon Character Badge */}
              <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-blue-400 shadow-md bg-white p-1 hover:scale-105 transition-transform duration-300 relative">
                  <img
                    src={theme.cartoonImg}
                    alt="Kartun SD"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl transform scale-x-[-1]"
                  />
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-white p-1 rounded-full text-[10px] animate-pulse shadow">
                    ⭐
                  </div>
                </div>
                <span className="text-[10px] font-black text-blue-950 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 mt-1 uppercase text-center max-w-[130px] leading-tight">
                  Seragam Merah Putih
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Roster Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-800">
            <table className="w-full border-collapse text-left text-xs font-bold">
              <thead>
                <tr className={`${theme.tableHeaderBg} text-white uppercase text-[11px] font-black text-center border-b-2 border-slate-800`}>
                  <th className="border-r border-slate-700/80 p-2.5 w-12">Jam</th>
                  <th className="border-r border-slate-700/80 p-2.5 w-28">Waktu</th>
                  {ALL_DAYS.map((day) => (
                    <th key={day} className="border-r border-slate-700/80 p-2.5">
                      {day.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => {
                  const isBreak = slot.isBreak;

                  if (isBreak) {
                    return (
                      <tr key={slot.id} className="bg-amber-100/90 text-amber-950 font-black text-center border-b-2 border-slate-800">
                        <td className="border-r border-slate-800 p-2 text-[10px] uppercase font-mono bg-amber-200/80">
                          IST
                        </td>
                        <td className="border-r border-slate-800 p-2 text-[11px] font-mono bg-amber-200/80">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td colSpan={6} className="p-2 uppercase text-xs tracking-wider bg-amber-200/90 font-black border-slate-800">
                          🍿 ISTIRAHAT & MAKAN KUDAPAN SEHAT BERSAMA TEMAN 🍎
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id} className="border-b border-slate-800 hover:bg-slate-50 transition-colors">
                      <td className="border-r border-slate-800 p-2 text-center font-black bg-slate-100 text-blue-950">
                        {slot.id}
                      </td>
                      <td className="border-r border-slate-800 p-2 text-center font-mono text-[11px] bg-slate-50/50">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      {ALL_DAYS.map((day) => {
                        const item = getItem(day, slot.id);
                        const subInfo = item ? SUBJECTS_MAP[item.subjectCode] : null;

                        // Determine exact teacher name based on input in Settings/Form
                        let teacherToShow = '-';
                        if (item && subInfo) {
                          const inputTeacherForSubject = subjectTeachersMap[item.subjectCode];
                          if (inputTeacherForSubject && inputTeacherForSubject.trim().length > 0) {
                            teacherToShow = inputTeacherForSubject;
                          } else if (item.teacherName && item.teacherName.trim().length > 0) {
                            teacherToShow = item.teacherName;
                          } else {
                            teacherToShow = subInfo.teacherDefault;
                          }
                        }

                        return (
                          <td key={day} className="border-r border-slate-800 p-2 vertical-align-top bg-white">
                            {item && subInfo ? (
                              <div className="space-y-0.5">
                                <p className="font-black text-blue-950 text-xs leading-tight flex items-start gap-1">
                                  <span>{subInfo.fullName}</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                                  <span>👩‍🏫</span>
                                  <span className="font-extrabold text-blue-900">{teacherToShow}</span>
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[10px] italic">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Motivation Banner - Proud Student Achievement Banner */}
          <div className={`p-3.5 rounded-2xl border-2 ${theme.borderStyle} ${theme.headerBg} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-blue-950 shadow-sm relative overflow-hidden`}>
            {/* Left: Cartoon Student Mascot Avatar & Pride Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 bg-white shrink-0 shadow-sm relative">
                <img
                  src={theme.cartoonImg}
                  alt="Kartun Kebanggaan Siswa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-blue-950 text-[9px] p-0.5 rounded-full font-black">
                  ⭐
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-blue-950 border border-yellow-300 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-950 animate-spin" />
                    AKU BANGGA SISWA KELAS {selectedClass}!
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    TAPEL 2025/2026
                  </span>
                </div>
                <p className="text-xs font-black text-blue-950 flex items-center gap-1">
                  <span>{theme.accentIcon}</span>
                  <span>{theme.motto}</span>
                </p>
              </div>
            </div>

            {/* Right: School Motto Badge & Pride Stars */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="flex items-center gap-1 text-amber-500 text-base animate-pulse">
                <span>🏆</span>
                <span>⭐</span>
                <span>🥇</span>
              </div>
              <span className="text-[11px] font-black uppercase bg-blue-950 text-white px-3 py-1 rounded-xl shadow border border-blue-800 tracking-wide flex items-center gap-1">
                <span>🏫 SDK ST. TERESIA DANGA</span>
              </span>
            </div>
          </div>

          {/* Printable Footer Signatures */}
          <div className="pt-4 grid grid-cols-2 text-center text-xs font-bold gap-8">
            <div className="space-y-12">
              <div>
                <p>Mengetahui,</p>
                <p className="font-black uppercase text-blue-950">Kepala SDK St. Teresia Danga</p>
              </div>
              <div className="pt-4">
                <p className="font-black underline uppercase text-blue-950">Sr. Yustina S.SpS, S.Pd</p>
                <p className="text-[10px] text-slate-600 font-bold">NIP. 19780212 200501 2 003</p>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <p>Mbay, ................................ 2026</p>
                <p className="font-black uppercase text-blue-950">Wali Kelas {selectedClass}</p>
              </div>
              <div className="pt-4">
                <p className="font-black underline uppercase text-blue-950">{homeroomTeacher}</p>
                <p className="text-[10px] text-slate-600 font-bold">Guru Wali Kelas {selectedClass}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
