'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Video,
  ArrowRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '@/store';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, appointments, getAppointments } = useAppStore();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedConsultations: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (currentUser) {
      const userAppointments = getAppointments(currentUser.id, currentUser.role as 'patient' | 'doctor');
      
      const completed = userAppointments.filter(a => a.status === 'completed').length;
      const upcoming = userAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
      
      setStats({
        totalAppointments: userAppointments.length,
        completedConsultations: completed,
        upcomingAppointments: upcoming,
        totalPatients: Math.max(1, new Set(userAppointments.map(a => a.patientId)).size),
      });
    }
  }, [currentUser, isAuthenticated, getAppointments, router]);

  const upcomingAppointments = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-sky-500',
    },
    {
      label: 'Completed',
      value: stats.completedConsultations,
      icon: Video,
      color: 'bg-emerald-500',
    },
    {
      label: 'Upcoming',
      value: stats.upcomingAppointments,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {currentUser.name}</p>
        </div>
        <Link href="/booking" className="btn-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          New Appointment
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
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-sky-500 hover:text-sky-600 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/booking" className="btn-primary mt-4 inline-block">
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-sky-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {currentUser.role === 'patient' ? 'Dr. Tun Myat Win' : 'Patient'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.startTime}
                      </p>
                    </div>
                    <span className={`badge ${
                      appointment.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid gap-4">
              <Link
                href="/booking"
                className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Book Consultation</p>
                  <p className="text-sm text-gray-500">Schedule a new appointment</p>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-500" />
              </Link>

              <Link
                href="/dashboard/messages"
                className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Messages</p>
                  <p className="text-sm text-gray-500">Chat with your doctor</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-500" />
              </Link>

              <Link
                href="/dashboard/appointments"
                className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Appointment History</p>
                  <p className="text-sm text-gray-500">View past consultations</p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-500" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Billing & Payments</p>
                  <p className="text-sm text-gray-500">Manage your payments</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Health Tips</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-sky-50 rounded-xl">
              <h3 className="font-semibold text-sky-800 mb-2">Stay Hydrated</h3>
              <p className="text-sm text-sky-700">Drink at least 8 glasses of water daily for optimal health.</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <h3 className="font-semibold text-emerald-800 mb-2">Regular Exercise</h3>
              <p className="text-sm text-emerald-700">30 minutes of moderate exercise most days of the week.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <h3 className="font-semibold text-amber-800 mb-2">Quality Sleep</h3>
              <p className="text-sm text-amber-700">Aim for 7-9 hours of sleep each night for best results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
