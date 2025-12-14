import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM assets ORDER BY created_at DESC`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { name, value, type } = await request.json();
    const result = await sql`
      INSERT INTO assets (name, value, type)
      VALUES (${name}, ${value}, ${type || 'other'})
      RETURNING id, name, value, type
    `;
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, value, type } = await request.json();
    await sql`
      UPDATE assets
      SET name = ${name}, value = ${value}, type = ${type}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM assets WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
