# 🚀 Demircan Silaj — Kurulum Talimatları

**Durum:** Proje 90% hazır. Son 3 adım manuel konfigürasyon gerekli.

---

## 📋 Hızlı Başlangıç Listesi

- [x] **1. Firestore Rules** — ✅ Deployed
- [x] **2. Cloud Functions Code** — ✅ Hazır
- [x] **3. TypeScript Config** — ✅ Kurulu
- [ ] **4. Pricing Document** — ⏳ Manual Gerekli
- [ ] **5. Rate Limiting Integration** — ⏳ Code Gerekli
- [ ] **6. Email Configuration** — ⏳ API Key Gerekli

---

## 4️⃣ Firestore Pricing Document Oluştur

### Seçenek A: Manual (2 dakika)

1. **Firebase Console açınız:**
   - 🔗 https://console.firebase.google.com/u/0/project/finansarena-bdae9/firestore

2. **Yeni Koleksiyon Oluştur:**
   - Koleksiyon Adı: `demircan_pricing_rules`
   - İlk Document ID: `current`

3. **Aşağıdaki Alanları Ekle:** (Özellikleri ayarla)
   ```
   baseProductPrice      → Number    → 5500
   shippingMinFee        → Number    → 4000
   shippingPerKm         → Number    → 2.2
   concentrateCost       → Number    → 120
   forageCost           → Number    → 60
   silagePrice          → Number    → 5.5
   milkPrice            → Number    → 15
   milkIncreasePerCow   → Number    → 2.5
   concentrateReduction → Number    → 0.30
   lastUpdated          → String    → [şimdiki tarih ISO formatı]
   updatedBy            → String    → admin
   ```

4. **Kaydet** ve tamamlayın ✅

### Seçenek B: Otomatik (Gelecek)

```bash
# Adım 1: Service Account Key indir
# https://console.firebase.google.com/u/0/project/finansarena-bdae9/settings/serviceaccounts/adminsdk
# → "Generate New Private Key" → Save as: serviceAccountKey.json

# Adım 2: Çalıştır
npm run setup:firestore
```

---

## 5️⃣ Rate Limiting'i Formlar'a Entegre Et

### ContactView.jsx Güncellemesi

[Dosya: src/views/ContactView.jsx](src/views/ContactView.jsx)

```javascript
// En üstte import ekle
import { contactFormRateLimiter } from '../utils/rateLimiter.js';

// Submit handler'ı güncelle
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Rate limiting check
  if (!contactFormRateLimiter.canSubmit()) {
    setError('Çok hızlı gönderdiniz. Lütfen 1 dakika bekleyin.');
    setTimeout(() => setError(''), 3000);
    return;
  }
  
  try {
    // Existing form submission code...
    const docRef = await addDoc(collection(db, 'demircan_messages'), {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    contactFormRateLimiter.recordSubmit();
    // ... rest of code
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### CalculatorsView.jsx Güncellemesi

Benzer şekilde `orderFormRateLimiter` ekle.

---

## 6️⃣ Email Konfigürasyonu (SendGrid)

### Adım 1: SendGrid API Key Oluş

1. SendGrid'e kaydol: https://sendgrid.com
2. API Keys oluştur: https://app.sendgrid.com/settings/api_keys
3. Seçenekler:
   - Scope: `Mail Send → Full Access`
   - Name: `demircan-silaj-emails`
4. Key'i kopyala: `SG.xxxxxxxxxxxxx`

### Adım 2: Firebase Environment Variable

```bash
# PowerShell'de çalıştır (DNS fix ile)
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
firebase functions:config:set sendgrid.api_key="SG.xxxx..."
# VEYA (modern version)
firebase functions:secrets:set SENDGRID_API_KEY "SG.xxxx..."
```

### Adım 3: functions/index.js Güncelle

```javascript
// En üste ekle
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 
                         functions.config().sendgrid?.api_key;
```

### Adım 4: Re-Deploy Functions

```bash
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
firebase deploy --only functions
```

---

## ✅ Doğrulama Kontrol Listesi

```
[ ] Firestore Console'da demircan_pricing_rules/current document var mı?
[ ] CalculatorsView.jsx'de pricing Firestore'dan yükleniyor mu?
[ ] Rate limiter ContactView'e eklenmiş mi?
[ ] SendGrid API key Firebase'de set edilmiş mi?
[ ] Cloud Functions logs'unda hata yok mu?
    firebase functions:log --limit 50
```

---

## 🐛 Sorun Giderme

### "Failed to list functions" Hatası

```bash
# DNS fix ile yeniden dene
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
firebase functions:list
```

### "Pricing document not found" (Calculator)

- Firestore Console'da `demircan_pricing_rules/current` varsa kontrol et
- Browser console'da Firestore hatasını kontrol et
- F12 → Network tab → Firestore calls

### Email Gönderilmiyor

- firebase functions:log'u kontrol et
- SendGrid dashboard'da "Activity" sekmesini kontrol et
- Email adresi valid mi?

---

## 📊 Deployment Durumu

| Kategori | Durum | ETA |
|----------|-------|-----|
| Frontend Code | ✅ Ready | 0 min |
| Firestore Rules | ✅ Deployed | 0 min |
| Cloud Functions | ⚠️ Needs config | 15 min |
| Pricing Document | ⏳ Manual | 2 min |
| Rate Limiting | ⏳ Integration | 10 min |
| Email (SendGrid) | ⏳ API Key | 5 min |
| **TOTAL** | **~70% Ready** | **~32 min** |

---

## 🚀 Production Deployment

Tüm yukarıdaki adımlar tamamlandıktan sonra:

```bash
# Build
npm run build

# Deploy (firestore + hosting + functions)
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
firebase deploy

# Production URL
# https://www.demircansilaj.com.tr
```

---

## 📞 Support

- **Firebase Console:** https://console.firebase.google.com/project/finansarena-bdae9
- **SendGrid API:** https://app.sendgrid.com/settings/api_keys
- **GitHub:** https://github.com/Highlife01/demircansilaj

---

**Tarih:** 2026-07-15  
**Hazırlayan:** Demircan Silaj Admin Panel  
**Sonraki Kontrol:** Cloud Functions deployment confirm etme
