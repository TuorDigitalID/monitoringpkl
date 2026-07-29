import React, { useState } from 'react';
import { FileText, X, Sparkles, Copy, Check, Send } from 'lucide-react';
import { dbStore } from '../data/dbStore';
import { ApplicationLetter } from '../types';

interface LetterGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LetterGeneratorModal: React.FC<LetterGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [dudiName, setDudiName] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [majorName, setMajorName] = useState('Rekayasa Perangkat Lunak (RPL)');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<{ letterNumber: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: 'SMK Negeri 1 Jakarta',
          dudiName: dudiName || 'PT Telkom Indonesia',
          city,
          majorName,
          studentNames: [studentName || 'Ahmad Rizky Pratama'],
          startDate: '1 Juli 2026',
          endDate: '1 Oktober 2026',
        }),
      });
      const data = await res.json();
      setGeneratedLetter(data);
    } catch (err) {
      console.error('Failed to generate letter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToStore = () => {
    if (generatedLetter) {
      const newLetter: ApplicationLetter = {
        id: `ltr-${Date.now()}`,
        letterNumber: generatedLetter.letterNumber,
        studentIds: ['usr-s1'],
        dudiId: 'dudi-1',
        dudiName: dudiName || 'Perusahaan Mitra DUDI',
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'terkirim',
        content: generatedLetter.content,
      };
      dbStore.addLetter(newLetter);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(
        `NOMOR: ${generatedLetter.letterNumber}\n\n${generatedLetter.content}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Generator Surat Permohonan PKL (AI Gemini)</h3>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!generatedLetter ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama DUDI / Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={dudiName}
                    onChange={(e) => setDudiName(e.target.value)}
                    placeholder="Contoh: PT Telkom Indonesia Tbk"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kota DUDI</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jurusan / Kompetensi</label>
                  <input
                    type="text"
                    value={majorName}
                    onChange={(e) => setMajorName(e.target.value)}
                    placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Siswa Ditempatkan</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Ahmad Rizky Pratama"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Menyusun Surat dengan AI...' : 'Buat Draf Surat Resmi'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-bold">
                    NOMOR: {generatedLetter.letterNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tercopy' : 'Salin Teks'}</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2 text-slate-200">
                  {generatedLetter.content}
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Surat Pengantar berhasil disimpan ke Arsip Sekolah!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGeneratedLetter(null)}
                  className="text-xs text-slate-600 hover:underline"
                >
                  &larr; Ubah Parameter
                </button>
                <button
                  onClick={handleSaveToStore}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan ke Arsip Surat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
