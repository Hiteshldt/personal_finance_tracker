import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const result = await db.execute('SELECT * FROM accounts ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { name, type, balance } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?) RETURNING id, name, type, balance',
      args: [name, type, balance || 0]
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, balance } = await request.json();
    await db.execute({
      sql: 'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ?',
      args: [name, type, balance, id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM accounts WHERE id = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
