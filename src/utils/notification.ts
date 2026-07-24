import { ClassGroup, DayOfWeek, NotificationSettings, ScheduleItem } from '../types';
import { SUBJECTS_MAP, TIME_SLOTS } from '../data/defaultSchedule';

// Play a pleasant chime bell using Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play two gentle warm bell tones
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.8);
    });
  } catch (err) {
    console.error("Audio chime error:", err);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    alert('Browser kamu tidak mendukung notifikasi web.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = (title: string, body: string, iconUrl?: string) => {
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: iconUrl || '/favicon.ico',
      badge: iconUrl,
      silent: false,
    });
  }
};

// Map JS day index (0=Sun, 1=Mon, ..., 6=Sat) to DayOfWeek
export const getDayOfWeekString = (dayIdx: number): DayOfWeek | null => {
  switch (dayIdx) {
    case 1: return 'Senin';
    case 2: return 'Selasa';
    case 3: return 'Rabu';
    case 4: return 'Kamis';
    case 5: return 'Jumat';
    case 6: return 'Sabtu';
    default: return null; // Sunday
  }
};

export const getNextSchoolDay = (currentDayIdx: number): DayOfWeek => {
  if (currentDayIdx === 0) return 'Senin'; // Sunday -> Monday
  if (currentDayIdx === 6) return 'Senin'; // Saturday -> Monday
  if (currentDayIdx === 5) return 'Sabtu'; // Friday -> Saturday
  const nextIdx = (currentDayIdx + 1) % 7;
  return getDayOfWeekString(nextIdx) || 'Senin';
};

// Find current active time slot based on current time string "HH:MM"
export const getCurrentTimeSlot = () => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of TIME_SLOTS) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (currentMinutes >= startTotal && currentMinutes < endTotal) {
      return { slot, status: 'active', minutesLeft: endTotal - currentMinutes };
    }
    if (currentMinutes < startTotal) {
      return { slot, status: 'upcoming', minutesUntil: startTotal - currentMinutes };
    }
  }

  return null;
};

// Extract unique equipment needed for a specific day and class
export const getRequiredEquipmentForDay = (
  schedules: ScheduleItem[],
  classGroup: ClassGroup,
  day: DayOfWeek
): { subject: string; items: string[] }[] => {
  const daySchedules = schedules.filter(
    (s) => s.classGroup === classGroup && s.day === day && s.subjectCode !== 'ISTIRAHAT'
  );

  const resultMap = new Map<string, string[]>();

  daySchedules.forEach((item) => {
    const info = SUBJECTS_MAP[item.subjectCode];
    if (info && info.requiredGear && info.requiredGear.length > 0) {
      if (!resultMap.has(info.fullName)) {
        resultMap.set(info.fullName, info.requiredGear);
      }
    }
  });

  return Array.from(resultMap.entries()).map(([subject, items]) => ({
    subject,
    items,
  }));
};
