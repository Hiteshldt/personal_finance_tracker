import { createClient } from '@libsql/client';

// Create client - uses local file for development, can use Turso for production
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;

  try {
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, type)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category_id INTEGER,
        account_id INTEGER,
        source_account_id INTEGER,
        destination_account_id INTEGER,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (source_account_id) REFERENCES accounts(id),
        FOREIGN KEY (destination_account_id) REFERENCES accounts(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default categories if none exist
    const categoryCount = await db.execute('SELECT COUNT(*) as count FROM categories');
    const count = categoryCount.rows[0]?.count as number || 0;

    if (count === 0) {
      const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
      const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

      for (const cat of expenseCategories) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)',
          args: [cat, 'expense']
        });
      }

      for (const cat of incomeCategories) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)',
          args: [cat, 'income']
        });
      }
    }

    initialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}
