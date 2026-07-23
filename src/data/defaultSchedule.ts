import { ClassGroup, DayOfWeek, ScheduleItem, SubjectInfo, TimeSlot } from '../types';

export const ALL_CLASSES: ClassGroup[] = [
  '1A', '1B', '2A', '2B', '3A', '3B', 
  '4A', '4B', '5A', '5B', '6A', '6B'
];

export const ALL_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 0, label: 'Kegiatan Awal', startTime: '07:10', endTime: '08:00' },
  { id: 1, label: 'Jam ke-1', startTime: '08:00', endTime: '08:35' },
  { id: 2, label: 'Jam ke-2', startTime: '08:35', endTime: '09:10' },
  { id: 3, label: 'ISTIRAHAT', startTime: '09:10', endTime: '09:40', isBreak: true },
  { id: 4, label: 'Jam ke-3', startTime: '09:40', endTime: '10:15' },
  { id: 5, label: 'Jam ke-4', startTime: '10:25', endTime: '11:00' },
  { id: 6, label: 'Jam ke-5', startTime: '11:00', endTime: '11:35' },
  { id: 7, label: 'Jam ke-6', startTime: '11:35', endTime: '12:09' },
];

export const SUBJECTS_MAP: Record<string, SubjectInfo> = {
  'B.INDONESIA': {
    id: 'b_indo',
    code: 'B.INDONESIA',
    fullName: 'Bahasa Indonesia',
    category: 'B.INDONESIA',
    colorBg: 'bg-pink-100 dark:bg-pink-950/40',
    colorText: 'text-pink-800 dark:text-pink-200',
    colorBorder: 'border-pink-300 dark:border-pink-700',
    badgeColor: '#f472b6',
    iconName: 'BookOpen',
    requiredGear: ['Buku Paket Bahasa Indonesia', 'Buku Tulis Catatan', 'Pensil & Penghapus'],
    teacherDefault: 'Ibu Maria S.Pd'
  },
  'AGAMA': {
    id: 'agama',
    code: 'AGAMA',
    fullName: 'Pendidikan Agama Katolik & Budi Pekerti',
    category: 'AGAMA',
    colorBg: 'bg-rose-100 dark:bg-rose-950/40',
    colorText: 'text-rose-800 dark:text-rose-200',
    colorBorder: 'border-rose-300 dark:border-rose-700',
    badgeColor: '#ef4444',
    iconName: 'HeartHandshake',
    requiredGear: ['Alkitab Anak / Kitab Suci', 'Buku Agama', 'Buku Doa'],
    teacherDefault: 'Ibu Teresia S.Ag'
  },
  'MATHM': {
    id: 'mathm',
    code: 'MATHM',
    fullName: 'Matematika',
    category: 'MATEMATIKA',
    colorBg: 'bg-amber-100 dark:bg-amber-950/40',
    colorText: 'text-amber-800 dark:text-amber-200',
    colorBorder: 'border-amber-300 dark:border-amber-700',
    badgeColor: '#f59e0b',
    iconName: 'Calculator',
    requiredGear: ['Buku Tulis Petak / Kotak', 'Penggaris', 'Pensil & Penghapus'],
    teacherDefault: 'Pak Yoseph S.Pd'
  },
  'IPAS': {
    id: 'ipas',
    code: 'IPAS',
    fullName: 'IPAS (IPA & IPS)',
    category: 'IPAS',
    colorBg: 'bg-orange-100 dark:bg-orange-950/40',
    colorText: 'text-orange-800 dark:text-orange-200',
    colorBorder: 'border-orange-300 dark:border-orange-700',
    badgeColor: '#f97316',
    iconName: 'FlaskConical',
    requiredGear: ['Buku Paket IPAS', 'Buku Tulis Catatan', 'Pensil Warna / Crayon'],
    teacherDefault: 'Ibu Yustina S.Pd'
  },
  'PJOK': {
    id: 'pjok',
    code: 'PJOK',
    fullName: 'Pendidikan Jasmani, Olahraga & Kesehatan',
    category: 'PJOK',
    colorBg: 'bg-yellow-100 dark:bg-yellow-950/40',
    colorText: 'text-yellow-900 dark:text-yellow-100',
    colorBorder: 'border-yellow-400 dark:border-yellow-600',
    badgeColor: '#eab308',
    iconName: 'Trophy',
    requiredGear: ['Seragam Olahraga SDK St. Teresia', 'Sepatu Olahraga Kets', 'Botol Minum Air Putih', 'Handuk Kecil'],
    teacherDefault: 'Pak Anton S.Pd'
  },
  'B.ANGGRIS': {
    id: 'b_inggris',
    code: 'B.ANGGRIS',
    fullName: 'Bahasa Inggris',
    category: 'B.INGGRIS',
    colorBg: 'bg-cyan-100 dark:bg-cyan-950/40',
    colorText: 'text-cyan-800 dark:text-cyan-200',
    colorBorder: 'border-cyan-300 dark:border-cyan-700',
    badgeColor: '#06b6d4',
    iconName: 'Languages',
    requiredGear: ['Buku Bahasa Inggris', 'Kamus Sederhana (opsional)', 'Buku Tulis'],
    teacherDefault: 'Ibu Francisca S.Pd'
  },
  'Pwd.Pancasila': {
    id: 'pancasila',
    code: 'Pwd.Pancasila',
    fullName: 'Pendidikan Pancasila',
    category: 'PENDIDIKAN PANCASILA',
    colorBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    colorText: 'text-emerald-800 dark:text-emerald-200',
    colorBorder: 'border-emerald-300 dark:border-emerald-700',
    badgeColor: '#10b981',
    iconName: 'Shield',
    requiredGear: ['Buku Paket Pendidikan Pancasila', 'Buku Tulis Catatan'],
    teacherDefault: 'Pak Fransiskus S.Pd'
  },
  'SBDP': {
    id: 'sbdp',
    code: 'SBDP',
    fullName: 'Seni Budaya dan Prakarya',
    category: 'SBDP',
    colorBg: 'bg-purple-100 dark:bg-purple-950/40',
    colorText: 'text-purple-800 dark:text-purple-200',
    colorBorder: 'border-purple-300 dark:border-purple-700',
    badgeColor: '#a855f7',
    iconName: 'Palette',
    requiredGear: ['Buku Gambar A4', 'Pensil Warna / Crayon / Spidol', 'Gunting & Lem kertas'],
    teacherDefault: 'Ibu Agnes S.Pd'
  },
  'EK': {
    id: 'ek',
    code: 'EK',
    fullName: 'Ekstrakurikuler',
    category: 'EK',
    colorBg: 'bg-red-100 dark:bg-red-950/40',
    colorText: 'text-red-800 dark:text-red-200',
    colorBorder: 'border-red-300 dark:border-red-700',
    badgeColor: '#dc2626',
    iconName: 'Sparkles',
    requiredGear: ['Perlengkapan Ekstrakurikuler (Pramuka/Pramuka/Seni)'],
    teacherDefault: 'Pembina Ekskul'
  },
  'UPACARA BENDERA': {
    id: 'upacara',
    code: 'UPACARA BENDERA',
    fullName: 'Upacara Bendera',
    category: 'UPACARA BENDERA',
    colorBg: 'bg-slate-200 dark:bg-slate-800',
    colorText: 'text-slate-800 dark:text-slate-100',
    colorBorder: 'border-slate-300 dark:border-slate-600',
    badgeColor: '#64748b',
    iconName: 'Flag',
    requiredGear: ['Seragam Merah Putih Lengkap', 'Topi & Dasi SDK St. Teresia', 'Sepatu Hitam & Kaos Kaki Putih'],
    teacherDefault: 'Tim Guru SDK St. Teresia'
  },
  'LITERASI DAN NUMERASI': {
    id: 'literasi',
    code: 'LITERASI DAN NUMERASI',
    fullName: 'Literasi dan Numerasi',
    category: 'LITERASI DAN NUMERASI',
    colorBg: 'bg-teal-100 dark:bg-teal-950/40',
    colorText: 'text-teal-800 dark:text-teal-200',
    colorBorder: 'border-teal-300 dark:border-teal-700',
    badgeColor: '#14b8a6',
    iconName: 'GraduationCap',
    requiredGear: ['Buku Bacaan / Cerita Rakyat', 'Buku Tulis Refleksi Membaca'],
    teacherDefault: 'Wali Kelas'
  }
};

// Helper generator to build initial schedule matching TAPEL 2025/2026 SDK St. Teresia Danga - Mbay
export const generateDefaultSchedule = (): ScheduleItem[] => {
  const items: ScheduleItem[] = [];

  const rawDayData: Record<DayOfWeek, Record<number, Record<ClassGroup, string>>> = {
    Senin: {
      0: { '1A':'UPACARA BENDERA','1B':'UPACARA BENDERA','2A':'UPACARA BENDERA','2B':'UPACARA BENDERA','3A':'UPACARA BENDERA','3B':'UPACARA BENDERA','4A':'UPACARA BENDERA','4B':'UPACARA BENDERA','5A':'UPACARA BENDERA','5B':'UPACARA BENDERA','6A':'UPACARA BENDERA','6B':'UPACARA BENDERA' },
      1: { '1A':'B.INDONESIA','1B':'AGAMA','2A':'MATHM','2B':'B.INDONESIA','3A':'EK','3B':'B.INDONESIA','4A':'IPAS','4B':'PJOK','5A':'B.ANGGRIS','5B':'MATHM','6A':'AGAMA','6B':'B.INDONESIA' },
      2: { '1A':'B.INDONESIA','1B':'AGAMA','2A':'MATHM','2B':'B.INDONESIA','3A':'EK','3B':'B.INDONESIA','4A':'IPAS','4B':'PJOK','5A':'B.ANGGRIS','5B':'MATHM','6A':'AGAMA','6B':'B.INDONESIA' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'AGAMA','1B':'MATHM','2A':'B.ANGGRIS','2B':'B.INDONESIA','3A':'B.INDONESIA','3B':'EK','4A':'SBDP','4B':'PJOK','5A':'IPAS','5B':'B.INDONESIA','6A':'Pwd.Pancasila','6B':'AGAMA' },
      5: { '1A':'AGAMA','1B':'MATHM','2A':'B.ANGGRIS','2B':'MATHM','3A':'B.INDONESIA','3B':'EK','4A':'PJOK','4B':'IPAS','5A':'MATHM','5B':'Pwd.Pancasila','6A':'B.INDONESIA','6B':'AGAMA' },
      6: { '1A':'Pwd.Pancasila','1B':'SBDP','2A':'AGAMA','2B':'MATHM','3A':'AGAMA','3B':'Pwd.Pancasila','4A':'PJOK','4B':'IPAS','5A':'MATHM','5B':'B.ANGGRIS','6A':'Pwd.Pancasila','6B':'Pwd.Pancasila' },
      7: { '1A':'Pwd.Pancasila','1B':'SBDP','2A':'AGAMA','2B':'MATHM','3A':'AGAMA','3B':'Pwd.Pancasila','4A':'PJOK','4B':'IPAS','5A':'MATHM','5B':'B.ANGGRIS','6A':'Pwd.Pancasila','6B':'Pwd.Pancasila' },
    },
    Selasa: {
      0: { '1A':'LITERASI DAN NUMERASI','1B':'LITERASI DAN NUMERASI','2A':'LITERASI DAN NUMERASI','2B':'LITERASI DAN NUMERASI','3A':'LITERASI DAN NUMERASI','3B':'LITERASI DAN NUMERASI','4A':'LITERASI DAN NUMERASI','4B':'LITERASI DAN NUMERASI','5A':'LITERASI DAN NUMERASI','5B':'LITERASI DAN NUMERASI','6A':'LITERASI DAN NUMERASI','6B':'LITERASI DAN NUMERASI' },
      1: { '1A':'MATHM','1B':'PJOK','2A':'B.INDONESIA','2B':'AGAMA','3A':'Pwd.Pancasila','3B':'AGAMA','4A':'B.ANGGRIS','4B':'MATHM','5A':'B.INDONESIA','5B':'PJOK','6A':'MATHM','6B':'EK' },
      2: { '1A':'MATHM','1B':'PJOK','2A':'B.INDONESIA','2B':'AGAMA','3A':'Pwd.Pancasila','3B':'AGAMA','4A':'B.ANGGRIS','4B':'MATHM','5A':'B.INDONESIA','5B':'PJOK','6A':'MATHM','6B':'EK' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'MATHM','1B':'AGAMA','2A':'B.INDONESIA','2B':'B.ANGGRIS','3A':'B.INDONESIA','3B':'MATHM','4A':'AGAMA','4B':'B.INDONESIA','5A':'B.INDONESIA','5B':'PJOK','6A':'SBDP','6B':'MATHM' },
      5: { '1A':'PJOK','1B':'AGAMA','2A':'B.INDONESIA','2B':'B.ANGGRIS','3A':'B.INDONESIA','3B':'MATHM','4A':'AGAMA','4B':'SBDP','5A':'PJOK','5B':'PJOK','6A':'SBDP','6B':'MATHM' },
      6: { '1A':'PJOK','1B':'Pwd.Pancasila','2A':'MATHM','2B':'B.INDONESIA','3A':'IPAS','3B':'IPAS','4A':'B.INDONESIA','4B':'B.ANGGRIS','5A':'PJOK','5B':'AGAMA','6A':'EK','6B':'AGAMA' },
      7: { '1A':'PJOK','1B':'Pwd.Pancasila','2A':'MATHM','2B':'B.INDONESIA','3A':'IPAS','3B':'IPAS','4A':'B.INDONESIA','4B':'B.ANGGRIS','5A':'PJOK','5B':'AGAMA','6A':'EK','6B':'AGAMA' },
    },
    Rabu: {
      0: { '1A':'LITERASI DAN NUMERASI','1B':'LITERASI DAN NUMERASI','2A':'LITERASI DAN NUMERASI','2B':'LITERASI DAN NUMERASI','3A':'LITERASI DAN NUMERASI','3B':'LITERASI DAN NUMERASI','4A':'LITERASI DAN NUMERASI','4B':'LITERASI DAN NUMERASI','5A':'LITERASI DAN NUMERASI','5B':'LITERASI DAN NUMERASI','6A':'LITERASI DAN NUMERASI','6B':'LITERASI DAN NUMERASI' },
      1: { '1A':'AGAMA','1B':'B.ANGGRIS','2A':'AGAMA','2B':'EK','3A':'MATHM','3B':'PJOK','4A':'MATHM','4B':'B.INDONESIA','5A':'Pwd.Pancasila','5B':'B.INDONESIA','6A':'B.INDONESIA','6B':'MATHM' },
      2: { '1A':'AGAMA','1B':'B.ANGGRIS','2A':'AGAMA','2B':'EK','3A':'MATHM','3B':'PJOK','4A':'MATHM','4B':'B.INDONESIA','5A':'Pwd.Pancasila','5B':'B.INDONESIA','6A':'B.INDONESIA','6B':'MATHM' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'B.ANGGRIS','1B':'B.INDONESIA','2A':'Pwd.Pancasila','3A':'PJOK','3B':'MATHM','2B':'MATHM','4A':'PJOK','4B':'MATHM','5A':'MATHM','5B':'B.INDONESIA','6A':'MATHM','6B':'MATHM' },
      5: { '1A':'B.ANGGRIS','1B':'B.INDONESIA','2A':'Pwd.Pancasila','3A':'PJOK','3B':'PJOK','2B':'MATHM','4A':'PJOK','4B':'B.INDONESIA','5A':'MATHM','5B':'MATHM','6A':'MATHM','6B':'IPAS' },
      6: { '1A':'Pwd.Pancasila','1B':'PJOK','2A':'EK','2B':'AGAMA','3A':'MATHM','3B':'PJOK','4A':'B.INDONESIA','4B':'B.INDONESIA','5A':'Pwd.Pancasila','5B':'IPAS','6A':'EK','6B':'IPAS' },
      7: { '1A':'Pwd.Pancasila','1B':'PJOK','2A':'EK','2B':'AGAMA','3A':'MATHM','3B':'PJOK','4A':'B.INDONESIA','4B':'B.INDONESIA','5A':'Pwd.Pancasila','5B':'IPAS','6A':'EK','6B':'IPAS' },
    },
    Kamis: {
      0: { '1A':'LITERASI DAN NUMERASI','1B':'LITERASI DAN NUMERASI','2A':'LITERASI DAN NUMERASI','2B':'LITERASI DAN NUMERASI','3A':'LITERASI DAN NUMERASI','3B':'LITERASI DAN NUMERASI','4A':'LITERASI DAN NUMERASI','4B':'LITERASI DAN NUMERASI','5A':'LITERASI DAN NUMERASI','5B':'LITERASI DAN NUMERASI','6A':'LITERASI DAN NUMERASI','6B':'LITERASI DAN NUMERASI' },
      1: { '1A':'B.INDONESIA','1B':'MATHM','2A':'B.INDONESIA','2B':'PJOK','3A':'B.ANGGRIS','3B':'AGAMA','4A':'AGAMA','4B':'MATHM','5A':'AGAMA','5B':'EK','6A':'PJOK','6B':'B.INDONESIA' },
      2: { '1A':'B.INDONESIA','1B':'MATHM','2A':'B.INDONESIA','2B':'PJOK','3A':'B.ANGGRIS','3B':'AGAMA','4A':'AGAMA','4B':'MATHM','5A':'AGAMA','5B':'EK','6A':'PJOK','6B':'B.INDONESIA' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'MATHM','1B':'MATHM','2A':'PJOK','2B':'B.INDONESIA','3A':'AGAMA','3B':'B.ANGGRIS','4A':'SBDP','4B':'AGAMA','5A':'B.INDONESIA','5B':'MATHM','6A':'PJOK','6B':'B.INDONESIA' },
      5: { '1A':'MATHM','1B':'MATHM','2A':'PJOK','2B':'B.INDONESIA','3A':'AGAMA','3B':'B.ANGGRIS','4A':'Pwd.Pancasila','4B':'AGAMA','5A':'B.INDONESIA','5B':'MATHM','6A':'IPAS','6B':'PJOK' },
      6: { '1A':'SBDP','1B':'B.INDONESIA','2A':'SBDP','2B':'Pwd.Pancasila','3A':'Pwd.Pancasila','3B':'Pwd.Pancasila','4A':'Pwd.Pancasila','4B':'EK','5A':'MATHM','5B':'EK','6A':'IPAS','6B':'PJOK' },
      7: { '1A':'SBDP','1B':'B.INDONESIA','2A':'SBDP','2B':'Pwd.Pancasila','3A':'Pwd.Pancasila','3B':'Pwd.Pancasila','4A':'Pwd.Pancasila','4B':'EK','5A':'MATHM','5B':'EK','6A':'SBDP','6B':'PJOK' },
    },
    Jumat: {
      0: { '1A':'LITERASI DAN NUMERASI','1B':'LITERASI DAN NUMERASI','2A':'LITERASI DAN NUMERASI','2B':'LITERASI DAN NUMERASI','3A':'LITERASI DAN NUMERASI','3B':'LITERASI DAN NUMERASI','4A':'LITERASI DAN NUMERASI','4B':'LITERASI DAN NUMERASI','5A':'LITERASI DAN NUMERASI','5B':'LITERASI DAN NUMERASI','6A':'LITERASI DAN NUMERASI','6B':'LITERASI DAN NUMERASI' },
      1: { '1A':'PJOK','1B':'Pwd.Pancasila','2A':'B.INDONESIA','2B':'Pwd.Pancasila','3A':'MATHM','3B':'AGAMA','4A':'AGAMA','4B':'SBDP','5A':'IPAS','5B':'B.ANGGRIS','6A':'SBDP','6B':'SBDP' },
      2: { '1A':'PJOK','1B':'Pwd.Pancasila','2A':'B.INDONESIA','2B':'Pwd.Pancasila','3A':'MATHM','3B':'AGAMA','4A':'AGAMA','4B':'SBDP','5A':'IPAS','5B':'B.ANGGRIS','6A':'SBDP','6B':'SBDP' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'SBDP','1B':'B.INDONESIA','2A':'PJOK','2B':'MATHM','3A':'IPAS','3B':'IPAS','4A':'MATHM','4B':'EK','5A':'AGAMA','5B':'B.INDONESIA','6A':'MATHM','6B':'B.ANGGRIS' },
      5: { '1A':'SBDP','1B':'B.INDONESIA','2A':'PJOK','2B':'MATHM','3A':'IPAS','3B':'IPAS','4A':'MATHM','4B':'EK','5A':'AGAMA','5B':'AGAMA','6A':'MATHM','6B':'B.ANGGRIS' },
      6: { '1A':'B.INDONESIA','1B':'SBDP','2A':'Pwd.Pancasila','2B':'SBDP','3A':'SBDP','3B':'SBDP','4A':'IPAS','4B':'IPAS','5A':'IPAS','5B':'B.INDONESIA','6A':'Pwd.Pancasila','6B':'Pwd.Pancasila' },
      7: { '1A':'B.INDONESIA','1B':'SBDP','2A':'Pwd.Pancasila','2B':'SBDP','3A':'SBDP','3B':'SBDP','4A':'IPAS','4B':'IPAS','5A':'IPAS','5B':'B.INDONESIA','6A':'Pwd.Pancasila','6B':'Pwd.Pancasila' },
    },
    Sabtu: {
      0: { '1A':'EKSTRAKURIKULER','1B':'EKSTRAKURIKULER','2A':'EKSTRAKURIKULER','2B':'EKSTRAKURIKULER','3A':'EKSTRAKURIKULER','3B':'EKSTRAKURIKULER','4A':'EKSTRAKURIKULER','4B':'EKSTRAKURIKULER','5A':'EKSTRAKURIKULER','5B':'EKSTRAKURIKULER','6A':'EKSTRAKURIKULER','6B':'EKSTRAKURIKULER' },
      1: { '1A':'EKSTRAKURIKULER','1B':'EKSTRAKURIKULER','2A':'EKSTRAKURIKULER','2B':'EKSTRAKURIKULER','3A':'EKSTRAKURIKULER','3B':'EKSTRAKURIKULER','4A':'EKSTRAKURIKULER','4B':'EKSTRAKURIKULER','5A':'EKSTRAKURIKULER','5B':'EKSTRAKURIKULER','6A':'EKSTRAKURIKULER','6B':'EKSTRAKURIKULER' },
      2: { '1A':'EKSTRAKURIKULER','1B':'EKSTRAKURIKULER','2A':'EKSTRAKURIKULER','2B':'EKSTRAKURIKULER','3A':'EKSTRAKURIKULER','3B':'EKSTRAKURIKULER','4A':'EKSTRAKURIKULER','4B':'EKSTRAKURIKULER','5A':'EKSTRAKURIKULER','5B':'EKSTRAKURIKULER','6A':'EKSTRAKURIKULER','6B':'EKSTRAKURIKULER' },
      3: { '1A':'ISTIRAHAT','1B':'ISTIRAHAT','2A':'ISTIRAHAT','2B':'ISTIRAHAT','3A':'ISTIRAHAT','3B':'ISTIRAHAT','4A':'ISTIRAHAT','4B':'ISTIRAHAT','5A':'ISTIRAHAT','5B':'ISTIRAHAT','6A':'ISTIRAHAT','6B':'ISTIRAHAT' },
      4: { '1A':'EKSTRAKURIKULER','1B':'EKSTRAKURIKULER','2A':'EKSTRAKURIKULER','2B':'EKSTRAKURIKULER','3A':'EKSTRAKURIKULER','3B':'EKSTRAKURIKULER','4A':'EKSTRAKURIKULER','4B':'EKSTRAKURIKULER','5A':'EKSTRAKURIKULER','5B':'EKSTRAKURIKULER','6A':'EKSTRAKURIKULER','6B':'EKSTRAKURIKULER' },
      5: { '1A':'EKSTRAKURIKULER','1B':'EKSTRAKURIKULER','2A':'EKSTRAKURIKULER','2B':'EKSTRAKURIKULER','3A':'EKSTRAKURIKULER','3B':'EKSTRAKURIKULER','4A':'EKSTRAKURIKULER','4B':'EKSTRAKURIKULER','5A':'EKSTRAKURIKULER','5B':'EKSTRAKURIKULER','6A':'EKSTRAKURIKULER','6B':'EKSTRAKURIKULER' },
      6: { '1A':'PRAMUKA / SENI','1B':'PRAMUKA / SENI','2A':'PRAMUKA / SENI','2B':'PRAMUKA / SENI','3A':'PRAMUKA / SENI','3B':'PRAMUKA / SENI','4A':'PRAMUKA / SENI','4B':'PRAMUKA / SENI','5A':'PRAMUKA / SENI','5B':'PRAMUKA / SENI','6A':'PRAMUKA / SENI','6B':'PRAMUKA / SENI' },
      7: { '1A':'PRAMUKA / SENI','1B':'PRAMUKA / SENI','2A':'PRAMUKA / SENI','2B':'PRAMUKA / SENI','3A':'PRAMUKA / SENI','3B':'PRAMUKA / SENI','4A':'PRAMUKA / SENI','4B':'PRAMUKA / SENI','5A':'PRAMUKA / SENI','5B':'PRAMUKA / SENI','6A':'PRAMUKA / SENI','6B':'PRAMUKA / SENI' },
    }
  };

  ALL_DAYS.forEach((day) => {
    TIME_SLOTS.forEach((slot) => {
      ALL_CLASSES.forEach((classGrp) => {
        const sub = rawDayData[day]?.[slot.id]?.[classGrp] || (slot.isBreak ? 'ISTIRAHAT' : 'EK');
        items.push({
          id: `${classGrp}-${day}-${slot.id}`,
          classGroup: classGrp,
          day: day,
          slotId: slot.id,
          subjectCode: sub === 'PRAMUKA / SENI' ? 'EK' : sub,
          room: `Ruang Kelas ${classGrp}`,
          notes: sub === 'UPACARA BENDERA' ? 'Seragam Merah Putih Topi Dasi' : undefined
        });
      });
    });
  });

  return items;
};
