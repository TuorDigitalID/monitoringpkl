import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  Users,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck
} from 'lucide-react';
import { User, Student, AttendanceRecord, EvaluationGrade } from '../types';
import { dbStore } from '../data/dbStore';
import { exportAttendancesToExcel, exportGradesToExcel } from '../lib/exportExcel';

interface IndustryDashboardProps {
  currentUser: User;
  activeMenuItem?: string;
}

export const IndustryDashboard: React.FC<IndustryDashboardProps> = ({ currentUser, activeMenuItem }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form Scores (60% DUDI Weight)
  const [disiplinScore, setDisiplinScore] = useState(94);
  const [kerjasamaScore, setKerjasamaScore] = useState(92);
  const [inisiatifScore, setInisiatifScore] = useState(95);
  const [teknisScore, setTeknisScore] = useState(96);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [companyName, setCompanyName] = useState('Instansi DUDI Mitra');

  const loadData = () => {
    const matchedDudi = dbStore.getDudiForUser(currentUser);
    setCompanyName(matchedDudi ? matchedDudi.name : currentUser.name || 'Instansi DUDI Mitra');

    const dudiStudents = dbStore.getStudentsForDudi(currentUser);
    const allStudents = dbStore.getStudents();
    
    // If specific students are plotted for this DUDI, show them; otherwise show all plotted students
    const activeList = dudiStudents.length > 0 ? dudiStudents : allStudents.filter((s) => s.dudiId || s.dudiName);
    setStudents(activeList);
    setAttendances(dbStore.getAttendances());

    if (!selectedStudent && activeList.length > 0) {
      setSelectedStudent(activeList[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleValidateAttendance = (attId: string, validated: boolean) => {
    dbStore.validateAttendance(attId, validated);
  };

  const handleSaveIndustryGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const existingGrade = dbStore.getGradeByStudent(selectedStudent.id);
    const schoolScoreAvg = existingGrade
      ? (existingGrade.jurnalScore + existingGrade.laporanScore + existingGrade.presentasiScore) / 3
      : 90;

    const dudiScoreAvg = (disiplinScore + kerjasamaScore + inisiatifScore + teknisScore) / 4;
    const finalScore = Number((schoolScoreAvg * 0.4 + dudiScoreAvg * 0.6).toFixed(1));
    const gradeLetter = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    const gradeData: EvaluationGrade = {
      id: existingGrade?.id || `grd-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      dudiId: selectedStudent.dudiId || 'dudi-1',
      jurnalScore: existingGrade?.jurnalScore || 90,
      laporanScore: existingGrade?.laporanScore || 88,
      presentasiScore: existingGrade?.presentasiScore || 92,
      disiplinScore,
      kerjasamaScore,
      inisiatifScore,
      teknisScore,
      finalScore,
      gradeLetter,
      certificateNumber: existingGrade?.certificateNumber || `SK/PKL/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      isPublished: true,
    };

    dbStore.saveGrade(gradeData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top DUDI Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200">
            <Building2 className="w-3.5 h-3.5 text-purple-300" />
            <span>Portal Pembimbing Industri DUDI</span>
          </div>
          <h2 className="text-xl font-black">{companyName}</h2>
          <p className="text-xs text-purple-200">
            Pengelolaan Presensi, Validasi Jurnal & Penilaian Kinerja Magang (Bobot 60%)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportAttendancesToExcel(attendances)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all"
          >
            Ekspor Presensi (.xlsx)
          </button>
          <button
            onClick={() => exportGradesToExcel(dbStore.getGrades())}
            className="px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Ekspor Rekap Nilai (.xlsx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Trainee List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Siswa Magang DUDI ({students.length})</span>
            <Users className="w-4 h-4 text-purple-600" />
          </h3>

          <div className="space-y-2">
            {students.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStudent(st)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  selectedStudent?.id === st.id
                    ? 'bg-purple-50 border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={st.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={st.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{st.name}</p>
                    <p className="text-[11px] text-slate-500">{st.classMajor}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Trainee Form & Validation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500">
                  Jurusan: <strong>{selectedStudent.classMajor}</strong> • Pembimbing Sekolah: {selectedStudent.teacherName}
                </p>
              </div>

              {/* Form Input Nilai Industri (60% Weight) */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-purple-700" />
                    <span>Form Penilaian Industri DUDI (Bobot 60%)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Sikap & Unjuk Kerja
                  </span>
                </div>

                <form onSubmit={handleSaveIndustryGrade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kedisiplinan & Etos Kerja (0-100)
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={disiplinScore}
                      onChange={(e) => setDisiplinScore(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kerjasama Tim & Komunikasi (0-100)
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={kerjasamaScore}
                      onChange={(e) => setKerjasamaScore(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inisiatif & Problem Solving (0-100)
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={inisiatifScore}
                      onChange={(e) => setInisiatifScore(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterampilan Teknis / Skill Jobdesk (0-100)
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={teknisScore}
                      onChange={(e) => setTeknisScore(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  {savedSuccess && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Nilai Industri Berhasil Disimpan & Dikalkulasikan ke Nilai Akhir!</span>
                    </div>
                  )}

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Simpan & Legalisir Nilai Industri</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Attendance Validation Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Validasi Presensi Harian Siswa</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Masuk</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Lokasi GPS</th>
                        <th className="p-2.5 text-right">Aksi Validasi DUDI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {attendances
                        .filter((a) => a.studentId === selectedStudent.id)
                        .map((a) => (
                          <tr key={a.id}>
                            <td className="p-2.5 font-bold">{a.date}</td>
                            <td className="p-2.5 text-emerald-700 font-semibold">{a.timeIn}</td>
                            <td className="p-2.5 uppercase text-[10px] font-bold">{a.status}</td>
                            <td className="p-2.5 text-slate-500 text-[11px] line-clamp-1">{a.locationAddress}</td>
                            <td className="p-2.5 text-right">
                              {a.validatedByDudi ? (
                                <button
                                  onClick={() => handleValidateAttendance(a.id, false)}
                                  className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Tervalidasi</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleValidateAttendance(a.id, true)}
                                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold inline-flex items-center space-x-1"
                                >
                                  <span>Validasi Sekarang</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
