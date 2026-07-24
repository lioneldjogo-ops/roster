import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Info,
  ShieldAlert
} from 'lucide-react';

export interface SubjectGearItem {
  id: string;
  name: string;
}

export interface SubjectGearCategory {
  id: string;
  subjectTitle: string;
  items: SubjectGearItem[];
}

const LOCAL_STORAGE_KEY_CATEGORIES = 'sdk_teresia_subject_gear_v2';
const LOCAL_STORAGE_KEY_CHECKS = 'sdk_teresia_student_gear_checks_v2';

export const DEFAULT_SUBJECT_GEAR_CATEGORIES: SubjectGearCategory[] = [
  {
    id: 'sg-announcement',
    subjectTitle: '📌 PENGINGAT & CATATAN TAMBAHAN DARI GURU',
    items: [
      { id: 'sgi-01', name: 'Bawa Bekal Makanan & Botol Minum Berlabel Nama' },
      { id: 'sgi-02', name: 'Kumpulkan Surat Izin Orang Tua / Kas Sekolah (Jika Ada)' },
    ],
  },
  {
    id: 'sg-lit-num',
    subjectTitle: 'MATA PELAJARAN: LITERASI DAN NUMERASI',
    items: [
      { id: 'sgi-1', name: 'Buku Bacaan / Cerita Rakyat' },
      { id: 'sgi-2', name: 'Buku Tulis Refleksi Membaca' },
    ],
  },
  {
    id: 'sg-pancasila',
    subjectTitle: 'MATA PELAJARAN: PENDIDIKAN PANCASILA',
    items: [
      { id: 'sgi-3', name: 'Buku Paket Pendidikan Pancasila' },
      { id: 'sgi-4', name: 'Buku Tulis Catatan' },
    ],
  },
  {
    id: 'sg-bindo',
    subjectTitle: 'MATA PELAJARAN: BAHASA INDONESIA',
    items: [
      { id: 'sgi-5', name: 'Buku Paket Bahasa Indonesia' },
      { id: 'sgi-6', name: 'Buku Tulis Catatan' },
    ],
  },
  {
    id: 'sg-sbdp',
    subjectTitle: 'MATA PELAJARAN: SENI BUDAYA DAN PRAKARYA',
    items: [
      { id: 'sgi-7', name: 'Buku Gambar A4' },
      { id: 'sgi-8', name: 'Pensil Warna / Crayon / Spidol' },
    ],
  },
  {
    id: 'sg-mathm',
    subjectTitle: 'MATA PELAJARAN: MATEMATIKA',
    items: [
      { id: 'sgi-9', name: 'Buku Tulis Petak / Kotak' },
      { id: 'sgi-10', name: 'Penggaris & Alat Tulis' },
    ],
  },
  {
    id: 'sg-pjok',
    subjectTitle: 'MATA PELAJARAN: PJOK',
    items: [
      { id: 'sgi-11', name: 'Seragam Olahraga SDK St. Teresia' },
      { id: 'sgi-12', name: 'Sepatu Kets & Botol Minum' },
    ],
  },
];

interface SubjectGearChecklistProps {
  isTeacher?: boolean;
  selectedClass?: string;
}

export const SubjectGearChecklist: React.FC<SubjectGearChecklistProps> = ({
  isTeacher = false,
  selectedClass = '1A',
}) => {
  // Categories State
  const [categories, setCategories] = useState<SubjectGearCategory[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SUBJECT_GEAR_CATEGORIES;
  });

  // Checked Items State
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CHECKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Save Categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  // Save Checked items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CHECKS, JSON.stringify(checkedMap));
    } catch (e) {}
  }, [checkedMap]);

  // Modals & Form States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  const [addingItemToCatId, setAddingItemToCatId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const [editingItem, setEditingItem] = useState<{ catId: string; itemId: string; name: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ catId: string; title: string } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Item Checked State for Students/Parents
  const handleToggleCheck = (itemId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // 1. Add New Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle.trim()) return;

    const formattedTitle = newCategoryTitle.trim().toUpperCase();

    const newCat: SubjectGearCategory = {
      id: `sg-${Date.now()}`,
      subjectTitle: formattedTitle,
      items: [],
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCategoryTitle('');
    setIsAddCategoryOpen(false);
    showToast('✅ Berhasil menambah kategori / pengingat baru!');
  };

  // 2. Edit Category Title
  const handleSaveCategoryTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.title.trim()) return;

    const formatted = editingCategory.title.trim().toUpperCase();

    setCategories((prev) =>
      prev.map((cat) => (cat.id === editingCategory.catId ? { ...cat, subjectTitle: formatted } : cat))
    );
    setEditingCategory(null);
    showToast('✏️ Judul kategori / pengingat berhasil diperbarui!');
  };

  // 3. Delete Category
  const handleDeleteCategory = (catId: string, title: string) => {
    if (confirm(`Hapus seluruh kartu "${title}" beserta semua informasinya?`)) {
      setCategories((prev) => prev.filter((cat) => cat.id !== catId));
      showToast('🗑️ Kategori mata pelajaran berhasil dihapus!');
    }
  };

  // 4. Add Item to Category
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingItemToCatId || !newItemName.trim()) return;

    const newItem: SubjectGearItem = {
      id: `sgi-${Date.now()}`,
      name: newItemName.trim(),
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === addingItemToCatId) {
          return {
            ...cat,
            items: [...cat.items, newItem],
          };
        }
        return cat;
      })
    );

    setAddingItemToCatId(null);
    setNewItemName('');
    showToast('✅ Informasi perlengkapan berhasil ditambahkan!');
  };

  // 5. Edit Item Name
  const handleSaveItemName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === editingItem.catId) {
          return {
            ...cat,
            items: cat.items.map((item) =>
              item.id === editingItem.itemId ? { ...item, name: editingItem.name.trim() } : item
            ),
          };
        }
        return cat;
      })
    );

    setEditingItem(null);
    showToast('✏️ Informasi perlengkapan berhasil diperbarui!');
  };

  // 6. Delete Item
  const handleDeleteItem = (catId: string, itemId: string, name: string) => {
    if (confirm(`Hapus informasi "${name}"?`)) {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === catId) {
            return {
              ...cat,
              items: cat.items.filter((item) => item.id !== itemId),
            };
          }
          return cat;
        })
      );
      showToast('🗑️ Informasi perlengkapan dihapus.');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua daftar mata pelajaran & perlengkapan ke susunan awal sekolah?')) {
      setCategories(DEFAULT_SUBJECT_GEAR_CATEGORIES);
      setCheckedMap({});
      showToast('🔄 Berhasil mengembalikan data ke susunan awal sekolah.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl border-2 border-emerald-400 shadow-2xl animate-bounce flex items-center gap-2">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-[#0b132a] dark:bg-slate-900 border-4 border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-dashed border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-3 py-0.5 rounded-full border border-blue-400">
                INFO & CHECKLIST PERLENGKAPAN / PENGINGAT MURID
              </span>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full border border-yellow-300">
                KELAS {selectedClass}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              INFORMASI PERLENGKAPAN & CATATAN PENGINGAT
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {isTeacher
                ? '👩‍🏫 MODE GURU: Anda dapat MENAMBAH (+), MENGUBAH (✏️), dan MENGHAPUS (🗑️) kategori mapel, pengingat umum, atau item perlengkapan di bawah.'
                : '🎒 MODE SISWA / ORANG TUA: Centang lingkaran pada item buku & catatan pengingat yang sudah disiapkan.'}
            </p>
          </div>

          {/* Teacher Control Actions */}
          {isTeacher ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-4 py-2.5 rounded-2xl border-2 border-yellow-300 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-blue-950" />
                <span>TAMBAH MAPEL BARU +</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs px-3.5 py-2.5 rounded-2xl border border-slate-700 transition-all uppercase flex items-center gap-1.5"
                title="Reset Ke Default"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>RESET</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Sentuh lingkaran untuk mencentang barang yang siap bawa!</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#0b132a] dark:bg-slate-900 border-2 border-slate-800 rounded-[28px] p-5 shadow-xl space-y-4 relative flex flex-col justify-between group hover:border-slate-700 transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5 flex-1 pr-2">
                  <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight leading-snug">
                    {cat.subjectTitle}
                  </h3>
                </div>

                {/* Teacher Card Controls */}
                {isTeacher && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setAddingItemToCatId(cat.id)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-[11px] px-2.5 py-1 rounded-xl border border-yellow-300 shadow-sm transition-all uppercase flex items-center gap-1"
                      title="Tambah Informasi ke Mapel ini"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-950" />
                      <span>TAMBAH</span>
                    </button>

                    <button
                      onClick={() => setEditingCategory({ catId: cat.id, title: cat.subjectTitle })}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl border border-slate-700 transition-colors"
                      title="Edit Judul Mata Pelajaran"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.subjectTitle)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-xl border border-slate-700 transition-colors"
                      title="Hapus Kartu Mata Pelajaran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              {cat.items.length === 0 ? (
                <div className="p-4 bg-[#121c35] rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-bold italic">
                    Belum ada informasi buku / perlengkapan untuk mata pelajaran ini.
                  </p>
                  {isTeacher && (
                    <button
                      onClick={() => setAddingItemToCatId(cat.id)}
                      className="text-xs font-black bg-yellow-400 text-blue-950 px-3 py-1 rounded-xl border border-yellow-300"
                    >
                      + TAMBAH INFORMASI SEKARANG
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cat.items.map((item) => {
                    const isChecked = !!checkedMap[item.id];

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCheck(item.id)}
                        className={`group/item flex items-center justify-between p-3.5 rounded-2xl border text-xs font-black transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-blue-950/70 border-blue-500/80 text-white shadow-md'
                            : 'bg-[#131d38] border-slate-800 hover:border-slate-700 text-slate-100'
                        }`}
                      >
                        <span className="pr-3 leading-relaxed font-bold text-sm">
                          {item.name}
                        </span>

                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Teacher Item Actions */}
                          {isTeacher && (
                            <div className="flex items-center gap-1 mr-1">
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    catId: cat.id,
                                    itemId: item.id,
                                    name: item.name,
                                  })
                                }
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-colors"
                                title="Edit Informasi"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(cat.id, item.id, item.name)}
                                className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 transition-colors"
                                title="Hapus Informasi"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Checkbox Icon */}
                          <div
                            onClick={() => handleToggleCheck(item.id)}
                            className="p-1 hover:scale-110 transition-transform"
                            title={isChecked ? 'Sudah Diperlengkapi' : 'Belum Dicentang'}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-6 h-6 text-green-400 drop-shadow" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teacher Quick Add Row Button */}
            {isTeacher && cat.items.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                <button
                  onClick={() => setAddingItemToCatId(cat.id)}
                  className="text-[11px] font-black text-yellow-400 hover:text-yellow-300 flex items-center gap-1 uppercase"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Informasi Perlengkapan Lagi</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal 1: Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b132a] border-4 border-slate-800 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black uppercase flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-yellow-400" />
                TAMBAH MATA PELAJARAN BARU
              </h3>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-black block text-slate-300 mb-1 uppercase">
                  Nama Judul Kategori / Pengingat:
                </label>
                <input
                  type="text"
                  value={newCategoryTitle}
                  onChange={(e) => setNewCategoryTitle(e.target.value)}
                  placeholder="Contoh: 📌 PENGINGAT UMUM / MATA PELAJARAN: KESENIAN"
                  className="w-full bg-[#131d38] text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-400"
                  required
                />
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  Anda bisa memasukkan nama Mata Pelajaran atau Catatan Pengingat Bebas.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-xl border border-yellow-300 uppercase"
                >
                  SIMPAN KATEGORI / PENGINGAT +
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Item Modal */}
      {addingItemToCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b132a] border-4 border-slate-800 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black uppercase flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-yellow-400" />
                TAMBAH INFORMASI / PERLENGKAPAN
              </h3>
              <button
                onClick={() => setAddingItemToCatId(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs font-black block text-slate-300 mb-1 uppercase">
                  Informasi / Perlengkapan Yang Perlu Dibawa:
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Contoh: Buku Paket Bab 3 / Membawa Crayon 12 Warna"
                  className="w-full bg-[#131d38] text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingItemToCatId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-xl border border-yellow-300 uppercase"
                >
                  TAMBAH INFORMASI +
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b132a] border-4 border-slate-800 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black uppercase flex items-center gap-2 text-white">
                <Edit className="w-5 h-5 text-blue-400" />
                EDIT INFORMASI PERLENGKAPAN
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemName} className="space-y-4">
              <div>
                <label className="text-xs font-black block text-slate-300 mb-1 uppercase">
                  Ubah Informasi Perlengkapan:
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#131d38] text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-xl border border-yellow-300 uppercase"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Category Title Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b132a] border-4 border-slate-800 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black uppercase flex items-center gap-2 text-white">
                <Edit className="w-5 h-5 text-blue-400" />
                EDIT JUDUL MATA PELAJARAN
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryTitle} className="space-y-4">
              <div>
                <label className="text-xs font-black block text-slate-300 mb-1 uppercase">
                  Judul Mata Pelajaran:
                </label>
                <input
                  type="text"
                  value={editingCategory.title}
                  onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                  className="w-full bg-[#131d38] text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-5 py-2.5 rounded-xl border border-yellow-300 uppercase"
                >
                  SIMPAN JUDUL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
