import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
  Users,
  Search,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { users, desas, currentUser, addUser, updateUser, deleteUser } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdminKecamatan = currentUser?.role === 'admin_kecamatan';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin_desa' as UserRole,
    desaId: desas[0]?.id || '',
  });

  const [formError, setFormError] = useState('');

  // Filter users: non-super-admins cannot see super_admin user accounts!
  const visibleUsers = users.filter((u) => {
    if (!isSuperAdmin && u.role === 'super_admin') {
      return false;
    }
    return true;
  });

  const filteredUsers = visibleUsers.filter((u) => {
    const matchRole = filterRole === 'all' ? true : u.role === filterRole;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.desaName && u.desaName.toLowerCase().includes(q));
    return matchRole && matchQuery;
  });

  if (!isSuperAdmin && !isAdminKecamatan) {
    return (
      <div className="bg-[#0E1526] border border-amber-500/40 rounded-2xl p-8 text-center text-slate-300">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Akses Dibatasi</h3>
        <p className="text-xs text-slate-400 mt-1">
          Menu Pengguna hanya dapat diakses oleh Admin Kecamatan dan Super Admin.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setFormError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin_desa',
      desaId: desas[0]?.id || '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormError('');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      desaId: user.desaId || '',
    });
    setShowEditModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const desa = desas.find((d) => d.id === formData.desaId);
    const res = addUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      desaId: formData.role === 'admin_desa' ? formData.desaId : undefined,
      desaName: formData.role === 'admin_desa' ? desa?.name : undefined,
    });

    if (!res.success) {
      setFormError(res.message || 'Gagal menambahkan pengguna.');
      return;
    }
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');
    const desa = desas.find((d) => d.id === formData.desaId);
    const res = updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      desaId: formData.role === 'admin_desa' ? formData.desaId : undefined,
      desaName: formData.role === 'admin_desa' ? desa?.name : undefined,
    });

    if (!res.success) {
      setFormError(res.message || 'Gagal memperbarui pengguna.');
      return;
    }
    setShowEditModal(false);
  };

  const handleDelete = (user: User) => {
    if (user.email === 'udniat.01@gmail.com') {
      alert('Akun Super Admin Utama tidak boleh dihapus.');
      return;
    }

    if (window.confirm(`Yakin ingin menghapus administrator ${user.name} (${user.email})?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isSuperAdmin
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isSuperAdmin ? 'Hak Akses Super Admin' : 'Hak Akses Administrator'}
            </span>
            <span className="text-xs text-slate-400">
              Kecamatan Sirombu • Nias Barat
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Data Pengguna & Administrator
          </h2>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? 'Kelola akun Super Admin, Admin Kontrol Kecamatan, dan Admin Pendataan 25 Desa.'
              : 'Daftar data pengguna dan akun administrator Kecamatan dan 25 Desa di Sirombu.'}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Admin Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, email, atau desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Peran:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Peran ({visibleUsers.length})</option>
              {isSuperAdmin && <option value="super_admin">Super Admin</option>}
              <option value="admin_kecamatan">Admin Kecamatan</option>
              <option value="admin_desa">Admin Desa</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400">
          Total Terdaftar: <span className="font-bold text-white">{filteredUsers.length}</span> Pengguna
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Nama Lengkap</th>
                <th className="py-3 px-3">ID / Alamat Email</th>
                <th className="py-3 px-3">Kata Sandi</th>
                <th className="py-3 px-3">Peran / Otoritas</th>
                <th className="py-3 px-3">Wilayah / Penugasan</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u, idx) => {
                const isSuper = u.role === 'super_admin';
                const isKec = u.role === 'admin_kecamatan';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {u.name}
                      {currentUser?.id === u.id && (
                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                          Anda Saat Ini
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {u.password}
                    </td>
                    <td className="py-3 px-3">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3" /> Super Admin
                        </span>
                      ) : isKec ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                          <Building2 className="w-3 h-3" /> Admin Kecamatan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                          <Users className="w-3 h-3" /> Admin Desa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {u.desaName || 'Tingkat Kecamatan Sirombu'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(isSuperAdmin || (isAdminKecamatan && u.role === 'admin_desa')) && (
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={u.email === 'udniat.01@gmail.com'}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isSuperAdmin && !isAdminKecamatan && (
                          <span className="text-[11px] text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Pengguna */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-red-500/20 text-red-300">
                <Plus className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Tambah Administrator Baru
                </h3>
                <p className="text-xs text-slate-400">
                  Otoritas Super Admin Kecamatan Sirombu
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin Desa Tugala / Tim Aset Kecamatan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  ID / Email Pengguna *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.contoh@desa.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kata Sandi (Password) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Buat kata sandi aman"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tingkat Peran (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value="admin_desa">Admin Desa (Penginput Aset)</option>
                  <option value="admin_kecamatan">Admin Kecamatan (Kontrol & Verifikasi)</option>
                  <option value="super_admin">Super Admin (Kontrol Penuh)</option>
                </select>
              </div>

              {formData.role === 'admin_desa' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Penugasan Wilayah Desa
                  </label>
                  <select
                    value={formData.desaId}
                    onChange={(e) => setFormData({ ...formData, desaId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {desas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pengguna */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <Edit2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Edit Akun Administrator
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  ID / Email Pengguna *
                </label>
                <input
                  type="email"
                  required
                  disabled={selectedUser.email === 'udniat.01@gmail.com'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kata Sandi (Password) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tingkat Peran (Role)
                </label>
                <select
                  disabled={selectedUser.email === 'udniat.01@gmail.com' || !isSuperAdmin}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold disabled:opacity-50"
                >
                  <option value="admin_desa">Admin Desa (Penginput Aset)</option>
                  {isSuperAdmin && <option value="admin_kecamatan">Admin Kecamatan (Kontrol & Verifikasi)</option>}
                  {isSuperAdmin && <option value="super_admin">Super Admin (Kontrol Penuh)</option>}
                </select>
              </div>

              {formData.role === 'admin_desa' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Penugasan Wilayah Desa
                  </label>
                  <select
                    value={formData.desaId}
                    onChange={(e) => setFormData({ ...formData, desaId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {desas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
                >
                  Perbarui Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
