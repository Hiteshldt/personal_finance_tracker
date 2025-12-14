import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  let whereClause = '';
  const params: any[] = [];

  if (month && year) {
    whereClause = `WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?`;
    params.push(month.padStart(2, '0'), year);
  }

  const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    ${whereClause}
  `).get(...params);

  const categoryStats = db.prepare(`
    SELECT c.name, SUM(t.amount) as total, t.type
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ${whereClause}
    GROUP BY c.name, t.type
    ORDER BY total DESC
  `).all(...params);

  return NextResponse.json({ ...stats, categoryStats });
}
