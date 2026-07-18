import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Truck, Cylinder, Scale, Thermometer, Info } from 'lucide-react';
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
  
  // Shipping calculator state
  const [tonnageInput, setTonnageInput] = useState(25);
  
  // Milk yield profit calculator state
  const [milkingCows, setMilkingCows] = useState(30);
  const [milkPrice, setMilkPrice] = useState(15); // ₺/Liter

  // ROI Calculator state
  const [roiAnimals, setRoiAnimals] = useState(50);
  const [concentrateCost, setConcentrateCost] = useState(120);
  const [forageCost, setForageCost] = useState(60);

  // New Calculators State
  // 1. Trench (Çukur)
  const [trenchLength, setTrenchLength] = useState(20); // m
  const [trenchWidth, setTrenchWidth] = useState(6); // m
  const [trenchHeight, setTrenchHeight] = useState(3); // m
  const [trenchDensity, setTrenchDensity] = useState(700); // kg/m3

  // 2. Bale Density
  const [baleWeight, setBaleWeight] = useState(1000); // kg
  const [baleDiameter, setBaleDiameter] = useState(1.2); // m
  const [baleWidth, setBaleWidth] = useState(1.2); // m

  // 3. Fermentation Score
  const [fermPh, setFermPh] = useState(4.0);
  const [fermTemp, setFermTemp] = useState(22); // C
  const [fermOdor, setFermOdor] = useState('lactic'); // lactic, acetic, butyric, moldy
  const [fermColor, setFermColor] = useState('green'); // green, black, brown

  // Load pricing rules from Firestore
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricingDoc = await getDoc(doc(db, PRICING_RULES_COLLECTION, 'current'));
        if (pricingDoc.exists()) {
          setPricing(prevPricing => ({ ...prevPricing, ...pricingDoc.data() }));
          setMilkPrice(pricingDoc.data().milkPrice || DEFAULT_PRICES.milkPrice);
          setConcentrateCost(pricingDoc.data().concentrateCost || DEFAULT_PRICES.concentrateCost);
          setForageCost(pricingDoc.data().forageCost || DEFAULT_PRICES.forageCost);
        }
      } catch (error) {
        console.error('Error loading pricing rules:', error);
      }
    };
    if (db) loadPricing();
  }, []);

  // calculations
  const dailyConsumption = calcType === 'sut' ? 15 : calcType === 'besi' ? 10 : 2;
  const requiredTons = Math.ceil((animalCount * dailyConsumption * 30 * duration) / 1000);

  const dailyCurrentCost = roiAnimals * (concentrateCost + forageCost);
  const dailyNewCost = roiAnimals * (concentrateCost * (1 - pricing.concentrateReduction) + pricing.milkIncreasePerCow * pricing.silagePrice);
  const dailySavings = Math.max(0, Math.ceil(dailyCurrentCost - dailyNewCost));
  const dailyExtraMilkIncome = Math.ceil(roiAnimals * pricing.milkIncreasePerCow * milkPrice);
  const totalDailyRoiProfit = dailySavings + dailyExtraMilkIncome;
  const monthlyRoiProfit = totalDailyRoiProfit * 30;
  const paybackDays = totalDailyRoiProfit > 0 ? Math.ceil(137500 / totalDailyRoiProfit) : 0;

  const activeProv = provinces.find(p => p.id === selectedProvId) || provinces[0];
  const productCost = tonnageInput * pricing.baseProductPrice;
  const shippingCost = activeProv.dist === 0 ? 0 : Math.max(pricing.shippingMinFee, Math.ceil(tonnageInput * (activeProv.dist * pricing.shippingPerKm)));
  const totalLogisticsCost = productCost + shippingCost;

  const dailyMilkIncrease = Math.ceil(milkingCows * pricing.milkIncreasePerCow);
  const dailyProfit = dailyMilkIncrease * milkPrice;
  const monthlyProfit = dailyProfit * 30;
  const annualProfit = monthlyProfit * 12;

  // New Calculators Logic
  // Trench tonnage: volume * density / 1000
  const trenchVolume = trenchLength * trenchWidth * trenchHeight;
  const trenchCapacityTons = Math.round((trenchVolume * trenchDensity) / 1000);

  // Bale volume: pi * r^2 * h
  const baleRadius = baleDiameter / 2;
  const baleVolume = Math.PI * Math.pow(baleRadius, 2) * baleWidth;
  const calculatedBaleDensity = Math.round(baleWeight / baleVolume);

  // Fermentation Score calculation (out of 100)
  const calculateFermentationScore = () => {
    let score = 100;
    
    // pH penalties
    if (fermPh < 3.8) score -= 10; // too acidic
    else if (fermPh > 4.2 && fermPh <= 4.8) score -= 15; // slightly high
    else if (fermPh > 4.8) score -= 40; // dangerously high

    // Temp penalties
    if (fermTemp > 20 && fermTemp <= 30) score -= 10; // warm
    else if (fermTemp > 30) score -= 25; // hot (aerobic decay)

    // Odor penalties
    if (fermOdor === 'acetic') score -= 15; // vinegary
    if (fermOdor === 'butyric') score -= 40; // sour milk/feces (bad)
    if (fermOdor === 'moldy') score -= 50; // rotting

    // Color penalties
    if (fermColor === 'brown') score -= 15; // heat damaged
    if (fermColor === 'black') score -= 40; // rotten

    return Math.max(0, score);
  };
  const fermentationScore = calculateFermentationScore();

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
          <span className="inline-flex items-center py-1 px-3.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-bold uppercase tracking-wider mb-4">
            Project SILAJ-X
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Masaüstü Rasyon & Hesaplama Araçları</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-light">
            Sürü büyüklüğü, yem oranları, nakliye maliyetleri, silaj çukuru hacmi ve fermantasyon analiz puanınızı bilimsel parametreler kullanarak saniyeler içinde hesaplayın.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* 1. Silaj İhtiyaç Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-150 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-50 p-3 rounded-2xl text-green-600"><Calculator className="h-6 w-6" /></div>
                <h2 className="text-xl font-bold text-gray-900">Silaj İhtiyaç Hesaplayıcı</h2>
              </div>
              <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                Hayvan sayınıza ve kış/yaz besleme planlama sürenize göre çiftliğinizin ihtiyaç duyacağı toplam kaba yem miktarını ton bazında bulun.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Hayvan Türü</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'sut', label: 'Süt İneği', desc: '15 kg/gün' },
                      { id: 'besi', label: 'Besi Danası', desc: '10 kg/gün' },
                      { id: 'kucukbas', label: 'Küçükbaş', desc: '2 kg/gün' }
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
                        <span className="block text-xs">{type.label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{type.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Hayvan Sayısı</label>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">{animalCount} Adet</span>
                  </div>
                  <input 
                    type="range" min="1" max="500" value={animalCount}
                    onChange={(e) => setAnimalCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Besleme Süresi</label>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">{duration} Ay</span>
                  </div>
                  <input 
                    type="range" min="1" max="12" value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5 bg-green-50/40 p-5 rounded-2xl">
              <div>
                <span className="text-[10px] text-green-800 font-bold uppercase tracking-wider">Hesaplanan Silaj İhtiyacı</span>
                <p className="text-2xl font-black text-green-900 mt-0.5">{requiredTons} Ton</p>
              </div>
              <button 
                onClick={handleApplyCalculatedTons}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow-md shrink-0 w-full sm:w-auto text-center cursor-pointer"
              >
                Miktarı Siparişe Uygula
              </button>
            </div>
          </div>

          {/* 2. Süt Verim Artış ve Ek Kazanç Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-150 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-600"><TrendingUp className="h-6 w-6" /></div>
                <h2 className="text-xl font-bold text-gray-900">Süt Verimi Ek Kazanç Hesaplayıcı</h2>
              </div>
              <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                Yüksek besleyici dane oranına sahip premium silaj beslemesiyle elde edeceğiniz günlük ek süt litresi ve bunun getireceği net ek kazancı modelleyin.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Sağılan İnek Sayısı</label>
                    <span className="text-xs font-bold text-yellow-800 bg-yellow-50 px-2.5 py-1 rounded-full">{milkingCows} Baş</span>
                  </div>
                  <input 
                    type="range" min="1" max="200" value={milkingCows}
                    onChange={(e) => setMilkingCows(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Güncel Çiğ Süt Satış Fiyatı</label>
                    <span className="text-xs font-bold text-yellow-800 bg-yellow-50 px-2.5 py-1 rounded-full">{milkPrice} ₺/L</span>
                  </div>
                  <input 
                    type="range" min="5" max="30" value={milkPrice}
                    onChange={(e) => setMilkPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 bg-yellow-50/20 p-5 rounded-2xl">
              <div>
                <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider block">Günlük Süt Artışı</span>
                <span className="text-base font-bold text-gray-900 mt-1 block">+{dailyMilkIncrease} Litre</span>
              </div>
              <div>
                <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider block">Aylık Net Süt Kazancı</span>
                <span className="text-base font-bold text-gray-900 mt-1 block">+{monthlyProfit.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="col-span-2 pt-3 border-t border-yellow-100 flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-900">Yıllık İlave Gelir Projeksiyonu:</span>
                <span className="text-lg font-black text-yellow-750 bg-white px-4 py-1.5 rounded-full shadow-inner">
                  +{annualProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Lojistik ve Maliyet Hesaplayıcı (Full Width) */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-150 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-50 p-3 rounded-2xl text-green-600"><Truck className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-900">Adana Fabrika Çıkışlı Lojistik Hesaplayıcı</h2>
          </div>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            Türkiye genelindeki teslimat konumunuza göre nakliye mesafesini hesaplayarak toplam teslim bütçenizi görün.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Teslimat Yapılacak İl</label>
              <select 
                value={selectedProvId}
                onChange={(e) => setSelectedProvId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 text-xs text-gray-700 cursor-pointer"
              >
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Talep Edilen Miktar (Ton)</label>
              <input 
                type="number" min="5" max="500" value={tonnageInput}
                onChange={(e) => setTonnageInput(Math.max(5, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 text-xs text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Lojistik Karayolu Mesafesi</label>
              <div className="px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-750 border border-transparent">
                {activeProv.dist} km <span className="text-[10px] text-gray-400 font-normal">(Adana Fabrikadan)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-150">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Yem Ürün Bedeli</span>
              <span className="text-base font-extrabold text-gray-900 mt-1 block">{productCost.toLocaleString('tr-TR')} ₺</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">(5.500 ₺/Ton)</span>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tahmini Lojistik Bedeli</span>
              <span className="text-base font-extrabold text-gray-900 mt-1 block">
                {shippingCost === 0 ? 'Fabrika Teslim (Nakliye Hariç)' : `${shippingCost.toLocaleString('tr-TR')} ₺`}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">({activeProv.time})</span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-150">
              <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block">Kapıya Teslim Toplam Bütçe</span>
              <span className="text-base font-black text-green-800 mt-1 block">{totalLogisticsCost.toLocaleString('tr-TR')} ₺</span>
              <span className="text-[9px] text-green-600 block mt-0.5">Yükleme ve lojistik dahil fiyattır. Kdv hariçtir.</span>
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
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 duration-300 cursor-pointer"
            >
              {activeProv.name} İli İçin Hemen Sipariş Teklifi Al
            </button>
          </div>
        </div>

        {/* Dynamic Multi-Calculator Section (New additions for Phase 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* A. Silaj Çukuru Hacim Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                <Cylinder className="h-5 w-5 text-green-600" /> Çukur Hacmi & Tonaj Kapasitesi
              </h3>
              <p className="text-[11px] text-gray-500 mb-6">
                Hazırladığınız silaj çukuru (silaj hendeği) boyutlarına göre alabileceği maksimum kaba yem kapasitesini ölçün.
              </p>
              
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Uzunluk (metre)</label>
                  <input type="number" value={trenchLength} onChange={e => setTrenchLength(Math.max(1, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Genişlik (metre)</label>
                  <input type="number" value={trenchWidth} onChange={e => setTrenchWidth(Math.max(1, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Ortalama Yükseklik (metre)</label>
                  <input type="number" value={trenchHeight} onChange={e => setTrenchHeight(Math.max(1, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Sıkışma Yoğunluğu (kg/m³)</label>
                  <select value={trenchDensity} onChange={e => setTrenchDensity(parseInt(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <option value={600}>Gevşek Sıkıştırma (600 kg/m³)</option>
                    <option value={700}>Orta Sıkıştırma (700 kg/m³ - İdeal)</option>
                    <option value={800}>Yüksek Presleme (800 kg/m³)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
              <div className="flex justify-between border-b pb-2 mb-2 font-medium">
                <span className="text-gray-500">Çukur Hacmi:</span>
                <span className="text-gray-900 font-bold">{trenchVolume} m³</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-green-800">Depolama Kapasitesi:</span>
                <span className="text-green-700 text-lg">{trenchCapacityTons} Ton</span>
              </div>
            </div>
          </div>

          {/* B. Balya Sıkıştırma Yoğunluk Hesaplayıcı */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" /> Rulo Balya Yoğunluk Ölçer
              </h3>
              <p className="text-[11px] text-gray-500 mb-6">
                Rulo balyanın ağırlık ve boyut girdilerine göre presleme kalitesini ve kuru madde yoğunluğunu test edin.
              </p>
              
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Balya Ağırlığı (kg)</label>
                  <input type="number" value={baleWeight} onChange={e => setBaleWeight(Math.max(100, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Balya Çapı (metre)</label>
                  <input type="number" step="0.1" value={baleDiameter} onChange={e => setBaleDiameter(Math.max(0.5, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Balya Genişliği (metre)</label>
                  <input type="number" step="0.1" value={baleWidth} onChange={e => setBaleWidth(Math.max(0.5, parseFloat(e.target.value) || 0))} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
              <div className="flex justify-between border-b pb-2 mb-2 font-medium">
                <span className="text-gray-500">Hesaplanan Hacim:</span>
                <span className="text-gray-900 font-bold">{baleVolume.toFixed(2)} m³</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-550">Sıkıştırma Yoğunluğu:</span>
                <span className={`text-sm px-2.5 py-0.5 rounded-full ${
                  calculatedBaleDensity >= 700 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{calculatedBaleDensity} kg/m³</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">
                * İdeal rulo balya yoğunluğu 750 kg/m³ düzeyindedir. Oksijen cepleri kalmaması için 650 kg/m³ üzeri hedeflenmelidir.
              </p>
            </div>
          </div>

          {/* C. Fermantasyon Kalite Skoru (GEO Test) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-green-600" /> Fermantasyon Başarı Skoru (0-100)
              </h3>
              <p className="text-[11px] text-gray-500 mb-6">
                Sahadaki silajın pH, koku, renk ve sıcaklık parametrelerine göre kalite puanını test edin.
              </p>
              
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <div className="flex justify-between">
                    <label className="text-[10px] text-gray-400 block mb-1">Silaj pH Değeri</label>
                    <span className="text-[10px] font-bold text-green-700">{fermPh}</span>
                  </div>
                  <input type="range" min="3.0" max="6.0" step="0.1" value={fermPh} onChange={e => setFermPh(parseFloat(e.target.value))} className="w-full accent-green-600 h-1 bg-gray-200 rounded" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Kızışma Sıcaklığı (°C)</label>
                  <input type="number" value={fermTemp} onChange={e => setFermTemp(parseInt(e.target.value) || 0)} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Silaj Kokusu</label>
                  <select value={fermOdor} onChange={e => setFermOdor(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <option value="lactic">Tatlı Laktik / Meyvemsi (Mükemmel)</option>
                    <option value="acetic">Keskin Sirke / Asetik (Orta)</option>
                    <option value="butyric">Ekşi Süt / Bütirik (Kötü - Patojen Riski)</option>
                    <option value="moldy">Küflü / Çürük (Tehlikeli - Yedirmeyin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Silaj Rengi</label>
                  <select value={fermColor} onChange={e => setFermColor(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <option value="green">Zeytin Yeşili / Sarımtırak (Normal)</option>
                    <option value="brown">Koyu Kahverengi / Karamelize (Aşırı Isınmış)</option>
                    <option value="black">Siyah / Çamurlu (Çürümüş)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-center space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">FERMANTASYON SKORU</span>
              <span className={`text-2xl font-black block ${
                fermentationScore >= 80 ? 'text-green-600' : fermentationScore >= 50 ? 'text-yellow-600' : 'text-red-500'
              }`}>{fermentationScore} / 100</span>
              <span className="text-[9px] text-gray-500 font-medium block">
                {fermentationScore >= 80 ? 'Başarılı Fermantasyon. Besin değerleri stabil.' :
                 fermentationScore >= 50 ? 'Sınırdaki Kalite. Havalandırmaya ve nem dengesine dikkat edin.' :
                 'Kalitesiz fermantasyon! Küf ve toksin riski yüksektir. Laboratuvar analizi yaptırın.'}
              </span>
            </div>
          </div>

        </div>

        {/* 4. Rasyon Tasarruf & ROI Analizi (Full Width) */}
        <div className="bg-[#0b1220] text-white rounded-3xl p-8 md:p-10 shadow-xl border border-white/10 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400"><TrendingUp className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-white">Rasyon Tasarruf & Amortisman (ROI) Analizörü</h2>
          </div>
          <p className="text-xs text-gray-400 mb-8 leading-relaxed">
            Premium vakumlu mısır silajımız, yüksek sindirilebilir lif ve nişasta oranı sayesinde rasyonunuzdaki pahalı konsantre (fabrika) yem oranını %30'a kadar düşürürken, süt verimini artırır. Aşağıdan çiftlik verilerinizi girerek tasarrufunuzu hesaplayın.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sağılan Hayvan Sayısı</label>
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Günlük Konsantre Yem (₺/Hayvan)</label>
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mevcut Günlük Kaba Yem (₺/Hayvan)</label>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{forageCost} ₺</span>
              </div>
              <input 
                type="range" min="20" max="150" value={forageCost}
                onChange={(e) => setForageCost(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Günlük Yem Tasarrufu</span>
              <span className={`text-lg font-extrabold mt-1 block ${dailySavings > 0 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                {dailySavings.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-[9px] text-gray-500 block mt-0.5">%30 konsantre yem ikamesi</span>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Günlük Ek Süt Geliri</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                {dailyExtraMilkIncome.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-[9px] text-gray-500 block mt-0.5">+{roiAnimals * 2.5} Litre / gün (+2.5L verim)</span>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Aylık Ekstra Kâr</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                {monthlyRoiProfit.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-[9px] text-gray-500 block mt-0.5">Toplam ek kazanç & tasarruf</span>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Amortisman Süresi (1 Tır)</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">
                {paybackDays} Gün
              </span>
              <span className="text-[9px] text-emerald-500/70 block mt-0.5">25 Ton yatırımın kendini geri ödeme süresi</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
