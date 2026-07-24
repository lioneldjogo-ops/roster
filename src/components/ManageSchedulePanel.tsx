import React, { useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, ScheduleItem } from '../types';
import { Plus, Printer, FileSpreadsheet, BookOpen, Link as LinkIcon, Table } from 'lucide-react';
import { GoogleSheetImporterModal } from './GoogleSheetImporterModal';
import { PrintRosterModal } from './PrintRosterModal';

interface ManageSchedulePanelProps {
  onOpenAddNew: () => void;
  onResetDefault: () => void;
  schedules: ScheduleItem[];
  onImportSchedules: (imported: ScheduleItem[], replaceExisting?: boolean) => void;
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
}

export const ManageSchedulePanel: React.FC<ManageSchedulePanelProps> = ({
  onOpenAddNew,
  onResetDefault,
  schedules,
  onImportSchedules,
  selectedClass,
  onSelectClass,
}) => {
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title - Vibrant Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-4 border-blue-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
            📊 Sinkronisasi Google Sheets & Cetak Roster
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
            Gunakan Google Sheets untuk menyinkronkan jadwal, atau cetak tabel roster resmi kelas SDK St. Teresia Danga.
          </p>
        </div>

        <button
          onClick={onOpenAddNew}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
        >
          <Plus className="w-4 h-4 text-blue-950" />
          <span>TAMBAH PELAJARAN +</span>
        </button>
      </div>

      {/* Grid Action Cards - Simplified to Google Sheets, Cetak Roster & Input Manual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Google Sheets - Featured */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-[32px] p-6 border-4 border-green-400 shadow-xl space-y-4 hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white text-green-700 font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#14532d]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 px-2.5 py-1 rounded-full border border-yellow-300 shadow-sm">
              UTAMA
            </span>
          </div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Impor dari Google Sheets</h3>
          <p className="text-xs text-green-100 font-bold">
            Impor jadwal dari Spreadsheet Google Anda. Cukup masukkan ID Spreadsheet lalu klik tarik data.
          </p>
          <button
            onClick={() => setIsGoogleSheetModalOpen(true)}
            className="w-full text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black py-3 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#14532d] active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-4 h-4 text-blue-950" />
            <span>TENTUKAN & IMPOR SHEET</span>
          </button>
        </div>

        {/* Card 2: Print Roster in Formal Table Format */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-purple-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#6b21a8] border-2 border-purple-400">
            <Table className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Cetak Roster (Tabel Resmi)</h3>
          <p className="text-xs text-slate-500 font-bold">
            Tampilkan dan cetak roster jadwal pelajaran kelas dalam format tabel rapi lengkap dengan tanda tangan wali kelas & kepala sekolah.
          </p>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="w-full text-xs bg-purple-500 hover:bg-purple-400 text-white font-black py-3 rounded-2xl border-2 border-purple-400 shadow-[3px_3px_0px_#6b21a8] active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>LIHAT & CETAK TABEL ROSTER</span>
          </button>
        </div>

        {/* Card 3: Add custom subject manually */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-blue-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#1e3a8a] border-2 border-blue-400">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Input Pelajaran Manual</h3>
          <p className="text-xs text-slate-500 font-bold">
            Tambahkan atau ubah jam pelajaran baru ke kelas tertentu secara manual jika diperlukan.
          </p>
          <button
            onClick={onOpenAddNew}
            className="w-full text-xs bg-amber-400 hover:bg-amber-300 text-blue-950 font-black py-3 rounded-2xl border-2 border-amber-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            BUKA FORM INPUT +
          </button>
        </div>
      </div>

      {/* Subject Reference Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
              <BookOpen className="w-5 h-5 text-blue-600" /> Daftar Mata Pelajaran Kurikulum
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Rincian mata pelajaran resmi kurikulum SDK Santa Theresia Danga beserta daftar perlengkapan siswa.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Aplikasi akan mereset ke Jadwal Standar TAPEL 2025/2026. Lanjutkan?')) {
                onResetDefault();
              }
            }}
            className="text-[11px] font-black text-rose-600 hover:text-rose-700 underline uppercase"
          >
            Reset ke Jadwal Standar Asli
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(SUBJECTS_MAP).map((sub) => (
            <div
              key={sub.code}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-sm ${sub.colorBg} ${sub.colorBorder}`}
            >
              <div className="text-xs font-black font-mono px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200">
                {sub.code}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className={`font-black ${sub.colorText}`}>{sub.fullName}</h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                  Guru Default: {sub.teacherDefault}
                </p>
                <div className="text-[11px] text-slate-600 font-bold">
                  Buku/Bawaan: {sub.requiredGear.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheet Importer Modal */}
      <GoogleSheetImporterModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        onImportSchedules={(importedItems, replaceExisting = true) => {
          if (replaceExisting) {
            onImportSchedules(importedItems);
          } else {
            // Merge with existing
            const map = new Map<string, ScheduleItem>();
            schedules.forEach((s) => map.set(`${s.classGroup}-${s.day}-${s.slotId}`, s));
            importedItems.forEach((s) => map.set(`${s.classGroup}-${s.day}-${s.slotId}`, s));
            onImportSchedules(Array.from(map.values()));
          }
        }}
        currentScheduleCount={schedules.length}
      />

      {/* Print Roster Modal (Formal Table Layout) */}
      <PrintRosterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        schedules={schedules}
        selectedClass={selectedClass}
        onSelectClass={onSelectClass}
      />
    </div>
  );
};
