'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Bell,
  CreditCard,
  Shield,
  Save,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Patient } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/lib/LanguageContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(9, 'Please enter a valid phone number'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, updateUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/settings');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (currentUser) {
      const patient = currentUser as Patient;
      reset({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    
    if (currentUser) {
      updateUser(currentUser.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: t.settings.tabs.profile, icon: User },
    { id: 'notifications', label: t.settings.tabs.notifications, icon: Bell },
    { id: 'security', label: t.settings.tabs.security, icon: Shield },
    { id: 'billing', label: t.settings.tabs.billing, icon: CreditCard },
  ];

  const notifItems = [
    { id: 'appointments', ...t.settings.notif.appointments },
    { id: 'messages', ...t.settings.notif.messages },
    { id: 'results', ...t.settings.notif.results },
    { id: 'promotions', ...t.settings.notif.promotions },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="card p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-foreground">{t.settings.profileInfo}</h2>
                <p className="text-sm text-muted-foreground">{t.settings.updatePersonal}</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-primary font-bold">{currentUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <button type="button" className="btn-secondary flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t.settings.uploadPhoto}
                    </button>
                    <p className="text-sm text-muted-foreground mt-2">{t.settings.uploadInfo}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.auth.name}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('name')}
                        type="text"
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.auth.email}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('email')}
                        type="email"
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.auth.phone}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.auth.dateOfBirth}
                    </label>
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.auth.gender}
                    </label>
                    <select {...register('gender')} className="input-field">
                      <option value="">{t.settings.selectGender}</option>
                      <option value="male">{t.auth.male}</option>
                      <option value="female">{t.auth.female}</option>
                      <option value="other">{t.auth.other}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {saveSuccess && (
                    <p className="text-emerald-400 text-sm">{t.settings.saveSuccess}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary ml-auto flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? t.settings.saving : t.settings.saveChanges}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-foreground">{t.settings.notificationsTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.settings.notificationsSubtitle}</p>
              </div>
              <div className="card-body space-y-6">
                {notifItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-foreground">{t.settings.securityTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.settings.securitySubtitle}</p>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">{t.settings.changePassword}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t.settings.currentPassword}
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t.settings.newPassword}
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t.settings.confirmNewPassword}
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <button className="btn-primary">{t.settings.updatePassword}</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-foreground">{t.settings.billingTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.settings.billingSubtitle}</p>
              </div>
              <div className="card-body">
                <div className="bg-muted rounded-xl p-6 mb-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">{t.settings.paymentMethods}</h3>
                    <button className="btn-secondary py-1.5 px-3 text-sm">{t.settings.addNew}</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
                      <div className="w-12 h-8 bg-primary/20 rounded flex items-center justify-center text-primary font-bold text-sm">
                        KBZ
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">KBZPay</p>
                        <p className="text-sm text-muted-foreground">•••• 4567</p>
                      </div>
                      <span className="badge badge-success">{t.settings.default}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
