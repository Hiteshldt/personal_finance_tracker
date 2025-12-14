import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, type)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        type TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        account_id INTEGER REFERENCES accounts(id),
        source_account_id INTEGER REFERENCES accounts(id),
        destination_account_id INTEGER REFERENCES accounts(id),
        description TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default categories if none exist
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    if (categoryCount.rows.length === 0 || parseInt(categoryCount.rows[0].count) === 0) {
      const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
      const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

      for (const cat of expenseCategories) {
        await sql`INSERT INTO categories (name, type) VALUES (${cat}, 'expense') ON CONFLICT (name, type) DO NOTHING`;
      }

      for (const cat of incomeCategories) {
        await sql`INSERT INTO categories (name, type) VALUES (${cat}, 'income') ON CONFLICT (name, type) DO NOTHING`;
      }
    }

    return { success: true };
  } catch (error: any) {
    // If tables already exist, that's fine
    if (error.message?.includes('already exists')) {
      return { success: true };
    }
    throw error;
  }
}

export { sql };
