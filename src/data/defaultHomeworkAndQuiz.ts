import { HomeworkItem, QuizQuestion } from '../types';

export const DEFAULT_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1a-math-1',
    classGroup: '1A',
    subjectCode: 'MATEMATIKA',
    title: 'Latihan Penjumlahan 1 - 10 (Manual Buku PR)',
    description: 'Buka buku paket Matematika Hal 24. Kerjakan nomor 1 s/d 10 secara MANUAL di Buku Tulis PR Matematika.',
    dueDate: '2025-07-28',
    teacherName: 'Guru Mata Pelajaran',
    completed: false,
    createdAt: new Date().toISOString(),
    completedByStudents: [],
  },
  {
    id: 'hw-1a-indo-1',
    classGroup: '1A',
    subjectCode: 'B.INDONESIA',
    title: 'Membaca Cerita Pendek "Sahabat Kecil"',
    description: 'Membaca bersama orang tua & menyalin 3 kalimat tentang hewan kesayangan secara manual di buku halus kasar.',
    dueDate: '2025-07-29',
    teacherName: 'Guru Mata Pelajaran',
    completed: false,
    createdAt: new Date().toISOString(),
    completedByStudents: [],
  },
  {
    id: 'hw-2a-ipas-1',
    classGroup: '2A',
    subjectCode: 'IPAS',
    title: 'Menggambar & Mewarnai Bagian Tumbuhan',
    description: 'Gambarlah tumbuhan utuh (Akar, Batang, Daun, Bunga) di kertas gambar A4 dan sebutkan fungsinya.',
    dueDate: '2025-07-30',
    teacherName: 'Guru Mata Pelajaran',
    completed: false,
    createdAt: new Date().toISOString(),
    completedByStudents: [],
  },
  {
    id: 'hw-3a-agama-1',
    classGroup: '3A',
    subjectCode: 'AGAMA',
    title: 'Menghafal Doa Bapa Kami & Salam Maria',
    description: 'Latihan berdoa dengan sikap sempurna di rumah bersama orang tua.',
    dueDate: '2025-08-01',
    teacherName: 'Guru Mata Pelajaran',
    completed: false,
    createdAt: new Date().toISOString(),
    completedByStudents: [],
  },
  {
    id: 'hw-4a-pancasila-1',
    classGroup: '4A',
    subjectCode: 'PENDIDIKAN PANCASILA',
    title: 'Menuliskan 5 Contoh Sikap Gotong Royong',
    description: 'Tuliskan contoh penerapan Pancasila sila ke-3 di lingkungan sekolah dan rumah.',
    dueDate: '2025-08-02',
    teacherName: 'Guru Mata Pelajaran',
    completed: false,
    createdAt: new Date().toISOString(),
    completedByStudents: [],
  },
];

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  // MATEMATIKA
  {
    id: 'q-math-1',
    classGroup: '1A',
    subjectCode: 'MATEMATIKA',
    question: 'Berapakah hasil dari 5 + 4 ?',
    options: ['7', '8', '9', '10'],
    correctAnswerIndex: 2, // 9
    explanation: '5 ditambah 4 sama dengan 9.',
    teacherName: 'Guru Mata Pelajaran',
  },
  {
    id: 'q-math-2',
    classGroup: '2A',
    subjectCode: 'MATEMATIKA',
    question: 'Jika kamu memiliki 12 apel dan dimakan 4 apel, berapa sisa apelmu?',
    options: ['6 apel', '8 apel', '9 apel', '10 apel'],
    correctAnswerIndex: 1, // 8
    explanation: '12 - 4 = 8 apel.',
    teacherName: 'Guru Mata Pelajaran',
  },

  // B. INDONESIA
  {
    id: 'q-indo-1',
    classGroup: '1A',
    subjectCode: 'B.INDONESIA',
    question: 'Manakah dari kata berikut yang termasuk kata sapaan sopan?',
    options: ['Hei', 'Selamat Pagi, Ibu Guru', 'Kamu siapa', 'Woi'],
    correctAnswerIndex: 1,
    explanation: '"Selamat Pagi, Ibu Guru" adalah kata sapaan yang sopan dan santun.',
    teacherName: 'Guru Mata Pelajaran',
  },

  // IPAS
  {
    id: 'q-ipas-1',
    classGroup: '2A',
    subjectCode: 'IPAS',
    question: 'Bagian tumbuhan yang berfungsi menyerap air dan hara dari dalam tanah adalah...',
    options: ['Daun', 'Akar', 'Bunga', 'Batang'],
    correctAnswerIndex: 1, // Akar
    explanation: 'Akar berada di bawah tanah dan bertugas menyerap air serta mineral tanah.',
    teacherName: 'Guru Mata Pelajaran',
  },

  // AGAMA
  {
    id: 'q-agama-1',
    classGroup: '3A',
    subjectCode: 'AGAMA',
    question: 'Sikap kita saat berdoa di dalam gereja adalah...',
    options: ['Bercanda dengan teman', 'Tenang, khusyuk, dan melipat tangan', 'Berlari-lari', 'Tidur'],
    correctAnswerIndex: 1,
    explanation: 'Saat berdoa kita harus berbicara dengan Tuhan dengan sikap hormat dan khusyuk.',
    teacherName: 'Guru Mata Pelajaran',
  },

  // PJOK
  {
    id: 'q-pjok-1',
    classGroup: '1A',
    subjectCode: 'PJOK',
    question: 'Sebelum melakukan olahraga, kita sebaiknya melakukan gerakan...',
    options: ['Makan kenyang', 'Pemanasan', 'Pendinginan langsung', 'Tidur terlentang'],
    correctAnswerIndex: 1, // Pemanasan
    explanation: 'Pemanasan berguna mencegah cedera dan menyiapkan otot sebelum berolahraga.',
    teacherName: 'Guru Mata Pelajaran',
  },

  // PENDIDIKAN PANCASILA
  {
    id: 'q-pancasila-1',
    classGroup: '4A',
    subjectCode: 'PENDIDIKAN PANCASILA',
    question: 'Simbol Sila Pertama Pancasila "Ketuhanan Yang Maha Esa" adalah...',
    options: ['Rantai Emas', 'Pohon Beringin', 'Bintang Emas', 'Kepala Banteng'],
    correctAnswerIndex: 2, // Bintang
    explanation: 'Bintang Emas berlatar belakang hitam adalah lambang Sila ke-1 Pancasila.',
    teacherName: 'Guru Mata Pelajaran',
  },
];

