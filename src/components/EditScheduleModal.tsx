import React, { useState } from 'react';
import { ALL_CLASSES, ALL_DAYS, SUBJECTS_MAP, TIME_SLOTS } from '../data/defaultSchedule';
import { ClassGroup, DayOfWeek, ScheduleItem } from '../types';
import { X, Save, Trash2, BookOpen, Clock, User, DoorOpen, FileText } from 'lucide-react';

interface EditScheduleModalProps {
  item: ScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedItem: ScheduleItem) => void;
  onDelete?: (itemId: string) => void;
  defaultClassGroup?: ClassGroup;
  defaultDay?: DayOfWeek;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultClassGroup = '1A',
  defaultDay = 'Senin',
}) => {
  if (!isOpen) return null;

  const [classGroup, setClassGroup] = useState<ClassGroup>(
    item?.classGroup || defaultClassGroup
  );
  const [day, setDay] = useState<DayOfWeek>(item?.day || defaultDay);
  const [slotId, setSlotId] = useState<number>(item?.slotId ?? 1);
  const [subjectCode, setSubjectCode] = useState<string>(
    item?.subjectCode || 'B.INDONESIA'
  );
  const [teacherName, setTeacherName] = useState<string>(
    item?.teacherName || SUBJECTS_MAP[item?.subjectCode || 'B.INDONESIA']?.teacherDefault || ''
  );
  const [room, setRoom] = useState<string>(item?.room || `Ruang Kelas ${classGroup}`);
  const [notes, setNotes] = useState<string>(item?.notes || '');

  const handleSubjectChange = (code: string) => {
    setSubjectCode(code);
    const info = SUBJECTS_MAP[code];
    if (info && info.teacherDefault) {
      setTeacherName(info.teacherDefault);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ScheduleItem = {
      id: item?.id || `${classGroup}-${day}-${slotId}-${Date.now()}`,
      classGroup,
      day,
      slotId,
      subjectCode,
      teacherName,
      room,
      notes: notes.trim() ? notes.trim() : undefined,
    };
    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-4 border-blue-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black text-blue-950 dark:text-white flex items-center gap-2 uppercase">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {item ? 'EDIT JAM PELAJARAN' : 'TAMBAH JAM PELAJARAN +'}
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              SDK St. Teresia Danga - Mbay • TAPEL 2025/2026
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class & Day Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 uppercase">
                Kelas:
              </label>
              <select
                value={classGroup}
                onChange={(e) => {
                  const val = e.target.value as ClassGroup;
                  setClassGroup(val);
                  setRoom(`Ruang Kelas ${val}`);
                }}
                className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-black py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 uppercase">
                Hari:
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-black py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slot Select */}
          <div>
            <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 flex items-center gap-1 uppercase">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Waktu Jam Pelajaran:
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(Number(e.target.value))}
              className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-black py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              {TIME_SLOTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.startTime} - {s.endTime}) {s.isBreak ? '[ISTIRAHAT]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 uppercase">
              Mata Pelajaran:
            </label>
            <select
              value={subjectCode}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-black py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(SUBJECTS_MAP).map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Name */}
          <div>
            <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 flex items-center gap-1 uppercase">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Nama Guru Pengajar:
            </label>
            <input
              type="text"
              placeholder="Contoh: Ibu Maria S.Pd"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-bold py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Room */}
          <div>
            <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 flex items-center gap-1 uppercase">
              <DoorOpen className="w-3.5 h-3.5 text-amber-600" /> Ruang / Lokasi:
            </label>
            <input
              type="text"
              placeholder="Contoh: Ruang Kelas 1A / Lapangan"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-bold py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-black text-blue-950 dark:text-slate-300 block mb-1 flex items-center gap-1 uppercase">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Catatan Tambahan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Bawa seragam olahraga & sepatu kets"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-sky-50 dark:bg-slate-800 text-xs font-bold py-2 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
            {item && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus jam pelajaran ini?')) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-black px-4 py-2 rounded-2xl border-2 border-rose-400 shadow-[2px_2px_0px_#be123c] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <Trash2 className="w-4 h-4" />
                HAPUS
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-2xl uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase"
              >
                <Save className="w-4 h-4 text-blue-950" />
                SIMPAN JAM PELAJARAN
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
