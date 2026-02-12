'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
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
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage your patient records</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Total Visits</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No patients found</p>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-medium">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            {patient.gender && `${patient.gender.charAt(0).toUpperCase()}${patient.gender.slice(1)}`}
                            {patient.dateOfBirth && ` • ${format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {patient.email}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
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
                        <span className="text-gray-400">No visits yet</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                          className="btn-secondary py-1.5 px-3 text-sm"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/messages?patient=${patient.id}`)}
                          className="btn-primary py-1.5 px-3 text-sm"
                        >
                          Message
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, patients.length)} of {patients.length} patients
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
