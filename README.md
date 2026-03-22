# College Marketplace

A campus marketplace built with Next.js and Supabase.

## What this project currently does

- User signup and login with Supabase Auth
- Create listings with image upload to Supabase Storage
- Browse active listings on the home page
- View listing details
- Start and continue buyer/seller conversations
- Edit, delete, and mark your own listings as sold

## Required environment variables

Copy `.env.example` to `.env.local` and fill in your own values.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not commit `.env.local` to Git.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Required Supabase tables and buckets

This code expects these main tables and storage resources to exist:

- `profiles`
- `categories`
- `listings`
- `conversations`
- `messages`
- storage bucket: `listing-images`

The code also assumes your Supabase Row Level Security policies allow the intended reads and writes for authenticated users.

## Notes

- Listing images are uploaded to the public `listing-images` bucket.
- Home only shows `active` listings.
- The `/chat/[listingId]` route now opens or resumes a real conversation instead of exposing seller email.
