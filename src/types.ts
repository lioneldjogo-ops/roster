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

export interface Student {
  id: string;
  classGroup: ClassGroup;
  name: string;
  nim?: string; // NIM / NISN / No. Induk
  attendanceNo?: number;
}

export interface ClassTeacherInfo {
  classGroup: ClassGroup;
  homeroomTeacher: string; // Nama Wali Kelas
  subjectTeachers: Record<string, string>; // subjectCode -> teacherName
}

export interface HomeworkCompletionRecord {
  studentId: string;
  studentName: string;
  completedAt: string;
}

export interface HomeworkItem {
  id: string;
  classGroup: ClassGroup;
  subjectCode: string;
  title: string;
  description: string;
  dueDate: string; // e.g. "2025-07-25" or "Jumat, 25 Juli 2025"
  teacherName: string;
  completed: boolean;
  createdAt: string;
  completedByStudents?: HomeworkCompletionRecord[];
}

export interface QuizQuestion {
  id: string;
  classGroup: ClassGroup;
  subjectCode: string;
  question: string;
  options: string[]; // 4 multiple choice options
  correctAnswerIndex: number; // 0, 1, 2, 3
  explanation: string;
  teacherName: string;
}

export type UserRole = 'student' | 'parent' | 'teacher';

export type AchievementCategory = 'akademik' | 'non-akademik' | 'karakter' | 'penghargaan';

export interface StudentAchievement {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  title: string;
  category: AchievementCategory;
  date: string;
  givenBy: string;
  description: string;
  badgeIcon?: string; // Emoji e.g. "🏆", "🌟", "🥇", "🎨", "⚽"
}

export interface StudentProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  academicPeriod: string; // e.g. "Semester Ganjil 2025/2026"
  attendance: {
    present: number;
    sick: number;
    permission: number;
    absent: number;
  };
  conductGrade: 'Sangat Baik (A)' | 'Baik (B)' | 'Cukup (C)';
  homeroomNotes: string;
  subjectGrades: Record<string, number>; // subjectCode -> score 0-100
  updatedAt: string;
}

