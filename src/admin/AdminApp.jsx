import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { auth } from '../firebase';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// Bu proje başka uygulamalarla paylaşımlı bir Firebase Auth kullandığı için
// yalnızca izinli yönetici(ler) panele erişebilir.
const ALLOWED_ADMIN_UIDS = [
  'UdCPCS1A2aby7sj5bR0Exwxgg2R2', // info@demircansilaj.com.tr
  'VdkScnrMiWYyv9Q5h9mSUT56YkU2'  // cebrailkara@gmail.com
];

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Yükleniyor...
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (!ALLOWED_ADMIN_UIDS.includes(user.uid)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <div className="inline-flex bg-red-500/10 p-4 rounded-2xl mb-5">
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Yetkisiz Erişim</h1>
          <p className="text-sm text-gray-400 mb-6">Bu hesabın yönetim paneline erişim yetkisi bulunmuyor.</p>
          <button
            onClick={() => signOut(auth)}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} />;
}
