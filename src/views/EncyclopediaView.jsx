import React, { useState } from 'react';
import { BookOpen, Star, HelpCircle, ChevronRight, FileText } from 'lucide-react';

const encyclopediaTerms = [
  {
    id: "silaj",
    title: "Silaj",
    letter: "S",
    summary: "Yüksek nemli yeşil yemlerin havasız ortamda laktik asit bakterileri tarafından fermente edilerek turşulaştırılması yöntemi.",
    optimal: "Nem oranı %60-70 (balyada %30-35 kuru madde)",
    description: "Silaj, kaba yemin besin değerlerini uzun süre koruyarak hayvan beslenmesinde yeşil yem ihtiyacının yıl boyu karşılanmasını sağlar. Ekonomik, lezzetli ve yüksek sindirilebilirliğe sahip bir kaba yem depolama biçimidir.",
    impact: "Hayvanın geviş getirmesini destekler, rasyon maliyetini düşürür.",
    references: "Ziraat Fakülteleri Kaba Yem Besleme El Kitabı, 2024"
  },
  {
    id: "misir-silaji",
    title: "Mısır Silajı",
    letter: "M",
    summary: "Koçan dane gelişimi süt çizgisine ulaştığında biçilerek fermente edilen, kaba yemlerin kralı olarak kabul edilen yüksek enerjili silaj türü.",
    optimal: "Kuru Madde %30-35, Nişasta %28-35",
    description: "Mısır silajı, yüksek karbonhidrat ve nişasta içeriği sayesinde ruminant hayvanlarda en önemli enerji kaynağıdır. Özellikle süt inekçiliği rasyonlarının ana omurgasını oluşturur.",
    impact: "Günlük süt verimini doğrudan artırır, süt yağ oranını dengeler.",
    references: "Ulusal Süt Konseyi Besleme Raporları, 2025"
  },
  {
    id: "yonca-silaji",
    title: "Yonca Silajı",
    letter: "Y",
    summary: "Protein oranı son derece yüksek olan yonca bitkisinin soldurularak veya koruyucu katkılarla fermente edilmesi yöntemi.",
    optimal: "Kuru Madde %35-40, Protein %18-22",
    description: "Yonca silajı, protein açığı bulunan rasyonları dengelemek için mükemmel bir alternatiftir. Kuru yoncaya kıyasla yaprak kayıplarını minimuma indirdiği için besin değeri daha yüksektir.",
    impact: "Kaba yem kaynaklı protein alımını artırarak konsantre yem ihtiyacını azaltır.",
    references: "Tarım ve Orman Bakanlığı Yem Bitkileri Kılavuzu"
  },
  {
    id: "ph",
    title: "pH Değeri",
    letter: "P",
    summary: "Silaj fermantasyonunun başarısını ve asitlik seviyesini gösteren en temel kalite parametresi.",
    optimal: "3.8 - 4.2 (Mısır silajı için ideal kararlı asitlik seviyesi)",
    description: "Hasat sonrası havasız (vakumlu) ortamda laktik asit bakterileri şekerleri laktik aside dönüştürerek pH seviyesini hızla düşürür. Düşük pH, çürümeye yol açan bütirik asit bakterileri ile patojenlerin üremesini engeller.",
    impact: "pH dengesi stabil olan silajlarda küflenme ve toksin birikimi sıfırdır.",
    references: "FAO Silage Fermentation Guidelines"
  },
  {
    id: "kuru-madde",
    title: "Kuru Madde (KM)",
    letter: "K",
    summary: "Yemin içeriğindeki su tamamen uzaklaştırıldıktan sonra geriye kalan besleyici kısım.",
    optimal: "%30 - %35 (Optimum nem dengesi için)",
    description: "Kuru madde oranı hasat zamanına doğrudan bağlıdır. Düşük kuru madde (%30 altı) silaj sızıntı suyuna ve besin kaybına yol açarken, yüksek kuru madde (%38 üstü) sıkıştırmayı zorlaştırıp küflenmeye neden olur.",
    impact: "Kuru madde tüketimi doğrudan kuru madde alım kapasitesini ve rasyon verimini etkiler.",
    references: "NRC Livestock Nutrient Requirements, 2023"
  },
  {
    id: "ndf",
    title: "NDF (Nötral Deterjan Lif)",
    letter: "N",
    summary: "Bitki hücre duvarını oluşturan hemiselüloz, selüloz ve lignin toplam miktarını ifade eden lif fraksiyonu.",
    optimal: "%40 - %48 (Mısır silajı kuru maddesinde)",
    description: "NDF değeri yemin hayvan tarafından tüketilme sınırını belirler. NDF yükseldikçe hayvanın yem tüketim kapasitesi doluluk hissi nedeniyle düşer. Düşük ve kaliteli NDF, lezzetliliği artırır.",
    impact: "Rumen doluluğunu ve toplam yem tüketim oranını doğrudan regüle eder.",
    references: "Cornell Net Carbohydrate and Protein System (CNCPS)"
  },
  {
    id: "adf",
    title: "ADF (Asit Deterjan Lif)",
    letter: "A",
    summary: "Bitki hücre duvarındaki sindirimi zor olan selüloz ve sindirilemeyen lignin miktarını gösteren lif parametresi.",
    optimal: "%22 - %28 (Mısır silajı kuru maddesinde)",
    description: "ADF değeri yemin sindirilebilirliği ile ters orantılıdır. ADF değeri yükseldikçe silajın hayvana sağladığı enerji ve sindirilebilirlik oranı düşer. Düşük ADF, premium kalite işaretidir.",
    impact: "Düşük ADF değerleri yemden yararlanma oranını (yem çevrimini) maksimize eder.",
    references: "Journal of Dairy Science, Forage Evaluation Study"
  },
  {
    id: "tmr",
    title: "TMR (Total Mixed Ration)",
    letter: "T",
    summary: "Kaba yemler, konsantre yemler, vitaminler ve minerallerin homojen şekilde karıştırılarak hayvana tek bir öğün olarak sunulması.",
    optimal: "Homojen karışım, seçilemeyen rasyon yapısı",
    description: "TMR uygulaması rumen asitliğini dengede tutar. Hayvanın sadece lezzetli konsantre yemi seçmesini engelleyerek her lokmada dengeli kaba ve kesif yem almasını sağlar. Silaj, TMR'ın nemlendirici ve bağlayıcı ana maddesidir.",
    impact: "Asidoz riskini azaltır, yem seçme davranışını önler ve verimi standardize eder.",
    references: "Modern Dairy Herd Feeding Operations, 2024"
  },
  {
    id: "nisasta",
    title: "Nişasta",
    letter: "N",
    summary: "Mısır koçanındaki danelerden gelen, ruminant hayvanlar için yüksek oranda sindirilebilir enerji kaynağı olan kompleks karbonhidrat.",
    optimal: "%28 - %35 (Kuru maddede yüksek dane oranı)",
    description: "Mısır silajının kalitesi dane oranına göre ölçülür. Biçim sırasında dane kırıcı (kernel processor) kullanılması nişastanın rumende tamamen çözünmesini ve kana karışmasını sağlar.",
    impact: "Süt verimini doğrudan artırır ve besi danalarında günlük canlı ağırlık kazancını yükseltir.",
    references: "University of Wisconsin Silage Research Program"
  }
];

export default function EncyclopediaView({ t, lang }) {
  const [selectedTerm, setSelectedTerm] = useState(encyclopediaTerms[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLetter, setActiveLetter] = useState("HEPSİ");

  const letters = ["HEPSİ", ...Array.from(new Set(encyclopediaTerms.map(t => t.letter))).sort()];

  const filteredTerms = encyclopediaTerms.filter(term => {
    const matchesSearch = term.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          term.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = activeLetter === "HEPSİ" || term.letter === activeLetter;
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#062419] to-[#0b1220] rounded-3xl p-8 md:p-14 text-white mb-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-green-400/10 border border-green-400/20 text-green-300 text-xs font-semibold tracking-wide mb-6">
              <BookOpen className="h-4 w-4" />
              TÜRKİYE'NİN SİLAJ ANSİKLOPEDİSİ
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Silaj Terimleri & Bilimsel Parametreler Sözlüğü
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
              Hayvancılık, yem üretimi, fermantasyon kimyası ve rasyon mühendisliğinde kullanılan tüm bilimsel değerleri, laboratuvar parametrelerini ve tanımları burada keşfedin.
            </p>
          </div>
        </div>

        {/* Navigation & Search Row */}
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Alphabet Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLetter === letter 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-650 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Terimlerde arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-xs text-gray-700"
            />
          </div>
        </div>

        {/* Workspace Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Term List Sidebar (Col span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-150 shadow-sm max-h-[600px] overflow-y-auto space-y-2">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3 px-2 border-b border-gray-100 pb-2">Terim Listesi</h3>
            {filteredTerms.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8">Aradığınız kriterde terim bulunamadı.</p>
            ) : (
              filteredTerms.map(term => (
                <button
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                    selectedTerm?.id === term.id 
                      ? 'bg-green-50/70 border border-green-150/50 text-green-800 font-bold' 
                      : 'hover:bg-gray-50 border border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{term.title}</span>
                    <span className="text-[10px] text-gray-400 font-normal mt-0.5 line-clamp-1">{term.summary}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedTerm?.id === term.id ? 'translate-x-1 text-green-600' : 'group-hover:translate-x-1'}`} />
                </button>
              ))
            )}
          </div>

          {/* Term Details Main (Col span 8) */}
          <div className="lg:col-span-8">
            {selectedTerm ? (
              <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm space-y-8 animate-in fade-in duration-200">
                {/* Header info */}
                <div className="border-b border-gray-100 pb-6 flex items-start justify-between">
                  <div>
                    <span className="bg-green-150/55 text-green-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                      ANSİKLOPEDİ TERİM DETAYI
                    </span>
                    <h2 className="text-3xl font-black text-gray-950">{selectedTerm.title}</h2>
                  </div>
                  <div className="bg-gray-100 h-12 w-12 rounded-2xl flex items-center justify-center font-black text-gray-500 text-lg">
                    {selectedTerm.letter}
                  </div>
                </div>

                {/* Summary block */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-green-700 fill-current" /> Kısa Özet
                  </h4>
                  <p className="text-sm text-gray-750 font-medium leading-relaxed italic">
                    "{selectedTerm.summary}"
                  </p>
                </div>

                {/* Optimal Values block */}
                <div className="bg-green-50/40 rounded-2xl p-5 border border-green-100">
                  <h4 className="font-bold text-green-850 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-green-700" /> Optimum Teknik Değer Aralığı
                  </h4>
                  <p className="text-base font-bold text-green-900 leading-normal">
                    {selectedTerm.optimal}
                  </p>
                </div>

                {/* Detailed Description */}
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Bilimsel Açıklama ve Önemi</h4>
                  <p className="text-gray-650 text-sm leading-relaxed">
                    {selectedTerm.description}
                  </p>
                </div>

                {/* Animal Yield Impact */}
                <div className="border-l-4 border-yellow-500 pl-4 py-1">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">Hayvansal Verimlilik ve Rasyona Etkisi</h4>
                  <p className="text-gray-650 text-sm font-medium leading-relaxed">
                    {selectedTerm.impact}
                  </p>
                </div>

                {/* Bibliography Citation */}
                <div className="pt-6 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-semibold">
                  <FileText className="h-4 w-4" />
                  <span>Referans: {selectedTerm.references}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-sm text-center text-gray-400">
                Lütfen detaylarını görüntülemek istediğiniz ansiklopedi terimini seçin.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
