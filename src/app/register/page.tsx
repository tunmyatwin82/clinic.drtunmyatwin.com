'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Phone,
  Stethoscope,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';
import { LenisRegisterRoot } from '@/components/auth/lenis-register-root';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

/** Register — clinical tokens; see /DESIGN.md */
const CLINICAL_FIELD =
  'h-11 border border-input bg-card text-[15px] text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 md:text-[15px] aria-invalid:border-destructive aria-invalid:ring-destructive/25';

/** Same-origin relative paths only — blocks open redirects. */
function getSafeRedirectParam(raw: string | null): string {
  if (!raw) return '/dashboard';
  let path: string;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return '/dashboard';
  }
  if (!path.startsWith('/') || path.startsWith('//')) return '/dashboard';
  if (path.includes('://')) return '/dashboard';
  return path;
}

function mapRegistrationApiError(apiMessage: unknown, auth: Record<string, string>): string {
  const msg = typeof apiMessage === 'string' ? apiMessage.trim() : '';
  if (msg === 'Email already registered') return auth.registrationEmailTaken;
  if (msg === 'Phone number already registered') return auth.registrationPhoneTaken;
  return msg || auth.registrationFailed;
}

function buildRegisterSchema(auth: Record<string, string>) {
  return z
    .object({
      name: z.string().trim().min(2, auth.validationNameMin),
      phone: z
        .string()
        .trim()
        .min(1, auth.validationPhone)
        .refine((s) => {
          const digits = s.replace(/\D/g, '');
          return digits.length >= 8 && digits.length <= 15;
        }, { message: auth.validationPhone }),
      password: z.string().min(6, auth.validationPasswordMin),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: auth.validationPasswordMismatch,
      path: ['confirmPassword'],
    });
}

type RegisterForm = z.infer<ReturnType<typeof buildRegisterSchema>>;

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addUser } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successFlash, setSuccessFlash] = useState(false);

  const redirectAfterRegister = getSafeRedirectParam(searchParams.get('redirect'));
  const loginHref =
    redirectAfterRegister && redirectAfterRegister !== '/dashboard'
      ? `/login?redirect=${encodeURIComponent(redirectAfterRegister)}`
      : '/login';

  const registerSchema = useMemo(
    () =>
      buildRegisterSchema({
        validationNameMin: t.auth.validationNameMin,
        validationPhone: t.auth.validationPhone,
        validationPasswordMin: t.auth.validationPasswordMin,
        validationPasswordMismatch: t.auth.validationPasswordMismatch,
        registrationEmailTaken: t.auth.registrationEmailTaken,
        registrationPhoneTaken: t.auth.registrationPhoneTaken,
        registrationFailed: t.auth.registrationFailed,
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setSubmitError('');
    setSuccessFlash(false);

    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      gender: 'other' as const,
      password: data.password,
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (result.success) {
        const apiUser = result.data.user as {
          id: string;
          email?: string | null;
          name: string;
          phone: string;
          role: string;
        };
        addUser({
          id: apiUser.id,
          email: apiUser.email || '',
          name: data.name.trim(),
          phone: data.phone.trim(),
          role: 'patient' as const,
          password: data.password,
          gender: 'other',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setSuccessFlash(true);
        window.setTimeout(() => {
          router.push(loginHref);
        }, 900);
      } else {
        setSubmitError(
          mapRegistrationApiError(result.error, {
            registrationEmailTaken: t.auth.registrationEmailTaken,
            registrationPhoneTaken: t.auth.registrationPhoneTaken,
            registrationFailed: t.auth.registrationFailed,
          }),
        );
      }
    } catch {
      setSubmitError(t.auth.registrationFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const loadingLabel = language === 'en' ? 'Submitting' : 'ပို့နေသည်';

  const marqueeText =
    language === 'en'
      ? 'ONLINE TELEMED · SECURE INTAKE · DR. TUN MYAT WIN · HIPAA-MINDED · VIDEO CONSULT · '
      : 'အွန်လိုင်းဆွေးနွေး · လုံခြုံမှုအရ မှတ်ပုံတင် · ဒေါက်တာထွန်းမြတ်ဝင်း · ဗီဒီယိုဆွေး · သီးခြားခြုံထား · ';
  const focusRingEz =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const brandName = language === 'en' ? 'Dr. Tun Myat Win' : 'ဒေါက်တာထွန်းမြတ်ဝင်း';
  const serviceBadge =
    language === 'en' ? 'Online telemedicine' : 'အွန်လိုင်းဆွေးနွေးကုသမှု';

  const signupGuideTitle =
    language === 'en' ? 'How to sign up' : 'စာရင်းသွင်းနည်း';
  const signupSteps =
    language === 'en'
      ? [
          'Enter your full name as on your ID.',
          'Use the phone number you can receive calls on.',
          'Choose a password you will remember (at least 6 characters).',
        ]
      : [
          'မှတ်ပုံတင်အမည် အပြည့်အစုံ ထည့်ပါ။',
          'ခေါ်ဆိုမှုလက်ခံနိုင်သော ဖုန်းနံပါတ် ထည့်ပါ။',
          'မှတ်သားလွယ်သော စကားဝှက် (အနည်းဆုံး ၆ လုံး) သတ်မှတ်ပါ။',
        ];

  const afterAccountTitle =
    language === 'en' ? 'After you have an account' : 'အကောင့်ရှိပြီးနောက်';
  const afterAccountPoints =
    language === 'en'
      ? [
          'Book video consultations online in a few taps.',
          'View visit notes and prescriptions in one place.',
          'Message the clinic for follow-up when you need clarity.',
        ]
      : [
          'အွန်လိုင်းမှ ဗီဒီယိုဆွေးနွေးမှု ချိန်းဆိုနိုင်ပါသည်။',
          'ဆွေးနွေးမှတ်တမ်းနှင့် ဆေးညွှန်းကို တစ်နေရာတည်းတွင် ကြည့်နိုင်ပါသည်။',
          'နောက်တွဲမေးခွန်း ရှိလျှင် ဆက်သွယ်မေးမြန်းနိုင်ပါသည်။',
        ];

  const formSubtitle =
    language === 'en'
      ? 'Phone and password only — done in under a minute.'
      : 'ဖုန်းနံပါတ်နှင့် စကားဝှက်သာ — မိနစ်အနည်းငယ်အတွင်း ပြီးမြောက်ပါသည်။';

  const brandBlock = (compact = false) => {
    const iconSize = compact ? 'h-11 w-11' : 'h-12 w-12';
    const iconPad = compact ? 'pl-14' : 'pl-[3.75rem]';

    return (
      <div className="w-full">
        <Link
          href="/"
          className={`group flex w-full items-center gap-3 rounded-xl text-left ${focusRingEz}`}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02] ${iconSize}`}
          >
            <Stethoscope className={compact ? 'size-6' : 'h-6 w-6'} strokeWidth={2} aria-hidden />
          </div>
          <span
            className={`myanmar-heading block min-w-0 flex-1 font-bold tracking-tight text-foreground ${compact ? 'text-lg' : 'text-xl md:text-2xl'}`}
          >
            {brandName}
          </span>
        </Link>
        <div className={`${iconPad} pt-2.5`}>
          <span className="inline-flex w-fit max-w-full items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-sm font-medium leading-snug text-emerald-400">
            {serviceBadge}
          </span>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="space-y-8">
      <div>{brandBlock()}</div>

      <div className="space-y-3">
        <h2 className="myanmar-heading text-lg font-semibold text-foreground">{signupGuideTitle}</h2>
        <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {signupSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="myanmar-text text-pretty text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h2 className="myanmar-heading text-lg font-semibold text-foreground">{afterAccountTitle}</h2>
        <ul className="space-y-3 text-sm leading-relaxed">
          {afterAccountPoints.map((line) => (
            <li key={line} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" aria-hidden strokeWidth={2} />
              <span className="myanmar-text text-pretty text-muted-foreground">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <LenisRegisterRoot>
      <div className="relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
        <div className="relative z-10 border-b border-border bg-card shadow-sm">
          <p className="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-start sm:text-xs">
            {marqueeText.trim()}
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-24">
            <aside className="sticky top-28 hidden lg:block">{sidebarContent}</aside>

            <div className="w-full lg:max-w-lg xl:max-w-xl">
            <div className="mb-6 lg:hidden">{brandBlock(true)}</div>

            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="myanmar-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t.auth.signUp}
                </h1>
                <p className="myanmar-text mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {formSubtitle}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className={`shrink-0 rounded-full border-border px-4 py-2 text-sm font-medium shadow-sm ${focusRingEz} cursor-pointer`}
              >
                <Globe className="mr-1.5 text-primary" aria-hidden />
                {language === 'en' ? 'မြန်မာ' : 'English'}
              </Button>
            </div>

            <Card className="border border-border bg-card shadow-clinical [&_[data-slot=label]]:text-foreground">
              <CardContent className="pt-6">
                <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                  <FieldGroup className="gap-5 [&_[data-slot=field]]:gap-2">
                    {successFlash && (
                      <div
                        className="rounded-lg border border-secondary/50 bg-secondary/10 px-3 py-2.5 text-sm text-foreground"
                        role="status"
                      >
                        {t.auth.registrationSuccess}
                      </div>
                    )}
                    {submitError && (
                      <Alert
                        variant="destructive"
                        className="border-rose-500/50 bg-rose-950/40 text-rose-50 backdrop-blur-sm [&_[data-slot=alert-description]]:text-rose-100"
                      >
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    <Field data-invalid={!!errors.name}>
                      <FieldLabel htmlFor="reg-name">{t.auth.name}</FieldLabel>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="reg-name"
                          {...register('name')}
                          type="text"
                          autoComplete="name"
                          className={CLINICAL_FIELD + ' pl-9'}
                          placeholder={
                            language === 'en' ? 'Your full name' : 'သင့်အမည်အပြည့်အစုံ'
                          }
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'reg-name-error' : undefined}
                        />
                      </div>
                      <FieldError id="reg-name-error" errors={[errors.name]} />
                    </Field>

                    <Field data-invalid={!!errors.phone}>
                      <FieldLabel htmlFor="reg-phone">{t.auth.phone}</FieldLabel>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="reg-phone"
                          {...register('phone')}
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          className={CLINICAL_FIELD + ' pl-9'}
                          placeholder="09xxxxxxxxx"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                        />
                      </div>
                      <FieldError id="reg-phone-error" errors={[errors.phone]} />
                    </Field>

                    <Field data-invalid={!!errors.password}>
                      <FieldLabel htmlFor="reg-password">{t.auth.password}</FieldLabel>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="reg-password"
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className={CLINICAL_FIELD + ' pr-10 pl-9'}
                          placeholder="••••••••"
                          aria-invalid={!!errors.password}
                          aria-describedby={errors.password ? 'reg-password-error' : undefined}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className={`absolute top-1/2 right-1 z-10 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground ${focusRingEz} cursor-pointer`}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? language === 'en'
                                ? 'Hide password'
                                : 'စကားဝှက်ဖျောက်မည်'
                              : language === 'en'
                                ? 'Show password'
                                : 'စကားဝှက်ပြမည်'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </div>
                      <FieldError id="reg-password-error" errors={[errors.password]} />
                    </Field>

                    <Field data-invalid={!!errors.confirmPassword}>
                      <FieldLabel htmlFor="reg-confirm">{t.auth.confirmPassword}</FieldLabel>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="reg-confirm"
                          {...register('confirmPassword')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className={CLINICAL_FIELD + ' pl-9'}
                          placeholder="••••••••"
                          aria-invalid={!!errors.confirmPassword}
                          aria-describedby={
                            errors.confirmPassword ? 'reg-confirm-error' : undefined
                          }
                        />
                      </div>
                      <FieldError id="reg-confirm-error" errors={[errors.confirmPassword]} />
                    </Field>

                    <Button
                      type="submit"
                      form="register-form"
                      disabled={isLoading || successFlash}
                      aria-busy={isLoading}
                      className={`mt-2 h-11 w-full min-h-11 cursor-pointer gap-2 rounded-xl bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-55 ${focusRingEz}`}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Spinner className="size-4 text-primary-foreground" aria-hidden />
                          <span className="sr-only">{loadingLabel}</span>
                        </>
                      ) : (
                        t.auth.signUp
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>

              <CardFooter className="flex justify-center border-t border-border bg-transparent py-6">
                <p className="text-center text-sm text-muted-foreground">
                  {t.auth.haveAccount}{' '}
                  <Link
                    href={loginHref}
                    className={`font-medium text-primary underline-offset-4 transition-colors hover:underline ${focusRingEz}`}
                  >
                    {t.auth.signInHere}
                  </Link>
                </p>
              </CardFooter>
            </Card>

            <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card/50 p-5 lg:hidden">
              <div className="space-y-3">
                <h2 className="myanmar-heading text-base font-semibold text-foreground">{signupGuideTitle}</h2>
                <ol className="space-y-2.5 text-sm">
                  {signupSteps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="myanmar-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3 border-t border-border pt-5">
                <h2 className="myanmar-heading text-base font-semibold text-foreground">{afterAccountTitle}</h2>
                <ul className="space-y-2.5 text-sm">
                  {afterAccountPoints.map((line) => (
                    <li key={line} className="flex gap-2.5 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                      <span className="myanmar-text">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </LenisRegisterRoot>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-foreground">
          <Spinner className="size-11 text-primary" aria-hidden />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
