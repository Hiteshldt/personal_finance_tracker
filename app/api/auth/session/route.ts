import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const result = await db.execute({
      sql: 'SELECT id, name, username FROM users WHERE id = ?',
      args: [userId]
    });

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ user: null });
  }
}
