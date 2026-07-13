import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Leaf, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged (AdminApp) devralır ve dashboard'ı gösterir.
    } catch (err) {
      setStatus('error');
      const codes = {
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/user-not-found': 'Bu e-posta ile kayıtlı yönetici bulunamadı.',
        'auth/wrong-password': 'Şifre hatalı.',
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.',
      };
      setErrorMsg(codes[err.code] || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 antialiased">
      <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-gray-950 to-black opacity-90"></div>
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Leaf className="h-9 w-9 text-green-500 mr-2" />
          <span className="text-2xl font-bold text-white tracking-tight">
            DEMİRCAN <span className="text-green-500">SİLAJ</span>
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex bg-green-500/10 p-3.5 rounded-2xl mb-4">
              <Lock className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1.5">Yönetim Paneli</h1>
            <p className="text-sm text-gray-400">Devam etmek için giriş yapın.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">E-Posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                  placeholder="admin@demircansilaj.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Giriş yapılıyor...</>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          &copy; 2026 Demircan Silaj — Yetkili Erişim
        </p>
      </div>
    </div>
  );
}
