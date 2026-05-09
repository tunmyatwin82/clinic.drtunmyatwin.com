import { Pool, PoolConfig } from 'pg';

// PostgreSQL connection pool
const config: PoolConfig = {
    host: process.env.DB_HOST || '138.2.67.33',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'nocodb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Tmw@3171982',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
});

// Database types
export interface User {
    id: string;
    email?: string;
    name: string;
    phone: string;
    role: 'patient' | 'doctor' | 'admin';
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: Date;
    address?: string;
    avatar_url?: string;
    password_hash?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Patient {
    id: string;
    user_id: string;
    user?: User;
    emergency_contact?: string;
    blood_type?: string;
    allergies: string[];
    medical_conditions: string[];
    created_at: Date;
    updated_at: Date;
}

export interface Doctor {
    id: string;
    user_id: string;
    user?: User;
    specialization: string;
    qualifications: string[];
    experience_years: number;
    consultation_fee: number;
    available_days: string[];
    available_hours: { start: string; end: string };
    bio?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Appointment {
    id: string;
    patient_id: string;
    patient?: Patient;
    doctor_id: string;
    doctor?: Doctor;
    /** Present when loaded via joins (notifications, etc.) */
    patient_user_id?: string;
    doctor_user_id?: string;
    date: Date;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    type: 'video' | 'audio' | 'chat';
    notes?: string;
    symptoms?: string;
    diagnosis?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Prescription {
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
    created_at: Date;
    updated_at: Date;
}

export interface MedicalRecord {
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
    created_at: Date;
    updated_at: Date;
}

export interface Payment {
    id: string;
    appointment_id: string;
    patient_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method?: string;
    transaction_id?: string;
    screenshot_url?: string;
    paid_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    type: 'text' | 'image' | 'file';
    file_url?: string;
    read: boolean;
    created_at: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'appointment' | 'payment' | 'message' | 'system';
    read: boolean;
    created_at: Date;
}

// Helper function to run queries
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows as T[];
    } finally {
        client.release();
    }
}

// Helper function for single row results
export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
}

// Database operations
export const db = {
    // Users
    users: {
        async getById(id: string): Promise<User | null> {
            return queryOne<User>(
                'SELECT * FROM clinic.users WHERE id = $1',
                [id]
            );
        },

        async getByEmail(email: string): Promise<User | null> {
            return queryOne<User>(
                'SELECT * FROM clinic.users WHERE email = $1',
                [email]
            );
        },

        async getByPhone(phone: string): Promise<User | null> {
            return queryOne<User>(
                'SELECT * FROM clinic.users WHERE phone = $1',
                [phone]
            );
        },

        async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password_hash: string }): Promise<User> {
            const result = await queryOne<User>(
                `INSERT INTO clinic.users (email, name, phone, role, gender, date_of_birth, address, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [user.email || null, user.name, user.phone, user.role, user.gender, user.date_of_birth, user.address, user.password_hash]
            );
            return result!;
        },

        async update(id: string, updates: Partial<User>): Promise<User | null> {
            const fields = Object.keys(updates)
                .map((key, i) => `${key} = $${i + 2}`)
                .join(', ');
            const values = Object.values(updates);

            return queryOne<User>(
                `UPDATE clinic.users SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );
        },
    },

    // Patients
    patients: {
        async getById(id: string): Promise<Patient | null> {
            return queryOne<Patient>(
                `SELECT p.*, u.id as user_id, u.email, u.name, u.phone, u.role, u.gender, u.date_of_birth, u.address, u.avatar_url
         FROM clinic.patients p
         JOIN clinic.users u ON p.user_id = u.id
         WHERE p.id = $1`,
                [id]
            );
        },

        async getByUserId(userId: string): Promise<Patient | null> {
            return queryOne<Patient>(
                `SELECT p.*, u.id as user_id, u.email, u.name, u.phone, u.role, u.gender, u.date_of_birth, u.address, u.avatar_url
         FROM clinic.patients p
         JOIN clinic.users u ON p.user_id = u.id
         WHERE p.user_id = $1`,
                [userId]
            );
        },

        async getAll(): Promise<Patient[]> {
            return query<Patient>(
                `SELECT p.*, u.id as user_id, u.email, u.name, u.phone, u.role, u.gender, u.date_of_birth, u.address, u.avatar_url
         FROM clinic.patients p
         JOIN clinic.users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`
            );
        },

        async create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
            const result = await queryOne<Patient>(
                `INSERT INTO clinic.patients (user_id, emergency_contact, blood_type, allergies, medical_conditions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
                [patient.user_id, patient.emergency_contact, patient.blood_type, patient.allergies, patient.medical_conditions]
            );
            return result!;
        },

        async update(id: string, updates: Partial<Patient>): Promise<Patient | null> {
            const fields = Object.keys(updates)
                .map((key, i) => `${key} = $${i + 2}`)
                .join(', ');
            const values = Object.values(updates);

            return queryOne<Patient>(
                `UPDATE clinic.patients SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );
        },
    },

    // Doctors
    doctors: {
        async getById(id: string): Promise<Doctor | null> {
            return queryOne<Doctor>(
                `SELECT d.*, u.id as user_id, u.email, u.name, u.phone, u.role, u.gender, u.date_of_birth, u.address, u.avatar_url
         FROM clinic.doctors d
         JOIN clinic.users u ON d.user_id = u.id
         WHERE d.id = $1`,
                [id]
            );
        },

        async getAll(): Promise<Doctor[]> {
            return query<Doctor>(
                `SELECT d.*, u.id as user_id, u.email, u.name, u.phone, u.role, u.gender, u.date_of_birth, u.address, u.avatar_url
         FROM clinic.doctors d
         JOIN clinic.users u ON d.user_id = u.id
         ORDER BY d.created_at DESC`
            );
        },

        async create(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
            const result = await queryOne<Doctor>(
                `INSERT INTO clinic.doctors (user_id, specialization, qualifications, experience_years, consultation_fee, available_days, available_hours, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [doctor.user_id, doctor.specialization, doctor.qualifications, doctor.experience_years, doctor.consultation_fee, doctor.available_days, doctor.available_hours, doctor.bio]
            );
            return result!;
        },

        async update(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
            const fields = Object.keys(updates)
                .map((key, i) => `${key} = $${i + 2}`)
                .join(', ');
            const values = Object.values(updates);

            return queryOne<Doctor>(
                `UPDATE clinic.doctors SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );
        },
    },

    // Appointments
    appointments: {
        async getById(id: string): Promise<Appointment | null> {
            return queryOne<Appointment>(
                `SELECT a.*, 
                p.id as patient_id, p.emergency_contact, p.blood_type, p.allergies, p.medical_conditions,
                pu.id as patient_user_id, pu.name as patient_name, pu.email as patient_email, pu.phone as patient_phone,
                d.id as doctor_id, d.specialization, d.qualifications, d.experience_years, d.consultation_fee, d.bio,
                du.id as doctor_user_id, du.name as doctor_name, du.email as doctor_email, du.phone as doctor_phone
         FROM clinic.appointments a
         JOIN clinic.patients p ON a.patient_id = p.id
         JOIN clinic.users pu ON p.user_id = pu.id
         JOIN clinic.doctors d ON a.doctor_id = d.id
         JOIN clinic.users du ON d.user_id = du.id
         WHERE a.id = $1`,
                [id]
            );
        },

        async getByPatientId(patientId: string): Promise<Appointment[]> {
            return query<Appointment>(
                `SELECT a.*, 
                d.id as doctor_id, d.specialization, d.qualifications, d.experience_years, d.consultation_fee, d.bio,
                du.id as doctor_user_id, du.name as doctor_name, du.email as doctor_email, du.phone as doctor_phone
         FROM clinic.appointments a
         JOIN clinic.doctors d ON a.doctor_id = d.id
         JOIN clinic.users du ON d.user_id = du.id
         WHERE a.patient_id = $1
         ORDER BY a.date DESC, a.start_time DESC`,
                [patientId]
            );
        },

        async getByDoctorId(doctorId: string): Promise<Appointment[]> {
            return query<Appointment>(
                `SELECT a.*, 
                p.id as patient_id, p.emergency_contact, p.blood_type, p.allergies, p.medical_conditions,
                pu.id as patient_user_id, pu.name as patient_name, pu.email as patient_email, pu.phone as patient_phone
         FROM clinic.appointments a
         JOIN clinic.patients p ON a.patient_id = p.id
         JOIN clinic.users pu ON p.user_id = pu.id
         WHERE a.doctor_id = $1
         ORDER BY a.date DESC, a.start_time DESC`,
                [doctorId]
            );
        },

        async getAll(): Promise<Appointment[]> {
            return query<Appointment>(
                `SELECT a.*, 
                p.id as patient_id, p.emergency_contact, p.blood_type, p.allergies, p.medical_conditions,
                pu.id as patient_user_id, pu.name as patient_name, pu.email as patient_email, pu.phone as patient_phone,
                d.id as doctor_id, d.specialization, d.qualifications, d.experience_years, d.consultation_fee, d.bio,
                du.id as doctor_user_id, du.name as doctor_name, du.email as doctor_email, du.phone as doctor_phone
         FROM clinic.appointments a
         JOIN clinic.patients p ON a.patient_id = p.id
         JOIN clinic.users pu ON p.user_id = pu.id
         JOIN clinic.doctors d ON a.doctor_id = d.id
         JOIN clinic.users du ON d.user_id = du.id
         ORDER BY a.date DESC, a.start_time DESC`
            );
        },

        async create(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
            const result = await queryOne<Appointment>(
                `INSERT INTO clinic.appointments (patient_id, doctor_id, date, start_time, end_time, status, type, notes, symptoms, diagnosis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
                [appointment.patient_id, appointment.doctor_id, appointment.date, appointment.start_time, appointment.end_time, appointment.status, appointment.type, appointment.notes, appointment.symptoms, appointment.diagnosis]
            );
            return result!;
        },

        async update(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
            const fields = Object.keys(updates)
                .map((key, i) => `${key} = $${i + 2}`)
                .join(', ');
            const values = Object.values(updates);

            return queryOne<Appointment>(
                `UPDATE clinic.appointments SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );
        },

        async delete(id: string): Promise<void> {
            await query('DELETE FROM clinic.appointments WHERE id = $1', [id]);
        },
    },

    // Medical Records
    medicalRecords: {
        async getById(id: string): Promise<MedicalRecord | null> {
            return queryOne<MedicalRecord>(
                'SELECT * FROM clinic.medical_records WHERE id = $1',
                [id]
            );
        },

        async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
            return query<MedicalRecord>(
                `SELECT m.*, d.specialization, du.name as doctor_name
         FROM clinic.medical_records m
         JOIN clinic.doctors d ON m.doctor_id = d.id
         JOIN clinic.users du ON d.user_id = du.id
         WHERE m.patient_id = $1
         ORDER BY m.created_at DESC`,
                [patientId]
            );
        },

        async create(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
            const result = await queryOne<MedicalRecord>(
                `INSERT INTO clinic.medical_records (patient_id, doctor_id, appointment_id, title, type, description, file_url, file_name, file_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
                [record.patient_id, record.doctor_id, record.appointment_id, record.title, record.type, record.description, record.file_url, record.file_name, record.file_type]
            );
            return result!;
        },

        async delete(id: string): Promise<void> {
            await query('DELETE FROM clinic.medical_records WHERE id = $1', [id]);
        },
    },

    // Payments
    payments: {
        async getById(id: string): Promise<Payment | null> {
            return queryOne<Payment>(
                'SELECT * FROM clinic.payments WHERE id = $1',
                [id]
            );
        },

        async getByAppointmentId(appointmentId: string): Promise<Payment | null> {
            return queryOne<Payment>(
                'SELECT * FROM clinic.payments WHERE appointment_id = $1',
                [appointmentId]
            );
        },

        async getByPatientId(patientId: string): Promise<Payment[]> {
            return query<Payment>(
                `SELECT p.*, a.date as appointment_date, a.start_time
         FROM clinic.payments p
         JOIN clinic.appointments a ON p.appointment_id = a.id
         WHERE p.patient_id = $1
         ORDER BY p.created_at DESC`,
                [patientId]
            );
        },

        async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
            const result = await queryOne<Payment>(
                `INSERT INTO clinic.payments (appointment_id, patient_id, amount, currency, status, payment_method, transaction_id, screenshot_url, paid_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
                [payment.appointment_id, payment.patient_id, payment.amount, payment.currency, payment.status, payment.payment_method, payment.transaction_id, payment.screenshot_url, payment.paid_at]
            );
            return result!;
        },

        async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
            const fields = Object.keys(updates)
                .map((key, i) => `${key} = $${i + 2}`)
                .join(', ');
            const values = Object.values(updates);

            return queryOne<Payment>(
                `UPDATE clinic.payments SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );
        },
    },

    // Messages
    messages: {
        async getConversation(userId1: string, userId2: string): Promise<Message[]> {
            return query<Message>(
                `SELECT * FROM clinic.messages
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC`,
                [userId1, userId2]
            );
        },

        async create(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
            const result = await queryOne<Message>(
                `INSERT INTO clinic.messages (sender_id, receiver_id, content, type, file_url, read)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
                [message.sender_id, message.receiver_id, message.content, message.type, message.file_url, message.read]
            );
            return result!;
        },

        async markAsRead(id: string): Promise<void> {
            await query('UPDATE clinic.messages SET read = true WHERE id = $1', [id]);
        },
    },

    // Notifications
    notifications: {
        async getByUserId(userId: string): Promise<Notification[]> {
            return query<Notification>(
                'SELECT * FROM clinic.notifications WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
        },

        async create(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
            const result = await queryOne<Notification>(
                `INSERT INTO clinic.notifications (user_id, title, message, type, read)
         VALUES ($1, $2, $3, $4, false)
         RETURNING *`,
                [notification.user_id, notification.title, notification.message, notification.type]
            );
            return result!;
        },

        async markAsRead(id: string): Promise<void> {
            await query('UPDATE clinic.notifications SET read = true WHERE id = $1', [id]);
        },

        async markAllAsRead(userId: string): Promise<void> {
            await query('UPDATE clinic.notifications SET read = true WHERE user_id = $1', [userId]);
        },
    },
};

export default pool;
