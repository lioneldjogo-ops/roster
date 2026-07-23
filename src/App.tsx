/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { generateDefaultSchedule, SUBJECTS_MAP } from './data/defaultSchedule';
import { ClassGroup, DayOfWeek, NotificationSettings, ScheduleItem } from './types';
import { getCurrentTimeSlot, getDayOfWeekString, playNotificationChime, sendBrowserNotification } from './utils/notification';
import { Header } from './components/Header';
import { ClassScheduleView } from './components/ClassScheduleView';
import { FullMatrixView } from './components/FullMatrixView';
import { NotificationPanel } from './components/NotificationPanel';
import { ManageSchedulePanel } from './components/ManageSchedulePanel';
import { EditScheduleModal } from './components/EditScheduleModal';
import { BellRing, Heart, Sparkles, School } from 'lucide-react';

const LOCAL_STORAGE_KEY_SCHEDULES = 'sdk_teresia_schedules_v1';
const LOCAL_STORAGE_KEY_CLASS = 'sdk_teresia_selected_class';
const LOCAL_STORAGE_KEY_NOTIF = 'sdk_teresia_notif_settings';

export default function App() {
  // 1. Schedules state
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SCHEDULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Error loading saved schedules:', err);
    }
    return generateDefaultSchedule();
  });

  // 2. Selected Class Group
  const [selectedClass, setSelectedClass] = useState<ClassGroup>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLASS);
      if (saved) return saved as ClassGroup;
    } catch (err) {}
    return '1A';
  });

  // 3. Active View Tab
  const [activeTab, setActiveTab] = useState<'class' | 'matrix' | 'reminders' | 'manage'>('class');

  // 4. Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIF);
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return {
      enabled: false,
      minutesBefore: 10,
      dailyMorningReminder: true,
      dailyReminderTime: '06:30',
      soundEnabled: true,
      selectedClass: '1A',
    };
  });

  // 5. Time & Day State
  const [currentDay, setCurrentDay] = useState<DayOfWeek | null>(() =>
    getDayOfWeekString(new Date().getDay())
  );
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  // Active period status
  const [activePeriod, setActivePeriod] = useState<ReturnType<typeof getCurrentTimeSlot>>(null);
  const [lastNotifiedSlotId, setLastNotifiedSlotId] = useState<number | null>(null);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [modalDefaultClass, setModalDefaultClass] = useState<ClassGroup>('1A');
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>('Senin');

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    } catch (e) {}
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLASS, selectedClass);
    } catch (e) {}
  }, [selectedClass]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_NOTIF,
        JSON.stringify({ ...notificationSettings, selectedClass })
      );
    } catch (e) {}
  }, [notificationSettings, selectedClass]);

  // Clock ticker and class period reminder listener
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDay(getDayOfWeekString(now.getDay()));
      setCurrentTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

      // Check current active period
      const slotData = getCurrentTimeSlot();
      setActivePeriod(slotData);

      // Trigger reminder if active period changes and notifications enabled
      if (
        notificationSettings.enabled &&
        slotData &&
        slotData.status === 'active' &&
        slotData.slot.id !== lastNotifiedSlotId
      ) {
        const todayDayStr = getDayOfWeekString(now.getDay());
        if (todayDayStr) {
          const currentClassItem = schedules.find(
            (s) =>
              s.classGroup === selectedClass &&
              s.day === todayDayStr &&
              s.slotId === slotData.slot.id
          );

          if (currentClassItem && currentClassItem.subjectCode !== 'ISTIRAHAT') {
            const sub = SUBJECTS_MAP[currentClassItem.subjectCode];
            const title = `🔔 Pelajaran Sekarang: ${sub?.fullName || currentClassItem.subjectCode}`;
            const body = `Kelas ${selectedClass} • Jam ${slotData.slot.startTime} - ${slotData.slot.endTime}. Pengajar: ${
              currentClassItem.teacherName || sub?.teacherDefault || 'Guru'
            }`;

            sendBrowserNotification(title, body);
            if (notificationSettings.soundEnabled) {
              playNotificationChime();
            }
            setLastNotifiedSlotId(slotData.slot.id);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [schedules, selectedClass, notificationSettings, lastNotifiedSlotId]);

  // Handlers
  const handleSaveScheduleItem = (newItem: ScheduleItem) => {
    setSchedules((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === newItem.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newItem;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const handleDeleteScheduleItem = (itemId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== itemId));
  };

  const handleResetDefault = () => {
    const defaultData = generateDefaultSchedule();
    setSchedules(defaultData);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SCHEDULES);
  };

  const handleOpenAddNew = (cls: ClassGroup = selectedClass, day: DayOfWeek = currentDay || 'Senin') => {
    setEditingItem(null);
    setModalDefaultClass(cls);
    setModalDefaultDay(day);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Find active subject name for banner
  const activeSubjectCode =
    currentDay && activePeriod?.slot
      ? schedules.find(
          (s) =>
            s.classGroup === selectedClass &&
            s.day === currentDay &&
            s.slotId === activePeriod.slot.id
        )?.subjectCode
      : undefined;

  const activeSubjectInfo = activeSubjectCode ? SUBJECTS_MAP[activeSubjectCode] : null;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-yellow-400 selection:text-blue-900">
      <div>
        {/* Top Header & Sticky Nav */}
        <Header
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentDay={currentDay}
          currentTimeStr={currentTimeStr}
          activePeriodName={activePeriod?.slot ? activePeriod.slot.label : undefined}
          activeSubjectName={activeSubjectInfo?.fullName || activeSubjectCode}
          notificationsEnabled={notificationSettings.enabled}
          onRequestNotificationPermission={() =>
            setNotificationSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
          }
          onResetDefaultSchedule={handleResetDefault}
        />

        {/* Active Class Ticker Bar - Vibrant Theme */}
        {currentDay && activePeriod && activePeriod.status === 'active' && (
          <div className="bg-yellow-400 text-blue-950 border-b-4 border-yellow-500 py-2 px-4 shadow-md font-black text-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-900 animate-bounce" />
                <span className="tracking-tight">
                  SEDANG BERLANGSUNG (Kelas {selectedClass}):{' '}
                  <span className="bg-blue-900 text-yellow-300 px-2 py-0.5 rounded-full uppercase text-[11px] font-black">
                    {activeSubjectInfo?.fullName || activeSubjectCode || 'ISTIRAHAT'}
                  </span>{' '}
                  ({activePeriod.slot.startTime} - {activePeriod.slot.endTime})
                </span>
              </div>
              <span className="hidden md:inline bg-blue-900 text-yellow-300 text-[11px] px-3 py-1 rounded-full font-black border-2 border-blue-800">
                ⏳ Sisa Waktu: {activePeriod.minutesLeft} Menit
              </span>
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'class' && (
            <ClassScheduleView
              selectedClass={selectedClass}
              schedules={schedules}
              currentDay={currentDay}
              onEditItem={handleOpenEdit}
              onDeleteItem={handleDeleteScheduleItem}
              onAddNewItem={(c, d) => handleOpenAddNew(c, d)}
            />
          )}

          {activeTab === 'matrix' && (
            <FullMatrixView
              schedules={schedules}
              currentDay={currentDay}
              onSelectClass={setSelectedClass}
              onEditItem={handleOpenEdit}
            />
          )}

          {activeTab === 'reminders' && (
            <NotificationPanel
              settings={notificationSettings}
              onUpdateSettings={setNotificationSettings}
              schedules={schedules}
              currentDay={currentDay}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
            />
          )}

          {activeTab === 'manage' && (
            <ManageSchedulePanel
              onOpenAddNew={() => handleOpenAddNew(selectedClass, currentDay || 'Senin')}
              onResetDefault={handleResetDefault}
              schedules={schedules}
              onImportSchedules={(imp) => setSchedules(imp)}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
            />
          )}
        </main>
      </div>

      {/* Interactive Edit Modal */}
      <EditScheduleModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveScheduleItem}
        onDelete={handleDeleteScheduleItem}
        defaultClassGroup={modalDefaultClass}
        defaultDay={modalDefaultDay}
      />

      {/* Footer - Vibrant Theme */}
      <footer className="bg-yellow-400 border-t-4 border-yellow-500 py-4 px-6 text-blue-900 font-black shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md">
              ST
            </div>
            <div>
              <span className="uppercase font-black text-blue-950 tracking-tight">
                SD KATOLIK SANTA THERESIA DANGA - MBAY
              </span>
              <p className="text-[11px] text-blue-800 font-bold">Jadwal Pelajaran & Notifikasi Harian</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-900 text-yellow-300 px-4 py-2 rounded-full border-2 border-blue-950 text-xs font-black shadow-[2px_2px_0px_#1e3a8a]">
            <span>Yayasan Amkur Flores (YAMKURES)</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400 inline ml-1 animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
