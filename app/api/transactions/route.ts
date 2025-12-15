import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initializeDatabase();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let result;

    if (month && year) {
      result = await db.execute({
        sql: `
          SELECT t.*, c.name as category_name, a.name as account_name
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          LEFT JOIN accounts a ON t.account_id = a.id
          WHERE t.user_id = ? AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          ORDER BY t.date DESC, t.id DESC
        `,
        args: [userId, month.padStart(2, '0'), year]
      });
    } else {
      result = await db.execute({
        sql: `
          SELECT t.*, c.name as category_name, a.name as account_name
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          LEFT JOIN accounts a ON t.account_id = a.id
          WHERE t.user_id = ?
          ORDER BY t.date DESC, t.id DESC
        `,
        args: [userId]
      });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
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

    const { amount, type, category_id, account_id, source_account_id, destination_account_id, description, date } = await request.json();

    const result = await db.execute({
      sql: `
        INSERT INTO transactions (user_id, amount, type, category_id, account_id, source_account_id, destination_account_id, description, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [userId, amount, type, category_id || null, account_id || null, source_account_id || null, destination_account_id || null, description || null, date || new Date().toISOString()]
    });

    // Update account balances
    if (type === 'expense' && account_id) {
      await db.execute({
        sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        args: [amount, account_id]
      });
    } else if (type === 'income' && account_id) {
      await db.execute({
        sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        args: [amount, account_id]
      });
    } else if (type === 'transfer' && source_account_id && destination_account_id) {
      await db.execute({
        sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        args: [amount, source_account_id]
      });
      await db.execute({
        sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        args: [amount, destination_account_id]
      });
    }

    return NextResponse.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    // Get transaction details to reverse balance changes
    const transactionResult = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    const transaction = transactionResult.rows[0];

    if (transaction) {
      if (transaction.type === 'expense' && transaction.account_id) {
        await db.execute({
          sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          args: [transaction.amount, transaction.account_id]
        });
      } else if (transaction.type === 'income' && transaction.account_id) {
        await db.execute({
          sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
          args: [transaction.amount, transaction.account_id]
        });
      } else if (transaction.type === 'transfer' && transaction.source_account_id && transaction.destination_account_id) {
        await db.execute({
          sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          args: [transaction.amount, transaction.source_account_id]
        });
        await db.execute({
          sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
          args: [transaction.amount, transaction.destination_account_id]
        });
      }
    }

    await db.execute({
      sql: 'DELETE FROM transactions WHERE id = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
