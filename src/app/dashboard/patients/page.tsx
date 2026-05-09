'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Users,
  Search,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Patient } from '@/types';
import { useLanguage } from '@/lib/LanguageContext';

export default function PatientsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, appointments, getUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/patients');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const patients: (Patient & { appointmentCount: number; lastVisit?: Date })[] = appointments
    .filter(a => a.doctorId === currentUser.id)
    .reduce((acc, appointment) => {
      const patientId = appointment.patientId;
      if (!acc.find(p => p.id === patientId)) {
        const patient = getUser(patientId);
        if (patient && patient.role === 'patient') {
          acc.push({
            ...(patient as Patient),
            appointmentCount: appointments.filter(a => a.patientId === patientId).length,
            lastVisit: appointments
              .filter(a => a.patientId === patientId && a.status === 'completed')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date,
          });
        }
      }
      return acc;
    }, [] as (Patient & { appointmentCount: number; lastVisit?: Date })[])
    .filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      patient.phone.includes(searchTerm)
    );

  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.patients.title}</h1>
          <p className="text-muted-foreground">{t.patients.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.patients.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t.patients.columns.patient}</th>
                <th>{t.patients.columns.contact}</th>
                <th>{t.patients.columns.totalVisits}</th>
                <th>{t.patients.columns.lastVisit}</th>
                <th>{t.patients.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.patients.noPatientsFound}</p>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.gender && `${patient.gender.charAt(0).toUpperCase()}${patient.gender.slice(1)}`}
                            {patient.dateOfBirth && ` • ${format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {patient.email}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {patient.phone}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{patient.appointmentCount}</span>
                    </td>
                    <td>
                      {patient.lastVisit ? (
                        <span>{format(new Date(patient.lastVisit), 'MMM d, yyyy')}</span>
                      ) : (
                        <span className="text-muted-foreground">{t.patients.noVisits}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                          className="btn-secondary py-1.5 px-3 text-sm"
                        >
                          {t.patients.viewProfile}
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/messages?patient=${patient.id}`)}
                          className="btn-primary py-1.5 px-3 text-sm"
                        >
                          {t.patients.message}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t.patients.showingRange
                .replace('{from}', String((currentPage - 1) * itemsPerPage + 1))
                .replace('{to}', String(Math.min(currentPage * itemsPerPage, patients.length)))
                .replace('{total}', String(patients.length))}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-border bg-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                {t.patients.pageOf
                  .replace('{current}', String(currentPage))
                  .replace('{total}', String(totalPages))}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-border bg-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
