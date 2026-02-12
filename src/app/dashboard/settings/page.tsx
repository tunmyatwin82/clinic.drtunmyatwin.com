'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings</p>
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
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600 hover:bg-gray-50'
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
                <h2 className="font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-sky-600 font-bold">{currentUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <button type="button" className="btn-secondary flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select {...register('gender')} className="input-field">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {saveSuccess && (
                    <p className="text-emerald-600 text-sm">Changes saved successfully!</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary ml-auto flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose how you want to be notified</p>
              </div>
              <div className="card-body space-y-6">
                {[
                  { id: 'appointments', label: 'Appointment Reminders', desc: 'Get reminded about upcoming appointments' },
                  { id: 'messages', label: 'New Messages', desc: 'Get notified when you receive new messages' },
                  { id: 'results', label: 'Medical Results', desc: 'Get notified when your results are ready' },
                  { id: 'promotions', label: 'Health Tips', desc: 'Receive health tips and updates' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-500">Manage your password and security</p>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button className="btn-primary">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-900">Billing & Payments</h2>
                <p className="text-sm text-gray-500">Manage your payment methods and history</p>
              </div>
              <div className="card-body">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Payment Methods</h3>
                    <button className="btn-secondary py-1.5 px-3 text-sm">Add New</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                      <div className="w-12 h-8 bg-sky-100 rounded flex items-center justify-center text-sky-600 font-bold text-sm">
                        KBZ
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">KBZPay</p>
                        <p className="text-sm text-gray-500">•••• 4567</p>
                      </div>
                      <span className="badge badge-success">Default</span>
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
