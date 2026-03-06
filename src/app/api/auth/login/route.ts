import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

        // Verify password - handle both bcrypt hash and plain text
        let isValidPassword;
        if (user.password_hash && user.password_hash.length === 60 && user.password_hash.startsWith('$2')) {
            // This looks like a bcrypt hash
            isValidPassword = await bcrypt.compare(password, user.password_hash);
        } else {
            // Assume plain text comparison
            console.log('Using plain text password comparison');
            isValidPassword = user.password_hash === password;
        }

        if (!isValidPassword) {
            console.log('Password mismatch');
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // If password is plain text, hash it and update the database for future logins
        if (user.password_hash && user.password_hash.length !== 60) {
            console.log('Hashing and updating password');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.users.update(user.id, { password_hash: hashedPassword });
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
