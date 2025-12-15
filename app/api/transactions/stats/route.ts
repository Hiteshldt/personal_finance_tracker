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

    let statsResult, categoryStatsResult;

    if (month && year) {
      statsResult = await db.execute({
        sql: `
          SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
          FROM transactions
          WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
        `,
        args: [userId, month.padStart(2, '0'), year]
      });

      categoryStatsResult = await db.execute({
        sql: `
          SELECT c.name, COALESCE(SUM(t.amount), 0) as total, t.type
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.user_id = ? AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?
          GROUP BY c.name, t.type
          ORDER BY total DESC
        `,
        args: [userId, month.padStart(2, '0'), year]
      });
    } else {
      statsResult = await db.execute({
        sql: `
          SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
          FROM transactions
          WHERE user_id = ?
        `,
        args: [userId]
      });

      categoryStatsResult = await db.execute({
        sql: `
          SELECT c.name, COALESCE(SUM(t.amount), 0) as total, t.type
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.user_id = ?
          GROUP BY c.name, t.type
          ORDER BY total DESC
        `,
        args: [userId]
      });
    }

    const stats = statsResult.rows[0];
    const categoryStats = categoryStatsResult.rows;

    return NextResponse.json({
      total_income: Number(stats?.total_income) || 0,
      total_expenses: Number(stats?.total_expenses) || 0,
      income_count: Number(stats?.income_count) || 0,
      expense_count: Number(stats?.expense_count) || 0,
      categoryStats: categoryStats.map(cat => ({
        ...cat,
        total: Number(cat.total)
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      total_income: 0,
      total_expenses: 0,
      income_count: 0,
      expense_count: 0,
      categoryStats: []
    });
  }
}
