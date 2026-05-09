'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Globe,
  User,
  Video,
  Calendar,
  FileText,
  BadgeCheck,
  Lock,
  Headphones,
  Star,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';

/** Moonchild.ai–inspired marketing shell: airy type, neutral surfaces, role cards, numbered journey, FAQ — clinic copy via translations. */

const HERO_PORTRAIT_FALLBACK =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=640&q=82&auto=format&fit=crop';

const TRUST_SECTION_IMG =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=82&auto=format&fit=crop';

/** Clinic phone on CTA (local 09… ; tel: uses +95 without leading 0). */
const CLINIC_PHONE_LOCAL = '09421068582';
const CLINIC_PHONE_TEL = 'tel:+959421068582';

const reviews = [
  { name: 'ဦးအောင်', rating: 5, comment: 'ဒေါက်တာထွန်းမြတ်ဝင်းက ကျွန်တော့်ရောဂါကို စိတ်ရှည်စွာ နားထောင်ပြီး ကောင်းမွန်တဲ့ ကုသမှုပေးပါသည်။ အလွန်ကျေးဇူးတင်ပါတယ်။' },
  { name: 'ဦးကျော်', rating: 5, comment: 'အွန်လိုင်းဆွေးနွေးခြင်းက အရမ်းသက်သာပြီး အရမ်းလွယ်ကူပါတယ်။ ညွှန်းပါတယ်။' },
  { name: 'ဦးမင်း', rating: 5, comment: 'ပညာရှင်ဆရာဝန်တစ်ယောက်ဖြစ်တဲ့အတွက် ယုံကြည်လို့ရပါတယ်။ အကြံဉာဏ်တွေကလည်း အရမ်းအသုံးဝင်ပါတယ်။' },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const motionSafePress = 'motion-safe:active:scale-[0.98]';
const transitionUi = 'transition-[color,transform,box-shadow,background-color] duration-200 motion-reduce:transition-none';

const faqKeys = [
  { q: 'faq1q' as const, a: 'faq1a' as const },
  { q: 'faq2q' as const, a: 'faq2a' as const },
  { q: 'faq3q' as const, a: 'faq3a' as const },
  { q: 'faq4q' as const, a: 'faq4a' as const },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const tc = t.clinical;

  const heroFromEnv = process.env.NEXT_PUBLIC_HERO_PORTRAIT?.trim();
  const [heroPortraitSrc, setHeroPortraitSrc] = useState(
    () => heroFromEnv || '/hero-doctor.jpg',
  );

  const handleHeroPortraitError = () => {
    setHeroPortraitSrc((current) =>
      current === HERO_PORTRAIT_FALLBACK ? current : HERO_PORTRAIT_FALLBACK,
    );
  };
  const [showAuthModal, setShowAuthModal] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleBookConsultation = () => {
    if (isAuthenticated) {
      router.push('/booking');
    } else {
      setShowAuthModal(true);
    }
  };

  if (!mounted) return null;

  const navItems = [
    { href: '/#about', label: tc.aboutNav },
    { href: '/#services', label: t.nav.services },
    { href: '/#journey', label: tc.navConsult },
    { href: '/dashboard', label: tc.navDashboard },
  ];

  const navLinkClass = `rounded-md px-3 py-2 text-sm font-medium text-muted-foreground ${transitionUi} hover:bg-muted/80 hover:text-foreground`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg ${focusRing}`}
      >
        Skip to main content
      </a>

      <nav
        className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-card/88"
        aria-label={language === 'en' ? 'Main navigation' : 'မီနူး လမ်းညွှန်'}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-[3.75rem] sm:gap-4">
            <Link
              href="/"
              className={`flex min-w-0 max-w-[65%] shrink-0 items-center gap-2.5 rounded-lg sm:max-w-none ${focusRing}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10" aria-hidden>
                <Stethoscope className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2} />
              </span>
              <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {tc.brandLine}
              </span>
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
              <ul className="flex items-center gap-0.5 lg:gap-1">
                {navItems.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className={`${navLinkClass} ${focusRing} inline-flex`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-l border-border/80 pl-2 sm:gap-2.5 sm:pl-3 md:pl-4">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:min-w-0 sm:gap-1.5 sm:px-3 ${transitionUi} ${focusRing} cursor-pointer`}
                aria-label={language === 'en' ? 'Switch language to Myanmar' : 'Switch language to English'}
              >
                <Globe className="h-[18px] w-[18px] shrink-0 sm:h-4 sm:w-4" aria-hidden />
                <span className="hidden text-xs font-medium sm:inline sm:text-sm">
                  {language === 'en' ? 'မြန်မာ' : 'English'}
                </span>
              </button>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className={`inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 ${motionSafePress} ${transitionUi} ${focusRing}`}
                >
                  {t.nav.dashboard}
                </Link>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-1.5 sm:flex-nowrap sm:gap-2">
                  <Link
                    href="/login"
                    className={`hidden min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex ${transitionUi} ${focusRing}`}
                  >
                    {tc.signIn}
                  </Link>
                  <Link
                    href="/register"
                    className={`inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold leading-snug text-foreground shadow-sm hover:border-primary/40 hover:bg-muted/50 sm:px-4 ${motionSafePress} ${transitionUi} ${focusRing}`}
                  >
                    {tc.signUpNav}
                  </Link>
                  <button
                    type="button"
                    onClick={handleBookConsultation}
                    className={`inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg bg-secondary px-3 text-sm font-semibold leading-snug text-secondary-foreground shadow-sm hover:bg-secondary/90 sm:px-4 ${motionSafePress} ${transitionUi} ${focusRing} cursor-pointer`}
                  >
                    {t.hero.bookAppointment}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border/60 md:hidden">
            <ul className="-mx-1 flex gap-0.5 overflow-x-auto overscroll-x-contain py-2 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map(({ href, label }) => (
                <li key={href} className="shrink-0">
                  <Link href={href} className={`${navLinkClass} ${focusRing} inline-flex`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero — Moonchild-style centered headline */}
        <section id="about" className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),transparent)]" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-pretty text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl sm:leading-[1.06] md:text-6xl">
              {tc.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tc.heroSubhead}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleBookConsultation}
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-center text-sm font-medium leading-snug text-primary-foreground whitespace-normal shadow-lg shadow-primary/25 hover:bg-primary/90 sm:w-auto sm:text-[15px] ${motionSafePress} ${transitionUi} ${focusRing} cursor-pointer`}
              >
                {tc.heroCtaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <Link
                href="/#journey"
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-full border border-border bg-card px-8 text-sm font-medium text-foreground hover:bg-muted/60 sm:w-auto sm:text-[15px] ${transitionUi} ${focusRing}`}
              >
                {tc.moonHeroSecondaryCta}
              </Link>
            </div>
            <ul className="mx-auto mt-12 max-w-xl space-y-3 text-left text-[15px] leading-relaxed text-foreground sm:text-base">
              {tc.heroChecklistLines.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" strokeWidth={2} aria-hidden />
                  <span className="text-pretty">{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-sm text-muted-foreground">{tc.heroFooterLine}</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-lg sm:mt-20 lg:mt-24 lg:max-w-xl">
            <figure className="relative isolate overflow-hidden rounded-3xl border border-border bg-muted shadow-2xl shadow-black/35">
              <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                <Image
                  src={heroPortraitSrc}
                  alt={tc.heroPortraitAlt}
                  fill
                  className="object-cover object-[50%_18%]"
                  sizes="(max-width: 1024px) 90vw, 480px"
                  priority
                  onError={handleHeroPortraitError}
                />
              </div>
            </figure>
          </div>
        </section>

        {/* Role cards — "Built for every role" rhythm */}
        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tc.moonRolesTitle}
              </h2>
              <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
                {tc.moonRolesSubtitle}
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: tc.moonR1Title,
                  hook: tc.moonR1Hook,
                  desc: tc.moonR1Desc,
                  cta: tc.moonR1Cta,
                  onClick: handleBookConsultation,
                  href: null as string | null,
                },
                {
                  title: tc.moonR2Title,
                  hook: tc.moonR2Hook,
                  desc: tc.moonR2Desc,
                  cta: tc.moonR2Cta,
                  onClick: null as (() => void) | null,
                  href: '/#journey',
                },
                {
                  title: tc.moonR3Title,
                  hook: tc.moonR3Hook,
                  desc: tc.moonR3Desc,
                  cta: tc.moonR3Cta,
                  onClick: null,
                  href: '/register',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.hook}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{card.title}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">{card.desc}</p>
                  {card.href ? (
                    <Link
                      href={card.href}
                      className={`mt-8 inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 ${transitionUi} ${focusRing} rounded`}
                    >
                      {card.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={card.onClick ?? undefined}
                      className={`mt-8 inline-flex w-fit items-center gap-1 text-left text-sm font-semibold text-foreground group-hover:gap-2 ${transitionUi} ${focusRing} rounded cursor-pointer`}
                    >
                      {card.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Numbered journey */}
        <section id="journey" className="border-t border-border bg-card px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tc.moonJourneyTitle}
              </h2>
              <p className="mt-4 text-muted-foreground">{tc.moonJourneySubtitle}</p>
            </div>
            <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
              {[
                { label: tc.moonS1Label, title: tc.moonS1Title, desc: tc.moonS1Desc },
                { label: tc.moonS2Label, title: tc.moonS2Title, desc: tc.moonS2Desc },
                { label: tc.moonS3Label, title: tc.moonS3Title, desc: tc.moonS3Desc },
              ].map((step) => (
                <div key={step.label} className="relative">
                  <span className="text-5xl font-semibold tabular-nums tracking-tight text-primary/20">{step.label}</span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{tc.servicesKicker}</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tc.servicesHeading}
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-hidden>
                  <Video className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-pretty text-[15px] font-medium leading-relaxed text-foreground">{tc.svcVirtualLine}</p>
              </div>
              <div className="rounded-2xl border border-primary bg-primary p-8 shadow-lg">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-card text-primary" aria-hidden>
                  <Calendar className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-pretty text-[15px] font-medium leading-relaxed text-primary-foreground/95">{tc.svcBookingLine}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-hidden>
                  <FileText className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-pretty text-[15px] font-medium leading-relaxed text-foreground">{tc.svcRxLine}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section id="consult" className="border-y border-border bg-muted/80 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative order-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:order-1">
              <Image
                src={TRUST_SECTION_IMG}
                alt=""
                aria-labelledby="trust-heading"
                width={640}
                height={480}
                className="aspect-[4/3] h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 id="trust-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tc.trustHeading}
              </h2>
              <div className="mt-10 space-y-8">
                {[
                  { icon: BadgeCheck, title: tc.trust1Title, desc: tc.trust1Desc },
                  { icon: Lock, title: tc.trust2Title, desc: tc.trust2Desc },
                  { icon: Headphones, title: tc.trust3Title, desc: tc.trust3Desc },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-11 min-h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border" aria-hidden>
                      <item.icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tc.testimonialsHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t.reviews.subtitle}</p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground" aria-hidden>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{review.name}</p>
                      <div className="flex text-secondary" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-secondary text-secondary' : 'text-border'}`} aria-hidden />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="flex-1 text-pretty text-[15px] leading-relaxed text-foreground">&ldquo;{review.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — Moonchild "Questions, answered" */}
        <section className="border-t border-border bg-card px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {tc.faqTitle}
            </h2>
            <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-muted/50">
              {faqKeys.map((item) => (
                <details key={item.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-semibold text-foreground ${focusRing} rounded-lg`}>
                    {tc[item.q]}
                    <span className="text-muted-foreground transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{tc[item.a]}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-coal px-4 py-20 text-primary-foreground sm:px-6 sm:py-28" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.cta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">{t.cta.subtitle}</p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleBookConsultation}
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-full bg-secondary px-6 py-3 text-center text-base font-semibold leading-snug text-secondary-foreground shadow-md whitespace-normal hover:bg-secondary/90 sm:w-auto sm:px-8 sm:text-[15px] ${motionSafePress} ${transitionUi} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-coal cursor-pointer`}
              >
                {t.cta.bookNow}
              </button>
              <a
                href={CLINIC_PHONE_TEL}
                className={`inline-flex min-h-12 items-center justify-center rounded-full border-2 border-primary-foreground/50 px-8 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 ${transitionUi} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-coal`}
                aria-label={`${t.cta.callNow}: ${CLINIC_PHONE_LOCAL}`}
              >
                <span className="flex flex-col items-center sm:flex-row sm:gap-2">
                  <span>{t.cta.callNow}</span>
                  <span className="tabular-nums text-base font-bold tracking-wide">{CLINIC_PHONE_LOCAL}</span>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border bg-background pt-16 pb-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-1">
            <div className="text-lg font-semibold text-foreground">{tc.brandLine}</div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tc.footerBlurb}</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-foreground">{tc.footerCompany}</h5>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#about" className={`hover:text-foreground ${transitionUi} ${focusRing} rounded`}>{tc.aboutNav}</Link></li>
              <li><Link href="/#services" className={`hover:text-foreground ${transitionUi} ${focusRing} rounded`}>{t.nav.services}</Link></li>
              <li><Link href="/booking" className={`hover:text-foreground ${transitionUi} ${focusRing} rounded`}>{t.hero.bookAppointment}</Link></li>
              <li><Link href="/login" className={`hover:text-foreground ${transitionUi} ${focusRing} rounded`}>{tc.signIn}</Link></li>
              <li><Link href="/register" className={`hover:text-foreground ${transitionUi} ${focusRing} rounded`}>{tc.signUpNav}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-foreground">{tc.footerLegal}</h5>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><span className="opacity-70">Privacy</span></li>
              <li><span className="opacity-70">Terms</span></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-foreground">{tc.footerNewsletter}</h5>
            <p className="mt-4 text-sm text-muted-foreground">{tc.newsletterHint}</p>
            <div className="mt-3 flex gap-2">
              <input
                className={`min-h-11 w-full rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${transitionUi}`}
                placeholder={tc.footerEmailPh}
                type="email"
                readOnly
                aria-label={tc.footerEmailPh}
              />
              <button
                type="button"
                className={`min-h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 ${transitionUi} ${focusRing} cursor-pointer`}
              >
                {tc.footerJoin}
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-border px-4 pt-8 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">{tc.copyright}</p>
        </div>
      </footer>

      {showAuthModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAuthModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowAuthModal(false)}
          role="presentation"
        >
          <div
            className="modal p-8 max-w-md rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted" aria-hidden>
                <User className="h-8 w-8 text-foreground" />
              </div>
              <h2 id="auth-modal-title" className="text-xl font-semibold text-foreground">
                အကောင့်ဝင်ရန်လိုအပ်ပါသည်
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">ဆွေးနွေးခြင်းချိန်းဆိုရန် အကောင့်ဝင်ပါ။</p>
              <div className="mt-8 flex gap-3">
                <Link href="/login" className={`btn-primary flex-1 justify-center text-center ${focusRing}`}>
                  {t.auth.signIn}
                </Link>
                <Link href="/register" className={`btn-secondary flex-1 justify-center text-center ${focusRing}`}>
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
