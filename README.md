# MyTooSense

A daily opinion-sharing app where users answer one multiple-choice question per day, earn rewards, and see how their opinion compares to others.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from Project Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Daily Questions**: One multiple-choice question per day
- **Earn Points**: Get 2 cents for each answer
- **Streaks**: Build up your answer streak by participating daily
- **Results**: See how your opinion compares to others
- **Profile**: Track your cents balance and streak
- **Admin Panel**: Create and manage questions (restricted access)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel

## Project Structure

```
my-2-cents/
├── app/
│   ├── login/
│   ├── profile/
│   ├── admin/
│   ├── auth/
│   └── page.tsx (home)
├── lib/
│   ├── supabaseClient.ts
│   └── types.ts
├── components/
├── supabase/
│   └── migrations/
└── public/
```
