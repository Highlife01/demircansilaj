import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Truck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, PRICING_RULES_COLLECTION } from '../firebase';

export default function CalculatorsView({ 
  t, 
  lang, 
  provinces, 
  formData, 
  setFormData, 
  navigateTo,
  selectedProvId,
  setSelectedProvId
}) {
  // Default pricing values
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

  const [pricing, setPricing] = useState(DEFAULT_PRICES);
  const [calcType, setCalcType] = useState('sut'); // sut, besi, kucukbas
  const [animalCount, setAnimalCount] = useState(50);
  const [duration, setDuration] = useState(6); // months
  
  // Shipping calculator state is lifted to App level, but local tonnage input is here
  const [tonnageInput, setTonnageInput] = useState(25);
  
  // Milk yield profit calculator state
  const [milkingCows, setMilkingCows] = useState(30);
  const [milkPrice, setMilkPrice] = useState(15); // ₺/Liter

  // ROI Calculator state
  const [roiAnimals, setRoiAnimals] = useState(50);
  const [concentrateCost, setConcentrateCost] = useState(120);
  const [forageCost, setForageCost] = useState(60);

  // Load pricing rules from Firestore
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricingDoc = await getDoc(doc(db, PRICING_RULES_COLLECTION, 'current'));
        if (pricingDoc.exists()) {
          setPricing(prevPricing => ({ ...prevPricing, ...pricingDoc.data() }));
          // Update state inputs with firestore values
          setMilkPrice(pricingDoc.data().milkPrice || DEFAULT_PRICES.milkPrice);
          setConcentrateCost(pricingDoc.data().concentrateCost || DEFAULT_PRICES.concentrateCost);
          setForageCost(pricingDoc.data().forageCost || DEFAULT_PRICES.forageCost);
        }
      } catch (error) {
        console.error('Error loading pricing rules:', error);
        // Fall back to defaults
      }
    };
    if (db) loadPricing();
  }, []);

  // Silage need calculation
  const dailyConsumption = calcType === 'sut' ? 15 : calcType === 'besi' ? 10 : 2;
  const requiredTons = Math.ceil((animalCount * dailyConsumption * 30 * duration) / 1000);

  // ROI Calculations using pricing from Firestore
  const dailyCurrentCost = roiAnimals * (concentrateCost + forageCost);
  const dailyNewCost = roiAnimals * (concentrateCost * (1 - pricing.concentrateReduction) + pricing.milkIncreasePerCow * pricing.silagePrice);
  const dailySavings = Math.max(0, Math.ceil(dailyCurrentCost - dailyNewCost));
  const dailyExtraMilkIncome = Math.ceil(roiAnimals * pricing.milkIncreasePerCow * milkPrice);
  const totalDailyRoiProfit = dailySavings + dailyExtraMilkIncome;
  const monthlyRoiProfit = totalDailyRoiProfit * 30;
  const paybackDays = totalDailyRoiProfit > 0 ? Math.ceil(137500 / totalDailyRoiProfit) : 0;

  // Logistics calculation using pricing from Firestore
  const activeProv = provinces.find(p => p.id === selectedProvId) || provinces[0];
  const productCost = tonnageInput * pricing.baseProductPrice;
  
  // Shipping is: (distance * 2.2 ₺ per ton per km) with minimum shipping fee of 4000 ₺
  const shippingCost = activeProv.dist === 0 ? 0 : Math.max(pricing.shippingMinFee, Math.ceil(tonnageInput * (activeProv.dist * pricing.shippingPerKm)));
  const totalLogisticsCost = productCost + shippingCost;

  // Milk profit calculation
  const dailyMilkIncrease = Math.ceil(milkingCows * pricing.milkIncreasePerCow);
  const dailyProfit = dailyMilkIncrease * milkPrice;
  const monthlyProfit = dailyProfit * 30;
  const annualProfit = monthlyProfit * 12;

  const handleApplyCalculatedTons = () => {
    setTonnageInput(requiredTons);
    setFormData({
      ...formData,
      quantity: requiredTons,
      notes: `Silaj Hesaplama Aracı ile hesaplanan miktar: ${animalCount} adet ${calcType === 'sut' ? 'süt ineği' : calcType === 'besi' ? 'besi danası' : 'küçükbaş'} için ${duration} aylık kaba yem ihtiyacı.`
    });
    navigateTo('/iletisim-ve-siparis');
  };

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{t('calculatorsPage.title')}</h1>
          <p className="text-lg text-gray-605 max-w-2xl mx-auto">
            {t('calculatorsPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 1. Silaj İhtiyaç Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-50 p-3 rounded-2xl text-green-600"><Calculator className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-gray-905">{t('calculatorsPage.calc1Title')}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {t('calculatorsPage.calc1Desc')}
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">{t('calculatorsPage.animalType')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'sut', label: t('calculatorsPage.cows').split(' (')[0], desc: t('calculatorsPage.cows').split('(')[1]?.replace(')', '') || '15 kg/gün' },
                      { id: 'besi', label: t('calculatorsPage.beef').split(' (')[0], desc: t('calculatorsPage.beef').split('(')[1]?.replace(')', '') || '10 kg/gün' },
                      { id: 'kucukbas', label: t('calculatorsPage.sheep').split(' (')[0], desc: t('calculatorsPage.sheep').split('(')[1]?.replace(')', '') || '2 kg/gün' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setCalcType(type.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          calcType === type.id 
                            ? 'border-green-600 bg-green-50/50 text-green-700 font-bold' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-sm">{type.label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{type.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{t('calculatorsPage.animalCount')}</label>
                    <span className="text-sm font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full">{animalCount} {lang === 'tr' ? 'Adet' : 'Qty'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="500" value={animalCount}
                    onChange={(e) => setAnimalCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{t('calculatorsPage.feedDuration')}</label>
                    <span className="text-sm font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full">{duration} {lang === 'tr' ? 'Ay' : 'Month'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="12" value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5 bg-green-50/40 p-6 rounded-2xl">
              <div>
                <span className="text-xs text-green-800 font-bold uppercase tracking-wider">{t('calculatorsPage.calculatedNeed')}</span>
                <p className="text-3xl font-extrabold text-green-900 mt-0.5">{requiredTons} Ton</p>
              </div>
              <button 
                onClick={handleApplyCalculatedTons}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 w-full sm:w-auto text-center cursor-pointer"
              >
                {t('calculatorsPage.applyBtn')}
              </button>
            </div>
          </div>

          {/* 2. Süt Verim Artış ve Ek Kazanç Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-600"><TrendingUp className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-gray-905">{t('calculatorsPage.calc2Title')}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {t('calculatorsPage.calc2Desc')}
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{t('calculatorsPage.milkingCount')}</label>
                    <span className="text-sm font-extrabold text-yellow-700 bg-yellow-50/50 px-3 py-1 rounded-full">{milkingCows} {lang === 'tr' ? 'Baş' : 'Qty'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="200" value={milkingCows}
                    onChange={(e) => setMilkingCows(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{t('calculatorsPage.milkPrice')}</label>
                    <span className="text-sm font-extrabold text-yellow-700 bg-yellow-50/50 px-3 py-1 rounded-full">{milkPrice} ₺</span>
                  </div>
                  <input 
                    type="range" min="5" max="30" value={milkPrice}
                    onChange={(e) => setMilkPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 bg-yellow-50/30 p-6 rounded-2xl">
              <div>
                <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider block">{t('calculatorsPage.milkIncrease')}</span>
                <span className="text-lg font-bold text-gray-900 mt-1 block">+{dailyMilkIncrease} {lang === 'tr' ? 'Litre' : 'Liter'}</span>
              </div>
              <div>
                <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider block">{t('calculatorsPage.monthlyProfit')}</span>
                <span className="text-lg font-bold text-gray-900 mt-1 block">+{monthlyProfit.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="col-span-2 pt-3 border-t border-yellow-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-yellow-900">{t('calculatorsPage.annualProfit')}:</span>
                <span className="text-xl font-black text-yellow-700 bg-white px-4 py-1.5 rounded-full shadow-sm">
                  +{annualProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </div>

          {/* 3. Lojistik ve Maliyet Hesaplayıcı (Full Width) */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600"><Truck className="h-6 w-6" /></div>
              <h2 className="text-2xl font-bold text-gray-900">{t('calculatorsPage.calc3Title')}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {t('calculatorsPage.calc3Desc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('calculatorsPage.selectProv')}</label>
                <select 
                  value={selectedProvId}
                  onChange={(e) => setSelectedProvId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 text-sm text-gray-700 cursor-pointer"
                >
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('calculatorsPage.reqQuantity')}</label>
                <input 
                  type="number" min="5" max="500" value={tonnageInput}
                  onChange={(e) => setTonnageInput(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('calculatorsPage.distanceLabel')}</label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-750">
                  {activeProv.dist} km <span className="text-xs text-gray-400 font-normal">({lang === 'tr' ? "Adana'dan" : "from Adana"})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('calculatorsPage.productPrice')}</span>
                <span className="text-lg font-extrabold text-gray-900 mt-1 block">{productCost.toLocaleString('tr-TR')} ₺</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">(5.500 ₺/Ton)</span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('calculatorsPage.estShipping')}</span>
                <span className="text-lg font-extrabold text-gray-900 mt-1 block">
                  {shippingCost === 0 ? t('calculatorsPage.noDistance') : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                </span>
                <span className="text-[9px] text-gray-400 block mt-0.5">({activeProv.time})</span>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block">{t('calculatorsPage.totalBudget')}</span>
                <span className="text-lg font-black text-green-800 mt-1 block">{totalLogisticsCost.toLocaleString('tr-TR')} ₺</span>
                <span className="text-[9px] text-green-600 block mt-0.5">{t('calculatorsPage.budgetNotice')}</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    quantity: tonnageInput,
                    notes: `Maliyet ve Nakliye Hesaplayıcı ile oluşturulan talep. İl: ${activeProv.name}, Mesafe: ${activeProv.dist} km, Nakliye Süresi: ${activeProv.time}.`
                  });
                  navigateTo('/iletisim-ve-siparis');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 duration-300 cursor-pointer"
              >
                {t('calculatorsPage.getQuoteBtn').replace('{0}', activeProv.name)}
              </button>
            </div>
          </div>

          {/* 4. Rasyon Tasarruf & ROI Analizi (Full Width) */}
          <div className="bg-[#0b1220] text-white rounded-3xl p-8 md:p-10 shadow-xl border border-white/10 lg:col-span-2 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400"><TrendingUp className="h-6 w-6" /></div>
              <h2 className="text-2xl font-bold text-white">{lang === 'tr' ? 'Rasyon & ROI Tasarruf Analizörü' : 'Ration & ROI Savings Analyzer'}</h2>
            </div>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              {lang === 'tr' 
                ? 'Premium vakumlu mısır silajımız, yüksek sindirilebilir lif ve nişasta oranı sayesinde rasyonunuzdaki pahalı konsantre (fabrika) yem oranını %30\'a kadar düşürürken, süt verimini artırır. Aşağıdan çiftlik verilerinizi girerek tasarrufunuzu hesaplayın.' 
                : 'Our premium vacuumed corn silage reduces expensive concentrate feed by up to 30% and increases milk yield due to high digestible fiber and starch. Input your farm data below to see your net profit.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'tr' ? 'Sağılan Hayvan Sayısı' : 'Milking Animals Qty'}</label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{roiAnimals}</span>
                </div>
                <input 
                  type="range" min="10" max="500" value={roiAnimals}
                  onChange={(e) => setRoiAnimals(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'tr' ? 'Günlük Konsantre Yem (₺/Hayvan)' : 'Daily Concentrate Cost (₺/Cow)'}</label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{concentrateCost} ₺</span>
                </div>
                <input 
                  type="range" min="50" max="250" value={concentrateCost}
                  onChange={(e) => setConcentrateCost(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'tr' ? 'Mevcut Günlük Kaba Yem (₺/Hayvan)' : 'Current Forage Cost (₺/Cow)'}</label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{forageCost} ₺</span>
                </div>
                <input 
                  type="range" min="20" max="150" value={forageCost}
                  onChange={(e) => setForageCost(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{lang === 'tr' ? 'Günlük Yem Tasarrufu' : 'Daily Feed Savings'}</span>
                <span className={`text-lg font-extrabold mt-1 block ${dailySavings > 0 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                  {dailySavings.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-[9px] text-gray-500 block mt-0.5">%30 konsantre yem ikamesi</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{lang === 'tr' ? 'Günlük Ek Süt Geliri' : 'Daily Extra Milk Income'}</span>
                <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                  {dailyExtraMilkIncome.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-[9px] text-gray-500 block mt-0.5">+{roiAnimals * 2.5} Litre / gün (+2.5L verim)</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{lang === 'tr' ? 'Aylık Ekstra Kâr' : 'Monthly Net Profit'}</span>
                <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                  {monthlyRoiProfit.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-[9px] text-gray-500 block mt-0.5">{lang === 'tr' ? 'Toplam ek kazanç & tasarruf' : 'Total profit & savings'}</span>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">{lang === 'tr' ? 'Amortisman Süresi (1 Tır)' : 'Payback Period (1 Truck)'}</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">
                  {paybackDays} {lang === 'tr' ? 'Gün' : 'Days'}
                </span>
                <span className="text-[9px] text-emerald-500/70 block mt-0.5">25 Ton yatırımın kendini geri ödeme süresi</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
