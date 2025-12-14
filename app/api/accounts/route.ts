import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const accounts = db.prepare('SELECT * FROM accounts ORDER BY created_at DESC').all();
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const { name, type, balance } = await request.json();
  const result = db.prepare('INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?)').run(name, type, balance || 0);
  return NextResponse.json({ id: result.lastInsertRowid, name, type, balance: balance || 0 });
}

export async function PUT(request: Request) {
  const { id, name, type, balance } = await request.json();
  db.prepare('UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ?').run(name, type, balance, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
