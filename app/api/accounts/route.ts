import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM accounts ORDER BY created_at DESC`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, balance } = await request.json();
    const result = await sql`
      INSERT INTO accounts (name, type, balance)
      VALUES (${name}, ${type}, ${balance || 0})
      RETURNING id, name, type, balance
    `;
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, balance } = await request.json();
    await sql`
      UPDATE accounts
      SET name = ${name}, type = ${type}, balance = ${balance}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM accounts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
