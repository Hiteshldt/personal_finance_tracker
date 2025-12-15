import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const { name, username, password, pincode } = await request.json();

    // Validate input
    if (!name || !username || !password || !pincode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (pincode.length !== 4 || !/^\d+$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be 4 digits' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username.toLowerCase()]
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password and pincode
    const passwordHash = await bcrypt.hash(password, 10);
    const pincodeHash = await bcrypt.hash(pincode, 10);

    // Create user
    const result = await db.execute({
      sql: `INSERT INTO users (name, username, password_hash, pincode_hash)
            VALUES (?, ?, ?, ?)
            RETURNING id, name, username`,
      args: [name, username.toLowerCase(), passwordHash, pincodeHash]
    });

    const user = result.rows[0];

    // Create default categories for the user
    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    for (const cat of expenseCategories) {
      await db.execute({
        sql: 'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
        args: [user.id, cat, 'expense']
      });
    }

    for (const cat of incomeCategories) {
      await db.execute({
        sql: 'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
        args: [user.id, cat, 'income']
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
