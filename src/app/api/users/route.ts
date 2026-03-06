import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users - Get user by email or phone
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const phone = searchParams.get('phone');

        if (email) {
            const user = await db.users.getByEmail(email);
            if (!user) {
                return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, user });
        }

        if (phone) {
            const user = await db.users.getByPhone(phone);
            if (!user) {
                return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, user });
        }

        return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
    } catch (error: any) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
