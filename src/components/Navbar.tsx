import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NiasBaratLogo } from './NiasBaratLogo';
import { BackupRestoreModal } from './BackupRestoreModal';
import {
  Bell,
  ShieldCheck,
  Building2,
  UserCheck,
  LogOut,
  ChevronDown,
  RefreshCw,
  Calendar,
  Sparkles,
  Users,
  Database,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    verifikasiList,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    resetToDefault,
    isServerConnected,
    refreshServerData,
  } = useApp();

  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const isDesa = currentUser?.role === 'admin_desa';
  const isAdminOrSuper = currentUser?.role === 'super_admin' || currentUser?.role === 'admin_kecamatan';

  // Desa only counts their own pending mutations
  const pendingCount = verifikasiList.filter((v) => {
    if (isDesa) {
      return v.desaId === currentUser.desaId && v.status === 'menunggu_verifikasi';
    }
    return v.status === 'menunggu_verifikasi';
  }).length;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
          classes: 'bg-red-950/70 border-red-500/40 text-red-300',
        };
      case 'admin_kecamatan':
        return {
          label: 'Admin Kecamatan',
          icon: <Building2 className="w-3.5 h-3.5 text-amber-300" />,
          classes: 'bg-amber-950/70 border-amber-500/40 text-amber-200',
        };
      default:
        return {
          label: 'Admin Desa',
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
          classes: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200',
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-[#0E1526]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <NiasBaratLogo size={42} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                SIPAD SIROMBU
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  Permendagri 20/2018
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden md:block">
              Kecamatan Sirombu • Kabupaten Nias Barat
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Real-time Server Sync Status */}
          <button
            onClick={() => refreshServerData()}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Sinkronisasi Terpusat Real-time (Klik untuk menyinkronkan data sekarang)"
          >
            <span className={`w-2 h-2 rounded-full ${isServerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400 font-semibold">{isServerConnected ? 'Server Terhubung' : 'Offline'}</span>
            <RefreshCw className="w-3 h-3 text-slate-400" />
          </button>

          {/* Year selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-slate-900 text-white">2026</option>
              <option value={2025} className="bg-slate-900 text-white">2025</option>
              <option value={2024} className="bg-slate-900 text-white">2024</option>
              <option value={2023} className="bg-slate-900 text-white">2023</option>
            </select>
          </div>

          {/* Pending Verification Notification */}
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin_kecamatan') && (
            <button
              onClick={() => setActiveTab('verifikasi')}
              className="relative p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="Permohonan Mutasi & Penghapusan Perlu Diverifikasi"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-red-600 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Backup & Restore Action Button (Admin / Super Admin) */}
          {isAdminOrSuper && (
            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold shadow-sm transition-all"
              title="Cadangkan dan Pulihkan Basis Data SIPADES"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Backup & Restore</span>
            </button>
          )}

          {/* User Profile & Quick Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchMenu(!showSwitchMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                  {currentUser?.name}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.classes}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                  {currentUser?.desaName && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                      • {(currentUser.desaName || '').replace('DESA ', '')}
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Switch Dropdown */}
            {showSwitchMenu && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ganti Peran Pengguna (Uji Coba Cepat)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Beralih instan antar Super Admin, Kecamatan & 25 Desa:
                  </p>
                </div>

                <div className="py-1">
                  {/* Super Admin option */}
                  <button
                    onClick={() => {
                      const su = users.find((u) => u.email === 'udniat.01@gmail.com');
                      if (su) switchUser(su);
                      setShowSwitchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.email === 'udniat.01@gmail.com'
                        ? 'bg-red-950/60 text-red-200 border border-red-500/30'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                        Super Admin (udniat.01@gmail.com)
                      </div>
                      <div className="text-[10px] text-slate-400">Kontrol Penuh & Kelola Pengguna</div>
                    </div>
                    {currentUser?.email === 'udniat.01@gmail.com' && (
                      <span className="text-[10px] bg-red-800/80 px-1.5 py-0.5 rounded text-red-100 font-bold">Aktif</span>
                    )}
                  </button>

                  {/* Admin Kecamatan option */}
                  <button
                    onClick={() => {
                      const kec = users.find((u) => u.email === 'doditribuana@desa.id');
                      if (kec) switchUser(kec);
                      setShowSwitchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors mt-1 ${
                      currentUser?.email === 'doditribuana@desa.id'
                        ? 'bg-amber-950/60 text-amber-200 border border-amber-500/30'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        Admin Kecamatan (doditribuana@desa.id)
                      </div>
                      <div className="text-[10px] text-slate-400">Kontrol & Verifikasi Mutasi/Penghapusan</div>
                    </div>
                    {currentUser?.email === 'doditribuana@desa.id' && (
                      <span className="text-[10px] bg-amber-800/80 px-1.5 py-0.5 rounded text-amber-100 font-bold">Aktif</span>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Pilih Akun Admin Desa (25 Desa):</span>
                  <Users className="w-3 h-3 text-slate-400" />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  {users
                    .filter((u) => u.role === 'admin_desa')
                    .map((desaUser) => (
                      <button
                        key={desaUser.id}
                        onClick={() => {
                          switchUser(desaUser);
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          currentUser?.id === desaUser.id
                            ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-medium text-slate-200 block truncate">
                            {desaUser.desaName || desaUser.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {desaUser.email}
                          </span>
                        </div>
                        {currentUser?.id === desaUser.id && (
                          <span className="text-[9px] bg-emerald-800/70 text-emerald-100 px-1 py-0.5 rounded font-bold ml-1 shrink-0">
                            Aktif
                          </span>
                        )}
                      </button>
                    ))}
                </div>

                <div className="border-t border-slate-800 pt-2 mt-2 flex flex-col gap-1.5">
                  {isAdminOrSuper && (
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        setShowBackupModal(true);
                      }}
                      className="w-full text-left text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-emerald-950/40"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Backup & Restore Basis Data
                    </button>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        setShowResetConfirm(true);
                      }}
                      className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Data Awal
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowSwitchMenu(false);
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-950/40"
                    >
                      <LogOut className="w-3 h-3" />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              Reset Data Default?
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Tindakan ini akan mengembalikan data aset, user, dan permohonan verifikasi ke data awal Kecamatan Sirombu.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal */}
      {isAdminOrSuper && (
        <BackupRestoreModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
        />
      )}
    </header>
  );
};
