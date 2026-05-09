import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/patients - Get all patients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('id');
        const userId = searchParams.get('userId');

        if (patientId) {
            const patient = await db.patients.getById(patientId);
            return NextResponse.json({ success: true, data: patient });
        }

        if (userId) {
            const patient = await db.patients.getByUserId(userId);
            return NextResponse.json({ success: true, data: patient });
        }

        const patients = await db.patients.getAll();
        return NextResponse.json({ success: true, data: patients });
    } catch (error: unknown) {
        console.error('Error fetching patients:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST /api/patients - Create a new patient (with user)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = typeof body.email === 'string' && body.email.trim() !== '' ? body.email.trim() : null;

        // Check if user already exists with same email or phone
        if (email) {
            const existingUserByEmail = await db.users.getByEmail(email);
            if (existingUserByEmail) {
                return NextResponse.json(
                    { success: false, error: 'Email already registered' },
                    { status: 400 }
                );
            }
        }

        const existingUserByPhone = await db.users.getByPhone(body.phone);
        if (existingUserByPhone) {
            return NextResponse.json(
                { success: false, error: 'Phone number already registered' },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(body.password, 10);

        // First create the user
        const user = await db.users.create({
            email: email ?? undefined,
            name: body.name,
            phone: body.phone,
            role: 'patient',
            gender: body.gender,
            date_of_birth: body.date_of_birth,
            password_hash: passwordHash,
        });

        // Then create the patient record
        const patient = await db.patients.create({
            user_id: user.id,
            emergency_contact: body.emergency_contact,
            blood_type: body.blood_type,
            allergies: body.allergies || [],
            medical_conditions: body.medical_conditions || [],
        });

        return NextResponse.json({
            success: true,
            data: { ...patient, user_id: user.id, user }
        });
    } catch (error: unknown) {
        console.error('Error creating patient:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT /api/patients - Update a patient
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        const patient = await db.patients.update(id, updates);
        return NextResponse.json({ success: true, data: patient });
    } catch (error: unknown) {
        console.error('Error updating patient:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
