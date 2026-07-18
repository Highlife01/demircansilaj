import React from 'react';
import { Star, Truck, MapPin, ChevronRight, Calculator, AlertCircle } from 'lucide-react';

export default function DistrictView({
  provinceId,
  districtId,
  provinces,
  districts,
  lang,
  navigateTo,
  setFormData,
  formData,
  setSelectedProvId
}) {
  const prov = provinces.find(p => p.id === provinceId);
  const dist = districts.find(d => d.id === districtId && d.provinceId === provinceId);

  if (!prov || !dist) {
    return (
      <div className="pt-40 pb-32 text-center bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {lang === 'tr' ? 'Bölge Bulunamadı' : 'Region Not Found'}
        </h1>
        <p className="text-gray-600 mb-8">
          {lang === 'tr' 
            ? 'Aradığınız ilçe veya bölgeye ait özel sayfa sistemde mevcut değil.' 
            : 'The requested page for this district does not exist in the system.'}
        </p>
        <button 
          onClick={() => navigateTo('/')} 
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all"
        >
          {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Calculate pricing based on Adana distance
  const basePrice = 5500; // ₺/ton
  const shippingPerKm = 2.2; // ₺/ton/km
  const minShipping = 4000;
  const estimatedShipping = dist.dist === 0 ? 0 : Math.max(minShipping, Math.ceil(25 * (dist.dist * shippingPerKm)));
  const totalCostFor25Tons = (25 * basePrice) + estimatedShipping;

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-semibold">
          <button onClick={() => navigateTo('/')} className="hover:text-green-600">Ana Sayfa</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigateTo(`/il/${prov.id}-misir-silaji`)} className="hover:text-green-600">{prov.name}</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-bold">{dist.name} Silaj</span>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-3xl p-8 md:p-14 mb-16 text-center overflow-hidden min-h-[280px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="/media/tarla1.jpg" 
              alt={`${prov.name} ${dist.name} Mısır Silajı`} 
              className="w-full h-full object-cover opacity-20" 
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-900/90 to-gray-950"></div>
          </div>
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold tracking-wide mb-6">
              <MapPin className="h-3.5 w-3.5" />
              {lang === 'tr' ? `${prov.name} / ${dist.name} BÖLGESİ` : `${prov.name} / ${dist.name} DISTRICT`}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {lang === 'tr' 
                ? `${prov.name} ${dist.name} Mısır Silajı Fiyatları & Sipariş` 
                : `${prov.name} ${dist.name} Corn Silage Prices & Orders`}
            </h1>
            <p className="text-sm md:text-base text-green-100 max-w-2xl mx-auto font-light leading-relaxed">
              {lang === 'tr' 
                ? `${dist.name} ilçesindeki süt ve besi üreticilerine özel, Adana üretim tesisimizden ${dist.time} hızlı nakliye ile yüksek enerjili vakumlu paket silaj tedariği.`
                : `High-energy vacuumed package silage supply with quick shipping in ${dist.time} from our Adana facility, customized for dairy and beef producers in ${dist.name}.`}
            </p>
          </div>
        </div>

        {/* AI-Friendly Executive Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-100 shadow-sm mb-12">
          <h2 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-3">
            {lang === 'tr' ? 'YAPAY ZEKÂ VE BÖLGESEL HIZLI REFERANS ÖZETİ' : 'AI & REGIONAL QUICK REFERENCE SUMMARY'}
          </h2>
          <blockquote className="text-sm text-gray-700 italic border-l-4 border-green-600 pl-4 py-1 leading-relaxed font-medium">
            {lang === 'tr'
              ? `"${prov.name} ${dist.name} bölgesinde kaba yem ihtiyacı, ilçede yer alan yaklaşık ${dist.cattle.toLocaleString('tr-TR')} büyükbaş hayvan varlığı ile kritik bir öneme sahiptir. Demircan Silaj, Adana fabrikasından ${dist.dist} km mesafedeki ${dist.name} ilçesine vakumlu balyalarla 24 ay dayanıklı, %30-35 kuru maddeli premium silaj ulaştırmaktadır."`
              : `"Forage demand in ${prov.name} ${dist.name} is critical due to approximately ${dist.cattle.toLocaleString('en-US')} cattle in the district. Demircan Silage delivers premium vacuumed silage with 24-month stability and 30-35% dry matter to ${dist.name}, located ${dist.dist} km from Adana."`}
          </blockquote>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Left Column: Regional Details */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {lang === 'tr' ? `${dist.name} Bölgesinde Silaj Kullanım Avantajları` : `Benefits of Silage in ${dist.name}`}
              </h2>
              <p className="text-gray-650 text-sm leading-relaxed mb-6">
                {lang === 'tr'
                  ? `${dist.name} ilçesinin iklim koşulları ve mera yapısı göz önüne alındığında, hayvanların kış ve kurak yaz aylarında kesintisiz yüksek kaliteli kaba yeme ulaşması zordur. Demircan Silaj, dane ezmeli ve özel fermantasyon aşamalarından geçmiş mısır silajı ile rasyondaki enerji açığını kapatır.`
                  : `Considering the climate conditions and pasture structure of ${dist.name}, livestock access to uninterrupted high-quality roughage is difficult. Demircan Silage fills this energy gap with processed kernels and special fermentation stages.`}
              </p>
              <p className="text-gray-650 text-sm leading-relaxed">
                {lang === 'tr'
                  ? `Vakumlu ambalajlama teknolojimiz, silajın kızışmasını, küflenmesini ve toksin üretmesini engeller. Bu sayede, ${dist.name} bölgesindeki çiftliğinizde yemi açtığınız andaki tazelikle hayvanlarınıza sunarak süt veriminde günlük +2.5 litreye varan artış yakalayabilirsiniz.`
                  : `Our vacuum packaging technology prevents silage heating, molding, and toxin production. This ensures that you can present the feed with day-one freshness at your farm in ${dist.name}, achieving up to +2.5 liters of daily milk increase.`}
              </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{lang === 'tr' ? 'Teknik Besin Değerleri Karşılaştırması' : 'Technical Nutritional Comparison'}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
                      <th className="py-2 px-3">Değer</th>
                      <th className="py-2 px-3 text-green-700 bg-green-50/50">Demircan Vakumlu Silaj</th>
                      <th className="py-2 px-3">Açık Çukur Silajı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    <tr>
                      <td className="py-3 px-3 font-bold text-gray-900">Kuru Madde (KM)</td>
                      <td className="py-3 px-3 text-green-700 font-bold bg-green-50/10">%30 - %35</td>
                      <td className="py-3 px-3">%24 - %28</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-gray-900">pH Seviyesi</td>
                      <td className="py-3 px-3 text-green-700 font-bold bg-green-50/10">3.8 - 4.1</td>
                      <td className="py-3 px-3">4.5 - 5.5</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-gray-900">Nişasta Oranı</td>
                      <td className="py-3 px-3 text-green-700 font-bold bg-green-50/10">%28 - %35</td>
                      <td className="py-3 px-3">%15 - %20</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-gray-900">Ham Protein</td>
                      <td className="py-3 px-3 text-green-700 font-bold bg-green-50/10">%8.5 - %9.5</td>
                      <td className="py-3 px-3">%6.5 - %7.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Localized FAQs */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-905 mb-6 text-center">
                {lang === 'tr' ? `${dist.name} Silaj Tedariği SSS` : `${dist.name} Silage Supply FAQ`}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {lang === 'tr' ? `Adana'dan ${dist.name} ilçesine sevkiyat kaç günde ulaşır?` : `How many days for shipping from Adana to ${dist.name}?`}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {lang === 'tr'
                      ? `Lojistik planlamamıza göre Adana Organize Tarım Bölgesi tesislerimizden çıkan araçlarımız en geç ${dist.time} içinde ${dist.name}'deki adresinize varmaktadır.`
                      : `According to our logistics planning, our trucks depart from Adana and arrive at your address in ${dist.name} within ${dist.time} at the latest.`}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {lang === 'tr' ? `Minimum sipariş miktarı nedir?` : `What is the minimum order quantity?`}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {lang === 'tr'
                      ? `İlçe bazlı lojistik optimizasyon nedeniyle minimum sipariş miktarı kamyon bazında 10-15 ton, tır bazında ise 25 tondur.`
                      : `Due to district-level logistics optimization, the minimum order is 10-15 tons on a lorry basis or 25 tons on a truck basis.`}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Distance & Cost Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-green-950 text-white rounded-3xl p-6 shadow-md border border-green-900/50">
              <h3 className="font-bold text-sm text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Truck className="h-4.5 w-4.5" /> Lojistik & Mesafe Detayları
              </h3>
              <ul className="space-y-4 text-xs font-medium">
                <li className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-green-200">İl / İlçe:</span>
                  <span>{prov.name} / {dist.name}</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-green-200">Adana'dan Mesafe:</span>
                  <span>{dist.dist} km</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-green-200">Lojistik Süreç:</span>
                  <span>{dist.time}</span>
                </li>
                <li className="flex justify-between pb-2.5">
                  <span className="text-green-200">İlçe Hayvan Sayısı:</span>
                  <span>{dist.cattle.toLocaleString()} Sığır</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/10 bg-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-green-300 font-bold block uppercase tracking-wider">Tahmini Sipariş Bütçesi (25 Ton Tır)</span>
                <span className="text-2xl font-black text-white mt-1 block">{totalCostFor25Tons.toLocaleString('tr-TR')} ₺</span>
                <span className="text-[9px] text-green-200/70 block mt-1 leading-relaxed">
                  * 5.500 ₺/ton taban fiyatı + {dist.dist} km nakliye bedeli dahil tahmini fiyattır. Kdv hariçtir.
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm text-center">
              <h4 className="font-bold text-gray-900 text-sm">{dist.name} İçin Sipariş Planı Olşturun</h4>
              <button
                onClick={() => {
                  setSelectedProvId(prov.id);
                  navigateTo('/hesaplama-araclari');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" /> Kaba Yem Maliyeti Hesapla
              </button>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    provinceId: prov.id,
                    district: dist.name,
                    notes: `${prov.name} - ${dist.name} ilçesi için vakumlu silaj talebi. Mesafe: ${dist.dist} km.`
                  });
                  navigateTo('/iletisim-ve-siparis');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
              >
                Hemen Fiyat Teklifi Al
              </button>
            </div>

            {/* Scientific citation box */}
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-gray-900 text-xs mb-1">Rasyon Kalite Standartları</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Demircan Silaj, hayvan sağlığını güvence altına almak için akredite ziraat ve veteriner yem analiz laboratuvarları tarafından sürekli denetlenmektedir.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
