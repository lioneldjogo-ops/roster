import React, { useEffect, useState } from 'react';
import { generateDefaultSchedule, SUBJECTS_MAP } from './data/defaultSchedule';
import { DEFAULT_HOMEWORK, DEFAULT_QUIZ_QUESTIONS } from './data/defaultHomeworkAndQuiz';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import { DEFAULT_ACHIEVEMENTS, DEFAULT_PROGRESS_REPORTS } from './data/defaultStudentReports';
import {
  ClassGroup,
  DayOfWeek,
  HomeworkItem,
  NotificationSettings,
  QuizQuestion,
  ScheduleItem,
  Student,
  UserRole,
  StudentAchievement,
  StudentProgressReport,
} from './types';
import { getCurrentTimeSlot, getDayOfWeekString, playNotificationChime, sendBrowserNotification } from './utils/notification';
import { Header, ActiveTab } from './components/Header';
import { ClassScheduleView } from './components/ClassScheduleView';
import { FullMatrixView } from './components/FullMatrixView';
import { NotificationPanel } from './components/NotificationPanel';
import { ManageSchedulePanel } from './components/ManageSchedulePanel';
import { HomeworkPanel } from './components/HomeworkPanel';
import { TeacherQuizGame } from './components/TeacherQuizGame';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { EditScheduleModal } from './components/EditScheduleModal';
import { PrintRosterModal } from './components/PrintRosterModal';
import { PinAuthModal } from './components/PinAuthModal';
import { ParentPortalView } from './components/ParentPortalView';
import { TeacherReportManager } from './components/TeacherReportManager';
import { StudentManagementView } from './components/StudentManagementView';
import { initAuth } from './lib/firebase';
import { BellRing, Heart } from 'lucide-react';

const LOCAL_STORAGE_KEY_SCHEDULES = 'sdk_teresia_schedules_v1';
const LOCAL_STORAGE_KEY_CLASS = 'sdk_teresia_selected_class';
const LOCAL_STORAGE_KEY_NOTIF = 'sdk_teresia_notif_settings';
const LOCAL_STORAGE_KEY_HOMEWORK = 'sdk_teresia_homework_v1';
const LOCAL_STORAGE_KEY_QUIZ = 'sdk_teresia_quiz_v1';
const LOCAL_STORAGE_KEY_STUDENTS = 'sdk_teresia_students_v1';
const LOCAL_STORAGE_KEY_ROLE = 'sdk_teresia_user_role';
const LOCAL_STORAGE_KEY_TEACHER_AUTH = 'sdk_teresia_teacher_auth';
const LOCAL_STORAGE_KEY_ACHIEVEMENTS = 'sdk_teresia_student_achievements_v1';
const LOCAL_STORAGE_KEY_REPORTS = 'sdk_teresia_student_reports_v1';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('class');

  // 4. User Role & Authentication
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROLE);
      if (saved) return saved as UserRole;
    } catch (e) {}
    return 'student';
  });

  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TEACHER_AUTH);
      if (saved === 'true') return true;
    } catch (e) {}
    return false;
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // 5. Achievements State
  const [achievements, setAchievements] = useState<StudentAchievement[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACHIEVEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isOldDefault = parsed.some((a: any) => a.id === 'ach-1' || a.id === 'ach-4');
          if (!isOldDefault) return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_ACHIEVEMENTS;
  });

  // 6. Progress Reports State
  const [progressReports, setProgressReports] = useState<StudentProgressReport[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isOldDefault = parsed.some((r: any) => r.id === 'rep-std-1a-01');
          if (!isOldDefault) return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_PROGRESS_REPORTS;
  });

  // 7. Homework State
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HOMEWORK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {}
    return DEFAULT_HOMEWORK;
  });

  // 8. Quiz Questions State
  const [quizList, setQuizList] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZ);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {}
    return DEFAULT_QUIZ_QUESTIONS;
  });

  // 9. Students Roster State
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isOldDefault = parsed.some((s: any) => s.id === 'std-1a-01' || s.id === 'std-5a-01');
          if (!isOldDefault) return parsed;
        }
      }
    } catch (err) {}
    return DEFAULT_STUDENTS;
  });

  // 10. Google OAuth Auth State
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    initAuth(
      (user, token) => {
        setUserToken(token);
        setUserEmail(user.email);
      },
      () => {
        setUserToken(null);
        setUserEmail(null);
      }
    );
  }, []);

  // 11. Notification Settings
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

  // 12. Time & Day State
  const [currentDay, setCurrentDay] = useState<DayOfWeek | null>(() =>
    getDayOfWeekString(new Date().getDay())
  );
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  // Active period status
  const [activePeriod, setActivePeriod] = useState<ReturnType<typeof getCurrentTimeSlot>>(null);
  const [lastNotifiedSlotId, setLastNotifiedSlotId] = useState<number | null>(null);

  // Modal Schedule Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrintRosterModalOpen, setIsPrintRosterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [modalDefaultClass, setModalDefaultClass] = useState<ClassGroup>('1A');
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>('Senin');

  // Persistence to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    } catch (e) {}
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HOMEWORK, JSON.stringify(homeworkList));
    } catch (e) {}
  }, [homeworkList]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZ, JSON.stringify(quizList));
    } catch (e) {}
  }, [quizList]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {}
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(progressReports));
    } catch (e) {}
  }, [progressReports]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLASS, selectedClass);
    } catch (e) {}
  }, [selectedClass]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ROLE, userRole);
    } catch (e) {}
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TEACHER_AUTH, isTeacherAuthenticated ? 'true' : 'false');
    } catch (e) {}
  }, [isTeacherAuthenticated]);

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

  // Role Selection Handler
  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'parent') {
      if (activeTab === 'students' || activeTab === 'manage' || activeTab === 'teacher_reports') {
        setActiveTab('parent_portal');
      }
    } else if (role === 'student' && (activeTab === 'parent_portal' || activeTab === 'teacher_reports' || activeTab === 'students' || activeTab === 'manage')) {
      setActiveTab('class');
    }
  };

  const handleTeacherPinSuccess = () => {
    setIsTeacherAuthenticated(true);
    setUserRole('teacher');
    setIsPinModalOpen(false);
  };

  const handleLogoutTeacher = () => {
    setIsTeacherAuthenticated(false);
    setUserRole('student');
    if (activeTab === 'manage' || activeTab === 'teacher_reports' || activeTab === 'students') {
      setActiveTab('class');
    }
  };

  // Homeroom teacher provider
  const getHomeroomTeacherName = (cls: ClassGroup) => {
    return 'Belum Ditentukan';
  };

  // Achievements & Progress Reports Handlers
  const handleAddAchievement = (ach: Omit<StudentAchievement, 'id'>) => {
    const newAch: StudentAchievement = {
      ...ach,
      id: `ach-${Date.now()}`,
    };
    setAchievements((prev) => [newAch, ...prev]);
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveProgressReport = (rep: StudentProgressReport) => {
    setProgressReports((prev) => {
      const idx = prev.findIndex(
        (r) => r.id === rep.id || (r.studentId === rep.studentId && r.classGroup === rep.classGroup)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rep;
        return copy;
      }
      return [...prev, rep];
    });
  };

  // Homework Handlers
  const handleAddHomework = (hw: Omit<HomeworkItem, 'id' | 'createdAt' | 'completed'>) => {
    const newItem: HomeworkItem = {
      ...hw,
      id: `hw-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setHomeworkList((prev) => [newItem, ...prev]);
  };

  const handleToggleHomeworkComplete = (id: string) => {
    setHomeworkList((prev) =>
      prev.map((hw) => (hw.id === id ? { ...hw, completed: !hw.completed } : hw))
    );
  };

  const handleDeleteHomework = (id: string) => {
    setHomeworkList((prev) => prev.filter((hw) => hw.id !== id));
  };

  const handleToggleStudentHomework = (homeworkId: string, studentId: string, studentName: string) => {
    setHomeworkList((prev) =>
      prev.map((hw) => {
        if (hw.id !== homeworkId) return hw;
        const currentByStudents = hw.completedByStudents || [];
        const exists = currentByStudents.some((s) => s.studentId === studentId);

        let updatedList;
        if (exists) {
          updatedList = currentByStudents.filter((s) => s.studentId !== studentId);
        } else {
          updatedList = [
            ...currentByStudents,
            { studentId, studentName, completedAt: new Date().toISOString() },
          ];
        }

        return {
          ...hw,
          completedByStudents: updatedList,
        };
      })
    );
  };

  const handleAddStudent = (name: string, classGroup: ClassGroup, nim?: string) => {
    const newStudent: Student = {
      id: `std-${classGroup.toLowerCase()}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      classGroup,
      name,
      nim,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleSaveClassRoster = (classGroup: ClassGroup, newClassStudents: Student[]) => {
    setStudents((prev) => {
      const otherClassesStudents = prev.filter((s) => s.classGroup !== classGroup);
      return [...otherClassesStudents, ...newClassStudents];
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Quiz Handlers
  const handleAddQuizQuestion = (q: Omit<QuizQuestion, 'id'>) => {
    const newQuestion: QuizQuestion = {
      ...q,
      id: `quiz-${Date.now()}`,
    };
    setQuizList((prev) => [...prev, newQuestion]);
  };

  const handleDeleteQuizQuestion = (id: string) => {
    setQuizList((prev) => prev.filter((q) => q.id !== id));
  };

  // Schedule Handlers
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

  // Active subject info
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
        {/* Top Header */}
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
          onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
          isLoggedInGoogle={Boolean(userToken)}
          userRole={userRole}
          onSelectRole={handleSelectRole}
          isTeacherAuthenticated={isTeacherAuthenticated}
          onOpenPinModal={() => setIsPinModalOpen(true)}
          onLogoutTeacher={handleLogoutTeacher}
          onOpenPrintRoster={() => setIsPrintRosterModalOpen(true)}
        />

        {/* Active Class Ticker Bar */}
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

        {/* Main Content Views */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'class' && (
            <ClassScheduleView
              selectedClass={selectedClass}
              schedules={schedules}
              currentDay={currentDay}
              onEditItem={handleOpenEdit}
              onDeleteItem={handleDeleteScheduleItem}
              onAddNewItem={(c, d) => handleOpenAddNew(c, d)}
              onOpenPrintRoster={() => setIsPrintRosterModalOpen(true)}
            />
          )}

          {activeTab === 'students' && (
            userRole === 'teacher' ? (
              <StudentManagementView
                students={students}
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onSaveClassRoster={handleSaveClassRoster}
                onOpenPrintRoster={() => setIsPrintRosterModalOpen(true)}
              />
            ) : (
              <div className="bg-amber-50 border-4 border-amber-400 rounded-3xl p-8 text-center space-y-4 my-8">
                <div className="w-16 h-16 bg-amber-400 text-blue-950 rounded-2xl flex items-center justify-center font-black mx-auto text-2xl shadow-md">
                  🔒
                </div>
                <h2 className="text-xl font-black text-blue-950 uppercase">
                  Akses Terbatas: Menu Tambah & Data Murid Khusus Guru
                </h2>
                <p className="text-sm font-bold text-slate-700 max-w-md mx-auto">
                  Menu pendaftaran dan pengelola data murid hanya dapat diakses melalui mode Sisi Guru & Sekolah.
                </p>
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs px-6 py-3 rounded-2xl border-2 border-amber-300 shadow-[3px_3px_0px_#1e3a8a] uppercase"
                >
                  Masuk Ke Sisi Guru & Sekolah
                </button>
              </div>
            )
          )}

          {activeTab === 'parent_portal' && (
            <ParentPortalView
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              students={students}
              homeworkList={homeworkList}
              achievements={achievements}
              progressReports={progressReports}
              homeroomTeacher={getHomeroomTeacherName(selectedClass)}
              onToggleStudentHomework={handleToggleStudentHomework}
              onOpenPrintRoster={() => setIsPrintRosterModalOpen(true)}
            />
          )}

          {activeTab === 'teacher_reports' && isTeacherAuthenticated && (
            <TeacherReportManager
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              students={students}
              achievements={achievements}
              progressReports={progressReports}
              onAddAchievement={handleAddAchievement}
              onDeleteAchievement={handleDeleteAchievement}
              onSaveProgressReport={handleSaveProgressReport}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onSaveClassRoster={handleSaveClassRoster}
            />
          )}

          {activeTab === 'matrix' && (
            <FullMatrixView
              schedules={schedules}
              currentDay={currentDay}
              onSelectClass={setSelectedClass}
              onEditItem={handleOpenEdit}
              onOpenPrintRoster={() => setIsPrintRosterModalOpen(true)}
            />
          )}

          {activeTab === 'homework' && (
            <HomeworkPanel
              homeworkList={homeworkList}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              onAddHomework={handleAddHomework}
              onToggleComplete={handleToggleHomeworkComplete}
              onDeleteHomework={handleDeleteHomework}
              onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
              isLoggedInGoogle={Boolean(userToken)}
              userEmail={userEmail || undefined}
              students={students}
              onAddStudent={handleAddStudent}
              onSaveClassRoster={handleSaveClassRoster}
              onDeleteStudent={handleDeleteStudent}
              onToggleStudentHomework={handleToggleStudentHomework}
            />
          )}

          {activeTab === 'quiz' && (
            <TeacherQuizGame
              quizList={quizList}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              onAddQuestion={handleAddQuizQuestion}
              onDeleteQuestion={handleDeleteQuizQuestion}
              onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
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

      {/* Pin Auth Modal */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleTeacherPinSuccess}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveScheduleItem}
        onDelete={handleDeleteScheduleItem}
        defaultClassGroup={modalDefaultClass}
        defaultDay={modalDefaultDay}
      />

      {/* Print Roster Modal */}
      <PrintRosterModal
        isOpen={isPrintRosterModalOpen}
        onClose={() => setIsPrintRosterModalOpen(false)}
        schedules={schedules}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        schedules={schedules}
        homeworkList={homeworkList}
        quizList={quizList}
        students={students}
        onUpdateHomeworkList={setHomeworkList}
        onUpdateQuizList={setQuizList}
        onUpdateScheduleList={setSchedules}
        onUpdateStudentList={setStudents}
        userToken={userToken}
        userEmail={userEmail}
        onAuthChanged={(token, email) => {
          setUserToken(token);
          setUserEmail(email);
        }}
      />

      {/* Footer */}
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
              <p className="text-[11px] text-blue-800 font-bold">Jadwal Pelajaran, PR, Game Kuis & Portal Orang Tua</p>
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
