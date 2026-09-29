import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NiasBaratLogo } from './NiasBaratLogo';
import { BackupRestoreModal } from './BackupRestoreModal';
import { SyncDevicesModal } from './SyncDevicesModal';
import { syncManager } from '../utils/cloudSyncService';
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  Building,
  BarChart3,
  Users,
  Download,
  LogOut,
  Laptop,
  CheckCircle2,
  X,
  Database,
  RefreshCw,
} from 'lucide-react';

interface SidebarProps {
  onOpenQRScanner?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQRScanner }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    verifikasiList,
    isServerConnected,
    isFirestoreConnected,
    refreshServerData,
  } = useApp();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [peerCount, setPeerCount] = useState<number>(() => syncManager.getConnectedCount());

  useEffect(() => {
    return syncManager.onPeerCountChange((count) => {
      setPeerCount(count);
    });
  }, []);

  // Desa only sees badge for their own pending mutations
  const pendingVerifCount = verifikasiList.filter((v) => {
    if (currentUser?.role === 'admin_desa') {
      return v.desaId === currentUser.desaId && v.status === 'menunggu_verifikasi';
    }
    return v.status === 'menunggu_verifikasi';
  }).length;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdminOrSuper = currentUser?.role === 'super_admin' || currentUser?.role === 'admin_kecamatan';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'aset',
      label: 'DATA ASET',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'verifikasi',
      label: 'MUTASI ASET',
      icon: ArrowRightLeft,
      badge: pendingVerifCount > 0 ? pendingVerifCount : null,
    },
    {
      id: 'desa_info',
      label: 'PROFIL & KANTOR',
      icon: Building,
      badge: currentUser?.role === 'admin_desa' ? null : 'Camat/Desa',
    },
    {
      id: 'laporan',
      label: currentUser?.role === 'admin_desa' ? 'REKAP ASET DESA' : 'REKAP ANTAR DESA',
      icon: BarChart3,
      badge: null,
    },
    ...(isAdminOrSuper
      ? [
          {
            id: 'users',
            label: 'PENGGUNA',
            icon: Users,
            badge: isSuperAdmin ? 'Super' : 'Admin',
          },
        ]
      : []),
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    setActiveTab(item.id);
  };

  return (
    <>
      <aside className="w-64 lg:w-72 shrink-0 bg-[#153422] text-white flex flex-col justify-between p-4 h-full overflow-y-auto border-r border-[#1e4830] select-none">
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-center gap-3 px-1 py-1">
            <NiasBaratLogo size={42} />
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-white uppercase leading-tight">
                {currentUser?.role === 'admin_desa'
                  ? (currentUser.desaName || 'ADMIN DESA')
                  : currentUser?.role === 'super_admin'
                  ? 'SUPER ADMIN'
                  : 'ADMIN KECAMATAN'}
              </h1>
              <p className="text-[11px] text-emerald-200/70 font-medium">
                Kec. Sirombu — Nias Barat
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md font-bold'
                      : 'text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-slate-900' : 'text-emerald-200/80'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : typeof item.badge === 'number'
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-800 text-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4 pt-4 border-t border-[#1e4830]">
          {/* Pasang di Laptop Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-900" />
            <span>Pasang di Laptop</span>
          </button>

          {/* User Info Display */}
          <div className="px-1">
            <div className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Administrator Desa'}
            </div>
            <div className="text-[11px] text-emerald-300/70 font-medium capitalize">
              {currentUser?.role === 'super_admin'
                ? 'Super Admin'
                : currentUser?.role === 'admin_kecamatan'
                ? 'Admin Kecamatan'
                : 'Admin Desa'}
            </div>
          </div>

          {/* Backup & Restore Data (Semua Akun: Desa & Admin) */}
          <button
            onClick={() => setShowBackupModal(true)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup & Restore Data</span>
          </button>

          {/* Real-time Multi-Laptop Connection Status */}
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="w-full p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm transition-all cursor-pointer text-left group"
            title="Klik untuk melihat status sinkronisasi Cloud Firestore & antar laptop"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isFirestoreConnected || isServerConnected || peerCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-[11px] leading-tight truncate group-hover:text-emerald-300 transition-colors">
                  {isFirestoreConnected
                    ? 'Firestore Cloud Terhubung'
                    : peerCount > 0
                    ? `Terhubung (${peerCount} Laptop Online)`
                    : isServerConnected
                    ? 'Server Relay Terhubung'
                    : 'Mode Offline / Terputus'}
                </span>
                <span className="text-[10px] text-emerald-300/80 truncate">
                  Cloud Firestore & P2P Aktif
                </span>
              </div>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                refreshServerData();
              }}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Sinkronkan data sekarang"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg border border-emerald-700/60 hover:bg-emerald-900/50 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Modal Sinkronisasi Antar Perangkat */}
      <SyncDevicesModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* Modal Backup & Restore */}
      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />

      {/* Modal Pasang di Laptop */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Pasang SIPADES SIROMBU di Laptop
                </h3>
                <p className="text-xs text-slate-400">
                  Aplikasi dapat diinstal untuk akses cepat dari desktop & offline.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Google Chrome / Microsoft Edge:</strong> Klik ikon titik tiga di pojok kanan atas browser &rarr; pilih <strong>"Simpan dan Bagikan"</strong> / <strong>"Aplikasi"</strong> &rarr; klik <strong>"Instal SIPADES SIROMBU"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Ikon aplikasi akan otomatis tersedia di Desktop dan Start Menu laptop Anda.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Silakan gunakan menu browser "Install app" untuk memasang SIPADES SIROMBU langsung ke laptop.');
                setShowInstallModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
