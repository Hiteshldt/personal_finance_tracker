import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { username, pincode } = await request.json();

    // Validate input
    if (!username || !pincode) {
      return NextResponse.json(
        { error: 'Username and pincode are required' },
        { status: 400 }
      );
    }

    if (pincode.length !== 4 || !/^\d+$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode format' },
        { status: 400 }
      );
    }

    // Find user
    const result = await db.execute({
      sql: 'SELECT id, name, username, pincode_hash FROM users WHERE username = ?',
      args: [username.toLowerCase()]
    });

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or pincode' },
        { status: 401 }
      );
    }

    // Verify pincode
    const pincodeMatch = await bcrypt.compare(pincode, user.pincode_hash as string);

    if (!pincodeMatch) {
      return NextResponse.json(
        { error: 'Invalid username or pincode' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error during pincode login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
