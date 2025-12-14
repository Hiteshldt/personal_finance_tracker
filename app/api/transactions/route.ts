import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let result;

    if (month && year) {
      result = await sql`
        SELECT t.*, c.name as category_name, a.name as account_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE EXTRACT(MONTH FROM t.date) = ${parseInt(month)}
          AND EXTRACT(YEAR FROM t.date) = ${parseInt(year)}
        ORDER BY t.date DESC, t.id DESC
      `;
    } else {
      result = await sql`
        SELECT t.*, c.name as category_name, a.name as account_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        ORDER BY t.date DESC, t.id DESC
      `;
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { amount, type, category_id, account_id, source_account_id, destination_account_id, description, date } = await request.json();

    const result = await sql`
      INSERT INTO transactions (amount, type, category_id, account_id, source_account_id, destination_account_id, description, date)
      VALUES (
        ${amount},
        ${type},
        ${category_id || null},
        ${account_id || null},
        ${source_account_id || null},
        ${destination_account_id || null},
        ${description || null},
        ${date || new Date().toISOString()}
      )
      RETURNING id
    `;

    // Update account balances
    if (type === 'expense' && account_id) {
      await sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${account_id}`;
    } else if (type === 'income' && account_id) {
      await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${account_id}`;
    } else if (type === 'transfer' && source_account_id && destination_account_id) {
      await sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${source_account_id}`;
      await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${destination_account_id}`;
    }

    return NextResponse.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    // Get transaction details to reverse balance changes
    const transactionResult = await sql`SELECT * FROM transactions WHERE id = ${id}`;
    const transaction = transactionResult.rows[0];

    if (transaction) {
      if (transaction.type === 'expense' && transaction.account_id) {
        await sql`UPDATE accounts SET balance = balance + ${transaction.amount} WHERE id = ${transaction.account_id}`;
      } else if (transaction.type === 'income' && transaction.account_id) {
        await sql`UPDATE accounts SET balance = balance - ${transaction.amount} WHERE id = ${transaction.account_id}`;
      } else if (transaction.type === 'transfer' && transaction.source_account_id && transaction.destination_account_id) {
        await sql`UPDATE accounts SET balance = balance + ${transaction.amount} WHERE id = ${transaction.source_account_id}`;
        await sql`UPDATE accounts SET balance = balance - ${transaction.amount} WHERE id = ${transaction.destination_account_id}`;
      }
    }

    await sql`DELETE FROM transactions WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
