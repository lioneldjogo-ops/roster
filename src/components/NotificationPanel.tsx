import React, { useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, NotificationSettings, ScheduleItem } from '../types';
import { getNextSchoolDay, getRequiredEquipmentForDay, playNotificationChime, requestNotificationPermission, sendBrowserNotification } from '../utils/notification';
import { Bell, BellRing, BookOpen, CheckCircle2, Circle, Clock, Volume2, VolumeX, Sparkles, AlertTriangle, ShieldCheck, Shirt } from 'lucide-react';

interface NotificationPanelProps {
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  schedules: ScheduleItem[];
  currentDay: DayOfWeek | null;
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  settings,
  onUpdateSettings,
  schedules,
  currentDay,
  selectedClass,
  onSelectClass,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'settings'>('checklist');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const dayIndex = new Date().getDay();
  const nextDay = getNextSchoolDay(dayIndex);
  const targetDayForGear: DayOfWeek = currentDay || nextDay;

  const equipmentForTargetDay = getRequiredEquipmentForDay(
    schedules,
    selectedClass,
    targetDayForGear
  );

  const toggleItemCheck = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendBrowserNotification(
        '🔔 Uji Notifikasi SDK Santa Theresia',
        `Pengingat aktif untuk Kelas ${selectedClass}! Kamu siap mengikuti pelajaran esok hari.`
      );
    } else {
      playNotificationChime();
      alert('Notifikasi browser belum diizinkan, namun suara bel chime pengingat telah berbunyi! 🔔');
    }
  };

  // Calculate total gear count
  const allGearKeys: string[] = [];
  equipmentForTargetDay.forEach((group, gIdx) => {
    group.items.forEach((item, iIdx) => {
      allGearKeys.push(`${gIdx}-${iIdx}`);
    });
  });

  const checkedCount = allGearKeys.filter((k) => checkedItems[k]).length;
  const isAllChecked = allGearKeys.length > 0 && checkedCount === allGearKeys.length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner - Vibrant Theme */}
      <div className="bg-blue-600 text-white rounded-[32px] p-6 border-4 border-blue-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-950 bg-yellow-400 px-3 py-1 rounded-full border border-yellow-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-900" /> FITUR PENGINGAT OTOMATIS
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
              Pusat Notifikasi & Check-list Tas Sekolah
            </h2>
            <p className="text-xs text-blue-100 font-bold max-w-xl">
              Gunakan fitur ini agar siswa tidak lupa membawa buku, Alkitab, alat gambar, atau seragam olahraga PJOK sesuai jadwal esok hari!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-800 p-2 rounded-2xl border-2 border-blue-500 shadow-inner">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === 'checklist'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Check-list Buku ({checkedCount}/{allGearKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === 'settings'
                  ? 'bg-yellow-400 text-blue-950 shadow-[3px_3px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Pengaturan Alarm
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'checklist' ? (
        /* Equipment Checklist Section - Vibrant Theme */
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
                📋 Daftar Barang & Buku {targetDayForGear} (Kelas {selectedClass})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Lakukan centang pada setiap barang saat memasukkan ke dalam tas sekolah anak.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Pilih Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => onSelectClass(e.target.value as ClassGroup)}
                className="bg-yellow-400 text-blue-950 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-yellow-300 shadow-[2px_2px_0px_#1e3a8a]"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* All checked reward toast */}
          {isAllChecked && (
            <div className="bg-green-400 text-green-950 p-5 rounded-[28px] border-4 border-green-500 flex items-center gap-4 shadow-xl animate-bounce">
              <ShieldCheck className="w-10 h-10 text-green-950" />
              <div>
                <h4 className="font-black text-base uppercase">Hebat! Tas Sekolah Sudah Lengkap 🎉</h4>
                <p className="text-xs font-bold text-green-900">
                  Semua perlengkapan dan buku pelajaran untuk hari {targetDayForGear} telah lengkap dimasukkan ke dalam tas.
                </p>
              </div>
            </div>
          )}

          {/* Gear Groups */}
          {equipmentForTargetDay.length === 0 ? (
            <div className="p-8 text-center bg-sky-50 dark:bg-slate-800/40 rounded-[28px] border-2 border-slate-200">
              <p className="text-sm font-bold text-slate-500 italic">
                Tidak ada jadwal pelajaran khusus / Hari Libur Sekolah untuk {targetDayForGear}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {equipmentForTargetDay.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-sky-50/60 dark:bg-slate-800/40 rounded-[28px] p-5 border-2 border-blue-200 dark:border-slate-700 space-y-4 shadow-md"
                >
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-dashed border-blue-200 dark:border-slate-700">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-black text-blue-950 dark:text-white uppercase">
                      Mata Pelajaran: {group.subject}
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {group.items.map((item, iIdx) => {
                      const key = `${gIdx}-${iIdx}`;
                      const isChecked = !!checkedItems[key];

                      return (
                        <button
                          key={iIdx}
                          onClick={() => toggleItemCheck(key)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black transition-all border-2 ${
                            isChecked
                              ? 'bg-green-400 text-green-950 border-green-500 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          <span className={isChecked ? 'line-through opacity-80' : ''}>
                            {item}
                          </span>
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-green-950 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Settings Section - Vibrant Theme */
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border-4 border-blue-100 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
              ⚙️ Pengaturan Pengingat & Notifikasi Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Atur waktu pengingat harian dan alarm bell sebelum pergantian jam pelajaran.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-sm font-black text-blue-950 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-500" />
                  Status Pengingat Web
                </span>
                <p className="text-xs text-slate-500 font-bold">
                  Kirim pemberitahuan pop-up di layar perangkat saat jam kelas dimulai.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, enabled: e.target.checked })
                }
                className="w-6 h-6 accent-blue-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Minutes Before */}
            <div className="p-4 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-black text-blue-950 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Ingatkan Sebelum Masuk Jam Pelajaran:
              </label>
              <select
                value={settings.minutesBefore}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    minutesBefore: Number(e.target.value),
                  })
                }
                className="w-full bg-white dark:bg-slate-900 text-xs font-black py-2 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-600"
              >
                <option value={5}>5 Menit Sebelum Jam Masuk</option>
                <option value={10}>10 Menit Sebelum Jam Masuk</option>
                <option value={15}>15 Menit Sebelum Jam Masuk</option>
              </select>
            </div>

            {/* Daily Morning Alarm */}
            <div className="p-4 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 dark:text-slate-300 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-indigo-600" />
                  Pengingat Pagi Hari "Siapkan Tas"
                </span>
                <input
                  type="checkbox"
                  checked={settings.dailyMorningReminder}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      dailyMorningReminder: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {settings.dailyMorningReminder && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold">Pukul:</span>
                  <input
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        dailyReminderTime: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-slate-900 text-xs font-black py-1.5 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">WITA</span>
                </div>
              )}
            </div>

            {/* Sound Bell */}
            <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-sm font-black text-blue-950 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-green-600" />
                  Suara Bel Sekolah (Chime Bell)
                </span>
                <p className="text-xs text-slate-500 font-bold">
                  Bunyikan nada bel saat notifikasi muncul.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                }
                className="w-6 h-6 accent-blue-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Test Notification Action */}
            <div className="pt-2">
              <button
                onClick={handleTestNotification}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-3.5 px-4 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <BellRing className="w-4 h-4 text-blue-950" />
                UJI NOTIFIKASI & SUARA BEL SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
