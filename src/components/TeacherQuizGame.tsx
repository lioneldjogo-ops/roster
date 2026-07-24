import React, { useState, useEffect } from 'react';
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
  Clock,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Flame,
  Star,
  Award,
  Zap,
} from 'lucide-react';

import mascotHappy from '../assets/images/quiz_mascot_happy_1784887213171.jpg';
import mascotThinking from '../assets/images/quiz_mascot_thinking_1784887224653.jpg';
import mascotTrophy from '../assets/images/quiz_mascot_trophy_1784887237478.jpg';

interface TeacherQuizGameProps {
  quizList: QuizQuestion[];
  selectedClass: ClassGroup;
  onSelectClass: (c: ClassGroup) => void;
  onAddQuestion: (q: Omit<QuizQuestion, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenGoogleSheetsModal: () => void;
  isTeacher?: boolean;
}

// Synthesize fun sound effects using Web Audio API
const playSound = (type: 'correct' | 'wrong' | 'click' | 'win' | 'streak', enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.3); // F3

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'streak') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Autoplay restrictions handle silently
  }
};

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

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

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
  const [imageUrl, setImageUrl] = useState('');
  const [teacherName, setTeacherName] = useState('Ibu Maria S.Pd');

  // Available questions for active play session
  const activeQuestions = quizList.filter((q) => {
    const matchClass = q.classGroup === selectedClass;
    const matchSubject = selectedSubjectFilter === 'ALL' || q.subjectCode === selectedSubjectFilter;
    return matchClass && matchSubject;
  });

  // Timer countdown hook
  useEffect(() => {
    let timer: any = null;
    if (gameStarted && !isAnswered && !gameOver && isTimerActive && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time out - mark auto incorrect
            handleSelectOption(-1); // -1 timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, isAnswered, gameOver, isTimerActive, timerSeconds]);

  const handleStartGame = () => {
    if (activeQuestions.length === 0) return;
    playSound('click', soundEnabled);
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setStreak(0);
    setIsAnswered(false);
    setGameOver(false);
    setTimerSeconds(30);
    setIsTimerActive(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(idx);
    setIsAnswered(true);
    setIsTimerActive(false);

    const q = activeQuestions[currentQuestionIndex];
    if (idx === q.correctAnswerIndex) {
      const bonus = streak * 20;
      const newScore = score + 100 + bonus;
      setScore(newScore);
      setStreak((prev) => prev + 1);

      if (streak + 1 >= 2) {
        playSound('streak', soundEnabled);
      } else {
        playSound('correct', soundEnabled);
      }
    } else {
      setStreak(0);
      playSound('wrong', soundEnabled);
    }
  };

  const handleNextQuestion = () => {
    playSound('click', soundEnabled);
    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setTimerSeconds(30);
      setIsTimerActive(true);
    } else {
      setGameOver(true);
      playSound('win', soundEnabled);
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
      imageUrl: imageUrl.trim() || undefined,
    });

    setNewQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setExplanation('');
    setImageUrl('');
    setIsAddModalOpen(false);
    playSound('click', soundEnabled);
  };

  const currentQ = activeQuestions[currentQuestionIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-blue-950 rounded-[32px] p-6 md:p-8 border-4 border-yellow-300 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-950 text-yellow-300 px-3.5 py-1 rounded-full border border-yellow-400 shadow-sm">
            <Gamepad2 className="w-4 h-4 text-yellow-300 animate-pulse" /> GAME KUIS ANIMASI INTERAKTIF
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-blue-950 flex items-center gap-2">
            PETUALANGAN KUIS SDK ST. TERESIA
          </h2>
          <p className="text-xs md:text-sm text-blue-950/90 font-bold">
            🦉 **Belajar sambil bermain jadi lebih seru dengan Maskot Burung Hantu Owi!** Kumpulkan skor, raih streak bonus, dan dapatkan Bintang Emas 🌟.
          </p>
        </div>

        {/* Mascot Banner Illustration */}
        <div className="flex items-center gap-3 relative z-10 self-center md:self-auto">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-yellow-300 shadow-lg bg-white shrink-0 transform hover:scale-105 transition-transform">
            <img
              src={mascotHappy}
              alt="Maskot Burung Hantu Owi"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-2xl border-2 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                soundEnabled
                  ? 'bg-blue-950 text-yellow-300 border-yellow-300'
                  : 'bg-white/90 text-slate-700 border-slate-300'
              }`}
              title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] uppercase font-extrabold">{soundEnabled ? 'SUARA: ON' : 'SUARA: OFF'}</span>
            </button>

            {isTeacher && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-200 text-blue-950 font-black text-xs rounded-xl border-2 border-yellow-400 shadow-[2px_2px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-blue-950" />
                <span>+ BUAT SOAL</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Selector & Class/Subject Filter */}
      <div className="bg-sky-50 dark:bg-slate-800/80 p-4 rounded-3xl border-2 border-blue-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('play');
                playSound('click', soundEnabled);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                activeTab === 'play'
                  ? 'bg-blue-950 text-yellow-300 border-2 border-yellow-400 shadow-[3px_3px_0px_#1e3a8a]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> 🎮 ARENA MAIN KUIS
            </button>

            {isTeacher && (
              <button
                onClick={() => {
                  setActiveTab('teacher');
                  playSound('click', soundEnabled);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                  activeTab === 'teacher'
                    ? 'bg-blue-950 text-yellow-300 border-2 border-yellow-400 shadow-[3px_3px_0px_#1e3a8a]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                <Plus className="w-4 h-4" /> 📚 KELOLA BANK SOAL ({quizList.filter((q) => q.classGroup === selectedClass).length})
              </button>
            )}
          </div>

          {isTeacher && (
            <button
              onClick={onOpenGoogleSheetsModal}
              className="p-2 bg-green-700 hover:bg-green-600 text-white rounded-xl border-2 border-green-300 shadow-sm flex items-center gap-1.5 text-xs font-black uppercase"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>SINKRON SPREADSHEET</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-200/60 dark:border-slate-700">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase whitespace-nowrap">
              PILIH KELAS:
            </span>
            {ALL_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  onSelectClass(cls);
                  setGameStarted(false);
                  playSound('click', soundEnabled);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  selectedClass === cls
                    ? 'bg-yellow-400 text-blue-950 border-2 border-yellow-300 shadow-[2px_2px_0px_#1e3a8a]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-950 dark:text-slate-200 uppercase">MAPEL:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => {
                setSelectedSubjectFilter(e.target.value);
                setGameStarted(false);
                playSound('click', soundEnabled);
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
      </div>

      {/* MODE 1: PLAY GAME */}
      {activeTab === 'play' && (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border-4 border-blue-100 dark:border-slate-800 shadow-xl min-h-[460px] flex flex-col justify-between relative overflow-hidden">
          
          {/* WELCOME LOBBY */}
          {!gameStarted && !gameOver && (
            <div className="py-8 max-w-xl mx-auto space-y-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl mx-auto bg-amber-50 transform hover:rotate-2 transition-transform">
                  <img
                    src={mascotThinking}
                    alt="Maskot Owi Berpikir"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-blue-950 p-2 rounded-full border-2 border-yellow-200 shadow-md animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="bg-sky-50 dark:bg-slate-800 p-5 rounded-3xl border-3 border-sky-300 dark:border-slate-700 shadow-md relative">
                <p className="text-sm md:text-base font-black text-blue-950 dark:text-amber-300">
                  "Halo Teman-Teman Kelas {selectedClass}! Aku Owi 🦉. Mari kita uji kemampuanmu di Kuis Interaktif ini!"
                </p>
                <div className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  Tersedia <strong className="text-amber-600">{activeQuestions.length} Soal Pilihan Ganda</strong>.
                </div>
              </div>

              {activeQuestions.length === 0 ? (
                <div className="bg-rose-50 dark:bg-rose-950/60 p-4 rounded-2xl border-2 border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-bold">
                  Belum ada soal untuk kombinasi kelas dan mata pelajaran ini. Silakan pilih tab **KELOLA BANK SOAL** untuk menambah soal baru!
                </div>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-base py-4 px-8 rounded-2xl border-3 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 uppercase tracking-wide flex items-center justify-center gap-3 transform hover:scale-[1.02] transition-transform"
                >
                  <Gamepad2 className="w-6 h-6 text-blue-950 animate-bounce" />
                  MULAI MAIN KUIS SEKARANG!
                </button>
              )}
            </div>
          )}

          {/* ACTIVE QUIZ SESSION */}
          {gameStarted && !gameOver && activeQuestions.length > 0 && currentQ && (
            <div className="space-y-6">
              {/* Header Score & Streak & Timer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 px-3.5 py-1.5 rounded-full uppercase border border-blue-300">
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
                  </span>
                  {streak > 1 && (
                    <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-1.5 rounded-full uppercase shadow-md flex items-center gap-1 animate-pulse">
                      <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                      Streak x{streak}! (+{streak * 20} Bonus)
                    </span>
                  )}
                </div>

                {/* Score & Timer */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
                  </div>

                  <div className="flex items-center gap-2 font-black text-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-4 py-1.5 rounded-2xl border-2 border-amber-300 shadow-sm">
                    <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
                    <span>{score}</span>
                  </div>
                </div>
              </div>

              {/* Timer Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timerSeconds < 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  }`}
                  style={{ width: `${(timerSeconds / 30) * 100}%` }}
                />
              </div>

              {/* Main Question & Mascot Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
                {/* Mascot Interactive Companion Card */}
                <div className="md:col-span-1 bg-amber-50 dark:bg-slate-800/80 p-4 rounded-3xl border-2 border-amber-300 dark:border-slate-700 flex flex-row md:flex-col items-center justify-center gap-3 text-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-md bg-white shrink-0">
                    <img
                      src={
                        !isAnswered
                          ? mascotThinking
                          : selectedOptionIndex === currentQ.correctAnswerIndex
                          ? mascotHappy
                          : mascotThinking
                      }
                      alt="Maskot Reaksi"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left md:text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                      TEMAN KUIS OWI 🦉
                    </span>
                    <p className="text-xs font-black text-blue-950 dark:text-white leading-tight">
                      {!isAnswered
                        ? 'Pilih jawaban yang paling tepat ya!'
                        : selectedOptionIndex === currentQ.correctAnswerIndex
                        ? 'HEBAT! Jawabanmu 100% Benar! 🎉'
                        : 'Tetap semangat! Pelajari jawabannya di bawah! 💪'}
                    </p>
                  </div>
                </div>

                {/* Question Box */}
                <div className="md:col-span-3 bg-sky-50 dark:bg-slate-800/60 p-6 rounded-3xl border-3 border-blue-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black uppercase bg-blue-950 text-yellow-300 px-3 py-1 rounded-full border border-yellow-400 shadow-sm">
                        {SUBJECTS_MAP[currentQ.subjectCode]?.fullName || currentQ.subjectCode}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Guru: {currentQ.teacherName}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-blue-950 dark:text-white leading-snug">
                      {currentQ.question}
                    </h3>
                  </div>

                  {/* Question Image Illustration if provided */}
                  {currentQ.imageUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border-2 border-blue-200 max-h-48 bg-white flex items-center justify-center">
                      <img
                        src={currentQ.imageUrl}
                        alt="Gambar Pertanyaan"
                        className="max-h-48 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Choice Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt, idx) => {
                  const isCorrectChoice = idx === currentQ.correctAnswerIndex;
                  const isUserChoice = idx === selectedOptionIndex;

                  let cardStyle =
                    'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800';

                  if (isAnswered) {
                    if (isCorrectChoice) {
                      cardStyle = 'bg-green-500 text-white border-green-600 shadow-lg scale-[1.01]';
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
                      className={`p-4 rounded-2xl border-3 text-left font-black text-sm md:text-base transition-all flex items-center gap-3 shadow-sm ${cardStyle}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-blue-950 text-yellow-300 text-xs md:text-sm font-black flex items-center justify-center shrink-0 border border-yellow-400 shadow-sm">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-tight">{opt}</span>
                      {isAnswered && isCorrectChoice && <CheckCircle2 className="w-6 h-6 text-white shrink-0 animate-bounce" />}
                      {isAnswered && isUserChoice && !isCorrectChoice && <XCircle className="w-6 h-6 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Step Button */}
              {isAnswered && (
                <div className="bg-amber-50 dark:bg-slate-800 p-5 rounded-3xl border-2 border-amber-300 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-950 dark:text-amber-300 uppercase">
                    <HelpCircle className="w-4 h-4" />
                    <span>Pembahasan dari Guru:</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-bold">
                    {currentQ.explanation || 'Jawaban yang benar telah dikonfirmasi oleh guru pengajar.'}
                  </p>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs md:text-sm py-3.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
                  >
                    <span>SOAL BERIKUTNYA</span> →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME OVER SUMMARY */}
          {gameOver && (
            <div className="text-center py-8 max-w-lg mx-auto space-y-6">
              <div className="relative inline-block">
                <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-yellow-300 shadow-2xl mx-auto bg-amber-50 transform hover:scale-105 transition-transform">
                  <img
                    src={mascotTrophy}
                    alt="Maskot Piala Kemenangan"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-amber-400 text-blue-950 p-2 rounded-full border-2 border-yellow-200 shadow-lg animate-bounce">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300">
                  🎉 KUIS SELESAI! HEBAT SEKALI!
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white uppercase tracking-tight">
                  SKOR AKHIR: {score}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold">
                  Kamu telah menyelesaikan seluruh {activeQuestions.length} soal kuis kelas {selectedClass}.
                </p>
              </div>

              {/* Performance Stars */}
              <div className="flex items-center justify-center gap-2 bg-sky-50 dark:bg-slate-800 p-4 rounded-2xl border-2 border-blue-200">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>

              <button
                onClick={handleStartGame}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-sm py-4 px-6 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> MAIN LAGI SEKARANG
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
              📚 BANK SOAL KUIS KELAS {selectedClass} ({quizList.filter((q) => q.classGroup === selectedClass).length} Soal)
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

                  {q.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 max-h-32 bg-slate-50 flex items-center justify-center">
                      <img
                        src={q.imageUrl}
                        alt="Gambar Soal"
                        className="max-h-32 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

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

              {/* Image URL Optional */}
              <div>
                <label className="font-black text-blue-950 dark:text-slate-200 block uppercase mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" /> URL Gambar / Ilustrasi (Opsional):
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/gambar-soal.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
