import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM categories ORDER BY type, name`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();
    const result = await sql`
      INSERT INTO categories (name, type)
      VALUES (${name}, ${type})
      RETURNING id, name, type
    `;
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
