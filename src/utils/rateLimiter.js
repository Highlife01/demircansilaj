/**
 * DEMIRCAN SİLAJ — Rate Limiting & Security Helpers
 * 
 * Form submission'da DDoS ve spam'dan koruma
 */

// Client-side rate limiting helper
export const createRateLimiter = (maxRequests = 5, windowMs = 60000) => {
  const store = new Map();

  return {
    isAllowed: (identifier) => {
      const now = Date.now();
      const userKey = `${identifier}`;

      if (!store.has(userKey)) {
        store.set(userKey, { count: 1, resetTime: now + windowMs });
        return true;
      }

      const userData = store.get(userKey);

      if (now > userData.resetTime) {
        store.set(userKey, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (userData.count < maxRequests) {
        userData.count++;
        return true;
      }

      return false;
    },
    getRemainingTime: (identifier) => {
      const userKey = `${identifier}`;
      const userData = store.get(userKey);
      if (!userData) return 0;
      return Math.max(0, userData.resetTime - Date.now());
    }
  };
};

// Form-specific rate limiter (5 submission per minute per IP hash)
export const orderFormRateLimiter = createRateLimiter(5, 60000);
export const contactFormRateLimiter = createRateLimiter(5, 60000);

// Get user identifier (IP hash or session ID — client-side)
export const getUserIdentifier = async () => {
  try {
    // Try to get IP from public API (optional, for better accuracy)
    const response = await fetch('https://api.ipify.org?format=json', { 
      cache: 'force-cache',
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) throw new Error('IP fetch failed');
    const data = await response.json();
    return `ip_${data.ip}`;
  } catch (error) {
    // Fallback to session-based identifier
    if (!sessionStorage.getItem('_sessionId')) {
      sessionStorage.setItem('_sessionId', `sess_${Math.random().toString(36).substr(2, 9)}`);
    }
    return sessionStorage.getItem('_sessionId');
  }
};

// Form submit wrapper with rate limiting
export const submitFormWithRateLimit = async (
  limiter,
  onSubmit,
  onRateLimited
) => {
  const identifier = await getUserIdentifier();

  if (!limiter.isAllowed(identifier)) {
    const remainingMs = limiter.getRemainingTime(identifier);
    const seconds = Math.ceil(remainingMs / 1000);
    onRateLimited?.(seconds);
    return false;
  }

  try {
    await onSubmit();
    return true;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
};

/**
 * KULLANIM ÖRNEĞİ:
 * 
 * // ContactView.jsx içinde
 * import { contactFormRateLimiter, submitFormWithRateLimit, getUserIdentifier } from '../utils/rateLimiter';
 * 
 * const handleContactSubmit = async (e) => {
 *   e.preventDefault();
 *   
 *   submitFormWithRateLimit(
 *     contactFormRateLimiter,
 *     async () => {
 *       // Gerçek form submission
 *       await addDoc(collection(db, MESSAGES_COLLECTION), {
 *         name: formData.name,
 *         email: formData.email,
 *         message: formData.message,
 *         status: 'new',
 *         createdAt: serverTimestamp(),
 *         userAgent: navigator.userAgent
 *       });
 *     },
 *     (seconds) => {
 *       alert(`Çok hızlı. Lütfen ${seconds} saniye bekleyin.`);
 *     }
 *   );
 * };
 */

/**
 * SERVER-SIDE RATE LIMITING (Cloud Functions)
 * 
 * Firestore rules + Cloud Function validation:
 * 
 * // firestore.rules
 * match /demircan_orders/{orderId} {
 *   allow create: if request.resource.data.name is string
 *     && request.resource.data.name.size() > 0
 *     && request.resource.data.phone is string
 *     && request.resource.data.quantity is number
 *     && request.resource.data.status == 'new'
 *     && hasValidTimestamp();
 * }
 * 
 * function hasValidTimestamp() {
 *   // Sadece son 10 saniye içindeki timestamp'lerı kabul et
 *   return request.time.toMillis() - request.resource.data.timestamp.toMillis() < 10000;
 * }
 * 
 * // Cloud Function ile spam detection
 * exports.validateOrderSubmission = functions.firestore
 *   .document('demircan_orders/{orderId}')
 *   .onCreate(async (snap, context) => {
 *     const order = snap.data();
 *     
 *     // Check: same phone number, multiple submissions in 60 seconds
 *     const recentOrders = await admin.firestore()
 *       .collection('demircan_orders')
 *       .where('phone', '==', order.phone)
 *       .where('createdAt', '>', admin.firestore.Timestamp.now().toDate() - 60000)
 *       .get();
 *     
 *     if (recentOrders.size > 3) {
 *       // Possible spam — update status to 'spam_flagged'
 *       await snap.ref.update({ status: 'spam_flagged', reason: 'Multiple submissions detected' });
 *     }
 *   });
 */
