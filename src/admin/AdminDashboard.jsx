import React, { useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore';
import {
  Leaf, LogOut, Package, MessageSquare, TrendingUp, Bell,
  Phone, MapPin, Mail, Trash2, Search, Clock, CheckCircle2,
  PhoneCall, Loader2, Inbox, User, Weight, Banknote,
  Download, CheckCheck, Filter, BellRing, StickyNote,
} from 'lucide-react';
import { auth, db, ORDERS_COLLECTION, MESSAGES_COLLECTION } from '../firebase';
import DashboardCharts from './DashboardCharts';
import OrderDetailModal from './OrderDetailModal';
import { playChime, showBrowserNotification, requestNotifyPermission, getNotifyPermission } from './notify';

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'new', label: 'Yeni' },
  { value: 'contacted', label: 'İletişime Geçildi' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

// Verileri CSV olarak indirir (Excel uyumlu, UTF-8 BOM ile Türkçe karakter desteği).
function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(';')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ORDER_STATUS = {
  new: { label: 'Yeni', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'İletişime Geçildi', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Tamamlandı', className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'İptal', className: 'bg-red-100 text-red-700 border-red-200' },
};

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-gray-900 leading-tight truncate">{value}</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifyPerm, setNotifyPerm] = useState(getNotifyPermission());

  const firstOrdersLoad = useRef(true);
  const firstMessagesLoad = useRef(true);

  useEffect(() => {
    const qOrders = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const qMessages = query(collection(db, MESSAGES_COLLECTION), orderBy('createdAt', 'desc'));

    const unsubOrders = onSnapshot(qOrders, (snap) => {
      // İlk yüklemeden sonra gelen yeni siparişlerde ses + bildirim.
      if (!firstOrdersLoad.current) {
        snap.docChanges().forEach((ch) => {
          if (ch.type === 'added') {
            const d = ch.doc.data();
            playChime();
            showBrowserNotification('🆕 Yeni Sipariş', `${d.name || 'Müşteri'} — ${d.quantity || ''} Ton ${d.productName || ''}`);
          }
        });
      }
      firstOrdersLoad.current = false;
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });

    const unsubMessages = onSnapshot(qMessages, (snap) => {
      if (!firstMessagesLoad.current) {
        snap.docChanges().forEach((ch) => {
          if (ch.type === 'added') {
            const d = ch.doc.data();
            playChime();
            showBrowserNotification('💬 Yeni Mesaj', `${d.name || 'Ziyaretçi'}: ${(d.message || '').slice(0, 80)}`);
          }
        });
      }
      firstMessagesLoad.current = false;
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    return () => { unsubOrders(); unsubMessages(); };
  }, []);

  const enableNotifications = async () => {
    const perm = await requestNotifyPermission();
    setNotifyPerm(perm);
    if (perm === 'granted') {
      playChime();
      showBrowserNotification('Bildirimler açık', 'Yeni sipariş ve mesajlarda haberdar olacaksınız.');
    }
  };

  const stats = useMemo(() => {
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const newMessages = messages.filter((m) => m.status === 'new').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return { newOrders, newMessages, revenue, totalOrders: orders.length, totalMessages: messages.length };
  }, [orders, messages]);

  // Okunmamış toplamını tarayıcı sekmesi başlığında göster.
  useEffect(() => {
    const unread = stats.newOrders + stats.newMessages;
    document.title = unread > 0
      ? `(${unread}) Yönetim Paneli — Demircan Silaj`
      : 'Yönetim Paneli — Demircan Silaj';
    return () => { document.title = 'Demircan Silaj'; };
  }, [stats.newOrders, stats.newMessages]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && (o.status || 'new') !== statusFilter) return false;
      if (!q) return true;
      return [o.name, o.phone, o.location, o.productName].some((f) => (f || '').toLowerCase().includes(q));
    });
  }, [orders, search, statusFilter]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.name, m.phone, m.email, m.message].some((f) => (f || '').toLowerCase().includes(q))
    );
  }, [messages, search]);

  const setOrderStatus = async (id, status) => {
    try { await updateDoc(doc(db, ORDERS_COLLECTION, id), { status }); }
    catch (err) { console.error(err); }
  };

  const markMessageRead = async (id) => {
    try { await updateDoc(doc(db, MESSAGES_COLLECTION, id), { status: 'read' }); }
    catch (err) { console.error(err); }
  };

  const saveOrderNote = async (id, adminNote) => {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, id), { adminNote });
      setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, adminNote } : prev));
    } catch (err) { console.error(err); }
  };

  const removeDoc = async (coll, id) => {
    if (!window.confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try { await deleteDoc(doc(db, coll, id)); }
    catch (err) { console.error(err); }
  };

  const markAllMessagesRead = async () => {
    const unread = messages.filter((m) => m.status === 'new');
    if (!unread.length) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((m) => batch.update(doc(db, MESSAGES_COLLECTION, m.id), { status: 'read' }));
      await batch.commit();
    } catch (err) { console.error(err); }
  };

  const exportCurrent = () => {
    if (tab === 'orders') {
      downloadCsv('demircan-siparisler.csv', filteredOrders.map((o) => ({
        Tarih: formatDate(o.createdAt),
        Ad: o.name, Telefon: o.phone, Il_Ilce: o.location,
        Urun: o.productName || o.productType, Miktar_Ton: o.quantity,
        Birim_Fiyat: o.unitPrice, Toplam_TL: o.totalPrice,
        Durum: (ORDER_STATUS[o.status] || ORDER_STATUS.new).label, Notlar: o.notes,
      })));
    } else {
      downloadCsv('demircan-mesajlar.csv', filteredMessages.map((m) => ({
        Tarih: formatDate(m.createdAt),
        Ad: m.name, Telefon: m.phone, Eposta: m.email,
        Mesaj: m.message, Durum: m.status === 'new' ? 'Yeni' : 'Okundu',
      })));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Leaf className="h-7 w-7 text-green-600 mr-2" />
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight block leading-none">
                DEMİRCAN <span className="text-green-600">SİLAJ</span>
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Yönetim Paneli</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifyPerm !== 'granted' && notifyPerm !== 'unsupported' && (
              <button
                onClick={enableNotifications}
                title="Yeni sipariş/mesaj bildirimlerini aç"
                className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 rounded-full px-4 py-2 transition-colors"
              >
                <BellRing className="h-4 w-4" /> <span className="hidden sm:inline">Bildirimleri Aç</span>
              </button>
            )}
            {notifyPerm === 'granted' && (
              <span title="Bildirimler açık" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-100 rounded-full px-4 py-2">
                <BellRing className="h-4 w-4" /> Bildirim açık
              </span>
            )}
            <span className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-4 py-2">
              <User className="h-4 w-4 mr-2 text-gray-400" /> {user?.email}
            </span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 rounded-full px-4 py-2 transition-colors"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="h-6 w-6 text-green-600" />} accent="bg-green-50" label="Toplam Sipariş" value={stats.totalOrders} />
          <StatCard icon={<Bell className="h-6 w-6 text-blue-600" />} accent="bg-blue-50" label="Yeni Sipariş" value={stats.newOrders} />
          <StatCard icon={<MessageSquare className="h-6 w-6 text-amber-600" />} accent="bg-amber-50" label="Yeni Mesaj" value={stats.newMessages} />
          <StatCard icon={<TrendingUp className="h-6 w-6 text-purple-600" />} accent="bg-purple-50" label="Tahmini Ciro" value={`${stats.revenue.toLocaleString('tr-TR')} ₺`} />
        </div>

        {/* Grafikler */}
        {!loading && orders.length > 0 && <DashboardCharts orders={orders} />}

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
            <button
              onClick={() => setTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'orders' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Package className="h-4 w-4" /> Siparişler
              {stats.newOrders > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'orders' ? 'bg-white/25' : 'bg-blue-100 text-blue-700'}`}>{stats.newOrders}</span>}
            </button>
            <button
              onClick={() => setTab('messages')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'messages' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <MessageSquare className="h-4 w-4" /> Mesajlar
              {stats.newMessages > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'messages' ? 'bg-white/25' : 'bg-amber-100 text-amber-700'}`}>{stats.newMessages}</span>}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {tab === 'orders' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {ORDER_STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}

            {tab === 'messages' && stats.newMessages > 0 && (
              <button
                onClick={markAllMessagesRead}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCheck className="h-4 w-4 text-green-600" /> Tümünü okundu
              </button>
            )}

            <button
              onClick={exportCurrent}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 text-green-600" /> CSV
            </button>

            <div className="relative sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara: isim, telefon, il..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-3" /> Yükleniyor...
          </div>
        ) : tab === 'orders' ? (
          <OrdersList orders={filteredOrders} onStatus={setOrderStatus} onDelete={(id) => removeDoc(ORDERS_COLLECTION, id)} onOpen={setSelectedOrder} />
        ) : (
          <MessagesList messages={filteredMessages} onRead={markMessageRead} onDelete={(id) => removeDoc(MESSAGES_COLLECTION, id)} />
        )}
      </main>

      {selectedOrder && (
        <OrderDetailModal
          order={orders.find((o) => o.id === selectedOrder.id) || selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaveNote={saveOrderNote}
          onStatus={setOrderStatus}
        />
      )}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-gray-400">
      {icon}
      <p className="mt-4 text-sm font-medium">{text}</p>
    </div>
  );
}

function OrdersList({ orders, onStatus, onDelete, onOpen }) {
  if (orders.length === 0) return <EmptyState icon={<Inbox className="h-10 w-10" />} text="Henüz sipariş bulunmuyor." />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {orders.map((o) => {
        const st = ORDER_STATUS[o.status] || ORDER_STATUS.new;
        return (
          <div key={o.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${o.status === 'new' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <button onClick={() => onOpen(o)} className="flex items-center gap-3 min-w-0 text-left group">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">{o.name || 'İsimsiz'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(o.createdAt)}</p>
                </div>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                {o.adminNote && <StickyNote className="h-4 w-4 text-amber-500" title="İç not var" />}
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.className}`}>{st.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-green-700 min-w-0">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" /> <span className="truncate">{o.phone || '—'}</span>
              </a>
              <div className="flex items-center gap-2 text-gray-700 min-w-0">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" /> <span className="truncate">{o.location || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 min-w-0 col-span-2">
                <Package className="h-4 w-4 text-gray-400 shrink-0" /> <span className="truncate">{o.productName || o.productType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Weight className="h-4 w-4 text-gray-400 shrink-0" /> {o.quantity} Ton
              </div>
              <div className="flex items-center gap-2 font-bold text-green-700">
                <Banknote className="h-4 w-4 text-green-500 shrink-0" /> {(o.totalPrice || 0).toLocaleString('tr-TR')} ₺
              </div>
            </div>

            {o.notes && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 mb-4 leading-relaxed">
                {o.notes}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                <button onClick={() => onStatus(o.id, 'contacted')} title="İletişime geçildi" className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"><PhoneCall className="h-4 w-4" /></button>
                <button onClick={() => onStatus(o.id, 'completed')} title="Tamamlandı" className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                <a href={`https://wa.me/${(o.phone || '').replace(/\D/g, '').replace(/^0/, '90')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><MessageSquare className="h-4 w-4" /></a>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onOpen(o)} className="text-xs font-semibold text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">Detay</button>
                <button onClick={() => onDelete(o.id)} title="Sil" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessagesList({ messages, onRead, onDelete }) {
  if (messages.length === 0) return <EmptyState icon={<Inbox className="h-10 w-10" />} text="Henüz mesaj bulunmuyor." />;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${m.status === 'new' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate flex items-center gap-2">
                  {m.name || 'İsimsiz'}
                  {m.status === 'new' && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">YENİ</span>}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(m.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {m.status === 'new' && (
                <button onClick={() => onRead(m.id)} title="Okundu işaretle" className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
              )}
              <button onClick={() => onDelete(m.id)} title="Sil" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{m.message}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm pt-3 border-t border-gray-50">
            {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-green-700"><Phone className="h-4 w-4 text-gray-400" /> {m.phone}</a>}
            {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-green-700"><Mail className="h-4 w-4 text-gray-400" /> {m.email}</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
