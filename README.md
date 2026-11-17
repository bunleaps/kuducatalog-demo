## Kit Catalog

### Local setup

Create `.env.local` in this folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=catalog-media
```

In Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). Then run every file in [`supabase/migrations`](./supabase/migrations) in filename order. The migrations are cumulative and are required for customer accounts, categories, sharing, quote details, the active cart, pricing, and current security policies.

Create the first Authentication user after applying `schema.sql` but before applying `20260927_add_customer_accounts_and_sets.sql`. That migration preserves existing Auth users as administrators; users registered afterward receive the customer role.

### Customer accounts and project sets

Before enabling public registration, confirm that all migrations have completed successfully. Do not expose registration while only the base schema is installed.

Run `npm run dev` to start the app.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to self-host Noto Sans, with Geist Mono for monospaced text.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
