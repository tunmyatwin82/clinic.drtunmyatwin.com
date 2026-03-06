import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Patient, Doctor, Admin, Appointment, Consultation, Payment, Message, Notification, Prescription } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  users: (Patient | Doctor | Admin)[];
  appointments: Appointment[];
  consultations: Consultation[];
  payments: Payment[];
  messages: Message[];
  notifications: Notification[];

  currentUser: User | null;
  isAuthenticated: boolean;

  addUser: (user: Patient | Doctor | Admin) => void;
  updateUser: (id: string, data: Partial<Patient | Doctor | Admin>) => void;
  getUser: (id: string) => Patient | Doctor | Admin | undefined;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;

  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  getAppointments: (userId: string, role: 'patient' | 'doctor') => Appointment[];

  createConsultation: (data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => Consultation;
  updateConsultation: (id: string, data: Partial<Consultation>) => void;

  createPayment: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  updatePayment: (id: string, data: Partial<Payment>) => void;

  sendMessage: (data: Omit<Message, 'id' | 'createdAt'>) => void;
  getMessages: (userId1: string, userId2: string) => Message[];

  addNotification: (data: Omit<Notification, 'id' | 'createdAt'>) => void;
  getNotifications: (userId: string) => Notification[];
  markNotificationRead: (id: string) => void;

  getDoctors: () => Doctor[];
  getDoctor: (id: string) => Doctor | undefined;
}

const defaultUsers: (Patient | Doctor | Admin)[] = [
  {
    id: 'dr-1',
    email: 'dr.tunmyatwin@gmail.com',
    name: 'Dr. Tun Myat Win',
    phone: '0942068582',
    role: 'doctor',
    password: 'demo123',
    specialization: 'Male Reproductive Health & Neurology',
    licenseNumber: 'MM123456',
    experience: 15,
    bio: 'Specialist in male reproductive health and nervous system disorders with over 15 years of experience. Graduated from University of Medicine 1, Yangon.',
    consultationFee: 15000,
    rating: 4.9,
    reviewCount: 1250,
    availableSlots: [
      { id: 'slot-1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { id: 'slot-2', dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isAvailable: true },
      { id: 'slot-3', dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { id: 'slot-4', dayOfWeek: 2, startTime: '14:00', endTime: '17:00', isAvailable: true },
      { id: 'slot-5', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { id: 'slot-6', dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { id: 'slot-7', dayOfWeek: 5, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { id: 'slot-8', dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isAvailable: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'admin-1',
    email: 'admin@clinic.com',
    name: 'Admin User',
    phone: '09123456789',
    role: 'admin',
    password: 'demo123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'patient-1',
    email: 'patient@example.com',
    name: 'John Doe',
    phone: '09987654321',
    role: 'patient',
    password: 'demo123',
    gender: 'male',
    dateOfBirth: new Date('1990-01-15'),
    address: 'Yangon, Myanmar',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      appointments: [],
      consultations: [],
      payments: [],
      messages: [],
      notifications: [],
      currentUser: null,
      isAuthenticated: false,

      addUser: (user) => set((state) => ({
        users: [...state.users, user],
      })),

      updateUser: (id, data) => set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, ...data } as Patient | Doctor | Admin : u
        ),
      })),

      getUser: (id) => get().users.find((u) => u.id === id),

      login: async (emailOrPhone, password) => {
        // First check local store
        const localUser = get().users.find((u) => u.email === emailOrPhone || u.phone === emailOrPhone);
        if (localUser && localUser.password === password) {
          set({ currentUser: localUser, isAuthenticated: true });
          return true;
        }

        // Then check database via API
        try {
          const response = await fetch('/api/auth/[...nextauth]', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailOrPhone,
              password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              // Add user to local store
              const userToAdd = {
                ...data.user,
                password,
              };
              set((state) => ({
                users: [...state.users, userToAdd],
                currentUser: userToAdd,
                isAuthenticated: true,
              }));
              return true;
            }
          }
        } catch (error) {
          console.error('Login API error:', error);
        }

        return false;
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),

      createAppointment: (data) => {
        const appointment: Appointment = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          appointments: [...state.appointments, appointment],
        }));

        get().addNotification({
          userId: data.doctorId,
          title: 'New Appointment',
          message: `New appointment request from patient`,
          type: 'appointment',
          read: false,
        });

        return appointment;
      },

      updateAppointment: (id, data) => set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
        ),
      })),

      getAppointments: (userId, role) => {
        if (role === 'patient') {
          return get().appointments.filter((a) => a.patientId === userId);
        }
        return get().appointments.filter((a) => a.doctorId === userId);
      },

      createConsultation: (data) => {
        const consultation: Consultation = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          consultations: [...state.consultations, consultation],
        }));
        return consultation;
      },

      updateConsultation: (id, data) => set((state) => ({
        consultations: state.consultations.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
        ),
      })),

      createPayment: (data) => {
        const payment: Payment = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          payments: [...state.payments, payment],
        }));
        return payment;
      },

      updatePayment: (id, data) => set((state) => ({
        payments: state.payments.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
        ),
      })),

      sendMessage: (data) => {
        const message: Message = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      getMessages: (userId1, userId2) => {
        return get().messages.filter(
          (m) =>
            (m.senderId === userId1 && m.receiverId === userId2) ||
            (m.senderId === userId2 && m.receiverId === userId1)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      addNotification: (data) => {
        const notification: Notification = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      getNotifications: (userId) => {
        return get().notifications.filter((n) => n.userId === userId);
      },

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      getDoctors: () => get().users.filter((u): u is Doctor => u.role === 'doctor') as Doctor[],

      getDoctor: (id) => get().users.find((u): u is Doctor => u.id === id && u.role === 'doctor'),
    }),
    {
      name: 'clinic-storage',
    }
  )
);
