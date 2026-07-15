import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ProductsView({ 
  lang, 
  setActiveSpecProduct, 
  formData, 
  setFormData, 
  handleNavigation 
}) {
  return (
    <div className="pt-32 pb-24 bg-gray-55 min-h-screen animate-in fade-in duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Ürünlerimiz</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Çiftliğinizin ihtiyaçlarına özel olarak tasarlanmış, besin değeri korunmuş ve farklı gramajlarda paketlenmiş yüksek kaliteli kaba yem seçenekleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Product Card 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
            <div className="h-68 bg-green-950 relative overflow-hidden group">
              <img 
                src="/media/13.jpeg" 
                alt="1000 kg Vakumlu Silaj" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" 
                loading="lazy"
              />
              <div className="absolute top-5 right-5 bg-yellow-400 text-yellow-950 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">En Popüler</div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1000 kg Vakumlu Mısır Silajı</h3>
              <p className="text-gray-650 text-sm mb-8 leading-relaxed">
                Büyük ölçekli işletmeler için ideal, 24 ay raf ömrü sunan, özel bariyerli naylon ile preslenmiş ve havası alınmış rulo paketler.
              </p>
              <ul className="space-y-3.5 mb-8 flex-1">
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> %30-35 Kuru Madde</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Minimum fermantasyon kaybı</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Tır bazında sevkiyat kolaylığı</li>
              </ul>
              <div className="border-t border-gray-100 pt-6 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tahmini Fiyat</span>
                  <span className="text-xl font-extrabold text-green-700">5.500 ₺ <span className="text-xs text-gray-500 font-medium">/ Ton</span></span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveSpecProduct('1000kg')}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Teknik Bilgi' : 'Specs & Lab'}
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({...formData, productType: '1000kg'});
                      handleNavigation('contact');
                    }} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Sipariş Ver' : 'Order Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
            <div className="h-68 bg-green-950 relative overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
                alt="500 kg Vakumlu Silaj" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" 
                loading="lazy"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">500 kg Vakumlu Mısır Silajı</h3>
              <p className="text-gray-650 text-sm mb-8 leading-relaxed">
                Orta ve küçük işletmeler için taşıması ve kullanımı daha kolay olan, aynı yüksek kalite standartlarında üretilmiş yarım tonluk vakumlu silaj.
              </p>
              <ul className="space-y-3.5 mb-8 flex-1">
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Pratik kullanım ve kolay istifleme</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Hızlı tüketim için ideal boyut</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> %100 doğal rasyon desteği</li>
              </ul>
              <div className="border-t border-gray-100 pt-6 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tahmini Fiyat</span>
                  <span className="text-xl font-extrabold text-green-700">5.500 ₺ <span className="text-xs text-gray-500 font-medium">/ Ton</span></span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveSpecProduct('500kg')}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Teknik Bilgi' : 'Specs & Lab'}
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({...formData, productType: '500kg'});
                      handleNavigation('contact');
                    }} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Sipariş Ver' : 'Order Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Card 3 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
            <div className="h-68 bg-green-950 relative overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800" 
                alt="Dökme Mısır Silajı" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" 
                loading="lazy"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dökme Mısır Silajı</h3>
              <p className="text-gray-650 text-sm mb-8 leading-relaxed">
                Kendi silaj çukuru bulunan ve hasat zamanı toplu alım yapmak isteyen üreticiler için biçimden hemen sonra tarladan römork/kamyon bazlı satış.
              </p>
              <ul className="space-y-3.5 mb-8 flex-1">
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Sezonunda yüksek fiyat avantajı</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> Hızlı lojistik ve sevkiyat planlaması</li>
                <li className="flex items-center text-sm text-gray-700"><CheckCircle className="h-4.5 w-4.5 text-green-500 mr-2.5 shrink-0" /> İdeal tane kırma ve patlatma</li>
              </ul>
              <div className="border-t border-gray-100 pt-6 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tahmini Fiyat</span>
                  <span className="text-xl font-extrabold text-green-700">5.000 ₺ <span className="text-xs text-gray-500 font-medium">/ Ton</span></span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveSpecProduct('dokme')}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Teknik Bilgi' : 'Specs & Lab'}
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({...formData, productType: 'dokme'});
                      handleNavigation('contact');
                    }} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer text-center"
                  >
                    {lang === 'tr' ? 'Sipariş Ver' : 'Order Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
