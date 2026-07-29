import React, { useState } from 'react';
import { MapPin, Camera, CheckCircle, AlertCircle, X, Navigation } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { dbStore } from '../data/dbStore';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, student }) => {
  const [status, setStatus] = useState<'hadir' | 'izin' | 'sakit'>('hadir');
  const [notes, setNotes] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [coords, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGetGPS = () => {
    setLoadingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          setAddress(
            student.dudiName
              ? `Presensi Terverifikasi di Lokasi: ${student.dudiName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
              : `Lokasi saat ini: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          );
          setLoadingGps(false);
        },
        (_error) => {
          // Fallback simulation
          const lat = -6.2297;
          const lng = 106.8173;
          setCoordinates({ lat, lng });
          setAddress(`Area DUDI (${student.dudiName || 'Kantor Mitra'}) - Lat: ${lat}, Lng: ${lng}`);
          setLoadingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const lat = -6.2297;
      const lng = 106.8173;
      setCoordinates({ lat, lng });
      setAddress(`Area Industri Telkom - Lat: ${lat}, Lng: ${lng}`);
      setLoadingGps(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const timeInStr = now.toTimeString().slice(0, 5);

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      date: todayStr,
      timeIn: timeInStr,
      timeOut: '17:00',
      status: status,
      notes: notes || (status === 'hadir' ? 'Presensi Harian PKL' : `Keterangan: ${status}`),
      locationAddress: address || student.dudiName || 'Lokasi Kantor Mitra PKL',
      latitude: coords?.lat || -6.2297,
      longitude: coords?.lng || 106.8173,
      photoUrl: photoUrl,
      validatedByDudi: true,
    };

    dbStore.addAttendance(record);
    setSuccessMsg('Presensi Harian Berhasil Disimpan!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base">Presensi Harian GPS</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kehadiran</label>
            <div className="grid grid-cols-3 gap-2">
              {(['hadir', 'izin', 'sakit'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all border ${
                    status === st
                      ? st === 'hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : st === 'izin'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* GPS Location Acquisition */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Deteksi Posisi GPS</span>
              </span>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={loadingGps}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                {loadingGps ? 'Memuat GPS...' : coords ? 'Update GPS' : 'Ambil Lokasi'}
              </button>
            </div>
            {address ? (
              <p className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="line-clamp-2">{address}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Klik tombol diatas untuk memverifikasi lokasi GPS tempat PKL.</span>
              </p>
            )}
          </div>

          {/* Selfie Photo Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Bukti Foto Selfie / Kegiatan</span>
            </label>
            <div className="flex items-center space-x-3">
              <img
                src={photoUrl}
                alt="Selfie Presensi"
                className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500 shadow-xs"
              />
              <div className="text-xs space-y-1">
                <p className="text-slate-600 font-medium">Kamera Siap Digunakan</p>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Ganti Foto Simulasi Selfie
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Datang tepat waktu, pengerjaan proyek lab."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Presensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
