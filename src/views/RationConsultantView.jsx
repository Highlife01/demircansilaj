import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, ShieldCheck, Download, Sparkles, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Send, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, PRICING_RULES_COLLECTION } from '../firebase';

const DEFAULT_PRICES = {
  baseProductPrice: 5500,      // ₺/ton
  shippingMinFee: 4000,        // ₺
  shippingPerKm: 2.2,          // ₺ per ton per km
  concentrateCost: 120,        // ₺
  forageCost: 60,              // ₺
  silagePrice: 5.5,            // ₺/kg
  milkPrice: 15,               // ₺/liter
  milkIncreasePerCow: 2.5,     // liters/day
  concentrateReduction: 0.30   // 30% reduction with silage
};

export default function RationConsultantView({ navigateTo, setFormData }) {
  const [pricing, setPricing] = useState(DEFAULT_PRICES);
  const [step, setStep] = useState(1); // 1: Profil, 2: Rasyon, 3: Rapor

  // Step 1: Profil
  const [animalType, setAnimalType] = useState('sut'); // sut: Süt İneği, besi: Besi Danası
  const [animalCount, setAnimalCount] = useState(50);
  const [avgMilkYield, setAvgMilkYield] = useState(25); // Litre/Gün (Sadece süt için)

  // Step 2: Mevcut Rasyon Giderleri (Varsayılan değerleri pazar ortalamasına göre dolduruyoruz)
  const [concentrateDaily, setConcentrateDaily] = useState(10); // kg/gün
  const [concentratePrice, setConcentratePrice] = useState(12.50); // ₺/kg
  const [forageDaily, setForageDaily] = useState(8); // kg/gün (Saman+Yonca vb.)
  const [foragePrice, setForagePrice] = useState(6.00); // ₺/kg

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, PRICING_RULES_COLLECTION, 'current');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPricing(snap.data());
          // Opsiyonel: Fiyatları veritabanına göre güncelle
          setConcentratePrice(snap.data().concentrateCost / 10 || 12.50); // Fiyat kurallarındaki ton bazındaysa kg'a bölüyoruz
          setForagePrice(snap.data().forageCost / 10 || 6.00);
        }
      } catch (err) {
        console.warn("Pricing rules fetch failed in consultant, using fallbacks:", err);
      }
    };
    if (db) fetchPricing();
  }, []);

  // Hesaplamalar (Aylık bazda - 30 gün)
  const days = 30;

  // 1. Mevcut Durum Maliyeti
  const dailyConcentrateCostCurrent = concentrateDaily * concentratePrice;
  const dailyForageCostCurrent = forageDaily * foragePrice;
  const dailyTotalCostCurrent = dailyConcentrateCostCurrent + dailyForageCostCurrent;
  const monthlyTotalCostCurrent = dailyTotalCostCurrent * animalCount * days;

  // 2. Demircan Silaj ile Optimize Edilmiş Durum
  // Rasyonda mısır silajı kullanımı: 
  // Süt inekleri için günlük 12 kg, besi danaları için günlük 8 kg idealdir.
  const silageDailyIntake = animalType === 'sut' ? 12 : 8;
  const silagePriceKg = pricing.silagePrice; // Örn: 5.5 ₺/kg
  const dailySilageCost = silageDailyIntake * silagePriceKg;

  // Silaj eklenince konsantre (fabrika) yemi tüketimi %30 (concentrateReduction) azalır.
  const concentrateReductionRate = pricing.concentrateReduction; // Örn: 0.30
  const optimizedConcentrateDaily = concentrateDaily * (1 - concentrateReductionRate);
  const dailyConcentrateCostOptimized = optimizedConcentrateDaily * concentratePrice;

  // Silaj yüksek lif ve besin içerdiğinden kaba yem (yonca/saman) ihtiyacı da %40 azalır.
  const forageReductionRate = 0.40; 
  const optimizedForageDaily = forageDaily * (1 - forageReductionRate);
  const dailyForageCostOptimized = optimizedForageDaily * foragePrice;

  const dailyTotalCostOptimized = dailyConcentrateCostOptimized + dailyForageCostOptimized + dailySilageCost;
  const monthlyTotalCostOptimized = dailyTotalCostOptimized * animalCount * days;

  // Yem Maliyet Tasarrufu
  const monthlyFeedSavings = monthlyTotalCostCurrent - monthlyTotalCostOptimized;

  // 3. Süt Verim ve Gelir Artışı (Sadece Süt İneği için)
  const milkPriceLitre = pricing.milkPrice; // ₺/litre
  const milkIncreasePerCow = pricing.milkIncreasePerCow; // Litre/gün
  const dailyMilkRevenueIncrease = animalType === 'sut' ? (milkIncreasePerCow * milkPriceLitre * animalCount) : 0;
  const monthlyMilkRevenueIncrease = dailyMilkRevenueIncrease * days;

  // Besi Danaları için günlük canlı ağırlık artışı kazancı (ROI)
  // Günlük ekstra 150 gr canlı ağırlık artışı, karkas et fiyatı ₺260/kg üzerinden
  const dailyBesiRevenueIncrease = animalType === 'besi' ? (0.150 * 260 * animalCount) : 0;
  const monthlyBesiRevenueIncrease = dailyBesiRevenueIncrease * days;

  const monthlyTotalRevenueIncrease = animalType === 'sut' ? monthlyMilkRevenueIncrease : monthlyBesiRevenueIncrease;

  // Net Aylık Kar Artışı (Tasarruf + Gelir Artışı)
  const monthlyNetBenefit = monthlyFeedSavings + monthlyTotalRevenueIncrease;
  const yearlyNetBenefit = monthlyNetBenefit * 12;

  const handlePrint = () => {
    window.print();
  };

  const handleApplyOffer = () => {
    // Form verilerini doldurup iletişim sayfasına yönlendir
    setFormData(prev => ({
      ...prev,
      quantity: Math.ceil((silageDailyIntake * animalCount * 90) / 1000), // 3 aylık silaj ihtiyacı (ton)
      productName: 'Mısır Silajı (Vakumlu Balya)',
      notes: `TMR AI Rasyon Danışmanı Raporu: ${animalCount} baş ${animalType === 'sut' ? 'Süt İneği' : 'Besi Danası'} için aylık rasyon optimizasyon talebi. Öngörülen 3 Aylık İhtiyaç: ${Math.ceil((silageDailyIntake * animalCount * 90) / 1000)} ton.`
    }));
    navigateTo('contact');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Yapay Zekâ Destekli Danışman
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            TMR Rasyon & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ROI Danışmanı</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Hayvan sayınızı ve mevcut rasyon maliyetlerinizi girin, işletmenizin Demircan Silaj ile elde edeceği aylık net kârlılığı anında raporlayalım.
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10 max-w-md mx-auto print:hidden">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                step === s 
                  ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' 
                  : step > s 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-emerald-500/40' : 'bg-slate-800'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 md:p-10 shadow-2xl relative backdrop-blur-md text-left print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* STEP 1: Profil Tanımı */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calculator className="text-emerald-400 h-5 w-5" /> Adım 1: Çiftlik Profiliniz
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hayvan Cinsi</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAnimalType('sut')}
                      className={`py-4 px-5 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        animalType === 'sut'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">🥛</span>
                      <span>Süt İneği</span>
                    </button>
                    <button
                      onClick={() => setAnimalType('besi')}
                      className={`py-4 px-5 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        animalType === 'besi'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">🥩</span>
                      <span>Besi Danası</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Toplam Hayvan Sayısı (Baş)</label>
                    <input
                      type="number"
                      min="1"
                      value={animalCount}
                      onChange={(e) => setAnimalCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-950 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  {animalType === 'sut' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ortalama Günlük Süt Verimi (Litre/İnek)</label>
                      <input
                        type="number"
                        min="5"
                        value={avgMilkYield}
                        onChange={(e) => setAvgMilkYield(Math.max(5, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-950 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Sonraki Adım <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mevcut Rasyon Giderleri */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp className="text-emerald-400 h-5 w-5" /> Adım 2: Mevcut Rasyon Tüketimleri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol kolon: Konsantre Yem */}
                <div className="space-y-4 bg-slate-950/40 border border-slate-850 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    ⚙️ Fabrika (Konsantre) Yemi Tüketimi
                  </h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Hayvan Başına Günlük Tüketim (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={concentrateDaily}
                      onChange={(e) => setConcentrateDaily(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-900 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Fabrika Yemi Birim Fiyatı (₺/Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={concentratePrice}
                      onChange={(e) => setConcentratePrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-900 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Sağ kolon: Diğer Kaba Yemler */}
                <div className="space-y-4 bg-slate-950/40 border border-slate-850 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    🌾 Kaba Yem (Saman, Yonca, Silaj vb.) Tüketimi
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Hayvan Başına Günlük Tüketim (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={forageDaily}
                      onChange={(e) => setForageDaily(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-900 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Ortalama Kaba Yem Birim Fiyatı (₺/Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={foragePrice}
                      onChange={(e) => setForagePrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-900 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 border border-slate-850 rounded-xl p-3.5">
                <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Rasyona yüksek nişastalı ve enerjili Demircan Silajı dahil edildiğinde, fabrika yemi tüketiminiz otomatik olarak <strong>%{pricing.concentrateReduction * 100}</strong> oranında düşürülerek hesaplanacaktır.</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Geri Dön
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Raporu Oluştur <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Analiz & ROI Raporu */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Rapor Üst Başlık */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 print:text-black">
                    <ShieldCheck className="text-emerald-400 h-6 w-6" /> Rasyon Optimizasyon & Finansal ROI Analizi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                    Mevcut Rasyon ile Demircan Silaj TMR Modeli karşılaştırmalı verimlilik raporudur.
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => setStep(2)}
                    className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Raporu PDF Yap
                  </button>
                </div>
              </div>

              {/* Temel ROI Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Kart 1: Yem Tasarrufu */}
                <div className="bg-slate-950/50 border border-slate-850/80 rounded-2xl p-5 print:border print:bg-slate-50 print:text-black">
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">Aylık Yem Gider Tasarrufu</span>
                  <span className="text-2xl font-black text-white block tabular-nums print:text-black">
                    +₺{Math.round(monthlyFeedSavings).toLocaleString('tr-TR')}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-2 font-light print:text-slate-600">
                    Fabrika yeminde %{pricing.concentrateReduction * 100} ve kaba yem ihtiyacında %40 azalma ile elde edilen net rasyon tasarrufu.
                  </p>
                </div>

                {/* Kart 2: Ek Gelir Artışı */}
                <div className="bg-slate-950/50 border border-slate-850/80 rounded-2xl p-5 print:border print:bg-slate-50 print:text-black">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                    {animalType === 'sut' ? 'Aylık Ek Süt Gelir Artışı' : 'Aylık Ek Canlı Ağırlık Artışı'}
                  </span>
                  <span className="text-2xl font-black text-white block tabular-nums print:text-black">
                    +₺{Math.round(monthlyTotalRevenueIncrease).toLocaleString('tr-TR')}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-2 font-light print:text-slate-600">
                    {animalType === 'sut' 
                      ? `İnek başı günlük ek ${pricing.milkIncreasePerCow} Litre süt artışı ve ₺${pricing.milkPrice}/Litre süt satış fiyatı baz alınmıştır.`
                      : "Canlı ağırlık artışında günlük ek 150 gram performans ve ₺260/kg karkas fiyatı baz alınmıştır."}
                  </p>
                </div>

                {/* Kart 3: Net Kazanç */}
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 shadow-lg shadow-emerald-500/5 print:border-emerald-500 print:bg-emerald-50 print:text-black">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">Net Aylık İşletme Kazancı</span>
                  <span className="text-2xl font-black text-emerald-400 block tabular-nums">
                    +₺{Math.round(monthlyNetBenefit).toLocaleString('tr-TR')}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2 font-light print:text-slate-600">
                    Yem gider tasarrufu ve verim artışı gelirlerinin toplamından, Demircan vakumlu silaj yatırımı düşülmüştür.
                  </p>
                </div>
              </div>

              {/* Yıllık Projeksiyon Banner */}
              <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:text-black print:border print:from-white print:to-white">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">YILLIK PROJEKSİYON</span>
                  <h4 className="text-lg font-bold text-white mt-0.5 print:text-black">Toplam Yıllık Ek Kârlılık</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
                    ₺{Math.round(yearlyNetBenefit).toLocaleString('tr-TR')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-light print:text-slate-600">
                    (Yıllık Toplam Net Kar Artışı)
                  </span>
                </div>
              </div>

              {/* Tablo Karşılaştırması */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black">Rasyon Gider & Gelir Dağılım Tablosu</h4>
                <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20 print:border-slate-300">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-450 font-bold uppercase tracking-wider bg-slate-950/60 print:bg-slate-100 print:text-black print:border-slate-350">
                        <th className="py-3 px-4">Gider / Gelir Kalemi</th>
                        <th className="py-3 px-4 text-center">Mevcut Durum</th>
                        <th className="py-3 px-4 text-center">Optimize Edilmiş (TMR)</th>
                        <th className="py-3 px-4 text-right">Net Değişim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300 print:text-black print:divide-slate-300">
                      <tr>
                        <td className="py-3.5 px-4 font-semibold">Fabrika Yemi Maliyeti (Aylık)</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(dailyConcentrateCostCurrent * animalCount * days).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(dailyConcentrateCostOptimized * animalCount * days).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                          -₺{Math.round((dailyConcentrateCostCurrent - dailyConcentrateCostOptimized) * animalCount * days).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-semibold">Diğer Kaba Yem Maliyeti (Aylık)</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(dailyForageCostCurrent * animalCount * days).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(dailyForageCostOptimized * animalCount * days).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                          -₺{Math.round((dailyForageCostCurrent - dailyForageCostOptimized) * animalCount * days).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-semibold">Demircan Silaj Maliyeti (Aylık)</td>
                        <td className="py-3.5 px-4 text-center font-mono">—</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(dailySilageCost * animalCount * days).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-right text-red-400 font-bold font-mono">
                          +₺{Math.round(dailySilageCost * animalCount * days).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                      <tr className="bg-slate-950/40 print:bg-slate-50 font-bold">
                        <td className="py-3.5 px-4 text-white print:text-black">Toplam Yem Gideri (Aylık)</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(monthlyTotalCostCurrent).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-center font-mono">₺{Math.round(monthlyTotalCostOptimized).toLocaleString('tr-TR')}</td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-mono">
                          Tasarruf: ₺{Math.round(monthlyFeedSavings).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                      {animalType === 'sut' && (
                        <tr className="bg-emerald-500/5 print:bg-emerald-50/50">
                          <td className="py-3.5 px-4 font-bold text-emerald-400">Toplam Süt Satış Gelir Artışı (Aylık)</td>
                          <td className="py-3.5 px-4 text-center font-mono">—</td>
                          <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">₺{Math.round(monthlyMilkRevenueIncrease).toLocaleString('tr-TR')}</td>
                          <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                            +₺{Math.round(monthlyMilkRevenueIncrease).toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      )}
                      {animalType === 'besi' && (
                        <tr className="bg-emerald-500/5 print:bg-emerald-50/50">
                          <td className="py-3.5 px-4 font-bold text-emerald-400">Toplam Besi Ağırlık Gelir Artışı (Aylık)</td>
                          <td className="py-3.5 px-4 text-center font-mono">—</td>
                          <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">₺{Math.round(monthlyBesiRevenueIncrease).toLocaleString('tr-TR')}</td>
                          <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                            +₺{Math.round(monthlyBesiRevenueIncrease).toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROI & TMR Bilimsel Açıklama Kartı */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 print:text-black print:border-slate-350">
                <div className="space-y-2">
                  <h5 className="font-bold text-white flex items-center gap-1.5 text-xs print:text-black">
                    🔬 Rumen Sağlığı & Sindirilebilirlik
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light print:text-slate-600">
                    Demircan Silajı, %30'un üzerinde ideal nişasta oranına sahiptir ve dane kırıcılar yardımıyla parçalanmıştır. Yüksek sindirilebilir lif yapısı rumendeki yararlı bakterileri besleyerek asidoz riskini azaltır ve yem çevrim oranını maksimuma çıkarır.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-white flex items-center gap-1.5 text-xs print:text-black">
                    🛡️ Vakumlu Ambalaj Teknolojisi
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light print:text-slate-600">
                    Vakumlu paketleme işlemi anaerobik fermantasyonu anında sabitleyerek silajın kızışmasını, bozulmasını ve aflatoksin (küf zehri) oluşumunu sıfıra indirir. Bu durum, süt kalitesindeki somatik hücre sayısını düşürerek daha kaliteli süt eldesini destekler.
                  </p>
                </div>
              </div>

              {/* CTA ve Geri Butonu */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-850 print:hidden">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto justify-center"
                >
                  <ArrowLeft className="h-4 w-4" /> Rasyon Değerlerini Değiştir
                </button>
                <button
                  onClick={handleApplyOffer}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black px-8 py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-500/10 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Send className="h-4 w-4 animate-pulse" /> Bu Raporla Teklif İste <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
