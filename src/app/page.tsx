'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Video,
  Shield,
  Star,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Stethoscope,
  Globe,
  Sparkles,
  Zap,
  Users,
  Award,
  Activity,
  Target,
  Lightbulb,
  Menu,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';
import { HeroIntroVideo } from '@/components/HeroIntroVideo';

const features = [
  { icon: Video, key: 'video', color: 'primary' },
  { icon: Calendar, key: 'scheduling', color: 'secondary' },
  { icon: Shield, key: 'security', color: 'purple' },
  { icon: MessageCircle, key: 'followup', color: 'pink' },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'လူနာများ' },
  { icon: Award, value: '15+', label: 'နှစ်အတွေ့အကြုံ' },
  { icon: Star, value: '5.0', label: 'သုံးသပ်ချက်' },
  { icon: Activity, value: '24/7', label: 'ဝန်ဆောင်မှု' },
];

const reviews = [
  { name: 'ဦးအောင်', rating: 5, comment: 'ဒေါက်တာထွန်းမြတ်ဝင်းက ကျွန်တော့်ရောဂါကို စိတ်ရှည်စွာ နားထောင်ပြီး ကောင်းမွန်တဲ့ ကုသမှုပေးပါသည်။ အလွန်ကျေးဇူးတင်ပါတယ်။' },
  { name: 'ဦးကျော်', rating: 5, comment: 'အွန်လိုင်းဆွေးနွေးခြင်းက အရမ်းသက်သာပြီး အရမ်းလွယ်ကူပါတယ်။ ညွှန်းပါတယ်။' },
  { name: 'ဦးမင်း', rating: 5, comment: 'ပညာရှင်ဆရာဝန်တစ်ယောက်ဖြစ်တဲ့အတွက် ယုံကြည်လို့ရပါတယ်။ အကြံဉာဏ်တွေကလည်း အရမ်းအသုံးဝင်ပါတယ်။' },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: '#about', label: t.nav.about },
    { href: '#how-it-works', label: t.nav.services },
    { href: '#reviews', label: t.nav.reviews },
    { href: '#contact', label: t.nav.contact },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookConsultation = () => {
    if (isAuthenticated) {
      router.push('/booking');
    } else {
      setShowAuthModal(true);
    }
  };

  if (!mounted) return null;

  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 drtun-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 min-h-16 md:min-h-20 py-2 md:py-0">
            <a href="#" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </div>
              <span className="text-sm sm:text-xl font-bold text-slate-100 truncate max-w-[7.5rem] min-[400px]:max-w-[10rem] sm:max-w-none">
                ဒေါက်တာထွန်းမြတ်ဝင်း
              </span>
            </a>

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className="btn-link btn-link--icon"
                aria-label={language === 'en' ? 'Switch to Myanmar' : 'Switch to English'}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
              </button>

              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary btn-primary--compact whitespace-nowrap">
                  {t.nav.dashboard}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="nav-link hidden md:inline-flex">
                    {t.nav.login}
                  </Link>
                  <button
                    type="button"
                    onClick={handleBookConsultation}
                    className="btn-primary btn-primary--compact flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="hidden min-[400px]:inline">{t.hero.bookAppointment}</span>
                    <span className="min-[400px]:hidden">ချိန်း</span>
                  </button>
                </>
              )}

              <button
                type="button"
                className="md:hidden mobile-menu-toggle"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mobile-nav-panel pb-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                  <Link href="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    {t.nav.login}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      handleBookConsultation();
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {t.hero.bookAppointment}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="hero__bg-orbs" aria-hidden>
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 animate-fade-in min-w-0">
              <div className="badge-gold mb-5 md:mb-8 text-xs sm:text-sm">
                <Zap className="w-4 h-4 shrink-0" />
                {t.hero.onlineConsultation}
              </div>
              <h1 className="myanmar-heading text-[1.625rem] leading-snug sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100">
                {t.hero.title}
              </h1>
              <h2 className="myanmar-heading text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold hero-title-gradient mt-2 leading-snug">
                {t.hero.subtitle}
              </h2>
              <p className="myanmar-text mt-4 md:mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                {t.hero.description}
              </p>
              <div className="mt-6 md:mt-10">
                <button onClick={handleBookConsultation} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Calendar className="w-5 h-5" />
                  {t.hero.bookAppointment}
                </button>
              </div>
              <div className="mt-8 md:mt-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex -space-x-2 sm:-space-x-3 shrink-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-sky-300 border-2 sm:border-[3px] border-white flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg ${i > 4 ? 'hidden min-[400px]:flex' : i > 3 ? 'hidden min-[360px]:flex' : ''}`}
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm font-medium">{t.hero.rating}</span>
                  </div>
                </div>
                <div className="hidden sm:block h-12 w-px bg-slate-700 shrink-0" />
                <div className="flex items-center gap-2 text-slate-400 text-sm sm:text-base">
                  <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-medium">{language === 'my' ? 'လုံခြုံပြီး သီးသန့်သော' : 'Secure & Private'}</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 w-full min-w-0">
            <HeroIntroVideo
              title={
                language === 'en'
                  ? 'Dr. Tun Myat Win — introduction video'
                  : 'ဒေါက်တာထွန်းမြတ်ဝင်း မိတ်ဆက်ဗီဒီယို'
              }
            />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center min-w-0 px-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-sky-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
                  </div>
                  <p className="stat-number">{stat.value}</p>
                  <p className="text-slate-400 font-medium mt-1 sm:mt-2 text-xs sm:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding px-4 sm:px-6 lg:px-8 section-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-100 px-2">
              {t.features.title}
            </h2>
            <p className="mt-3 md:mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-2">
              {t.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const featureData = t.features[feature.key as keyof typeof t.features] as { title: string; description: string };
              return (
                <div key={index} className="card-gradient group md:hover:scale-105 transition-transform">
                  <div className={`icon-circle icon-circle-${feature.color} mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    {featureData.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {featureData.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-100 px-2">
              {t.howItWorks.title}
            </h2>
            <p className="mt-3 md:mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-2">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((item, index) => (
              <div key={index} className="relative text-center">
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 bg-sky-300" />
                )}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-blue-500/30 z-10 relative">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={handleBookConsultation} className="btn-gradient flex items-center gap-2 mx-auto">
              <Target className="w-5 h-5" />
              ယခုစတင်ပါ
            </button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section-padding px-4 sm:px-6 lg:px-8 section-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-100 px-2">
              {t.reviews.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="glass-card p-5 sm:p-8 md:hover:scale-105 transition-transform">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-slate-400 mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-300 rounded-full flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-100">{review.name}</span>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>လူနာဟောင်း</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-drtun py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="myanmar-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-2">
            {t.cta.title}
          </h2>
          <p className="myanmar-text text-base sm:text-lg text-white/90 mb-8 md:mb-10 max-w-xl mx-auto px-2">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button onClick={handleBookConsultation} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span className="text-center">{t.cta.bookNow} — ၁၅,၀၀၀ ကျပ်</span>
            </button>
            <a href="tel:+959123456789" className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
              <Phone className="w-5 h-5" />
              {t.cta.callNow}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="min-w-0 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4 md:mb-6 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                </div>
                <span className="text-lg sm:text-xl font-bold truncate">ဒေါက်တာထွန်းမြတ်ဝင်း</span>
              </div>
              <p className="text-slate-500 leading-relaxed myanmar-text">
                {language === 'en'
                  ? 'Online consultations for thyroid conditions only.'
                  : 'သိုင်းရိုက်ရောဂါများအတွက် အွန်လိုင်းဆွေးနွေးမှု သာလျှင်။'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">{t.footer.quickLinks}</h4>
              <ul className="space-y-3 text-slate-500">
                <li><a href="#about" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />{t.nav.about}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />{t.nav.services}</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />{t.nav.reviews}</a></li>
                <li><Link href="/booking" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />ယခုချိန်းဆိုရန်</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">{t.footer.contact}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-sky-400" />
                  +95 9 123 456 789
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-sky-400" />
                  dr.tunmyatwin@gmail.com
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">{t.footer.followUs}</h4>
              <div className="flex gap-4">
                <a href="https://youtube.com/@drtunmyatwin" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-500 transition-colors group">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-sky-500 transition-colors group">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© ၂၀၂၅ ဒေါက်တာထွန်းမြတ်ဝင်း။ {t.footer.rights}</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal modal--auth p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="myanmar-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                အကောင့်ဝင်ရန်လိုအပ်ပါသည်
              </h2>
              <p className="myanmar-text text-slate-700 mb-8 text-sm sm:text-base">
                ဆွေးနွေးခြင်းချိန်းဆိုရန် အကောင့်ဝင်ပါ။
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/login" className="btn-primary flex-1 text-center">
                  {t.auth.signIn}
                </Link>
                <Link href="/register" className="btn-secondary flex-1 text-center">
                  {t.auth.signUp}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
