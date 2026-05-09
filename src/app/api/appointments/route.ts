import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/appointments - Get appointments
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const appointmentId = searchParams.get('id');
        const patientId = searchParams.get('patientId');
        const doctorId = searchParams.get('doctorId');

        if (appointmentId) {
            const appointment = await db.appointments.getById(appointmentId);
            return NextResponse.json({ success: true, data: appointment });
        }

        if (patientId) {
            const appointments = await db.appointments.getByPatientId(patientId);
            return NextResponse.json({ success: true, data: appointments });
        }

        if (doctorId) {
            const appointments = await db.appointments.getByDoctorId(doctorId);
            return NextResponse.json({ success: true, data: appointments });
        }

        const appointments = await db.appointments.getAll();
        return NextResponse.json({ success: true, data: appointments });
    } catch (error: unknown) {
        console.error('Error fetching appointments:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const appointment = await db.appointments.create(body);

        // Create notification for the doctor
        await db.notifications.create({
            user_id: body.doctor_id,
            title: 'New Appointment Request',
            message: `A new appointment has been requested for ${body.date}`,
            type: 'appointment',
        });

        return NextResponse.json({ success: true, data: appointment });
    } catch (error: unknown) {
        console.error('Error creating appointment:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT /api/appointments - Update an appointment
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        const appointment = await db.appointments.update(id, updates);

        // Get appointment details for notification
        const appointmentDetails = await db.appointments.getById(id);

        // Create notification for status changes
        if (updates.status && appointmentDetails) {
            const patientUserId = appointmentDetails.patient_user_id;
            if (patientUserId) {
                await db.notifications.create({
                    user_id: patientUserId,
                    title: 'Appointment Updated',
                    message: `Your appointment has been ${updates.status}`,
                    type: 'appointment',
                });
            }
        }

        return NextResponse.json({ success: true, data: appointment });
    } catch (error: unknown) {
        console.error('Error updating appointment:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE /api/appointments - Delete an appointment
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Appointment ID is required' },
                { status: 400 }
            );
        }

        await db.appointments.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting appointment:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
