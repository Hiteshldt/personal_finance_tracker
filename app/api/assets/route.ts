import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const assets = db.prepare('SELECT * FROM assets ORDER BY created_at DESC').all();
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const { name, value, type } = await request.json();
  const result = db.prepare('INSERT INTO assets (name, value, type) VALUES (?, ?, ?)').run(name, value, type || 'other');
  return NextResponse.json({ id: result.lastInsertRowid, name, value, type });
}

export async function PUT(request: Request) {
  const { id, name, value, type } = await request.json();
  db.prepare('UPDATE assets SET name = ?, value = ?, type = ? WHERE id = ?').run(name, value, type, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
