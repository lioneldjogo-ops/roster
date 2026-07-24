import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  KeyRound,
  ShieldCheck,
  X,
  Users,
  Smartphone,
  Laptop,
  Tablet,
  Clock,
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  GraduationCap,
  Heart,
  School,
  Trash2,
  Sparkles,
  Database,
  Info,
} from 'lucide-react';
import {
  AnalyticsSummary,
  VisitLog,
  subscribeAnalytics,
  recordVisit,
  clearLocalAnalyticsLogs,
  computeSummaryFromLogs,
} from '../lib/analytics';

interface DeveloperAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: 'student' | 'parent' | 'teacher';
  currentTab: string;
  currentClass: string;
}

const DEVELOPER_PIN = 'dvv.cacing';
const LOCAL_DEV_AUTH_KEY = 'sdk_teresia_dev_auth_dvv';

export const DeveloperAnalyticsModal: React.FC<DeveloperAnalyticsModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentTab,
  currentClass,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_DEV_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalVisits: 0,
    todayVisits: 0,
    uniqueSessions: 0,
    lastVisitTime: '-',
    roleBreakdown: { student: 0, parent: 0, teacher: 0 },
    classBreakdown: {},
    deviceBreakdown: { Mobile: 0, Tablet: 0, Desktop: 0 },
    recentLogs: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'logs' | 'breakdown'>('overview');

  // Subscribe to analytics when modal opens and unlocked
  useEffect(() => {
    if (isOpen && isUnlocked) {
      const unsubscribe = subscribeAnalytics((data) => {
        setSummary(data);
      });
      return () => unsubscribe();
    }
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toLowerCase();
    if (cleanPin === DEVELOPER_PIN) {
      setPinError('');
      setIsUnlocked(true);
      try {
        localStorage.setItem(LOCAL_DEV_AUTH_KEY, 'true');
      } catch {}
    } else {
      setPinError(`PIN Developer '${pinInput}' salah! Gunakan PIN khusus developer.`);
    }
  };

  const handleLockDevMode = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(LOCAL_DEV_AUTH_KEY);
    } catch {}
    setPinInput('');
  };

  const handleSimulateVisit = async () => {
    setIsSimulating(true);
    await recordVisit(currentRole, currentTab, currentClass);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  const handleClearLogs = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan riwayat log kunjungan lokal?')) {
      clearLocalAnalyticsLogs();
      setSummary(computeSummaryFromLogs([]));
    }
  };

  // Filtered Logs
  const filteredLogs = summary.recentLogs.filter((log) => {
    const matchesSearch =
      log.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.formattedTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.selectedClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activeTab.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || log.role === filterRole;
    const matchesDevice = filterDevice === 'all' || log.deviceType === filterDevice;

    return matchesSearch && matchesRole && matchesDevice;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-slate-100 rounded-[32px] border-4 border-indigo-500/80 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Top Glow Background Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  DEVELOPER ANALYTICS & VISITOR MONITORING
                </span>
                {isUnlocked && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    PIN dvv.cacing
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase mt-0.5 tracking-tight flex items-center gap-2">
                PANEL ANALISTIK KUNJUNGAN APLIKASI
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={handleLockDevMode}
                className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
                title="Kunci Akses Developer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Kunci PIN
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* STEP 1: PIN UNLOCKING FORM IF NOT UNLOCKED */}
          {!isUnlocked ? (
            <div className="max-w-md mx-auto py-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-slate-800 border-2 border-indigo-500/50 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase">Akses Khusus Developer</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Masukkan <span className="text-amber-300 font-extrabold font-mono">PIN Developer</span> untuk memantau data kunjungan, statistik lalu lintas, dan aktivitas pengguna secara real-time.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError('');
                      }}
                      placeholder="Masukkan PIN Developer..."
                      autoFocus
                      className="w-full bg-slate-800/90 border-2 border-indigo-500/40 focus:border-indigo-400 text-white font-mono font-bold tracking-widest text-center py-3.5 px-4 rounded-2xl text-base outline-none transition-all shadow-inner placeholder:text-slate-500"
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs font-bold text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800 animate-shake">
                      ⚠️ {pinError}
                    </p>
                  )}
                </div>

                <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-3 text-left space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-300">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Petunjuk PIN Developer:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-bold leading-normal">
                    Gunakan PIN <code className="bg-indigo-900/80 px-2 py-0.5 rounded text-amber-300 font-mono font-black">dvv.cacing</code> untuk membuka dashboard analisis lalu lintas aplikasi.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs py-3 rounded-2xl uppercase transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs py-3 rounded-2xl uppercase shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <KeyRound className="w-4 h-4" /> Buka Dashboard
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: UNLOCKED DEVELOPER DASHBOARD CONTENT */
            <div className="space-y-6">
              
              {/* Top Sub-Navigation & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('overview')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeSubTab === 'overview'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-indigo-300" /> Ringkasan Statistik
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('breakdown')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeSubTab === 'breakdown'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-purple-300" /> Analisis Peran & Perangkat
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('logs')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeSubTab === 'logs'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-4 h-4 text-emerald-300" /> Log Kunjungan ({summary.recentLogs.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateVisit}
                    disabled={isSimulating}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>Catat Kunjungan Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 p-2 rounded-xl text-xs font-extrabold transition-all"
                    title="Kosongkan Log"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              </div>

              {/* OVERVIEW SUB-TAB */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Visits */}
                    <div className="bg-gradient-to-br from-indigo-900/60 to-slate-800 p-4 rounded-2xl border border-indigo-500/30 space-y-1">
                      <div className="flex items-center justify-between text-indigo-300">
                        <span className="text-[10px] font-black uppercase tracking-wider">TOTAL KUNJUNGAN</span>
                        <Activity className="w-4 h-4 text-indigo-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-white">{summary.totalVisits}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Halaman yang diakses</p>
                    </div>

                    {/* Card 2: Today Visits */}
                    <div className="bg-gradient-to-br from-emerald-900/60 to-slate-800 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between text-emerald-300">
                        <span className="text-[10px] font-black uppercase tracking-wider">KUNJUNGAN HARI INI</span>
                        <Clock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-300">{summary.todayVisits}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Akses per {new Date().toLocaleDateString('id-ID')}</p>
                    </div>

                    {/* Card 3: Unique Sessions */}
                    <div className="bg-gradient-to-br from-purple-900/60 to-slate-800 p-4 rounded-2xl border border-purple-500/30 space-y-1">
                      <div className="flex items-center justify-between text-purple-300">
                        <span className="text-[10px] font-black uppercase tracking-wider">SESI PENGGUNA UNIK</span>
                        <Users className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-purple-300">{summary.uniqueSessions}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Sesi browser berbeda</p>
                    </div>

                    {/* Card 4: Last Active */}
                    <div className="bg-gradient-to-br from-amber-900/60 to-slate-800 p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-amber-300">
                        <span className="text-[10px] font-black uppercase tracking-wider">AKSES TERAKHIR</span>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-black text-amber-200 truncate mt-2">{summary.lastVisitTime}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Real-time sync Firestore</p>
                    </div>
                  </div>

                  {/* Summary Visual Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Distribution */}
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                      <h4 className="text-xs font-black text-indigo-300 uppercase flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-400" /> Distribusi Akses Berdasarkan Sisi
                      </h4>
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-amber-300 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> Sisi Murid
                            </span>
                            <span className="text-slate-300">{summary.roleBreakdown.student || 0} kunjungan</span>
                          </div>
                          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  summary.totalVisits > 0
                                    ? ((summary.roleBreakdown.student || 0) / summary.totalVisits) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-emerald-300 flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" /> Sisi Orang Tua
                            </span>
                            <span className="text-slate-300">{summary.roleBreakdown.parent || 0} kunjungan</span>
                          </div>
                          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  summary.totalVisits > 0
                                    ? ((summary.roleBreakdown.parent || 0) / summary.totalVisits) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-indigo-300 flex items-center gap-1">
                              <School className="w-3.5 h-3.5" /> Sisi Sekolah / Guru
                            </span>
                            <span className="text-slate-300">{summary.roleBreakdown.teacher || 0} kunjungan</span>
                          </div>
                          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  summary.totalVisits > 0
                                    ? ((summary.roleBreakdown.teacher || 0) / summary.totalVisits) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Device Distribution */}
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                      <h4 className="text-xs font-black text-purple-300 uppercase flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-purple-400" /> Perangkat Pengakses
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-1">
                          <Smartphone className="w-5 h-5 text-emerald-400 mx-auto" />
                          <p className="text-[10px] font-black text-slate-400 uppercase">HP / Mobile</p>
                          <p className="text-base font-black text-white">{summary.deviceBreakdown.Mobile || 0}</p>
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-1">
                          <Tablet className="w-5 h-5 text-amber-400 mx-auto" />
                          <p className="text-[10px] font-black text-slate-400 uppercase">Tablet</p>
                          <p className="text-base font-black text-white">{summary.deviceBreakdown.Tablet || 0}</p>
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-1">
                          <Laptop className="w-5 h-5 text-indigo-400 mx-auto" />
                          <p className="text-[10px] font-black text-slate-400 uppercase">Desktop / PC</p>
                          <p className="text-base font-black text-white">{summary.deviceBreakdown.Desktop || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BREAKDOWN SUB-TAB */}
              {activeSubTab === 'breakdown' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    ANALISIS FREKUENSI AKSES KELAS & FITUR
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class breakdown */}
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <h5 className="text-xs font-black text-yellow-300 uppercase">Kunjungan Berdasarkan Kelas</h5>
                      {Object.keys(summary.classBreakdown).length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center italic">Belum ada data kelas yang dicatat.</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(summary.classBreakdown).map(([cls, count]) => (
                            <div key={cls} className="flex items-center justify-between text-xs font-bold bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                              <span className="text-slate-200">Kelas {cls}</span>
                              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                                {count} Kunjungan
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Developer Metadata */}
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <h5 className="text-xs font-black text-indigo-300 uppercase">Status Integrasi Developer</h5>
                      <div className="space-y-2 text-xs text-slate-300 font-medium">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60">
                          <span>Developer PIN Verified:</span>
                          <span className="font-mono text-amber-300 font-black">dvv.cacing</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60">
                          <span>Database Persistence:</span>
                          <span className="text-emerald-400 font-black">Firebase Firestore + Local Cache</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60">
                          <span>Auto-Tracking Mode:</span>
                          <span className="text-indigo-300 font-black">Aktif saat Pindah Tab & Peran</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LOGS SUB-TAB */}
              {activeSubTab === 'logs' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari berdasarkan Sesi, Kelas, Waktu, atau Fitur..."
                        className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 px-3 py-2.5 rounded-xl outline-none"
                      >
                        <option value="all">Semua Sisi</option>
                        <option value="student">Murid</option>
                        <option value="parent">Orang Tua</option>
                        <option value="teacher">Guru</option>
                      </select>

                      <select
                        value={filterDevice}
                        onChange={(e) => setFilterDevice(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 px-3 py-2.5 rounded-xl outline-none"
                      >
                        <option value="all">Semua Perangkat</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Desktop">Desktop</option>
                      </select>
                    </div>
                  </div>

                  {/* Log Table */}
                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 font-black uppercase text-[10px] border-b border-slate-700">
                          <th className="py-3 px-3">Waktu</th>
                          <th className="py-3 px-3">Sesi ID</th>
                          <th className="py-3 px-3">Sisi</th>
                          <th className="py-3 px-3">Halaman</th>
                          <th className="py-3 px-3">Kelas</th>
                          <th className="py-3 px-3">Perangkat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 text-slate-200 font-bold">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                              Belum ada data log yang sesuai filter pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map((log, index) => (
                            <tr key={log.id || index} className="hover:bg-slate-700/40 transition-colors">
                              <td className="py-2.5 px-3 text-amber-300 font-mono text-[11px] whitespace-nowrap">
                                {log.formattedTime}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                                {log.sessionId}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    log.role === 'teacher'
                                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                      : log.role === 'parent'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {log.role === 'teacher' ? 'Guru' : log.role === 'parent' ? 'Orang Tua' : 'Murid'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 uppercase text-[11px] font-black">
                                {log.activeTab}
                              </td>
                              <td className="py-2.5 px-3 text-yellow-300 font-black">
                                {log.selectedClass}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                                {log.deviceType === 'Mobile' ? '📱 Mobile' : log.deviceType === 'Tablet' ? '📑 Tablet' : '💻 Desktop'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Developer Tracking Active (PIN: <code className="text-amber-300 font-mono">dvv.cacing</code>)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-black px-4 py-2 rounded-xl border border-slate-700 transition-all uppercase text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
