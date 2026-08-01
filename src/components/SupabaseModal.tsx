import React, { useState } from 'react';
import { Database, X, Check, Copy, RefreshCw, Key, Link2, FileCode, UploadCloud, DownloadCloud, AlertCircle } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseClient,
  SUPABASE_SQL_SCHEMA_SCRIPT
} from '../lib/supabase';
import { dbStore } from '../data/dbStore';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Harap isi URL dan Anon Key Supabase!' });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Menghubungkan ke Supabase Cloud...' });

    saveSupabaseConfig(url.trim(), anonKey.trim());
    resetSupabaseClient();

    // Attempt automatic sync push after connecting
    const res = await dbStore.syncAllToCloud();
    setIsLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Terhubung & tersinkronisasi! (${res.count} record terkirim)` });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMsg({
        type: 'error',
        text: `Koneksi tersimpan, namun sync menemui kendala: ${res.message}. Pastikan tabel sudah dibuat di Supabase (lihat SQL DDL).`
      });
    }
  };

  const handleManualPush = async () => {
    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Mengunggah seluruh data lokal ke Supabase Cloud...' });
    const res = await dbStore.syncAllToCloud();
    setIsLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleManualPull = async () => {
    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Mengambil data terbaru dari Supabase Cloud...' });
    await dbStore.reFetchFromCloud();
    setIsLoading(false);
    setStatusMsg({ type: 'success', text: 'Data dari Supabase Cloud berhasil dimuat ke aplikasi!' });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    saveSupabaseConfig('', '');
    resetSupabaseClient();
    setUrl('');
    setAnonKey('');
    setStatusMsg({ type: 'info', text: 'Koneksi dikosongkan. Kembali ke mode Demo Local Storage.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Konfigurasi & Sync Database Supabase</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Aplikasi SIM PKL ini mendukung sinkronisasi real-time dengan <strong className="text-emerald-700">Supabase Cloud Database</strong>. Masukkan Project URL dan Anon Key untuk menghubungkan instansi Anda.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Supabase Anon / Public Key</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : statusMsg.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {statusMsg.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />}
                <span className="leading-tight">{statusMsg.text}</span>
              </div>
            )}

            {/* Manual Action Tools if Configured */}
            {(url || anonKey) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-700">Aksi Sinkronisasi Manual Cloud:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleManualPush}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Push Semua Data ke Cloud</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleManualPull}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Fetch Data dari Cloud</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showSql ? 'Sembunyikan SQL DDL' : 'Lihat SQL Schema DDL'}</span>
              </button>

              <div className="flex items-center space-x-2">
                {(url || anonKey) && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Reset Connection
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Simpan & Hubungkan</span>
                </button>
              </div>
            </div>
          </form>

          {/* SQL Schema View */}
          {showSql && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  schema.sql (Jalankan di Supabase SQL Editor)
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tercopy!' : 'Salin SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Penting: Jika tabel belum ada atau RLS aktif di Supabase, jalankan script di bawah di menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
              </p>
              <pre className="text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-lg whitespace-pre-wrap border border-slate-800">
                {SUPABASE_SQL_SCHEMA_SCRIPT}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
