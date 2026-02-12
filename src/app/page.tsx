'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Video,
  Clock,
  Shield,
  Star,
  Phone,
  MessageCircle,
  User,
  ChevronRight,
  CheckCircle,
  Heart,
  Brain,
  Stethoscope,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Award,
  Activity,
  Target,
  Lightbulb,
  CircleDot,
  Cpu,
  HeartPulse,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';

const specializations = [
  {
    icon: CircleDot,
    key: 'maleReproductive',
    color: 'pink'
  },
  {
    icon: Cpu,
    key: 'nervousSystem',
    color: 'purple'
  },
  {
    icon: HeartPulse,
    key: 'generalConsultation',
    color: 'primary'
  },
];

const features = [
  { icon: Video, key: 'video', color: 'primary' },
  { icon: Calendar, key: 'scheduling', color: 'secondary' },
  { icon: Shield, key: 'security', color: 'purple' },
  { icon: MessageCircle, key: 'followup', color: 'pink' },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'လူနာများ' },
  { icon: Award, value: '15+', label: 'နှစ်အတွေ့အကြုံ' },
  { icon: Star, value: '5.0', label: 'သုံးသူ� rating' },
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
  const [mounted, setMounted] = useState(false);

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
    <div className="min-h-screen bg-slate-50">
      {/* Floating Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape w-96 h-96 top-0 right-0 animate-blob" style={{ top: '-10%', right: '-5%' }} />
        <div className="floating-shape w-80 h-80 bottom-0 left-0 animate-blob" style={{ animationDelay: '1s', bottom: '-5%', left: '-5%' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-sky-500">
                ဒေါက်တာထွန်းမြတ်ဝင်း
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="nav-link">{t.nav.about}</a>
              <a href="#services" className="nav-link">{t.nav.services}</a>
              <a href="#reviews" className="nav-link">{t.nav.reviews}</a>
              <a href="#contact" className="nav-link">{t.nav.contact}</a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className="btn-link"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'မြန်မာ' : 'English'}</span>
              </button>
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary">
                  {t.nav.dashboard}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="nav-link">
                    {t.nav.login}
                  </Link>
                  <button onClick={handleBookConsultation} className="btn-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.hero.bookAppointment}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
                <Zap className="w-4 h-4" />
                {t.hero.onlineConsultation}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                {t.hero.title}
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-500 mt-2 leading-tight">
                {t.hero.subtitle}
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                {t.hero.description}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button onClick={handleBookConsultation} className="btn-primary flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t.hero.bookAppointment}
                </button>
                <Link href="#services" className="btn-secondary flex items-center justify-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  {t.hero.viewServices}
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-sky-300 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{t.hero.rating}</span>
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">{language === 'my' ? 'လုံခြုံပြီး သီးသန့်သော' : 'Secure & Private'}</span>
                </div>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="relative z-10">
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                  <div className="aspect-video bg-sky-100 rounded-2xl flex items-center justify-center mb-6">
                    <div className="w-40 h-40 bg-sky-400 rounded-full flex items-center justify-center shadow-2xl">
                      <User className="w-20 h-20 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">ဒေါက်တာထွန်းမြတ်ဝင်း</h3>
                    <p className="text-gray-600 mt-2 font-medium">အမျိုးသားကျန်းမာရေး & နှလုံးရောဂါပညာရှင်</p>
                    <div className="mt-4 flex justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>၁၅+ နှစ်</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5 text-sky-500" />
                        <span>၁၀,၀၀၀+ လူနာ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass-card rounded-2xl shadow-xl p-4 animate-pulse-glow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">၂၄/၇</p>
                    <p className="text-sm text-gray-500">အရေးပေါ်</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">လိုင်းလိုင်းချင်း</p>
                    <p className="text-sm text-gray-500">ယုံကြည်ရမှု</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-sky-100 rounded-2xl flex items-center justify-center mb-4">
                    <stat.icon className="w-8 h-8 text-sky-500" />
                  </div>
                  <p className="stat-number">{stat.value}</p>
                  <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section id="services" className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {t.specializations.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t.specializations.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {specializations.map((spec, index) => {
              const specData = t.specializations[spec.key as keyof typeof t.specializations] as { title: string; description: string };
              return (
                <div key={index} className="card-modern p-8 group cursor-pointer">
                  <div className={`icon-circle icon-circle-${spec.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <spec.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {specData.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {specData.description}
                  </p>
                  <button onClick={handleBookConsultation} className="btn-link mt-4">
                    ယခုဆွေးနွေးပါ <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {t.features.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const featureData = t.features[feature.key as keyof typeof t.features] as { title: string; description: string };
              return (
                <div key={index} className="card-gradient group hover:scale-105 transition-transform">
                  <div className={`icon-circle icon-circle-${feature.color} mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {featureData.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {featureData.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {t.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((item, index) => (
              <div key={index} className="relative text-center">
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 bg-sky-300" />
                )}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 bg-sky-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-sky-200 z-10 relative">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
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
      <section id="reviews" className="section-padding px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {t.reviews.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t.reviews.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="glass-card p-8 hover:scale-105 transition-transform">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-300 rounded-full flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{review.name}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-sky-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-blob bg-white/20" style={{ top: '20%', left: '10%' }} />
          <div className="hero-blob bg-white/10" style={{ top: '60%', right: '10%', animationDelay: '2s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-xl mx-auto">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleBookConsultation} className="btn-primary flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t.cta.bookNow} - ၁၅,၀၀၀ ကျပ်
            </button>
            <a href="tel:+959123456789" className="btn-secondary flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              {t.cta.callNow}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">ဒေါက်တာထွန်းမြတ်ဝင်း</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                အမျိုးသားကျန်းမာရေးနှင့် အာရုံကြောစနစ်ပြဿနာများအတွက် ပညာရှင်အွန်လိုင်းဆွေးနွေးခြင်းဝန်ဆောင်မှုများ။
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">{t.footer.quickLinks}</h4>
              <ul className="space-y-3 text-gray-500">
                <li><a href="#about" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />{t.nav.about}</a></li>
                <li><a href="#services" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />{t.nav.services}</a></li>
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
          <div className="modal p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <User className="w-10 h-10 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">အကောင့်ဝင်ရန်လိုအပ်ပါသည်</h2>
              <p className="text-gray-600 mb-8">ဆွေးနွေးခြင်းချိန်းဆိုရန် အကောင့်ဝင်ပါ။</p>
              <div className="flex gap-4">
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
