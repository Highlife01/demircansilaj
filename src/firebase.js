import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase projesi: finansarena-bdae9 (Demircan Silaj sitesi bu proje altında barındırılıyor)
const firebaseConfig = {
  apiKey: 'AIzaSyDPUPtTFpcYhTGk85Y8XtK-ZBLFNWqxSwk',
  authDomain: 'finansarena-bdae9.firebaseapp.com',
  projectId: 'finansarena-bdae9',
  storageBucket: 'finansarena-bdae9.firebasestorage.app',
  messagingSenderId: '894423807184',
  appId: '1:894423807184:web:0c3ab995a1b6177f4c9ad5',
  measurementId: 'G-FN4CX0Y3JB',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Proje başka uygulamalarla paylaşıldığı için koleksiyonları önekliyoruz.
export const ORDERS_COLLECTION = 'demircan_orders';
export const MESSAGES_COLLECTION = 'demircan_messages';
export const TESTIMONIALS_COLLECTION = 'demircan_testimonials';
export const COMPANIES_COLLECTION = 'demircan_companies';
export const BLOGS_COLLECTION = 'demircan_blogs';

export default app;
