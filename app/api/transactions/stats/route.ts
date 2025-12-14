import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let statsResult, categoryStatsResult;

    if (month && year) {
      statsResult = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
        WHERE EXTRACT(MONTH FROM date) = ${parseInt(month)}
          AND EXTRACT(YEAR FROM date) = ${parseInt(year)}
      `;

      categoryStatsResult = await sql`
        SELECT c.name, COALESCE(SUM(t.amount), 0) as total, t.type
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE EXTRACT(MONTH FROM t.date) = ${parseInt(month)}
          AND EXTRACT(YEAR FROM t.date) = ${parseInt(year)}
        GROUP BY c.name, t.type
        ORDER BY total DESC
      `;
    } else {
      statsResult = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
      `;

      categoryStatsResult = await sql`
        SELECT c.name, COALESCE(SUM(t.amount), 0) as total, t.type
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        GROUP BY c.name, t.type
        ORDER BY total DESC
      `;
    }

    const stats = statsResult.rows[0];
    const categoryStats = categoryStatsResult.rows;

    return NextResponse.json({
      total_income: parseFloat(stats?.total_income) || 0,
      total_expenses: parseFloat(stats?.total_expenses) || 0,
      income_count: parseInt(stats?.income_count) || 0,
      expense_count: parseInt(stats?.expense_count) || 0,
      categoryStats: categoryStats.map(cat => ({
        ...cat,
        total: parseFloat(cat.total)
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
