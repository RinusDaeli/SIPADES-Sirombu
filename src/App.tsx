/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { AsetManagementView } from './components/AsetManagementView';
import { VerifikasiView } from './components/VerifikasiView';
import { LaporanPermendagriView } from './components/LaporanPermendagriView';
import { UserManagementView } from './components/UserManagementView';
import { DesaInfoView } from './components/DesaInfoView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#153422] text-white p-3 flex items-center justify-between border-b border-[#1e4830] shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-emerald-900/60 text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <span className="font-extrabold text-xs tracking-wider block">SIPADES SIROMBU</span>
            <span className="text-[10px] text-emerald-200/70">Kecamatan Sirombu, Nias Barat</span>
          </div>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <div
        className={`${
          mobileSidebarOpen ? 'block fixed inset-0 z-50 overflow-y-auto' : 'hidden'
        } md:block md:static md:h-screen md:shrink-0 z-30`}
      >
        <Sidebar />
      </div>

      {/* Main Workspace with independent scrolling */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'aset' && <AsetManagementView />}
          {activeTab === 'verifikasi' && <VerifikasiView />}
          {activeTab === 'laporan' && <LaporanPermendagriView />}
          {activeTab === 'users' && (currentUser?.role === 'super_admin' || currentUser?.role === 'admin_kecamatan') && <UserManagementView />}
          {activeTab === 'desa_info' && <DesaInfoView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
