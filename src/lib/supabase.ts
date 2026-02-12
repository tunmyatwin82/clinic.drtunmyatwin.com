import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    phone: string;
                    role: 'patient' | 'doctor' | 'admin';
                    gender?: 'male' | 'female' | 'other';
                    date_of_birth?: string;
                    address?: string;
                    avatar_url?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    phone: string;
                    role?: 'patient' | 'doctor' | 'admin';
                    gender?: 'male' | 'female' | 'other';
                    date_of_birth?: string;
                    address?: string;
                    avatar_url?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    phone?: string;
                    role?: 'patient' | 'doctor' | 'admin';
                    gender?: 'male' | 'female' | 'other';
                    date_of_birth?: string;
                    address?: string;
                    avatar_url?: string;
                    updated_at?: string;
                };
            };
            patients: {
                Row: {
                    id: string;
                    user_id: string;
                    emergency_contact?: string;
                    blood_type?: string;
                    allergies?: string[];
                    medical_conditions?: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    emergency_contact?: string;
                    blood_type?: string;
                    allergies?: string[];
                    medical_conditions?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    emergency_contact?: string;
                    blood_type?: string;
                    allergies?: string[];
                    medical_conditions?: string[];
                    updated_at?: string;
                };
            };
            doctors: {
                Row: {
                    id: string;
                    user_id: string;
                    specialization: string;
                    qualifications?: string[];
                    experience_years?: number;
                    consultation_fee: number;
                    available_days?: string[];
                    available_hours?: { start: string; end: string };
                    bio?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    specialization: string;
                    qualifications?: string[];
                    experience_years?: number;
                    consultation_fee: number;
                    available_days?: string[];
                    available_hours?: { start: string; end: string };
                    bio?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    specialization?: string;
                    qualifications?: string[];
                    experience_years?: number;
                    consultation_fee?: number;
                    available_days?: string[];
                    available_hours?: { start: string; end: string };
                    bio?: string;
                    updated_at?: string;
                };
            };
            appointments: {
                Row: {
                    id: string;
                    patient_id: string;
                    doctor_id: string;
                    date: string;
                    start_time: string;
                    end_time: string;
                    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
                    type: 'video' | 'audio' | 'chat';
                    notes?: string;
                    symptoms?: string;
                    diagnosis?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    doctor_id: string;
                    date: string;
                    start_time: string;
                    end_time: string;
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
                    type?: 'video' | 'audio' | 'chat';
                    notes?: string;
                    symptoms?: string;
                    diagnosis?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    date?: string;
                    start_time?: string;
                    end_time?: string;
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
                    type?: 'video' | 'audio' | 'chat';
                    notes?: string;
                    symptoms?: string;
                    diagnosis?: string;
                    updated_at?: string;
                };
            };
            prescriptions: {
                Row: {
                    id: string;
                    appointment_id: string;
                    patient_id: string;
                    doctor_id: string;
                    medications: {
                        name: string;
                        dosage: string;
                        frequency: string;
                        duration: string;
                        instructions?: string;
                    }[];
                    notes?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    appointment_id: string;
                    patient_id: string;
                    doctor_id: string;
                    medications: {
                        name: string;
                        dosage: string;
                        frequency: string;
                        duration: string;
                        instructions?: string;
                    }[];
                    notes?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    medications?: {
                        name: string;
                        dosage: string;
                        frequency: string;
                        duration: string;
                        instructions?: string;
                    }[];
                    notes?: string;
                    updated_at?: string;
                };
            };
            medical_records: {
                Row: {
                    id: string;
                    patient_id: string;
                    doctor_id: string;
                    appointment_id?: string;
                    title: string;
                    type: 'lab_result' | 'imaging' | 'report' | 'prescription' | 'other';
                    description?: string;
                    file_url?: string;
                    file_name?: string;
                    file_type?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    doctor_id: string;
                    appointment_id?: string;
                    title: string;
                    type: 'lab_result' | 'imaging' | 'report' | 'prescription' | 'other';
                    description?: string;
                    file_url?: string;
                    file_name?: string;
                    file_type?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    title?: string;
                    type?: 'lab_result' | 'imaging' | 'report' | 'prescription' | 'other';
                    description?: string;
                    file_url?: string;
                    file_name?: string;
                    file_type?: string;
                    updated_at?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    appointment_id: string;
                    patient_id: string;
                    amount: number;
                    currency: string;
                    status: 'pending' | 'paid' | 'failed' | 'refunded';
                    payment_method?: string;
                    transaction_id?: string;
                    screenshot_url?: string;
                    paid_at?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    appointment_id: string;
                    patient_id: string;
                    amount: number;
                    currency?: string;
                    status?: 'pending' | 'paid' | 'failed' | 'refunded';
                    payment_method?: string;
                    transaction_id?: string;
                    screenshot_url?: string;
                    paid_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    amount?: number;
                    currency?: string;
                    status?: 'pending' | 'paid' | 'failed' | 'refunded';
                    payment_method?: string;
                    transaction_id?: string;
                    screenshot_url?: string;
                    paid_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    sender_id: string;
                    receiver_id: string;
                    content: string;
                    type: 'text' | 'image' | 'file';
                    file_url?: string;
                    read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    sender_id: string;
                    receiver_id: string;
                    content: string;
                    type?: 'text' | 'image' | 'file';
                    file_url?: string;
                    read?: boolean;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                    type?: 'text' | 'image' | 'file';
                    file_url?: string;
                    read?: boolean;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type: 'appointment' | 'payment' | 'message' | 'system';
                    read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type: 'appointment' | 'payment' | 'message' | 'system';
                    read?: boolean;
                    created_at?: string;
                };
                Update: {
                    title?: string;
                    message?: string;
                    type?: 'appointment' | 'payment' | 'message' | 'system';
                    read?: boolean;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// Helper functions for database operations
export const db = {
    // Users
    users: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByEmail(email: string) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (error) throw error;
            return data;
        },

        async create(user: Database['public']['Tables']['users']['Insert']) {
            const { data, error } = await supabase
                .from('users')
                .insert(user)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Database['public']['Tables']['users']['Update']) {
            const { data, error } = await supabase
                .from('users')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    },

    // Patients
    patients: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('patients')
                .select('*, users(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByUserId(userId: string) {
            const { data, error } = await supabase
                .from('patients')
                .select('*, users(*)')
                .eq('user_id', userId)
                .single();
            if (error) throw error;
            return data;
        },

        async getAll() {
            const { data, error } = await supabase
                .from('patients')
                .select('*, users(*)');
            if (error) throw error;
            return data;
        },

        async create(patient: Database['public']['Tables']['patients']['Insert']) {
            const { data, error } = await supabase
                .from('patients')
                .insert(patient)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Database['public']['Tables']['patients']['Update']) {
            const { data, error } = await supabase
                .from('patients')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    },

    // Doctors
    doctors: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('doctors')
                .select('*, users(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getAll() {
            const { data, error } = await supabase
                .from('doctors')
                .select('*, users(*)');
            if (error) throw error;
            return data;
        },

        async create(doctor: Database['public']['Tables']['doctors']['Insert']) {
            const { data, error } = await supabase
                .from('doctors')
                .insert(doctor)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Database['public']['Tables']['doctors']['Update']) {
            const { data, error } = await supabase
                .from('doctors')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    },

    // Appointments
    appointments: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patients (*, users (*)),
          doctors (*, users (*))
        `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByPatientId(patientId: string) {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          doctors (*, users (*))
        `)
                .eq('patient_id', patientId)
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        },

        async getByDoctorId(doctorId: string) {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patients (*, users (*))
        `)
                .eq('doctor_id', doctorId)
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        },

        async getAll() {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patients (*, users (*)),
          doctors (*, users (*))
        `)
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        },

        async create(appointment: Database['public']['Tables']['appointments']['Insert']) {
            const { data, error } = await supabase
                .from('appointments')
                .insert(appointment)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Database['public']['Tables']['appointments']['Update']) {
            const { data, error } = await supabase
                .from('appointments')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
    },

    // Prescriptions
    prescriptions: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByPatientId(patientId: string) {
            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
          *,
          doctors (*, users (*)),
          appointments (*)
        `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },

        async create(prescription: Database['public']['Tables']['prescriptions']['Insert']) {
            const { data, error } = await supabase
                .from('prescriptions')
                .insert(prescription)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    },

    // Medical Records
    medicalRecords: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByPatientId(patientId: string) {
            const { data, error } = await supabase
                .from('medical_records')
                .select(`
          *,
          doctors (*, users (*))
        `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },

        async create(record: Database['public']['Tables']['medical_records']['Insert']) {
            const { data, error } = await supabase
                .from('medical_records')
                .insert(record)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('medical_records')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
    },

    // Payments
    payments: {
        async getById(id: string) {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },

        async getByAppointmentId(appointmentId: string) {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('appointment_id', appointmentId)
                .single();
            if (error) throw error;
            return data;
        },

        async getByPatientId(patientId: string) {
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          appointments (*)
        `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },

        async create(payment: Database['public']['Tables']['payments']['Insert']) {
            const { data, error } = await supabase
                .from('payments')
                .insert(payment)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Database['public']['Tables']['payments']['Update']) {
            const { data, error } = await supabase
                .from('payments')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    },

    // Messages
    messages: {
        async getConversation(userId1: string, userId2: string) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },

        async create(message: Database['public']['Tables']['messages']['Insert']) {
            const { data, error } = await supabase
                .from('messages')
                .insert(message)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async markAsRead(id: string) {
            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', id);
            if (error) throw error;
        },
    },

    // Notifications
    notifications: {
        async getByUserId(userId: string) {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },

        async create(notification: Database['public']['Tables']['notifications']['Insert']) {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notification)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async markAsRead(id: string) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);
            if (error) throw error;
        },

        async markAllAsRead(userId: string) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId);
            if (error) throw error;
        },
    },
};

// File upload helper
export const uploadFile = async (
    bucket: string,
    path: string,
    file: File
): Promise<string> => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
};

// Delete file helper
export const deleteFile = async (bucket: string, path: string) => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) throw error;
};
