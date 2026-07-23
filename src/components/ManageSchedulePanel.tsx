import React, { useRef, useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, ScheduleItem } from '../types';
import { Plus, Download, Upload, RefreshCw, Printer, Sparkles, FileSpreadsheet, ShieldAlert, BookOpen, Link as LinkIcon } from 'lucide-react';
import { GoogleSheetImporterModal } from './GoogleSheetImporterModal';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Jadwal_SDK_St_Teresia_${selectedClass}_TAPEL_2025_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportSchedules(parsed);
          alert('Berhasil mengimpor data jadwal pelajaran baru!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title - Vibrant Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-4 border-blue-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
            🛠️ Tombol Aksi & Kelola Data Jadwal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
            Fasilitas untuk menambah jam pelajaran, melakukan ekspor/impor file data, serta memuat ulang jadwal standar SDK St. Teresia Danga.
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

      {/* Grid Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card Google Sheets - Featured */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-[32px] p-6 border-4 border-green-400 shadow-xl space-y-4 hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white text-green-700 font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#14532d]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 px-2.5 py-1 rounded-full border border-yellow-300 shadow-sm">
              MANUAL / DITENTUKAN
            </span>
          </div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Impor dari Google Sheets</h3>
          <p className="text-xs text-green-100 font-bold">
            Impor jadwal dari Google Sheets saat ditentukan pengguna. Tidak sinkron background otomatis, perubahan hanya dilakukan saat Anda klik impor.
          </p>
          <button
            onClick={() => setIsGoogleSheetModalOpen(true)}
            className="w-full text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black py-2.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#14532d] active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-4 h-4 text-blue-950" />
            <span>TENTUKAN & IMPOR SHEET</span>
          </button>
        </div>

        {/* Card 1: Add custom subject */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-blue-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#1e3a8a] border-2 border-blue-400">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Input Pelajaran Baru</h3>
          <p className="text-xs text-slate-500 font-bold">
            Tambahkan sesi pelajaran baru ke kelas tertentu, pilih jam ke-, dan tuliskan nama guru pengajar.
          </p>
          <button
            onClick={onOpenAddNew}
            className="w-full text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black py-2.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            BUKA FORM INPUT +
          </button>
        </div>

        {/* Card 2: Export JSON */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-amber-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#b45309] border-2 border-amber-400">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Ekspor Data (Backup)</h3>
          <p className="text-xs text-slate-500 font-bold">
            Simpan data jadwal pelajaran saat ini ke dalam file JSON di komputer atau HP kamu.
          </p>
          <button
            onClick={handleExportJSON}
            className="w-full text-xs bg-amber-400 hover:bg-amber-300 text-amber-950 font-black py-2.5 rounded-2xl border-2 border-amber-300 shadow-[3px_3px_0px_#b45309] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            UNDUH FILE JSON
          </button>
        </div>

        {/* Card 3: Import JSON */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-green-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-green-500 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#15803d] border-2 border-green-400">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Impor Data Jadwal</h3>
          <p className="text-xs text-slate-500 font-bold">
            Muat file data jadwal yang sebelumnya telah kamu unduh atau bagikan dengan wali kelas.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs bg-green-400 hover:bg-green-300 text-green-950 font-black py-2.5 rounded-2xl border-2 border-green-300 shadow-[3px_3px_0px_#15803d] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            PILIH FILE JSON
          </button>
        </div>

        {/* Card 4: Reset TAPEL 2025/2026 */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-rose-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#be123c] border-2 border-rose-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Reset Jadwal Resmi</h3>
          <p className="text-xs text-slate-500 font-bold">
            Kembalikan susunan jadwal ke dokumen asli SDK St. Teresia Danga - Mbay (12 Kelas).
          </p>
          <button
            onClick={() => {
              if (confirm('Aplikasi akan mereset ke Jadwal Standar TAPEL 2025/2026. Lanjutkan?')) {
                onResetDefault();
              }
            }}
            className="w-full text-xs bg-rose-500 hover:bg-rose-400 text-white font-black py-2.5 rounded-2xl border-2 border-rose-400 shadow-[3px_3px_0px_#be123c] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            MUAT JADWAL ASLI
          </button>
        </div>

        {/* Card 5: Print */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-b-8 border-r-8 border-purple-500 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#6b21a8] border-2 border-purple-400">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-blue-950 dark:text-white uppercase">Cetak Jadwal Pelajaran</h3>
          <p className="text-xs text-slate-500 font-bold">
            Cetak tampilan jadwal bersih untuk ditempelkan di meja belajar atau dinding kamar anak.
          </p>
          <button
            onClick={() => window.print()}
            className="w-full text-xs bg-purple-500 hover:bg-purple-400 text-white font-black py-2.5 rounded-2xl border-2 border-purple-400 shadow-[3px_3px_0px_#6b21a8] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            MULAI CETAK (PRINT)
          </button>
        </div>
      </div>

      {/* Subject Reference Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
          <BookOpen className="w-5 h-5 text-blue-600" /> Daftar Mata Pelajaran & Pengajar Default
        </h3>
        <p className="text-xs text-slate-500 font-bold">
          Rincian mata pelajaran resmi kurikulum SDK Santa Theresia Danga beserta daftar perlengkapan siswa.
        </p>

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
    </div>
  );
};
