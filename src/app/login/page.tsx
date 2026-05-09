'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Stethoscope, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

function buildLoginSchema(messages: { identifier: string; password: string }) {
  return z.object({
    emailOrPhone: z.string().trim().min(1, messages.identifier),
    password: z.string().min(6, messages.password),
    rememberMe: z.boolean().optional(),
  });
}

type LoginForm = z.infer<ReturnType<typeof buildLoginSchema>>;

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

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const redirectAfterLogin = getSafeRedirectParam(searchParams.get('redirect'));

  const registerHref =
    redirectAfterLogin && redirectAfterLogin !== '/dashboard'
      ? `/register?redirect=${encodeURIComponent(redirectAfterLogin)}`
      : '/register';

  const loginSchema = useMemo(
    () =>
      buildLoginSchema({
        identifier: t.auth.validationLoginIdentifier,
        password: t.auth.validationPasswordMin,
      }),
    [t.auth.validationLoginIdentifier, t.auth.validationPasswordMin],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const loadingLabel = language === 'en' ? 'Signing in' : 'ဝင်ရောက်နေပါသည်';

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await login(data.emailOrPhone, data.password);
      if (success) {
        router.push(redirectAfterLogin);
      } else {
        setError(t.auth.loginInvalidCredentials);
      }
    } catch (e) {
      console.error('Login error:', e);
      setError(t.auth.loginUnexpectedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-mesh flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="group mb-6 inline-flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/25 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.25,0.64,1)] motion-safe:group-hover:scale-105">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {language === 'en' ? 'Dr. Tun Myat Win' : 'ဒေါက်တာထွန်းမြတ်ဝင်း'}
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t.auth.welcomeBack}</h1>
          <p className="mt-2 text-balance text-muted-foreground">{t.auth.signInSubtitle}</p>

          <Button
            type="button"
            variant="outline"
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="mt-4 rounded-xl border border-border bg-card/80 shadow-md backdrop-blur-md hover:bg-card hover:shadow-lg"
          >
            <Globe className="text-muted-foreground" aria-hidden />
            {language === 'en' ? 'မြန်မာ' : 'English'}
          </Button>
        </div>

        <Card className="border border-border bg-card/95 shadow-[var(--clinical-shadow)] backdrop-blur-md">
          <CardContent className="pt-6">
            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-0">
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={!!errors.emailOrPhone}>
                  <FieldLabel htmlFor="login-id">{t.auth.emailOrPhoneLabel}</FieldLabel>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="login-id"
                      {...register('emailOrPhone')}
                      type="text"
                      autoComplete="username"
                      className="pl-9"
                      placeholder={t.auth.emailOrPhonePlaceholder}
                      aria-invalid={!!errors.emailOrPhone}
                      aria-describedby={errors.emailOrPhone ? 'login-id-error' : undefined}
                    />
                  </div>
                  <FieldError id="login-id-error" errors={[errors.emailOrPhone]} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="login-password">{t.auth.password}</FieldLabel>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="login-password"
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pr-10 pl-9"
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'login-password-error' : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <FieldError id="login-password-error" errors={[errors.password]} />
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="login-remember"
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                          className="mt-0.5"
                        />
                        <FieldLabel htmlFor="login-remember" className="cursor-pointer font-normal text-muted-foreground">
                          {t.auth.rememberMe}
                        </FieldLabel>
                      </div>
                    )}
                  />
                  <a
                    href="#"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    {t.auth.forgotPassword}
                  </a>
                </div>

                <Button
                  type="submit"
                  form="login-form"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="size-4 text-primary-foreground" aria-hidden />
                      <span className="sr-only">{loadingLabel}</span>
                    </>
                  ) : (
                    t.auth.signIn
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 border-t border-border/60 bg-transparent py-6">
            <p className="text-center text-sm text-muted-foreground">
              {t.auth.noAccount}{' '}
              <Link href={registerHref} className="font-medium text-primary underline-offset-4 hover:underline">
                {t.auth.signUpHere}
              </Link>
            </p>
            <p className="border-border/60 border-t pt-6 text-center text-xs text-muted-foreground">
              {t.auth.demoAccountsHint}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-app-mesh flex flex-col items-center justify-center gap-3 p-4">
          <Spinner className="size-10 text-clinical-primary" />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
