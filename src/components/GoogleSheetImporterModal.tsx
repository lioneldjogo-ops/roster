import React, { useState } from 'react';
import { ClassGroup, DayOfWeek, ScheduleItem } from '../types';
import { SUBJECTS_MAP } from '../data/defaultSchedule';
import { FileSpreadsheet, X, Download, Check, AlertCircle, RefreshCw, Copy, ExternalLink, Link as LinkIcon, Table } from 'lucide-react';

interface GoogleSheetImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSchedules: (items: ScheduleItem[], replaceExisting: boolean) => void;
  currentScheduleCount: number;
}

// Lightweight CSV/TSV Parser
function parseCSVorTSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  return lines.map((line) => {
    if (line.includes('\t')) {
      return line.split('\t').map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
    }
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(cur.trim().replace(/^["']|["']$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim().replace(/^["']|["']$/g, ''));
    return cells;
  });
}

// Convert Google Sheet URL to direct CSV URL
function extractGoogleSheetCsvUrl(urlOrId: string): { csvUrl: string; sheetId: string; gid: string } | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // Case 1: Published Google Sheet URL (pub?output=csv)
  if (trimmed.includes('pub?') && (trimmed.includes('output=csv') || trimmed.includes('output=tsv'))) {
    return { csvUrl: trimmed, sheetId: 'pub', gid: '0' };
  }

  // Case 2: Standard Google Sheet URL
  const sheetIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = sheetIdMatch ? sheetIdMatch[1] : (trimmed.length > 20 && !trimmed.includes('/') ? trimmed : null);

  if (!sheetId) return null;

  // Extract GID if present
  let gid = '0';
  const gidMatch = trimmed.match(/gid=([0-9]+)/);
  if (gidMatch) {
    gid = gidMatch[1];
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  return { csvUrl, sheetId, gid };
}

export const GoogleSheetImporterModal: React.FC<GoogleSheetImporterModalProps> = ({
  isOpen,
  onClose,
  onImportSchedules,
  currentScheduleCount,
}) => {
  const [activeSourceTab, setActiveSourceTab] = useState<'url' | 'paste'>('url');
  const [sheetUrl, setSheetUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(true);

  // Status & Preview
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ScheduleItem[] | null>(null);
  const [previewLog, setPreviewLog] = useState<{ total: number; valid: number; skipped: number }>({
    total: 0,
    valid: 0,
    skipped: 0,
  });

  if (!isOpen) return null;

  // Map raw row arrays to ScheduleItems
  const processRawRows = (rows: string[][]): ScheduleItem[] => {
    if (rows.length === 0) return [];

    let headerIndex = -1;
    let colClass = 0;
    let colDay = 1;
    let colSlot = 2;
    let colSubject = 3;
    let colTeacher = 4;
    let colNotes = 5;

    // Detect header
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const rowUpper = rows[r].map((c) => c.toUpperCase());
      const hasClass = rowUpper.some((c) => c.includes('KELAS') || c.includes('CLASS'));
      const hasDay = rowUpper.some((c) => c.includes('HARI') || c.includes('DAY'));
      const hasSubject = rowUpper.some((c) => c.includes('MAPEL') || c.includes('SUBJECT') || c.includes('MATA'));

      if (hasClass || hasDay || hasSubject) {
        headerIndex = r;
        rowUpper.forEach((cellText, idx) => {
          if (cellText.includes('KELAS') || cellText.includes('CLASS')) colClass = idx;
          if (cellText.includes('HARI') || cellText.includes('DAY')) colDay = idx;
          if (cellText.includes('JAM') || cellText.includes('SLOT') || cellText.includes('WAKTU')) colSlot = idx;
          if (cellText.includes('MAPEL') || cellText.includes('SUBJECT') || cellText.includes('MATA') || cellText.includes('KODE')) colSubject = idx;
          if (cellText.includes('GURU') || cellText.includes('PENGAJAR') || cellText.includes('TEACHER')) colTeacher = idx;
          if (cellText.includes('CATATAN') || cellText.includes('RUANG') || cellText.includes('NOTES')) colNotes = idx;
        });
        break;
      }
    }

    const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows;
    const items: ScheduleItem[] = [];
    const validClasses: ClassGroup[] = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
    const validDays: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    let validCount = 0;
    let skippedCount = 0;

    dataRows.forEach((row, idx) => {
      if (row.length < 3) {
        skippedCount++;
        return;
      }

      // 1. Extract Class
      const rawClass = (row[colClass] || '1A').trim().toUpperCase().replace(/\s+/g, '');
      const matchedClass = validClasses.find((c) => c === rawClass) || '1A';

      // 2. Extract Day
      const rawDay = (row[colDay] || 'Senin').trim();
      let matchedDay: DayOfWeek = 'Senin';
      const dayLower = rawDay.toLowerCase();
      if (dayLower.includes('senin') || dayLower.includes('mon')) matchedDay = 'Senin';
      else if (dayLower.includes('selasa') || dayLower.includes('tue')) matchedDay = 'Selasa';
      else if (dayLower.includes('rabu') || dayLower.includes('wed')) matchedDay = 'Rabu';
      else if (dayLower.includes('kamis') || dayLower.includes('thu')) matchedDay = 'Kamis';
      else if (dayLower.includes('jumat') || dayLower.includes('fri')) matchedDay = 'Jumat';
      else if (dayLower.includes('sabtu') || dayLower.includes('sat')) matchedDay = 'Sabtu';

      // 3. Extract Slot (1 to 7)
      const rawSlot = (row[colSlot] || '1').trim();
      const slotNumMatch = rawSlot.match(/\d+/);
      let slotId = slotNumMatch ? parseInt(slotNumMatch[0], 10) : 1;
      if (slotId < 1) slotId = 1;
      if (slotId > 7) slotId = 7;

      // 4. Extract Subject Code
      const rawSubject = (row[colSubject] || 'B.INDONESIA').trim().toUpperCase();
      let matchedSubjectCode = 'B.INDONESIA';

      // Find match in SUBJECTS_MAP
      const mapKey = Object.keys(SUBJECTS_MAP).find((key) => {
        const sub = SUBJECTS_MAP[key];
        return (
          key.toUpperCase() === rawSubject ||
          sub.fullName.toUpperCase().includes(rawSubject) ||
          rawSubject.includes(sub.code.toUpperCase())
        );
      });

      if (mapKey) {
        matchedSubjectCode = mapKey;
      } else {
        if (rawSubject.includes('AGAMA')) matchedSubjectCode = 'AGAMA';
        else if (rawSubject.includes('INDONESIA')) matchedSubjectCode = 'B.INDONESIA';
        else if (rawSubject.includes('MATH') || rawSubject.includes('MATEMATIKA')) matchedSubjectCode = 'MATEMATIKA';
        else if (rawSubject.includes('IPAS') || rawSubject.includes('Sains')) matchedSubjectCode = 'IPAS';
        else if (rawSubject.includes('PJOK') || rawSubject.includes('OLAHRAGA')) matchedSubjectCode = 'PJOK';
        else if (rawSubject.includes('INGGRIS') || rawSubject.includes('ENGLISH')) matchedSubjectCode = 'B.INGGRIS';
        else if (rawSubject.includes('PANCASILA') || rawSubject.includes('PPKN')) matchedSubjectCode = 'PENDIDIKAN PANCASILA';
        else if (rawSubject.includes('SBDP') || rawSubject.includes('SENI')) matchedSubjectCode = 'SBDP';
        else if (rawSubject.includes('EK') || rawSubject.includes('EKSTRA')) matchedSubjectCode = 'EK';
        else if (rawSubject.includes('UPACARA')) matchedSubjectCode = 'UPACARA BENDERA';
        else if (rawSubject.includes('LITERASI')) matchedSubjectCode = 'LITERASI DAN NUMERASI';
      }

      // 5. Teacher & Notes
      const teacherName = row[colTeacher]?.trim() || SUBJECTS_MAP[matchedSubjectCode]?.teacherDefault || 'Guru Pengajar';
      const notes = row[colNotes]?.trim() || `Ruang Kelas ${matchedClass}`;

      items.push({
        id: `gsheet-${matchedClass}-${matchedDay}-${slotId}-${idx}`,
        classGroup: matchedClass,
        day: matchedDay,
        slotId: slotId,
        subjectCode: matchedSubjectCode,
        teacherName: teacherName,
        room: `Ruang Kelas ${matchedClass}`,
        notes: notes,
      });

      validCount++;
    });

    setPreviewLog({
      total: dataRows.length,
      valid: validCount,
      skipped: skippedCount,
    });

    return items;
  };

  // Process URL Fetch
  const handleFetchFromUrl = async () => {
    setErrorMessage(null);
    setParsedItems(null);

    const sheetInfo = extractGoogleSheetCsvUrl(sheetUrl);
    if (!sheetInfo) {
      setErrorMessage('Link / URL Google Sheet tidak valid. Tuliskan link lengkap Google Sheet atau ID Spreadsheet.');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch(sheetInfo.csvUrl);
      if (!resp.ok) {
        throw new Error(`Gagal mengambil data dari Google Sheet (Status ${resp.status}). Pastikan izin spreadsheet disetel ke 'Siapa saja yang memiliki link' atau 'Dipublikasikan ke Web'.`);
      }
      const csvText = await resp.text();
      if (!csvText || csvText.trim().startsWith('<!DOCTYPE html>')) {
        throw new Error('Google Sheet membutuhkan izin akses publik. Buka Google Sheet -> Klik Bagikan (Share) -> Pilih "Siapa saja yang memiliki link" sebagai Pelihat (Viewer), atau gunakan menu Tempel Teks.');
      }

      const rows = parseCSVorTSV(csvText);
      const items = processRawRows(rows);

      if (items.length === 0) {
        setErrorMessage('Tidak ada data jadwal yang dapat dibaca dari Google Sheet tersebut.');
      } else {
        setParsedItems(items);
      }
    } catch (err: any) {
      console.error('Google Sheet Import Error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunduh data Google Sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process Pasted Text
  const handleParsePastedText = () => {
    setErrorMessage(null);
    setParsedItems(null);

    if (!pastedText.trim()) {
      setErrorMessage('Silakan tempelkan (paste) teks tabel dari Google Sheets terlebih dahulu.');
      return;
    }

    const rows = parseCSVorTSV(pastedText);
    const items = processRawRows(rows);

    if (items.length === 0) {
      setErrorMessage('Format teks tidak dikenali. Pastikan menyalin baris tabel dari Google Sheets dengan kolom Kelas, Hari, Jam, dan Mata Pelajaran.');
    } else {
      setParsedItems(items);
    }
  };

  // Execute Final Import
  const handleApplyImport = () => {
    if (!parsedItems || parsedItems.length === 0) return;
    onImportSchedules(parsedItems, replaceExisting);
    onClose();
  };

  // Sample CSV Template Download
  const handleDownloadTemplateCSV = () => {
    const csvContent =
      'Kelas,Hari,JamKe,MataPelajaran,Guru,Catatan\n' +
      '1A,Senin,1,B.INDONESIA,Ibu Maria S.Pd,Ruang Kelas 1A\n' +
      '1A,Senin,2,MATEMATIKA,Ibu Maria S.Pd,Bawa Buku Tulis\n' +
      '1A,Senin,3,AGAMA,Bapak Yoseph S.Ag,Bawa Alkitab\n' +
      '2A,Selasa,1,IPAS,Ibu Veronika S.Pd,Alat Gambar\n' +
      '3A,Rabu,1,PJOK,Bapak Stefanus S.Pd,Seragam Olahraga\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Jadwal_SDK_St_Teresia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-4 border-blue-200 dark:border-slate-800 rounded-[32px] max-w-2xl w-full p-6 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col justify-between">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-950 bg-yellow-400 px-3 py-0.5 rounded-full border border-yellow-300">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-950" /> DITENTUKAN OLEH PENGGUNA (MANUAL PULL)
            </span>
            <h3 className="text-xl md:text-2xl font-black text-blue-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              IMPOR DATA DARI GOOGLE SHEETS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-xl">
              Sesuai pilihan Anda: Jadwal <span className="text-blue-600 underline">bukan tersinkronisasi otomatis</span>, melainkan ditentukan dan ditarik saat Anda menekan tombol di bawah.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Source Selector Tabs */}
          <div className="flex items-center gap-2 p-1 bg-sky-50 dark:bg-slate-800 rounded-2xl border-2 border-blue-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveSourceTab('url');
                setParsedItems(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                activeSourceTab === 'url'
                  ? 'bg-yellow-400 text-blue-950 shadow-[2px_2px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-900'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              1. Link / URL Google Sheet
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSourceTab('paste');
                setParsedItems(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                activeSourceTab === 'paste'
                  ? 'bg-yellow-400 text-blue-950 shadow-[2px_2px_0px_#1e3a8a] border-2 border-yellow-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-900'
              }`}
            >
              <Table className="w-4 h-4" />
              2. Tempel Teks dari Sheet
            </button>
          </div>

          {/* TAB 1: URL Input */}
          {activeSourceTab === 'url' && (
            <div className="space-y-3 bg-sky-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-blue-100 dark:border-slate-700">
              <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase">
                Masukkan Link Google Sheet:
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit#gid=0"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs font-bold py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                <span>*Pastikan akses Spreadsheet disetel ke "Siapa saja yang memiliki link".</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCSV}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-black uppercase"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Contoh Template CSV
                </button>
              </div>

              <button
                type="button"
                disabled={isLoading || !sheetUrl.trim()}
                onClick={handleFetchFromUrl}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs py-3 px-4 rounded-2xl border-2 border-blue-700 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> MENGUNDUH DATA SHEET...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> TENTUKAN & BACA DATA DARI LINK SHEET
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Paste Text Area */}
          {activeSourceTab === 'paste' && (
            <div className="space-y-3 bg-sky-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-blue-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-blue-950 dark:text-slate-200 block uppercase">
                  Salin & Tempel Baris Tabel Google Sheet:
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCSV}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-black uppercase"
                >
                  <Download className="w-3.5 h-3.5" /> Template File
                </button>
              </div>
              <textarea
                rows={5}
                placeholder={`Contoh tempelkan teks dari Google Sheets:\nKelas\tHari\tJamKe\tMataPelajaran\tGuru\tCatatan\n1A\tSenin\t1\tB.INDONESIA\tIbu Maria S.Pd\tRuang Kelas 1A\n1A\tSenin\t2\tMATEMATIKA\tIbu Maria S.Pd\tBawa Buku Tulis`}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs font-mono font-bold py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <button
                type="button"
                disabled={!pastedText.trim()}
                onClick={handleParsePastedText}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs py-3 px-4 rounded-2xl border-2 border-blue-700 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <Check className="w-4 h-4" /> PROSES & PARSE TEKS YANG DITEMPEL
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-400 text-rose-900 dark:text-rose-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-bold space-y-1">
                <p className="font-black uppercase">Gagal Membaca Data:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Preview Results & Confirmation */}
          {parsedItems && parsedItems.length > 0 && (
            <div className="space-y-4 bg-green-50 dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-green-400 shadow-inner animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-green-300 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-700 dark:text-green-400" />
                  <span className="text-sm font-black text-green-950 dark:text-green-300 uppercase">
                    Berhasil Membaca {parsedItems.length} Sesi Jam Pelajaran!
                  </span>
                </div>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full font-black">
                  Siap Diimpor
                </span>
              </div>

              {/* Preview List Sample */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {parsedItems.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-green-200 dark:border-slate-700 font-bold"
                  >
                    <span>
                      <strong className="text-blue-900 dark:text-blue-300">Kelas {item.classGroup}</strong> • {item.day} (Jam {item.slotId})
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-black">
                      {SUBJECTS_MAP[item.subjectCode]?.fullName || item.subjectCode} ({item.teacherName})
                    </span>
                  </div>
                ))}
                {parsedItems.length > 5 && (
                  <p className="text-[11px] text-center text-slate-500 font-bold italic pt-1">
                    ...dan {parsedItems.length - 5} baris jam pelajaran lainnya.
                  </p>
                )}
              </div>

              {/* Mode Selection: Replace vs Append */}
              <div className="pt-2 border-t border-green-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase">
                  Pilih Metode Penyimpanan Jadwal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                  <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 transition-all ${
                    replaceExisting ? 'bg-yellow-400 text-blue-950 border-yellow-300 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                      className="accent-blue-900"
                    />
                    <span>Timpa Seluruh Jadwal Lama ({currentScheduleCount} Sesi)</span>
                  </label>

                  <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 transition-all ${
                    !replaceExisting ? 'bg-yellow-400 text-blue-950 border-yellow-300 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                      className="accent-blue-900"
                    />
                    <span>Tambahkan ke Jadwal yang Ada</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2.5 rounded-2xl uppercase"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!parsedItems || parsedItems.length === 0}
            onClick={handleApplyImport}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-blue-950 font-black text-xs px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
          >
            <Check className="w-4 h-4 text-blue-950" />
            TENTUKAN & TERAPKAN JADWAL SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};
