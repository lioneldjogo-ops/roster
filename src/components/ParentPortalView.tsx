import React, { useState } from 'react';
import { ALL_CLASSES, ALL_DAYS, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, HomeworkItem, Student, StudentAchievement, StudentProgressReport } from '../types';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Star,
  UserCheck,
  UserCheck2,
  Users,
  XCircle,
  FileText,
  ShieldCheck,
  GraduationCap,
  Bell,
  BellRing,
  Calendar,
  Car,
  AlertTriangle,
  MapPin,
  Info,
  Check,
  Printer
} from 'lucide-react';
import sdKidsKelas1Img from '../assets/images/sd_kids_kelas1_1784863874884.jpg';
import sdKidsKelas3Img from '../assets/images/sd_kids_kelas3_1784863892434.jpg';
import sdKidsKelas5Img from '../assets/images/sd_kids_kelas5_1784863903182.jpg';

interface ParentPortalViewProps {
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  students: Student[];
  homeworkList: HomeworkItem[];
  achievements: StudentAchievement[];
  progressReports: StudentProgressReport[];
  homeroomTeacher: string;
  onToggleStudentHomework: (homeworkId: string, studentId: string, studentName: string) => void;
  onOpenPrintRoster?: () => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  selectedClass,
  onSelectClass,
  students,
  homeworkList,
  achievements,
  progressReports,
  homeroomTeacher,
  onToggleStudentHomework,
  onOpenPrintRoster,
}) => {
  // Class Students Filter
  const classStudents = students.filter((s) => s.classGroup === selectedClass);

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return classStudents[0]?.id || 'std-1a-01';
  });

  const [customStudentName, setCustomStudentName] = useState<string>('');

  // Helper to get current day of week
  const getTodayDayName = (): DayOfWeek => {
    const daysMap: Record<number, DayOfWeek> = {
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu',
      0: 'Senin', // Default Sunday to Monday
    };
    const dayIdx = new Date().getDay();
    return daysMap[dayIdx] || 'Senin';
  };

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayName());
  const [alarmActive, setAlarmActive] = useState<boolean>(true);
  const [alarmToast, setAlarmToast] = useState<string>('');

  // Dismissal info calculator
  const getDismissalInfo = (cls: ClassGroup, day: DayOfWeek) => {
    const isEarlyGrade = cls.startsWith('1') || cls.startsWith('2');

    if (day === 'Jumat') {
      return {
        entryTime: '07:10 WITA',
        breakTime: '09:10 - 09:40 WITA',
        dismissalTime: '11:35 WITA',
        pickupReadyTime: '11:20 WITA',
        activityNotes: 'Senam Pagi Bersama, Kerohanian & Pembinaan Karakter. Semua kelas pulang pukul 11:35 WITA.',
        badgeBg: 'bg-emerald-600 text-white',
        borderBg: 'border-emerald-400',
      };
    }

    if (day === 'Sabtu') {
      if (isEarlyGrade) {
        return {
          entryTime: '07:10 WITA',
          breakTime: '09:10 - 09:40 WITA',
          dismissalTime: '10:15 WITA',
          pickupReadyTime: '10:05 WITA',
          activityNotes: 'Pengembangan Diri, Mewarnai & Motorik Anak Kelas 1-2. Pulang lebih awal.',
          badgeBg: 'bg-purple-600 text-white',
          borderBg: 'border-purple-400',
        };
      }
      return {
        entryTime: '07:10 WITA',
        breakTime: '09:10 - 09:40 WITA',
        dismissalTime: '11:35 WITA',
        pickupReadyTime: '11:25 WITA',
        activityNotes: 'Pramuka Penggalang/Siaga Wajib & Kegiatan Ekstrakurikuler Kelas 3-6.',
        badgeBg: 'bg-amber-600 text-white',
        borderBg: 'border-amber-400',
      };
    }

    // Senin - Kamis
    if (isEarlyGrade) {
      return {
        entryTime: '07:10 WITA',
        breakTime: '09:10 - 09:40 WITA',
        dismissalTime: '11:00 WITA',
        pickupReadyTime: '10:50 WITA',
        activityNotes: 'Selesai pembelajaran Jam ke-4 untuk siswa Kelas 1 & 2.',
        badgeBg: 'bg-blue-600 text-white',
        borderBg: 'border-blue-400',
      };
    }

    return {
      entryTime: '07:10 WITA',
      breakTime: '09:10 - 09:40 WITA',
      dismissalTime: '12:09 WITA',
      pickupReadyTime: '12:00 WITA',
      activityNotes: 'Selesai pembelajaran Jam ke-6 untuk siswa Kelas 3, 4, 5, dan 6.',
      badgeBg: 'bg-indigo-600 text-white',
      borderBg: 'border-indigo-400',
    };
  };

  const dismissalInfo = getDismissalInfo(selectedClass, selectedDay);

  const handleToggleAlarm = () => {
    const nextState = !alarmActive;
    setAlarmActive(nextState);
    if (nextState) {
      setAlarmToast(`🔔 Pengingat Penjemputan Aktif! Alarm HP akan mengingatkan Anda pukul ${dismissalInfo.pickupReadyTime} (15 Menit Sebelum Pulang).`);
    } else {
      setAlarmToast('🔕 Pengingat Penjemputan Dinonaktifkan.');
    }
    setTimeout(() => setAlarmToast(''), 5000);
  };

  // Update selected student if class changes and current student isn't in class
  const activeStudent =
    classStudents.find((s) => s.id === selectedStudentId) ||
    classStudents[0] ||
    ({
      id: 'custom-id',
      classGroup: selectedClass,
      name: customStudentName || 'Anak Saya',
    } as Student);

  const activeStudentName = customStudentName || activeStudent?.name || 'Siswa SDK St. Teresia';

  // Filter achievements for selected student
  const studentAchievements = achievements.filter(
    (a) => a.classGroup === selectedClass && (a.studentId === activeStudent.id || a.studentName.toLowerCase().includes(activeStudentName.toLowerCase()))
  );

  // Filter progress report for selected student
  const studentReport = progressReports.find(
    (r) => r.classGroup === selectedClass && (r.studentId === activeStudent.id || r.studentName.toLowerCase().includes(activeStudentName.toLowerCase()))
  );

  // Filter homework for selected class
  const classHomework = homeworkList.filter((hw) => hw.classGroup === selectedClass);

  // Cartoon Image helper by grade
  const getCartoonImg = (cls: ClassGroup) => {
    if (cls.startsWith('1') || cls.startsWith('2')) return sdKidsKelas1Img;
    if (cls.startsWith('3') || cls.startsWith('4')) return sdKidsKelas3Img;
    return sdKidsKelas5Img;
  };

  const cartoonImg = getCartoonImg(selectedClass);

  // WhatsApp link for homeroom teacher
  const waMessage = encodeURIComponent(
    `Halo ${homeroomTeacher}, saya Orang Tua / Wali Murid dari ${activeStudentName} (Kelas ${selectedClass}). Ingin berkonsultasi mengenai perkembangan belajar anak di SDK St. Teresia Danga.`
  );
  const waUrl = `https://wa.me/?text=${waMessage}`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header for Parent Portal */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white rounded-3xl p-6 shadow-xl border-4 border-amber-400 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-amber-300 shadow-lg bg-white p-1 shrink-0 relative">
              <img
                src={cartoonImg}
                alt="Kartun Murid"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-blue-950 text-xs p-1 rounded-full font-black">
                👨‍👩‍👧
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-400 text-blue-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase border border-amber-300 shadow-sm">
                  PORTAL WALI MURID & ORANG TUA
                </span>
                <span className="bg-blue-900/80 text-yellow-300 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-blue-700">
                  SDK ST. TERESIA DANGA
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow">
                PERKEMBANGAN & PRESTASI: <span className="text-yellow-300 underline">{activeStudentName}</span>
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100 font-extrabold flex items-center gap-2">
                <span>🏫 Kelas {selectedClass}</span>
                <span>•</span>
                <span>👩‍🏫 Wali Kelas: {homeroomTeacher}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Cetak Roster & Contact WA */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenPrintRoster && (
              <button
                onClick={onOpenPrintRoster}
                className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-3 rounded-2xl border-2 border-purple-300 shadow-lg flex items-center gap-2 uppercase tracking-wide transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>CETAK ROSTER JADWAL</span>
              </button>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white font-black text-xs px-5 py-3 rounded-2xl border-2 border-green-300 shadow-lg flex items-center gap-2 uppercase tracking-wide transition-all scale-105 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>KONSULTASI WALI KELAS (WA)</span>
            </a>
          </div>
        </div>

        {/* Student Selector Bar inside Parent Portal */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-300 uppercase font-black flex items-center gap-1">
              <Users className="w-4 h-4 text-amber-300" />
              1. Pilih Kelas:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => onSelectClass(e.target.value as ClassGroup)}
              className="bg-amber-400 text-blue-950 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-amber-300 focus:outline-none cursor-pointer"
            >
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  KELAS {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 max-w-md">
            <span className="text-amber-300 uppercase font-black flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              2. Pilih Nama Murid:
            </span>
            {classStudents.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setCustomStudentName('');
                }}
                className="bg-white text-blue-950 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-slate-300 focus:outline-none flex-1 min-w-[180px]"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.attendanceNo ? `${s.attendanceNo}. ` : ''}{s.name} {s.nim ? `(${s.nim})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customStudentName}
                onChange={(e) => setCustomStudentName(e.target.value)}
                placeholder="Ketik nama anak Anda..."
                className="bg-white text-blue-950 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-slate-300 focus:outline-none flex-1 min-w-[180px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 0: PERINGATAN JAM PELAJARAN & WAKTU PENJEMPUTAN ANAK */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0">
              <BellRing className="w-7 h-7 text-rose-600 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white text-rose-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
                  JAM SEKOLAH & PENJEMPUTAN
                </span>
                <span className="bg-amber-300 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  KELAS {selectedClass}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white drop-shadow mt-0.5">
                ⏰ PERINGATAN JAM PELAJARAN & WAKTU PENJEMPUTAN
              </h2>
            </div>
          </div>

          {/* Quick Day Switcher */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/20 flex-wrap">
            <span className="text-[11px] font-black text-amber-200 uppercase px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Hari:
            </span>
            {ALL_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                  selectedDay === d
                    ? 'bg-amber-300 text-blue-950 shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Main Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Jam Masuk */}
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border-2 border-white/30 space-y-2 relative">
            <div className="flex items-center justify-between text-amber-200 text-xs font-black uppercase">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-300" />
                1. JAM MASUK
              </span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md">
                Setiap Hari
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {dismissalInfo.entryTime}
            </div>
            <p className="text-xs text-amber-100 font-bold leading-snug">
              📍 Ibadah Pagi, Apel & Literasi. Orang tua disarankan mengantar anak pukul 06:50 - 07:05 WITA.
            </p>
          </div>

          {/* Card 2: Jam Istirahat */}
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border-2 border-white/30 space-y-2 relative">
            <div className="flex items-center justify-between text-amber-200 text-xs font-black uppercase">
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4 text-amber-300" />
                2. JAM ISTIRAHAT
              </span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md">
                30 Menit
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {dismissalInfo.breakTime}
            </div>
            <p className="text-xs text-amber-100 font-bold leading-snug">
              🍱 Waktu makan bekal gizi sehat & istirahat anak di area sekolah dengan pengawasan guru.
            </p>
          </div>

          {/* Card 3: JAM PULANG & PENJEMPUTAN (HIGHLIGHTED) */}
          <div className="bg-amber-300 text-blue-950 p-4 rounded-2xl border-4 border-white space-y-2 relative shadow-lg transform hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between text-blue-950 text-xs font-black uppercase">
              <span className="flex items-center gap-1 text-rose-900 font-black">
                <Car className="w-4.5 h-4.5 text-rose-700 animate-pulse" />
                3. WAKTU PENJEMPUTAN
              </span>
              <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase">
                {selectedDay}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight flex items-baseline gap-2">
              <span>{dismissalInfo.dismissalTime}</span>
            </div>
            <p className="text-xs text-blue-900 font-extrabold leading-snug">
              🚗 <span className="underline">Siap dijemput pukul {dismissalInfo.pickupReadyTime}</span> di Gerbang Depan SDK St. Teresia Danga.
            </p>
          </div>
        </div>

        {/* Pickup Alarm & Toast Toggle Banner */}
        <div className="bg-blue-950/80 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-300" />
                PENGINGAT OTOMATIS PENJEMPUTAN ORANG TUA:
              </span>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {alarmActive ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-bold">
              {dismissalInfo.activityNotes}
            </p>
          </div>

          <button
            onClick={handleToggleAlarm}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 shadow-lg transition-all active:scale-95 shrink-0 ${
              alarmActive
                ? 'bg-amber-400 text-blue-950 border-white hover:bg-amber-300'
                : 'bg-rose-600 text-white border-rose-300 hover:bg-rose-500'
            }`}
          >
            {alarmActive ? <Check className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
            <span>{alarmActive ? '🔔 Alarm Aktif (Diingatkan 15 Min)' : '🔔 Aktifkan Alarm Penjemputan'}</span>
          </button>
        </div>

        {alarmToast && (
          <div className="bg-emerald-900 text-emerald-100 text-xs font-black p-3 rounded-xl border border-emerald-400 animate-fade-in flex items-center gap-2 shadow-inner">
            <Check className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{alarmToast}</span>
          </div>
        )}

        {/* Safety & Pickup Rules Note */}
        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-xs font-bold text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
            <span>
              <strong>Keamanan Penjemputan Anak:</strong> Jika anak dijemput oleh orang lain/ojek, mohon beri tahu Wali Kelas (<strong>{homeroomTeacher}</strong>) via WhatsApp demi keselamatan murid.
            </span>
          </div>
          <span className="bg-amber-400 text-blue-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shrink-0">
            📍 Gerbang Depan Sekolah
          </span>
        </div>
      </div>

      {/* SECTION 1: PRESTASI & PENGHARGAAN MURID */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-amber-400 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center text-blue-950 font-black shadow">
              <Award className="w-6 h-6 text-blue-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300">
                PENGHARGAAN RESMI SEKOLAH
              </span>
              <h2 className="text-lg font-black text-blue-950 dark:text-white uppercase mt-0.5">
                🌟 PRESTASI & BINTANG KEBAANGAAN: {activeStudentName}
              </h2>
            </div>
          </div>

          <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
            {studentAchievements.length} Prestasi Tercatat
          </span>
        </div>

        {studentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAchievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 dark:from-slate-800 dark:to-slate-800/90 p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-500/50 space-y-2 shadow-md relative overflow-hidden group hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 bg-white dark:bg-slate-900 rounded-2xl border border-amber-300 shadow-sm shrink-0">
                      {ach.badgeIcon || '🏆'}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-blue-950 border border-amber-500">
                        {ach.category.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-black text-blue-950 dark:text-amber-300 uppercase leading-tight mt-1">
                        {ach.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700">
                  “{ach.description}”
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-extrabold pt-1">
                  <span>🗓️ {ach.date}</span>
                  <span className="text-blue-900 dark:text-amber-400 font-black">👨‍🏫 {ach.givenBy}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50/70 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-amber-300 text-center space-y-2">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-blue-950 dark:text-amber-300 uppercase">
              Belum Ada Catatan Khusus Untuk {activeStudentName}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold max-w-md mx-auto">
              Bapak/Ibu Guru SDK Santa Theresia Danga akan terus memberikan apresiasi dan motivasi belajar setiap minggu.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: LAPORAN PERKEMBANGAN & NILAI AKADEMIK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Attendance & Conduct Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-blue-500 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-300">
                REKAPITULASI
              </span>
              <h2 className="text-base font-black text-blue-950 dark:text-white uppercase mt-0.5">
                KEHADIRAN & KARAKTER
              </h2>
            </div>
          </div>

          {studentReport ? (
            <div className="space-y-4">
              {/* Attendance Breakdown Grid */}
              <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-black uppercase text-blue-950 dark:text-blue-300 flex items-center gap-1">
                  <UserCheck2 className="w-4 h-4 text-blue-600" />
                  Rekap Kehadiran (Semester Ini):
                </span>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
                  <div className="bg-green-100 text-green-950 p-2 rounded-xl border border-green-300">
                    <span className="text-lg font-black block">{studentReport.attendance.present}</span>
                    <span className="text-[10px] uppercase">Hadir (Hari)</span>
                  </div>
                  <div className="bg-amber-100 text-amber-950 p-2 rounded-xl border border-amber-300">
                    <span className="text-lg font-black block">{studentReport.attendance.sick}</span>
                    <span className="text-[10px] uppercase">Sakit</span>
                  </div>
                  <div className="bg-sky-100 text-sky-950 p-2 rounded-xl border border-sky-300">
                    <span className="text-lg font-black block">{studentReport.attendance.permission}</span>
                    <span className="text-[10px] uppercase">Izin</span>
                  </div>
                  <div className="bg-rose-100 text-rose-950 p-2 rounded-xl border border-rose-300">
                    <span className="text-lg font-black block">{studentReport.attendance.absent}</span>
                    <span className="text-[10px] uppercase">Alpha</span>
                  </div>
                </div>
              </div>

              {/* Conduct & Behavior Grade */}
              <div className="bg-emerald-50 dark:bg-slate-800/90 p-4 rounded-2xl border border-emerald-300 space-y-1">
                <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  NILAI SIKAP & PERILAKU
                </span>
                <p className="text-lg font-black text-emerald-900 dark:text-emerald-300 pt-1">
                  {studentReport.conductGrade}
                </p>
              </div>

              {/* Homeroom Comment */}
              <div className="bg-amber-50 dark:bg-slate-800 p-4 rounded-2xl border border-amber-300 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-400 flex items-center gap-1">
                  👩‍🏫 Catatan Wali Kelas ({homeroomTeacher}):
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  “{studentReport.homeroomNotes}”
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Laporan rekap kehadiran & sikap siswa belum dikirim oleh wali kelas.
              </p>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Subject Grades Visual Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-indigo-500 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-300">
                  ESTIMASI PERKEMBANGAN NILAI
                </span>
                <h2 className="text-lg font-black text-blue-950 dark:text-white uppercase mt-0.5">
                  CAPAIAN MATA PELAJARAN: {activeStudentName}
                </h2>
              </div>
            </div>

            <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-300">
              {studentReport?.academicPeriod || 'TAPEL 2025/2026'}
            </span>
          </div>

          {studentReport && studentReport.subjectGrades ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(SUBJECTS_MAP).map((code) => {
                  const sub = SUBJECTS_MAP[code];
                  const grade = studentReport.subjectGrades[code] || 85;

                  return (
                    <div
                      key={code}
                      className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-blue-950 dark:text-slate-100 truncate pr-2">
                          {sub.fullName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-white font-black text-xs ${
                            grade >= 90
                              ? 'bg-emerald-600'
                              : grade >= 80
                              ? 'bg-blue-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          {grade} / 100
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            grade >= 90
                              ? 'bg-emerald-500'
                              : grade >= 80
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, grade)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/60 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-indigo-300 text-center space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Nilai ulangan harian & formatif sedang diolah oleh guru mata pelajaran.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PEMANTAUAN PR & TUGAS RUMAH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-emerald-500 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                MONITORING BELAJAR DI RUMAH
              </span>
              <h2 className="text-lg font-black text-blue-950 dark:text-white uppercase mt-0.5">
                STATUS PR & TUGAS SEKOLAH (KELAS {selectedClass})
              </h2>
            </div>
          </div>

          <span className="text-xs font-black bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full border border-emerald-300">
            {classHomework.length} PR Aktif
          </span>
        </div>

        {classHomework.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classHomework.map((hw) => {
              const sub = SUBJECTS_MAP[hw.subjectCode];
              const completedByList = hw.completedByStudents || [];
              const isChildDone = completedByList.some(
                (s) => s.studentId === activeStudent.id || s.studentName.toLowerCase().includes(activeStudentName.toLowerCase())
              );

              return (
                <div
                  key={hw.id}
                  className={`p-4 rounded-2xl border-2 space-y-3 transition-all ${
                    isChildDone
                      ? 'bg-green-50 dark:bg-slate-800 border-green-400'
                      : 'bg-amber-50/70 dark:bg-slate-800 border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        sub?.colorBg || 'bg-blue-600 text-white border-blue-700'
                      }`}
                    >
                      {sub?.fullName || hw.subjectCode}
                    </span>

                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 ${
                        isChildDone
                          ? 'bg-green-600 text-white'
                          : 'bg-amber-500 text-blue-950'
                      }`}
                    >
                      {isChildDone ? '✅ SUDAH DIKERJAKAN' : '⏳ BELUM SELESAI'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-blue-950 dark:text-white uppercase">
                      {hw.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      {hw.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>🗓️ Dikumpul: <span className="text-rose-600 font-black">{hw.dueDate}</span></span>
                    <span>👩‍🏫 Guru: {hw.teacherName}</span>
                  </div>

                  {/* Toggle Homework Done for Child */}
                  <button
                    onClick={() =>
                      onToggleStudentHomework(hw.id, activeStudent.id, activeStudentName)
                    }
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 border-2 transition-all ${
                      isChildDone
                        ? 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                        : 'bg-amber-400 text-blue-950 border-amber-500 hover:bg-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isChildDone
                        ? `Sudah Selesai (${activeStudentName})`
                        : `Tandai PR Selesai Untuk ${activeStudentName}`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-1">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Tidak ada PR aktif untuk Kelas {selectedClass} saat ini. Selamat beristirahat!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
