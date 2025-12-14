import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  let query = `
    SELECT t.*, c.name as category_name, a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
  `;

  const params: any[] = [];

  if (month && year) {
    query += ` WHERE strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?`;
    params.push(month.padStart(2, '0'), year);
  }

  query += ` ORDER BY t.date DESC, t.id DESC`;

  const transactions = db.prepare(query).all(...params);
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const { amount, type, category_id, account_id, source_account_id, destination_account_id, description, date } = await request.json();

  const result = db.prepare(`
    INSERT INTO transactions (amount, type, category_id, account_id, source_account_id, destination_account_id, description, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(amount, type, category_id || null, account_id || null, source_account_id || null, destination_account_id || null, description || null, date || new Date().toISOString());

  // Update account balances
  if (type === 'expense' && account_id) {
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, account_id);
  } else if (type === 'income' && account_id) {
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, account_id);
  } else if (type === 'transfer' && source_account_id && destination_account_id) {
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, source_account_id);
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, destination_account_id);
  }

  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  // Get transaction details to reverse balance changes
  const transaction: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);

  if (transaction) {
    if (transaction.type === 'expense' && transaction.account_id) {
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(transaction.amount, transaction.account_id);
    } else if (transaction.type === 'income' && transaction.account_id) {
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(transaction.amount, transaction.account_id);
    } else if (transaction.type === 'transfer' && transaction.source_account_id && transaction.destination_account_id) {
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(transaction.amount, transaction.source_account_id);
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(transaction.amount, transaction.destination_account_id);
    }
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
