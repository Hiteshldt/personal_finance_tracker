import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const result = await db.execute('SELECT * FROM users ORDER BY id DESC LIMIT 1');
    return NextResponse.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { name } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO users (name) VALUES (?) RETURNING id, name',
      args: [name]
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { name } = await request.json();
    await db.execute({
      sql: 'UPDATE users SET name = ? WHERE id = (SELECT MAX(id) FROM users)',
      args: [name]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
