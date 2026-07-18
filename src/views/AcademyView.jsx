import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle, ChevronRight, Play, FileText, ArrowRight, HelpCircle, Trophy } from 'lucide-react';

const courses = [
  {
    id: "temel-silaj",
    title: "101: Temel Silaj Yapım Esasları",
    level: "Başlangıç",
    duration: "45 Dakika",
    lessons: [
      { title: "Hasat Zamanı Belirleme ve Süt Çizgisi", desc: "Mısır koçanındaki dane olgunluğunu süt çizgisi testiyle ölçerek en besleyici hasat gününü tespit edin." },
      { title: "Biçim Boyutu ve Sıkıştırma Teknikleri", desc: "Silaj parçalama boyutunun hayvan çiğnemesine, geviş getirmesine ve sıkıştırma kolaylığına etkisi." },
      { title: "Ambalajlama ve Vakum Teknolojisi", desc: "Oksijeni sıfırlayan vakumlama yöntemleriyle 24 ay boyunca küflenme riskini engelleme yolları." }
    ],
    quiz: {
      question: "Mısır silajında en ideal hasat zamanı mısır danelerindeki hangi seviyeye göre belirlenir?",
      options: [
        "Koçan tamamen kuruduğunda",
        "Dane üzerindeki süt çizgisi yarı seviyeye (1/2) ulaştığında",
        "Mısır yaprakları tamamen sarardığında",
        "Dane ezilemeyecek kadar sertleştiğinde"
      ],
      correctIndex: 1,
      explanation: "Dane süt çizgisi 1/2 ila 2/3 seviyesindeyken hem yüksek nişasta hem de ideal nem (%32-35 kuru madde) oranı yakalanır. Bu dönem hasat için en doğru zamandır."
    }
  },
  {
    id: "rasyon-yonetimi",
    title: "201: Kaba Yem ve Rasyon Mühendisliği",
    level: "Orta Seviye",
    duration: "60 Dakika",
    lessons: [
      { title: "Kuru Madde Tüketimi ve pH Analizi", desc: "Rasyondaki nem dengesini ayarlayarak sindirilebilirliği optimize etme metotları." },
      { title: "TMR ve Kesif Yem Tasarrufu Hesaplama", desc: "Yüksek kaliteli mısır silajı kullanarak rasyondaki pahalı konsantre yem payını %30 düşürme formülleri." },
      { title: "NDF, ADF ve Protein Analizlerini Okuma", desc: "Laboratuvardan gelen laboratuvar analiz çıktılarının rasyona dökülmesi." }
    ],
    quiz: {
      question: "Silaj kalitesini gösteren ve sindirilemeyen kısımları belirten, düşük olması arzu edilen parametre hangisidir?",
      options: [
        "Ham Protein",
        "Kuru Madde",
        "ADF (Asit Deterjan Lif)",
        "Nişasta"
      ],
      correctIndex: 2,
      explanation: "ADF (Asit Deterjan Lif) sindirimi zor selüloz ve lignini temsil eder. ADF ne kadar düşükse, silajın enerji değeri ve sindirilebilirliği o kadar yüksektir."
    }
  },
  {
    id: "biyofermantasyon",
    title: "301: Biyofermantasyon & Kalite Yönetimi",
    level: "İleri Seviye",
    duration: "75 Dakika",
    lessons: [
      { title: "Laktik Asit Bakterileri ve İnokulantlar", desc: "Fermantasyon sürecini hızlandırmak ve pH'ı hızlıca düşürmek için bakteriyel aşıların kullanımı." },
      { title: "Küflenme, Kızışma ve Toksin Önleme", desc: "Yemi açtıktan sonra havayla temas sonucu oluşan aerobik bozulmalarla mücadele." },
      { title: "Laboratuvar Analizleri ve Sertifikasyon", desc: "Silaj üretim aşamalarında numune alma, kalite kontrol adımları ve tescilleme süreçleri." }
    ],
    quiz: {
      question: "Başarılı bir mısır silajı fermantasyonunda pH asitlik seviyesinin hangi aralıkta kalması istenir?",
      options: [
        "pH 5.5 - 6.5",
        "pH 4.5 - 5.0",
        "pH 3.8 - 4.1",
        "pH 2.0 - 3.0"
      ],
      correctIndex: 2,
      explanation: "pH'ın 3.8 - 4.1 aralığına inmesi asitliği sabitleyerek listeria ve klostridyum gibi istenmeyen bakterilerin gelişimini tamamen engeller."
    }
  }
];

export default function AcademyView({ t, lang }) {
  const [activeCourse, setActiveCourse] = useState(courses[0]);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [quizState, setQuizState] = useState({
    selectedAnswer: null,
    submitted: false,
    passed: false
  });
  const [completedCourses, setCompletedCourses] = useState([]);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleSelectCourse = (course) => {
    setActiveCourse(course);
    setActiveLessonIdx(0);
    setQuizState({
      selectedAnswer: null,
      submitted: false,
      passed: false
    });
    setShowCertificate(false);
  };

  const handleAnswerSelect = (idx) => {
    if (quizState.submitted) return;
    setQuizState({
      ...quizState,
      selectedAnswer: idx
    });
  };

  const handleQuizSubmit = () => {
    if (quizState.selectedAnswer === null) return;
    const isCorrect = quizState.selectedAnswer === activeCourse.quiz.correctIndex;
    setQuizState({
      ...quizState,
      submitted: true,
      passed: isCorrect
    });
    if (isCorrect) {
      if (!completedCourses.includes(activeCourse.id)) {
        setCompletedCourses([...completedCourses, activeCourse.id]);
      }
    }
  };

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#0c1220] via-green-950 to-gray-900 rounded-3xl p-8 md:p-14 text-white mb-12 shadow-xl border border-green-900/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-green-505/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-green-400/10 border border-green-400/20 text-green-300 text-xs font-semibold tracking-wide mb-6">
              <Award className="h-4 w-4 animate-bounce" />
              DEMİRCAN SİLAJ AKADEMİSİ
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Silaj Üniversitesi ve Çiftçi Eğitim Portal
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed max-w-3xl">
              Üreticilerin, veterinerlerin ve mühendislerin yem verimliliğini, fermantasyon biyolojisini ve rasyon maliyetlerini bilimsel metotlarla öğrenmesi için hazırlanan ücretsiz akademi eğitimleri.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Course Selector Sidebar (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider px-2 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Eğitim Programları</span>
                <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                  {completedCourses.length} / {courses.length} Tamamlandı
                </span>
              </h3>
              
              <div className="space-y-2">
                {courses.map(course => {
                  const isCompleted = completedCourses.includes(course.id);
                  const isSelected = activeCourse.id === course.id;

                  return (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? 'border-green-600 bg-green-50/20 text-green-800 font-bold' 
                          : 'border-transparent hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            course.level === 'Başlangıç' ? 'bg-blue-50 text-blue-700' :
                            course.level === 'Orta Seviye' ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-700'
                          }`}>
                            {course.level}
                          </span>
                          <span className="text-[10px] text-gray-400">{course.duration}</span>
                        </div>
                        <h4 className="text-sm font-semibold mt-2">{course.title}</h4>
                      </div>
                      <div className="shrink-0 ml-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600 fill-current" />
                        ) : (
                          <ChevronRight className={`h-5 w-5 text-gray-400 group-hover:translate-x-0.5 transition-transform`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certificate Display Trigger */}
            {completedCourses.length === courses.length && (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="h-5 w-5 animate-pulse" /> Sertifikamı Görüntüle
              </button>
            )}
          </div>

          {/* Right Column: Active Course Workspace (Col span 8) */}
          <div className="lg:col-span-8">
            {!showCertificate ? (
              <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm space-y-8">
                
                {/* Course Title */}
                <div className="border-b border-gray-100 pb-6">
                  <span className="text-[10px] text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    DERS İÇERİĞİ
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3">{activeCourse.title}</h2>
                </div>

                {/* Lesson Navigation and details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeCourse.lessons.map((lesson, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveLessonIdx(idx);
                        setQuizState({ ...quizState, submitted: false, selectedAnswer: null });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        activeLessonIdx === idx 
                          ? 'border-green-600 bg-green-50/10 text-green-800 shadow-sm font-semibold' 
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-gray-400 block mb-1">Ders {idx + 1}</span>
                      <span className="text-xs font-bold leading-snug block line-clamp-2">{lesson.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Lesson Content */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                  <h3 className="font-extrabold text-gray-900 text-base">
                    Ders {activeLessonIdx + 1}: {activeCourse.lessons[activeLessonIdx].title}
                  </h3>
                  <p className="text-sm text-gray-650 leading-relaxed font-light">
                    {activeCourse.lessons[activeLessonIdx].desc}
                  </p>
                  <div className="bg-[#0b1220] rounded-xl aspect-video relative flex items-center justify-center overflow-hidden shadow-inner group">
                    <img 
                      src="/media/tarla2.jpg" 
                      alt="Ders Görseli" 
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button className="z-10 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </button>
                    <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Video Anlatım Dersi İzle
                    </span>
                  </div>
                </div>

                {/* Course Quiz Block */}
                <div className="border-t border-gray-100 pt-8 space-y-6">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-900 text-base">Bölüm Sonu Sertifika Sorusu</h3>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{activeCourse.quiz.question}</p>
                    
                    <div className="space-y-2.5">
                      {activeCourse.quiz.options.map((option, idx) => {
                        const isSelected = quizState.selectedAnswer === idx;
                        let optionStyle = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
                        
                        if (isSelected) optionStyle = 'border-green-600 bg-green-50/30 text-green-800 font-semibold';
                        if (quizState.submitted) {
                          if (idx === activeCourse.quiz.correctIndex) {
                            optionStyle = 'border-green-600 bg-green-100 text-green-900 font-bold';
                          } else if (isSelected) {
                            optionStyle = 'border-red-500 bg-red-50 text-red-800 font-medium';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAnswerSelect(idx)}
                            disabled={quizState.submitted}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${optionStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {!quizState.submitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={quizState.selectedAnswer === null}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 justify-center w-full sm:w-auto"
                      >
                        Cevabı Gönder <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className={`mt-4 p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
                        quizState.passed 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        {quizState.passed ? (
                          <span>✔ Tebrikler! Doğru cevap. Bu bölümü başarıyla tamamladınız. {activeCourse.quiz.explanation}</span>
                        ) : (
                          <span>✘ Hatalı Cevap. Lütfen yukarıdaki açıklamaları tekrar inceleyip yeniden deneyin. Ders içeriğini gözden geçirebilirsiniz.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              // Certificate Visual Design
              <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-lg text-center space-y-8 animate-in zoom-in-95 duration-300">
                <div className="border-8 border-double border-yellow-500 p-8 md:p-12 space-y-8 bg-amber-50/10 rounded-2xl relative overflow-hidden">
                  {/* Decorative background vectors */}
                  <div className="absolute -left-16 -top-16 w-48 h-48 bg-yellow-500/5 rounded-full"></div>
                  <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-yellow-500/5 rounded-full"></div>

                  <div className="flex justify-center">
                    <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-serif text-gray-500 uppercase tracking-widest">Sertifika Katılım Belgesi</h2>
                    <h3 className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">DEMİRCAN SİLAJ AKADEMİSİ MEZUNU</h3>
                  </div>

                  <div className="py-4 border-t border-b border-gray-200 max-w-lg mx-auto space-y-4">
                    <p className="text-xs text-gray-500 italic">Bu belge, tüm eğitim programlarını ve başarı sınavlarını eksiksiz şekilde tamamlayan:</p>
                    <p className="text-2xl font-black text-gray-900 font-serif border-b-2 border-gray-900 w-fit mx-auto px-6 py-1">Sayın Demircan Silaj Üreticisi</p>
                    <p className="text-xs text-gray-650 leading-relaxed">
                      adına düzenlenmiş olup kendisinin <strong>Silaj Yapım Esasları, Kaba Yem ve Rasyon Mühendisliği, Biyofermantasyon ve Kalite Yönetimi</strong> konularında uzmanlık derecesini başarıyla tamamladığını onaylar.
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-6 max-w-md mx-auto">
                    <div className="text-center">
                      <p>KOD: DS-X2031-294</p>
                      <p className="font-normal mt-0.5">Doğrulama Kodu</p>
                    </div>
                    <div className="text-center">
                      <p>ONAY: AR-GE DİREKTÖRLÜĞÜ</p>
                      <p className="font-normal mt-0.5">Demircan Silaj A.Ş.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setShowCertificate(false)} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 px-6 rounded-xl cursor-pointer"
                  >
                    Eğitimlere Geri Dön
                  </button>
                  <button 
                    onClick={() => alert("Sertifika PDF indiriliyor... (Simülasyon)")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-black text-xs py-3 px-6 rounded-xl cursor-pointer shadow-md"
                  >
                    PDF Olarak İndir
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
