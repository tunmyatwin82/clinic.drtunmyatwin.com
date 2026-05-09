import { NextRequest, NextResponse } from 'next/server';
import { db, type Payment } from '@/lib/db';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

function isPaymentStatus(value: string): value is PaymentStatus {
    return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

// Simple file upload placeholder - implement with your preferred storage
async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    // TODO: Implement file upload to your storage (e.g., local, S3, etc.)
    console.log('File upload not implemented:', bucket, path, file.name);
    return `/uploads/${path}`;
}

// GET /api/payments - Get payments
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get('id');
        const appointmentId = searchParams.get('appointmentId');
        const patientId = searchParams.get('patientId');

        if (paymentId) {
            const payment = await db.payments.getById(paymentId);
            return NextResponse.json({ success: true, data: payment });
        }

        if (appointmentId) {
            const payment = await db.payments.getByAppointmentId(appointmentId);
            return NextResponse.json({ success: true, data: payment });
        }

        if (patientId) {
            const payments = await db.payments.getByPatientId(patientId);
            return NextResponse.json({ success: true, data: payments });
        }

        return NextResponse.json(
            { success: false, error: 'Payment ID, Appointment ID, or Patient ID is required' },
            { status: 400 }
        );
    } catch (error: unknown) {
        console.error('Error fetching payments:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const appointmentId = formData.get('appointmentId') as string;
        const patientId = formData.get('patientId') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const currency = (formData.get('currency') as string) || 'MMK';
        const paymentMethod = formData.get('paymentMethod') as string;
        const screenshot = formData.get('screenshot') as File | null;

        let screenshotUrl: string | undefined;

        // Upload screenshot if provided
        if (screenshot && screenshot.size > 0) {
            const fileExt = screenshot.name.split('.').pop();
            const filePath = `payment-screenshots/${patientId}/${Date.now()}.${fileExt}`;
            screenshotUrl = await uploadFile('payment-screenshots', filePath, screenshot);
        }

        const payment = await db.payments.create({
            appointment_id: appointmentId,
            patient_id: patientId,
            amount,
            currency,
            payment_method: paymentMethod,
            screenshot_url: screenshotUrl,
            status: 'pending',
        });

        // Create notification for the doctor
        const appointment = await db.appointments.getById(appointmentId);
        if (appointment) {
            const doctorUserId = appointment.doctor_user_id;
            if (doctorUserId) {
                await db.notifications.create({
                    user_id: doctorUserId,
                    title: 'New Payment Submitted',
                    message: `A payment of ${amount} ${currency} has been submitted`,
                    type: 'payment',
                });
            }
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error: unknown) {
        console.error('Error creating payment:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT /api/payments - Update a payment
export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();

        const id = formData.get('id') as string;
        const status = formData.get('status') as string;
        const screenshot = formData.get('screenshot') as File | null;

        const updates: Partial<Payment> = {};

        if (status && isPaymentStatus(status)) {
            updates.status = status;
            if (status === 'paid') {
                updates.paid_at = new Date();
            }
        }

        // Upload new screenshot if provided
        if (screenshot && screenshot.size > 0) {
            const paymentRecord = await db.payments.getById(id);
            if (paymentRecord) {
                const patientId = paymentRecord.patient_id;
                const fileExt = screenshot.name.split('.').pop();
                const filePath = `payment-screenshots/${patientId}/${Date.now()}.${fileExt}`;
                updates.screenshot_url = await uploadFile('payment-screenshots', filePath, screenshot);
            }
        }

        const payment = await db.payments.update(id, updates);

        // Create notification for status changes
        if (status) {
            const paymentDetails = await db.payments.getById(id);
            if (paymentDetails) {
                const appointment = await db.appointments.getById(paymentDetails.appointment_id);
                if (appointment) {
                    const patientUserId = appointment.patient_user_id;
                    if (patientUserId) {
                        await db.notifications.create({
                            user_id: patientUserId,
                            title: 'Payment Status Updated',
                            message: `Your payment has been ${status}`,
                            type: 'payment',
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error: unknown) {
        console.error('Error updating payment:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
