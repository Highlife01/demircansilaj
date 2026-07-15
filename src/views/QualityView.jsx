import React from 'react';
import { Star, Info, ShieldCheck, Package } from 'lucide-react';

export default function QualityView({ lang }) {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="relative rounded-3xl p-10 md:p-16 mb-20 text-center overflow-hidden min-h-[280px] flex items-center justify-center">
           <div className="absolute inset-0 z-0">
             <img 
               src="/media/tarla1.jpg" 
               alt="Mısır Tarlası Kalite Kontrol" 
               className="w-full h-full object-cover opacity-25" 
               loading="eager"
               fetchpriority="high"
             />
             <div className="absolute inset-0 bg-gradient-to-br from-green-955 via-green-900/90 to-black/80"></div>
           </div>
           <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                {lang === 'tr' ? 'Kaliteli Silajın Bilimsel Standartları' : 'Scientific Standards of Quality Silage'}
              </h1>
              <p className="text-lg text-green-100 max-w-3xl mx-auto font-light leading-relaxed">
                {lang === 'tr' 
                  ? 'Demircan Silaj olarak, üniversitelerin ve uzmanların belirlediği standartlara (pH, Kuru Madde, Partikül Boyutu) %100 uyum sağlıyor, hayvanlarınızın verimini şansa bırakmıyoruz.'
                  : 'As Demircan Silage, we ensure 100% compliance with standard parameters (pH, Dry Matter, Particle Size) defined by universities and experts, not leaving your livestock yield to chance.'}
              </p>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 items-center">
          {/* Column 1: Text */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-green-100 p-2.5 rounded-xl mr-4"><Star className="h-6 w-6 text-green-600" /></span>
              {lang === 'tr' ? 'Optimum Hasat Zamanı' : 'Optimum Harvest Time'}
            </h2>
            <p className="text-gray-655 text-sm mb-8 leading-relaxed">
              {lang === 'tr'
                ? <>Mısır silajını değerlendirmek için en doğru yol kuru madde analizidir. Hedef bir mısır silajının <strong>%31-35 arasında KM (Kuru Madde)</strong> içermesi gerekir. Hasat zamanımız bitkinin %65-70 nemde olduğu dönemdir. Daneyi ezdiğimizde peynirimsi koyu bir kıvamda olmasına özellikle dikkat ediyoruz.</>
                : <>The best way to evaluate corn silage is dry matter analysis. A target corn silage must contain <strong>between 31-35% DM (Dry Matter)</strong>. Our harvest time is when the plant is at 65-70% moisture. We pay special attention to ensuring the grain has a cheesy, thick consistency when crushed.</>}
            </p>
            <div className="bg-gray-55 border-l-4 border-yellow-500 p-6 rounded-r-2xl">
              <p className="text-gray-800 font-medium italic text-xs leading-relaxed">
                {lang === 'tr'
                  ? '"Süt verimini etkileyen en önemli rasyon kriteri sindirilebilir nişastadır. Doğru zamanda hasat edilmiş ve dane kırıcı ile patlatılmış mısır silajı günlük süt miktarını 2 ile 3 litre artırabilir."'
                  : '"The most important ration criteria affecting milk yield is digestible starch. Corn silage harvested at the right time and processed with a kernel processor can increase daily milk yield by 2 to 3 liters."'}
              </p>
            </div>
          </div>

          {/* Column 2: Tarla Resmi */}
          <div className="lg:col-span-1">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[3/4] max-w-sm mx-auto border border-gray-150 group">
              <img 
                src="/media/tarla2.jpg" 
                alt="Koçan ve Dane Olgunluğu Kontrolü" 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl text-white text-xs font-medium text-center">
                {lang === 'tr' ? 'Mısır Koçanı Olgunluk Kontrolü' : 'Corn Cob Maturity Inspection'}
              </div>
            </div>
          </div>

          {/* Column 3: Stats */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-5">
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">%30-35</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'tr' ? 'Kuru Madde (KM)' : 'Dry Matter (DM)'}
              </div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">3.8 - 4.1</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'tr' ? 'İdeal pH Değeri' : 'Ideal pH Level'}
              </div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">%25-35</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'tr' ? 'Nişasta Oranı' : 'Starch Ratio'}
              </div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">10-15 cm</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'tr' ? 'Biçim Yüksekliği' : 'Cutting Height'}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-55 rounded-3xl p-8 md:p-16 mb-20 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            {lang === 'tr' ? 'Üretim Standartlarımız' : 'Our Production Standards'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Info className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {lang === 'tr' ? 'Partikül Büyüklüğü' : 'Particle Size'}
              </h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                {lang === 'tr'
                  ? <>İdeal bir silajın dane kırıcıları açık olacak şekilde ve partikül boyutu <strong>1.5 - 2.2 cm</strong> arasında olması gerekmektedir. Bu sayede sindirilebilirlik artar ve sıkıştırma kolaylaşır.</>
                  : <>An ideal silage should have its kernel processor active, and a particle size between <strong>1.5 - 2.2 cm</strong>. This increases digestibility and facilitates compression.</>}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <ShieldCheck className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {lang === 'tr' ? 'Biçim Yüksekliği' : 'Cutting Height'}
              </h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                {lang === 'tr'
                  ? <>Toprak kökenli zararlı bakterilerin silaja karışmaması için biçim yüksekliği minimum <strong>10-15 cm</strong> tutulmaktadır. Riskli zeminlerde bu oran 20 cm'ye kadar çıkarılır.</>
                  : <>Cutting height is kept at a minimum of <strong>10-15 cm</strong> to prevent soil-borne pathogen bacteria from mixing with the silage. In high-risk fields, this is raised up to 20 cm.</>}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Package className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {lang === 'tr' ? 'Vakumlama Teknolojisi' : 'Vacuum Baling Technology'}
              </h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                {lang === 'tr'
                  ? <>Oksijensiz ortamda fermantasyon sağlanarak hava ile temas sıfırlanır. Yüksek basınçlı presleme ile paketlenen silajlar <strong>24 ay boyunca</strong> tazeliğini korur.</>
                  : <>Anaerobic fermentation is ensured by complete exclusion of air. Silage packed with high-pressure compression retains its freshness for up to <strong>24 months</strong>.</>}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
