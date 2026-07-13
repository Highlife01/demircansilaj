# Demircan Silaj

Premium vakumlu mısır silajı ve kaba yem için kurumsal web sitesi + sipariş/iletişim sistemi ve gerçek zamanlı yönetim paneli.

**Canlı:** https://demircansilaj.com.tr

## Özellikler

- **Kurumsal site** — Ana sayfa, ürünler, kalite & üretim, iletişim (React + Tailwind).
- **Sipariş sistemi** — Canlı fiyat hesaplayıcı ile teklif formu; talepler Firestore'a kaydedilir ve WhatsApp'a iletilir.
- **İletişim formu** — Ziyaretçi mesajları Firestore'a düşer.
- **Yönetim paneli** (`/admin`) — Firebase Auth ile giriş, gerçek zamanlı sipariş/mesaj takibi:
  - İstatistik kartları, aylık trend + ürün/il dağılım grafikleri (kütüphanesiz SVG)
  - Durum yönetimi (Yeni / İletişime geçildi / Tamamlandı / İptal), iç not, arama, durum filtresi
  - CSV dışa aktarma, "tümünü okundu", yeni kayıtta ses + tarayıcı bildirimi
- **SEO / GEO** — JSON-LD (Organization, LocalBusiness, WebSite, FAQPage), Open Graph, canonical, `robots.txt`, `llms.txt`, otomatik `sitemap.xml`.
- **PWA** — Yüklenebilir uygulama, kısayollar, service worker.

## Teknoloji

React 19 · Vite 8 (Rolldown) · Tailwind CSS 4 · Firebase (Hosting, Firestore, Auth) · lucide-react

## Geliştirme

```bash
npm install
npm run dev        # geliştirme sunucusu
npm run build      # sitemap üretir + production build (dist/)
npm run preview    # build önizleme
npm run lint       # oxlint
```

## Dağıtım (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting:demircansilaj --project finansarena-bdae9
```

> Ağ sorununda deploy öncesi: `$env:NODE_OPTIONS="--dns-result-order=ipv4first"`

## Proje Yapısı

```
index.html               # meta, JSON-LD şema, canonical yönlendirme
src/
  main.jsx               # /admin -> panel, aksi halde site (lazy-load)
  App.jsx                # kurumsal site + form gönderimleri
  firebase.js            # Firebase init + koleksiyon adları
  admin/
    AdminApp.jsx         # auth durumu + yetki kontrolü
    AdminLogin.jsx       # giriş ekranı
    AdminDashboard.jsx   # panel (siparişler/mesajlar)
    DashboardCharts.jsx  # SVG grafikler
    OrderDetailModal.jsx # sipariş detay + iç not
    notify.js            # ses + tarayıcı bildirimi
  data/provinces.js      # programatik SEO il verisi
scripts/generate-sitemap.cjs  # build sırasında sitemap.xml üretir
firestore.rules          # Firestore güvenlik kuralları
```

## Firebase Notları (ÖNEMLİ)

Bu proje (`finansarena-bdae9`) **başka uygulamalarla paylaşımlıdır** (aynı Auth & Firestore).

- **Koleksiyonlar önekli:** `demircan_orders`, `demircan_messages` (çakışmayı önlemek için).
- **Firestore kuralları:** `firestore.rules` diğer uygulamaların kurallarını da içerir. Kural eklerken mevcutları **silmeyin**; yeni bloğu sondaki `match /{document=**} { allow ... if false }` catch-all'dan **önce** ekleyin.
- **Panel erişimi:** Yalnızca `AdminApp.jsx` içindeki `ALLOWED_ADMIN_UIDS` listesinde ve Firestore kurallarındaki `isDemircanAdmin()` içinde tanımlı yönetici UID'leri panele erişebilir. Yeni yönetici eklerken **iki yeri de** güncelleyin.
- **Canonical domain:** `https://demircansilaj.com.tr`. Tüm URL'ler (sitemap, canonical, OG, JSON-LD, robots, llms) bu domaini kullanır; `web.app`/`firebaseapp.com` istemci tarafında buraya yönlendirilir.

## Sipariş & Mesaj Akışı

```
Ziyaretçi formu  ──►  Firestore (demircan_orders / demircan_messages)
                              │  (onSnapshot, gerçek zamanlı)
                              ▼
                     /admin paneli  ──►  ses + tarayıcı bildirimi
```

