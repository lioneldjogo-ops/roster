import React, { useState } from 'react';
import { ALL_CLASSES, SUBJECTS_MAP } from '../data/defaultSchedule';
import { ClassGroup, QuizQuestion } from '../types';
import {
  Gamepad2,
  Trophy,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  FileSpreadsheet,
  Trash2,
  X,
  Check,
  CheckSquare,
} from 'lucide-react';

interface TeacherQuizGameProps {
  quizList: QuizQuestion[];
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  onAddQuestion: (q: Omit<QuizQuestion, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenGoogleSheetsModal: () => void;
  isTeacher?: boolean;
}

export const TeacherQuizGame: React.FC<TeacherQuizGameProps> = ({
  quizList,
  selectedClass,
  onSelectClass,
  onAddQuestion,
  onDeleteQuestion,
  onOpenGoogleSheetsModal,
  isTeacher = false,
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'teacher'>('play');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Modal Teacher Add Question
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('MATEMATIKA');
  const [newQuestion, setNewQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [teacherName, setTeacherName] = useState('Ibu Maria S.Pd');

  // Available questions for active play session
  const activeQuestions = quizList.filter((q) => {
    const matchClass = q.classGroup === selectedClass;
    const matchSubject = selectedSubjectFilter === 'ALL' || q.subjectCode === selectedSubjectFilter;
    return matchClass && matchSubject;
  });

  const handleStartGame = () => {
    if (activeQuestions.length === 0) return;
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setStreak(0);
    setIsAnswered(false);
    setGameOver(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(idx);
    setIsAnswered(true);

    const q = activeQuestions[currentQuestionIndex];
    if (idx === q.correctAnswerIndex) {
      const bonus = streak * 10;
      setScore((prev) => prev + 100 + bonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setGameOver(true);
    }
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !optionA.trim() || !optionB.trim()) return;

    onAddQuestion({
      classGroup: selectedClass,
      subjectCode: newSubject,
      question: newQuestion,
      options: [optionA, optionB, optionC || 'Opsi C', optionD || 'Opsi D'],
      correctAnswerIndex: correctIndex,
      explanation: explanation,
      teacherName: teacherName || 'Guru Pengajar',
    });

    setNewQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setExplanation('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-blue-950 rounded-[32px] p-6 md:p-8 border-4 border-yellow-300 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-950 text-yellow-300 px-3 py-1 rounded-full border border-yellow-400 shadow-sm">
            <Gamepad2 className="w-4 h-4 text-yellow-300" /> GAME KUIS MATA PELAJARAN
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-blue-950 flex items-center gap-2">
            KUIS INTERAKTIF & LATIHAN SOAL
          </h2>
          <p className="text-xs md:text-sm text-blue-950/90 font-bold">
            🎮 **Siswa dapat langsung bermain kuis tanpa perlu login email!** Cukup pilih kelas {selectedClass} untuk mengerjakan kuis interaktif. Guru dapat menambah soal langsung atau menyinkronkan dengan Google Sheets.
          </p>
        </div>

        {/* Tab Selector & Sheets Action */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isTeacher && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-blue-950" />
              <span>+ TAMBAH SOAL KUIS</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'play'
                ? 'bg-blue-950 text-yellow-300 border-2 border-yellow-400 shadow-[3px_3px_0px_#1e3a8a]'
                : 'bg-white/80 text-blue-950 hover:bg-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> 1. MAIN KUIS
          </button>

          {isTeacher && (
            <>
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                  activeTab === 'teacher'
                    ? 'bg-blue-950 text-yellow-300 border-2 border-yellow-400 shadow-[3px_3px_0px_#1e3a8a]'
                    : 'bg-white/80 text-blue-950 hover:bg-white'
                }`}
              >
                <Plus className="w-4 h-4" /> 2. KELOLA BANK SOAL ({quizList.filter((q) => q.classGroup === selectedClass).length})
              </button>

              <button
                onClick={onOpenGoogleSheetsModal}
                className="p-2.5 bg-green-700 hover:bg-green-600 text-white rounded-2xl border-2 border-green-300 shadow-[3px_3px_0px_#14532d] flex items-center gap-1.5 text-xs font-black uppercase"
                title="Sinkronkan dengan Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">GOOGLE SHEETS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Class & Subject Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-sky-50 dark:bg-slate-800/80 p-4 rounded-2xl border-2 border-blue-200 dark:border-slate-700">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase whitespace-nowrap">
            KELAS:
          </span>
          {ALL_CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => {
                onSelectClass(cls);
                setGameStarted(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedClass === cls
                  ? 'bg-yellow-400 text-blue-950 border-2 border-yellow-300 shadow-[2px_2px_0px_#1e3a8a]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              Kelas {cls}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase">MAPEL:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => {
              setSelectedSubjectFilter(e.target.value);
              setGameStarted(false);
            }}
            className="bg-white dark:bg-slate-900 text-xs font-bold py-1.5 px-3 rounded-xl border-2 border-blue-200 dark:border-slate-700"
          >
            <option value="ALL">SEMUA MATA PELAJARAN</option>
            {Object.keys(SUBJECTS_MAP).map((code) => (
              <option key={code} value={code}>
                {SUBJECTS_MAP[code].fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODE 1: PLAY GAME */}
      {activeTab === 'play' && (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border-4 border-blue-100 dark:border-slate-800 shadow-xl min-h-[400px] flex flex-col justify-between">
          {!gameStarted && !gameOver && (
            <div className="text-center py-12 max-w-lg mx-auto space-y-6">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border-4 border-amber-300 shadow-inner">
                <Gamepad2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-blue-950 dark:text-white uppercase">
                  SIAP BERMAIN KUIS KELAS {selectedClass}?
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Tersedia <strong className="text-amber-600">{activeQuestions.length} Soal</strong> untuk mata pelajaran yang kamu pilih.
                </p>
              </div>

              {activeQuestions.length === 0 ? (
                <div className="bg-rose-50 dark:bg-rose-950/60 p-4 rounded-2xl border-2 border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-bold">
                  Belum ada soal untuk kombinasi kelas dan mata pelajaran ini. Pilih tab **KELOLA BANK SOAL GURU** untuk menambah soal baru!
                </div>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-sm py-4 px-6 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-blue-950" />
                  MULAI BERMAIN SEKARANG!
                </button>
              )}
            </div>
          )}

          {/* GAME ACTIVE SESSION */}
          {gameStarted && !gameOver && activeQuestions.length > 0 && (
            <div className="space-y-6">
              {/* Game Header Score & Progress */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black bg-blue-100 text-blue-900 px-3 py-1 rounded-full uppercase">
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
                  </span>
                  {streak > 1 && (
                    <span className="text-xs font-black bg-orange-400 text-blue-950 px-3 py-1 rounded-full uppercase animate-bounce">
                      🔥 Streak x{streak}!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-black text-lg text-amber-600 dark:text-amber-400">
                  <Trophy className="w-5 h-5" />
                  <span>SKOR: {score}</span>
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-sky-50 dark:bg-slate-800/60 p-6 rounded-3xl border-2 border-blue-200 dark:border-slate-700 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  {SUBJECTS_MAP[activeQuestions[currentQuestionIndex].subjectCode]?.fullName || activeQuestions[currentQuestionIndex].subjectCode} • Guru: {activeQuestions[currentQuestionIndex].teacherName}
                </span>
                <h3 className="text-lg md:text-xl font-black text-blue-950 dark:text-white leading-snug">
                  {activeQuestions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Multiple Choice Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeQuestions[currentQuestionIndex].options.map((opt, idx) => {
                  const isCorrectChoice = idx === activeQuestions[currentQuestionIndex].correctAnswerIndex;
                  const isUserChoice = idx === selectedOptionIndex;

                  let cardStyle =
                    'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500';

                  if (isAnswered) {
                    if (isCorrectChoice) {
                      cardStyle = 'bg-green-500 text-white border-green-600 shadow-md';
                    } else if (isUserChoice) {
                      cardStyle = 'bg-rose-500 text-white border-rose-600';
                    } else {
                      cardStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border-4 text-left font-black text-sm transition-all flex items-start gap-3 ${cardStyle}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-blue-950 text-yellow-300 text-xs font-black flex items-center justify-center shrink-0 border border-yellow-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 mt-0.5">{opt}</span>
                      {isAnswered && isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                      {isAnswered && isUserChoice && !isCorrectChoice && <XCircle className="w-5 h-5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Step */}
              {isAnswered && (
                <div className="bg-amber-50 dark:bg-slate-800 p-5 rounded-2xl border-2 border-amber-300 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-950 dark:text-amber-300 uppercase">
                    <HelpCircle className="w-4 h-4" />
                    <span>Penjelasan Jawaban:</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    {activeQuestions[currentQuestionIndex].explanation || 'Jawaban benar telah dikonfirmasi oleh guru.'}
                  </p>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-3 rounded-xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
                  >
                    <span>Lanjut Ke Soal Berikutnya</span> →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME OVER SUMMARY */}
          {gameOver && (
            <div className="text-center py-10 max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-yellow-400 text-blue-950 rounded-full flex items-center justify-center mx-auto text-4xl font-black border-4 border-yellow-300 shadow-xl animate-bounce">
                <Trophy className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                  KUIS SELESAI! HEBAT SEKALI!
                </span>
                <h3 className="text-3xl font-black text-blue-950 dark:text-white uppercase">
                  SKOR AKHIR: {score}
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Kamu telah menyelesaikan seluruh {activeQuestions.length} soal kuis kelas {selectedClass}.
                </p>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-3.5 px-6 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> MAIN LAGI
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: TEACHER BANK SOAL MANAGEMENT */}
      {activeTab === 'teacher' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-blue-950 dark:text-white uppercase flex items-center gap-2">
              BANK SOAL KUIS KELAS {selectedClass} ({quizList.filter((q) => q.classGroup === selectedClass).length} Soal)
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-2.5 px-4 rounded-xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> TAMBAH SOAL BARU +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizList
              .filter((q) => q.classGroup === selectedClass)
              .map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                      {SUBJECTS_MAP[q.subjectCode]?.fullName || q.subjectCode}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Hapus soal ini?')) onDeleteQuestion(q.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-black text-blue-950 dark:text-white leading-snug">
                    {idx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-lg border ${
                          oIdx === q.correctAnswerIndex
                            ? 'bg-green-100 text-green-900 border-green-300 dark:bg-green-950/60 dark:text-green-200'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctAnswerIndex && '✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal Add Question */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-blue-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-black text-blue-950 dark:text-white uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                BUAT SOAL KUIS (KELAS {selectedClass})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Mata Pelajaran:
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                >
                  {Object.keys(SUBJECTS_MAP).map((code) => (
                    <option key={code} value={code}>
                      {SUBJECTS_MAP[code].fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Teks Pertanyaan:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tuliskan pertanyaan kuis di sini..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase">
                  Pilihan Jawaban (A, B, C, D):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pilihan A"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  required
                  placeholder="Pilihan B"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Pilihan C"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Pilihan D"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Pilih Jawaban Yang Benar:
                </label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(parseInt(e.target.value, 10))}
                  className="w-full bg-green-50 dark:bg-slate-800 font-black text-green-900 dark:text-green-300 py-2 px-3 rounded-xl border-2 border-green-300"
                >
                  <option value={0}>A ({optionA || 'Pilihan A'})</option>
                  <option value={1}>B ({optionB || 'Pilihan B'})</option>
                  <option value={2}>C ({optionC || 'Pilihan C'})</option>
                  <option value={3}>D ({optionD || 'Pilihan D'})</option>
                </select>
              </div>

              <div>
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase mb-1">
                  Penjelasan Pembahasan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Mengapa jawaban ini benar..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="font-black text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black py-2 px-4 rounded-xl border-2 border-yellow-300 shadow-[2px_2px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-blue-950" /> SIMPAN SOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
