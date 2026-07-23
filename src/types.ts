export type ClassGroup = 
  | '1A' | '1B' 
  | '2A' | '2B' 
  | '3A' | '3B' 
  | '4A' | '4B' 
  | '5A' | '5B' 
  | '6A' | '6B';

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export type SubjectCategory = 
  | 'B.INDONESIA'
  | 'AGAMA'
  | 'MATEMATIKA'
  | 'IPAS'
  | 'PJOK'
  | 'B.INGGRIS'
  | 'PENDIDIKAN PANCASILA'
  | 'SBDP'
  | 'EK'
  | 'UPACARA BENDERA'
  | 'LITERASI DAN NUMERASI';

export interface SubjectInfo {
  id: string;
  code: string; // e.g. "B.INDONESIA", "MATHM", "AGAMA"
  fullName: string;
  category: SubjectCategory;
  colorBg: string; // Tailwind bg class
  colorText: string; // Tailwind text class
  colorBorder: string; // Tailwind border class
  badgeColor: string; // Hex or style
  iconName: string; // Lucide icon name representation
  requiredGear: string[]; // e.g. ["Buku Tulis", "Pensil & Penghapus"]
  teacherDefault?: string;
}

export interface TimeSlot {
  id: number; // 0 to 7
  label: string; // "Jam ke-1", "Upacara", "Istirahat"
  startTime: string; // "07:10"
  endTime: string; // "08:00"
  isBreak?: boolean;
}

export interface ScheduleItem {
  id: string;
  classGroup: ClassGroup;
  day: DayOfWeek;
  slotId: number; // reference to TimeSlot id
  subjectCode: string; // e.g., "B.INDONESIA", "AGAMA", "MATHM", etc.
  teacherName?: string;
  room?: string;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  minutesBefore: number; // 5, 10, 15 minutes before class
  dailyMorningReminder: boolean;
  dailyReminderTime: string; // e.g., "06:30"
  soundEnabled: boolean;
  selectedClass: ClassGroup;
}

export interface EquipmentChecklistItem {
  id: string;
  subjectCode: string;
  item: string;
  isChecked: boolean;
  day: DayOfWeek;
}
