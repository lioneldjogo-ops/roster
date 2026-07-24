import React, { useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, HomeworkItem, Student } from '../types';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Trash2,
  FileSpreadsheet,
  Check,
  X,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
} from 'lucide-react';

interface HomeworkPanelProps {
  homeworkList: HomeworkItem[];
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  onAddHomework: (hw: Omit<HomeworkItem, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteHomework: (id: string) => void;
  onOpenGoogleSheetsModal: () => void;
  isLoggedInGoogle: boolean;
  userEmail?: string;
  students: Student[];
  onAddStudent: (name: string, classGroup: ClassGroup, nim?: string) => void;
  onSaveClassRoster: (classGroup: ClassGroup, newStudents: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onToggleStudentHomework: (homeworkId: string, studentId: string, studentName: string) => void;
  isTeacher?: boolean;
}

export const HomeworkPanel: React.FC<HomeworkPanelProps> = ({
  homeworkList,
  selectedClass,
  onSelectClass,
  onAddHomework,
  onToggleComplete,
  onDeleteHomework,
  onOpenGoogleSheetsModal,
  isLoggedInGoogle,
  userEmail,
  students,
  onAddStudent,
  onSaveClassRoster,
  onDeleteStudent,
  onToggleStudentHomework,
  isTeacher = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  // Class Teachers State (Homeroom and Subject Teachers)
  const [homeroomTeachers, setHomeroomTeachers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sdk_teresia_homeroom_teachers_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      '1A': 'Ibu Maria S.Pd',
      '1B': 'Ibu Teresia S.Pd',
      '2A': 'Bapak Yohanes S.Pd',
      '2B': 'Ibu Agnes S.Pd',
      '3A': 'Bapak Dominikus S.Pd',
      '3B': 'Ibu Clara S.Pd',
      '4A': 'Bapak Alexander S.Pd',
      '4B': 'Ibu Beatriks S.Pd',
      '5A': 'Bapak Joseph S.Pd',
      '5B': 'Ibu Elisabeth S.Pd',
      '6A': 'Bapak Stefanus S.Pd',
      '6B': 'Ibu Veronika S.Pd',
    };
  });

  const [subjectTeachersMap, setSubjectTeachersMap] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem('sdk_teresia_subject_teachers_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Modal Table State for Class Roster Configuration
  const [modalHomeroomTeacher, setModalHomeroomTeacher] = useState('');
  const [modalSubjectTeachers, setModalSubjectTeachers] = useState<Record<string, string>>({});
  const [desiredStudentCount, setDesiredStudentCount] = useState<number>(10);
  const [draftStudentsTable, setDraftStudentsTable] = useState<Array<{ id: string; attendanceNo: number; nim: string; name: string }>>([]);

  // New Homework Form State
  const [newSubjectCode, setNewSubjectCode] = useState('B.INDONESIA');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTeacher, setNewTeacher] = useState('Ibu Maria S.Pd');

  // Filtered lists
  const filteredHomeworkList = homeworkList.filter((hw) => hw.classGroup === selectedClass);
  const classStudents = students.filter((s) => s.classGroup === selectedClass);
  const currentHomeroomTeacher = homeroomTeachers[selectedClass] || 'Belum Diisi';

  // Open & Initialize Modal Form with Current Class Data
  const handleOpenRosterModal = () => {
    setModalHomeroomTeacher(homeroomTeachers[selectedClass] || '');
    setModalSubjectTeachers(subjectTeachersMap[selectedClass] || {});

    const existing = students.filter((s) => s.classGroup === selectedClass);
    if (existing.length > 0) {
      setDesiredStudentCount(existing.length);
      setDraftStudentsTable(
        existing.map((s, idx) => ({
          id: s.id,
          attendanceNo: s.attendanceNo || idx + 1,
          nim: s.nim || '',
          name: s.name || '',
        }))
      );
    } else {
      // Default generate 10 empty rows
      setDesiredStudentCount(10);
      generateRowsByCount(10, []);
    }

    setIsAddStudentModalOpen(true);
  };

  // Helper to sync or regenerate table rows by count
  const generateRowsByCount = (count: number, currentRows: Array<{ id: string; attendanceNo: number; nim: string; name: string }>) => {
    const targetCount = Math.max(1, count);
    const updated = [...currentRows];

    if (targetCount > updated.length) {
      const diff = targetCount - updated.length;
      for (let i = 0; i < diff; i++) {
        const nextNo = updated.length + 1;
        updated.push({
          id: `draft-${Date.now()}-${nextNo}-${Math.random()}`,
          attendanceNo: nextNo,
          nim: '',
          name: '',
        });
      }
    } else if (targetCount < updated.length) {
      updated.splice(targetCount);
    }

    setDraftStudentsTable(updated);
  };

  const handleStudentCountChange = (newCount: number) => {
    const count = Math.max(1, newCount);
    setDesiredStudentCount(count);
    generateRowsByCount(count, draftStudentsTable);
  };

  const handleDraftStudentChange = (index: number, field: 'nim' | 'name', value: string) => {
    setDraftStudentsTable((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveDraftRow = (index: number) => {
    setDraftStudentsTable((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Recalculate attendance numbers
      const renumbered = next.map((row, idx) => ({ ...row, attendanceNo: idx + 1 }));
      setDesiredStudentCount(renumbered.length);
      return renumbered;
    });
  };

  const handleAddSingleRow = () => {
    setDraftStudentsTable((prev) => {
      const nextNo = prev.length + 1;
      const next = [
        ...prev,
        {
          id: `draft-${Date.now()}-${nextNo}`,
          attendanceNo: nextNo,
          nim: '',
          name: '',
        },
      ];
      setDesiredStudentCount(next.length);
      return next;
    });
  };

  // Save Roster & Class Teachers Form Submit
  const handleSaveRosterForm = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Homeroom Teacher Name
    const updatedHomeroom = {
      ...homeroomTeachers,
      [selectedClass]: modalHomeroomTeacher.trim() || 'Guru Wali Kelas',
    };
    setHomeroomTeachers(updatedHomeroom);
    try {
      localStorage.setItem('sdk_teresia_homeroom_teachers_v1', JSON.stringify(updatedHomeroom));
    } catch (e) {}

    // 2. Save Subject Teachers
    const updatedSubjectTeachers = {
      ...subjectTeachersMap,
      [selectedClass]: modalSubjectTeachers,
    };
    setSubjectTeachersMap(updatedSubjectTeachers);
    try {
      localStorage.setItem('sdk_teresia_subject_teachers_v1', JSON.stringify(updatedSubjectTeachers));
    } catch (e) {}

    // 3. Save Valid Students List (Non-empty names)
    const validStudentsList: Student[] = draftStudentsTable
      .filter((row) => row.name.trim().length > 0)
      .map((row, idx) => ({
        id: row.id.startsWith('draft-') ? `std-${selectedClass.toLowerCase()}-${Date.now()}-${idx + 1}` : row.id,
        classGroup: selectedClass,
        name: row.name.trim(),
        nim: row.nim.trim(),
        attendanceNo: idx + 1,
      }));

    onSaveClassRoster(selectedClass, validStudentsList);
    setIsAddStudentModalOpen(false);
  };

  const handleSubmitNewHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHomework({
      classGroup: selectedClass,
      subjectCode: newSubjectCode,
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate || 'Besok',
      teacherName: newTeacher || modalSubjectTeachers[newSubjectCode] || currentHomeroomTeacher || 'Guru Pengajar',
    });

    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-[32px] p-6 md:p-8 border-4 border-blue-600 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 px-3 py-1 rounded-full border border-yellow-300 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-blue-950" /> INSTRUKSI TUGAS RUMAH (PR MANUAL)
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            INSTRUKSI PR KELAS {selectedClass}
          </h2>
          <p className="text-xs md:text-sm text-blue-200 font-bold leading-relaxed">
            ✏️ **Anak-anak mengerjakan PR secara manual di Buku Tulis / Paket.** Setelah selesai dikerjakan di rumah, murid tinggal **klik nama masing-masing** di bawah untuk menandai tugas sudah selesai.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isTeacher ? (
            <>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <Plus className="w-4 h-4 text-blue-950" />
                <span>TAMBAH PR BARU +</span>
              </button>

              <button
                onClick={handleOpenRosterModal}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-amber-300 shadow-[4px_4px_0px_#78350f] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <UserPlus className="w-4 h-4 text-blue-950" />
                <span>INPUT WALI KELAS, MAPEL & SISWA +</span>
              </button>

              <button
                onClick={onOpenGoogleSheetsModal}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-xs px-5 py-3 rounded-2xl border-2 border-green-300 shadow-[4px_4px_0px_#14532d] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>SINKRON SHEETS</span>
              </button>
            </>
          ) : (
            <div className="bg-yellow-400 text-blue-950 font-black text-xs px-4 py-3 rounded-2xl border-2 border-yellow-300 shadow-md flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-950 shrink-0" />
              <span>Mode Murid & Orang Tua: Kerjakan PR di buku tulis, lalu tandai namamu di bawah setelah selesai!</span>
            </div>
          )}
        </div>
      </div>

      {/* Class Selector & Roster Toggle */}
      <div className="bg-sky-50 dark:bg-slate-800/80 p-4 rounded-3xl border-2 border-blue-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase whitespace-nowrap">
              PILIH KELAS:
            </span>
            {ALL_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => onSelectClass(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  selectedClass === cls
                    ? 'bg-yellow-400 text-blue-950 border-2 border-yellow-300 shadow-[2px_2px_0px_#1e3a8a]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-blue-50'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRoster(!showRoster)}
            className="flex items-center gap-2 text-xs font-black bg-blue-900 text-yellow-300 hover:bg-blue-800 px-4 py-2 rounded-2xl border-2 border-blue-950 shadow-sm"
          >
            <Users className="w-4 h-4 text-yellow-300" />
            <span>DAFTAR MURID KELAS {selectedClass} ({classStudents.length} SISWA)</span>
            {showRoster ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Student Roster Management */}
        {showRoster && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-blue-200 dark:border-slate-700 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div>
                <span className="text-xs font-black text-blue-950 dark:text-yellow-400 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  ROSTER MURID KELAS {selectedClass} ({classStudents.length} SISWA)
                </span>
                <p className="text-[11px] font-bold text-slate-500">
                  👩‍🏫 **Wali Kelas:** <span className="text-blue-900 dark:text-slate-200 font-black">{currentHomeroomTeacher}</span>
                </p>
              </div>

              {isTeacher && (
                <button
                  onClick={handleOpenRosterModal}
                  className="text-xs font-black bg-amber-400 hover:bg-amber-300 text-blue-950 px-3.5 py-1.5 rounded-xl border border-amber-500 uppercase flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> ATUR GURU & TABEL SISWA
                </button>
              )}
            </div>

            {classStudents.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold italic py-2">
                Belum ada nama murid terdaftar untuk Kelas {selectedClass}. Klik "ATUR GURU & TABEL SISWA" di atas untuk membuat tabel input siswa.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {classStudents.map((std, idx) => (
                  <div
                    key={std.id}
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-slate-800 text-blue-950 dark:text-slate-200 font-black text-xs px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 shadow-sm"
                  >
                    <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      {std.attendanceNo || idx + 1}
                    </span>
                    <span>{std.name}</span>
                    {std.nim && (
                      <span className="text-[10px] bg-blue-200 dark:bg-slate-700 text-blue-900 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono">
                        NIM: {std.nim}
                      </span>
                    )}
                    {isTeacher && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus murid ${std.name} dari Kelas ${selectedClass}?`)) {
                            onDeleteStudent(std.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                        title="Hapus Murid"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Homework Cards List */}
      {filteredHomeworkList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-blue-950 dark:text-white uppercase">
            Belum Ada Instruksi PR Untuk Kelas {selectedClass}
          </h3>
          <p className="text-xs text-slate-500 font-bold max-w-md mx-auto">
            Bapak/Ibu Guru dapat menekan tombol **TAMBAH PR BARU +** di atas untuk memberikan instruksi PR buku tulis kepada siswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredHomeworkList.map((hw) => {
            const subject = SUBJECTS_MAP[hw.subjectCode] || {
              fullName: hw.subjectCode,
              colorBg: 'bg-blue-600',
              colorText: 'text-white',
              colorBorder: 'border-blue-700',
            };

            const completedRecords = hw.completedByStudents || [];
            const completedCount = completedRecords.length;
            const totalStudents = classStudents.length;
            const progressPercent = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

            return (
              <div
                key={hw.id}
                className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border-4 border-blue-200 dark:border-slate-800 shadow-xl space-y-6 relative hover:border-blue-300 transition-all"
              >
                {/* Header: Subject Badge & Action Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wide ${subject.colorBg} ${subject.colorText} shadow-sm`}
                    >
                      {subject.fullName}
                    </span>
                    <span className="text-[11px] font-black bg-yellow-400 text-blue-950 px-2.5 py-1 rounded-full uppercase border border-yellow-300">
                      ✏️ PR MANUAL (DI BUKU TULIS)
                    </span>
                  </div>

                  {isTeacher && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Hapus instruksi PR ini?')) {
                            onDeleteHomework(hw.id);
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors"
                        title="Hapus Instruksi PR"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Homework Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-black text-blue-950 dark:text-white leading-tight">
                    {hw.title}
                  </h3>

                  {hw.description && (
                    <div className="bg-sky-50 dark:bg-slate-800/60 p-4 rounded-2xl border-l-4 border-blue-600 text-xs md:text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed whitespace-pre-line">
                      {hw.description}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                      <User className="w-4 h-4 text-blue-600" /> Guru: {hw.teacherName}
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black">
                      <Calendar className="w-4 h-4" /> Tenggat Pengumpulan: {hw.dueDate}
                    </span>
                  </div>
                </div>

                {/* Student Completion Progress Tracker Section */}
                <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-blue-950 dark:text-white uppercase flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        DAFTAR MURID YANG SUDAH MENGERJAKAN (Siswa Tinggal Klik Namanya):
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        Siswa/Orang tua dapat menekan tombol namanya setelah selesai mengerjakan secara manual.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0">
                      <span className="text-xs font-black text-blue-950 dark:text-yellow-400">
                        {completedCount} / {totalStudents} Murid Selesai ({progressPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Student Name Badges Grid */}
                  {classStudents.length === 0 ? (
                    <p className="text-xs text-slate-500 font-bold italic py-2">
                      Belum ada murid di kelas {selectedClass}. Tambahkan murid terlebih dahulu agar murid bisa menandai tugasnya.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                      {classStudents.map((std) => {
                        const isDone = completedRecords.some((r) => r.studentId === std.id);

                        return (
                          <button
                            key={std.id}
                            onClick={() => onToggleStudentHomework(hw.id, std.id, std.name)}
                            className={`p-3 rounded-2xl border-2 text-xs font-black flex items-center justify-between gap-2 transition-all text-left shadow-sm active:scale-95 ${
                              isDone
                                ? 'bg-green-500 text-white border-green-600 shadow-[2px_2px_0px_#14532d]'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                            }`}
                          >
                            <div className="truncate">
                              <div className="truncate font-black">{std.name}</div>
                              <div className="text-[10px] font-bold opacity-80">
                                {isDone ? '✅ Sudah Kerjakan' : '⚪ Belum Centang'}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add New Homework */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-blue-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-black text-blue-950 dark:text-white uppercase flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                TAMBAH INSTRUKSI PR (KELAS {selectedClass})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewHomework} className="space-y-4">
              <div>
                <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Mata Pelajaran:
                </label>
                <select
                  value={newSubjectCode}
                  onChange={(e) => {
                    setNewSubjectCode(e.target.value);
                    const sub = SUBJECTS_MAP[e.target.value];
                    if (sub?.teacherDefault) setNewTeacher(sub.teacherDefault);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
                >
                  {Object.keys(SUBJECTS_MAP).map((code) => (
                    <option key={code} value={code}>
                      {SUBJECTS_MAP[code].fullName} ({code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Judul PR / Instruksi Singkat:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PR Matematika Halaman 25 No 1 - 5"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Rincian Petunjuk Pengerjakan Manual (Di Buku Tulis):
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Buka buku paket Hal. 25. Kerjakan nomor 1 - 5 di buku PR Matematika. Dikumpulkan hari Senin."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                    Tenggat Waktu:
                  </label>
                  <input
                    type="text"
                    placeholder="2025-07-30 atau Senin"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                    Nama Guru:
                  </label>
                  <input
                    type="text"
                    placeholder="Ibu Maria S.Pd"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs font-black text-slate-500 hover:bg-slate-100 px-4 py-2.5 rounded-xl uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-blue-950" /> SIMPAN INSTRUKSI PR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Configure Homeroom Teacher, Subject Teachers & Student Data Table */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-4 border-amber-400 dark:border-amber-700 rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                  SDK ST. TERESIA DANGA - KELAS {selectedClass}
                </span>
                <h3 className="text-xl font-black text-blue-950 dark:text-white uppercase flex items-center gap-2 mt-1">
                  <UserPlus className="w-6 h-6 text-amber-500" />
                  PENGATURAN WALI KELAS, MAPEL & TABEL SISWA
                </h3>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveRosterForm} className="space-y-6">
              {/* SECTION 1: WALI KELAS & GURU MATA PELAJARAN */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-black text-blue-950 dark:text-yellow-400 uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  1. INPUT DATA WALI KELAS & GURU MATA PELAJARAN
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                      Nama Wali Kelas {selectedClass}:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Maria S.Pd"
                      value={modalHomeroomTeacher}
                      onChange={(e) => setModalHomeroomTeacher(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed bg-amber-50 dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700">
                      💡 Data Guru Wali Kelas & Mapel akan otomatis tersimpan dan digunakan saat membagikan instruksi PR serta pengerjaan Kuis.
                    </p>
                  </div>
                </div>

                {/* Subject Teachers Grid / Table */}
                <div>
                  <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase mb-2">
                    Guru Pengajar Mata Pelajaran (Opsional):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {Object.keys(SUBJECTS_MAP).map((code) => (
                      <div key={code} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] font-black text-blue-900 dark:text-slate-300 uppercase block truncate">
                          {SUBJECTS_MAP[code].fullName} ({code})
                        </span>
                        <input
                          type="text"
                          placeholder={`Guru ${code}`}
                          value={modalSubjectTeachers[code] || ''}
                          onChange={(e) =>
                            setModalSubjectTeachers({
                              ...modalSubjectTeachers,
                              [code]: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: TABEL INPUT SISWA SESUAI JUMLAH */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black text-blue-950 dark:text-yellow-400 uppercase flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      2. TABEL DATA MURID & NIM / NISN
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500">
                      Masukkan **Jumlah Siswa**, lalu tabel baris data akan otomatis terbentuk sesuai jumlah tersebut.
                    </p>
                  </div>

                  {/* Student Count Input & Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase">
                      Jumlah Siswa:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={desiredStudentCount}
                      onChange={(e) => handleStudentCountChange(parseInt(e.target.value) || 1)}
                      className="w-20 bg-white dark:bg-slate-900 text-xs font-black py-1.5 px-2.5 rounded-xl border-2 border-amber-400 text-center"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStudentCountChange(10)}
                        className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-2 py-1 rounded-lg uppercase"
                      >
                        10 Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentCountChange(20)}
                        className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-2 py-1 rounded-lg uppercase"
                      >
                        20 Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentCountChange(25)}
                        className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-2 py-1 rounded-lg uppercase"
                      >
                        25 Siswa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Generated Based on Student Count */}
                <div className="border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-blue-900 text-white sticky top-0 z-10 text-[11px] font-black uppercase">
                        <tr>
                          <th className="py-2.5 px-3 w-16 text-center border-r border-blue-800">No. Absen</th>
                          <th className="py-2.5 px-3 w-40 border-r border-blue-800">NIM / NISN / No. Induk</th>
                          <th className="py-2.5 px-3 border-r border-blue-800">Nama Lengkap Murid</th>
                          <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-bold">
                        {draftStudentsTable.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-2 px-3 text-center text-slate-500 font-black border-r border-slate-200 dark:border-slate-800">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                placeholder="Contoh: 20251001"
                                value={row.nim}
                                onChange={(e) => handleDraftStudentChange(idx, 'nim', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-amber-500 outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                placeholder={`Nama Murid No. Absen ${idx + 1}`}
                                value={row.name}
                                onChange={(e) => handleDraftStudentChange(idx, 'name', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-amber-500 outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                title="Hapus Baris Ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500">
                      Total {draftStudentsTable.length} baris tabel ({draftStudentsTable.filter((r) => r.name.trim()).length} terisi)
                    </span>

                    <button
                      type="button"
                      onClick={handleAddSingleRow}
                      className="text-xs font-black bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl uppercase flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> TAMBAH +1 BARIS TABEL
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="text-xs font-black text-slate-500 hover:bg-slate-100 px-5 py-3 rounded-2xl uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs px-6 py-3 rounded-2xl border-2 border-amber-300 shadow-[4px_4px_0px_#78350f] active:translate-y-0.5 uppercase flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-blue-950" /> SIMPAN DATA KELAS & TABEL MURID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
