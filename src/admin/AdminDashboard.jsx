import React, { useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, writeBatch, addDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  LogOut, Package, MessageSquare, TrendingUp, Bell,
  Phone, MapPin, Mail, Trash2, Search, Clock, CheckCircle2,
  PhoneCall, Loader2, Inbox, User, Weight, Banknote,
  Download, CheckCheck, Filter, BellRing, StickyNote,
  Activity, Radio, Zap, Satellite, Star, Plus, X, Check,
  BookOpen, FileText, Copy, Sparkles, Globe
} from 'lucide-react';
import { auth, db, ORDERS_COLLECTION, MESSAGES_COLLECTION, TESTIMONIALS_COLLECTION, COMPANIES_COLLECTION, BLOGS_COLLECTION } from '../firebase';
import { initialBlogs } from '../data/initialBlogs';
import DashboardCharts from './DashboardCharts';
import OrderDetailModal from './OrderDetailModal';
import { playChime, showBrowserNotification, requestNotifyPermission, getNotifyPermission } from './notify';

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'new', label: 'Yeni' },
  { value: 'contacted', label: 'İletişime Geçildi' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

// Verileri CSV olarak indirir (Excel uyumlu, UTF-8 BOM ile Türkçe karakter desteği).
function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(';')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ORDER_STATUS = {
  new: { label: 'Yeni', className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  contacted: { label: 'İletişime Geçildi', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  completed: { label: 'Tamamlandı', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  cancelled: { label: 'İptal', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Göreli zaman: "az önce", "3 dk önce", "2 sa önce"...
function timeAgo(ts) {
  if (!ts?.toDate) return '';
  const diff = (Date.now() - ts.toDate().getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

function StatCard({ icon, label, value, accent, glow }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 flex items-center gap-4 ${glow}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-white leading-tight truncate tabular-nums">{value}</p>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders'); // orders, messages, testimonials, companies
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // all, 7days, 30days, thisMonth, thisYear
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifyPerm, setNotifyPerm] = useState(getNotifyPermission());
  const [now, setNow] = useState(new Date());

  // Testimonial Form State
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', company: '', rating: 5, message: '' });
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  // Company Form State
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', address: '', email: '', phone: '', contactPerson: '', silageStock: 0 });
  const [savingCompany, setSavingCompany] = useState(false);

  // Blog Management States
  const [blogs, setBlogs] = useState([]);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    category: 'Büyükbaş',
    excerpt: '',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    author: 'Demircan Silaj',
    status: 'published'
  });
  
  // Inline editing company stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState(0);
  const [savingStock, setSavingStock] = useState(false);

  const firstOrdersLoad = useRef(true);
  const firstMessagesLoad = useRef(true);

  // Canlı saat (komuta merkezi hissi + göreli zamanların tazelenmesi).
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const qOrders = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const qMessages = query(collection(db, MESSAGES_COLLECTION), orderBy('createdAt', 'desc'));
    const qTestimonials = query(collection(db, TESTIMONIALS_COLLECTION), orderBy('createdAt', 'desc'));

    const unsubOrders = onSnapshot(qOrders, (snap) => {
      // İlk yüklemeden sonra gelen yeni siparişlerde ses + bildirim.
      if (!firstOrdersLoad.current) {
        snap.docChanges().forEach((ch) => {
          if (ch.type === 'added') {
            const d = ch.doc.data();
            playChime();
            showBrowserNotification('🆕 Yeni Sipariş', `${d.name || 'Müşteri'} — ${d.quantity || ''} Ton ${d.productName || ''}`);
          }
        });
      }
      firstOrdersLoad.current = false;
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });

    const unsubMessages = onSnapshot(qMessages, (snap) => {
      if (!firstMessagesLoad.current) {
        snap.docChanges().forEach((ch) => {
          if (ch.type === 'added') {
            const d = ch.doc.data();
            playChime();
            showBrowserNotification('💬 Yeni Mesaj', `${d.name || 'Ziyaretçi'}: ${(d.message || '').slice(0, 80)}`);
          }
        });
      }
      firstMessagesLoad.current = false;
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    const unsubTestimonials = onSnapshot(qTestimonials, (snap) => {
      setTestimonials(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    const qCompanies = query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubCompanies = onSnapshot(qCompanies, (snap) => {
      setCompanies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    const qBlogs = query(collection(db, BLOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubBlogs = onSnapshot(qBlogs, (snap) => {
      if (snap.empty) {
        setBlogs(initialBlogs);
      } else {
        const dbBlogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const merged = [...dbBlogs];
        initialBlogs.forEach(ib => {
          if (!merged.some(mb => mb.slug === ib.slug)) {
            merged.push(ib);
          }
        });
        merged.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setBlogs(merged);
      }
    }, (err) => {
      console.warn("Firestore blogs fetch failed, using local fallback:", err);
      setBlogs(initialBlogs);
    });

    return () => { 
      unsubOrders(); 
      unsubMessages(); 
      unsubTestimonials(); 
      unsubCompanies(); 
      unsubBlogs(); 
    };
  }, []);

  const enableNotifications = async () => {
    const perm = await requestNotifyPermission();
    setNotifyPerm(perm);
    if (perm === 'granted') {
      playChime();
      showBrowserNotification('Bildirimler açık', 'Yeni sipariş ve mesajlarda haberdar olacaksınız.');
    }
  };

  // Filter orders by time range
  const filteredOrdersByTime = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (!d) return true;
      if (timeFilter === '7days') {
        return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      }
      if (timeFilter === '30days') {
        return (now - d) / (1000 * 60 * 60 * 24) <= 30;
      }
      if (timeFilter === 'thisMonth') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'thisYear') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, timeFilter]);

  // Filter messages by time range
  const filteredMessagesByTime = useMemo(() => {
    const now = new Date();
    return messages.filter((m) => {
      const d = m.createdAt?.toDate ? m.createdAt.toDate() : null;
      if (!d) return true;
      if (timeFilter === '7days') {
        return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      }
      if (timeFilter === '30days') {
        return (now - d) / (1000 * 60 * 60 * 24) <= 30;
      }
      if (timeFilter === 'thisMonth') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'thisYear') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [messages, timeFilter]);

  const stats = useMemo(() => {
    const newOrders = filteredOrdersByTime.filter((o) => o.status === 'new').length;
    const newMessages = filteredMessagesByTime.filter((m) => m.status === 'new').length;
    const revenue = filteredOrdersByTime
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const isToday = (ts) => ts?.toDate && ts.toDate().toDateString() === new Date().toDateString();
    const todayCount = orders.filter((o) => isToday(o.createdAt)).length + messages.filter((m) => isToday(m.createdAt)).length;
    return { newOrders, newMessages, revenue, totalOrders: filteredOrdersByTime.length, totalMessages: filteredMessagesByTime.length, todayCount };
  }, [filteredOrdersByTime, filteredMessagesByTime, orders, messages]);

  const totalSilageStock = useMemo(() => companies.reduce((sum, c) => sum + Number(c.silageStock || 0), 0), [companies]);

  // Birleşik canlı akış: sipariş + mesajlar kronolojik (en yeni önce).
  const feed = useMemo(() => {
    const o = orders.map((x) => ({ ...x, _kind: 'order' }));
    const m = messages.map((x) => ({ ...x, _kind: 'message' }));
    return [...o, ...m]
      .filter((x) => x.createdAt?.toDate)
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, 12);
  }, [orders, messages]);

  // Okunmamış toplamını tarayıcı sekmesi başlığında göster.
  useEffect(() => {
    const unread = stats.newOrders + stats.newMessages;
    document.title = unread > 0
      ? `(${unread}) Yönetim Paneli — Demircan Silaj`
      : 'Yönetim Paneli — Demircan Silaj';
    return () => { document.title = 'Demircan Silaj'; };
  }, [stats.newOrders, stats.newMessages]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filteredOrdersByTime.filter((o) => {
      if (statusFilter !== 'all' && (o.status || 'new') !== statusFilter) return false;
      if (!q) return true;
      return [o.name, o.phone, o.location, o.productName].some((f) => (f || '').toLowerCase().includes(q));
    });
  }, [filteredOrdersByTime, search, statusFilter]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredMessagesByTime;
    return filteredMessagesByTime.filter((m) =>
      [m.name, m.phone, m.email, m.message].some((f) => (f || '').toLowerCase().includes(q))
    );
  }, [filteredMessagesByTime, search]);

  const setOrderStatus = async (id, status) => {
    try { await updateDoc(doc(db, ORDERS_COLLECTION, id), { status }); }
    catch (err) { console.error(err); }
  };

  const updateOrder = async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, id), updatedFields);
      setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, ...updatedFields } : prev));
    } catch (err) { console.error(err); }
  };

  const markMessageRead = async (id) => {
    try { await updateDoc(doc(db, MESSAGES_COLLECTION, id), { status: 'read' }); }
    catch (err) { console.error(err); }
  };

  const saveOrderNote = async (id, adminNote) => {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, id), { adminNote });
      setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, adminNote } : prev));
    } catch (err) { console.error(err); }
  };

  // Testimonial actions
  const toggleTestimonialApproval = async (id, currentApproved) => {
    try {
      await updateDoc(doc(db, TESTIMONIALS_COLLECTION, id), { approved: !currentApproved });
    } catch (err) { console.error(err); }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.message) return;
    setSavingTestimonial(true);
    try {
      await addDoc(collection(db, TESTIMONIALS_COLLECTION), {
        name: newTestimonial.name,
        company: newTestimonial.company,
        rating: Number(newTestimonial.rating),
        message: newTestimonial.message,
        approved: true,
        createdAt: serverTimestamp()
      });
      setNewTestimonial({ name: '', company: '', rating: 5, message: '' });
      setShowAddTestimonial(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name) return;
    setSavingCompany(true);
    try {
      await addDoc(collection(db, COMPANIES_COLLECTION), {
        name: newCompany.name,
        address: newCompany.address || '',
        email: newCompany.email || '',
        phone: newCompany.phone || '',
        contactPerson: newCompany.contactPerson || '',
        silageStock: Number(newCompany.silageStock || 0),
        createdAt: serverTimestamp()
      });
      setNewCompany({ name: '', address: '', email: '', phone: '', contactPerson: '', silageStock: 0 });
      setShowAddCompany(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleUpdateCompanyStock = async (id, newStock) => {
    setSavingStock(true);
    try {
      await updateDoc(doc(db, COMPANIES_COLLECTION, id), {
        silageStock: Number(newStock)
      });
      setEditingStockId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStock(false);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) return;
    const slug = newBlog.slug || newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tagsArr = typeof newBlog.tags === 'string' ? newBlog.tags.split(',').map(t => t.trim()).filter(Boolean) : newBlog.tags;
    setSavingBlog(true);
    try {
      if (db) {
        await addDoc(collection(db, BLOGS_COLLECTION), {
          title: newBlog.title,
          slug,
          category: newBlog.category,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          coverImage: newBlog.coverImage,
          tags: tagsArr,
          seoTitle: newBlog.seoTitle || newBlog.title,
          seoDescription: newBlog.seoDescription || newBlog.excerpt,
          author: newBlog.author || 'Demircan Silaj',
          status: newBlog.status || 'published',
          readCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setNewBlog({
        title: '',
        slug: '',
        category: 'Büyükbaş',
        excerpt: '',
        content: '',
        coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
        tags: '',
        seoTitle: '',
        seoDescription: '',
        author: 'Demircan Silaj',
        status: 'published'
      });
      setShowAddBlog(false);
    } catch (err) {
      console.error("Firestore write failed, updating local state:", err);
      const mockId = 'blog-' + Date.now();
      const mockDoc = {
        id: mockId,
        title: newBlog.title,
        slug,
        category: newBlog.category,
        excerpt: newBlog.excerpt,
        content: newBlog.content,
        coverImage: newBlog.coverImage,
        tags: tagsArr,
        seoTitle: newBlog.seoTitle || newBlog.title,
        seoDescription: newBlog.seoDescription || newBlog.excerpt,
        author: newBlog.author || 'Demircan Silaj',
        status: newBlog.status || 'published',
        readCount: 0,
        createdAt: new Date().toISOString()
      };
      setBlogs(prev => [mockDoc, ...prev]);
      setShowAddBlog(false);
      alert("UYARI: Veritabanına yazılamadı (İzin hatası). Makale tarayıcı belleğine geçici olarak eklendi.");
    } finally {
      setSavingBlog(false);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog.title || !editingBlog.content) return;
    const slug = editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tagsArr = typeof editingBlog.tags === 'string' ? editingBlog.tags.split(',').map(t => t.trim()).filter(Boolean) : editingBlog.tags;
    setSavingBlog(true);
    try {
      if (db && editingBlog.id && !editingBlog.id.startsWith('blog-')) {
        await updateDoc(doc(db, BLOGS_COLLECTION, editingBlog.id), {
          title: editingBlog.title,
          slug,
          category: editingBlog.category,
          excerpt: editingBlog.excerpt,
          content: editingBlog.content,
          coverImage: editingBlog.coverImage,
          tags: tagsArr,
          seoTitle: editingBlog.seoTitle || editingBlog.title,
          seoDescription: editingBlog.seoDescription || editingBlog.excerpt,
          author: editingBlog.author,
          status: editingBlog.status,
          updatedAt: serverTimestamp()
        });
      } else {
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? { ...b, ...editingBlog, slug, tags: tagsArr } : b));
      }
      setEditingBlog(null);
    } catch (err) {
      console.error(err);
      setBlogs(prev => prev.map(b => b.id === editingBlog.id ? { ...b, ...editingBlog, slug, tags: tagsArr } : b));
      setEditingBlog(null);
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDuplicateBlog = async (blog) => {
    setSavingBlog(true);
    const slug = `${blog.slug}-kopya-${Math.floor(Math.random() * 1000)}`;
    // Firestore'a `id: undefined` göndermemek için önce ayırıyoruz
    const { id: _blogId, ...blogData } = blog;
    try {
      if (db && !blog.id.startsWith('blog-')) {
        await addDoc(collection(db, BLOGS_COLLECTION), {
          ...blogData,
          title: `${blog.title} (Kopya)`,
          slug,
          readCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        const mockId = 'blog-' + Date.now();
        setBlogs(prev => [{ ...blog, id: mockId, title: `${blog.title} (Kopya)`, slug, readCount: 0, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      const mockId = 'blog-' + Date.now();
      setBlogs(prev => [{ ...blog, id: mockId, title: `${blog.title} (Kopya)`, slug, readCount: 0, createdAt: new Date().toISOString() }, ...prev]);
    } finally {
      setSavingBlog(false);
    }
  };

  const handleAiGenerateBlog = async (title) => {
    if (!title) return;
    setAiGenerating(true);
    
    // Simulate AI loading delay
    await new Promise(r => setTimeout(r, 1500));
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const generatedContent = `
      <h3>${title}</h3>
      <p>Bu makale Demircan Silaj yapay zekâ sistemi tarafından otomatik olarak üretilmiştir. Hayvancılıkta verimliliği artırmak ve rasyon maliyetlerini düşürmek için bilimsel analizlere dayalı besleme yapılması gerekmektedir.</p>
      
      <h3>1. Temel Besleme Prensipleri</h3>
      <p>Büyükbaş ve küçükbaş hayvanların günlük protein, enerji ve kuru madde ihtiyaçları dengeli bir rasyonla karşılanmalıdır. Özellikle kaliteli kaba yem (mısır silajı ve yonca kuru otu) kullanımı işkembe (rumen) sağlığı ve genel döl verimliliği için elzemdir.</p>
      
      <h3>2. Rasyon Kalitesi</h3>
      <p>Doğru nem oranına sahip (%30-35 Kuru Madde) mısır silajı yüksek sindirilebilirlik sunarak günlük canlı ağırlık kazancını ve süt verimini önemli ölçüde artırır. Oksijen ile temasın kesilmesi (vakumlu balyalama) silajın aerobik stabilitesini koruyarak toksin ve küflenme riskini sıfırlar.</p>
    `;
    
    const generatedBlog = {
      title,
      slug,
      category: 'Büyükbaş',
      excerpt: `${title} hakkında yapay zekâ destekli rehber. Doğru yem rasyonu, bakım koşulları ve verim analizlerini içerir.`,
      content: generatedContent,
      coverImage: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=800&auto=format&fit=crop',
      tags: 'yapayzeka, besleme, rasyon, hayvancilik',
      seoTitle: `${title} | Demircan Silaj Bilgi Bankası`,
      seoDescription: `${title} konusunda en güncel besleme programları, modern rasyon içerikleri ve hayvancılık teknikleri.`,
      author: 'Demircan AI Yazarı',
      status: 'published'
    };
    
    setAiGenerating(false);
    return generatedBlog;
  };

  const removeDoc = async (coll, id) => {
    if (!window.confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try { await deleteDoc(doc(db, coll, id)); }
    catch (err) { console.error(err); }
  };

  const markAllMessagesRead = async () => {
    const unread = messages.filter((m) => m.status === 'new');
    if (!unread.length) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((m) => batch.update(doc(db, MESSAGES_COLLECTION, m.id), { status: 'read' }));
      await batch.commit();
    } catch (err) { console.error(err); }
  };

  const exportCurrent = () => {
    if (tab === 'orders') {
      downloadCsv('demircan-siparisler.csv', filteredOrders.map((o) => ({
        Tarih: formatDate(o.createdAt),
        Ad: o.name, Telefon: o.phone, Il_Ilce: o.location,
        Urun: o.productName || o.productType, Miktar_Ton: o.quantity,
        Birim_Fiyat: o.unitPrice, Toplam_TL: o.totalPrice,
        Durum: (ORDER_STATUS[o.status] || ORDER_STATUS.new).label, Notlar: o.notes,
      })));
    } else {
      downloadCsv('demircan-mesajlar.csv', filteredMessages.map((m) => ({
        Tarih: formatDate(m.createdAt),
        Ad: m.name, Telefon: m.phone, Eposta: m.email,
        Mesaj: m.message, Durum: m.status === 'new' ? 'Yeni' : 'Okundu',
      })));
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-200 antialiased relative overflow-x-hidden">
      {/* Uzay üssü arka planı: radyal parıltılar + ızgara */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(6,182,212,0.14),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      {/* Komuta çubuğu */}
      <header className="relative z-30 sticky top-0 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Satellite className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-none">
                DEMİRCAN <span className="text-emerald-400">SİLAJ</span>
              </span>
              <span className="text-[10px] text-cyan-300/70 font-semibold uppercase tracking-[0.2em]">Komuta Merkezi</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Canlı bağlantı + saat */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-2">
              <Radio className={`h-3.5 w-3.5 ${loading ? 'text-amber-400' : 'text-emerald-400 animate-pulse'}`} />
              <span className={loading ? 'text-amber-300' : 'text-emerald-300'}>{loading ? 'BAĞLANIYOR' : 'CANLI'}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-300 tabular-nums">{now.toLocaleTimeString('tr-TR')}</span>
            </div>

            {notifyPerm !== 'granted' && notifyPerm !== 'unsupported' && (
              <button
                onClick={enableNotifications}
                title="Yeni sipariş/mesaj bildirimlerini aç"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3.5 py-2 transition-colors"
              >
                <BellRing className="h-4 w-4" /> <span className="hidden md:inline">Bildirim</span>
              </button>
            )}
            {notifyPerm === 'granted' && (
              <span title="Bildirimler açık" className="hidden md:flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3.5 py-2">
                <BellRing className="h-4 w-4" />
              </span>
            )}
            <span className="hidden lg:flex items-center text-sm text-gray-400 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2">
              <User className="h-4 w-4 mr-2 text-gray-500" /> {user?.email}
            </span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-red-300 bg-white/[0.04] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-full px-3.5 py-2 transition-colors"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Göstergeler */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <StatCard icon={<Zap className="h-6 w-6 text-cyan-300" />} accent="bg-cyan-500/15 border border-cyan-500/20" glow="shadow-[0_0_25px_-8px_rgba(6,182,212,0.5)]" label="Bugün" value={stats.todayCount} />
          <StatCard icon={<Package className="h-6 w-6 text-emerald-300" />} accent="bg-emerald-500/15 border border-emerald-500/20" label="Toplam Sipariş" value={stats.totalOrders} />
          <StatCard icon={<Bell className="h-6 w-6 text-blue-300" />} accent="bg-blue-500/15 border border-blue-500/20" label="Yeni Sipariş" value={stats.newOrders} />
          <StatCard icon={<MessageSquare className="h-6 w-6 text-amber-300" />} accent="bg-amber-500/15 border border-amber-500/20" label="Yeni Mesaj" value={stats.newMessages} />
          <StatCard icon={<Weight className="h-6 w-6 text-yellow-300" />} accent="bg-yellow-500/15 border border-yellow-500/20" label="Stoktaki Silaj" value={`${totalSilageStock.toLocaleString('tr-TR')} Ton`} />
          <StatCard icon={<TrendingUp className="h-6 w-6 text-fuchsia-300" />} accent="bg-fuchsia-500/15 border border-fuchsia-500/20" label="Tahmini Ciro" value={`${stats.revenue.toLocaleString('tr-TR')} ₺`} />
        </div>



        {/* Sekmeler + Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-white/[0.04] border border-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'orders' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <Package className="h-4 w-4" /> Siparişler
              {stats.newOrders > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'orders' ? 'bg-black/20' : 'bg-cyan-500/20 text-cyan-300'}`}>{stats.newOrders}</span>}
            </button>
            <button
              onClick={() => setTab('messages')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'messages' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <MessageSquare className="h-4 w-4" /> Mesajlar
              {stats.newMessages > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'messages' ? 'bg-black/20' : 'bg-amber-500/20 text-amber-300'}`}>{stats.newMessages}</span>}
            </button>
            <button
              onClick={() => setTab('testimonials')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'testimonials' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <Star className="h-4 w-4" /> Yorumlar
            </button>
            <button
              onClick={() => setTab('companies')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'companies' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <User className="h-4 w-4" /> Firmalar & Stok
            </button>
            <button
              onClick={() => setTab('blog')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'blog' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <BookOpen className="h-4 w-4" /> Blog Yönetimi
            </button>
            <button
              onClick={() => setTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'analytics' ? 'bg-emerald-500 text-[#06110c] shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)]' : 'text-gray-400 hover:text-white'}`}
            >
              <TrendingUp className="h-4 w-4" /> Analizler
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Tarih Aralığı Filtresi */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium text-gray-200 cursor-pointer [&>option]:bg-[#0b1220]"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="7days">Son 7 Gün</option>
                <option value="30days">Son 30 Gün</option>
                <option value="thisMonth">Bu Ay</option>
                <option value="thisYear">Bu Yıl</option>
              </select>
            </div>

            {tab === 'orders' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium text-gray-200 cursor-pointer [&>option]:bg-[#0b1220]"
                >
                  {ORDER_STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}

            {tab === 'messages' && stats.newMessages > 0 && (
              <button
                onClick={markAllMessagesRead}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-gray-200 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <CheckCheck className="h-4 w-4 text-emerald-400" /> Tümünü okundu
              </button>
            )}

            {tab !== 'testimonials' && tab !== 'companies' && tab !== 'blog' && (
              <button
                onClick={exportCurrent}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-gray-200 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-emerald-400" /> CSV
              </button>
            )}

            {tab !== 'testimonials' && tab !== 'companies' && tab !== 'blog' && (
              <div className="relative sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ara: isim, telefon, il..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-3" /> Sinyal alınıyor...
          </div>
        ) : tab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <OrdersList orders={filteredOrders} onStatus={setOrderStatus} onDelete={(id) => removeDoc(ORDERS_COLLECTION, id)} onOpen={setSelectedOrder} />
            </div>
            <div className="lg:col-span-1">
              <LiveFeed feed={feed} onOpenOrder={setSelectedOrder} onGoMessages={() => setTab('messages')} />
            </div>
          </div>
        ) : tab === 'messages' ? (
          <MessagesList messages={filteredMessages} onRead={markMessageRead} onDelete={(id) => removeDoc(MESSAGES_COLLECTION, id)} />
        ) : tab === 'testimonials' ? (
          <TestimonialsList 
            testimonials={testimonials} 
            onToggleApproval={toggleTestimonialApproval} 
            onDelete={(id) => removeDoc(TESTIMONIALS_COLLECTION, id)}
            onAddClick={() => setShowAddTestimonial(true)} 
          />
        ) : tab === 'companies' ? (
          <CompaniesList
            companies={companies}
            onDelete={(id) => removeDoc(COMPANIES_COLLECTION, id)}
            onAddClick={() => setShowAddCompany(true)}
            editingStockId={editingStockId}
            setEditingStockId={setEditingStockId}
            editingStockVal={editingStockVal}
            setEditingStockVal={setEditingStockVal}
            onUpdateStock={handleUpdateCompanyStock}
            savingStock={savingStock}
          />
        ) : tab === 'blog' ? (
          <BlogManagementList
            blogs={blogs}
            onDelete={(id) => {
              if (id.startsWith('blog-')) {
                // local fallback mock delete
                setBlogs(prev => prev.filter(b => b.id !== id));
              } else {
                removeDoc(BLOGS_COLLECTION, id);
              }
            }}
            onAddClick={() => setShowAddBlog(true)}
            onEditClick={(blog) => setEditingBlog(blog)}
            onDuplicateClick={handleDuplicateBlog}
            savingBlog={savingBlog}
          />
        ) : (
          <div className="space-y-6">
            {orders.length > 0 ? (
              <div className="space-y-6">
                <DashboardCharts orders={orders} />
                <OrderStatsBreakdown orders={orders} />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-gray-500 text-sm py-16">
                Grafikler için henüz yeterli veri yok.
              </div>
            )}
          </div>
        )}
      </main>

      {selectedOrder && (
        <OrderDetailModal
          order={orders.find((o) => o.id === selectedOrder.id) || selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaveNote={saveOrderNote}
          onStatus={setOrderStatus}
          onUpdateOrder={updateOrder}
        />
      )}

      {/* Yeni Yorum Ekleme Modalı */}
      {showAddTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 w-full max-w-md text-left relative shadow-2xl">
            <button 
              onClick={() => setShowAddTestimonial(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="text-emerald-400 h-5 w-5" /> Yeni Müşteri Yorumu
            </h3>
            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Müşteri Adı Soyadı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Firma / Konum (Opsiyonel)</label>
                <input 
                  type="text"
                  placeholder="Örn: Yılmaz Besicilik (Konya)"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({...newTestimonial, company: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Puan (1-5 Yıldız)</label>
                <select
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0b1220]"
                >
                  <option value="5">5 Yıldız (Mükemmel)</option>
                  <option value="4">4 Yıldız (Çok İyi)</option>
                  <option value="3">3 Yıldız (Orta)</option>
                  <option value="2">2 Yıldız (Kötü)</option>
                  <option value="1">1 Yıldız (Çok Kötü)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yorum Metni</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Müşterinin yorumunu yazınız..."
                  value={newTestimonial.message}
                  onChange={(e) => setNewTestimonial({...newTestimonial, message: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddTestimonial(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={savingTestimonial}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingTestimonial ? 'Kaydediliyor...' : 'Yorumu Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Firma Ekleme Modalı */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 w-full max-w-md text-left relative shadow-2xl">
            <button 
              onClick={() => setShowAddCompany(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="text-emerald-400 h-5 w-5" /> Yeni Firma Ekle
            </h3>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Firma Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Öz Anadolu Tarım"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yetkili Kişi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Hasan Demir"
                  value={newCompany.contactPerson}
                  onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefon</label>
                <input 
                  type="tel"
                  placeholder="Örn: 0532 123 4567"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-Posta</label>
                <input 
                  type="email"
                  placeholder="Örn: info@firmamiz.com"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Adres</label>
                <textarea 
                  required
                  rows="2"
                  placeholder="Firma adresi..."
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stoktaki Silaj Miktarı (Ton)</label>
                <input 
                  type="number"
                  placeholder="Örn: 150"
                  value={newCompany.silageStock}
                  onChange={(e) => setNewCompany({...newCompany, silageStock: Number(e.target.value)})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddCompany(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={savingCompany}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingCompany ? 'Kaydediliyor...' : 'Firmayı Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Blog Ekleme Modalı */}
      {showAddBlog && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 w-full max-w-2xl text-left relative shadow-2xl my-8">
            <button 
              onClick={() => setShowAddBlog(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="text-emerald-400 h-5 w-5" /> Yeni Blog Makalesi Ekle
            </h3>
            
            {/* AI Generator Button */}
            <button
              type="button"
              disabled={aiGenerating}
              onClick={async () => {
                const titleInput = window.prompt("Yazılmasını istediğiniz başlığı girin (AI içeriği oluşturacaktır):");
                if (!titleInput) return;
                const g = await handleAiGenerateBlog(titleInput);
                if (g) {
                  setNewBlog(g);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer mb-5 shadow-lg disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${aiGenerating ? 'animate-spin' : ''}`} /> 
              {aiGenerating ? 'Yapay Zekâ İçeriği Optimize Edip Yazıyor...' : 'Yapay Zekâ (AI) ile Tek Tıkla İçerik Oluştur'}
            </button>

            <form onSubmit={handleAddBlog} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Makale Başlığı</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Sığır Yetiştiriciliğinde Rasyon Yönetimi"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                  <select
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({...newBlog, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0b1220]"
                  >
                    <option value="Büyükbaş">Büyükbaş</option>
                    <option value="Küçükbaş">Küçükbaş</option>
                    <option value="Manda">Manda</option>
                    <option value="Keçi">Keçi</option>
                    <option value="Koyun">Koyun</option>
                    <option value="Sığır">Sığır</option>
                    <option value="Silaj">Silaj</option>
                    <option value="Hayvan Sağlığı">Hayvan Sağlığı</option>
                    <option value="Besicilik">Besicilik</option>
                    <option value="Süt Hayvancılığı">Süt Hayvancılığı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">URL Slug (Otomatik Oluşur)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: sigir-yetistiriciligi-rasyon"
                    value={newBlog.slug}
                    onChange={(e) => setNewBlog({...newBlog, slug: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kapak Görseli URL</label>
                  <input 
                    type="text" 
                    value={newBlog.coverImage}
                    onChange={(e) => setNewBlog({...newBlog, coverImage: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Etiketler (Virgülle Ayırın)</label>
                <input 
                  type="text" 
                  placeholder="örneğin: simental, besleme, rasyon"
                  value={newBlog.tags}
                  onChange={(e) => setNewBlog({...newBlog, tags: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kısa Özet (Excerpt - 160 Karakter)</label>
                <textarea 
                  rows="2"
                  maxLength="200"
                  placeholder="Yazının arama sonuçlarında görünecek kısa özeti..."
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Makale İçeriği (HTML Destekler)</label>
                <textarea 
                  rows="6"
                  required
                  placeholder="<h3>Altbaşlık</h3><p>Makale metni...</p>"
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                  className="w-full px-3 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">SEO Ayarları</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">SEO Başlığı (Opsiyonel)</label>
                    <input 
                      type="text" 
                      value={newBlog.seoTitle}
                      onChange={(e) => setNewBlog({...newBlog, seoTitle: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">SEO Meta Açıklaması (Opsiyonel)</label>
                    <input 
                      type="text" 
                      value={newBlog.seoDescription}
                      onChange={(e) => setNewBlog({...newBlog, seoDescription: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yazar</label>
                  <input 
                    type="text" 
                    value={newBlog.author}
                    onChange={(e) => setNewBlog({...newBlog, author: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yayın Durumu</label>
                  <select
                    value={newBlog.status}
                    onChange={(e) => setNewBlog({...newBlog, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0b1220]"
                  >
                    <option value="published">Yayında (Published)</option>
                    <option value="draft">Taslak (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddBlog(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={savingBlog}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingBlog ? 'Kaydediliyor...' : 'Makaleyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Düzenleme Modalı */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 w-full max-w-2xl text-left relative shadow-2xl my-8">
            <button 
              onClick={() => setEditingBlog(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
              <FileText className="text-emerald-400 h-5 w-5" /> Makaleyi Düzenle
            </h3>
            
            <form onSubmit={handleUpdateBlog} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Makale Başlığı</label>
                  <input 
                    type="text" 
                    required
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({...editingBlog, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0b1220]"
                  >
                    <option value="Büyükbaş">Büyükbaş</option>
                    <option value="Küçükbaş">Küçükbaş</option>
                    <option value="Manda">Manda</option>
                    <option value="Keçi">Keçi</option>
                    <option value="Koyun">Koyun</option>
                    <option value="Sığır">Sığır</option>
                    <option value="Silaj">Silaj</option>
                    <option value="Hayvan Sağlığı">Hayvan Sağlığı</option>
                    <option value="Besicilik">Besicilik</option>
                    <option value="Süt Hayvancılığı">Süt Hayvancılığı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">URL Slug</label>
                  <input 
                    type="text" 
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({...editingBlog, slug: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kapak Görseli URL</label>
                  <input 
                    type="text" 
                    value={editingBlog.coverImage}
                    onChange={(e) => setEditingBlog({...editingBlog, coverImage: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Etiketler (Virgülle Ayırın)</label>
                <input 
                  type="text" 
                  value={Array.isArray(editingBlog.tags) ? editingBlog.tags.join(', ') : editingBlog.tags}
                  onChange={(e) => setEditingBlog({...editingBlog, tags: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kısa Özet (Excerpt - 160 Karakter)</label>
                <textarea 
                  rows="2"
                  maxLength="200"
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Makale İçeriği (HTML Destekler)</label>
                <textarea 
                  rows="6"
                  required
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                  className="w-full px-3 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">SEO Ayarları</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">SEO Başlığı</label>
                    <input 
                      type="text" 
                      value={editingBlog.seoTitle}
                      onChange={(e) => setEditingBlog({...editingBlog, seoTitle: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">SEO Meta Açıklaması</label>
                    <input 
                      type="text" 
                      value={editingBlog.seoDescription}
                      onChange={(e) => setEditingBlog({...editingBlog, seoDescription: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yazar</label>
                  <input 
                    type="text" 
                    value={editingBlog.author}
                    onChange={(e) => setEditingBlog({...editingBlog, author: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yayın Durumu</label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog({...editingBlog, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0b1220]"
                  >
                    <option value="published">Yayında (Published)</option>
                    <option value="draft">Taslak (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={savingBlog}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingBlog ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Birleşik canlı akış paneli — sipariş + iletişim mesajları gerçek zamanlı.
function LiveFeed({ feed, onOpenOrder, onGoMessages }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="font-bold text-white text-sm tracking-wide">CANLI AKIŞ</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> REALTIME
        </span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-white/5">
        {feed.length === 0 && (
          <div className="py-16 text-center text-gray-500 text-sm">Akış bekleniyor…</div>
        )}
        {feed.map((item) => {
          const isOrder = item._kind === 'order';
          const isNew = item.status === 'new';
          return (
            <button
              key={item._kind + item.id}
              onClick={() => (isOrder ? onOpenOrder(item) : onGoMessages())}
              className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-white/[0.04] transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isOrder ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                {isOrder ? <Package className="h-4.5 w-4.5" /> : <MessageSquare className="h-4.5 w-4.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{item.name || (isOrder ? 'Sipariş' : 'Mesaj')}</span>
                  {isNew && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {isOrder
                    ? `${item.quantity || ''} Ton · ${item.productName || item.productType || ''}`
                    : (item.message || '').slice(0, 60)}
                </p>
              </div>
              <span className="text-[10px] text-gray-500 font-mono shrink-0 mt-0.5">{timeAgo(item.createdAt)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 flex flex-col items-center justify-center text-gray-500">
      {icon}
      <p className="mt-4 text-sm font-medium">{text}</p>
    </div>
  );
}

function OrdersList({ orders, onStatus, onDelete, onOpen }) {
  if (orders.length === 0) return <EmptyState icon={<Inbox className="h-10 w-10" />} text="Henüz sipariş bulunmuyor." />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {orders.map((o) => {
        const st = ORDER_STATUS[o.status] || ORDER_STATUS.new;
        return (
          <div key={o.id} className={`rounded-2xl border bg-white/[0.03] backdrop-blur-xl p-5 transition-colors ${o.status === 'new' ? 'border-cyan-500/30 shadow-[0_0_24px_-10px_rgba(6,182,212,0.6)]' : 'border-white/10'}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <button onClick={() => onOpen(o)} className="flex items-center gap-3 min-w-0 text-left group">
                <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate group-hover:text-emerald-300 transition-colors">{o.name || 'İsimsiz'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(o.createdAt)}</p>
                </div>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                {o.adminNote && <StickyNote className="h-4 w-4 text-amber-400" title="İç not var" />}
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.className}`}>{st.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-gray-300 hover:text-emerald-300 min-w-0">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" /> <span className="truncate">{o.phone || '—'}</span>
              </a>
              <div className="flex items-center gap-2 text-gray-300 min-w-0">
                <MapPin className="h-4 w-4 text-gray-500 shrink-0" /> <span className="truncate">{o.location || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 min-w-0 col-span-2">
                <Package className="h-4 w-4 text-gray-500 shrink-0" /> <span className="truncate">{o.productName || o.productType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Weight className="h-4 w-4 text-gray-500 shrink-0" /> {o.quantity} Ton
              </div>
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Banknote className="h-4 w-4 text-emerald-400 shrink-0" /> {(o.totalPrice || 0).toLocaleString('tr-TR')} ₺
              </div>
            </div>

            {o.notes && (
              <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 mb-4 leading-relaxed">
                {o.notes}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <button onClick={() => onStatus(o.id, 'contacted')} title="İletişime geçildi" className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"><PhoneCall className="h-4 w-4" /></button>
                <button onClick={() => onStatus(o.id, 'completed')} title="Tamamlandı" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                <a href={`https://wa.me/${(o.phone || '').replace(/\D/g, '').replace(/^0/, '90')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"><MessageSquare className="h-4 w-4" /></a>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onOpen(o)} className="text-xs font-semibold text-gray-300 hover:text-emerald-300 bg-white/[0.04] hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-colors">Detay</button>
                <button onClick={() => onDelete(o.id)} title="Sil" className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessagesList({ messages, onRead, onDelete }) {
  if (messages.length === 0) return <EmptyState icon={<Inbox className="h-10 w-10" />} text="Henüz mesaj bulunmuyor." />;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`rounded-2xl border bg-white/[0.03] backdrop-blur-xl p-5 ${m.status === 'new' ? 'border-amber-500/30 shadow-[0_0_24px_-10px_rgba(245,158,11,0.6)]' : 'border-white/10'}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate flex items-center gap-2">
                  {m.name || 'İsimsiz'}
                  {m.status === 'new' && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">YENİ</span>}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(m.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {m.status === 'new' && (
                <button onClick={() => onRead(m.id)} title="Okundu işaretle" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
              )}
              <button onClick={() => onDelete(m.id)} title="Sil" className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{m.message}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm pt-3 border-t border-white/5">
            {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-300"><Phone className="h-4 w-4 text-gray-500" /> {m.phone}</a>}
            {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-300"><Mail className="h-4 w-4 text-gray-500" /> {m.email}</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsList({ testimonials, onToggleApproval, onDelete, onAddClick }) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" /> Müşteri Yorumları ({testimonials.length})
        </h3>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Yeni Yorum Ekle
        </button>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState icon={<Star className="h-10 w-10 text-gray-605" />} text="Henüz yorum bulunmuyor." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`rounded-2xl border bg-white/[0.03] p-5 flex flex-col justify-between transition-colors ${t.approved ? 'border-white/10' : 'border-dashed border-white/20'}`}>
              <div>
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.name || 'İsimsiz'}</h4>
                    <p className="text-xs text-gray-500">{t.company || 'Referans / Firma'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300 italic leading-relaxed mb-6">"{t.message}"</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <button 
                  onClick={() => onToggleApproval(t.id, t.approved)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${t.approved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}
                >
                  {t.approved ? 'Yayında (Aktif)' : 'Taslak (Gizli)'}
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  title="Sil" 
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompaniesList({
  companies, onDelete, onAddClick,
  editingStockId, setEditingStockId,
  editingStockVal, setEditingStockVal,
  onUpdateStock, savingStock
}) {
  const [compSearch, setCompSearch] = useState('');

  const totalStock = useMemo(() => companies.reduce((acc, curr) => acc + (curr.silageStock || 0), 0), [companies]);

  const filtered = useMemo(() => {
    return companies.filter(c => 
      c.name?.toLowerCase().includes(compSearch.toLowerCase()) || 
      c.contactPerson?.toLowerCase().includes(compSearch.toLowerCase())
    );
  }, [companies, compSearch]);

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-450" /> Firmalar & Silaj Stoğu ({companies.length})
        </h3>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Yeni Firma Ekle
        </button>
      </div>

      {/* Stok Dağılım Grafiği */}
      {companies.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-400" /> Firma Stok Dağılım Oranları
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(c => {
              const ratio = totalStock > 0 ? ((c.silageStock || 0) / totalStock) * 100 : 0;
              return (
                <div key={c.id} className="space-y-1 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300 truncate max-w-[150px]">{c.name}</span>
                    <span className="font-bold text-yellow-400">
                      {c.silageStock || 0} Ton <span className="text-[10px] text-gray-500 font-normal">({ratio.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={compSearch}
            onChange={(e) => setCompSearch(e.target.value)}
            placeholder="Firma adı veya yetkili kişi ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
      )}

      {companies.length === 0 ? (
        <EmptyState icon={<User className="h-10 w-10 text-gray-600" />} text="Henüz eklenmiş firma bulunmuyor." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search className="h-10 w-10 text-gray-600" />} text="Aramanızla eşleşen firma bulunamadı." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const isEditing = editingStockId === c.id;
            return (
              <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col justify-between hover:bg-white/[0.05] transition-all">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                      <h4 className="font-extrabold text-white text-base truncate">{c.name}</h4>
                      {c.contactPerson && (
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">Yetkili: {c.contactPerson}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => onDelete(c.id)}
                      title="Firmayı Sil" 
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-300 border-t border-white/5 pt-3.5 pb-4">
                    {c.phone && (
                      <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-500 shrink-0" /> <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></p>
                    )}
                    {c.email && (
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-500 shrink-0" /> <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></p>
                    )}
                    {c.address && (
                      <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{c.address}</span></p>
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between mt-2">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Silaj Stoğu</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          value={editingStockVal}
                          onChange={(e) => setEditingStockVal(Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded bg-black/40 border border-white/20 text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => onUpdateStock(c.id, editingStockVal)}
                          disabled={savingStock}
                          className="p-1.5 rounded bg-emerald-500 text-black hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStockId(null)}
                          className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-base font-extrabold text-yellow-400 block mt-0.5">
                        {(c.silageStock || 0).toLocaleString('tr-TR')} Ton
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingStockId(c.id);
                        setEditingStockVal(c.silageStock || 0);
                      }}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-350 hover:bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Stok Güncelle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderStatsBreakdown({ orders }) {
  const breakdown = useMemo(() => {
    const counts = { new: 0, contacted: 0, completed: 0, cancelled: 0 };
    orders.forEach(o => {
      const s = o.status || 'new';
      if (s in counts) counts[s]++;
    });
    const total = orders.length || 1;
    return Object.entries(counts).map(([status, val]) => {
      const label = status === 'new' ? 'Yeni' : status === 'contacted' ? 'Görüşüldü' : status === 'completed' ? 'Tamamlandı' : 'İptal';
      const color = status === 'new' ? 'bg-cyan-500' : status === 'contacted' ? 'bg-amber-500' : status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500';
      const textColor = status === 'new' ? 'text-cyan-400' : status === 'contacted' ? 'text-amber-400' : status === 'completed' ? 'text-emerald-400' : 'text-rose-400';
      return {
        status,
        label,
        count: val,
        pct: Math.round((val / total) * 100),
        color,
        textColor
      };
    });
  }, [orders]);

  const totalTons = useMemo(() => orders.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0), [orders]);
  const avgTons = useMemo(() => orders.length ? Math.round(totalTons / orders.length) : 0, [orders, totalTons]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Metrik Kartı 1: Toplam Tonaj */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Toplam Talep Hacmi</span>
        <div className="my-4">
          <span className="text-3xl font-black text-white">{totalTons.toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 ml-1.5">Ton Mısır Silajı</span>
        </div>
        <span className="text-[10px] text-gray-500 block">Tüm kayıtlı sipariş taleplerinin toplamı</span>
      </div>

      {/* Metrik Kartı 2: Ortalama Sipariş Boyutu */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ortalama Sipariş Hacmi</span>
        <div className="my-4">
          <span className="text-3xl font-black text-white">{avgTons}</span>
          <span className="text-xs text-gray-500 ml-1.5">Ton / Sipariş</span>
        </div>
        <span className="text-[10px] text-gray-500 block">Sipariş başına ortalama talep tonajı</span>
      </div>

      {/* Metrik Kartı 3: Durum Dağılımları */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-4">Sipariş Durum Dağılımları</span>
        <div className="space-y-3">
          {breakdown.map(item => (
            <div key={item.status} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">{item.label}</span>
                <span className={`font-bold ${item.textColor}`}>{item.count} Adet (%{item.pct})</span>
              </div>
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogManagementList({ blogs, onDelete, onAddClick, onEditClick, onDuplicateClick, savingBlog }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = useMemo(() => {
    return blogs.filter(b => 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);

  return (
    <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Blog Makale Yönetimi</h3>
          <p className="text-xs text-gray-400">Hayvancılık bilgi portalı içeriklerini yayınlayın, güncelleyin veya silin.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Makalelerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500 w-48"
          />
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Yeni Yazı Ekle
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Kapak</th>
              <th className="py-3 px-4">Makale Başlığı</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Yayın Tarihi</th>
              <th className="py-3 px-4">Durum</th>
              <th className="py-3 px-4 text-center">Görüntülenme</th>
              <th className="py-3 px-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filtered.map(blog => (
              <tr key={blog.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <img src={blog.coverImage} alt="" className="w-12 h-8 object-cover rounded-lg border border-white/10 bg-gray-900" />
                </td>
                <td className="py-3 px-4 font-bold text-white max-w-xs truncate" title={blog.title}>
                  {blog.title}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-semibold text-[10px]">
                    {blog.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {blog.createdAt
                    ? (blog.createdAt?.toDate
                        ? blog.createdAt.toDate().toLocaleDateString('tr-TR')
                        : (isNaN(new Date(blog.createdAt)) ? '—' : new Date(blog.createdAt).toLocaleDateString('tr-TR')))
                    : '—'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                    blog.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {blog.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-cyan-400 tabular-nums">
                  {blog.readCount || 0}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a 
                      href={`/blog/${blog.slug}`} 
                      className="p-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 transition-colors"
                      title="Sitede Görüntüle"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/blog/${blog.slug}`, '_blank');
                      }}
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                    <button 
                      onClick={() => onEditClick(blog)}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Düzenle"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => onDuplicateClick(blog)}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                      title="Kopyala"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => onDelete(blog.id)}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500 font-semibold">
                  Aramanıza uygun blog makalesi bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
