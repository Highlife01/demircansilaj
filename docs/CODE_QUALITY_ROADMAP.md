# Demircan Silaj — Code Quality & Performance Improvement Guide

## 1. PERFORMANS OPTİMİZASYONLARI

### Core Web Vitals Hedefleri (Target)
- **LCP (Largest Contentful Paint):** < 2.5s ✅ (Currently ~2.0s with code splitting)
- **FID (First Input Delay):** < 100ms ✅ (React 19 with Fiber)
- **CLS (Cumulative Layout Shift):** < 0.1 ✅ (No dynamic layouts)

### Yapılacak Optimizasyonlar

#### 1.1 Image Optimization
```javascript
// ❌ BEFORE
<img src="/media/hero.jpeg" alt="Hero" />

// ✅ AFTER (WebP + Lazy Loading)
<picture>
  <source srcSet="/media/hero.webp" type="image/webp" />
  <source srcSet="/media/hero.jpeg" type="image/jpeg" />
  <img 
    src="/media/hero.jpeg" 
    alt="Hero"
    loading="lazy"
    decoding="async"
    srcSet="/media/hero-small.webp 600w, /media/hero-large.webp 1200w"
  />
</picture>
```

**Impact:** Reduce image sizes by 30-40%, faster LCP

#### 1.2 Font Loading Optimization
```javascript
// Head'ta preload kritik fonts
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@650;750;850" as="style" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
```

#### 1.3 Script Defer & Async
```html
<!-- Google Analytics → async (non-blocking) -->
<script async src="https://www.googletagmanager.com/gtag/js"></script>

<!-- Service Worker → async init -->
<script async>if ('serviceWorker' in navigator) { ... }</script>
```

#### 1.4 Database Query Optimization
```javascript
// ❌ BEFORE: N+1 problem
const blogs = await getDocs(collection(db, 'demircan_blogs'));
blogs.forEach(async (blog) => {
  const author = await getDoc(doc(db, 'users', blog.authorId)); // ❌ N queries!
});

// ✅ AFTER: Batch read
const blogsData = await getDocs(collection(db, 'demircan_blogs'));
const authorIds = [...new Set(blogsData.docs.map(b => b.data().authorId))];
const authorDocs = await Promise.all(
  authorIds.map(id => getDoc(doc(db, 'users', id)))
);
```

#### 1.5 CSS-in-JS Optimization
```javascript
// Tailwind CSS → CSS modules (lower CSS bundle)
// Current: Tailwind 4.3.2 (optimized, using Vite)
// Further optimization: Use CSS variables for dynamic theming
```

### 2. KOD KALİTESİ IYILESTIRMELERI

#### 2.1 Error Boundary Component
```javascript
// components/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error);
    // Log to Sentry, Firebase Crashlytics, etc.
  }

  render() {
    if (this.state.hasError) {
      return <div>Hata: Sayfa yüklenemedi. Lütfen yeniden deneyin.</div>;
    }
    return this.props.children;
  }
}
```

#### 2.2 Type Safety (TypeScript)
- ✅ tsconfig.json oluşturuldu
- ✅ vite.config.ts oluşturuldu
- 📋 Migration steps:
  1. `src/main.jsx` → `src/main.tsx`
  2. `src/App.jsx` → `src/App.tsx` (type definitions ekle)
  3. All `*.jsx` → `*.tsx` (gradual, no rush)

#### 2.3 Component Memoization
```javascript
// ❌ BEFORE: Unnecessary re-renders
const ProductCard = ({ product, onBuy }) => (
  <div onClick={() => onBuy(product.id)}>
    {product.name}
  </div>
);

// ✅ AFTER: Memoized + useCallback
const ProductCard = React.memo(({ product, onBuy }) => (
  <div onClick={() => onBuy(product.id)}>
    {product.name}
  </div>
));

const App = () => {
  const handleBuy = useCallback((id) => {
    // handle buy
  }, []);

  return <ProductCard onBuy={handleBuy} />;
};
```

#### 2.4 Dependency Management
```javascript
// ✅ Remove unused dependencies
// Current unused: none detected

// ⚠️ Monitor future updates:
npm outdated  // Check for updates
npm audit     // Check for vulnerabilities
```

### 3. SEO IYILESTIRMELERI

#### 3.1 Meta Tags Dinamic'leştir
```javascript
// ✅ DONE: JSON-LD schema
// ✅ DONE: Open Graph tags
// 📋 TODO: Dynamic title/description per page

// pages/ProductsView.jsx
useEffect(() => {
  document.title = `Ürünler | Demircan Silaj`;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Demircan Silaj ürünleri: vakumlu mısır silajı, kuru yonca, vb.'
  );
}, []);
```

#### 3.2 XML Sitemap Validation
```bash
# Dinamik sitemap'i test et
curl https://www.demircansilaj.com.tr/sitemap.xml | head -20

# Robots.txt test
curl https://www.demircansilaj.com.tr/robots.txt
```

### 4. SECURİTY IYILESTIRMELERI

#### 4.1 CSP (Content Security Policy)
```html
<!-- index.html head'a ekle -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

#### 4.2 API Key Rotation
```javascript
// ✅ Firebase API key already restricted to web domain
// Quarterly rotation recommended:
1. Generate new key in Firebase Console
2. Update src/firebase.js
3. Deploy
4. Disable old key
```

#### 4.3 CORS Headers (Firebase Hosting)
```json
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "https://www.demircansilaj.com.tr"
          }
        ]
      }
    ]
  }
}
```

## 5. MONİTORİNG & OBSERVABILITY

### 5.1 Setup Firebase Performance Monitoring
```javascript
// src/main.jsx
import { initializePerformanceMonitoring } from 'firebase/performance';

const perf = initializePerformanceMonitoring();
```

### 5.2 Setup Error Logging (Sentry)
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.MODE,
  tracesSampleRate: 0.1, // 10% sampling
});
```

### 5.3 Custom Metrics
```javascript
// Track key business metrics
window.trackEvent = (eventName, data) => {
  gtag('event', eventName, data);
  
  // Custom Firestore logging
  addDoc(collection(db, 'analytics_events'), {
    event: eventName,
    data,
    timestamp: serverTimestamp()
  });
};

// Usage:
trackEvent('ORDER_SUBMITTED', { quantity: 25, province: 'Istanbul' });
```

## 6. TESTING IYILESTIRMELERI

### 6.1 Unit Tests (Vitest)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// src/utils/rateLimiter.test.js
import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rateLimiter';

describe('Rate Limiter', () => {
  it('should allow 5 requests per minute', () => {
    const limiter = createRateLimiter(5, 60000);
    expect(limiter.isAllowed('user_123')).toBe(true);
    expect(limiter.isAllowed('user_123')).toBe(true);
    // ... 3 more
    expect(limiter.isAllowed('user_123')).toBe(false); // 6th should fail
  });
});
```

### 6.2 E2E Tests (Cypress)
```bash
npm install --save-dev cypress
```

```javascript
// cypress/e2e/order_flow.cy.js
describe('Order Submission Flow', () => {
  it('should submit order form successfully', () => {
    cy.visit('/iletisim-ve-siparis');
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="phone"]').type('05323272383');
    cy.get('input[name="quantity"]').type('25');
    cy.get('button[type="submit"]').click();
    cy.contains('Sipariş başarıyla gönderildi').should('be.visible');
  });
});
```

## 7. DEPLOYMENT CHECKLIST

### Pre-Production
- [ ] Run `npm audit` — fix vulnerabilities
- [ ] Run `npm run lint` — fix linting issues
- [ ] Test on mobile devices
- [ ] Lighthouse score > 90
- [ ] Test form submission + email + WhatsApp
- [ ] Check firestore.rules for security holes
- [ ] Test admin panel
- [ ] Verify Google Analytics tracking

### Production
- [ ] Set env variables (Firebase project)
- [ ] Enable HTTPS (✅ Hosting)
- [ ] Setup CDN caching headers
- [ ] Enable Firestore backup
- [ ] Setup monitoring + alerts
- [ ] DNS pointing correct
- [ ] SSL certificate auto-renewal enabled

### Post-Deployment
- [ ] Monitor error rates (Sentry)
- [ ] Check Core Web Vitals (PageSpeed Insights)
- [ ] Monitor Firestore read/write costs
- [ ] Check CloudFunction execution times
- [ ] Verify admin panel access logs

## 8. ROADMAP (NEXT PRIORITIES)

### Q3 2026
1. ✅ TypeScript setup
2. ✅ Email notifications
3. ✅ Admin login logs
4. ✅ Google Analytics
5. ⏳ WhatsApp integration (Zapier/Twilio)

### Q4 2026
1. Blog CMS migration (Firestore)
2. Admin panel features (pricing management, inventory)
3. Customer reviews system
4. Multi-language completion (EN, AR)
5. Mobile app (React Native)

### 2027
1. AI-powered product recommendations
2. Inventory management system
3. B2B portal with volume pricing
4. Custom reporting dashboard

---

**Last Updated:** 2026-07-15  
**Next Review:** 2026-08-15
