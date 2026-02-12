'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Stethoscope, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';

const loginSchema = z.object({
  email: z.string().email('သင့်အီးမေးလ်လိပ်စာထည့်ပါ'),
  password: z.string().min(6, 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    const success = await login(data.email, data.password);

    if (success) {
      router.push('/dashboard');
    } else {
      setError('အီးမေးလ်သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Stethoscope className="w-10 h-10 text-sky-500" />
            <span className="text-2xl font-bold text-gray-900">ဒေါက်တာထွန်းမြတ်ဝင်း</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.welcomeBack}</h1>
          <p className="text-gray-600 mt-2">သင့်အကောင့်သို့ ဝင်ပါ</p>

          <button
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
          </button>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                <span className="text-sm text-gray-600">{t.auth.rememberMe}</span>
              </label>
              <a href="#" className="text-sm text-sky-500 hover:text-sky-600">
                {t.auth.forgotPassword}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t.auth.signIn
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.auth.noAccount}{' '}
              <Link href="/register" className="text-sky-500 hover:text-sky-600 font-medium">
                {t.auth.signUpHere}
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              အစမ်းသုံးမှု: dr.tunmyatwin@gmail.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
