import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const result = await db.execute('SELECT * FROM categories ORDER BY type, name');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { name, type } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO categories (name, type) VALUES (?, ?) RETURNING id, name, type',
      args: [name, type]
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
