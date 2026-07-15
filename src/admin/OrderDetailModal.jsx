import React, { useEffect, useState } from 'react';
import {
  X, User, Phone, MapPin, Package, Weight, Banknote,
  Clock, StickyNote, Loader2, CheckCircle2, MessageSquare,
  Printer, Edit3, Check,
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

function printOrderReceipt(order) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  const dateStr = formatDate(order.createdAt);
  const totalVal = (order.totalPrice || 0).toLocaleString('tr-TR');
  const unitPrice = order.unitPrice || (order.totalPrice && order.quantity ? Math.round(order.totalPrice / order.quantity) : 5500);
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sipariş Fişi - ${order.name || 'Müşteri'}</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #16a34a; }
        .title { font-size: 20px; font-weight: bold; text-align: right; text-transform: uppercase; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .details-col h3 { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
        .details-col p { font-size: 14px; margin: 0; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #f4f4f4; padding: 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; border-bottom: 1px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; }
        .totals-row { display: flex; width: 300px; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.grand-total { border-top: 2px solid #333; font-size: 18px; font-weight: bold; color: #16a34a; padding-top: 12px; }
        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        .btn-print { background: #16a34a; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
        @media print {
          .btn-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">Yazdır</button>
      <div class="header">
        <div class="logo">DEMİRCAN SİLAJ</div>
        <div class="title">Sipariş Fişi</div>
      </div>
      
      <div class="details">
        <div class="details-col">
          <h3>Müşteri / Firma</h3>
          <p>${order.name || '—'}</p>
          <p style="font-weight: normal; margin-top: 5px;">Tel: ${order.phone || '—'}</p>
          <p style="font-weight: normal;">Konum: ${order.location || '—'}</p>
        </div>
        <div class="details-col" style="text-align: right;">
          <h3>Fiş Bilgileri</h3>
          <p>Tarih: ${dateStr}</p>
          <p style="font-weight: normal; margin-top: 5px;">Sipariş No: #${order.id.slice(0, 8).toUpperCase()}</p>
          <p style="font-weight: normal;">Durum: ${order.status === 'completed' ? 'Tamamlandı' : order.status === 'cancelled' ? 'İptal' : order.status === 'contacted' ? 'Görüşüldü' : 'Yeni'}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Ürün Açıklaması</th>
            <th style="text-align: right;">Birim Fiyat</th>
            <th style="text-align: right;">Miktar (Ton)</th>
            <th style="text-align: right;">Ara Toplam</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${order.productName || order.productType}</td>
            <td style="text-align: right;">${unitPrice.toLocaleString('tr-TR')} ₺/Ton</td>
            <td style="text-align: right;">${order.quantity} Ton</td>
            <td style="text-align: right;">${totalVal} ₺</td>
          </tr>
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row">
          <span>Ürün & Lojistik Bedeli:</span>
          <span>${totalVal} ₺</span>
        </div>
        <div class="totals-row grand-total">
          <span>Toplam Tutar:</span>
          <span>${totalVal} ₺</span>
        </div>
      </div>

      ${order.notes ? `
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        <h3 style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px;">Müşteri Notu</h3>
        <p style="font-size: 13px; margin: 0; font-style: italic;">${order.notes}</p>
      </div>` : ''}

      ${order.adminNote ? `
      <div style="margin-top: 20px; border-top: 1px dashed #eee; padding-top: 15px;">
        <h3 style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px;">Yönetici Notu</h3>
        <p style="font-size: 13px; margin: 0; color: #555;">${order.adminNote}</p>
      </div>` : ''}
      
      <div class="footer">
        <p>Demircan Silaj — Premium Vakumlu Mısır Silajı ve Kaba Yem Üretimi</p>
        <p>www.demircansilaj.com.tr | info@demircansilaj.com.tr | +90 532 327 23 83</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
}

export default function OrderDetailModal({ order, onClose, onSaveNote, onStatus, onUpdateOrder }) {
  const [note, setNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({
    name: order.name || '',
    phone: order.phone || '',
    location: order.location || '',
    productName: order.productName || order.productType || '',
    quantity: order.quantity || 0,
    unitPrice: order.unitPrice || (order.totalPrice && order.quantity ? Math.round(order.totalPrice / order.quantity) : 5500)
  });

  // Keep state sync when order changes
  useEffect(() => {
    setEditedFields({
      name: order.name || '',
      phone: order.phone || '',
      location: order.location || '',
      productName: order.productName || order.productType || '',
      quantity: order.quantity || 0,
      unitPrice: order.unitPrice || (order.totalPrice && order.quantity ? Math.round(order.totalPrice / order.quantity) : 5500)
    });
    setNote(order.adminNote || '');
  }, [order]);

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

  const handleUpdate = async () => {
    setSaving(true);
    const updated = {
      name: editedFields.name,
      phone: editedFields.phone,
      location: editedFields.location,
      productName: editedFields.productName,
      quantity: Number(editedFields.quantity),
      unitPrice: Number(editedFields.unitPrice),
      totalPrice: Number(editedFields.quantity) * Number(editedFields.unitPrice)
    };
    await onUpdateOrder(order.id, updated);
    setSaving(false);
    setIsEditing(false);
  };

  const calculatedTotal = Number(editedFields.quantity) * Number(editedFields.unitPrice);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sipariş Detayı</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => printOrderReceipt(order)} 
              title="Yazdır / Fiş Oluştur"
              className="p-2 rounded-lg text-gray-500 hover:text-green-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              title="Düzenle"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${isEditing ? 'text-green-700 bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="px-6 py-5 space-y-4 text-left">
            <div className="text-sm font-bold text-green-700 border-b border-green-100 pb-2 flex items-center gap-1.5">
              <Edit3 className="h-4 w-4" /> Düzenleme Modu
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Müşteri Adı / Firma</label>
              <input 
                type="text" 
                value={editedFields.name}
                onChange={(e) => setEditedFields({...editedFields, name: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefon</label>
              <input 
                type="text" 
                value={editedFields.phone}
                onChange={(e) => setEditedFields({...editedFields, phone: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">İl / İlçe</label>
              <input 
                type="text" 
                value={editedFields.location}
                onChange={(e) => setEditedFields({...editedFields, location: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ürün Tipi / Adı</label>
              <input 
                type="text" 
                value={editedFields.productName}
                onChange={(e) => setEditedFields({...editedFields, productName: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Miktar (Ton)</label>
                <input 
                  type="number" 
                  value={editedFields.quantity}
                  onChange={(e) => setEditedFields({...editedFields, quantity: Number(e.target.value)})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Birim Fiyat (₺/Ton)</label>
                <input 
                  type="number" 
                  value={editedFields.unitPrice}
                  onChange={(e) => setEditedFields({...editedFields, unitPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center text-sm font-semibold">
              <span className="text-green-800">Hesaplanan Yeni Tutar:</span>
              <span className="text-green-700 font-extrabold text-lg">{calculatedTotal.toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Kaydet
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 divide-y divide-gray-50 text-left">
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
                <Row icon={<Banknote className="h-4 w-4" />} label="Toplam Tutar">
                  <span className="text-green-700 font-bold">{(order.totalPrice || 0).toLocaleString('tr-TR')} ₺</span>
                  {order.unitPrice && (
                    <span className="text-[10px] text-gray-400 block font-normal">(Birim: {order.unitPrice} ₺/Ton)</span>
                  )}
                </Row>
              </div>
              {order.notes && (
                <Row icon={<StickyNote className="h-4 w-4" />} label="Müşteri Notu">{order.notes}</Row>
              )}
            </div>

            {/* Durum */}
            <div className="px-6 py-4 border-t border-gray-100 text-left">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Durum</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => {
                  const active = (order.status || 'new') === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => onStatus(order.id, s.value)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active ? `${s.className} text-white shadow` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* İç not */}
            <div className="px-6 py-4 border-t border-gray-100 text-left">
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
                  className="bg-gray-900 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor</> : 'Notu Kaydet'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
