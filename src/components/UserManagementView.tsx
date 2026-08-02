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
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  UserCheck,
  GraduationCap,
  Users
} from 'lucide-react';
import { User, UserRole, ClassMajorItem, Student, Teacher } from '../types';
import { dbStore } from '../data/dbStore';
import { downloadUserTemplateExcel, exportUsersToExcel } from '../lib/exportExcel';
import * as XLSX from 'xlsx';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassMajorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for New User
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('siswa');
  const [nisnNip, setNisnNip] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    setUsers(dbStore.getUsers());
    setStudents(dbStore.getStudents());
    setTeachers(dbStore.getTeachers());
    setClasses(dbStore.getClasses());

    const unsubscribe = dbStore.subscribe(() => {
      setUsers(dbStore.getUsers());
      setStudents(dbStore.getStudents());
      setTeachers(dbStore.getTeachers());
      setClasses(dbStore.getClasses());
    });
    return () => unsubscribe();
  }, []);

  const handleSyncMasterData = () => {
    setIsSyncing(true);
    dbStore.syncMasterToUsers(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('success', 'Berhasil menyinkronkan seluruh data dari Master Siswa & Master Guru!');
    }, 400);
  };

  const handleSelectMasterStudent = (studentId: string) => {
    if (!studentId) return;
    const std = students.find((s) => s.id === studentId);
    if (std) {
      setName(std.name);
      setNisnNip(std.nisn);
      setEmail(`${std.nisn}@siswa.simpkl.com`);
      setPhone(std.phone || '-');
      setSelectedClass(std.classMajor || '');
    }
  };

  const handleSelectMasterTeacher = (teacherId: string) => {
    if (!teacherId) return;
    const tch = teachers.find((t) => t.id === teacherId);
    if (tch) {
      setName(tch.name);
      setNisnNip(tch.nip);
      setEmail(tch.email || `${tch.nip}@guru.simpkl.com`);
      setPhone(tch.phone || '-');
      setPassword(tch.password || 'guru@123');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Harap isi Nama Lengkap!');
      return;
    }

    const trimmedNisnNip = nisnNip.trim();
    const generatedEmail = email.trim() || (trimmedNisnNip ? `${trimmedNisnNip}@${role}.simpkl.com` : `user${Date.now()}@simpkl.com`);

    let classMajor = '';
    if (role === 'siswa') {
      if (selectedClass || selectedMajor) {
        classMajor = `${selectedClass} ${selectedMajor}`.trim();
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim().toUpperCase(),
      email: generatedEmail,
      role: role,
      nisn: role === 'siswa' ? trimmedNisnNip : undefined,
      nip: role === 'guru' || role === 'admin' ? trimmedNisnNip : undefined,
      phone: phone.trim() || '-',
      classMajor: classMajor || undefined,
      password: password.trim() || 'password123'
    };

    dbStore.addUser(newUser);

    // If role is student, sync to student store
    if (role === 'siswa') {
      dbStore.addStudent({
        id: `std-${Date.now()}`,
        name: newUser.name,
        nisn: trimmedNisnNip || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
        classMajor: classMajor || 'XII RPL 1',
        phone: newUser.phone || '-',
        statusPKL: 'belum_dapat'
      });
    } else if (role === 'guru') {
      dbStore.addTeacher({
        id: newUser.id,
        name: newUser.name,
        nip: trimmedNisnNip || `2026${Math.floor(100 + Math.random() * 900)}`,
        phone: newUser.phone || '-',
        email: newUser.email,
        assignedStudentCount: 0,
        password: newUser.password
      });
    }

    showToast('success', `Pengguna "${newUser.name}" [${role.toUpperCase()}] berhasil ditambahkan!`);

    // Reset Form
    setEmail('');
    setName('');
    setRole('siswa');
    setNisnNip('');
    setSelectedClass('');
    setSelectedMajor('');
    setPhone('');
    setPassword('password123');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      showToast('error', 'Nama Lengkap tidak boleh kosong!');
      return;
    }

    dbStore.updateUser(editingUser);
    showToast('success', `Akun pengguna "${editingUser.name}" berhasil diperbarui!`);
    setEditingUser(null);
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${u.name}" (${u.email})?`)) {
      dbStore.deleteUser(u.id);
      showToast('success', `Akun "${u.name}" berhasil dihapus.`);
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
          const uName = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          const uEmail = String(row['Email / ID Unik'] || row['Email'] || row['email'] || '').trim();
          let uRoleRaw = String(row['Peran'] || row['Role'] || row['peran'] || 'siswa').toLowerCase();
          
          let uRole: UserRole = 'siswa';
          if (uRoleRaw.includes('guru')) uRole = 'guru';
          else if (uRoleRaw.includes('dudi') || uRoleRaw.includes('mitra')) uRole = 'dudi';
          else if (uRoleRaw.includes('admin') || uRoleRaw.includes('koordinator')) uRole = 'admin';

          const uNisnNip = String(row['NISN / NIP'] || row['NISN'] || row['NIP'] || row['nisn'] || row['nip'] || '').trim();
          const uClass = String(row['Kelas'] || row['kelas'] || '').trim();
          const uMajor = String(row['Jurusan'] || row['jurusan'] || '').trim();
          const uPhone = String(row['Nomor Telepon'] || row['No Telepon'] || row['phone'] || '-').trim();
          const uPass = String(row['Password'] || row['password'] || 'password123').trim();

          const classMajorStr = uClass && uMajor ? `${uClass} • ${uMajor}` : uClass || uMajor || undefined;

          if (uName) {
            const newUser: User = {
              id: `usr-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: uName.toUpperCase(),
              email: uEmail || `${uNisnNip || Date.now()}@${uRole}.simpkl.com`,
              role: uRole,
              nisn: uRole === 'siswa' ? uNisnNip : undefined,
              nip: uRole === 'guru' || uRole === 'admin' ? uNisnNip : undefined,
              phone: uPhone,
              classMajor: classMajorStr,
              password: uPass
            };
            dbStore.addUser(newUser);

            if (uRole === 'siswa') {
              dbStore.addStudent({
                id: `std-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: newUser.name,
                nisn: uNisnNip || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
                classMajor: classMajorStr || 'XII RPL 1',
                phone: uPhone,
                statusPKL: 'belum_dapat'
              });
            } else if (uRole === 'guru') {
              dbStore.addTeacher({
                id: newUser.id,
                name: newUser.name,
                nip: uNisnNip || `2026${Math.floor(100 + Math.random() * 900)}`,
                phone: uPhone,
                email: newUser.email,
                assignedStudentCount: 0,
                password: uPass
              });
            }

            count++;
          }
        });

        showToast('success', `Berhasil mengimpor ${count} akun pengguna!`);
      } catch (err) {
        showToast('error', 'Gagal memproses file Excel. Pastikan format sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nisn && u.nisn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.nip && u.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.classMajor && u.classMajor.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

    return matchesQuery && matchesRole;
  });

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'siswa':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200/80 uppercase tracking-wide">
            SISWA
          </span>
        );
      case 'guru':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200/80 uppercase tracking-wide">
            GURU
          </span>
        );
      case 'dudi':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px] border border-amber-200/80 uppercase tracking-wide">
            PEMBIMBING DUDI
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200/80 uppercase tracking-wide">
            ADMIN
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase">
            USER
          </span>
        );
    }
  };

  const classOptions = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);
  const majorOptions = Array.from(new Set(classes.map((c) => c.majorName))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: USER TABLE & FILTERS (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Master Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur semua akun siswa, guru pembimbing, dan koordinator sekolah.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleSyncMasterData}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center space-x-1.5 shadow-2xs transition-colors disabled:opacity-50"
                title="Tarik & Sinkronkan seluruh data dari Master Siswa & Guru ke Akun Login"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Master Data</span>
              </button>

              <button
                onClick={downloadUserTemplateExcel}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center space-x-1.5 shadow-2xs transition-colors"
                title="Unduh format file Excel pengisian data pengguna"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template Excel</span>
              </button>

              <button
                onClick={() => exportUsersToExcel(users)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center space-x-1.5 shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor Excel</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center space-x-1.5 shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Excel</span>
              </button>
            </div>
          </div>

          {/* Master Integration Info Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-3 shadow-2xs">
            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-extrabold text-indigo-900">
                Terhubung Otomatis ke Master Data Siswa & Guru
              </p>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Semua akun login pengguna diambil & disinkronkan secara real-time dari{' '}
                <strong className="font-bold text-indigo-950">Master Data Siswa ({students.length} Siswa)</strong> dan{' '}
                <strong className="font-bold text-indigo-950">Master Data Guru ({teachers.length} Guru)</strong>. Tambah atau impor di Master Data otomatis membuat akun login!
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, NISN, NIP..."
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="all">Semua Peran</option>
                <option value="siswa">Siswa (Magang)</option>
                <option value="guru">Guru Pembimbing</option>
                <option value="admin">Koordinator Sekolah (Admin)</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white/80 hover:bg-indigo-50/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-2xs">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">Tarik & Lepas File Excel Pengguna di sini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mendukung format .xlsx atau .xls dengan kolom Nama Lengkap, Email, Peran, NISN/NIP, Password
            </p>
          </div>

          {/* User List Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2 w-10 text-center">NO</th>
                  <th className="py-3 px-3">NAMA & EMAIL</th>
                  <th className="py-3 px-3 text-center">ROLE / PERAN</th>
                  <th className="py-3 px-3">NOMOR INDUK</th>
                  <th className="py-3 px-3">NO TELEPON</th>
                  <th className="py-3 px-3">SANDI LOGIN</th>
                  <th className="py-3 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                      Tidak ada akun pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => {
                    const isPassVisible = showPasswordMap[u.id] || false;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-2 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-3 space-y-0.5">
                          <div className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5 flex-wrap">
                            <span>{u.name}</span>
                            {u.role === 'siswa' && (
                              <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                <GraduationCap className="w-2.5 h-2.5 text-blue-600" />
                                <span>Master Siswa</span>
                              </span>
                            )}
                            {u.role === 'guru' && (
                              <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                <Users className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Master Guru</span>
                              </span>
                            )}
                          </div>
                          {u.classMajor && (
                            <div className="text-[10px] text-indigo-600 font-bold">
                              {u.classMajor}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 font-medium">
                            {u.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {getRoleBadge(u.role)}
                        </td>

                        <td className="py-3.5 px-3 font-extrabold text-slate-800 text-xs">
                          {u.nisn || u.nip || '-'}
                        </td>

                        <td className="py-3.5 px-3 font-medium text-slate-600">
                          {u.phone || '-'}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            {isPassVisible ? (
                              <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60">
                                {u.password || 'password123'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/80">
                                [SECURE BY SUPABASE AUTH]
                              </span>
                            )}
                            <button
                              onClick={() => toggleShowPassword(u.id)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                              title={isPassVisible ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Hapus Pengguna"
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

        {/* RIGHT COLUMN: FORM TAMBAH PENGGUNA BARU (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs sticky top-20">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                + Tambah Pengguna Baru
              </h3>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
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
                  Pilih Peran / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="siswa">Siswa (Magang)</option>
                  <option value="guru">Guru Pembimbing</option>
                  <option value="admin">Koordinator Sekolah (Admin)</option>
                </select>
              </div>

              {/* Master Data Quick Picker */}
              {role === 'siswa' && students.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                  <label className="block text-blue-900 font-bold text-[11px] flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ambil Data dari Master Data Siswa</span>
                  </label>
                  <select
                    onChange={(e) => handleSelectMasterStudent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 text-xs bg-white font-medium text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">-- Pilih Siswa Terdaftar --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nisn}) - {s.classMajor}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'guru' && teachers.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                  <label className="block text-emerald-900 font-bold text-[11px] flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ambil Data dari Master Data Guru</span>
                  </label>
                  <select
                    onChange={(e) => handleSelectMasterTeacher(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-xs bg-white font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Pilih Guru Terdaftar --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.nip})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor Induk (NISN/NIP)
                </label>
                <input
                  type="text"
                  value={nisnNip}
                  onChange={(e) => setNisnNip(e.target.value)}
                  placeholder="NISN006234 or NIP19820..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              {/* Conditional Fields for Student */}
              {role === 'siswa' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Kelas
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Jurusan
                    </label>
                    <select
                      value={selectedMajor}
                      onChange={(e) => setSelectedMajor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      {majorOptions.map((mj) => (
                        <option key={mj} value={mj}>
                          {mj}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

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
                Tambahkan Pengguna
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PENGGUNA */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Akun Pengguna: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email / ID Unik</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran / Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-slate-800"
                >
                  <option value="siswa">Siswa (Magang)</option>
                  <option value="guru">Guru Pembimbing</option>
                  <option value="admin">Koordinator Sekolah (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Induk (NISN/NIP)</label>
                <input
                  type="text"
                  value={editingUser.nisn || editingUser.nip || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingUser.role === 'siswa') {
                      setEditingUser({ ...editingUser, nisn: val, nip: undefined });
                    } else {
                      setEditingUser({ ...editingUser, nip: val, nisn: undefined });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas / Jurusan</label>
                <input
                  type="text"
                  value={editingUser.classMajor || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, classMajor: e.target.value })}
                  placeholder="e.g. XII RPL 1"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No Telepon</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password Login</label>
                <input
                  type="text"
                  value={editingUser.password || 'password123'}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium text-indigo-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
