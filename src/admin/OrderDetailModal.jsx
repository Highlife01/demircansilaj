import React, { useEffect, useState } from 'react';
import {
  X, User, Phone, MapPin, Package, Weight, Banknote,
  Clock, StickyNote, Loader2, CheckCircle2, MessageSquare,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Yeni', className: 'bg-blue-600' },
  { value: 'contacted', label: 'İletişime Geçildi', className: 'bg-amber-600' },
  { value: 'completed', label: 'Tamamlandı', className: 'bg-green-600' },
  { value: 'cancelled', label: 'İptal', className: 'bg-red-600' },
];

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="text-sm text-gray-800 font-medium break-words">{children}</div>
      </div>
    </div>
  );
}

export default function OrderDetailModal({ order, onClose, onSaveNote, onStatus }) {
  const [note, setNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const waPhone = (order.phone || '').replace(/\D/g, '').replace(/^0/, '90');

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await onSaveNote(order.id, note);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sipariş Detayı</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 divide-y divide-gray-50">
          <Row icon={<User className="h-4 w-4" />} label="Ad Soyad / Firma">{order.name || '—'}</Row>
          <Row icon={<Phone className="h-4 w-4" />} label="Telefon">
            <div className="flex items-center gap-3">
              <a href={`tel:${order.phone}`} className="text-green-700 hover:underline">{order.phone || '—'}</a>
              {waPhone && (
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-semibold">
                  <MessageSquare className="h-3 w-3" /> WhatsApp
                </a>
              )}
            </div>
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />} label="İl / İlçe">{order.location || '—'}</Row>
          <Row icon={<Package className="h-4 w-4" />} label="Ürün">{order.productName || order.productType}</Row>
          <div className="grid grid-cols-2">
            <Row icon={<Weight className="h-4 w-4" />} label="Miktar">{order.quantity} Ton</Row>
            <Row icon={<Banknote className="h-4 w-4" />} label="Tahmini Tutar">
              <span className="text-green-700 font-bold">{(order.totalPrice || 0).toLocaleString('tr-TR')} ₺</span>
            </Row>
          </div>
          {order.notes && (
            <Row icon={<StickyNote className="h-4 w-4" />} label="Müşteri Notu">{order.notes}</Row>
          )}
        </div>

        {/* Durum */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Durum</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => {
              const active = (order.status || 'new') === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => onStatus(order.id, s.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? `${s.className} text-white shadow` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* İç not */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">İç Not (yalnızca yönetim görür)</p>
          <textarea
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Takip notu, teklif detayı, hatırlatma..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white"
          />
          <div className="flex items-center justify-end gap-3 mt-3">
            {saved && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Kaydedildi</span>}
            <button
              onClick={save}
              disabled={saving}
              className="bg-gray-900 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor</> : 'Notu Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
