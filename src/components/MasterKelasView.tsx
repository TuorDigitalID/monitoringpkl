import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ClassMajorItem, Student } from '../types';
import { dbStore } from '../data/dbStore';

export const MasterKelasView: React.FC = () => {
  const [classList, setClassList] = useState<ClassMajorItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClass, setEditingClass] = useState<ClassMajorItem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [classNameInput, setClassNameInput] = useState('');
  const [majorNameInput, setMajorNameInput] = useState('');

  useEffect(() => {
    setClassList(dbStore.getClasses());
    setStudents(dbStore.getStudents());

    const unsubscribe = dbStore.subscribe(() => {
      setClassList(dbStore.getClasses());
      setStudents(dbStore.getStudents());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !majorNameInput.trim()) {
      showToast('error', 'Harap isi Nama Kelas dan Jurusan!');
      return;
    }

    // Check duplicate class name
    const exists = classList.some(
      (c) => c.className.toLowerCase() === classNameInput.trim().toLowerCase()
    );
    if (exists) {
      showToast('error', `Kelas ${classNameInput.trim()} sudah ada dalam daftar!`);
      return;
    }

    const newClass: ClassMajorItem = {
      id: `cls-${Date.now()}`,
      className: classNameInput.trim().toUpperCase(),
      majorName: majorNameInput.trim()
    };

    dbStore.addClass(newClass);
    showToast('success', `Master kelas ${newClass.className} berhasil ditambahkan!`);

    // Reset Form
    setClassNameInput('');
    setMajorNameInput('');
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    if (!editingClass.className.trim() || !editingClass.majorName.trim()) {
      showToast('error', 'Harap isi Nama Kelas dan Jurusan!');
      return;
    }

    dbStore.updateClass(editingClass);
    showToast('success', `Master kelas ${editingClass.className} berhasil diperbarui!`);
    setEditingClass(null);
  };

  const handleDeleteClass = (cls: ClassMajorItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus master kelas "${cls.className}"?`)) {
      dbStore.deleteClass(cls.id);
      showToast('success', `Master kelas ${cls.className} berhasil dihapus.`);
    }
  };

  // Count students for a class name
  const getStudentCount = (clsName: string) => {
    return students.filter(
      (s) => s.classMajor.toLowerCase().trim() === clsName.toLowerCase().trim()
    ).length;
  };

  // Filter class list
  const filteredClasses = classList.filter(
    (c) =>
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.majorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Grid Layout matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABLE MASTER KELAS (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-2xs">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Daftar Master Kelas
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  Master data kelas digunakan untuk memvalidasi pilihan kelas pada saat pendaftaran atau
                  pengeditan data siswa.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kelas, jurusan..."
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">NAMA KELAS</th>
                    <th className="py-3 px-4">JURUSAN / KOMPETENSI KEAHLIAN</th>
                    <th className="py-3 px-4">JUMLAH SISWA</th>
                    <th className="py-3 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        Tidak ada master kelas ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => {
                      const count = getStudentCount(cls.className);
                      return (
                        <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-2 font-black text-slate-900 text-sm">
                            {cls.className}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">
                            {cls.majorName}
                          </td>
                          <td className="py-4 px-4 font-bold text-indigo-600">
                            {count} Siswa
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => setEditingClass(cls)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClass(cls)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Hapus Kelas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM TAMBAH MASTER KELAS (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs sticky top-20">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Tambah Master Kelas</h3>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="Contoh: XII RPL 1, XII TKJ 1..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jurusan / Kompetensi Keahlian
                </label>
                <input
                  type="text"
                  required
                  value={majorNameInput}
                  onChange={(e) => setMajorNameInput(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2"
              >
                Tambahkan Kelas
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Master Kelas */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Master Kelas
              </h3>
              <button
                onClick={() => setEditingClass(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={editingClass.className}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, className: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jurusan / Kompetensi Keahlian
                </label>
                <input
                  type="text"
                  required
                  value={editingClass.majorName}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, majorName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
