export interface User {
  id: string;
  email?: string;
  name: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalHistory?: string[];
  emergencyContact?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  experience: number;
  bio?: string;
  consultationFee: number;
  availableSlots: AvailableSlot[];
  rating: number;
  reviewCount: number;
}

export interface Admin extends User {
  role: 'admin';
  permissions?: string[];
}

export interface AvailableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'video' | 'audio' | 'chat' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: number;
  paymentMethod?: string;
  transactionId?: string;
  healthRecords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string;
  prescription?: Prescription[];
  advice?: string;
  followUpDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
  transcript?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  method: 'kbzpay' | 'wave' | 'ayapay' | 'cash' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentUrl?: string;
  screenshotUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'message' | 'system';
  read: boolean;
  createdAt: Date;
}
