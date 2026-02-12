import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/doctors - Get all doctors or single doctor
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('id');

        if (doctorId) {
            const doctor = await db.doctors.getById(doctorId);
            return NextResponse.json({ success: true, data: doctor });
        }

        const doctors = await db.doctors.getAll();
        return NextResponse.json({ success: true, data: doctors });
    } catch (error: any) {
        console.error('Error fetching doctors:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/doctors - Create a new doctor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const doctor = await db.doctors.create(body);
        return NextResponse.json({ success: true, data: doctor });
    } catch (error: any) {
        console.error('Error creating doctor:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/doctors - Update a doctor
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        const doctor = await db.doctors.update(id, updates);
        return NextResponse.json({ success: true, data: doctor });
    } catch (error: any) {
        console.error('Error updating doctor:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
