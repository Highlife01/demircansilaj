import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Quote, ChevronRight, 
  Loader2, MessageCircle, CheckCircle, AlertCircle, Send 
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, ORDERS_COLLECTION, MESSAGES_COLLECTION } from '../firebase';
import { provinces } from '../data/provinces.js';
import { orderFormRateLimiter, contactFormRateLimiter } from '../utils/rateLimiter.js';

const productPrices = {
  '1000kg': 5500,
  '500kg': 5500,
  'dokme': 5000,
  'diger': 5500
};

const productNames = {
  '1000kg': '1000 kg Vakumlu Mısır Silajı',
  '500kg': '500 kg Vakumlu Mısır Silajı',
  'dokme': 'Dökme Mısır Silajı',
  'diger': 'Diğer (Yonca, Fiğ vb.)'
};

export default function ContactView({ 
  t, 
  lang, 
  formData, 
  setFormData 
}) {
  const [orderStatus, setOrderStatus] = useState('idle');
  const [contactStatus, setContactStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);
  
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus('sending');
    
    // Safety check / sanitization
    const sanitizedName = formData.name.replace(/[<>]/g, "");
    const sanitizedPhone = formData.phone.replace(/[<>]/g, "");
    const activeProv = provinces.find(p => p.id === formData.provinceId) || provinces[0];
    const sanitizedDistrict = formData.district.replace(/[<>]/g, "");
    const finalLocation = `${activeProv.name} / ${sanitizedDistrict}`;
    const sanitizedNotes = formData.notes.replace(/[<>]/g, "");
    
    const productCost = formData.quantity * productPrices[formData.productType];
    const shippingCost = activeProv.dist === 0 ? 0 : Math.max(4000, Math.ceil(formData.quantity * (activeProv.dist * 2.2)));
    const totalPrice = productCost + shippingCost;
    
    try {
      // Save order to Firestore
      await addDoc(collection(db, ORDERS_COLLECTION), {
        name: sanitizedName,
        phone: sanitizedPhone,
        location: finalLocation,
        productType: formData.productType,
        productName: productNames[formData.productType],
        quantity: formData.quantity,
        totalPrice: totalPrice,
        productCost: productCost,
        shippingCost: shippingCost,
        notes: sanitizedNotes,
        status: 'new',
        createdAt: serverTimestamp()
      });
      
      setOrderStatus('success');
      
      // WhatsApp message generation
      const message = `Merhaba Demircan Silaj,\n\nWeb siteniz üzerinden yeni bir teklif talebi oluşturdum:\n\n👤 *Ad Soyad / Firma:* ${sanitizedName}\n📞 *Telefon:* ${sanitizedPhone}\n📍 *İl / İlçe:* ${finalLocation}\n🌾 *Ürün Tipi:* ${productNames[formData.productType]}\n⚖️ *Miktar:* ${formData.quantity} Ton\n💰 *Tahmini Ürün Bedeli:* ${productCost.toLocaleString('tr-TR')} ₺\n🚚 *Tahmini Nakliye Bedeli:* ${shippingCost === 0 ? 'Mesafe Yok' : `${shippingCost.toLocaleString('tr-TR')} ₺`}\n💳 *Toplam Tahmini Bütçe:* ${totalPrice.toLocaleString('tr-TR')} ₺\n💬 *Notlar:* ${sanitizedNotes || 'Belirtilmedi'}\n\nLütfen lojistik ve fiyat teklifi için iletişime geçiniz. Teşekkürler.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/905323272383?text=${encodedMessage}`;
      
      // Open in new tab safely
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        location: '',
        provinceId: 'konya',
        district: '',
        quantity: 20,
        productType: '1000kg',
        notes: ''
      });
      
    } catch (error) {
      console.error("Firestore saving error: ", error);
      setOrderStatus('error');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');

    const sanitizedName = contactData.name.replace(/[<>]/g, "");
    const sanitizedPhone = contactData.phone.replace(/[<>]/g, "");
    const sanitizedEmail = contactData.email.replace(/[<>]/g, "");
    const sanitizedMessage = contactData.message.replace(/[<>]/g, "");

    try {
      await addDoc(collection(db, MESSAGES_COLLECTION), {
        name: sanitizedName,
        phone: sanitizedPhone,
        email: sanitizedEmail,
        message: sanitizedMessage,
        createdAt: serverTimestamp()
      });

      setContactStatus('success');
      setContactData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 6000);

    } catch (error) {
      console.error("Contact message save error: ", error);
      setContactStatus('error');
      setTimeout(() => setContactStatus('idle'), 6000);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Sipariş & İletişim</h1>
          <p className="text-lg text-gray-605 max-w-2xl mx-auto">
            Türkiye'nin neresinde olursanız olun, yüksek kaliteli silaj siparişleriniz için bize ulaşın. Size özel fiyatlandırma ve lojistik çözümleri sunalım.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Contact Info (Left Side) */}
          <div className="lg:col-span-2 bg-green-950 p-10 md:p-12 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Bize Ulaşın</h2>
              <p className="text-green-200/80 mb-12 text-sm leading-relaxed font-light">
                Toptan alım, lojistik detaylar veya ürün kalitesi hakkında merak ettiğiniz tüm sorularınız için uzman ekibimiz hizmetinizde.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-green-900/60 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">Müşteri Hizmetleri & Satış</p>
                    <p className="text-xl font-bold">+90 532 327 23 83</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-900/60 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">E-Posta Adresimiz</p>
                    <p className="text-lg font-bold">info@demircansilaj.com.tr</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-900/60 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">Fabrika & Depo</p>
                    <p className="text-sm font-semibold leading-relaxed">Organize Tarım Bölgesi, Merkez Mah.<br/>Tarım Sk. No:12 Adana / Türkiye</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <div className="bg-green-900/40 p-6 rounded-2xl border border-green-800/40">
                <p className="text-sm text-green-200 italic flex items-start leading-relaxed">
                  <Quote className="h-5 w-5 text-yellow-500 mr-2 shrink-0" />
                  "Kaliteli silaj rasyon maliyetlerinizi düşürürken, süt verimini rasyonel bir şekilde artırır."
                </p>
              </div>
            </div>
          </div>

          {/* Order Form (Right Side) */}
          <div className="lg:col-span-3 p-10 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">{t('contactPage.formTitle')}</h3>
            <p className="text-sm text-gray-500 mb-6 font-light leading-relaxed">{t('contactPage.formDesc')}</p>
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contactPage.name')} *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm" 
                    placeholder="Ahmet Yılmaz" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contactPage.phone')} *</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm" 
                    placeholder="0555 123 45 67" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Advanced location: Province select + district text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('calculatorsPage.selectProv')} *</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm text-gray-700 cursor-pointer"
                    value={formData.provinceId}
                    onChange={(e) => setFormData({...formData, provinceId: e.target.value})}
                    required
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contactPage.location')} ({t('contactPage.provPlaceholder').replace('...', '')}) *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm" 
                    placeholder="Karatay / Çiftlik Köyü" 
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contactPage.productType')}</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm text-gray-700 cursor-pointer"
                    value={formData.productType}
                    onChange={(e) => setFormData({...formData, productType: e.target.value})}
                  >
                    <option value="1000kg">{t('productsPage.types.1000kg.title')} (5.500 ₺/Ton)</option>
                    <option value="500kg">{t('productsPage.types.500kg.title')} (5.500 ₺/Ton)</option>
                    <option value="dokme">{t('productsPage.types.dokme.title')} (5.000 ₺/Ton)</option>
                    <option value="diger">{t('productsPage.types.diger.title')} (5.500 ₺/Ton)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{t('contactPage.quantity')}</label>
                    <span className="bg-green-100 text-green-800 text-sm font-extrabold px-3 py-1 rounded-full">{formData.quantity} Ton</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="200" 
                    step="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between text-xs text-gray-450 mt-1 font-medium">
                    <span>5 Ton</span>
                    <span>100 Ton</span>
                    <span>200 Ton</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Cost Breakdowns (WOW factor) */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{t('contactPage.shippingNotice')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('calculatorsPage.productPrice')}</span>
                    <span className="text-base font-extrabold text-gray-900 mt-1 block">{(formData.quantity * productPrices[formData.productType]).toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('contactPage.shippingCost')}</span>
                    <span className="text-base font-extrabold text-gray-900 mt-1 block">
                      {formData.provinceId === 'adana' ? t('calculatorsPage.noDistance') : `${(formData.provinceId === 'adana' ? 0 : Math.max(4000, Math.ceil(formData.quantity * ((provinces.find(p => p.id === formData.provinceId) || provinces[0]).dist * 2.2)))).toLocaleString('tr-TR')} ₺`}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">({(provinces.find(p => p.id === formData.provinceId) || provinces[0]).dist} km)</span>
                  </div>
                  <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 text-left">
                    <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block">{t('contactPage.totalCost')}</span>
                    <span className="text-base font-black text-green-800 mt-1 block">
                      {((formData.quantity * productPrices[formData.productType]) + (formData.provinceId === 'adana' ? 0 : Math.max(4000, Math.ceil(formData.quantity * ((provinces.find(p => p.id === formData.provinceId) || provinces[0]).dist * 2.2))))).toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[9px] text-green-600 block mt-0.5">{t('calculatorsPage.budgetNotice')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contactPage.notes')}</label>
                <textarea 
                  rows="3" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm resize-none" 
                  placeholder={lang === 'tr' ? "Lojistik durumu, özel istekler veya sorularınızı buraya yazabilirsiniz..." : "Write logistics details, special requests or questions here..."}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={orderStatus === 'sending'}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-base py-4 rounded-xl hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {orderStatus === 'sending' ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> {lang === 'tr' ? 'İletiliyor...' : 'Sending...'}</>
                  ) : (
                    <><MessageCircle className="h-5 w-5" /> {t('contactPage.submitOrder')}</>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">{lang === 'tr' ? 'Talebiniz kaydedildikten sonra sizi WhatsApp yetkilisine yönlendirecektir.' : 'Your request will redirect you to WhatsApp after being saved.'}</p>
                
                {orderStatus === 'success' && (
                  <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3 mt-4">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
                    <span>{t('contactPage.successMsg')}</span>
                  </div>
                )}
                {orderStatus === 'error' && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3 mt-4">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <span>{t('contactPage.errorMsg')}</span>
                  </div>
                )}
              </div>

            </form>
          </div>
        </div>

        {/* İletişim Mesaj Formu */}
        <div className="mt-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 md:p-12 bg-gradient-to-br from-gray-900 to-green-950 text-white flex flex-col justify-center">
              <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-white/10 border border-white/15 text-green-300 text-xs font-semibold tracking-wide mb-6 w-fit">
                <MessageCircle className="h-4 w-4 mr-2" /> BİZE YAZIN
              </span>
              <h3 className="text-3xl font-bold mb-5 leading-tight">Sorunuz mu var?<br/>Mesaj bırakın.</h3>
              <p className="text-gray-300/90 text-sm leading-relaxed font-light mb-8">
                Sipariş vermeden önce ürünlerimiz, lojistik veya kalite hakkında merak ettiklerinizi buradan iletebilirsiniz. Mesajınız doğrudan ekibimize ulaşır, en kısa sürede geri dönüş yaparız.
              </p>
              <div className="space-y-4 text-sm">
                <div className="flex items-center"><Phone className="h-5 w-5 text-green-400 mr-3 shrink-0" /> +90 532 327 23 83</div>
                <div className="flex items-center"><Mail className="h-5 w-5 text-green-400 mr-3 shrink-0" /> info@demircansilaj.com.tr</div>
              </div>
            </div>

            <div className="p-10 md:p-12">
              <form className="space-y-5" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adınız *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                      placeholder="Adınız Soyadınız"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                      placeholder="0555 123 45 67"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">E-Posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                    placeholder="ornek@mail.com"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mesajınız *</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full bg-gray-900 hover:bg-green-700 text-white font-bold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {contactStatus === 'sending' ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Gönderiliyor...</>
                  ) : (
                    <><Send className="h-5 w-5" /> Mesajı Gönder</>
                  )}
                </button>

                {contactStatus === 'success' && (
                  <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3 mt-4">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
                    <span>Mesajınız başarıyla gönderildi. Teşekkür ederiz, en kısa sürede dönüş yapacağız.</span>
                  </div>
                )}
                {contactStatus === 'error' && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3 mt-4">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <span>Mesaj gönderilemedi. Lütfen tekrar deneyin veya telefonla ulaşın.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-sm text-gray-500">Mısır silajı alımı, saklama koşulları ve lojistik süreçlerle ilgili bilmek istedikleriniz.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: "Vakumlu mısır silajının raf ömrü ne kadardır?",
                a: "Özel vakumlama ve presleme teknolojimiz sayesinde, balyalarımızın dış ambalajı zarar görmediği sürece besin değerini kaybetmeden 24 ay boyunca taze kalır."
              },
              {
                q: "Minimum sipariş miktarı ne kadardır?",
                a: "Kendi araç filomuzla lojistik maliyetlerini minimize etmek adına minimum sipariş miktarı 10 ton (kamyon bazlı) veya 25 tondur (tır bazlı). Daha küçük miktarlar için lütfen bizimle iletişime geçin."
              },
              {
                q: "Kuru madde oranını nasıl kontrol ediyorsunuz?",
                a: "Hasat zamanı tarlada anlık nem ölçerlerle yaptığımız kontrollerin yanı sıra, hasat sonrasında her parti üründen numuneler alarak akredite laboratuvarlarda kuru madde ve besin değeri analizlerini gerçekleştiriyoruz."
              },
              {
                q: "Lojistik ve nakliye süreci nasıl işliyor?",
                a: "Adana merkezli fabrikamızdan Türkiye'nin her iline anlaşmalı tır ve kamyon filomuzla kapınıza kadar teslimat sağlıyoruz. Nakliye ücreti sipariş tonajına ve teslimat yerine göre hesaplanarak teklife eklenir."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left font-bold text-gray-900 hover:text-green-700 transition-colors flex justify-between items-center text-sm md:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${openFaq === index ? 'rotate-90 text-green-600' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
