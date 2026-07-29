import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
  Calendar,
  Filter
} from 'lucide-react';
import { Student, Dudi, Teacher, ClassMajorItem } from '../types';
import { dbStore } from '../data/dbStore';
import { downloadPlottingTemplateExcel } from '../lib/exportExcel';
import * as XLSX from 'xlsx';

export const PlottingSiswaView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [dudis, setDudis] = useState<Dudi[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassMajorItem[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua'); // semua, belum, diplot

  // Modal State for Plotting Single Student
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedDudiId, setSelectedDudiId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [startDate, setStartDate] = useState('2026-07-16');
  const [endDate, setEndDate] = useState('2026-10-16');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(dbStore.getStudents());
    setDudis(dbStore.getDudis());
    setTeachers(dbStore.getTeachers());
    setClasses(dbStore.getClasses());

    const unsubscribe = dbStore.subscribe(() => {
      setStudents(dbStore.getStudents());
      setDudis(dbStore.getDudis());
      setTeachers(dbStore.getTeachers());
      setClasses(dbStore.getClasses());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleOpenPlotModal = (student: Student) => {
    setEditingStudent(student);
    setSelectedDudiId(student.dudiId || '');
    setSelectedTeacherId(student.teacherId || '');
    setStartDate(student.startDate || '2026-07-16');
    setEndDate(student.endDate || '2026-10-16');
  };

  const handleSavePlotting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const matchedDudi = dudis.find((d) => d.id === selectedDudiId);
    const matchedTeacher = teachers.find((t) => t.id === selectedTeacherId);

    const updatedStudent: Student = {
      ...editingStudent,
      dudiId: selectedDudiId || undefined,
      dudiName: matchedDudi ? matchedDudi.name : selectedDudiId ? 'Instansi PKL' : undefined,
      teacherId: selectedTeacherId || undefined,
      teacherName: matchedTeacher ? matchedTeacher.name : undefined,
      industrySupervisorName: matchedDudi?.contactPerson || undefined,
      startDate: startDate || '2026-07-16',
      endDate: endDate || '2026-10-16',
      statusPKL: selectedDudiId ? 'sedang_pkl' : 'belum_dapat'
    };

    dbStore.updateStudent(updatedStudent);
    showToast('success', `Plotting siswa ${editingStudent.name} berhasil disimpan!`);
    setEditingStudent(null);
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

        let successCount = 0;
        data.forEach((row) => {
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const studentName = String(row['Nama Siswa'] || row['Nama'] || row['nama'] || '').trim();
          const dudiName = String(row['Nama Instansi / Perusahaan'] || row['Nama Instansi'] || row['Instansi'] || '').trim();
          const teacherName = String(row['Nama Guru Pembimbing'] || row['Guru Pembimbing'] || row['Guru'] || '').trim();
          const start = String(row['Tanggal Mulai (YYYY-MM-DD)'] || row['Tanggal Mulai'] || '2026-07-16').trim();
          const end = String(row['Tanggal Selesai (YYYY-MM-DD)'] || row['Tanggal Selesai'] || '2026-10-16').trim();

          // Match student by NISN or Name
          let student = students.find((s) => s.nisn === nisn);
          if (!student && studentName) {
            student = students.find((s) => s.name.toLowerCase() === studentName.toLowerCase());
          }

          if (student) {
            let matchedDudi = dudis.find((d) => d.name.toLowerCase().includes(dudiName.toLowerCase()));
            let matchedTeacher = teachers.find((t) => t.name.toLowerCase().includes(teacherName.toLowerCase()));

            const updated: Student = {
              ...student,
              dudiId: matchedDudi ? matchedDudi.id : student.dudiId || `dudi-custom-${Date.now()}`,
              dudiName: dudiName || matchedDudi?.name || student.dudiName,
              teacherId: matchedTeacher ? matchedTeacher.id : student.teacherId,
              teacherName: teacherName || matchedTeacher?.name || student.teacherName,
              startDate: start,
              endDate: end,
              statusPKL: 'sedang_pkl'
            };

            dbStore.updateStudent(updated);
            successCount++;
          }
        });

        showToast('success', `Berhasil melakukan plotting massal untuk ${successCount} siswa!`);
      } catch (err) {
        showToast('error', 'Gagal memproses file Excel plotting. Pastikan format sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.dudiName && s.dudiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.teacherName && s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      classFilter === 'semua' || s.classMajor.toLowerCase().trim() === classFilter.toLowerCase().trim();

    const matchesStatus =
      statusFilter === 'semua' ||
      (statusFilter === 'diplot' && (s.dudiId || s.dudiName)) ||
      (statusFilter === 'belum' && !s.dudiId && !s.dudiName);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return 'Belum Diatur';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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

      {/* Top Banner / Excel Mass Import & Export Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-2xs">
        {/* Header Title + Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Pemetaan (Plotting) Instansi & Guru Pembimbing Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Hubungkan setiap siswa magang dengan Instansi PKL dan Guru Pembimbing masing-masing.
            </p>
          </div>

          {/* Download & Upload Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={downloadPlottingTemplateExcel}
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
              <span>Unggah Excel Plotting</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Search & Filter Bar Row matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NISN..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Kelas Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-1/2 sm:w-auto text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="semua">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/2 sm:w-auto text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="semua">Semua Status Plotting</option>
              <option value="belum">Belum Diplot</option>
              <option value="diplot">Sudah Diplot</option>
            </select>
          </div>
        </div>

        {/* Data Table matching screenshot */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">NAMA SISWA</th>
                <th className="py-3 px-4">INSTANSI PKL</th>
                <th className="py-3 px-4">GURU PEMBIMBING</th>
                <th className="py-3 px-4">TANGGAL MULAI & AKHIR PKL</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data siswa ditemukan untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const hasDudi = !!(student.dudiName || student.dudiId);
                  const hasTeacher = !!(student.teacherName || student.teacherId);
                  const hasDate = !!(student.startDate && student.endDate);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* NAMA SISWA */}
                      <td className="py-4 px-3 space-y-0.5">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {student.classMajor} • NISN: {student.nisn}
                        </div>
                      </td>

                      {/* INSTANSI PKL */}
                      <td className="py-4 px-4 font-semibold">
                        {hasDudi ? (
                          <span className="text-slate-800 font-bold">{student.dudiName}</span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Belum diplot</span>
                        )}
                      </td>

                      {/* GURU PEMBIMBING */}
                      <td className="py-4 px-4 font-semibold">
                        {hasTeacher ? (
                          <span className="text-indigo-600 font-extrabold">
                            {student.teacherName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Belum Diatur</span>
                        )}
                      </td>

                      {/* TANGGAL PKL */}
                      <td className="py-4 px-4">
                        {hasDate ? (
                          <span className="font-bold text-slate-800 text-[11px]">
                            {formattedDate(student.startDate)} – {formattedDate(student.endDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Belum Diatur</span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenPlotModal(student)}
                          className="text-indigo-600 hover:text-indigo-800 font-extrabold text-xs transition-colors"
                        >
                          Plot Siswa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PLOTTING SISWA */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Plotting Siswa PKL: {editingStudent.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingStudent.classMajor} • NISN: {editingStudent.nisn}
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlotting} className="space-y-4 text-xs">
              {/* Select Instansi PKL */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pilih Instansi / Perusahaan PKL
                </label>
                <select
                  value={selectedDudiId}
                  onChange={(e) => setSelectedDudiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Belum Diplot (Kosongkan) --</option>
                  {dudis.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Kuota: {d.quota} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Guru Pembimbing */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pilih Guru Pembimbing PKL
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white font-bold text-indigo-700"
                >
                  <option value="">-- Belum Diatur (Kosongkan) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai & Akhir */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Mulai PKL
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Selesai PKL
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Simpan Plotting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
