import React, { useState } from 'react';
import { HomeworkItem, QuizQuestion, ScheduleItem, Student } from '../types';
import {
  createOfficialSpreadsheet,
  syncScheduleToGoogleSheet,
  syncHomeworkToGoogleSheet,
  syncQuizToGoogleSheet,
  syncStudentsToGoogleSheet,
  loadHomeworkFromGoogleSheet,
  loadQuizFromGoogleSheet,
  loadStudentsFromGoogleSheet,
} from '../lib/googleSheets';
import { googleSignIn, logout } from '../lib/firebase';
import {
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  CloudUpload,
  CloudDownload,
  Lock,
  UserCheck,
  Sparkles,
  Users,
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleItem[];
  homeworkList: HomeworkItem[];
  quizList: QuizQuestion[];
  students: Student[];
  onUpdateHomeworkList: (list: HomeworkItem[]) => void;
  onUpdateQuizList: (list: QuizQuestion[]) => void;
  onUpdateScheduleList: (list: ScheduleItem[]) => void;
  onUpdateStudentList: (list: Student[]) => void;
  userToken: string | null;
  userEmail: string | null;
  onAuthChanged: (token: string | null, email: string | null) => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  schedules,
  homeworkList,
  quizList,
  students,
  onUpdateHomeworkList,
  onUpdateQuizList,
  onUpdateScheduleList,
  onUpdateStudentList,
  userToken,
  userEmail,
  onAuthChanged,
}) => {
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');
  const [activeSheetUrl, setActiveSheetUrl] = useState<string | null>(null);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChanged(res.accessToken, res.user.email);
        setStatusMessage({
          type: 'success',
          text: `Berhasil masuk dengan akun Google: ${res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal masuk dengan akun Google. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    onAuthChanged(null, null);
    setActiveSheetUrl(null);
    setActiveSheetId(null);
    setStatusMessage(null);
  };

  // 1-Click Create Official Spreadsheet
  const handleCreateNewSheet = async () => {
    if (!userToken) return;

    const confirmed = window.confirm(
      'Akan membuat Spreadsheet Google baru di Google Drive Anda bernama "Jadwal & Tugas SDK St. Teresia Danga" dengan tab Jadwal, TugasRumah, GameKuis, dan DaftarSiswa. Lanjutkan?'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const info = await createOfficialSpreadsheet(userToken);
      setActiveSheetId(info.spreadsheetId);
      setActiveSheetUrl(info.spreadsheetUrl);
      setSpreadsheetIdInput(info.spreadsheetId);

      // Upload initial data
      await syncScheduleToGoogleSheet(userToken, info.spreadsheetId, schedules);
      await syncHomeworkToGoogleSheet(userToken, info.spreadsheetId, homeworkList);
      await syncQuizToGoogleSheet(userToken, info.spreadsheetId, quizList);
      await syncStudentsToGoogleSheet(userToken, info.spreadsheetId, students);

      setStatusMessage({
        type: 'success',
        text: `Spreadsheet baru berhasil dibuat dan seluruh data (Jadwal, PR, Kuis, & Daftar Siswa) telah diunggah!`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membuat Google Sheet baru.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Schedule to Current Sheet
  const handleSyncSchedule = async () => {
    const targetId = activeSheetId || spreadsheetIdInput.trim();
    if (!userToken || !targetId) {
      setStatusMessage({ type: 'error', text: 'Silakan pilih atau buat Spreadsheet terlebih dahulu.' });
      return;
    }

    const confirmed = window.confirm(
      `Perbarui data Jadwal Pelajaran (${schedules.length} sesi) di Google Sheet ID "${targetId}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await syncScheduleToGoogleSheet(userToken, targetId, schedules);
      setStatusMessage({ type: 'success', text: `Data Jadwal Pelajaran (${schedules.length} sesi) berhasil disinkronkan ke Google Sheets!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyinkronkan data Jadwal.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Homework to Current Sheet
  const handleSyncHomework = async () => {
    const targetId = activeSheetId || spreadsheetIdInput.trim();
    if (!userToken || !targetId) {
      setStatusMessage({ type: 'error', text: 'Silakan pilih atau buat Spreadsheet terlebih dahulu.' });
      return;
    }

    const confirmed = window.confirm(
      `Perbarui data Tugas Rumah (${homeworkList.length} item) di Google Sheet ID "${targetId}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await syncHomeworkToGoogleSheet(userToken, targetId, homeworkList);
      setStatusMessage({ type: 'success', text: `Data Tugas Rumah (${homeworkList.length} item) berhasil disinkronkan ke Google Sheets!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyinkronkan data Tugas Rumah.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Quiz to Current Sheet
  const handleSyncQuiz = async () => {
    const targetId = activeSheetId || spreadsheetIdInput.trim();
    if (!userToken || !targetId) {
      setStatusMessage({ type: 'error', text: 'Silakan pilih atau buat Spreadsheet terlebih dahulu.' });
      return;
    }

    const confirmed = window.confirm(
      `Perbarui data Soal Game Kuis (${quizList.length} soal) di Google Sheet ID "${targetId}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await syncQuizToGoogleSheet(userToken, targetId, quizList);
      setStatusMessage({ type: 'success', text: `Data Game Kuis (${quizList.length} soal) berhasil disinkronkan ke Google Sheets!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyinkronkan data Game Kuis.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Students to Current Sheet
  const handleSyncStudents = async () => {
    const targetId = activeSheetId || spreadsheetIdInput.trim();
    if (!userToken || !targetId) {
      setStatusMessage({ type: 'error', text: 'Silakan pilih atau buat Spreadsheet terlebih dahulu.' });
      return;
    }

    const confirmed = window.confirm(
      `Perbarui data Daftar Siswa Wali Kelas (${students.length} murid) di Google Sheet ID "${targetId}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await syncStudentsToGoogleSheet(userToken, targetId, students);
      setStatusMessage({ type: 'success', text: `Daftar Siswa (${students.length} murid) berhasil disinkronkan ke Google Sheets!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyinkronkan data Daftar Siswa.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Pull / Load Homework, Quiz & Students from Sheet
  const handlePullFromSheet = async () => {
    const targetId = activeSheetId || spreadsheetIdInput.trim();
    if (!userToken || !targetId) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan Spreadsheet ID yang valid.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const hwData = await loadHomeworkFromGoogleSheet(userToken, targetId);
      const quizData = await loadQuizFromGoogleSheet(userToken, targetId);
      const studentData = await loadStudentsFromGoogleSheet(userToken, targetId);

      if (hwData.length > 0) onUpdateHomeworkList(hwData);
      if (quizData.length > 0) onUpdateQuizList(quizData);
      if (studentData.length > 0) onUpdateStudentList(studentData);

      setStatusMessage({
        type: 'success',
        text: `Berhasil menarik ${hwData.length} PR, ${quizData.length} Kuis, dan ${studentData.length} Data Siswa dari Google Sheets!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal membaca data dari Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-4 border-blue-200 dark:border-slate-800 rounded-[32px] max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-green-950 bg-green-400 px-3 py-0.5 rounded-full border border-green-300">
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-950" /> INTEGRASI GOOGLE SHEETS
            </span>
            <h3 className="text-xl md:text-2xl font-black text-blue-950 dark:text-white uppercase tracking-tight">
              SINKRONISASI JADWAL, PR, & GAME KUIS
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 font-bold bg-blue-50 dark:bg-slate-800 p-2.5 rounded-xl border border-blue-200 dark:border-slate-700">
              💡 <strong>Catatan:</strong> Fitur Google Sheets ini opsional untuk Guru (backup/impor). <strong>Siswa TIDAK PERLU login Google atau mensinkronkan akun</strong> — semua PR & Kuis langsung otomatis bisa dibuka murid di aplikasi tanpa ribet!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Section */}
        {!userToken ? (
          <div className="bg-amber-50 dark:bg-slate-800/80 p-6 rounded-2xl border-2 border-amber-300 space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-400 text-blue-950 rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-blue-950 dark:text-white uppercase">
                MASUK DENGAN AKUN GOOGLE UNTUK MENGAKSES GOOGLE SHEETS
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold max-w-md mx-auto">
                Anda perlu memberikan izin Google Drive / Sheets untuk membuat dan menyinkronkan spreadsheet Tugas Rumah & Game Kuis.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-6 rounded-2xl border-2 border-blue-700 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase mx-auto flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Logged in indicator */}
            <div className="bg-green-50 dark:bg-slate-800 p-3 rounded-2xl border-2 border-green-300 flex items-center justify-between text-xs font-bold text-green-950 dark:text-green-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span>Terhubung: <strong>{userEmail || 'Akun Google'}</strong></span>
              </div>
              <button
                onClick={handleGoogleLogout}
                className="text-[11px] underline text-rose-600 dark:text-rose-400 font-black uppercase"
              >
                Keluar
              </button>
            </div>

            {/* Quick Action: Create New Official Sheet */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 rounded-2xl border-2 border-green-400 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase bg-yellow-400 text-blue-950 px-2.5 py-0.5 rounded-full">
                  DIREKOMENDASIKAN (1-CLICK)
                </span>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <h4 className="text-sm font-black uppercase">Buat Spreadsheet Resmi SDK St. Teresia Baru</h4>
              <p className="text-xs text-green-100 font-bold">
                Membuat otomatis Spreadsheet lengkap dengan tab **Jadwal**, **TugasRumah**, dan **GameKuis** di Google Drive milik Anda.
              </p>

              <button
                disabled={isLoading}
                onClick={handleCreateNewSheet}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-3 px-4 rounded-xl border-2 border-yellow-300 shadow-[3px_3px_0px_#14532d] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-blue-950" />}
                <span>BUAT SPREADSHEET BARU SEKARANG</span>
              </button>

              {activeSheetUrl && (
                <div className="pt-2 text-center">
                  <a
                    href={activeSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-black text-yellow-300 underline flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Google Sheet Yang Baru Dibuat
                  </a>
                </div>
              )}
            </div>

            {/* Spreadsheet ID Input & Actions */}
            <div className="bg-sky-50 dark:bg-slate-800/60 p-4 rounded-2xl border-2 border-blue-200 dark:border-slate-700 space-y-3 text-xs">
              <label className="font-black text-blue-950 dark:text-slate-200 block uppercase">
                Atau Gunakan Spreadsheet ID yang Sudah Ada:
              </label>
              <input
                type="text"
                placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={spreadsheetIdInput}
                onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 font-mono font-bold py-2.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  disabled={isLoading}
                  onClick={handleSyncSchedule}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-3 rounded-xl border border-blue-700 flex items-center justify-center gap-1.5 uppercase"
                >
                  <CloudUpload className="w-4 h-4" /> Sync Jadwal Pelajaran
                </button>

                <button
                  disabled={isLoading}
                  onClick={handleSyncHomework}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-3 rounded-xl border border-blue-700 flex items-center justify-center gap-1.5 uppercase"
                >
                  <CloudUpload className="w-4 h-4" /> Sync Tugas Rumah (PR)
                </button>

                <button
                  disabled={isLoading}
                  onClick={handleSyncQuiz}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 px-3 rounded-xl border border-amber-700 flex items-center justify-center gap-1.5 uppercase"
                >
                  <CloudUpload className="w-4 h-4" /> Sync Game Kuis
                </button>

                <button
                  disabled={isLoading}
                  onClick={handleSyncStudents}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 px-3 rounded-xl border border-indigo-700 flex items-center justify-center gap-1.5 uppercase"
                >
                  <Users className="w-4 h-4" /> Sync Daftar Siswa
                </button>

                <button
                  disabled={isLoading}
                  onClick={handlePullFromSheet}
                  className="col-span-1 sm:col-span-2 bg-green-700 hover:bg-green-800 text-white font-black py-2.5 px-3 rounded-xl border border-green-800 flex items-center justify-center gap-1.5 uppercase"
                >
                  <CloudDownload className="w-4 h-4" /> Tarik Semua Data Dari Sheet (PR, Kuis & Siswa)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-start gap-3 text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-green-100 text-green-900 border-green-400 dark:bg-green-950/80 dark:text-green-200'
                : 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950/80 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-black uppercase">
                {statusMessage.type === 'success' ? 'Berhasil!' : 'Terjadi Kendala:'}
              </p>
              <p>{statusMessage.text}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 px-5 py-2.5 rounded-2xl uppercase"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
