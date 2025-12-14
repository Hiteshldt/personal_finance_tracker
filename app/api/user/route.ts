import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const user = db.prepare('SELECT * FROM user ORDER BY id DESC LIMIT 1').get();
  return NextResponse.json(user || null);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  const result = db.prepare('INSERT INTO user (name) VALUES (?)').run(name);
  return NextResponse.json({ id: result.lastInsertRowid, name });
}

export async function PUT(request: Request) {
  const { name } = await request.json();
  db.prepare('UPDATE user SET name = ? WHERE id = (SELECT MAX(id) FROM user)').run(name);
  return NextResponse.json({ success: true });
}
