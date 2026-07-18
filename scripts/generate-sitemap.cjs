const fs = require('fs');
const path = require('path');

const provinces = [
  "adana", "adiyaman", "afyonkarahisar", "agri", "aksaray", "amasya", "ankara", "antalya", 
  "ardahan", "artvin", "aydin", "balikesir", "bartin", "batman", "bayburt", "bilecik", 
  "bingol", "bitlis", "bolu", "burdur", "bursa", "canakkale", "cankiri", "corum", 
  "denizli", "diyarbakir", "duzce", "edirne", "elazig", "erzincan", "erzurum", "eskisehir", 
  "gaziantep", "giresun", "gumushane", "hakkari", "hatay", "igdir", "isparta", "istanbul", 
  "izmir", "kahramanmaras", "karabuk", "karaman", "kars", "kastamonu", "kayseri", 
  "kirikkale", "kirklareli", "kirsehir", "kilis", "kocaeli", "konya", "kutahya", 
  "malatya", "manisa", "mardin", "mersin", "mugla", "mus", "nevsehir", "nigde", 
  "ordu", "osmaniye", "rize", "sakarya", "samsun", "siirt", "sinop", "sivas", 
  "sanliurfa", "sirnak", "tekirdag", "tokat", "trabzon", "tunceli", "usak", "van", 
  "yalova", "yozgat", "zonguldak"
];

const districts = [
  { id: "seyhan", provinceId: "adana" },
  { id: "karaisali", provinceId: "adana" },
  { id: "kozan", provinceId: "adana" },
  { id: "ceyhan", provinceId: "adana" },
  { id: "yuregir", provinceId: "adana" },
  { id: "karatay", provinceId: "konya" },
  { id: "meram", provinceId: "konya" },
  { id: "selcuklu", provinceId: "konya" },
  { id: "eregli", provinceId: "konya" },
  { id: "aksehir", provinceId: "konya" },
  { id: "odemis", provinceId: "izmir" },
  { id: "tire", provinceId: "izmir" },
  { id: "torbali", provinceId: "izmir" },
  { id: "bergama", provinceId: "izmir" },
  { id: "altieylul", provinceId: "balikesir" },
  { id: "karesi", provinceId: "balikesir" },
  { id: "bandirma", provinceId: "balikesir" },
  { id: "gonen", provinceId: "balikesir" },
  { id: "yakutiye", provinceId: "erzurum" },
  { id: "palandoken", provinceId: "erzurum" },
  { id: "aziziye", provinceId: "erzurum" },
  { id: "oltu", provinceId: "erzurum" }
];

const encyclopediaSlugs = [
  "silaj", "misir-silaji", "yonca-silaji", "ph", "kuru-madde", "ndf", "adf", "tmr", "nisasta"
];

const academyCourses = [
  "temel-silaj", "rasyon-yonetimi", "biyofermantasyon"
];

const domain = "https://www.demircansilaj.com.tr";

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/urunlerimiz</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/kalite-ve-uretim</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/iletisim-ve-siparis</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/hesaplama-araclari</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${domain}/bilgi-merkezi</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/bilgi-merkezi/ansiklopedi</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/bilgi-merkezi/akademi</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

// Encyclopedia Terms
encyclopediaSlugs.forEach(slug => {
  xml += `  <url>
    <loc>${domain}/bilgi-merkezi/ansiklopedi/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

// Academy Courses
academyCourses.forEach(course => {
  xml += `  <url>
    <loc>${domain}/bilgi-merkezi/akademi/${course}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

// Provinces
provinces.forEach(p => {
  xml += `  <url>
    <loc>${domain}/il/${p}-misir-silaji</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

// Districts
districts.forEach(d => {
  xml += `  <url>
    <loc>${domain}/il/${d.provinceId}/${d.id}-misir-silaji</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>\n`;
});

xml += `</urlset>`;

const destDir = path.join(__dirname, '../public');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.writeFileSync(path.join(destDir, 'sitemap.xml'), xml);
console.log('Sitemap successfully generated in public/sitemap.xml');
