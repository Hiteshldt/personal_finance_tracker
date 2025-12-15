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
      sql: 'SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
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

    const { name, value, type } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO assets (user_id, name, value, type) VALUES (?, ?, ?, ?) RETURNING id, name, value, type',
      args: [userId, name, value, type || 'other']
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, value, type } = await request.json();
    await db.execute({
      sql: 'UPDATE assets SET name = ?, value = ?, type = ? WHERE id = ? AND user_id = ?',
      args: [name, value, type, id, userId]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
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
      sql: 'DELETE FROM assets WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
