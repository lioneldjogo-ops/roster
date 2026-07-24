import React, { useState } from 'react';
import { ALL_CLASSES } from '../data/defaultSchedule';
import { ClassGroup, Student } from '../types';
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Search,
  Check,
  Award,
  BookOpen,
  Printer,
  ShieldCheck,
  Phone,
  FileText,
  UserCheck,
  AlertCircle,
  Download
} from 'lucide-react';

interface StudentManagementViewProps {
  students: Student[];
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  onAddStudent: (name: string, classGroup: ClassGroup, nim?: string, parentPhone?: string) => void;
  onDeleteStudent: (studentId: string) => void;
  onSaveClassRoster: (classGroup: ClassGroup, newClassStudents: Student[]) => void;
  onUpdateStudent?: (student: Student) => void;
  onOpenPrintRoster?: () => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  selectedClass,
  onSelectClass,
  onAddStudent,
  onDeleteStudent,
  onSaveClassRoster,
  onUpdateStudent,
  onOpenPrintRoster,
}) => {
  const [filterClass, setFilterClass] = useState<ClassGroup | 'ALL'>(selectedClass);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Single Add Form State
  const [nameInput, setNameInput] = useState('');
  const [nimInput, setNimInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [targetClass, setTargetClass] = useState<ClassGroup>(selectedClass);

  // Batch Add Form State
  const [batchText, setBatchText] = useState('');
  const [batchClass, setBatchClass] = useState<ClassGroup>(selectedClass);

  // Editing State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Notice State
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Filtered Students
  const filteredStudents = students.filter((st) => {
    const matchClass = filterClass === 'ALL' || st.classGroup === filterClass;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      st.name.toLowerCase().includes(q) ||
      (st.nim && st.nim.toLowerCase().includes(q)) ||
      st.classGroup.toLowerCase().includes(q);
    return matchClass && matchQuery;
  });

  // Handle Single Add
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    onAddStudent(nameInput.trim(), targetClass, nimInput.trim() || undefined, phoneInput.trim() || undefined);
    showNotice(`✅ Berhasil menambahkan murid "${nameInput.trim()}" ke Kelas ${targetClass}!`);

    setNameInput('');
    setNimInput('');
    setPhoneInput('');
  };

  // Handle Batch Import
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    const lines = batchText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return;

    const currentClassCount = students.filter((s) => s.classGroup === batchClass).length;

    const newEntries: Student[] = lines.map((line, idx) => {
      // Format support: "Nama Student" or "Nama Student - 012345" or "Nama Student, 081234567"
      const parts = line.split(/[-;,]/);
      const name = parts[0].trim();
      const nim = parts[1] ? parts[1].trim() : undefined;
      const parentPhone = parts[2] ? parts[2].trim() : undefined;

      return {
        id: `std-${batchClass.toLowerCase()}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        classGroup: batchClass,
        name,
        nim,
        parentPhone,
        attendanceNo: currentClassCount + idx + 1,
      };
    });

    const existingInOtherClasses = students.filter((s) => s.classGroup !== batchClass);
    const existingInThisClass = students.filter((s) => s.classGroup === batchClass);
    const updatedThisClass = [...existingInThisClass, ...newEntries];

    onSaveClassRoster(batchClass, updatedThisClass);
    showNotice(`🎉 Berhasil mengimpor ${newEntries.length} murid baru ke Kelas ${batchClass}!`);

    setBatchText('');
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.name.trim()) return;

    if (onUpdateStudent) {
      onUpdateStudent(editingStudent);
      showNotice(`✏️ Data murid "${editingStudent.name}" berhasil diperbarui!`);
    } else {
      // Fallback update via Class Roster
      const classStds = students.filter((s) => s.classGroup === editingStudent.classGroup);
      const updated = classStds.map((s) => (s.id === editingStudent.id ? editingStudent : s));
      onSaveClassRoster(editingStudent.classGroup, updated);
      showNotice(`✏️ Data murid "${editingStudent.name}" berhasil diperbarui!`);
    }

    setEditingStudent(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0">
              <Users className="w-8 h-8 text-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  SISTEM DATA MURID TERPADU
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Terhubung Ke Semua Menu
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
                📋 KELOLA & DATA MURID KELAS (1A - 6B)
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 font-medium">
                SDK St. Teresia Danga — Tambah dan kelola data murid di sini agar otomatis terhubung ke Portal Orang Tua, Tugas Rumah (PR), Kuis Game, dan Laporan Hasil Belajar Guru.
              </p>
            </div>
          </div>

          {onOpenPrintRoster && (
            <button
              onClick={onOpenPrintRoster}
              className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-white shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 transition-all flex items-center gap-2 uppercase shrink-0"
            >
              <Printer className="w-5 h-5 text-blue-950" />
              <span>CETAK ROSTER TABEL KELAS</span>
            </button>
          )}
        </div>

        {/* Sync Info Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-amber-100">
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-yellow-300 shrink-0" />
            <span><strong>Tugas Rumah (PR):</strong> Siswa dapat menandai tugas yang telah diselesaikan.</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-300 shrink-0" />
            <span><strong>Portal Orang Tua:</strong> Wali murid bisa memilih nama anak & memantau laporan.</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-rose-300 shrink-0" />
            <span><strong>Laporan Guru:</strong> Guru menginput nilai & prestasi langsung ke nama murid.</span>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div
          className={`p-4 rounded-2xl font-black text-xs border-2 shadow-lg flex items-center gap-3 animate-fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
              : 'bg-rose-100 text-rose-950 border-rose-400'
          }`}
        >
          <Check className="w-5 h-5 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Forms Section: Single Add & Batch Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Tambah 1 Murid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-blue-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black shadow shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-yellow-400">
                FORM OPSI A
              </span>
              <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">
                ➕ TAMBAH MURID BARU (SATUAN)
              </h3>
            </div>
          </div>

          <form onSubmit={handleSingleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Contoh: Maria Yosefina Bako"
                className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Kelas Target <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value as ClassGroup)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-black p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                >
                  {ALL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  NISN / No. Induk (Opsional):
                </label>
                <input
                  type="text"
                  value={nimInput}
                  onChange={(e) => setNimInput(e.target.value)}
                  placeholder="Contoh: 0123456789"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                No. Telp / WA Orang Tua (Opsional):
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-4 rounded-xl border-2 border-blue-500 uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-yellow-300" />
              <span>SIMPAN DATA MURID KE KELAS {targetClass}</span>
            </button>
          </form>
        </div>

        {/* Form 2: Batch Import Murid Sekaligus */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-amber-300 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 bg-amber-400 text-blue-950 rounded-xl flex items-center justify-center font-black shadow shrink-0">
              <Users className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                FORM OPSI B (CEPAT)
              </span>
              <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">
                📥 INPUT BANYAK NAMA MURID SEKALIGUS
              </h3>
            </div>
          </div>

          <form onSubmit={handleBatchSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Kelas Target Batch:
              </label>
              <select
                value={batchClass}
                onChange={(e) => setBatchClass(e.target.value as ClassGroup)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-black p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Tempel / Ketik Daftar Nama (Satu Nama Per Baris):
              </label>
              <textarea
                rows={4}
                required
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`Format:\nAntonius Laba\nBernadeta Nona - 00123\nClara Sarni - 00124 - 0812345678`}
                className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-mono p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                💡 Anda bisa menyalin langsung dari Excel / Word.
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-blue-950 font-black text-xs py-3 px-4 rounded-xl border-2 border-amber-400 uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-blue-950" />
              <span>IMPOR SEMUA SEKALIGUS KE KELAS {batchClass}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-4 border-blue-500 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-black text-blue-950 dark:text-white uppercase flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>EDIT DATA MURID</span>
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    Kelas:
                  </label>
                  <select
                    value={editingStudent.classGroup}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classGroup: e.target.value as ClassGroup })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-black p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    NISN / No. Induk:
                  </label>
                  <input
                    type="text"
                    value={editingStudent.nim || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nim: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  No. Telp / WA Orang Tua:
                </label>
                <input
                  type="text"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-3 rounded-xl uppercase shadow"
                >
                  SIMPAN PERUBAHAN
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs py-3 px-4 rounded-xl uppercase"
                >
                  BATAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster & Students Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-slate-200 dark:border-slate-800 space-y-5">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase text-blue-950 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" />
              Tampilkan Kelas:
            </span>
            <select
              value={filterClass}
              onChange={(e) => {
                const val = e.target.value as ClassGroup | 'ALL';
                setFilterClass(val);
                if (val !== 'ALL') onSelectClass(val);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-white font-black text-xs p-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 outline-none"
            >
              <option value="ALL">🌟 SEMUA KELAS (1A - 6B)</option>
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama murid / NISN..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white text-xs font-bold pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>
        </div>

        {/* Counter Stats */}
        <div className="flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-400">
          <span>
            Menampilkan <strong className="text-blue-600 dark:text-yellow-400">{filteredStudents.length}</strong> murid
            {filterClass !== 'ALL' ? ` di Kelas ${filterClass}` : ' terdaftar'}
          </span>
          <span className="bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-yellow-400 text-[10px] px-3 py-1 rounded-full uppercase">
            Total Seluruh Sekolah: {students.length} Murid
          </span>
        </div>

        {/* Students Table or Grid */}
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-slate-200 text-xs font-black uppercase border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama Lengkap Murid</th>
                  <th className="p-3 w-28 text-center">Kelas</th>
                  <th className="p-3 w-36">NISN / No. Induk</th>
                  <th className="p-3 w-36">Kontak Ortu (WA)</th>
                  <th className="p-3 w-36 text-center">Status Akses</th>
                  <th className="p-3 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-bold">
                {filteredStudents.map((st, idx) => (
                  <tr
                    key={st.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all text-slate-800 dark:text-slate-200"
                  >
                    <td className="p-3 text-center text-slate-400 font-black">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-slate-800 text-blue-900 dark:text-yellow-400 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-blue-950 dark:text-white text-sm">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            ID: {st.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black px-2.5 py-1 rounded-lg text-xs border border-amber-300">
                        Kelas {st.classGroup}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                      {st.nim || '-'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {st.parentPhone ? (
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <Phone className="w-3.5 h-3.5" />
                          {st.parentPhone}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-300 inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Terhubung
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingStudent(st)}
                          className="p-1.5 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-yellow-400 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit Data Murid"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus murid "${st.name}" dari Kelas ${st.classGroup}?`)) {
                              onDeleteStudent(st.id);
                              showNotice(`🗑️ Murid "${st.name}" telah dihapus.`);
                            }
                          }}
                          className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-200 transition-all"
                          title="Hapus Murid"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-8 text-center space-y-4 border-2 border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow">
              📋
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">
                Belum Ada Data Murid Terdaftar
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                {filterClass !== 'ALL'
                  ? `Tidak ada nama murid di Kelas ${filterClass}. Tambahkan nama murid di form Opsi A atau Opsi B di atas!`
                  : 'Daftar murid masih kosong. Silakan masukkan nama murid sekolah Anda melalui form di atas.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
