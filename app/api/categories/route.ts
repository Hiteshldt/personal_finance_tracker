import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initializeDatabase();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name',
      args: [userId]
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?) RETURNING id, name, type',
      args: [userId, name, type]
    });
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.message?.includes('UNIQUE') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
