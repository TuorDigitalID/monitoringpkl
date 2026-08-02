import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  MapPin,
  Plus,
  Send,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { User, Student, DailyJournal, SupervisionLog, EvaluationGrade } from '../types';
import { dbStore } from '../data/dbStore';
import { exportJournalsToExcel } from '../lib/exportExcel';

interface TeacherDashboardProps {
  currentUser: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionLog[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form Visit Log
  const [visitNotes, setVisitNotes] = useState('');
  const [visitDudiId, setVisitDudiId] = useState('dudi-1');

  // Form Evaluation Grade
  const [jurnalScore, setJurnalScore] = useState(90);
  const [laporanScore, setLaporanScore] = useState(88);
  const [presentasiScore, setPresentasiScore] = useState(92);

  // AI Summary
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<{
    summary: string;
    recommendations: string[];
    estimatedPerformanceGrade: string;
  } | null>(null);

  const [isAllFallback, setIsAllFallback] = useState(false);

  const loadData = () => {
    const assigned = dbStore.getStudentsForTeacher(currentUser);
    if (assigned.length > 0) {
      setStudents(assigned);
      setIsAllFallback(false);
      if (!selectedStudent || !assigned.some((s) => s.id === selectedStudent.id)) {
        setSelectedStudent(assigned[0]);
      }
    } else {
      const all = dbStore.getStudents();
      setStudents(all);
      setIsAllFallback(true);
      if (!selectedStudent && all.length > 0) {
        setSelectedStudent(all[0]);
      }
    }
    setJournals(dbStore.getJournals());
    setSupervisions(dbStore.getSupervisions());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleVerifyJournal = (journalId: string, newStatus: 'disetujui' | 'revisi', feedback: string) => {
    const journal = journals.find((j) => j.id === journalId);
    if (journal) {
      dbStore.updateJournal({
        ...journal,
        status: newStatus,
        teacherFeedback: feedback || (newStatus === 'disetujui' ? 'Jurnal disetujui guru pembimbing.' : 'Mohon perjelas rincian kegiatan.'),
      });
    }
  };

  const handleAddSupervision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitNotes) return;

    const dudis = dbStore.getDudis();
    const targetDudi = dudis.find((d) => d.id === visitDudiId) || dudis[0];

    const log: SupervisionLog = {
      id: `sup-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      dudiId: targetDudi.id,
      dudiName: targetDudi.name,
      date: new Date().toISOString().slice(0, 10),
      notes: visitNotes,
      studentsPresent: students.map((s) => s.id),
    };

    dbStore.addSupervision(log);
    setVisitNotes('');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const existingGrade = dbStore.getGradeByStudent(selectedStudent.id);
    const dudiScoreAvg = existingGrade
      ? (existingGrade.disiplinScore + existingGrade.kerjasamaScore + existingGrade.inisiatifScore + existingGrade.teknisScore) / 4
      : 90;

    const schoolScoreAvg = (jurnalScore + laporanScore + presentasiScore) / 3;
    const finalScore = Number((schoolScoreAvg * 0.4 + dudiScoreAvg * 0.6).toFixed(1));

    const gradeLetter = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    const gradeData: EvaluationGrade = {
      id: existingGrade?.id || `grd-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      dudiId: selectedStudent.dudiId || 'dudi-1',
      jurnalScore,
      laporanScore,
      presentasiScore,
      disiplinScore: existingGrade?.disiplinScore || 90,
      kerjasamaScore: existingGrade?.kerjasamaScore || 90,
      inisiatifScore: existingGrade?.inisiatifScore || 90,
      teknisScore: existingGrade?.teknisScore || 90,
      finalScore,
      gradeLetter,
      certificateNumber: existingGrade?.certificateNumber || `SK/PKL/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      isPublished: true,
    };

    dbStore.saveGrade(gradeData);
    alert('Nilai Sekolah berhasil disimpan dan dikombinasikan dengan Nilai Industri!');
  };

  const handleGenerateAISummary = async () => {
    if (!selectedStudent) return;
    setAiSummaryLoading(true);

    const studentJournals = journals.filter((j) => j.studentId === selectedStudent.id);
    const studentAttendances = dbStore.getAttendancesByStudent(selectedStudent.id);

    try {
      const res = await fetch('/api/gemini/supervisor-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          journals: studentJournals,
          attendances: studentAttendances,
        }),
      });
      const data = await res.json();
      setAiSummaryResult(data);
    } catch (err) {
      console.error('Failed to get AI summary:', err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const pendingJournals = journals.filter((j) => j.status === 'menunggu');

  return (
    <div className="space-y-6">
      {isAllFallback && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Info Synchronization Plotting:</strong> Belum ada siswa yang secara khusus diplot ke nama/NIP Anda ({currentUser.name}) di Master Plotting. Menampilkan seluruh data siswa sekolah.
            </span>
          </div>
        </div>
      )}

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Siswa Bimbingan</p>
            <p className="text-lg font-black text-slate-900">{students.length} Siswa</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Jurnal Menunggu Verifikasi</p>
            <p className="text-lg font-black text-amber-600">{pendingJournals.length} Jurnal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kunjungan DUDI</p>
            <p className="text-lg font-black text-slate-900">{supervisions.length} Kali Visit</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nilai Disahkan</p>
            <p className="text-lg font-black text-purple-700">{dbStore.getGrades().length} Siswa</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Student Select & Journal Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Select List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Siswa Bimbingan
            </h3>
            <button
              onClick={() => exportJournalsToExcel(journals)}
              className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center space-x-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Rekap</span>
            </button>
          </div>

          <div className="space-y-2">
            {students.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudent(st);
                  setAiSummaryResult(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  selectedStudent?.id === st.id
                    ? 'bg-emerald-50 border-emerald-300 shadow-xs'
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
                    <p className="text-[11px] text-slate-500">{st.classMajor} • {st.dudiName || 'Belum DUDI'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Record Supervision Visit Log Form */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Catat Kunjungan Monitoring DUDI</span>
            </h4>
            <form onSubmit={handleAddSupervision} className="space-y-2.5">
              <select
                value={visitDudiId}
                onChange={(e) => setVisitDudiId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
              >
                {dbStore.getDudis().map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <textarea
                required
                rows={2}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Catatan hasil diskusi dengan pimpinan/pembimbing industri..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
              ></textarea>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Log Kunjungan</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Selected Student Journal Review & AI Summary & Grading */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudent.classMajor} • DUDI: <strong className="text-slate-800">{selectedStudent.dudiName || 'Belum Terdaftar'}</strong>
                  </p>
                </div>

                <button
                  onClick={handleGenerateAISummary}
                  disabled={aiSummaryLoading}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{aiSummaryLoading ? 'Analisis AI...' : 'Analisis AI Perkembangan Siswa'}</span>
                </button>
              </div>

              {/* AI Summary Display */}
              {aiSummaryResult && (
                <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rekomendasi AI Guru Pembimbing</span>
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{aiSummaryResult.summary}</p>
                  {aiSummaryResult.recommendations && (
                    <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                      {aiSummaryResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs font-bold text-purple-900 pt-1">
                    Estimasi Predikat Nilai: <span className="underline">{aiSummaryResult.estimatedPerformanceGrade}</span>
                  </p>
                </div>
              )}

              {/* Form Input Nilai Sekolah */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center space-x-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Penilaian Sekolah (Bobot 40%)</span>
                </h4>

                <form onSubmit={handleSaveGrade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nilai Jurnal (0-100)</label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={jurnalScore}
                      onChange={(e) => setJurnalScore(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nilai Laporan (0-100)</label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={laporanScore}
                      onChange={(e) => setLaporanScore(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nilai Ujian (0-100)</label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={presentasiScore}
                      onChange={(e) => setPresentasiScore(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Simpan & Sahkan Nilai
                    </button>
                  </div>
                </form>
              </div>

              {/* Journal Review List for Selected Student */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Review & Verifikasi Jurnal Harian Siswa
                </h4>

                {journals.filter((j) => j.studentId === selectedStudent.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">Belum ada jurnal yang diinput oleh siswa ini.</p>
                ) : (
                  journals
                    .filter((j) => j.studentId === selectedStudent.id)
                    .map((j) => (
                      <div key={j.id} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-500">{j.date}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              j.status === 'disetujui'
                                ? 'bg-emerald-100 text-emerald-800'
                                : j.status === 'revisi'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {j.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900">{j.activityTitle}</h5>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {j.description}
                        </p>

                        <div className="pt-2 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleVerifyJournal(j.id, 'revisi', 'Mohon lengkapi catatan hasil belajar.')}
                            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Minta Revisi</span>
                          </button>
                          <button
                            onClick={() => handleVerifyJournal(j.id, 'disetujui', 'Disetujui. Sesuai standar.')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Setujui Jurnal</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
