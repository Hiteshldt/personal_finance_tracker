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
- **Database**: Vercel Postgres (serverless PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Postgres Database

You have two options:

#### Option A: Using Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. In your Vercel project dashboard:
   - Go to **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Click **Create**
4. Vercel will automatically add the environment variables to your project
5. Pull the environment variables to your local machine:
   ```bash
   vercel env pull .env.local
   ```

#### Option B: Use Vercel CLI Locally

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
```

Then create a Postgres database from the Vercel dashboard and pull the variables again.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. First-Time Setup

On first launch, you'll be prompted to:
1. Enter your name
2. Add your first account (bank account or cash)

The database tables will be created automatically on the first API call.

## Database Schema

The app uses the following tables:

- **users**: User profile information
- **accounts**: Bank accounts, cash, cards, wallets
- **categories**: Income and expense categories
- **transactions**: All financial transactions
- **assets**: Other assets (property, gold, stocks, etc.)

Default categories are automatically seeded on first run.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build
4. Add a Postgres database in the Vercel dashboard (Storage tab)
5. Deploy!

The app will work perfectly on Vercel's serverless platform with Vercel Postgres.

## Environment Variables

Required environment variables (automatically provided by Vercel Postgres):

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

See `.env.example` for reference.

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

## License

MIT
