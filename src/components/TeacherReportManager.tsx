import React, { useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { AchievementCategory, ClassGroup, Student, StudentAchievement, StudentProgressReport } from '../types';
import {
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  UserPlus,
  ShieldCheck,
  Star,
  Edit3
} from 'lucide-react';

interface TeacherReportManagerProps {
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  students: Student[];
  achievements: StudentAchievement[];
  progressReports: StudentProgressReport[];
  onAddAchievement: (ach: Omit<StudentAchievement, 'id'>) => void;
  onDeleteAchievement: (id: string) => void;
  onSaveProgressReport: (rep: StudentProgressReport) => void;
}

export const TeacherReportManager: React.FC<TeacherReportManagerProps> = ({
  selectedClass,
  onSelectClass,
  students,
  achievements,
  progressReports,
  onAddAchievement,
  onDeleteAchievement,
  onSaveProgressReport,
}) => {
  const classStudents = students.filter((s) => s.classGroup === selectedClass);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || ''
  );

  const selectedStudent =
    classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];

  // Active student achievement form state
  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState<AchievementCategory>('akademik');
  const [achBadgeIcon, setAchBadgeIcon] = useState('🏆');
  const [achDescription, setAchDescription] = useState('');
  const [achDate, setAchDate] = useState('23 Juli 2025');
  const [achGivenBy, setAchGivenBy] = useState(`Wali Kelas ${selectedClass}`);

  // Progress report state for selected student
  const existingReport = progressReports.find(
    (r) => r.classGroup === selectedClass && selectedStudent && r.studentId === selectedStudent.id
  );

  const [present, setPresent] = useState(existingReport?.attendance.present || 24);
  const [sick, setSick] = useState(existingReport?.attendance.sick || 0);
  const [permission, setPermission] = useState(existingReport?.attendance.permission || 0);
  const [absent, setAbsent] = useState(existingReport?.attendance.absent || 0);
  const [conductGrade, setConductGrade] = useState<'Sangat Baik (A)' | 'Baik (B)' | 'Cukup (C)'>(
    existingReport?.conductGrade || 'Sangat Baik (A)'
  );
  const [homeroomNotes, setHomeroomNotes] = useState(
    existingReport?.homeroomNotes ||
      'Siswa aktif, rajin berdiskusi di kelas, serta memiliki sikap sopan santun yang sangat baik.'
  );

  const [subjectGrades, setSubjectGrades] = useState<Record<string, number>>(
    existingReport?.subjectGrades || {
      'B.INDONESIA': 90,
      MATHM: 88,
      AGAMA: 95,
      PANCASILA: 92,
      PJOK: 86,
      SBDP: 90,
      ENG: 88,
    }
  );

  const [successNotice, setSuccessNotice] = useState('');

  // Update form inputs when selected student changes
  React.useEffect(() => {
    if (selectedStudent) {
      const rep = progressReports.find(
        (r) => r.classGroup === selectedClass && r.studentId === selectedStudent.id
      );

      if (rep) {
        setPresent(rep.attendance.present);
        setSick(rep.attendance.sick);
        setPermission(rep.attendance.permission);
        setAbsent(rep.attendance.absent);
        setConductGrade(rep.conductGrade);
        setHomeroomNotes(rep.homeroomNotes);
        setSubjectGrades(rep.subjectGrades || {});
      } else {
        setPresent(24);
        setSick(0);
        setPermission(0);
        setAbsent(0);
        setConductGrade('Sangat Baik (A)');
        setHomeroomNotes('Menunjukkan kemajuan belajar yang konsisten dan karakter positif.');
      }
    }
  }, [selectedStudentId, selectedClass, progressReports]);

  const handleAddAchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !achTitle.trim()) return;

    onAddAchievement({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      classGroup: selectedClass,
      title: achTitle,
      category: achCategory,
      badgeIcon: achBadgeIcon,
      description: achDescription || 'Memberikan dedikasi dan prestasi luar biasa di kelas.',
      date: achDate,
      givenBy: achGivenBy,
    });

    setAchTitle('');
    setAchDescription('');
    setSuccessNotice('🎉 Prestasi murid berhasil ditambahkan!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const handleSaveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updatedReport: StudentProgressReport = {
      id: existingReport?.id || `rep-${selectedStudent.id}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      classGroup: selectedClass,
      academicPeriod: 'Semester Ganjil 2025/2026',
      attendance: { present, sick, permission, absent },
      conductGrade,
      homeroomNotes,
      subjectGrades,
      updatedAt: new Date().toISOString(),
    };

    onSaveProgressReport(updatedReport);
    setSuccessNotice('✅ Laporan perkembangan murid berhasil disimpan!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const studentAchievements = achievements.filter(
    (a) => a.classGroup === selectedClass && selectedStudent && a.studentId === selectedStudent.id
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-amber-400 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-blue-950 font-black shadow-md">
            <Award className="w-7 h-7 text-blue-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full shadow-sm">
              MODE GURU & PIHAK SEKOLAH
            </span>
            <h2 className="text-xl font-black text-blue-950 dark:text-white uppercase mt-0.5">
              INPUT PRESTASI & LAPORAN PERKEMBANGAN MURID
            </h2>
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase">Pilih Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value as ClassGroup)}
            className="bg-amber-400 text-blue-950 text-xs font-black py-2 px-3 rounded-xl border-2 border-amber-500 outline-none cursor-pointer"
          >
            {ALL_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                KELAS {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successNotice && (
        <div className="bg-green-100 text-green-950 font-black text-xs p-3 rounded-2xl border-2 border-green-400 text-center animate-bounce">
          {successNotice}
        </div>
      )}

      {/* Select Student Selector Bar */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-2">
        <label className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-500" />
          <span>Pilih Murid Kelas {selectedClass} Untuk Diisi Laporannya:</span>
        </label>

        {classStudents.length > 0 ? (
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-blue-950 dark:text-white font-black text-sm p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 outline-none"
          >
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.attendanceNo ? `${s.attendanceNo}. ` : ''}{s.name} {s.nim ? `(NISN: ${s.nim})` : ''}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs font-bold text-amber-600">
            Belum ada murid terdaftar di Kelas {selectedClass}. Anda bisa menambahkan daftar murid di menu Tugas Rumah (PR).
          </p>
        )}
      </div>

      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Input Prestasi Baru */}
          <div className="bg-amber-50/60 dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-500/40 space-y-4">
            <h3 className="text-sm font-black text-blue-950 dark:text-amber-300 uppercase flex items-center gap-1.5 border-b border-amber-200 dark:border-slate-700 pb-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>1. Tambah Prestasi / Bintang Kebanggaan ({selectedStudent.name})</span>
            </h3>

            <form onSubmit={handleAddAchSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Penghargaan / Prestasi:
                </label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="Misal: Juara 1 Lomba Mewarnai, Bintang Kerapihan"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori:
                  </label>
                  <select
                    value={achCategory}
                    onChange={(e) => setAchCategory(e.target.value as AchievementCategory)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold p-2.5 rounded-xl outline-none"
                  >
                    <option value="akademik">Akademik</option>
                    <option value="karakter">Karakter / Perilaku</option>
                    <option value="non-akademik">Non-Akademik / Seni & Olahraga</option>
                    <option value="penghargaan">Penghargaan Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    Ikon Medali:
                  </label>
                  <select
                    value={achBadgeIcon}
                    onChange={(e) => setAchBadgeIcon(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold p-2.5 rounded-xl outline-none"
                  >
                    <option value="🏆">🏆 Piala Juara</option>
                    <option value="🌟">🌟 Bintang Kebanggaan</option>
                    <option value="🥇">🥇 Medali Emas</option>
                    <option value="🎨">🎨 Seni & Kreativitas</option>
                    <option value="⚽">⚽ Olahraga</option>
                    <option value="📜">📜 Sertifikat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Apresiasi Guru:
                </label>
                <textarea
                  rows={2}
                  value={achDescription}
                  onChange={(e) => setAchDescription(e.target.value)}
                  placeholder="Penjelasan singkat kebanggaan atas usaha siswa..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold p-2.5 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs py-2.5 rounded-xl border border-amber-500 uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                Simpan Prestasi Murid
              </button>
            </form>

            {/* List Existing Achievements */}
            <div className="pt-3 border-t border-amber-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase block">
                Daftar Prestasi {selectedStudent.name}:
              </span>

              {studentAchievements.length > 0 ? (
                studentAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-300 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{ach.badgeIcon || '🏆'}</span>
                      <span className="font-bold text-blue-950 dark:text-white truncate">
                        {ach.title}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteAchievement(ach.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-500 italic">Belum ada prestasi tercatat.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Edit Laporan Perkembangan & Nilai */}
          <div className="bg-blue-50/60 dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-blue-300 dark:border-blue-500/40 space-y-4">
            <h3 className="text-sm font-black text-blue-950 dark:text-blue-300 uppercase flex items-center gap-1.5 border-b border-blue-200 dark:border-slate-700 pb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>2. Laporan Kehadiran & Nilai ({selectedStudent.name})</span>
            </h3>

            <form onSubmit={handleSaveReportSubmit} className="space-y-3">
              {/* Attendance Inputs */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Jumlah Kehadiran (Semester Ini):
                </label>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-green-700 block">Hadir</span>
                    <input
                      type="number"
                      value={present}
                      onChange={(e) => setPresent(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 p-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 block">Sakit</span>
                    <input
                      type="number"
                      value={sick}
                      onChange={(e) => setSick(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 p-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 block">Izin</span>
                    <input
                      type="number"
                      value={permission}
                      onChange={(e) => setPermission(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 p-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 block">Alpha</span>
                    <input
                      type="number"
                      value={absent}
                      onChange={(e) => setAbsent(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 p-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Conduct grade */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Nilai Perilaku & Sikap:
                </label>
                <select
                  value={conductGrade}
                  onChange={(e) =>
                    setConductGrade(e.target.value as 'Sangat Baik (A)' | 'Baik (B)' | 'Cukup (C)')
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 text-xs font-bold p-2 rounded-xl outline-none"
                >
                  <option value="Sangat Baik (A)">Sangat Baik (A)</option>
                  <option value="Baik (B)">Baik (B)</option>
                  <option value="Cukup (C)">Cukup (C)</option>
                </select>
              </div>

              {/* Homeroom Notes */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Wali Kelas Untuk Orang Tua:
                </label>
                <textarea
                  rows={2}
                  value={homeroomNotes}
                  onChange={(e) => setHomeroomNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 text-xs font-bold p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Subject Grades Grid */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Estimasi Nilai Per Mapel (0-100):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.keys(SUBJECTS_MAP).map((code) => {
                    const sub = SUBJECTS_MAP[code];
                    const val = subjectGrades[code] || 85;

                    return (
                      <div key={code} className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-300">
                        <span className="text-[11px] font-bold text-blue-950 dark:text-slate-200 truncate pr-1">
                          {code}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) =>
                            setSubjectGrades({ ...subjectGrades, [code]: Number(e.target.value) })
                          }
                          className="w-14 bg-slate-100 dark:bg-slate-800 text-center font-black rounded p-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl border border-blue-700 uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                Simpan Laporan Perkembangan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
