# Personal Finance Tracker

A modern, premium money management app built with Next.js, featuring dark mode and a clean, minimal design.

## Features

- 📊 Dashboard with monthly expense overview
- 💰 Income & expense tracking
- 🏦 Multiple account management (bank, cash, cards, wallets)
- 📁 Custom categories
- 💎 Asset tracking (property, gold, stocks, etc.)
- 🌙 Dark mode support
- 📱 Mobile-optimized UI
- 🎨 Premium glass morphism design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: libSQL/Turso (serverless SQLite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

That's it! Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically create a local SQLite database file (`local.db`) - **no additional setup needed!**

### 3. First-Time Setup

On first launch, you'll be prompted to:
1. Enter your name
2. Add your first account (bank account or cash)

The database tables and default categories are created automatically.

## Deployment to Vercel

### Option 1: Local SQLite on Vercel (Simplest, No Setup)

1. Push your code to GitHub
2. Import to Vercel and deploy
3. **Done!** The app will work with a local SQLite file

**Note**: Data won't persist between deployments with this option. Good for testing.

### Option 2: Turso Cloud Database (Recommended for Production)

For persistent data that survives deployments:

1. **Create a free Turso database**:
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash

   # Login
   turso auth login

   # Create database
   turso db create personal-finance

   # Get connection details
   turso db show personal-finance --url
   turso db tokens create personal-finance
   ```

2. **Add to Vercel**:
   - Go to your project on Vercel
   - Settings → Environment Variables
   - Add:
     - `TURSO_DATABASE_URL` = (URL from above)
     - `TURSO_AUTH_TOKEN` = (token from above)

3. **Redeploy** - Your data will now persist!

**Turso Free Tier**: 9 GB storage, 500 databases, plenty for personal use.

## Database Schema

The app uses SQLite with the following tables:

- **users**: User profile information
- **accounts**: Bank accounts, cash, cards, wallets
- **categories**: Income and expense categories
- **transactions**: All financial transactions
- **assets**: Other assets (property, gold, stocks, etc.)

Default categories are automatically seeded on first run.

## Usage

### Adding Transactions

- Click the **green +** button to add income
- Click the **red -** button to add expenses
- Fill in amount, category, account, and optional description

### Managing Accounts

- Go to the **Accounts** tab
- Click **Add** to create new accounts
- View all account balances

### Managing Categories

- Go to the **Accounts** tab (categories are shown below accounts)
- Click **Add** in the categories section
- Choose whether it's an income or expense category

### Tracking Assets

- Go to the **Assets** tab
- Click **Add** to track property, gold, stocks, vehicles, etc.
- Update values as needed

### Monthly View

- Use the month selector arrows in the Dashboard and Transactions tabs
- View expenses and transactions for any month

## Dark Mode

Toggle dark mode using the moon/sun icon in the header. Your preference is saved automatically.

## Why libSQL/Turso?

- ✅ **Works everywhere**: Local dev, Vercel, anywhere
- ✅ **No setup needed**: Just `npm run dev` and go
- ✅ **SQLite simplicity**: No complex database configuration
- ✅ **Edge-ready**: Built for serverless platforms
- ✅ **Free tier**: Generous limits for personal use
- ✅ **Optional cloud**: Use local file or Turso cloud as needed

## Environment Variables

All environment variables are **optional**:

- `TURSO_DATABASE_URL` - Turso database URL (if using cloud database)
- `TURSO_AUTH_TOKEN` - Turso auth token (if using cloud database)

If not set, the app uses a local `local.db` file automatically.

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
