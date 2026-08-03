import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  Plus,
  BookOpen,
  Sparkles,
  Award,
  AlertCircle,
  FileCheck,
  Send,
  Building2,
  UserCheck,
  Download
} from 'lucide-react';
import { User, DailyJournal, AttendanceRecord, EvaluationGrade, Student } from '../types';
import { dbStore } from '../data/dbStore';
import { AttendanceModal } from './AttendanceModal';
import { JournalAIAssistantModal } from './JournalAIAssistantModal';
import { exportJournalsToExcel } from '../lib/exportExcel';

interface StudentDashboardProps {
  currentUser: User;
  activeMenuItem?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, activeMenuItem }) => {
  const [student, setStudent] = useState<Student>(() => dbStore.getStudentForUser(currentUser));
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [grade, setGrade] = useState<EvaluationGrade | undefined>();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Form New Journal
  const [activityTitle, setActivityTitle] = useState('');
  const [description, setDescription] = useState('');
  const [learnings, setLearnings] = useState('');
  const [activeTab, setActiveTab] = useState<'jurnal' | 'presensi' | 'sertifikat'>('jurnal');

  useEffect(() => {
    if (activeMenuItem === 'siswa_jurnal') setActiveTab('jurnal');
    else if (activeMenuItem === 'siswa_presensi') setActiveTab('presensi');
    else if (activeMenuItem === 'siswa_sertifikat') setActiveTab('sertifikat');
  }, [activeMenuItem]);

  const loadData = () => {
    const activeStudent = dbStore.getStudentForUser(currentUser);
    setStudent(activeStudent);
    
    // Get journals, attendances, and grade matching either student.id or currentUser.id
    const studentJournals = dbStore.getJournals().filter(
      (j) => j.studentId === activeStudent.id || j.studentId === currentUser.id
    );
    const studentAttendances = dbStore.getAttendances().filter(
      (a) => a.studentId === activeStudent.id || a.studentId === currentUser.id
    );
    const studentGrade = dbStore.getGradeByStudent(activeStudent.id) || dbStore.getGradeByStudent(currentUser.id);

    setJournals(studentJournals);
    setAttendances(studentAttendances);
    setGrade(studentGrade);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle || !description) return;

    const newJournal: DailyJournal = {
      id: `jrn-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      activityTitle,
      description,
      learnings: learnings || 'Mempelajari standar operasional industri.',
      status: 'menunggu',
    };

    dbStore.addJournal(newJournal);
    setActivityTitle('');
    setDescription('');
    setLearnings('');
  };

  const handleApplyPolishedAI = (polished: { title: string; description: string; learnings: string }) => {
    setActivityTitle(polished.title);
    setDescription(polished.description);
    setLearnings(polished.learnings);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendances.find((a) => a.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Top Banner Status PKL */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>{student.dudiName || 'Instansi Mitra PKL'}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{student.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100">
              <span>NISN: <strong>{student.nisn}</strong></span>
              <span>•</span>
              <span>Kelas: <strong>{student.classMajor}</strong></span>
              <span>•</span>
              <span>Pembimbing Sekolah: <strong>{student.teacherName}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAttendanceModal(true)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 ${
                todayAttendance
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 animate-pulse'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{todayAttendance ? 'Presensi Hari Ini OK' : 'Presensi GPS Masuk'}</span>
            </button>

            <button
              onClick={() => exportJournalsToExcel(journals, student.name)}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Jurnal (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('jurnal')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'jurnal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Jurnal Harian ({journals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presensi')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'presensi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Presensi GPS ({attendances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sertifikat')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'sertifikat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Sertifikat & Penilaian Nilai Akhir</span>
        </button>
      </div>

      {/* TAB CONTENT: JURNAL HARIAN */}
      {activeTab === 'jurnal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Create Journal */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Tambah Jurnal Harian</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Polisher</span>
              </button>
            </div>

            <form onSubmit={handleAddJournal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Contoh: Slicing UI & Setup REST API Node.js"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rincian Deskripsi Kegiatan</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan langkah-langkah kerja teknis yang dilakukan di industri hari ini..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hasil Pembelajaran / Kompetensi</label>
                <textarea
                  rows={2}
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="Apa kompetensi baru yang dipelajari? (Softskill / Hardskill)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Jurnal PKL</span>
              </button>
            </form>
          </div>

          {/* List Journals */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Riwayat Jurnal Kegiatan ({journals.length})</span>
              <span className="text-xs text-slate-500 font-normal">Diperbarui Real-time</span>
            </h3>

            {journals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Belum Ada Jurnal Harian</p>
                <p className="text-xs text-slate-400">Silakan isi jurnal kegiatan harianmu menggunakan form di samping.</p>
              </div>
            ) : (
              journals.map((j) => (
                <div
                  key={j.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {j.date}
                        </span>
                        {j.aiPolished && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-semibold flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>AI Polished</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{j.activityTitle}</h4>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize border ${
                        j.status === 'disetujui'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : j.status === 'revisi'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {j.description}
                  </p>

                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Pembelajaran:</strong> {j.learnings}
                  </div>

                  {j.teacherFeedback && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-0.5">
                      <p className="font-bold flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Catatan Guru Pembimbing:</span>
                      </p>
                      <p className="italic text-slate-700 pl-4">{j.teacherFeedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRESENSI */}
      {activeTab === 'presensi' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Presensi Lokasi GPS</h3>
              <p className="text-xs text-slate-500">Catatan waktu masuk, keluar, dan koordinat tempat PKL</p>
            </div>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Input Presensi Hari Ini</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Pulang</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Lokasi GPS Verified</th>
                  <th className="p-3">Validasi DUDI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">{a.date}</td>
                    <td className="p-3 text-emerald-700 font-bold">{a.timeIn}</td>
                    <td className="p-3 text-slate-600">{a.timeOut || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 uppercase text-[10px]">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="line-clamp-1">{a.locationAddress}</span>
                    </td>
                    <td className="p-3">
                      {a.validatedByDudi ? (
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tervalidasi</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold flex items-center space-x-1 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SERTIFIKAT & PENILAIAN */}
      {activeTab === 'sertifikat' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {grade ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                      LULUS EVALUASI PKL
                    </p>
                    <h3 className="text-2xl font-black">NILAI AKHIR: {grade.finalScore} / 100</h3>
                    <p className="text-xs text-amber-100">Predikat: <strong>{grade.gradeLetter} (Sangat Memuaskan)</strong></p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white">
                    {grade.gradeLetter}
                  </div>
                </div>
                <p className="text-xs text-amber-100 font-mono">No. Sertifikat Resmi: {grade.certificateNumber}</p>
              </div>

              {/* Detail Rincian Nilai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2">
                    NILAI SEKOLAH (BOBOT 40%)
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Nilai Jurnal Harian</span>
                      <strong className="text-slate-900">{grade.jurnalScore}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Nilai Laporan PKL</span>
                      <strong className="text-slate-900">{grade.laporanScore}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Nilai Presentasi & Ujian</span>
                      <strong className="text-slate-900">{grade.presentasiScore}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2">
                    NILAI DUDI / INDUSTRI (BOBOT 60%)
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Kedisiplinan & Sikap</span>
                      <strong className="text-slate-900">{grade.disiplinScore}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Kerjasama Tim</span>
                      <strong className="text-slate-900">{grade.kerjasamaScore}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Inisiatif Kerja</span>
                      <strong className="text-slate-900">{grade.inisiatifScore}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Keterampilan Teknis Jobdesk</span>
                      <strong className="text-slate-900">{grade.teknisScore}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Sertifikat Action */}
              <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/50 text-center space-y-3">
                <Award className="w-10 h-10 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Sertifikat Resmi PKL Tersedia</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Sertifikat digital PKL telah disahkan oleh Sekolah dan Pimpinan DUDI Mitra.
                </p>
                <button
                  onClick={() => alert('Fitur cetak sertifikat PDF disiapkan!')}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center space-x-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Unduh Sertifikat PDF Digital</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Penilaian PKL Belum Diterbitkan</h4>
              <p className="text-xs text-slate-500">
                Nilai dan Sertifikat PKL akan muncul setelah disahkan oleh Guru Pembimbing & DUDI pada akhir periode.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        student={student}
      />

      <JournalAIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        activityTitle={activityTitle}
        description={description}
        learnings={learnings}
        classMajor={student.classMajor}
        onApplyPolished={handleApplyPolishedAI}
      />
    </div>
  );
};
