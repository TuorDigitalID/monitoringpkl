import React, { useState } from 'react';
import { Database, X, Check, Copy, RefreshCw, Key, Link2, FileCode } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseClient,
  SUPABASE_SQL_SCHEMA_SCRIPT
} from '../lib/supabase';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url.trim(), anonKey.trim());
    resetSupabaseClient();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Konfigurasi Database Supabase</h3>
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
            Aplikasi SIM PKL ini mendukung penuh mode <strong className="text-emerald-700">Supabase Cloud Live Database</strong>. Masukkan Project URL dan Anon Key Supabase Anda untuk mengsinkronisasikan data secara real-time. Jika dikosongkan, aplikasi akan berjalan lancar dengan mode <strong className="text-blue-700">Interactive Local Storage Database (Demo)</strong>.
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

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Supabase berhasil disimpan! Memuat ulang koneksi...</span>
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
                    Gunakan Mode Demo
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
