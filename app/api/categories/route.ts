import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const categories = db.prepare('SELECT * FROM categories ORDER BY type, name').all();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { name, type } = await request.json();
  try {
    const result = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
    return NextResponse.json({ id: result.lastInsertRowid, name, type });
  } catch (error) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
  }
}
