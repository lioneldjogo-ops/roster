import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, X, Sparkles, CheckCircle2 } from 'lucide-react';
import schoolLogo from '../assets/images/school_logo_st_teresia_1784846232480.jpg';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim().toLowerCase();

    if (cleaned === 'st-theresia') {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('PIN yang Anda masukkan salah! Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl border-4 border-amber-400 max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-yellow-300 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full">
                OTENTIKASI KHUSUS SEKOLAH
              </span>
              <h3 className="text-base font-black text-blue-950 dark:text-white uppercase mt-0.5">
                MASUK SISI PIHAK SEKOLAH & GURU
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School Intro Badge */}
        <div className="bg-blue-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-blue-200 dark:border-slate-700 flex items-center gap-3">
          <img
            src={schoolLogo}
            alt="Logo Sekolah"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full border border-amber-400 shrink-0"
          />
          <div className="text-xs">
            <p className="font-black text-blue-950 dark:text-yellow-300 uppercase">SDK St. Teresia Danga</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
              Akses khusus Bapak/Ibu Guru & Staf Pengajar untuk kelola jadwal, PR, kuis & prestasi murid.
            </p>
          </div>
        </div>

        {/* Form Input PIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase flex items-center gap-1">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Masukkan PIN Akses Sekolah:</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan PIN guru..."
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 text-sm font-black tracking-widest px-4 py-3 rounded-2xl outline-none transition-all text-center text-blue-950 dark:text-white"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200 text-center animate-shake">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-amber-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showHint ? 'Sembunyikan Petunjuk PIN' : 'Lupa atau Butuh Petunjuk PIN?'}</span>
            </button>
            <span className="text-slate-400">PIN Default: st-theresia</span>
          </div>

          {showHint && (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300 text-xs font-bold text-amber-950 dark:text-amber-200 space-y-1 animate-fade-in">
              <p className="font-black flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                PIN Resmi Sekolah:
              </p>
              <p className="font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-400 font-black text-center text-sm text-blue-950 dark:text-amber-300">
                st-theresia
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                Gunakan huruf kecil atau besar. PIN ini digunakan Bapak/Ibu Guru SDK Santa Theresia Danga.
              </p>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs py-3 rounded-2xl transition-all uppercase"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-2xl border-2 border-blue-700 shadow-md transition-all uppercase flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Masuk Sisi Guru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
