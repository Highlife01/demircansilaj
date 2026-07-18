import React, { useState } from 'react';
import { MapPin, Clock, Info, UserCheck, PhoneCall, ChevronRight } from 'lucide-react';
import { provinces } from '../data/provinces';

export const regions = {
  marmara: {
    name: "Marmara Bölgesi",
    color: "fill-blue-500/25 stroke-blue-500 hover:fill-blue-500/40",
    activeColor: "fill-blue-500/50 stroke-blue-400 shadow-blue-500/50",
    textColor: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    points: "30,80 180,40 220,70 200,120 120,130 80,110",
    labelX: 110,
    labelY: 90,
    provinces: ["istanbul", "bursa", "balikesir", "kocaeli", "sakarya", "canakkale", "tekirdag", "edirne", "kirklareli", "yalova", "bilecik"]
  },
  ege: {
    name: "Ege Bölgesi",
    color: "fill-emerald-500/25 stroke-emerald-500 hover:fill-emerald-500/40",
    activeColor: "fill-emerald-500/50 stroke-emerald-400 shadow-emerald-500/50",
    textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    points: "30,150 120,130 150,210 140,270 50,330",
    labelX: 80,
    labelY: 210,
    provinces: ["izmir", "manisa", "aydin", "denizli", "mugla", "afyonkarahisar", "kutahya", "usak"]
  },
  akdeniz: {
    name: "Akdeniz Bölgesi",
    color: "fill-orange-500/25 stroke-orange-500 hover:fill-orange-500/40",
    activeColor: "fill-orange-500/50 stroke-orange-400 shadow-orange-500/50",
    textColor: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    points: "140,270 220,220 380,220 480,180 430,270 300,320 180,310",
    labelX: 280,
    labelY: 270,
    provinces: ["adana", "mersin", "antalya", "hatay", "osmaniye", "kahramanmaras", "isparta", "budur"]
  },
  ic_anadolu: {
    name: "İç Anadolu Bölgesi",
    color: "fill-yellow-500/25 stroke-yellow-500 hover:fill-yellow-500/40",
    activeColor: "fill-yellow-500/50 stroke-yellow-400 shadow-yellow-500/50",
    textColor: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    points: "200,120 350,110 500,100 480,180 380,220 220,220 150,210 120,130",
    labelX: 310,
    labelY: 170,
    provinces: ["konya", "ankara", "kayseri", "eskisehir", "aksaray", "karaman", "nigde", "sivas", "nevsehir", "kirikkale", "kirsehir", "cankiri", "yozgat"]
  },
  karadeniz: {
    name: "Karadeniz Bölgesi",
    color: "fill-teal-500/25 stroke-teal-500 hover:fill-teal-500/40",
    activeColor: "fill-teal-500/50 stroke-teal-400 shadow-teal-500/50",
    textColor: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    points: "200,50 450,30 750,70 650,110 500,100 350,110 200,120",
    labelX: 470,
    labelY: 75,
    provinces: ["samsun", "trabzon", "ordu", "giresun", "rize", "artvin", "amasya", "tokat", "corum", "sinop", "kastamonu", "zonguldak", "bartin", "karabuk", "bolu", "duzce", "bayburt", "gumushane"]
  },
  dogu_anadolu: {
    name: "Doğu Anadolu Bölgesi",
    color: "fill-purple-500/25 stroke-purple-500 hover:fill-purple-500/40",
    activeColor: "fill-purple-500/50 stroke-purple-400 shadow-purple-500/50",
    textColor: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    points: "500,100 750,70 770,190 620,220 480,180",
    labelX: 630,
    labelY: 140,
    provinces: ["erzurum", "kars", "ardahan", "igdir", "van", "agri", "mus", "bitlis", "hakkari", "malatya", "elazig", "erzincan", "tunceli", "bingol"]
  },
  guneydogu_anadolu: {
    name: "Güneydoğu Anadolu Bölgesi",
    color: "fill-red-500/25 stroke-red-500 hover:fill-red-500/40",
    activeColor: "fill-red-500/50 stroke-red-400 shadow-red-500/50",
    textColor: "text-red-400 border-red-500/20 bg-red-500/5",
    points: "480,180 620,220 730,220 650,290 430,270",
    labelX: 580,
    labelY: 250,
    provinces: ["gaziantep", "sanliurfa", "diyarbakir", "mardin", "batman", "adiyaman", "siirt", "sirnak", "kilis"]
  }
};

export default function TurkeyMap({ onProvinceSelect, selectedProvinceId }) {
  const [selectedRegionKey, setSelectedRegionKey] = useState('ic_anadolu');
  const [hoveredRegionKey, setHoveredRegionKey] = useState(null);

  const activeRegion = regions[selectedRegionKey];
  const regionProvinces = activeRegion.provinces.map(pId => provinces.find(p => p.id === pId)).filter(Boolean);

  const handleRegionClick = (key) => {
    setSelectedRegionKey(key);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-left">
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Map Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center py-1 px-3 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold tracking-wide mb-3">
              KABA YEM DAĞITIM AĞI
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Türkiye İnteraktif Lojistik Haritası
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light mb-6">
              Bölgelere tıklayarak Adana fabrikamızdan olan teslimat sürelerini ve bölgesel hayvancılık verilerini inceleyin.
            </p>
          </div>

          {/* SVG Map Wrapper */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 md:p-6 flex items-center justify-center relative aspect-[2/1] overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
            
            <svg 
              viewBox="0 0 800 350" 
              className="w-full h-full relative z-10 select-none drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              {/* Region Polygons */}
              {Object.entries(regions).map(([key, data]) => {
                const isActive = selectedRegionKey === key;
                const isHovered = hoveredRegionKey === key;
                return (
                  <g 
                    key={key}
                    className="cursor-pointer group"
                    onClick={() => handleRegionClick(key)}
                    onMouseEnter={() => setHoveredRegionKey(key)}
                    onMouseLeave={() => setHoveredRegionKey(null)}
                  >
                    <polygon
                      points={data.points}
                      className={`transition-all duration-300 stroke-[2px] ${
                        isActive ? data.activeColor : data.color
                      }`}
                      style={{
                        filter: isActive || isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                        transform: isHovered ? 'scale(1.01) translate(-0.5%, -0.5%)' : 'none',
                        transformOrigin: `${data.labelX}px ${data.labelY}px`
                      }}
                    />
                    {/* Region Label Text */}
                    <text
                      x={data.labelX}
                      y={data.labelY}
                      className={`text-[11px] font-black pointer-events-none transition-all duration-300 text-center select-none ${
                        isActive 
                          ? 'fill-white scale-110 font-black' 
                          : isHovered 
                            ? 'fill-slate-100 scale-105' 
                            : 'fill-slate-400'
                      }`}
                      style={{
                        textAnchor: 'middle',
                        transform: isActive || isHovered ? 'scale(1.05)' : 'none',
                        transformOrigin: `${data.labelX}px ${data.labelY}px`
                      }}
                    >
                      {data.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Info Grid (Sidebar) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/40 border border-slate-850/60 rounded-3xl p-5 md:p-6">
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider mb-2.5 ${activeRegion.textColor}`}>
                <Info className="h-3.5 w-3.5" /> {activeRegion.name}
              </span>
              <h3 className="text-lg font-bold text-white">Bölgesel Lojistik Analizi</h3>
            </div>

            {/* Province Selection Dropdown / Grid */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">İller (Seçim Yapın)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {regionProvinces.map((prov) => {
                  const isSelected = selectedProvinceId === prov.id;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => onProvinceSelect && onProvinceSelect(prov)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-green-500 text-black border-green-400 font-extrabold shadow-lg shadow-green-500/10'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {prov.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Province Details Box */}
            {selectedProvinceId && provinces.find(p => p.id === selectedProvinceId) && (
              (() => {
                const prov = provinces.find(p => p.id === selectedProvinceId);
                return (
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                      <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-green-400" /> {prov.name}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                        {prov.dist} km
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Nakliye Süresi</span>
                        <span className="font-bold text-white flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-green-400" /> {prov.time}</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Hayvancılık Gücü</span>
                        <span className="font-bold text-white flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-green-400" /> {(prov.cattle || 0).toLocaleString('tr-TR')} BB</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-relaxed pt-1.5 font-light">
                      Adana tesislerimizden {prov.name} bölgesine {prov.dist} km nakliye ile 24 ay dayanıklı birinci sınıf vakumlu rulo paket silaj sevk edilmektedir.
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {selectedProvinceId && (
            <button
              onClick={() => {
                const prov = provinces.find(p => p.id === selectedProvinceId);
                if (prov && onProvinceSelect) onProvinceSelect(prov, true); // true passes trigger navigation
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-green-500/10 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" /> Seçili Bölge İçin Teklif Al <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
