import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const result = await db.execute('SELECT * FROM assets ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { name, value, type } = await request.json();
    const result = await db.execute({
      sql: 'INSERT INTO assets (name, value, type) VALUES (?, ?, ?) RETURNING id, name, value, type',
      args: [name, value, type || 'other']
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, value, type } = await request.json();
    await db.execute({
      sql: 'UPDATE assets SET name = ?, value = ?, type = ? WHERE id = ?',
      args: [name, value, type, id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM assets WHERE id = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
