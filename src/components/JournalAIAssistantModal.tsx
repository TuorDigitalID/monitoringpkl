import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Wand2 } from 'lucide-react';

interface JournalAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  description: string;
  learnings: string;
  classMajor?: string;
  onApplyPolished: (polished: { title: string; description: string; learnings: string }) => void;
}

export const JournalAIAssistantModal: React.FC<JournalAIAssistantModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  description,
  learnings,
  classMajor,
  onApplyPolished,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    polishedTitle: string;
    polishedDescription: string;
    polishedLearnings: string;
    suggestedSkills: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/journal-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle,
          description,
          learnings,
          classMajor: classMajor || 'Vokasi SMK/MA',
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error('Failed to polish journal:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyPolished({
        title: result.polishedTitle,
        description: result.polishedDescription,
        learnings: result.polishedLearnings,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="font-bold text-base">Asisten Jurnal AI (Gemini)</h3>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!result && !loading && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center shadow-inner">
                <Wand2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Rapikan & Terapkan Standar Industri</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Asisten AI akan menganalisis draf catatannmu dan menyusun kembali dengan kosakata teknis vokasi yang rapi, terstruktur, dan disukai pembimbing.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Optimasi Jurnal</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-purple-800">Gemini AI sedang memproses jurnal harianmu...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Judul Ditingkatkan
                  </span>
                  <p className="text-xs font-bold text-slate-900">{result.polishedTitle}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Deskripsi Industri
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">{result.polishedDescription}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Capaian Pembelajaran
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">{result.polishedLearnings}</p>
                </div>
                {result.suggestedSkills && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {result.suggestedSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-purple-200 text-purple-800 rounded-md text-[10px] font-semibold"
                      >
                        #{sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Generate Ulang
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <span>Terapkan ke Form</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
