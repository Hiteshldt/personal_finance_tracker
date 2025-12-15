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
      sql: 'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
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

    const { name, type, balance } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?) RETURNING id, name, type, balance',
      args: [userId, name, type, balance || 0]
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, type, balance } = await request.json();
    await db.execute({
      sql: 'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      args: [name, type, balance, id, userId]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
