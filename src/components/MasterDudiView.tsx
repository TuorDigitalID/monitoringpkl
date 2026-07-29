import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import { Dudi, Student } from '../types';
import { dbStore } from '../data/dbStore';
import { downloadDudiTemplateExcel } from '../lib/exportExcel';
import * as XLSX from 'xlsx';

export const MasterDudiView: React.FC = () => {
  const [dudis, setDudis] = useState<Dudi[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDudi, setEditingDudi] = useState<Dudi | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [quota, setQuota] = useState<number>(1);
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setDudis(dbStore.getDudis());
    setStudents(dbStore.getStudents());

    const unsubscribe = dbStore.subscribe(() => {
      setDudis(dbStore.getDudis());
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

  const handleAddDudi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Harap isi Nama Instansi / Perusahaan!');
      return;
    }

    const newDudi: Dudi = {
      id: `dudi-${Date.now()}`,
      name: name.trim(),
      category: 'Teknik & Industri',
      address: address.trim() || 'Jl. Raya Mauk No.89, Tangerang',
      city: 'Tangerang',
      contactPerson: contactPerson.trim() || '-',
      phone: phone.trim() || '-',
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.simpkl.com`,
      quota: Number(quota) || 1,
      assignedCount: 0,
      acceptedMajors: ['TKR', 'RPL', 'TKJ', 'DKV'],
      status: 'aktif'
    };

    dbStore.addDudi(newDudi);
    showToast('success', `Instansi ${newDudi.name} berhasil ditambahkan!`);

    // Reset Form
    setName('');
    setAddress('');
    setQuota(1);
    setContactPerson('');
    setPhone('');
  };

  const handleUpdateDudi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDudi) return;

    if (!editingDudi.name.trim()) {
      showToast('error', 'Harap isi Nama Instansi / Perusahaan!');
      return;
    }

    dbStore.updateDudi(editingDudi);
    showToast('success', `Data instansi ${editingDudi.name} berhasil diperbarui!`);
    setEditingDudi(null);
  };

  const handleDeleteDudi = (dudi: Dudi) => {
    if (confirm(`Apakah Anda yakin ingin menghapus instansi "${dudi.name}"?`)) {
      dbStore.deleteDudi(dudi.id);
      showToast('success', `Instansi ${dudi.name} berhasil dihapus.`);
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
          const instansiName = String(row['Nama Instansi / Perusahaan'] || row['Nama Instansi'] || row['nama'] || row['Nama'] || '').trim();
          const alamat = String(row['Alamat Lengkap'] || row['Alamat'] || row['alamat'] || 'Jl. Raya Mauk').trim();
          const kuota = Number(row['Kuota Siswa'] || row['Kuota'] || row['kuota'] || 2);
          const pic = String(row['Nama Pembimbing Lapangan'] || row['Pembimbing'] || row['contactPerson'] || '-').trim();
          const phoneNum = String(row['No HP Pembimbing'] || row['No Telepon'] || row['phone'] || '-').trim();

          if (instansiName) {
            const dudi: Dudi = {
              id: `dudi-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: instansiName,
              category: 'Teknik & Industri',
              address: alamat,
              city: 'Tangerang',
              contactPerson: pic,
              phone: phoneNum,
              email: `${instansiName.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.simpkl.com`,
              quota: kuota,
              assignedCount: 0,
              acceptedMajors: ['TKR', 'RPL', 'TKJ', 'DKV'],
              status: 'aktif'
            };
            dbStore.addDudi(dudi);
            count++;
          }
        });

        showToast('success', `Berhasil mengimpor ${count} data instansi dari file Excel!`);
      } catch (err) {
        showToast('error', 'Gagal memproses file Excel. Pastikan format sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Get active student count assigned to dudi
  const getActiveInternCount = (dudiId: string, fallbackCount: number) => {
    const active = students.filter(
      (s) => s.dudiId === dudiId && (s.statusPKL === 'sedang_pkl' || s.statusPKL === 'mengajukan')
    ).length;
    return active || fallbackCount;
  };

  // Filtered Dudis
  const filteredDudis = dudis.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* LEFT COLUMN: CARDS LIST (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Daftar Mitra Instansi & Perusahaan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar lengkap mitra industri, alamat lokasi magang, kuota, serta kontak pembimbing industri.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari instansi, alamat..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/90 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Excel Import Banner (2 Cards Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Unduh Template Excel */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>1. Unduh Template Excel Instansi</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Gunakan template Excel resmi dengan kolom: <strong>Nama Instansi / Perusahaan</strong>, <strong>Alamat Lengkap</strong>, <strong>Kuota Siswa</strong>, <strong>Nama Pembimbing Lapangan</strong>, dan <strong>No HP Pembimbing</strong>.
              </p>
              <button
                onClick={downloadDudiTemplateExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template (.xlsx)</span>
              </button>
            </div>

            {/* Card 2: Unggah File Excel */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white/70 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-2xs">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">2. Unggah File Excel Instansi</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tarik & letakkan file .xlsx di sini atau klik untuk mencari
              </p>
            </div>
          </div>

          {/* Grid of Company Cards */}
          {filteredDudis.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs italic">
              Tidak ada mitra instansi ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDudis.map((dudi) => {
                const activeCount = getActiveInternCount(dudi.id, dudi.assignedCount);
                return (
                  <div
                    key={dudi.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 relative shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Top Header: Title & Action Buttons */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm tracking-tight line-clamp-1">
                        {dudi.name}
                      </h3>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => setEditingDudi(dudi)}
                          className="p-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Instansi"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDudi(dudi)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Hapus Instansi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Address Line */}
                    <div className="flex items-start space-x-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-1 font-medium text-[11px]">{dudi.address}</p>
                    </div>

                    {/* Quota & Active Count Line */}
                    <div className="text-xs font-semibold text-slate-700 pt-0.5">
                      <span>Kuota Siswa: </span>
                      <span className="font-bold">{dudi.quota}</span>
                      <span className="text-slate-300 mx-1.5">|</span>
                      <span>Sedang Magang: </span>
                      <span className="font-extrabold text-indigo-600">{activeCount} siswa</span>
                    </div>

                    {/* Supervisor Line */}
                    <div className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                      <span>Pembimbing Industri: </span>
                      <span className="text-slate-600 font-semibold">
                        {dudi.contactPerson || '-'}
                      </span>
                      {dudi.phone && dudi.phone !== '-' && (
                        <span> ({dudi.phone})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FORM TAMBAH MITRA INSTANSI (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs sticky top-20">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Tambah Mitra Instansi</h3>
            </div>

            <form onSubmit={handleAddDudi} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Instansi / Perusahaan
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="PT. Solusi Digital..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Sudirman Kav 10..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kuota Siswa (Sebutkan Batas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={quota}
                  onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Hub/Pembimbing Lapangan (Opsional)
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Joko Prasetyo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  No HP Pembimbing Lapangan (Opsional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2"
              >
                Tambahkan Instansi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Instansi */}
      {editingDudi && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Data Instansi: {editingDudi.name}
              </h3>
              <button
                onClick={() => setEditingDudi(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDudi} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Instansi / Perusahaan
                </label>
                <input
                  type="text"
                  required
                  value={editingDudi.name}
                  onChange={(e) =>
                    setEditingDudi({ ...editingDudi, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={editingDudi.address}
                  onChange={(e) =>
                    setEditingDudi({ ...editingDudi, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kuota Siswa</label>
                <input
                  type="number"
                  min={1}
                  value={editingDudi.quota}
                  onChange={(e) =>
                    setEditingDudi({ ...editingDudi, quota: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pembimbing Lapangan
                </label>
                <input
                  type="text"
                  value={editingDudi.contactPerson}
                  onChange={(e) =>
                    setEditingDudi({ ...editingDudi, contactPerson: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No HP Pembimbing</label>
                <input
                  type="text"
                  value={editingDudi.phone}
                  onChange={(e) =>
                    setEditingDudi({ ...editingDudi, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDudi(null)}
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
