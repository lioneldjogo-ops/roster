import { HomeworkItem, QuizQuestion, ScheduleItem, Student } from '../types';

export interface GoogleSpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

// 1. Create a brand new Google Sheet with Jadwal, TugasRumah, GameKuis, and DaftarSiswa sheets
export async function createOfficialSpreadsheet(
  accessToken: string,
  title: string = 'Jadwal & Tugas SDK St. Teresia Danga'
): Promise<GoogleSpreadsheetInfo> {
  const body = {
    properties: {
      title: title,
    },
    sheets: [
      {
        properties: {
          title: 'Jadwal',
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'TugasRumah',
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'GameKuis',
          gridProperties: { rowCount: 100, columnCount: 12 },
        },
      },
      {
        properties: {
          title: 'DaftarSiswa',
          gridProperties: { rowCount: 300, columnCount: 10 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat Google Sheet: ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl;

  // Insert Header Rows for each tab
  await updateSheetValues(accessToken, spreadsheetId, 'Jadwal!A1:F1', [
    ['Kelas', 'Hari', 'JamKe', 'MataPelajaran', 'Guru', 'Catatan'],
  ]);

  await updateSheetValues(accessToken, spreadsheetId, 'TugasRumah!A1:H1', [
    ['ID', 'Kelas', 'MataPelajaran', 'JudulTugas', 'Deskripsi', 'TglTenggat', 'Guru', 'Selesai'],
  ]);

  await updateSheetValues(accessToken, spreadsheetId, 'GameKuis!A1:K1', [
    [
      'ID',
      'Kelas',
      'MataPelajaran',
      'Pertanyaan',
      'OpsiA',
      'OpsiB',
      'OpsiC',
      'OpsiD',
      'IndexJawabanBenar(0-3)',
      'Penjelasan',
      'Guru',
    ],
  ]);

  await updateSheetValues(accessToken, spreadsheetId, 'DaftarSiswa!A1:E1', [
    ['ID', 'Kelas', 'NamaSiswa', 'NIM_NISN', 'NoAbsen'],
  ]);

  return { spreadsheetId, spreadsheetUrl, title };
}

// Helper: Update exact range of values
export async function updateSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal memperbarui Google Sheet (${range}): ${err}`);
  }
}

// Helper: Clear range
export async function clearSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:clear`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal menghapus area Google Sheet (${range}): ${err}`);
  }
}

// Helper: Append rows
export async function appendSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal menambahkan baris ke Google Sheet (${range}): ${err}`);
  }
}

// Helper: Read values from range
export async function fetchSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal membaca data dari Google Sheet (${range}): ${err}`);
  }

  const data = await response.json();
  return data.values || [];
}

// Sync All Schedules to Google Sheets
export async function syncScheduleToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  schedules: ScheduleItem[]
) {
  // Clear existing Jadwal starting from row 2
  await clearSheetValues(accessToken, spreadsheetId, 'Jadwal!A2:F1000');

  const rows = schedules.map((s) => [
    s.classGroup,
    s.day,
    s.slotId,
    s.subjectCode,
    s.teacherName || '',
    s.notes || '',
  ]);

  if (rows.length > 0) {
    await updateSheetValues(accessToken, spreadsheetId, `Jadwal!A2:F${1 + rows.length}`, rows);
  }
}

// Sync All Homework to Google Sheets
export async function syncHomeworkToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  homeworkList: HomeworkItem[]
) {
  await clearSheetValues(accessToken, spreadsheetId, 'TugasRumah!A2:H1000');

  const rows = homeworkList.map((hw) => [
    hw.id,
    hw.classGroup,
    hw.subjectCode,
    hw.title,
    hw.description,
    hw.dueDate,
    hw.teacherName,
    hw.completed ? 'SELESAI' : 'BELUM',
  ]);

  if (rows.length > 0) {
    await updateSheetValues(accessToken, spreadsheetId, `TugasRumah!A2:H${1 + rows.length}`, rows);
  }
}

// Sync All Quiz Questions to Google Sheets
export async function syncQuizToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  quizList: QuizQuestion[]
) {
  await clearSheetValues(accessToken, spreadsheetId, 'GameKuis!A2:K1000');

  const rows = quizList.map((q) => [
    q.id,
    q.classGroup,
    q.subjectCode,
    q.question,
    q.options[0] || '',
    q.options[1] || '',
    q.options[2] || '',
    q.options[3] || '',
    q.correctAnswerIndex,
    q.explanation || '',
    q.teacherName || '',
  ]);

  if (rows.length > 0) {
    await updateSheetValues(accessToken, spreadsheetId, `GameKuis!A2:K${1 + rows.length}`, rows);
  }
}

// Read Homework List from Google Sheets
export async function loadHomeworkFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<HomeworkItem[]> {
  const rows = await fetchSheetValues(accessToken, spreadsheetId, 'TugasRumah!A2:H1000');
  return rows.map((row, idx) => ({
    id: row[0] || `hw-gsheet-${idx}`,
    classGroup: (row[1] || '1A').trim() as any,
    subjectCode: row[2] || 'B.INDONESIA',
    title: row[3] || 'Tugas Rumah',
    description: row[4] || '',
    dueDate: row[5] || 'Besok',
    teacherName: row[6] || 'Guru Pengajar',
    completed: (row[7] || '').toUpperCase() === 'SELESAI',
    createdAt: new Date().toISOString(),
  }));
}

// Read Quiz List from Google Sheets
export async function loadQuizFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<QuizQuestion[]> {
  const rows = await fetchSheetValues(accessToken, spreadsheetId, 'GameKuis!A2:K1000');
  return rows.map((row, idx) => ({
    id: row[0] || `quiz-gsheet-${idx}`,
    classGroup: (row[1] || '1A').trim() as any,
    subjectCode: row[2] || 'B.INDONESIA',
    question: row[3] || 'Pertanyaan Kuis',
    options: [row[4] || 'A', row[5] || 'B', row[6] || 'C', row[7] || 'D'],
    correctAnswerIndex: parseInt(row[8] || '0', 10),
    explanation: row[9] || '',
    teacherName: row[10] || 'Guru Pengajar',
  }));
}

// Sync All Students to Google Sheets
export async function syncStudentsToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  students: Student[]
) {
  await clearSheetValues(accessToken, spreadsheetId, 'DaftarSiswa!A2:E1000');

  const rows = students.map((s, idx) => [
    s.id,
    s.classGroup,
    s.name,
    s.nim || '',
    s.attendanceNo || idx + 1,
  ]);

  if (rows.length > 0) {
    await updateSheetValues(accessToken, spreadsheetId, `DaftarSiswa!A2:E${1 + rows.length}`, rows);
  }
}

// Read Student List from Google Sheets
export async function loadStudentsFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Student[]> {
  const rows = await fetchSheetValues(accessToken, spreadsheetId, 'DaftarSiswa!A2:E1000');
  return rows.map((row, idx) => ({
    id: row[0] || `std-gsheet-${idx}`,
    classGroup: (row[1] || '1A').trim() as any,
    name: row[2] || 'Nama Murid',
    nim: row[3] || '',
    attendanceNo: parseInt(row[4] || `${idx + 1}`, 10) || idx + 1,
  }));
}

