import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface VisitLog {
  id?: string;
  timestamp: number;
  formattedTime: string;
  dateStr: string;
  role: 'student' | 'parent' | 'teacher';
  activeTab: string;
  selectedClass: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  userAgent: string;
  sessionId: string;
  path?: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  todayVisits: number;
  uniqueSessions: number;
  lastVisitTime: string;
  roleBreakdown: Record<string, number>;
  classBreakdown: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  recentLogs: VisitLog[];
}

const LOCAL_ANALYTICS_KEY = 'sdk_teresia_dev_analytics_logs_v1';
const LOCAL_SUMMARY_KEY = 'sdk_teresia_dev_analytics_summary_v1';

// Get or generate session ID for current browser session
function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('sdk_teresia_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('sdk_teresia_session_id', sid);
    }
    return sid;
  } catch {
    return 'sess_anon_' + Date.now();
  }
}

// Detect device type
function detectDeviceType(): 'Mobile' | 'Tablet' | 'Desktop' {
  if (typeof window === 'undefined' || !navigator) return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      navigator.userAgent
    )
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Format Date string: YYYY-MM-DD
function getTodayDateStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Helper to load local logs
function getLocalLogs(): VisitLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local analytics:', e);
  }
  return [];
}

// Helper to save local logs
function saveLocalLog(log: VisitLog) {
  try {
    const existing = getLocalLogs();
    const updated = [log, ...existing].slice(0, 200); // Keep last 200 logs
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving local analytics:', e);
  }
}

// Compute Summary from logs
export function computeSummaryFromLogs(logs: VisitLog[]): AnalyticsSummary {
  const todayStr = getTodayDateStr();
  const sessions = new Set<string>();
  const roleBreakdown: Record<string, number> = { student: 0, parent: 0, teacher: 0 };
  const classBreakdown: Record<string, number> = {};
  const deviceBreakdown: Record<string, number> = { Mobile: 0, Tablet: 0, Desktop: 0 };
  let todayCount = 0;

  logs.forEach((log) => {
    sessions.add(log.sessionId);
    if (log.dateStr === todayStr) {
      todayCount++;
    }

    if (log.role) {
      roleBreakdown[log.role] = (roleBreakdown[log.role] || 0) + 1;
    }
    if (log.selectedClass) {
      classBreakdown[log.selectedClass] = (classBreakdown[log.selectedClass] || 0) + 1;
    }
    if (log.deviceType) {
      deviceBreakdown[log.deviceType] = (deviceBreakdown[log.deviceType] || 0) + 1;
    }
  });

  return {
    totalVisits: logs.length,
    todayVisits: todayCount,
    uniqueSessions: sessions.size,
    lastVisitTime: logs[0] ? logs[0].formattedTime : '-',
    roleBreakdown,
    classBreakdown,
    deviceBreakdown,
    recentLogs: logs,
  };
}

/**
 * Record a visit/pageview to both Firestore and LocalStorage
 */
export async function recordVisit(
  role: 'student' | 'parent' | 'teacher',
  activeTab: string,
  selectedClass: string
): Promise<void> {
  const now = new Date();
  const timestamp = now.getTime();
  const formattedTime = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const dateStr = getTodayDateStr();
  const deviceType = detectDeviceType();
  const sessionId = getSessionId();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  const newLog: VisitLog = {
    timestamp,
    formattedTime,
    dateStr,
    role,
    activeTab,
    selectedClass,
    deviceType,
    userAgent,
    sessionId,
  };

  // 1. Always save to Local Storage
  saveLocalLog(newLog);

  // 2. Save to Firestore
  try {
    const logsRef = collection(db, 'visit_logs');
    await addDoc(logsRef, {
      ...newLog,
      serverTime: serverTimestamp(),
    });

    // Increment overall summary counter doc
    const summaryRef = doc(db, 'app_analytics', 'summary');
    await setDoc(
      summaryRef,
      {
        totalVisits: increment(1),
        lastVisitTime: formattedTime,
        lastRole: role,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    // Non-blocking: If offline or permissions restricted, fallback silently
    console.log('Analytics saved to local cache (Firestore sync status):', err);
  }
}

/**
 * Subscribe to realtime analytics updates (combines Firestore logs and local logs)
 */
export function subscribeAnalytics(onChange: (summary: AnalyticsSummary) => void) {
  // First emit local summary immediately
  const localLogs = getLocalLogs();
  onChange(computeSummaryFromLogs(localLogs));

  // Try subscribing to Firestore visit_logs collection
  try {
    const q = query(collection(db, 'visit_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreLogs: VisitLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreLogs.push({
            id: docSnap.id,
            timestamp: data.timestamp || Date.now(),
            formattedTime: data.formattedTime || '',
            dateStr: data.dateStr || getTodayDateStr(),
            role: data.role || 'student',
            activeTab: data.activeTab || 'class',
            selectedClass: data.selectedClass || '1A',
            deviceType: data.deviceType || 'Desktop',
            userAgent: data.userAgent || '',
            sessionId: data.sessionId || 'sess_unknown',
          });
        });

        if (firestoreLogs.length > 0) {
          onChange(computeSummaryFromLogs(firestoreLogs));
        }
      },
      (error) => {
        console.warn('Firestore analytics subscription notice:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore analytics subscription error:', err);
    return () => {};
  }
}

/**
 * Reset local analytics logs
 */
export function clearLocalAnalyticsLogs(): void {
  try {
    localStorage.removeItem(LOCAL_ANALYTICS_KEY);
  } catch (e) {
    console.error(e);
  }
}
