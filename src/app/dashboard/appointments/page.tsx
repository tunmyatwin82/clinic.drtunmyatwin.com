'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { healthRecordLabel, isImageDataUrl } from '@/lib/booking-files';

type ApptFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
type ConsultationChannel = NonNullable<Appointment['consultationChannel']>;

const consultationChannels: ConsultationChannel[] = [
  'zoom',
  'telegram',
  'viber',
  'messenger',
  'phone',
  'in-app',
];

function parseFilterParam(raw: string | null): ApptFilter {
  if (raw === 'pending' || raw === 'confirmed' || raw === 'completed' || raw === 'cancelled') {
    return raw;
  }
  return 'all';
}

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const {
    currentUser,
    isAuthenticated,
    updateAppointment,
    confirmAppointment,
    getAppointments,
    getUser,
    payments,
  } = useAppStore();
  const [filter, setFilter] = useState<ApptFilter>(() =>
    parseFilterParam(searchParams.get('filter')),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHealthRecordsModal, setShowHealthRecordsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState<string | null>(null);
  const [confirmChannel, setConfirmChannel] = useState<ConsultationChannel>('zoom');
  const [confirmLink, setConfirmLink] = useState('');
  const [confirmInstructions, setConfirmInstructions] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/appointments');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setFilter(parseFilterParam(searchParams.get('filter')));
  }, [searchParams]);

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

  const consultationChannelLabel = (channel: ConsultationChannel) => {
    switch (channel) {
      case 'zoom':
        return 'Zoom';
      case 'telegram':
        return 'Telegram';
      case 'viber':
        return 'Viber';
      case 'messenger':
        return 'Messenger';
      case 'phone':
        return t.booking.audioConsultation;
      case 'in-app':
        return t.appointments.joinCall;
      default:
        return channel;
    }
  };

  const filterStatuses: ApptFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  const canManageAppointments =
    currentUser.role === 'doctor' || currentUser.role === 'admin';

  const roleAppointments = getAppointments(
    currentUser.id,
    currentUser.role as 'patient' | 'doctor' | 'admin',
  );

  const userAppointments = roleAppointments
    .filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!searchTerm.trim()) return true;
      const otherId = currentUser.role === 'patient' ? a.doctorId : a.patientId;
      const other = getUser(otherId);
      const q = searchTerm.toLowerCase();
      return (
        other?.name.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q) ||
        consultationTypeLabel(a.type).toLowerCase().includes(q)
      );
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

  const handleConfirmAppointment = (appointment: Appointment) => {
    setConfirmingAppointmentId(appointment.id);
    setConfirmChannel(appointment.consultationChannel ?? 'zoom');
    setConfirmLink(appointment.consultationLink ?? '');
    setConfirmInstructions(appointment.consultationInstructions ?? '');
    setShowConfirmModal(true);
  };

  const submitConfirmAppointment = () => {
    if (!confirmingAppointmentId) return;
    const trimmedLink = confirmLink.trim();
    if (confirmChannel !== 'in-app' && !trimmedLink) {
      alert('ဆွေးနွေးမှု link သို့မဟုတ် contact ကို ထည့်ပေးပါ။');
      return;
    }

    confirmAppointment(confirmingAppointmentId, {
      consultationChannel: confirmChannel,
      consultationLink: trimmedLink || undefined,
      consultationInstructions: confirmInstructions.trim() || undefined,
    });
    setShowConfirmModal(false);
    setConfirmingAppointmentId(null);
  };

  const handleRejectAppointment = (appointmentId: string) => {
    if (!window.confirm('ဤချိန်းဆိုမှုကို ငြင်းပယ်မလား?')) {
      return;
    }
    updateAppointment(appointmentId, { status: 'cancelled', paymentStatus: 'pending' });
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

      {canManageAppointments && (
        <p className="rounded-xl border border-primary-500/25 bg-primary-500/10 px-4 py-3 text-sm text-primary-200">
          {t.appointments.staffHint}
        </p>
      )}

      {currentUser.role === 'patient' && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {t.appointments.pendingPatientHint}
        </p>
      )}

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
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${getStatusBadge(appointment.status)}`}>
                            {statusLabel(appointment.status)}
                          </span>
                          {currentUser.role === 'patient' && appointment.status === 'pending' && (
                            <span className="text-xs text-amber-300/90">{t.appointments.pendingPatientHint}</span>
                          )}
                          {currentUser.role === 'patient' && appointment.status === 'confirmed' && (
                            <span className="text-xs text-emerald-300/90">{t.appointments.confirmedPatientHint}</span>
                          )}
                          {appointment.consultationChannel && (
                            <span className="text-xs text-slate-400">
                              {t.appointments.consultationChannel}: {consultationChannelLabel(appointment.consultationChannel)}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {appointment.paymentStatus === 'paid'
                              ? t.appointments.paymentPaid
                              : t.appointments.paymentPending}
                          </span>
                        </div>
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
                          {appointment.status === 'confirmed' && appointment.consultationLink && (
                            <a
                              href={appointment.consultationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary py-1.5 px-3 text-sm"
                            >
                              {t.appointments.openConsultationLink}
                            </a>
                          )}
                          {appointment.status === 'confirmed' &&
                            appointment.type === 'video' &&
                            (appointment.consultationChannel === 'in-app' ||
                              !appointment.consultationChannel) &&
                            !appointment.consultationLink && (
                            <button
                              onClick={() => router.push(`/consultation/${appointment.id}`)}
                              className="btn-primary py-1.5 px-3 text-sm"
                            >
                              {t.appointments.joinCall}
                            </button>
                            )}
                          {canManageAppointments && appointment.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleConfirmAppointment(appointment)}
                                className="btn-success flex items-center gap-1 px-3 py-1.5 text-sm"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {t.appointments.confirm}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectAppointment(appointment.id)}
                                className="btn-danger flex items-center gap-1 px-3 py-1.5 text-sm"
                              >
                                <XCircle className="h-4 w-4" />
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
                      {isImageDataUrl(record) ? (
                        <img
                          src={record}
                          alt={healthRecordLabel(record, index)}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="flex h-48 flex-col items-center justify-center gap-2 bg-muted px-3">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                          <span className="text-center text-sm text-muted-foreground line-clamp-2">
                            {healthRecordLabel(record, index)}
                          </span>
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

      {/* Confirm Appointment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-clinical">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-bold text-foreground">{t.appointments.setConsultationDetails}</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t.appointments.consultationChannel}
                </label>
                <select
                  value={confirmChannel}
                  onChange={(e) => setConfirmChannel(e.target.value as ConsultationChannel)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
                >
                  {consultationChannels.map((channel) => (
                    <option key={channel} value={channel}>
                      {consultationChannelLabel(channel)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t.appointments.consultationLink}
                </label>
                <input
                  value={confirmLink}
                  onChange={(e) => setConfirmLink(e.target.value)}
                  placeholder="https://zoom.us/j/... / t.me/... / viber link / phone"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t.appointments.consultationInstructions}
                </label>
                <textarea
                  value={confirmInstructions}
                  onChange={(e) => setConfirmInstructions(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-6">
              <button onClick={() => setShowConfirmModal(false)} className="btn-secondary px-4 py-2">
                {t.appointments.cancel}
              </button>
              <button onClick={submitConfirmAppointment} className="btn-success px-4 py-2">
                {t.appointments.saveAndConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
