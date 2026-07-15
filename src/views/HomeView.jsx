import React, { useState, useEffect } from 'react';
import { 
  Leaf, ArrowRight, ShieldCheck, Package, 
  Truck, Star, CheckCircle, ChevronRight, Play 
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, TESTIMONIALS_COLLECTION } from '../firebase';

export default function HomeView({ t, handleNavigation, setActiveMedia, galleryItems }) {
  const [testimonials, setTestimonials] = useState([]);

  // Fetch testimonials locally in HomeView to avoid loading Firestore on other pages
  useEffect(() => {
    const q = query(
      collection(db, TESTIMONIALS_COLLECTION),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Testimonials loading failed: ", err));
    return () => unsub();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/media/tarla1.jpg" 
            alt="Mısır Tarlası Hasat" 
            className="w-full h-full object-cover opacity-60"
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-gray-900/20 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left pt-32 pb-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold tracking-wide mb-8 backdrop-blur-md">
              <Leaf className="h-4 w-4 mr-2" /> {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.15] mb-8">
              {t('hero.title1')}<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">{t('hero.title2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-12 font-light leading-relaxed">
              {t('hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={() => handleNavigation('products')}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-green-900/50 flex items-center justify-center group cursor-pointer"
              >
                {t('hero.btnProducts')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleNavigation('contact')}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center cursor-pointer"
              >
                {t('hero.btnOrder')}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-0 w-full bg-black/50 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-8 text-center divide-x divide-white/10">
              <div className="px-4">
                <p className="text-3xl font-bold text-green-400 mb-1">%30-35</p>
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">{t('hero.stat1')}</p>
              </div>
              <div className="px-4">
                <p className="text-3xl font-bold text-yellow-400 mb-1">24 Ay / Month</p>
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">{t('hero.stat2')}</p>
              </div>
              <div className="px-4">
                <p className="text-3xl font-bold text-white mb-1">1.5 - 2.2 cm</p>
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">{t('hero.stat3')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">{t('whyUs.title')}</h2>
            <p className="text-base text-gray-600 leading-relaxed">{t('whyUs.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <ShieldCheck className="h-10 w-10 text-green-600" />,
                title: t('whyUs.item1Title'),
                desc: t('whyUs.item1Desc')
              },
              {
                icon: <Package className="h-10 w-10 text-green-600" />,
                title: t('whyUs.item2Title'),
                desc: t('whyUs.item2Desc')
              },
              {
                icon: <Truck className="h-10 w-10 text-green-600" />,
                title: t('whyUs.item3Title'),
                desc: t('whyUs.item3Desc')
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-10 shadow-lg shadow-gray-200/40 border border-gray-100 hover:-translate-y-2 transition-all duration-300 text-left">
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-white border-t border-gray-105">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">{t('testimonials.title')}</h2>
            <p className="text-base text-gray-600 leading-relaxed">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {((testimonials && testimonials.length > 0) ? testimonials : [
              {
                id: 'def1',
                name: t('testimonials.default1Name'),
                company: t('testimonials.default1Company'),
                rating: 5,
                message: t('testimonials.default1Message')
              },
              {
                id: 'def2',
                name: t('testimonials.default2Name'),
                company: t('testimonials.default2Company'),
                rating: 5,
                message: t('testimonials.default2Message')
              },
              {
                id: 'def3',
                name: t('testimonials.default3Name'),
                company: t('testimonials.default3Company'),
                rating: 5,
                message: t('testimonials.default3Message')
              }
            ]).map((test) => (
              <div key={test.id} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left">
                <div>
                  <div className="flex gap-1 mb-5 text-yellow-500">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic text-sm leading-relaxed mb-6">"{test.message}"</p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-200/60">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-700 text-sm">
                    {test.name ? test.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{test.name}</h4>
                    <p className="text-xs text-gray-400">{test.company || t('testimonials.approved')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Information / CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row text-left">
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {t('cta.title')}
              </h2>
              <p className="text-green-100/90 text-base mb-10 leading-relaxed font-light">
                {t('cta.desc')}
              </p>
              <ul className="space-y-5 mb-10">
                {[
                  t('cta.item1'),
                  t('cta.item2'),
                  t('cta.item3')
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3.5 shrink-0 mt-0.5" />
                    <span className="text-white text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div>
                <button 
                  onClick={() => handleNavigation('quality')} 
                  className="text-yellow-400 font-bold hover:text-yellow-300 flex items-center transition-colors text-base"
                >
                  {t('cta.link')} <ChevronRight className="ml-1 h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative min-h-[350px] lg:min-h-full bg-gray-800">
               <img 
                  src="/media/13.jpeg" 
                  alt="Mısır Silajı Ürünümüz" 
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-950 to-transparent opacity-80 lg:opacity-100 lg:w-32"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Üretim ve Sevkiyat Galerisi */}
      <div className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">{t('gallery.title')}</h2>
            <p className="text-base text-gray-600 leading-relaxed">
              {t('gallery.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveMedia(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col text-left"
              >
                <div className="h-48 bg-gray-950 relative overflow-hidden flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img 
                      src={item.src} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <video 
                        src={item.src} 
                        preload="metadata" 
                        muted 
                        loop 
                        playsInline
                        className="w-full h-full object-cover"
                        onMouseEnter={(e) => {
                          e.currentTarget.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="bg-white/95 text-green-700 p-3 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-green-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-green-700 uppercase tracking-wide">
                    {item.type === 'video' ? t('gallery.watchVideo') : t('gallery.viewImage')} <ChevronRight className="h-4 w-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
