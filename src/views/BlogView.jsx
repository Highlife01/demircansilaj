import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar, User, Eye, Share2, ArrowLeft, 
  ChevronRight, Heart, Send, Leaf, MessageCircle, Loader2
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, BLOGS_COLLECTION } from '../firebase';
import { initialBlogs } from '../data/initialBlogs';

const CATEGORIES = [
  { id: 'all', label: 'Tüm Yazılar', labelEn: 'All Posts', emoji: '📚' },
  { id: 'buyukbas', label: 'Büyükbaş', labelEn: 'Beef Cattle', emoji: '🐄', value: 'Büyükbaş' },
  { id: 'kucukbas', label: 'Küçükbaş', labelEn: 'Sheep & Goat', emoji: '🐑', value: 'Küçükbaş' },
  { id: 'sigir', label: 'Sığır', labelEn: 'Cattle', emoji: '🐂', value: 'Sığır' },
  { id: 'keci', label: 'Keçi', labelEn: 'Goat', emoji: '🐐', value: 'Keçi' },
  { id: 'manda', label: 'Manda', labelEn: 'Buffalo', emoji: '🐃', value: 'Manda' },
  { id: 'silaj', label: 'Silaj', labelEn: 'Silage', emoji: '🌽', value: 'Silaj' },
  { id: 'koyun', label: 'Koyun', labelEn: 'Sheep', emoji: '🐏', value: 'Koyun' },
  { id: 'saglik', label: 'Hayvan Sağlığı', labelEn: 'Animal Health', emoji: '🩺', value: 'Hayvan Sağlığı' },
  { id: 'besicilik', label: 'Besicilik', labelEn: 'Beef Farming', emoji: '🥩', value: 'Besicilik' },
  { id: 'sut', label: 'Süt Hayvancılığı', labelEn: 'Dairy Farming', emoji: '🥛', value: 'Süt Hayvancılığı' }
];

export default function BlogView({ lang, selectedBlogSlug, setSelectedBlogSlug, navigateTo, handleNavigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [likes, setLikes] = useState({});

  // Fetch blogs from Firestore with local fallback
  useEffect(() => {
    setLoading(true);
    if (!db) {
      setBlogs(initialBlogs);
      setLoading(false);
      return;
    }
    const q = query(collection(db, BLOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setBlogs(initialBlogs);
      } else {
        const firestoreBlogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Merge firestore blogs with local initial blogs (removing duplicates by slug)
        const combined = [...firestoreBlogs];
        initialBlogs.forEach(ib => {
          if (!combined.some(cb => cb.slug === ib.slug)) {
            combined.push(ib);
          }
        });
        // Sort combined blogs by date
        combined.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setBlogs(combined);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Firestore fetch failed, falling back to static blogs:", err);
      setBlogs(initialBlogs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Increment read count when viewing detail page
  useEffect(() => {
    if (selectedBlogSlug && db && blogs.length > 0) {
      const blog = blogs.find(b => b.slug === selectedBlogSlug);
      if (blog && blog.id && !blog.id.startsWith('blog-')) {
        try {
          updateDoc(doc(db, BLOGS_COLLECTION, blog.id), {
            readCount: (blog.readCount || 0) + 1
          }).catch(() => {});
        } catch (_e) {}
      }
    }
  }, [selectedBlogSlug, blogs]);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    // Check if Firestore Timestamp
    if (dateStr.toDate) {
      return dateStr.toDate().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Filtered blogs list
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      // 1. Filter by category
      if (selectedCat !== 'all') {
        const catObj = CATEGORIES.find(c => c.id === selectedCat);
        if (catObj && blog.category !== catObj.value) return false;
      }
      // 2. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = blog.title?.toLowerCase().includes(query);
        const excerptMatch = blog.excerpt?.toLowerCase().includes(query);
        const tagsMatch = blog.tags?.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || excerptMatch || tagsMatch;
      }
      return true;
    });
  }, [blogs, selectedCat, searchQuery]);

  // Find current blog detail object
  const currentBlog = useMemo(() => {
    if (!selectedBlogSlug) return null;
    return blogs.find(b => b.slug === selectedBlogSlug);
  }, [selectedBlogSlug, blogs]);

  // Related posts (same category, max 3)
  const relatedPosts = useMemo(() => {
    if (!currentBlog) return [];
    return blogs
      .filter(b => b.slug !== currentBlog.slug && b.category === currentBlog.category)
      .slice(0, 3);
  }, [currentBlog, blogs]);

  // Calculate reading time
  const getReadingTime = (text) => {
    if (!text) return '3 Min';
    const wordsPerMinute = 200;
    const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return lang === 'tr' ? `${minutes} Dk Okuma` : `${minutes} Min Read`;
  };

  const handleLike = (slug) => {
    setLikes(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  // Injection of Schema.org metadata for SEO
  useEffect(() => {
    if (currentBlog) {
      // Remove any existing dynamic schemas
      const existingScript = document.getElementById('demircan-blog-schema');
      if (existingScript) existingScript.remove();

      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": currentBlog.title,
        "description": currentBlog.excerpt,
        "image": currentBlog.coverImage,
        "author": {
          "@type": "Organization",
          "name": "Demircan Silaj",
          "url": "https://www.demircansilaj.com.tr"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Demircan Silaj",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.demircansilaj.com.tr/media/13.jpeg"
          }
        },
        "datePublished": currentBlog.createdAt?.toDate ? currentBlog.createdAt.toDate().toISOString() : new Date(currentBlog.createdAt).toISOString()
      };

      const script = document.createElement('script');
      script.id = 'demircan-blog-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);

      // Page Title & Meta Description update
      document.title = `${currentBlog.title} | Demircan Silaj Portal`;
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', currentBlog.excerpt);
    } else {
      document.title = lang === 'tr' ? "Hayvancılık Bilgi Portal & Blog | Demircan Silaj" : "Livestock Knowledge Portal & Blog | Demircan Silage";
    }
  }, [currentBlog, lang]);

  // Social Share links
  const shareLinks = (blog) => {
    const url = window.location.origin + `/blog/${blog.slug}`;
    const text = blog.title;
    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
  };

  // Render Single Blog Detail View
  if (currentBlog) {
    const sLinks = shareLinks(currentBlog);
    return (
      <div className="pt-32 pb-24 bg-white min-h-screen text-left">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <button 
            onClick={() => {
              setSelectedBlogSlug(null);
              navigateTo('/blog');
            }}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 font-semibold mb-8 text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === 'tr' ? 'Blog Listesine Dön' : 'Back to Blog List'}
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-semibold uppercase tracking-wider">
            <button onClick={() => handleNavigation('home')} className="hover:text-green-600 cursor-pointer">{lang === 'tr' ? 'Anasayfa' : 'Home'}</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => { setSelectedBlogSlug(null); navigateTo('/blog'); }} className="hover:text-green-600 cursor-pointer">Blog</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600 truncate max-w-[200px]">{currentBlog.title}</span>
          </nav>

          {/* Category Tag */}
          <span className="inline-block px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase mb-6">
            {currentBlog.category}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
            {currentBlog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-8 mb-10">
            <div className="flex items-center gap-5 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-gray-400" /> {currentBlog.author || 'Demircan Silaj'}
              </div>
              <div className="flex items-center gap-1.5 flex-row">
                <Calendar className="h-4.5 w-4.5 text-gray-400" /> {formatDate(currentBlog.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4.5 w-4.5 text-gray-400" /> {currentBlog.readCount || 0}
              </div>
            </div>
            
            {/* Social Share & Like */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleLike(currentBlog.slug)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${likes[currentBlog.slug] ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500'}`}
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-bold text-gray-700 transition-all cursor-pointer">
                  <Share2 className="h-4 w-4" /> {lang === 'tr' ? 'Paylaş' : 'Share'}
                </button>
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex bg-gray-900 text-white rounded-xl shadow-xl p-2.5 gap-2.5 border border-white/10 z-20">
                  <a href={sLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 p-1.5 transition-colors"><MessageCircle className="h-5 w-5" /></a>
                  <a href={sLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 p-1.5 transition-colors"><Share2 className="h-5 w-5" /></a>
                  <a href={sLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 p-1.5 transition-colors"><Send className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 aspect-[21/9] mb-12 bg-gray-55">
            <img 
              src={currentBlog.coverImage} 
              alt={currentBlog.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Block */}
          <p className="text-xl text-gray-700 leading-relaxed font-semibold italic border-l-4 border-green-600 pl-6 mb-12">
            {currentBlog.excerpt}
          </p>

          {/* Rich Content */}
          <article 
            className="prose prose-green max-w-none text-gray-750 leading-relaxed space-y-6 text-base font-normal
              prose-headings:font-black prose-headings:text-gray-900 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2.5 prose-li:text-gray-750"
            dangerouslySetInnerHTML={{ __html: currentBlog.content }}
          />

          {/* Tags */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2.5">
              {currentBlog.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-24 pt-12 border-t border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8">
                {lang === 'tr' ? 'Benzer Makaleler' : 'Related Articles'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((post) => (
                  <div 
                    key={post.id}
                    onClick={() => {
                      setSelectedBlogSlug(post.slug);
                      navigateTo(`/blog/${post.slug}`);
                    }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer group text-left"
                  >
                    <div className="h-40 bg-gray-100 overflow-hidden relative">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block mb-2">{post.category}</span>
                        <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-750 transition-colors">{post.title}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-4 block font-semibold">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Blog List Grid
  return (
    <div className="pt-32 pb-24 bg-gray-55 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold tracking-wider uppercase mb-6 shadow-sm">
            <Leaf className="h-4 w-4" /> {lang === 'tr' ? 'HAYVANCILIK BİLGİ PORTALI' : 'LIVESTOCK KNOWLEDGE PORTAL'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            {lang === 'tr' ? 'Demircan Silaj Blog & Portal' : 'Demircan Silage Blog & Portal'}
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {lang === 'tr' 
              ? 'Büyükbaş, küçükbaş, manda, keçi yetiştiriciliği ve kaliteli silaj rasyonlarına dair bilimsel veriler ve besleme ipuçları.'
              : 'Scientific data, feeding advice, and tips regarding beef cattle, sheep, goats, buffaloes, and quality silage rations.'}
          </p>
        </div>

        {/* Filter Controls (Search + Categories) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                placeholder={lang === 'tr' ? 'Yazılarda veya etiketlerde ara...' : 'Search articles or tags...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm text-gray-700 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div className="text-sm font-semibold text-gray-400">
              {filteredBlogs.length} {lang === 'tr' ? 'yazı bulundu' : 'posts found'}
            </div>
          </div>

          {/* Category Tabs list */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-gray-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedCat === cat.id 
                    ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-900/30' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{lang === 'tr' ? cat.label : cat.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
            <p className="text-gray-500 font-semibold">{lang === 'tr' ? 'Yazılar yükleniyor...' : 'Loading posts...'}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-lg mb-4">🔍 {lang === 'tr' ? 'Aradığınız kriterlere uygun yazı bulunamadı.' : 'No posts matching search criteria were found.'}</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCat('all'); }}
              className="bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
            >
              {lang === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.id}
                onClick={() => {
                  setSelectedBlogSlug(blog.slug);
                  navigateTo(`/blog/${blog.slug}`);
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col group text-left"
              >
                {/* Image block */}
                <div className="h-56 bg-green-955 relative overflow-hidden">
                  <img 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gray-100 text-green-800 font-extrabold text-[10px] uppercase shadow-sm">
                    {blog.category}
                  </div>
                </div>

                {/* Content block */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(blog.createdAt)}</div>
                      <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {blog.readCount || 0}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-light">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-xs font-extrabold text-green-700 uppercase tracking-wider">
                    <span>{getReadingTime(blog.content)}</span>
                    <span className="flex items-center group-hover:translate-x-1 transition-transform">
                      {lang === 'tr' ? 'Devamını Oku' : 'Read More'} <ChevronRight className="h-4.5 w-4.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
