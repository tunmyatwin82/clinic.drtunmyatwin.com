'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Clock,
  Video,
  ArrowRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, appointments, getAppointments } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  const stats = useMemo(() => {
    if (!currentUser) {
      return {
        totalAppointments: 0,
        completedConsultations: 0,
        upcomingAppointments: 0,
        totalPatients: 0,
      };
    }
    const userAppointments = getAppointments(currentUser.id, currentUser.role as 'patient' | 'doctor');
    const completed = userAppointments.filter(a => a.status === 'completed').length;
    const upcoming = userAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
    return {
      totalAppointments: userAppointments.length,
      completedConsultations: completed,
      upcomingAppointments: upcoming,
      totalPatients: Math.max(1, new Set(userAppointments.map(a => a.patientId)).size),
    };
  }, [currentUser, getAppointments]);

  const upcomingAppointments = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const statCards = [
    {
      label: t.dashboard.stats.totalAppointments,
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-sky-500',
    },
    {
      label: t.dashboard.stats.completed,
      value: stats.completedConsultations,
      icon: Video,
      color: 'bg-emerald-500',
    },
    {
      label: t.dashboard.stats.upcoming,
      value: stats.upcomingAppointments,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      label: t.dashboard.stats.totalPatients,
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.dashboard}</h1>
          <p className="text-muted-foreground">{t.dashboard.welcomeUser.replace('{name}', currentUser.name)}</p>
        </div>
        <Link href="/booking" className="btn-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t.dashboard.newAppointment}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{t.dashboard.upcomingAppointments}</h2>
            <Link href="/dashboard/appointments" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              {t.dashboard.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">{t.dashboard.noUpcoming}</p>
                <Link href="/booking" className="btn-primary mt-4 inline-block">
                  {t.dashboard.bookNow}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {currentUser.role === 'patient' ? t.dashboard.doctorLabel : t.dashboard.patientLabel}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.startTime}
                      </p>
                    </div>
                    <span className={`badge ${
                      appointment.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {appointment.status === 'confirmed'
                        ? t.appointments.filter.confirmed
                        : t.appointments.filter.pending}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-foreground">{t.dashboard.quickActions}</h2>
          </div>
          <div className="card-body">
            <div className="grid gap-4">
              <Link
                href="/booking"
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.dashboard.quickActionBook}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.quickActionBookDesc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-400" />
              </Link>

              <Link
                href="/dashboard/messages"
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.dashboard.quickActionMessages}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.quickActionMessagesDesc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </Link>

              <Link
                href="/dashboard/appointments"
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.dashboard.quickActionHistory}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.quickActionHistoryDesc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.dashboard.quickActionBilling}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.quickActionBillingDesc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-foreground">{t.dashboard.healthTips}</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
              <h3 className="font-semibold text-sky-200 mb-2">{t.dashboard.healthTip1Title}</h3>
              <p className="text-sm text-sky-100/90">{t.dashboard.healthTip1Body}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h3 className="font-semibold text-emerald-200 mb-2">{t.dashboard.healthTip2Title}</h3>
              <p className="text-sm text-emerald-100/90">{t.dashboard.healthTip2Body}</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="font-semibold text-amber-200 mb-2">{t.dashboard.healthTip3Title}</h3>
              <p className="text-sm text-amber-100/90">{t.dashboard.healthTip3Body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
