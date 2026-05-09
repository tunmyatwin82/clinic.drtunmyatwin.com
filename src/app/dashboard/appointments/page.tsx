'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Search,
  CreditCard,
  FileText,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Appointment } from '@/types';
import { useLanguage } from '@/lib/LanguageContext';

type ApptFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, appointments, updateAppointment, getUser, payments } = useAppStore();
  const [filter, setFilter] = useState<ApptFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHealthRecordsModal, setShowHealthRecordsModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/appointments');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const statusLabel = (status: string) => {
    const f = t.appointments.filter;
    if (status in f) return f[status as keyof typeof f];
    return status;
  };

  const consultationTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return t.booking.videoConsultation;
      case 'audio':
        return t.booking.audioConsultation;
      case 'chat':
        return t.booking.chatConsultation;
      default:
        return type;
    }
  };

  const filterStatuses: ApptFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  const userAppointments = appointments
    .filter(a => {
      if (filter === 'all') return true;
      return a.status === filter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'chat': return MessageCircle;
      default: return Video;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getPaymentForAppointment = (appointmentId: string) => {
    return payments.find(p => p.appointmentId === appointmentId);
  };

  const handleViewPayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handleViewHealthRecords = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowHealthRecordsModal(true);
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'confirmed' });
  };

  const handleRejectAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'cancelled' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.appointments.title}</h1>
          <p className="text-muted-foreground">{t.appointments.subtitle}</p>
        </div>
        {currentUser.role === 'patient' && (
          <button
            onClick={() => router.push('/booking')}
            className="btn-primary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {t.appointments.newAppointment}
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            {filterStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {t.appointments.filter[status]}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.appointments.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t.appointments.columns.dateTime}</th>
                <th>{t.appointments.columns.type}</th>
                <th>{currentUser.role === 'patient' ? t.appointments.columns.doctor : t.appointments.columns.patient}</th>
                <th>{t.appointments.columns.reason}</th>
                <th>{t.appointments.columns.status}</th>
                <th>{t.appointments.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {userAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.appointments.noAppointments}</p>
                  </td>
                </tr>
              ) : (
                userAppointments.map((appointment) => {
                  const otherUser = getUser(
                    currentUser.role === 'patient' ? appointment.doctorId : appointment.patientId
                  );
                  const TypeIcon = getTypeIcon(appointment.type);
                  const payment = getPaymentForAppointment(appointment.id);

                  return (
                    <tr key={appointment.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(appointment.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-primary" />
                          <span className="capitalize">{consultationTypeLabel(appointment.type)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{otherUser?.name || t.appointments.unknown}</div>
                      </td>
                      <td>
                        <div className="max-w-xs truncate">{appointment.reason}</div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(appointment.status)}`}>
                          {statusLabel(appointment.status)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          {payment && payment.screenshotUrl && (
                            <button
                              onClick={() => handleViewPayment(appointment)}
                              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1"
                              title={t.appointments.paymentSlip}
                            >
                              <CreditCard className="w-4 h-4" />
                              {t.appointments.payment}
                            </button>
                          )}
                          {appointment.healthRecords && appointment.healthRecords.length > 0 && (
                            <button
                              onClick={() => handleViewHealthRecords(appointment)}
                              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1"
                              title={t.appointments.healthRecords}
                            >
                              <FileText className="w-4 h-4" />
                              {t.appointments.records}
                            </button>
                          )}
                          {appointment.status === 'confirmed' && appointment.type === 'video' && (
                            <button
                              onClick={() => router.push(`/consultation/${appointment.id}`)}
                              className="btn-primary py-1.5 px-3 text-sm"
                            >
                              {t.appointments.joinCall}
                            </button>
                          )}
                          {currentUser.role === 'doctor' && appointment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmAppointment(appointment.id)}
                                className="btn-success py-1.5 px-3 text-sm flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {t.appointments.confirm}
                              </button>
                              <button
                                onClick={() => handleRejectAppointment(appointment.id)}
                                className="btn-danger py-1.5 px-3 text-sm flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                {t.appointments.reject}
                              </button>
                            </>
                          )}
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && currentUser.role === 'patient' && (
                            <button
                              onClick={() => updateAppointment(appointment.id, { status: 'cancelled' })}
                              className="btn-danger py-1.5 px-3 text-sm"
                            >
                              {t.appointments.cancel}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Slip Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-border shadow-clinical">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">{t.appointments.paymentSlip}</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const payment = getPaymentForAppointment(selectedAppointment.id);
                return payment?.screenshotUrl ? (
                  <img
                    src={payment.screenshotUrl}
                    alt="Payment Slip"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t.appointments.noPaymentSlip}</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Health Records Modal */}
      {showHealthRecordsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-border shadow-clinical">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">{t.appointments.healthRecords}</h3>
              <button
                onClick={() => setShowHealthRecordsModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              {selectedAppointment.healthRecords && selectedAppointment.healthRecords.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {selectedAppointment.healthRecords.map((record: string, index: number) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      {record.startsWith('data:image') ? (
                        <img
                          src={record}
                          alt={`Health record ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 bg-muted flex items-center justify-center">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t.appointments.noHealthRecords}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
