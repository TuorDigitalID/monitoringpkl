import React, { useState, useEffect } from 'react';
import { dbStore } from './data/dbStore';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SupabaseModal } from './components/SupabaseModal';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { IndustryDashboard } from './components/IndustryDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginView } from './components/LoginView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(dbStore.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(dbStore.getIsLoggedIn());
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [activeMenuItem, setActiveMenuItem] = useState('kelola_akun');

  useEffect(() => {
    const unsubscribe = dbStore.subscribe(() => {
      setCurrentUser(dbStore.getCurrentUser());
      setIsLoggedIn(dbStore.getIsLoggedIn());
    });
    return () => unsubscribe();
  }, []);

  if (!isLoggedIn) {
    return (
      <>
        <LoginView
          onLoginSuccess={() => setIsLoggedIn(true)}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        />
        <SupabaseModal
          isOpen={showSupabaseModal}
          onClose={() => setShowSupabaseModal(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans text-slate-900 flex flex-col antialiased">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
        />

        {/* Dynamic View Per Active Role */}
        <main className="flex-1 min-w-0">
          {currentUser.role === 'siswa' && <StudentDashboard currentUser={currentUser} />}
          {currentUser.role === 'guru' && <TeacherDashboard currentUser={currentUser} />}
          {currentUser.role === 'dudi' && <IndustryDashboard currentUser={currentUser} />}
          {currentUser.role === 'admin' && (
            <AdminDashboard
              activeMenuItem={activeMenuItem}
              setActiveMenuItem={setActiveMenuItem}
            />
          )}
        </main>
      </div>

      {/* Footer (Disamakan dengan Halaman Login & Branding) */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">
            SIM PKL SMK MA © 2026 • by{' '}
            <span className="text-indigo-600 font-extrabold">tutordigital.id</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Sistem Manajemen Praktik Kerja Lapangan
          </p>
        </div>
      </footer>

      {/* Supabase Configuration Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
}

