import React from 'react';
import { Star, Info, ShieldCheck, Package } from 'lucide-react';

export default function QualityView() {
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
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Kaliteli Silajın Bilimsel Standartları</h1>
              <p className="text-lg text-green-100 max-w-3xl mx-auto font-light leading-relaxed">
                Demircan Silaj olarak, üniversitelerin ve uzmanların belirlediği standartlara (pH, Kuru Madde, Partikül Boyutu) %100 uyum sağlıyor, hayvanlarınızın verimini şansa bırakmıyoruz.
              </p>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 items-center">
          {/* Column 1: Text */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-green-100 p-2.5 rounded-xl mr-4"><Star className="h-6 w-6 text-green-600" /></span>
              Optimum Hasat Zamanı
            </h2>
            <p className="text-gray-655 text-sm mb-8 leading-relaxed">
              Mısır silajını değerlendirmek için en doğru yol kuru madde analizidir. Hedef bir mısır silajının <strong>%31-35 arasında KM (Kuru Madde)</strong> içermesi gerekir. Hasat zamanımız bitkinin %65-70 nemde olduğu dönemdir. Daneyi ezdiğimizde peynirimsi koyu bir kıvamda olmasına özellikle dikkat ediyoruz.
            </p>
            <div className="bg-gray-55 border-l-4 border-yellow-500 p-6 rounded-r-2xl">
              <p className="text-gray-800 font-medium italic text-xs leading-relaxed">
                "Süt verimini etkileyen en önemli rasyon kriteri sindirilebilir nişastadır. Doğru zamanda hasat edilmiş ve dane kırıcı ile patlatılmış mısır silajı günlük süt miktarını 2 ile 3 litre artırabilir."
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
                Mısır Koçanı Olgunluk Kontrolü
              </div>
            </div>
          </div>

          {/* Column 3: Stats */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-5">
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">%30-35</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kuru Madde (KM)</div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">3.8 - 4.1</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">İdeal pH Değeri</div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">%25-35</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nişasta Oranı</div>
            </div>
            <div className="bg-white shadow-md border border-gray-100 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-extrabold text-green-600 mb-1">10-15 cm</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Biçim Yüksekliği</div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-55 rounded-3xl p-8 md:p-16 mb-20 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">Üretim Standartlarımız</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Info className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Partikül Büyüklüğü</h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                İdeal bir silajın dane kırıcıları açık olacak şekilde ve partikül boyutu <strong>1.5 - 2.2 cm</strong> arasında olması gerekmektedir. Bu sayede sindirilebilirlik artar ve sıkıştırma kolaylaşır.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <ShieldCheck className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Biçim Yüksekliği</h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                Toprak kökenli zararlı bakterilerin silaja karışmaması için biçim yüksekliği minimum <strong>10-15 cm</strong> tutulmaktadır. Riskli zeminlerde bu oran 20 cm'ye kadar çıkarılır.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Package className="h-9 w-9 text-green-500 mb-5" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Vakumlama Teknolojisi</h4>
              <p className="text-gray-655 text-sm leading-relaxed">
                Oksijensiz ortamda fermantasyon sağlanarak hava ile temas sıfırlanır. Yüksek basınçlı presleme ile paketlenen silajlar <strong>24 ay boyunca</strong> tazeliğini korur.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
