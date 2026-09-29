import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NiasBaratLogo } from './NiasBaratLogo';
import {
  Lock,
  Mail,
  MessageCircle,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Gagal masuk. Periksa kembali ID dan Password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <NiasBaratLogo size={80} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            SIPADES SIROMBU
          </h1>
          <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Sistem Informasi Pengelolaan Aset Desa
          </p>
          <p className="text-xs text-slate-400">
            Kecamatan Sirombu • Kabupaten Nias Barat
          </p>
          <div className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300">
            Sesuai Pedoman Permendagri Nomor 20 Tahun 2018
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0E1526]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ID / Alamat Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="Masukkan ID / Alamat Email Pengguna"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-400 transition-colors p-0.5 rounded cursor-pointer focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Sesi login tersimpan otomatis hingga 24 jam</span>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">
            Untuk informasi lebih lanjut, hubungi:
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-300 flex-wrap text-xs">
            <a
              href="mailto:udniat.01@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>udniat.01@gmail.com</span>
            </a>
            <span className="text-slate-600">-</span>
            <a
              href="https://wa.me/6281366998787"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>0813 6699 8787</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
