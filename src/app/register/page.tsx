'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Mail,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

/** Register — clinical tokens; see /DESIGN.md */
const CLINICAL_FIELD =
  'h-11 border border-input bg-card text-[15px] text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 md:text-[15px] aria-invalid:border-destructive aria-invalid:ring-destructive/25';

const CLINICAL_SELECT_TRIGGER =
  'h-11 w-full min-w-0 justify-between border border-input bg-card text-[15px] text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 aria-invalid:border-destructive';

const CLINICAL_SELECT_POPUP = 'border border-border bg-card text-foreground shadow-lg';

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
      email: z.string().trim().superRefine((val, ctx) => {
        if (val === '') return;
        if (!z.string().email().safeParse(val).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: auth.validationEmailOptional });
        }
      }),
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
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().optional(),
      acceptedTerms: z.boolean().refine((v) => v === true, { message: auth.validationTerms }),
    })
    .superRefine((data, ctx) => {
      if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
        const d = new Date(data.dateOfBirth);
        if (Number.isNaN(d.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: auth.validationDobFuture,
            path: ['dateOfBirth'],
          });
          return;
        }
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        if (d > endOfToday) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: auth.validationDobFuture,
            path: ['dateOfBirth'],
          });
        }
      }
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
  const tc = t.clinical;
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
        validationEmailOptional: t.auth.validationEmailOptional,
        validationPhone: t.auth.validationPhone,
        validationPasswordMin: t.auth.validationPasswordMin,
        validationPasswordMismatch: t.auth.validationPasswordMismatch,
        validationTerms: t.auth.validationTerms,
        validationDobFuture: t.auth.validationDobFuture,
        registrationEmailTaken: t.auth.registrationEmailTaken,
        registrationPhoneTaken: t.auth.registrationPhoneTaken,
        registrationFailed: t.auth.registrationFailed,
      }),
    [t],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setSubmitError('');
    setSuccessFlash(false);

    const emailTrimmed = data.email.trim();
    const payload = {
      email: emailTrimmed === '' ? undefined : emailTrimmed,
      name: data.name.trim(),
      phone: data.phone.trim(),
      gender: data.gender,
      date_of_birth: data.dateOfBirth?.trim() ? new Date(data.dateOfBirth) : null,
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
          email: apiUser.email || emailTrimmed || '',
          name: data.name.trim(),
          phone: data.phone.trim(),
          role: 'patient' as const,
          password: data.password,
          dateOfBirth: data.dateOfBirth?.trim() ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
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

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  const loadingLabel = language === 'en' ? 'Submitting' : 'ပို့နေသည်';

  const marqueeText =
    language === 'en'
      ? 'ONLINE TELEMED · SECURE INTAKE · DR. TUN MYAT WIN · HIPAA-MINDED · VIDEO CONSULT · '
      : 'အွန်လိုင်းဆွေးနွေး · လုံခြုံမှုအရ မှတ်ပုံတင် · ဒေါက်တာထွန်းမြတ်ဝင်း · ဗီဒီယိုဆွေး · သီးခြားခြုံထား · ';
  const focusRingEz =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

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
            <aside className="sticky top-28 hidden space-y-7 lg:block">
              <Link
                href="/"
                className={`group inline-flex items-center gap-3 rounded-xl text-left ${focusRingEz}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]">
                  <Stethoscope className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <span className="text-balance text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {language === 'en' ? 'Dr. Tun Myat Win' : 'ဒေါက်တာထွန်းမြတ်ဝင်း'}
                </span>
              </Link>

              <p className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {language === 'en' ? 'Online telemedicine' : 'အွန်လိုင်း ဆွေးနွေးကုသမှု'}
              </p>

              <h1 className="text-pretty text-[clamp(1.75rem,4vw,2.85rem)] font-semibold leading-snug tracking-tight text-foreground">
                {language === 'en' ? `${t.auth.signUp}. ` : t.auth.signUp}
                {language === 'en' && (
                  <span className="text-muted-foreground"> stay in rhythm.</span>
                )}
              </h1>

              <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                {language === 'en'
                  ? 'Enter your details to book consultations online.'
                  : 'အွန်လိုင်းဆွေးနွေးမှု စာရင်းသွင်းရန် အချက်အလက် ဖြည့်ပါ။'}
              </p>

              <ul className="space-y-4 text-sm leading-relaxed text-foreground">
                {[tc.moonStrip1, tc.moonStrip2, tc.moonStrip3].map((line) => (
                  <li key={line} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden strokeWidth={2} />
                    <span className="text-pretty">{line}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="w-full lg:max-w-lg xl:max-w-xl">
            <div className="mb-8 text-center lg:hidden">
              <Link
                href="/"
                className={`mx-auto mb-5 inline-flex flex-col items-center gap-2 rounded-xl ${focusRingEz}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                  <Stethoscope className="size-6" strokeWidth={2} aria-hidden />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {language === 'en' ? 'Dr. Tun Myat Win' : 'ဒေါက်တာထွန်းမြတ်ဝင်း'}
                </span>
              </Link>

              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.auth.signUp}</h1>
              <p className="mt-2 text-balance text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Enter your details to book consultations online.'
                  : 'အွန်လိုင်းဆွေးနွေးမှု စာရင်းသွင်းရန် အချက်အလက် ဖြည့်ပါ။'}
              </p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6 text-left text-sm font-medium text-foreground lg:hidden">
                {[tc.moonStrip1, tc.moonStrip2, tc.moonStrip3].map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden strokeWidth={2} />
                    <span className="text-pretty">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6 flex justify-center lg:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className={`rounded-full border-border px-4 py-2 text-sm font-medium shadow-sm ${focusRingEz} cursor-pointer`}
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

                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor="reg-email">
                        {t.auth.email}{' '}
                        <span className="font-normal !text-muted-foreground">{t.auth.emailOptionalHint}</span>
                      </FieldLabel>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="reg-email"
                          {...register('email')}
                          type="email"
                          autoComplete="email"
                          className={CLINICAL_FIELD + ' pl-9'}
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'reg-email-error' : undefined}
                        />
                      </div>
                      <FieldError id="reg-email-error" errors={[errors.email]} />
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="reg-gender">{t.auth.gender}</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger
                                id="reg-gender"
                                className={CLINICAL_SELECT_TRIGGER}
                                aria-invalid={fieldState.invalid}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={CLINICAL_SELECT_POPUP}>
                                <SelectItem value="male">{t.auth.male}</SelectItem>
                                <SelectItem value="female">{t.auth.female}</SelectItem>
                                <SelectItem value="other">{t.auth.other}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                      <Field data-invalid={!!errors.dateOfBirth}>
                        <FieldLabel htmlFor="reg-dob">{t.auth.dateOfBirth}</FieldLabel>
                        <Input
                          id="reg-dob"
                          {...register('dateOfBirth')}
                          type="date"
                          max={todayISO}
                          className={CLINICAL_FIELD}
                          aria-invalid={!!errors.dateOfBirth}
                          aria-describedby={errors.dateOfBirth ? 'reg-dob-error' : undefined}
                        />
                        <FieldError id="reg-dob-error" errors={[errors.dateOfBirth]} />
                      </Field>
                    </div>

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

                    <Controller
                      name="acceptedTerms"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="reg-terms"
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked)}
                              aria-invalid={fieldState.invalid}
                              aria-describedby={fieldState.invalid ? 'reg-terms-error' : undefined}
                              className="mt-1 border-input data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
                            />
                            <FieldLabel
                              htmlFor="reg-terms"
                              className="cursor-pointer leading-snug font-normal text-muted-foreground hover:text-foreground"
                            >
                              {t.auth.termsConsentLabel}
                            </FieldLabel>
                          </div>
                          <FieldError id="reg-terms-error" errors={[fieldState.error]} />
                        </Field>
                      )}
                    />

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
