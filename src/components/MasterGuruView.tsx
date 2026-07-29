import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Teacher, Student } from '../types';
import { dbStore } from '../data/dbStore';
import { downloadTeacherTemplateExcel } from '../lib/exportExcel';
import * as XLSX from 'xlsx';

export const MasterGuruView: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role] = useState('Guru Pembimbing');
  const [nip, setNip] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    setTeachers(dbStore.getTeachers());
    setStudents(dbStore.getStudents());

    const unsubscribe = dbStore.subscribe(() => {
      setTeachers(dbStore.getTeachers());
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

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Harap isi Nama Lengkap Guru!');
      return;
    }

    const teacherNip = nip.trim() || `NIP-${Date.now().toString().slice(-6)}`;
    const teacherEmail = email.trim() || `${teacherNip}@guru.simpkl.com`;

    const newTeacher: Teacher = {
      id: `usr-g-${Date.now()}`,
      name: name.trim().toUpperCase(),
      nip: teacherNip,
      phone: phone.trim() || '-',
      email: teacherEmail,
      assignedStudentCount: 0,
      password: password.trim() || 'guru@123'
    };

    dbStore.addTeacher(newTeacher);
    showToast('success', `Guru ${newTeacher.name} berhasil ditambahkan!`);

    // Reset form
    setEmail('');
    setName('');
    setNip('');
    setPhone('');
    setPassword('password123');
  };

  const handleUpdateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    if (!editingTeacher.name.trim()) {
      showToast('error', 'Harap isi Nama Lengkap!');
      return;
    }

    dbStore.updateTeacher(editingTeacher);
    showToast('success', `Data guru ${editingTeacher.name} berhasil diperbarui!`);
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (t: Teacher) => {
    if (confirm(`Apakah Anda yakin ingin menghapus guru pembimbing "${t.name}"?`)) {
      dbStore.deleteTeacher(t.id);
      showToast('success', `Guru ${t.name} berhasil dihapus.`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let count = 0;
        data.forEach((row) => {
          const tNip = String(row['NIP/NIK'] || row['NIP'] || row['nip'] || '').trim();
          const tName = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          const tEmail = String(row['Email / ID Unik'] || row['Email'] || row['email'] || `${tNip}@guru.simpkl.com`).trim();
          const tPhone = String(row['Nomor Telepon'] || row['No Telepon'] || row['phone'] || '-').trim();
          const tPass = String(row['Password'] || row['password'] || 'guru@123').trim();

          if (tName) {
            const newT: Teacher = {
              id: `usr-g-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: tName.toUpperCase(),
              nip: tNip || `2026${Math.floor(100 + Math.random() * 900)}`,
              email: tEmail,
              phone: tPhone,
              assignedStudentCount: 0,
              password: tPass
            };
            dbStore.addTeacher(newT);
            count++;
          }
        });

        showToast('success', `Berhasil mengimpor ${count} data guru pembimbing!`);
      } catch (err) {
        showToast('error', 'Gagal memproses file Excel. Pastikan format sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Get assigned student count for a teacher
  const getStudentCount = (teacherId: string, fallback: number) => {
    const assigned = students.filter((s) => s.teacherId === teacherId).length;
    return assigned || fallback;
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* LEFT COLUMN: GURU DATA (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Master Data Guru Pembimbing
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola guru pembimbing PKL, download template excel, dan unggah data guru secara massal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={downloadTeacherTemplateExcel}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center space-x-2 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Template Excel</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center space-x-2 shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Excel</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru berdasarkan Nama, NIP/NIK, atau No Telepon..."
              className="w-full text-xs pl-9 pr-3.5 py-3 rounded-2xl border border-slate-200/90 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white/80 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-2xs">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">Tarik & Lepas File Excel Guru di sini</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Mendukung format .xlsx atau .xls dengan struktur NIP/NIK, Nama Lengkap, Telepon
            </p>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-600">Total Guru Pembimbing</span>
              <span className="text-base font-black text-slate-900">{teachers.length} Guru</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-600">Guru Terfilter</span>
              <span className="text-base font-black text-indigo-600">{filteredTeachers.length} Guru</span>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2 w-10 text-center">NO</th>
                  <th className="py-3 px-3">NIP / NIK</th>
                  <th className="py-3 px-4">NAMA & INFORMASI AKUN</th>
                  <th className="py-3 px-4 text-center">BIMBINGAN SISWA</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data guru pembimbing ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t, idx) => {
                    const studentCount = getStudentCount(t.id, t.assignedStudentCount);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-2 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-3 font-extrabold text-slate-900">
                          {t.nip || '-'}
                        </td>
                        <td className="py-4 px-4 space-y-0.5">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {t.email}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            • Telp: {t.phone || '-'} • Pass: {t.password || 'guru@123'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200/60">
                            {studentCount} Siswa
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => setEditingTeacher(t)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Hapus Guru"
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

        {/* RIGHT COLUMN: FORM TAMBAH GURU PEMBIMBING BARU (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs sticky top-20">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                + Tambah Guru Pembimbing Baru
              </h3>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email / ID Unik
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@simpkl.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmad Fauzi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Peran / Role
                </label>
                <input
                  type="text"
                  value={role}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor Induk (NISN/NIP)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="NIP/NIK"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sandi / Password Login
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2"
              >
                Tambahkan Guru Pembimbing
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Guru */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Data Guru: {editingTeacher.name}
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, name: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP / NIK</label>
                <input
                  type="text"
                  value={editingTeacher.nip}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, nip: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email / ID Unik</label>
                <input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No Telepon</label>
                <input
                  type="text"
                  value={editingTeacher.phone}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password Login</label>
                <input
                  type="text"
                  value={editingTeacher.password || 'guru@123'}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, password: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium text-indigo-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
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
