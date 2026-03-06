import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { emailOrPhone, password } = body;

        console.log('Login attempt:', emailOrPhone);

        // Validate input
        if (!emailOrPhone || !password) {
            return NextResponse.json(
                { success: false, error: 'Email/Phone and password are required' },
                { status: 400 }
            );
        }

        // Find user
        let user;
        if (emailOrPhone.includes('@')) {
            user = await db.users.getByEmail(emailOrPhone);
        } else {
            user = await db.users.getByPhone(emailOrPhone);
        }

        if (!user) {
            console.log('User not found');
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        if (user.password_hash !== password) {
            console.log('Password mismatch:', user.password_hash, password);
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('Login successful:', user.email);

        // Return user data
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
