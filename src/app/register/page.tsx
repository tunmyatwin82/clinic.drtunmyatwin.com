'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  name: z.string().min(2, 'အမည်သည် အနည်းဆုံး ၂ လုံးရှိရပါမည်'),
  email: z.string().email('သင့်အီးမေးလ်လိပ်စာထည့်ပါ'),
  phone: z.string().min(9, 'ဖုန်နံပါတ်ထည့်ပါ'),
  password: z.string().min(6, 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်'),
  confirmPassword: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "စကားဝှက်များ တူညီမှုရှိရပါမည်",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addUser } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      // Create user first, then patient
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Also add to local store for immediate use
        const user = {
          id: result.data.user_id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: 'patient' as const,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addUser(user);
        alert('Registration successful! Please login.');
        router.push('/login');
      } else {
        alert('Registration failed: ' + result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Stethoscope className="w-10 h-10 text-sky-500" />
            <span className="text-2xl font-bold text-gray-900">ဒေါက်တာထွန်းမြတ်ဝင်း</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.signUp}</h1>
          <p className="text-gray-600 mt-2">ချိန်းဆိုရန် အကောင့်ပြုလုပ်ပါ</p>

          <button
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
          </button>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.name}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="သင့်အမည်အပြည့်အစုံ"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

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
                {t.auth.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-field pl-10"
                  placeholder="09xxxxxxxxx"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.auth.gender}
                </label>
                <select {...register('gender')} className="input-field">
                  <option value="male">{t.auth.male}</option>
                  <option value="female">{t.auth.female}</option>
                  <option value="other">{t.auth.other}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  မွေးနေ့
                </label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="input-field"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="w-4 h-4 mt-1 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
              <span className="text-sm text-gray-600">
                အသုံးပြုခြင်းစည်းမျဉ်းများနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒကို သဘောတူပါသည်။
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t.auth.signUp
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.auth.haveAccount}{' '}
              <Link href="/login" className="text-sky-500 hover:text-sky-600 font-medium">
                {t.auth.signInHere}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
