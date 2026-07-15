import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Menu, X, Leaf, MessageCircle, MessageSquare, Send, Loader2,
  Phone, Mail, MapPin
} from 'lucide-react';
import { provinces } from './data/provinces.js';
import { translations } from './data/translations.js';

// Lazy load view components to avoid loading their code and dependencies (e.g. Firebase) on initial paint
const HomeView = lazy(() => import('./views/HomeView.jsx'));
const ProductsView = lazy(() => import('./views/ProductsView.jsx'));
const QualityView = lazy(() => import('./views/QualityView.jsx'));
const ContactView = lazy(() => import('./views/ContactView.jsx'));
const CalculatorsView = lazy(() => import('./views/CalculatorsView.jsx'));
const KnowledgeCenterView = lazy(() => import('./views/KnowledgeCenterView.jsx'));
const ProvinceView = lazy(() => import('./views/ProvinceView.jsx'));
const BlogView = lazy(() => import('./views/BlogView.jsx'));

const galleryItems = [
  { type: 'image', src: '/media/tarla1.jpg', title: 'Hasat Öncesi Mısır Kontrolü', desc: 'Mısırların olgunluk düzeylerinin hasat öncesi uzman ekibimiz tarafından sahada incelenmesi.' },
  { type: 'image', src: '/media/tarla2.jpg', title: 'Koçan ve Dane Olgunluğu', desc: 'Dane sertliği ve nem oranının kontrol edilerek en doğru hasat zamanının belirlenmesi.' },
  { type: 'image', src: '/media/13.jpeg', title: 'Birinci Sınıf Mısır Silajımız', desc: 'İdeal kuru madde ve besin değerlerine sahip, vakumlu paketlenmiş yüksek kaliteli mısır silajımız.' },
  { type: 'video', src: '/media/2.mp4', title: 'Balyalama ve Presleme', desc: 'Mısır silajının yüksek basınç altında havası alınarak rulo balyalanma anı.' },
  { type: 'video', src: '/media/3.mp4', title: 'Sahada Yükleme', desc: 'Balyalanmış silajların nakliye tırlarına güvenle yüklenmesi.' },
  { type: 'video', src: '/media/4.mp4', title: 'Üretim Tesislerimiz', desc: 'Modern makine parkurumuz ve üretim sahamız.' },
  { type: 'video', src: '/media/5.mp4', title: 'Lojistik Operasyonu', desc: 'Sevkiyata hazırlanan mısır silajı rulo balyaları.' },
  { type: 'video', src: '/media/6.mp4', title: 'Paketleme Detayı', desc: 'Vakumlu rulo balyaların son sargı aşamaları.' },
  { type: 'video', src: '/media/7.mp4', title: 'Hasat ve Sevkiyat', desc: 'Tarladan taze biçilen mısırın tesislere nakledilmesi.' },
  { type: 'video', src: '/media/8.mp4', title: 'Balyalama Bandı', desc: 'Hassas tartım, sıkıştırma ve kaplama ünitesi.' },
  { type: 'video', src: '/media/9.mp4', title: 'Depo İstifleme', desc: 'Hazırlanan 1000 kg balyaların sevkiyat öncesi fabrikada depolanması.' },
  { type: 'video', src: '/media/10.mp4', title: 'Vakumlama Aşaması', desc: '24 ay dayanıklılık sağlayan havasızlandırma işlemi.' },
  { type: 'video', src: '/media/11.mp4', title: 'Besi Teslimatları', desc: 'Çiftliklere ulaşan ürünlerin indirme süreci.' },
  { type: 'video', src: '/media/12.mp4', title: 'Gece Operasyonu', desc: 'Kesintisiz hasat ve yükleme çalışmalarımız.' },
  { type: 'video', src: '/media/14.mp4', title: 'Büyük Ölçekli Lojistik', desc: 'Kendi araç filomuzla tonajlı kaba yem tedarik sevkiyatları.' },
  { type: 'video', src: '/media/WhatsApp Video 2026-07-13 at 11.18.12.mp4', title: 'Üretim Tesislerimiz', desc: 'Modern makine parkurumuz ve üretim sahamız.' },
  { type: 'video', src: '/media/WhatsApp Video 2026-07-13 at 11.18.50.mp4', title: 'Paket Çıkışı', desc: 'Sargıdan çıkan rulo mısır silajının son kontrolü.' }
];

const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-green-700 animate-spin" />
  </div>
);

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState(() => {
    const match = window.location.pathname.match(/^\/blog\/([a-z0-9-]+)$/);
    return match ? match[1] : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);

  // Language state
  const [lang, setLang] = useState('tr');
  const [activeSpecProduct, setActiveSpecProduct] = useState(null);

  // Lifted state to allow shared province selection between regional landing pages and calculators page
  const [selectedProvId, setSelectedProvId] = useState('konya');

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      if (!value) return path;
      value = value[key];
    }
    return value || path;
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  // Form State (kept at parent to allow navigation with pre-filled selections)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    provinceId: 'konya',
    district: '',
    quantity: 20, // default quantity in tons
    productType: '1000kg',
    notes: ''
  });

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'bot', 
      text: lang === 'tr' 
        ? 'Merhaba! Ben Demircan Silaj yapay zekâ asistanıyım. Size silaj ürünlerimiz, fiyatlarımız, kalite standartlarımız veya nakliye koşullarımız hakkında nasıl yardımcı olabilirim?' 
        : 'Hello! I am the Demircan Silage AI assistant. How can I help you regarding our silage products, prices, quality standards, or logistics?'
    }
  ]);

  useEffect(() => {
    if (chatMessages.length === 1) {
      setChatMessages([
        { 
          sender: 'bot', 
          text: lang === 'tr' 
            ? 'Merhaba! Ben Demircan Silaj yapay zekâ asistanıyım. Size silaj ürünlerimiz, fiyatlarımız, kalite standartlarımız veya nakliye koşullarımız hakkında nasıl yardımcı olabilirim?' 
            : 'Hello! I am the Demircan Silage AI assistant. How can I help you regarding our silage products, prices, quality standards, or logistics?'
        }
      ]);
    }
  }, [lang, chatMessages.length]);

  const getChatSuggestions = () => {
    return lang === 'tr'
      ? ['Güncel Fiyat Ne Kadar?', 'Analiz Değerleri Nedir?', 'Nakliye ve Teslimat?', 'Nasıl Sipariş Verilir?']
      : ['What is the Price?', 'What are the Specs?', 'Shipping & Delivery?', 'How to Order?'];
  };

  const handleSendChatMessage = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);

    setTimeout(() => {
      let botResponse = '';
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('fiyat') || lowerText.includes('price') || lowerText.includes('ne kadar') || lowerText.includes('kaç') || lowerText.includes('kac') || lowerText.includes('para') || lowerText.includes('maliyet') || lowerText.includes('cost')) {
        botResponse = lang === 'tr'
          ? "Mısır silajımızın ton fiyatı vakumlu balyalar için 5.500 ₺, dökme silaj için ise 5.000 ₺'dir. Siparişleriniz Adana fabrikamızdan tır (25 ton) veya kamyon (10-15 ton) bazında kapınıza sevk edilir."
          : "Our corn silage ton price is 5,500 ₺ for vacuumed bales and 5,000 ₺ for bulk silage. Orders are shipped from our Adana factory by trucks (25 tons) or lorries (10-15 tons) directly to your door.";
      } else if (lowerText.includes('kalite') || lowerText.includes('analiz') || lowerText.includes('protein') || lowerText.includes('km') || lowerText.includes('spec') || lowerText.includes('değer') || lowerText.includes('deger') || lowerText.includes('laboratuvar')) {
        botResponse = lang === 'tr'
          ? "Silajımız ideal %32-35 Kuru Madde (KM) ve 3.8 - 4.1 pH oranına sahiptir. Sindirilebilirlik oranımız %72-75 olup, koçan dane ezme seviyemiz süt verimini doğrudan artırır. Detaylı analiz tablomuzu 'Ürünlerimiz' sayfasındaki 'Teknik Bilgi' kısmında görebilirsiniz."
          : "Our silage has 32-35% Dry Matter and 3.8-4.1 pH levels. Digestibility is 72-75%, directly increasing milk yield. You can see full specification values under 'Specs & Lab' on the Products page.";
      } else if (lowerText.includes('neresi') || lowerText.includes('fabrika') || lowerText.includes('nerede') || lowerText.includes('adana') || lowerText.includes('konum') || lowerText.includes('yer') || lowerText.includes('location')) {
        botResponse = lang === 'tr'
          ? "Üretim tesisimiz Adana Organize Tarım Bölgesi'ndedir. Türkiye'nin her yerine nakliyemiz vardır."
          : "Our production facility is in Adana Organized Agriculture Zone. We offer shipping throughout Turkey.";
      } else if (lowerText.includes('nakliye') || lowerText.includes('lojistik') || lowerText.includes('sevkiyat') || lowerText.includes('teslimat') || lowerText.includes('kargo') || lowerText.includes('tır') || lowerText.includes('kamyon') || lowerText.includes('shipping') || lowerText.includes('delivery')) {
        botResponse = lang === 'tr'
          ? "Adana fabrikamızdan Türkiye geneline kendi anlaşmalı lojistik ağımız ile teslimat yapıyoruz. Nakliye maliyeti mesafeye göre hesaplanır. Hesaplama Araçları sayfamızdan ilinizi seçerek tahmini nakliye bedelini hesaplayabilirsiniz."
          : "We deliver throughout Turkey using our logistics network from our Adana factory. Shipping is calculated based on distance. You can estimate shipping cost on the Calculators page.";
      } else if (lowerText.includes('sipariş') || lowerText.includes('siparis') || lowerText.includes('nasıl') || lowerText.includes('nasil') || lowerText.includes('talep') || lowerText.includes('satın') || lowerText.includes('satin') || lowerText.includes('order')) {
        botResponse = lang === 'tr'
          ? "Sipariş veya fiyat teklifi talebi oluşturmak için 'İletişim & Sipariş' sayfamızdaki teklif formunu doldurabilir veya WhatsApp butonuna tıklayarak doğrudan bizimle konuşabilirsiniz."
          : "To place an order or request a quote, you can fill in the form on 'Contact & Order' page or click the WhatsApp button to chat directly.";
      } else if (lowerText.includes('merhaba') || lowerText.includes('selam') || lowerText.includes('hello') || lowerText.includes('hi')) {
        botResponse = lang === 'tr'
          ? "Merhaba! Size yardımcı olmaktan memnuniyet duyarım. Silaj ürünleri, analizler veya nakliye hakkında aklınıza takılanları sorabilirsiniz."
          : "Hello! I am happy to help you. Ask me anything about our silage products, specifications, or logistics.";
      } else {
        botResponse = lang === 'tr'
          ? "Sorunuzu tam anlayamadım ama silaj fiyatımız vakumlu balyalar için ton başına 5.500 ₺, dökme için ise 5.000 ₺'dir. Ürün analizlerimiz %32-35 kuru madde içerir. Detaylı bilgi veya nakliye hesaplaması için lütfen üst menüdeki 'Hesaplama Araçları' veya 'İletişim' sayfamızı ziyaret edin."
          : "I couldn't fully understand your question. Our silage price is 5,500 ₺/ton for vacuumed bales and 5,000 ₺/ton for bulk. It contains 32-35% dry matter. For details, please visit the 'Calculators' or 'Contact' page.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      
      setTimeout(() => {
        const container = document.getElementById('chat-messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }, 800);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    handleSendChatMessage(text);
  };

  // Parse active navigation tab
  const getActiveTab = () => {
    if (currentPath === '/') return 'home';
    if (currentPath === '/urunlerimiz') return 'products';
    if (currentPath === '/kalite-ve-uretim') return 'quality';
    if (currentPath === '/iletisim-ve-siparis') return 'contact';
    if (currentPath === '/hesaplama-araclari') return 'calculators';
    if (currentPath === '/bilgi-merkezi') return 'knowledge';
    if (currentPath === '/blog' || currentPath.startsWith('/blog/')) return 'blog';
    if (currentPath.startsWith('/il/')) return 'quality';
    return 'home';
  };
  const activeTab = getActiveTab();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Routing popstate and navigation handlers
  useEffect(() => {
    // Canonical Domain Redirect (SEO Best Practice)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isProduction && window.location.hostname !== 'www.demircansilaj.com.tr') {
      window.location.replace('https://www.demircansilaj.com.tr' + window.location.pathname + window.location.search);
      return;
    }

    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const match = path.match(/^\/blog\/([a-z0-9-]+)$/);
      setSelectedBlogSlug(match ? match[1] : null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (id) => {
    if (id === 'home') navigateTo('/');
    else if (id === 'products') navigateTo('/urunlerimiz');
    else if (id === 'quality') navigateTo('/kalite-ve-uretim');
    else if (id === 'contact') navigateTo('/iletisim-ve-siparis');
    else if (id === 'calculators') navigateTo('/hesaplama-araclari');
    else if (id === 'knowledge') navigateTo('/bilgi-merkezi');
    else if (id === 'blog') navigateTo('/blog');
  };

  // JSON-LD Schema & Dynamic Meta Injector
  useEffect(() => {
    const existingScript = document.getElementById('demircan-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    let schema = null;
    let pageTitle = '';
    let pageDesc = '';
    let pageCanonical = 'https://www.demircansilaj.com.tr' + currentPath;

    const matchProvince = currentPath.match(/^\/il\/([a-z0-9-]+)-misir-silaji$/);

    if (currentPath === '/') {
      pageTitle = lang === 'tr' 
        ? 'Demircan Silaj — Premium Mısır Silajı, Kapınıza Teslim' 
        : 'Demircan Silage — Premium Corn Silage, Delivered to Your Door';
      pageDesc = lang === 'tr' 
        ? 'Demircan Silaj: yüksek enerjili, fermente mısır silajı. Süt ve besi hayvancılığı için ton bazında sipariş, hızlı teslimat, laboratuvar analizli kalite.' 
        : 'Demircan Silage: high energy, fermented corn silage. Ton-based order, fast delivery, and lab-analyzed quality for dairy and beef livestock.';
      
      schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Demircan Silaj",
        "image": "https://www.demircansilaj.com.tr/media/13.jpeg",
        "telephone": "+905323272383",
        "email": "info@demircansilaj.com.tr",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Organize Tarım Bölgesi, Merkez Mah. Tarım Sk. No:12",
          "addressLocality": "Adana",
          "addressCountry": "TR"
        },
        "url": "https://www.demircansilaj.com.tr",
        "priceRange": "$$",
        "description": pageDesc
      };
    } else if (currentPath === '/urunlerimiz') {
      pageTitle = lang === 'tr' 
        ? 'Premium Kaba Yem Ürünlerimiz — Demircan Silaj' 
        : 'Premium Roughage Feed Products — Demircan Silage';
      pageDesc = lang === 'tr' 
        ? 'Premium 1000 kg vakumlu, 500 kg vakumlu balya ve dökme mısır silajı seçeneklerimizle kaba yem rasyon maliyetlerini düşürün.' 
        : 'Lower roughage ration costs with our premium 1000 kg vacuum, 500 kg vacuum bale, and bulk corn silage options.';
      
      schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "Product",
            "position": 1,
            "name": "1000 kg Vakumlu Mısır Silajı",
            "description": "Büyük ölçekli işletmeler için ideal, 24 ay raf ömrü sunan, özel bariyerli naylon ile preslenmiş ve havası alınmış rulo paketler.",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "TRY",
              "price": "5500"
            }
          },
          {
            "@type": "Product",
            "position": 2,
            "name": "500 kg Vakumlu Mısır Silajı",
            "description": "Orta ve küçük işletmeler için taşıması ve kullanımı daha kolay olan, aynı yüksek kalite standartlarında üretilmiş yarım tonluk vakumlu silaj.",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "TRY",
              "price": "5500"
            }
          }
        ]
      };
    } else if (currentPath === '/kalite-ve-uretim') {
      pageTitle = lang === 'tr' 
        ? 'Kalite Standartlarımız & Modern Üretim — Demircan Silaj' 
        : 'Quality Standards & Modern Production — Demircan Silage';
      pageDesc = lang === 'tr' 
        ? 'İdeal %31-35 kuru madde, 3.8-4.1 pH oranına sahip akredite laboratuvar analiz değerlerimiz ve 7 kat sarımlı UV stretch paketleme detaylarımız.' 
        : 'Accredited lab analysis showing 31-35% dry matter, 3.8-4.1 pH balance, and 7-layer UV stretch packaging details.';
    } else if (currentPath === '/iletisim-ve-siparis') {
      pageTitle = lang === 'tr' 
        ? 'İletişim, Fiyat Teklifi & Hızlı Sipariş — Demircan Silaj' 
        : 'Contact, Price Quote & Quick Order — Demircan Silage';
      pageDesc = lang === 'tr' 
        ? 'Adana fabrikamızdan Türkiye geneli lojistik dahil net fiyat teklifi almak, sipariş oluşturmak veya bizimle iletişime geçmek için formumuzu doldurun.' 
        : 'Fill in the form to get a net price quote including logistics throughout Turkey from our Adana factory, place an order, or contact us.';
    } else if (matchProvince) {
      const provId = matchProvince[1];
      const prov = provinces.find(p => p.id === provId);
      if (prov) {
        pageTitle = lang === 'tr' 
          ? `${prov.name} Mısır Silajı Fiyatları & Sipariş — Demircan Silaj` 
          : `${prov.name} Corn Silage Prices & Order — Demircan Silage`;
        pageDesc = lang === 'tr' 
          ? `${prov.name} genelindeki tüm besi ve süt üreticilerine, Adana fabrikamızdan ${prov.time} teslimatlı vakumlu ve dökme mısır silajı satışı.` 
          : `Vacuumed and bulk corn silage sales to all beef and dairy producers throughout ${prov.name}, with delivery in ${prov.time} from our Adana factory.`;
        
        schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": `${prov.name} Mısır Silajı Tedariği`,
          "description": pageDesc,
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "5500",
            "highPrice": "5500",
            "priceCurrency": "TRY"
          }
        };
      }
    } else if (currentPath === '/hesaplama-araclari') {
      pageTitle = lang === 'tr' 
        ? 'Mısır Silajı İhtiyacı & Süt Verim Hesaplayıcı' 
        : 'Corn Silage Feed Need & Milk Yield Calculator';
      pageDesc = lang === 'tr' 
        ? 'Hayvan sayısı ve süresine göre kaba yem ihtiyaçlarınızı ton bazında hesaplayın, nakliye bütçesini ve ek süt geliri kazancınızı bulun.' 
        : 'Calculate your roughage feed needs in tons based on animal count and period, estimate shipping budget and additional milk profit.';
      
      schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Mısır Silajı İhtiyacı Nasıl Hesaplanır?",
        "description": pageDesc,
        "step": [
          {
            "@type": "HowToStep",
            "name": "Hayvan Türü ve Sayısı Girin",
            "text": "Beslediğiniz süt ineği, besi danası veya küçükbaş hayvan adetlerini belirtin."
          },
          {
            "@type": "HowToStep",
            "name": "Besleme Süresi Seçin",
            "text": "Silajı kaç ay boyunca vermeyi planladığınızı seçin (örneğin 6 ay veya 12 ay)."
          },
          {
            "@type": "HowToStep",
            "name": "Toplam Tonajı Alın",
            "text": "Hesaplayıcının size sunduğu toplam mısır silajı miktarını ve nakliye maliyetini görerek teklif isteyin."
          }
        ]
      };
    } else if (currentPath === '/bilgi-merkezi') {
      pageTitle = lang === 'tr' 
        ? 'Kaba Yem Bilgi Merkezi & Rehberler — Demircan Silaj' 
        : 'Roughage Feed Info Hub & Guides — Demircan Silage';
      pageDesc = lang === 'tr' 
        ? 'Mısır silajında ideal nem, koçan olgunluğu, biçim boyutu, rasyon hazırlama teknikleri ve yem kalitesi hakkında akademik rehberler.' 
        : 'Academic guides on ideal moisture, cob maturity, cutting size, ration preparation techniques, and feed quality in corn silage.';
      
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Mısır Silajı Kalite ve Besleme Standartları Rehberi",
        "description": pageDesc,
        "author": {
          "@type": "Organization",
          "name": "Demircan Silaj Uzmanları"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Demircan Silaj",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.demircansilaj.com.tr/favicon.svg"
          }
        },
        "mainEntityOfPage": "https://www.demircansilaj.com.tr/bilgi-merkezi"
      };
    }

    // Dynamic tags injection
    if (pageTitle) {
      document.title = pageTitle;
      const ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (ogTitleMeta) ogTitleMeta.setAttribute('content', pageTitle);
    }
    if (pageDesc) {
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', pageDesc);
      const ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (ogDescMeta) ogDescMeta.setAttribute('content', pageDesc);
    }
    
    // Canonical link update
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageCanonical);

    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (ogUrlMeta) ogUrlMeta.setAttribute('content', pageCanonical);

    // JSON-LD injection
    if (schema) {
      const script = document.createElement('script');
      script.id = 'demircan-jsonld';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [currentPath, lang]);

  const headerNavItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'products', label: t('nav.products') },
    { id: 'quality', label: t('nav.quality') },
    { id: 'calculators', label: t('nav.calculators') },
    { id: 'blog', label: t('nav.blog') }
  ];

  const footerNavItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'products', label: t('nav.products') },
    { id: 'quality', label: t('nav.quality') },
    { id: 'calculators', label: t('nav.calculators') },
    { id: 'blog', label: t('nav.blog') },
    { id: 'knowledge', label: t('nav.knowledge') },
    { id: 'contact', label: t('nav.contact') }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-200 selection:text-green-900 antialiased">
      <Navbar 
        activeTab={activeTab}
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleNavigation={handleNavigation}
        changeLanguage={changeLanguage}
        lang={lang}
        t={t}
        navItems={headerNavItems}
      />
      
      <main>
        <Suspense fallback={<PageLoader />}>
          {currentPath === '/' && (
            <HomeView 
              t={t}
              lang={lang}
              handleNavigation={handleNavigation}
              setActiveMedia={setActiveMedia}
              galleryItems={galleryItems}
            />
          )}
          {currentPath === '/urunlerimiz' && (
            <ProductsView 
              t={t}
              lang={lang}
              setActiveSpecProduct={setActiveSpecProduct}
              formData={formData}
              setFormData={setFormData}
              handleNavigation={handleNavigation}
            />
          )}
          {currentPath === '/kalite-ve-uretim' && (
            <QualityView 
              t={t}
              lang={lang}
            />
          )}
          {currentPath === '/iletisim-ve-siparis' && (
            <ContactView 
              t={t}
              lang={lang}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentPath === '/hesaplama-araclari' && (
            <CalculatorsView 
              t={t}
              lang={lang}
              provinces={provinces}
              formData={formData}
              setFormData={setFormData}
              navigateTo={navigateTo}
              selectedProvId={selectedProvId}
              setSelectedProvId={setSelectedProvId}
            />
          )}
          {currentPath === '/bilgi-merkezi' && (
            <KnowledgeCenterView 
              t={t}
              lang={lang}
            />
          )}
          {(currentPath === '/blog' || currentPath.startsWith('/blog/')) && (
            <BlogView 
              t={t}
              lang={lang}
              selectedBlogSlug={selectedBlogSlug}
              setSelectedBlogSlug={setSelectedBlogSlug}
              navigateTo={navigateTo}
              handleNavigation={handleNavigation}
            />
          )}
          {currentPath.startsWith('/il/') && (
            (() => {
              const match = currentPath.match(/^\/il\/([a-z0-9-]+)-misir-silaji$/);
              if (match) {
                return (
                  <ProvinceView 
                    provinceId={match[1]}
                    provinces={provinces}
                    lang={lang}
                    t={t}
                    navigateTo={navigateTo}
                    setFormData={setFormData}
                    formData={formData}
                    setSelectedProvId={setSelectedProvId}
                  />
                );
              }
              return (
                <div className="pt-40 pb-32 text-center bg-gray-50 min-h-screen">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{lang === 'tr' ? 'Sayfa Bulunamadı' : 'Page Not Found'}</h1>
                  <p className="text-gray-600 mb-8">{lang === 'tr' ? 'Aradığınız mısır silajı sayfası mevcut değil.' : 'The corn silage page you are looking for does not exist.'}</p>
                  <button onClick={() => navigateTo('/')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">{lang === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Home'}</button>
                </div>
              );
            })()
          )}
        </Suspense>
      </main>

      <Footer navItems={footerNavItems} handleNavigation={handleNavigation} t={t} lang={lang} />

      {/* Media Lightbox Modal */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <button 
            onClick={() => setActiveMedia(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-55 cursor-pointer"
            aria-label="Kapat"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div 
            className="max-w-4xl w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeMedia.type === 'image' ? (
                <img 
                  src={activeMedia.src} 
                  alt={activeMedia.title} 
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <video 
                  src={activeMedia.src} 
                  controls 
                  autoPlay 
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
            </div>
            <div className="p-6 md:p-8 bg-gray-900 border-t border-gray-800 text-white text-left">
              <h3 className="text-xl font-bold mb-2 text-green-400">{activeMedia.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{activeMedia.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[330px] sm:w-[380px] h-[460px] bg-[#0b1220] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-white/[0.03] border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2.5 text-left">
              <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                <Leaf className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Demircan AI Asistan</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span> {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left" id="chat-messages-container">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-white/[0.04] text-gray-250 border border-white/5'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-white/[0.01] border-t border-white/5">
            {getChatSuggestions().map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(sug)}
                className="text-[11px] bg-white/[0.03] hover:bg-white/10 text-gray-300 border border-white/5 px-2.5 py-1 rounded-full transition-all cursor-pointer text-left"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleChatSubmit} className="p-3 bg-white/[0.02] border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={lang === 'tr' ? 'Mesajınızı yazın...' : 'Type a message...'}
              className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Buttons (Chatbot + WhatsApp) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5">
        {/* Chatbot Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-emerald-600 hover:bg-emerald-750 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group cursor-pointer"
          aria-label="Yapay Zekâ Asistanı"
        >
          <span className="absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-20 animate-pulse -z-10"></span>
          <MessageSquare className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-semibold">
            {lang === 'tr' ? 'Yapay Zekâ Asistanı' : 'AI Assistant'}
          </span>
        </button>

        {/* WhatsApp Button */}
        <div className="flex items-center justify-center relative">
          <span className="absolute inline-flex h-12 w-12 rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <a 
            href={`https://wa.me/905323272383?text=${encodeURIComponent(
              lang === 'tr' 
                ? 'Merhaba, mısır silajı fiyatları ve teslimat hakkında bilgi alabilir miyim?' 
                : 'Hello, can I get information about corn silage prices and delivery?'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative bg-green-500 text-white p-3.5 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group cursor-pointer"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-semibold">
              {lang === 'tr' ? 'WhatsApp Destek' : 'WhatsApp Support'}
            </span>
          </a>
        </div>
      </div>

      <ProductSpecModal 
        product={activeSpecProduct} 
        onClose={() => setActiveSpecProduct(null)} 
        lang={lang} 
      />
    </div>
  );
}

function Navbar({ 
  activeTab, 
  isScrolled, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleNavigation, 
  changeLanguage, 
  lang, 
  t, 
  navItems 
}) {
  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled || activeTab !== 'home' ? 'bg-white shadow-md py-2 border-b border-gray-100' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('home')}>
            <Leaf className={`h-8 w-8 mr-2 transition-colors ${isScrolled || activeTab !== 'home' ? 'text-green-700' : 'text-green-400'}`} />
            <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled || activeTab !== 'home' ? 'text-gray-900' : 'text-white'}`}>
              DEMİRCAN <span className={isScrolled || activeTab !== 'home' ? 'text-green-700' : 'text-green-400'}>SİLAJ</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`text-sm font-medium transition-all hover:text-green-600 relative py-1 cursor-pointer ${
                  activeTab === item.id 
                    ? (isScrolled || activeTab !== 'home' ? 'text-green-700 font-bold border-b-2 border-green-700' : 'text-green-400 font-bold border-b-2 border-green-400') 
                    : (isScrolled || activeTab !== 'home' ? 'text-gray-600' : 'text-gray-200')
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Desktop Language Switcher */}
            <div className={`flex items-center rounded-full p-0.5 border transition-all ${
              isScrolled || activeTab !== 'home' 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-white/10 border-white/20'
            }`}>
              <button 
                onClick={() => changeLanguage('tr')} 
                className={`text-[10px] font-black px-2 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'tr' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : (isScrolled || activeTab !== 'home' ? 'text-gray-500 hover:text-gray-950' : 'text-gray-300 hover:text-white')
                }`}
              >
                TR
              </button>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`text-[10px] font-black px-2 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : (isScrolled || activeTab !== 'home' ? 'text-gray-500 hover:text-gray-950' : 'text-gray-300 hover:text-white')
                }`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => handleNavigation('contact')}
              className="bg-green-600 text-white px-5 lg:px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              {t('hero.btnOrder')}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${isScrolled || activeTab !== 'home' ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`block w-full text-left px-4 py-3.5 text-base font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id ? 'text-green-700 bg-green-50 font-semibold' : 'text-gray-800 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-500">Dil / Language:</span>
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full p-0.5">
                <button 
                  onClick={() => changeLanguage('tr')} 
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${lang === 'tr' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  Türkçe
                </button>
                <button 
                  onClick={() => changeLanguage('en')} 
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${lang === 'en' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="pt-4 px-4">
              <button 
                onClick={() => handleNavigation('contact')}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-center block cursor-pointer"
              >
                {t('hero.btnOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer({ navItems, handleNavigation, t, lang }) {
  return (
    <footer className="bg-gray-950 text-gray-300 py-16 border-t-4 border-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <Leaf className="h-7 w-7 text-green-500 mr-2" />
              <span className="text-xl font-bold text-white tracking-wide">DEMİRCAN SİLAJ</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4">
              <a href="https://wa.me/905323272383" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-full transition-colors text-white">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6">{t('footer.links')}</h3>
            <ul className="space-y-3">
              {navItems.map(item => (
                <li key={item.id}>
                  <button onClick={() => handleNavigation(item.id)} className="text-sm text-gray-400 hover:text-green-400 transition-colors cursor-pointer">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6">
              {lang === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400">{lang === 'tr' ? 'Vakumlu Mısır Silajı (1000 kg)' : 'Vacuum Corn Silage (1000 kg)'}</li>
              <li className="text-sm text-gray-400">{lang === 'tr' ? 'Vakumlu Mısır Silajı (500 kg)' : 'Vacuum Corn Silage (500 kg)'}</li>
              <li className="text-sm text-gray-400">{lang === 'tr' ? 'Dökme Mısır Silajı (Kamyon Bazlı)' : 'Bulk Corn Silage (Truck Based)'}</li>
              <li className="text-sm text-gray-400">{lang === 'tr' ? 'Toptan Kaba Yem Tedariği' : 'Wholesale Forage Supply'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm">
                <MapPin className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {lang === 'tr' 
                    ? 'Organize Tarım Bölgesi, Merkez Mah. Tarım Sk. No:12 Adana, Türkiye' 
                    : 'Organized Agricultural Zone, Merkez District, Tarim St. No:12 Adana, Turkey'}
                </span>
              </li>
              <li className="flex items-center text-sm">
                <Phone className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                <span>+90 532 327 23 83</span>
              </li>
              <li className="flex items-center text-sm">
                <Mail className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                <span>info@demircansilaj.com.tr</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-900 mt-16 pt-8 text-sm text-center flex flex-col md:flex-row justify-between items-center text-gray-500">
          <p>&copy; 2026 Demircan Silaj. {t('footer.rights')}</p>
          <p className="mt-4 md:mt-0">
            {lang === 'tr' ? 'Premium Tarım ve Hayvancılık Çözümleri' : 'Premium Agriculture & Livestock Solutions'}
          </p>
        </div>
      </div>
    </footer>
  );
}

function ProductSpecModal({ product, onClose, lang }) {
  if (!product) return null;

  const specs = {
    '1000kg': {
      title: lang === 'tr' ? '1000 kg Vakumlu Mısır Silajı' : '1000 kg Vacuumed Corn Silage',
      desc: lang === 'tr' ? 'Büyük ölçekli endüstriyel besi ve süt çiftlikleri için özel olarak üretilen, 24 ay dayanıklı akredite laboratuvar onaylı ambalajlı silajımız.' : 'Our packaged silage with 24-month shelf life, approved by accredited laboratories, specifically produced for large-scale industrial beef and dairy farms.',
      data: [
        { label: lang === 'tr' ? 'Kuru Madde' : 'Dry Matter', val: '%32 - %35', target: lang === 'tr' ? 'Optimum fermantasyon ve yüksek enerji' : 'Optimum fermentation and high energy' },
        { label: lang === 'tr' ? 'pH Seviyesi' : 'pH Level', val: '3.8 - 4.1', target: lang === 'tr' ? 'Mükemmel fermantasyon ve asitlik dengesi' : 'Excellent fermentation and acidity balance' },
        { label: lang === 'tr' ? 'Ham Protein' : 'Crude Protein', val: '%8.0 - %8.5 (KM\'de)', target: lang === 'tr' ? 'Gelişmiş rasyon proteini' : 'Advanced ration protein' },
        { label: lang === 'tr' ? 'Nişasta Değeri' : 'Starch Value', val: '%28 - %32 (KM\'de)', target: lang === 'tr' ? 'Maksimum dane verimi ve nişasta oranı' : 'Maximum grain yield and starch ratio' },
        { label: 'NDF', val: '%40 - %44', target: lang === 'tr' ? 'Yüksek sindirilebilir lif oranı' : 'High digestible fiber ratio' },
        { label: 'ADF', val: '%22 - %25', target: lang === 'tr' ? 'Kolay sindirim and yüksek enerji dönüşümü' : 'Easy digestion and high energy conversion' },
        { label: lang === 'tr' ? 'Sindirilebilirlik' : 'Digestibility', val: '%72 - %75', target: lang === 'tr' ? 'Yüksek süt ve et verimi katkısı' : 'High contribution to milk and meat yield' },
        { label: lang === 'tr' ? 'Paket Tipi' : 'Package Type', val: lang === 'tr' ? '7 Kat UV Stretch, 24 Ay Raf Ömrü' : '7 Layer UV Stretch, 24 Month Shelf Life', target: lang === 'tr' ? 'Hava sızdırmaz, kızışma yapmaz vakum teknolojisi' : 'Airtight, no-heating vacuum technology' }
      ]
    },
    '500kg': {
      title: lang === 'tr' ? '500 kg Vakumlu Mısır Silajı' : '500 kg Vacuumed Corn Silage',
      desc: lang === 'tr' ? 'Orta ve küçük ölçekli işletmeler için taşıma ve yükleme kolaylığı sunan, 24 ay dayanıklı birinci sınıf vakumlu rulo balya ürünümüz.' : 'Our premium vacuumed round bale product with 24-month shelf life, offering easy transport and loading for small and medium-sized farms.',
      data: [
        { label: lang === 'tr' ? 'Kuru Madde' : 'Dry Matter', val: '%32 - %35', target: lang === 'tr' ? 'Optimum fermantasyon ve yüksek enerji' : 'Optimum fermentation and high energy' },
        { label: lang === 'tr' ? 'pH Seviyesi' : 'pH Level', val: '3.8 - 4.1', target: lang === 'tr' ? 'Mükemmel fermantasyon ve asitlik dengesi' : 'Excellent fermentation and acidity balance' },
        { label: lang === 'tr' ? 'Ham Protein' : 'Crude Protein', val: '%8.0 - %8.5 (KM\'de)', target: lang === 'tr' ? 'Gelişmiş rasyon proteini' : 'Advanced ration protein' },
        { label: lang === 'tr' ? 'Nişasta Değeri' : 'Starch Value', val: '%28 - %32 (KM\'de)', target: lang === 'tr' ? 'Maksimum dane verimi ve nişasta oranı' : 'Maximum grain yield and starch ratio' },
        { label: 'NDF', val: '%40 - %44', target: lang === 'tr' ? 'Yüksek sindirilebilir lif oranı' : 'High digestible fiber ratio' },
        { label: 'ADF', val: '%22 - %25', target: lang === 'tr' ? 'Kolay sindirim and yüksek enerji dönüşümü' : 'Easy digestion and high energy conversion' },
        { label: lang === 'tr' ? 'Sindirilebilirlik' : 'Digestibility', val: '%72 - %75', target: lang === 'tr' ? 'Yüksek süt ve et verimi katkısı' : 'High contribution to milk and meat yield' },
        { label: lang === 'tr' ? 'Paket Tipi' : 'Package Type', val: lang === 'tr' ? '7 Kat UV Stretch, 24 Ay Raf Ömrü' : '7 Layer UV Stretch, 24 Month Shelf Life', target: lang === 'tr' ? 'Hava sızdırmaz, kızışma yapmaz vakum teknolojisi' : 'Airtight, no-heating vacuum technology' }
      ]
    },
    'dokme': {
      title: lang === 'tr' ? 'Dökme Mısır Silajı' : 'Bulk Corn Silage',
      desc: lang === 'tr' ? 'Tarladan en taze haliyle biçilip doğrudan römork/kamyon bazlı sevkedilen, kendine ait silaj çukuru olan üreticiler için en ekonomik silaj seçeneği.' : 'The most economical silage option for farmers with their own silage pit, harvested at its freshest and delivered directly in bulk trailer/truck loads.',
      data: [
        { label: lang === 'tr' ? 'Kuru Madde' : 'Dry Matter', val: '%30 - %33', target: lang === 'tr' ? 'Hızlı fermantasyon için yüksek nem oranı' : 'High moisture content for rapid fermentation' },
        { label: lang === 'tr' ? 'pH Seviyesi' : 'pH Level', val: '3.9 - 4.2', target: lang === 'tr' ? 'Hızlı asitlik ve koruma başlama süresi' : 'Rapid acidity and protection onset' },
        { label: lang === 'tr' ? 'Ham Protein' : 'Crude Protein', val: '%7.8 - %8.3 (KM\'de)', target: lang === 'tr' ? 'Doğal rasyon proteini' : 'Natural ration protein' },
        { label: lang === 'tr' ? 'Nişasta Değeri' : 'Starch Value', val: '%27 - %30 (KM\'de)', target: lang === 'tr' ? 'Yüksek dane patlatma ve sindirim oranı' : 'High grain cracking and digestion rate' },
        { label: 'NDF', val: '%41 - %45', target: lang === 'tr' ? 'Lif kalitesi ve rumen sindirilebilirliği' : 'Fiber quality and rumen digestibility' },
        { label: 'ADF', val: '%23 - %26', target: lang === 'tr' ? 'Rasyonda dengeli enerji salınımı' : 'Balanced energy release in the ration' },
        { label: lang === 'tr' ? 'Sindirilebilirlik' : 'Digestibility', val: '%70 - %73', target: lang === 'tr' ? 'İdeal geviş getirme desteği' : 'Ideal rumination support' },
        { label: lang === 'tr' ? 'Paket Tipi' : 'Package Type', val: lang === 'tr' ? 'Dökme (Paketsiz)' : 'Bulk (Unpackaged)', target: lang === 'tr' ? 'Doğrudan tır ve kamyonlarla boşaltım' : 'Direct discharge with lorries and trucks' }
      ]
    }
  };

  const activeSpec = specs[product];
  if (!activeSpec) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-left relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer">
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
            <Leaf className="h-6 w-6" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">{activeSpec.title}</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {activeSpec.desc}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 mb-4 bg-white/[0.01]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] text-gray-450 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
                <th className="px-4 py-3 text-left">{lang === 'tr' ? 'Analiz Kriteri' : 'Analysis Metric'}</th>
                <th className="px-4 py-3 text-left">{lang === 'tr' ? 'Değer' : 'Value'}</th>
                <th className="px-4 py-3 text-left">{lang === 'tr' ? 'Hedef & Açıklama' : 'Target & Description'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {activeSpec.data.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">{item.label}</td>
                  <td className="px-4 py-3.5 font-extrabold text-emerald-400">{item.val}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{item.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all cursor-pointer"
          >
            {lang === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
