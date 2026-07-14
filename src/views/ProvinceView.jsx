import React from 'react';
import { Star, Truck } from 'lucide-react';

export default function ProvinceView({ 
  provinceId, 
  provinces, 
  lang, 
  navigateTo, 
  setFormData, 
  formData, 
  setSelectedProvId 
}) {
  const prov = provinces.find(p => p.id === provinceId);

  if (!prov) {
    return (
      <div className="pt-40 pb-32 text-center bg-gray-55 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {lang === 'tr' ? 'Sayfa Bulunamadı' : 'Page Not Found'}
        </h1>
        <p className="text-gray-600 mb-8">
          {lang === 'tr' ? 'Aradığınız bölgeye ait özel sayfa sistemde mevcut değil.' : 'The requested page for this province does not exist in the system.'}
        </p>
        <button 
          onClick={() => navigateTo('/')} 
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer"
        >
          {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Card with dynamic background */}
        <div className="relative rounded-3xl p-10 md:p-16 mb-20 text-center overflow-hidden min-h-[300px] flex items-center justify-center">
           <div className="absolute inset-0 z-0">
             <img 
               src="/media/tarla1.jpg" 
               alt={`${prov.name} Mısır Silajı Tedariği`} 
               className="w-full h-full object-cover opacity-25" 
               loading="eager"
               fetchpriority="high"
             />
             <div className="absolute inset-0 bg-gradient-to-br from-green-955 via-green-900/90 to-black/85"></div>
           </div>
           <div className="relative z-10 max-w-4xl">
              <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold tracking-wide mb-6">
                {lang === 'tr' ? 'BÖLGESEL HİZMET & LOJİSTİK' : 'REGIONAL SERVICE & LOGISTICS'}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {lang === 'tr' ? `${prov.name} Mısır Silajı Fiyatları ve Satışı` : `${prov.name} Corn Silage Prices & Sales`}
              </h1>
              <p className="text-base md:text-lg text-green-100 max-w-3xl mx-auto font-light leading-relaxed">
                {lang === 'tr' 
                  ? `Adana tesislerimizden ${prov.name} genelindeki tüm çiftlik, kooperatif ve işletmelere doğrudan tır ve kamyon bazlı vakumlu mısır silajı sevkiyatı yapıyoruz.`
                  : `We ship vacuumed corn silage directly on a truck and lorry basis from our Adana facilities to all farms, cooperatives, and businesses throughout ${prov.name}.`}
              </p>
           </div>
        </div>

        {/* 3-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 items-center">
          {/* Column 1: Text */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="bg-green-100 p-2 rounded-xl text-green-600"><Star className="h-5 w-5 fill-current" /></span>
              {lang === 'tr' ? 'Bölgesel Rasyon Desteği' : 'Regional Ration Support'}
            </h2>
            <p className="text-gray-655 text-sm leading-relaxed mb-6">
              {lang === 'tr'
                ? `${prov.name} ilinde kayıtlı yaklaşık ${prov.cattle.toLocaleString('tr-TR')} büyükbaş ve ${prov.sheep.toLocaleString('tr-TR')} küçükbaş hayvan kapasitesi bulunmakta olup kaba yem rasyonu besi kalitesini doğrudan etkiler.`
                : `There is a registered capacity of approximately ${prov.cattle.toLocaleString('en-US')} cattle and ${prov.sheep.toLocaleString('en-US')} sheep in the province of ${prov.name}, and the roughage ration directly affects fattening quality.`}
            </p>
            <p className="text-gray-655 text-sm leading-relaxed mb-8">
              {lang === 'tr'
                ? 'Demircan Silaj, ideal %30-35 kuru madde oranı ve 3.8-4.1 pH dengesi ile hayvanlarınızın sindirim sistemini korur, rasyonel verimliliği artırarak rasyon giderlerinizi en aza indirir.'
                : 'Demircan Silage protects the digestive system of your animals with an ideal 30-35% dry matter ratio and 3.8-4.1 pH balance, maximizing efficiency and minimizing ration expenses.'}
            </p>
            <div className="bg-gray-55 border-l-4 border-yellow-500 p-5 rounded-r-2xl text-xs font-medium text-gray-700 italic leading-relaxed">
              {lang === 'tr'
                ? `"Kaba yem kalitesi, rasyondaki konsantre yem ihtiyacını azaltarak maliyetleri %20'ye kadar düşürür. Adana'dan yola çıkan filomuz en geç ${prov.time} içinde kapınızdadır."`
                : `"Roughage quality reduces the need for concentrate feed in the ration, lowering costs by up to 20%. Our fleet departing from Adana will be at your door within ${prov.time} at the latest."`}
            </div>
          </div>

          {/* Column 2: Image */}
          <div className="lg:col-span-1">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[3/4] max-w-sm mx-auto border border-gray-100">
              <img 
                src="/media/tarla2.jpg" 
                alt="Koçan ve Dane Olgunluğu Kontrolü" 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl text-white text-xs font-medium text-center">
                {lang === 'tr' ? 'Mısır Koçanı Olgunluk Kontrolü' : 'Corn Cob Ripeness Check'}
              </div>
            </div>
          </div>

          {/* Column 3: Logistics Details & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-green-55/50 border border-green-100 p-6 rounded-2xl">
              <h3 className="font-bold text-green-905 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <Truck className="h-4.5 w-4.5" /> {lang === 'tr' ? 'Lojistik Bilgi Tablosu' : 'Logistics Information Table'}
              </h3>
              <ul className="space-y-3.5 text-xs">
                <li className="flex justify-between border-b border-green-100/50 pb-2.5">
                  <span className="text-gray-505">{lang === 'tr' ? "Mesafe (Adana'dan):" : 'Distance (from Adana):'}</span>
                  <span className="font-bold text-gray-900">{prov.dist} km</span>
                </li>
                <li className="flex justify-between border-b border-green-100/50 pb-2.5">
                  <span className="text-gray-505">{lang === 'tr' ? 'Tahmini Nakliye Süresi:' : 'Estimated Shipping Time:'}</span>
                  <span className="font-bold text-gray-900">{prov.time}</span>
                </li>
                <li className="flex justify-between border-b border-green-100/50 pb-2.5">
                  <span className="text-gray-505">{lang === 'tr' ? 'Gönderim Seçenekleri:' : 'Shipping Options:'}</span>
                  <span className="font-bold text-gray-900">{lang === 'tr' ? 'Vakumlu Balyalı veya Dökme' : 'Vacuum Baled or Bulk'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-505">{lang === 'tr' ? 'Minimum Sipariş:' : 'Minimum Order:'}</span>
                  <span className="font-bold text-gray-900">{lang === 'tr' ? '10-15 Ton (Kamyon Bazlı)' : '10-15 Tons (Truck Based)'}</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white shadow-md border border-gray-150 p-5 rounded-2xl text-center">
                <div className="text-2xl font-black text-green-700 mb-1">
                  {prov.cattle > 100000 ? `${Math.floor(prov.cattle/1000)}k+` : prov.cattle.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                </div>
                <div className="text-[9px] font-bold text-gray-405 uppercase tracking-wider">
                  {lang === 'tr' ? 'Büyükbaş Hayvan' : 'Cattle'}
                </div>
              </div>
              <div className="bg-white shadow-md border border-gray-150 p-5 rounded-2xl text-center">
                <div className="text-2xl font-black text-green-700 mb-1">
                  {prov.sheep > 100000 ? `${Math.floor(prov.sheep/1000)}k+` : prov.sheep.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                </div>
                <div className="text-[9px] font-bold text-gray-405 uppercase tracking-wider">
                  {lang === 'tr' ? 'Küçükbaş Hayvan' : 'Sheep'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Region-Specific FAQ */}
        <div className="bg-gray-55 rounded-3xl p-8 md:p-12 mb-16 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {lang === 'tr' ? `${prov.name} İçin Sık Sorulan Sorular` : `Frequently Asked Questions for ${prov.name}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-850 text-sm mb-2">
                {lang === 'tr' ? `1. ${prov.name} teslimatlarında kargo/nakliye nasıl ücretlendirilir?` : `1. How is shipping priced for deliveries to ${prov.name}?`}
              </h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {lang === 'tr'
                  ? `Nakliye ücreti Adana depomuzdan ${prov.name} ilindeki teslimat adresinize olan ${prov.dist} km'lik karayolu mesafesi ve sipariş ettiğiniz tonaj miktarına göre tır veya kamyon bazında hesaplanarak net teklifimize yansıtılır.`
                  : `Shipping fees are calculated based on the road distance of ${prov.dist} km from our Adana warehouse to your delivery address in ${prov.name} and the tonnage of your order.`}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-850 text-sm mb-2">
                {lang === 'tr' ? `2. ${prov.name} bölgesinde kış aylarında silaj donar mı veya bozulur mu?` : `2. Does silage freeze or spoil in winter in the ${prov.name} region?`}
              </h4>
              <p className="text-gray-505 text-xs leading-relaxed">
                {lang === 'tr'
                  ? 'Özel vakumlu rulo balya teknolojimiz sayesinde ürünler hava almaz. Bu yüzden nem dengesi korunur ve kış donlarından ya da yaz sıcaklarından etkilenmeden 24 ay boyunca besin değerini korur.'
                  : 'Thanks to our special vacuumed round bale technology, the products do not breathe. Therefore, moisture balance is maintained and nutritional value is preserved for 24 months without being affected by winter frosts or summer heat.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-850 text-sm mb-2">
                {lang === 'tr' ? '3. Siparişi vermeden önce numune alabilir miyiz?' : '3. Can we request a sample before ordering?'}
              </h4>
              <p className="text-gray-505 text-xs leading-relaxed">
                {lang === 'tr'
                  ? 'Toptan alımlarda firmamızla iletişime geçerek laboratuvar analiz raporlarımızı inceleyebilir ve talep etmeniz halinde numune paketi sevkiyatını görüşebilirsiniz.'
                  : 'For wholesale purchases, you can contact us to examine our laboratory analysis reports and discuss sample package shipments if requested.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-850 text-sm mb-2">
                {lang === 'tr' ? '4. Ödeme koşulları nasıldır?' : '4. What are the payment terms?'}
              </h4>
              <p className="text-gray-505 text-xs leading-relaxed">
                {lang === 'tr'
                  ? 'Toptan silaj alımlarında ödeme koşulları ve vade durumları tonaja bağlı olarak karşılıklı görüşülür. Sipariş onayı sonrasında nakliye ve yükleme planlanır.'
                  : 'For wholesale silage purchases, payment terms and maturity status are discussed mutually depending on the tonnage. Shipping and loading are planned after order confirmation.'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center bg-green-955 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <h4 className="text-lg font-bold">
              {lang === 'tr' ? `${prov.name} Bölgesine Özel Fiyat Teklifi Alın` : `Get a Special Quote for ${prov.name} Region`}
            </h4>
            <p className="text-xs text-green-200/90 mt-1 font-light">
              {lang === 'tr' ? 'Lojistik avantajlı ton fiyatlarımızı öğrenmek ve sipariş planlamak için formumuzu kullanabilirsiniz.' : 'You can use our form to learn our logistically advantageous prices and plan your order.'}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setSelectedProvId(prov.id);
                navigateTo('/hesaplama-araclari');
              }} 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              {lang === 'tr' ? 'Maliyet Hesapla' : 'Calculate Cost'}
            </button>
            <button 
              onClick={() => {
                setFormData({
                  ...formData,
                  notes: `${prov.name} ili için sipariş/nakliye talebi.`
                });
                navigateTo('/iletisim-ve-siparis');
              }} 
              className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              {lang === 'tr' ? 'Hemen Sipariş Ver' : 'Order Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
