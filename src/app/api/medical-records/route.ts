import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple file upload placeholder - implement with your preferred storage
async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    // TODO: Implement file upload to your storage (e.g., local, S3, etc.)
    console.log('File upload not implemented:', bucket, path, file.name);
    return `/uploads/${path}`;
}

async function deleteFile(bucket: string, path: string): Promise<void> {
    // TODO: Implement file deletion from your storage
    console.log('File delete not implemented:', bucket, path);
}

// GET /api/medical-records - Get medical records
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('id');
        const patientId = searchParams.get('patientId');

        if (recordId) {
            const record = await db.medicalRecords.getById(recordId);
            return NextResponse.json({ success: true, data: record });
        }

        if (patientId) {
            const records = await db.medicalRecords.getByPatientId(patientId);
            return NextResponse.json({ success: true, data: records });
        }

        return NextResponse.json(
            { success: false, error: 'Patient ID or Record ID is required' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error fetching medical records:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/medical-records - Create a new medical record
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const patientId = formData.get('patientId') as string;
        const doctorId = formData.get('doctorId') as string;
        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const description = formData.get('description') as string;
        const appointmentId = formData.get('appointmentId') as string | null;
        const file = formData.get('file') as File | null;

        let fileUrl: string | undefined;
        let fileName: string | undefined;
        let fileType: string | undefined;

        // Upload file if provided
        if (file && file.size > 0) {
            const fileExt = file.name.split('.').pop();
            const filePath = `medical-records/${patientId}/${Date.now()}.${fileExt}`;
            fileUrl = await uploadFile('health-records', filePath, file);
            fileName = file.name;
            fileType = file.type;
        }

        const record = await db.medicalRecords.create({
            patient_id: patientId,
            doctor_id: doctorId,
            appointment_id: appointmentId || undefined,
            title,
            type: type as any,
            description,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
        });

        return NextResponse.json({ success: true, data: record });
    } catch (error: any) {
        console.error('Error creating medical record:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/medical-records - Delete a medical record
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Record ID is required' },
                { status: 400 }
            );
        }

        // Get record to find file URL
        const record = await db.medicalRecords.getById(id);

        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        // Delete file from storage if exists
        if (record.file_url) {
            try {
                const url = new URL(record.file_url);
                const pathParts = url.pathname.split('/');
                const bucketIndex = pathParts.findIndex(p => p === 'health-records');
                if (bucketIndex !== -1) {
                    const filePath = pathParts.slice(bucketIndex + 1).join('/');
                    await deleteFile('health-records', filePath);
                }
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        }

        await db.medicalRecords.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting medical record:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
