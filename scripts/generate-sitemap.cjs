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

const domain = "https://demircansilaj.com.tr";

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
`;

provinces.forEach(p => {
  xml += `  <url>
    <loc>${domain}/il/${p}-misir-silaji</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

xml += `</urlset>`;

const destDir = path.join(__dirname, '../public');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.writeFileSync(path.join(destDir, 'sitemap.xml'), xml);
console.log('Sitemap successfully generated in public/sitemap.xml');
