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
  Grid,
  Unlock,
  Lock,
  RefreshCw,
} from 'lucide-react';

import mascotHappy from '../assets/images/quiz_mascot_happy_1784887213171.jpg';
import mascotThinking from '../assets/images/quiz_mascot_thinking_1784887224653.jpg';
import mascotTrophy from '../assets/images/quiz_mascot_trophy_1784887237478.jpg';

import puzzleLibrary from '../assets/images/puzzle_school_library_1784887581519.jpg';
import puzzleSafari from '../assets/images/puzzle_animal_safari_1784887596725.jpg';

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
const playSound = (type: 'correct' | 'wrong' | 'click' | 'win' | 'streak' | 'puzzle', enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'correct' || type === 'puzzle') {
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
    // Autoplay restrictions
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

  // Puzzle State
  const [selectedPuzzleTheme, setSelectedPuzzleTheme] = useState<'library' | 'safari'>('library');
  const [unlockedPieces, setUnlockedPieces] = useState<boolean[]>([]);
  const [showWrongModal, setShowWrongModal] = useState(false);

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

  const activePuzzleImage = selectedPuzzleTheme === 'library' ? puzzleLibrary : puzzleSafari;

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
    setShowWrongModal(false);
    setUnlockedPieces(new Array(activeQuestions.length).fill(false));
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
      // Unlock puzzle piece for this question index!
      setUnlockedPieces((prev) => {
        const copy = [...prev];
        copy[currentQuestionIndex] = true;
        return copy;
      });

      const bonus = streak * 20;
      const newScore = score + 100 + bonus;
      setScore(newScore);
      setStreak((prev) => prev + 1);

      if (streak + 1 >= 2) {
        playSound('streak', soundEnabled);
      } else {
        playSound('puzzle', soundEnabled);
      }
    } else {
      setStreak(0);
      playSound('wrong', soundEnabled);
      setShowWrongModal(true);
    }
  };

  const handleNextQuestion = () => {
    playSound('click', soundEnabled);
    setShowWrongModal(false);

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

  const handleRetryQuestion = () => {
    playSound('click', soundEnabled);
    setShowWrongModal(false);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setTimerSeconds(30);
    setIsTimerActive(true);
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

  // Helper calculation for Puzzle Grid layout (e.g. 2, 3, or 4 columns)
  const totalPieces = activeQuestions.length || 6;
  const gridColsClass =
    totalPieces <= 4
      ? 'grid-cols-2'
      : totalPieces <= 9
      ? 'grid-cols-3'
      : 'grid-cols-4';

  const unlockedCount = unlockedPieces.filter(Boolean).length;
  const isPuzzleComplete = unlockedCount === totalPieces && totalPieces > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-blue-950 rounded-[32px] p-6 md:p-8 border-4 border-yellow-300 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-950 text-yellow-300 px-3.5 py-1 rounded-full border border-yellow-400 shadow-sm">
            <Grid className="w-4 h-4 text-yellow-300 animate-pulse" /> GAME PUZZLE ANIMASI INTERAKTIF
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-blue-950 flex items-center gap-2">
            PETUALANGAN KUIS PUZZLE SDK ST. TERESIA
          </h2>
          <p className="text-xs md:text-sm text-blue-950/90 font-bold">
            🧩 **Jawab setiap soal dengan benar untuk membuka potongan gambar puzzle misteri satu per satu!** Jika salah, kamu bisa mengulang game atau mencoba lagi!
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
              <Gamepad2 className="w-4 h-4" /> 🧩 ARENA PUZZLE GAME
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
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border-4 border-blue-100 dark:border-slate-800 shadow-xl min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          
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
                  "Halo Teman-Teman Kelas {selectedClass}! Aku Owi 🦉. Mari buka gambar puzzle rahasia dengan menjawab kuis!"
                </p>
                <div className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  Tersedia <strong className="text-amber-600">{activeQuestions.length} Potongan Gambar Puzzle</strong> yang harus kamu susun!
                </div>
              </div>

              {/* Puzzle Theme Selector */}
              <div className="bg-amber-50 dark:bg-slate-800/80 p-4 rounded-2xl border-2 border-amber-300 text-left space-y-2">
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 block">
                  🎨 PILIH TEMA GAMBAR PUZZLE:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPuzzleTheme('library')}
                    className={`p-2.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 transition-all ${
                      selectedPuzzleTheme === 'library'
                        ? 'bg-yellow-400 text-blue-950 border-yellow-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300'
                    }`}
                  >
                    <span className="text-base">📚</span>
                    <span>Perpustakaan Ajaib</span>
                  </button>

                  <button
                    onClick={() => setSelectedPuzzleTheme('safari')}
                    className={`p-2.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 transition-all ${
                      selectedPuzzleTheme === 'safari'
                        ? 'bg-yellow-400 text-blue-950 border-yellow-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300'
                    }`}
                  >
                    <span className="text-base">🦁</span>
                    <span>Hutan Safari Hewan</span>
                  </button>
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
                  MULAI SUSUN PUZZLE SEKARANG!
                </button>
              )}
            </div>
          )}

          {/* ACTIVE QUIZ SESSION WITH PUZZLE REVEAL */}
          {gameStarted && !gameOver && activeQuestions.length > 0 && currentQ && (
            <div className="space-y-6">
              {/* Header Score & Streak & Timer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 px-3.5 py-1.5 rounded-full uppercase border border-blue-300">
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
                  </span>
                  <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-3 py-1.5 rounded-full uppercase border border-emerald-300 flex items-center gap-1">
                    🧩 Puzzle Terbuka: {unlockedCount} / {activeQuestions.length}
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

              {/* MAIN PUZZLE CANVAS + QUESTION CONTAINER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COL: INTERACTIVE PUZZLE BOARD (5 Cols) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-3xl border-3 border-amber-300 dark:border-slate-700 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-950 dark:text-amber-300 flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-amber-600" /> PUZZLE GAMBAR MISTERI
                    </span>
                    <span className="text-[10px] font-extrabold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                      {selectedPuzzleTheme === 'library' ? 'Perpustakaan' : 'Safari'}
                    </span>
                  </div>

                  {/* Puzzle Box Container */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-amber-400 shadow-inner bg-slate-900">
                    {/* Background Full Mystery Image */}
                    <img
                      src={activePuzzleImage}
                      alt="Gambar Puzzle Misteri"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Overlay Grid Tiles covering the image */}
                    <div className={`absolute inset-0 grid ${gridColsClass} gap-1 p-1 bg-amber-950/40 backdrop-blur-[1px]`}>
                      {Array.from({ length: totalPieces }).map((_, pIdx) => {
                        const isUnlocked = unlockedPieces[pIdx];
                        const isCurrentActivePiece = pIdx === currentQuestionIndex;

                        return (
                          <div
                            key={pIdx}
                            className={`relative rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-700 ${
                              isUnlocked
                                ? 'bg-transparent border-2 border-yellow-300/60 shadow-md opacity-0 pointer-events-none scale-90 rotate-6'
                                : isCurrentActivePiece
                                ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 border-3 border-yellow-200 text-blue-950 shadow-lg animate-pulse'
                                : 'bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border-2 border-blue-400/50 text-yellow-300'
                            }`}
                          >
                            {!isUnlocked && (
                              <div className="text-center space-y-1">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-950/80 text-yellow-300 text-xs font-black flex items-center justify-center mx-auto border border-yellow-400 shadow-sm">
                                  {pIdx + 1}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight block">
                                  {isCurrentActivePiece ? 'TARGET! 🎯' : 'TERKUNCI 🔒'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mascot Speech Bubble */}
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border-2 border-amber-300 flex items-center gap-3">
                    <img
                      src={
                        !isAnswered
                          ? mascotThinking
                          : selectedOptionIndex === currentQ.correctAnswerIndex
                          ? mascotHappy
                          : mascotThinking
                      }
                      alt="Owi Mascot"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-xs font-black text-blue-950 dark:text-slate-100 leading-tight">
                      {!isAnswered
                        ? `Ayo jawab soal ke-${currentQuestionIndex + 1} untuk membuka kepingan puzzle!`
                        : selectedOptionIndex === currentQ.correctAnswerIndex
                        ? 'LUAR BIASA! Kepingan puzzle berhasil terbuka! 🧩✨'
                        : 'Tetap tenang, coba pelajari jawabannya!'}
                    </p>
                  </div>
                </div>

                {/* RIGHT COL: QUESTION & ANSWER OPTIONS (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Question Box */}
                  <div className="bg-sky-50 dark:bg-slate-800/80 p-6 rounded-3xl border-3 border-blue-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between gap-2">
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

                    {/* Question Image Illustration if provided */}
                    {currentQ.imageUrl && (
                      <div className="mt-2 rounded-2xl overflow-hidden border-2 border-blue-200 max-h-40 bg-white flex items-center justify-center">
                        <img
                          src={currentQ.imageUrl}
                          alt="Gambar Pertanyaan"
                          className="max-h-40 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Multiple Choice Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          className={`p-4 rounded-2xl border-3 text-left font-black text-sm transition-all flex items-center gap-3 shadow-sm ${cardStyle}`}
                        >
                          <span className="w-8 h-8 rounded-xl bg-blue-950 text-yellow-300 text-xs font-black flex items-center justify-center shrink-0 border border-yellow-400 shadow-sm">
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
                  {isAnswered && !showWrongModal && (
                    <div className="bg-amber-50 dark:bg-slate-800 p-5 rounded-3xl border-2 border-amber-300 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-950 dark:text-amber-300 uppercase">
                        <HelpCircle className="w-4 h-4" />
                        <span>Pembahasan Soal:</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-bold">
                        {currentQ.explanation || 'Jawaban yang benar telah dikonfirmasi oleh guru pengajar.'}
                      </p>

                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs md:text-sm py-3.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
                      >
                        <span>LANJUT KE SOAL & KEPINGAN BERIKUTNYA</span> →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER SUMMARY WITH COMPLETE PUZZLE */}
          {gameOver && (
            <div className="text-center py-8 max-w-2xl mx-auto space-y-6">
              {/* Fully Revealed Puzzle Image */}
              <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-yellow-300 shadow-2xl bg-slate-900">
                <img
                  src={activePuzzleImage}
                  alt="Gambar Puzzle Selesai Utuh"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-yellow-400 text-blue-950 px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg border border-yellow-200 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> GAMBAR PUZZLE UTUH 100%!
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest bg-amber-100 dark:bg-amber-950/80 px-3.5 py-1 rounded-full border border-amber-300">
                  🎉 SELAMAT! GAMBAR PUZZLE BERHASIL TERBENTUK UTUH!
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white uppercase tracking-tight">
                  TOTAL SKOR: {score}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold">
                  Kamu berhasil menjawab seluruh soal kuis kelas {selectedClass} dan menyusun gambar puzzle dengan sempurna!
                </p>
              </div>

              {/* Performance Stars */}
              <div className="flex items-center justify-center gap-2 bg-sky-50 dark:bg-slate-800 p-4 rounded-2xl border-2 border-blue-200 max-w-sm mx-auto">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce delay-100" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce delay-200" />
              </div>

              <button
                onClick={handleStartGame}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-sm py-4 px-6 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> COBA SUSUN PUZZLE TEMA LAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL JAWABAN SALAH & RETRY GAME OPTION */}
      {showWrongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-rose-400 dark:border-rose-700 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-rose-400 shadow-md mx-auto bg-rose-50">
              <img
                src={mascotThinking}
                alt="Owi Sedih / Berpikir"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider bg-rose-100 dark:bg-rose-950/80 px-3 py-1 rounded-full border border-rose-300">
                ❌ JAWABAN KURANG TEPAT!
              </span>
              <h4 className="text-lg font-black text-blue-950 dark:text-white uppercase pt-1">
                Kepingan Puzzle Ke-{currentQuestionIndex + 1} Belum Terbuka!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {currentQ.explanation || 'Jangan berkecil hati, belajar dari kesalahan akan membuatmu semakin pintar!'}
              </p>
            </div>

            {/* Action Buttons: Retry Question OR Restart Game */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleRetryQuestion}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-3.5 px-4 rounded-xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 uppercase flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-blue-950" /> COBA JAWAB SOAL INI LAGI
              </button>

              <button
                onClick={handleStartGame}
                className="w-full bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-900 dark:text-rose-200 font-black text-xs py-3 px-4 rounded-xl border-2 border-rose-300 uppercase flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> ULANG GAME DARI AWAL
              </button>
            </div>
          </div>
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
