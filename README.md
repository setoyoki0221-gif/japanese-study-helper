# 日本語テスト — Japanese Word & Sentence Testing

A Next.js app for studying and testing Japanese vocabulary and sentences, organized by Unit.

## Features

- **Auth** — register, log in, log out (email + password, JWT session cookie).
- **Units** — create units and fill each with **words** (Japanese / reading / meaning) and **sentences** (Japanese / meaning).
- **Word test** — pick a unit, a word count, and a time limit; you are shown each meaning and type the Japanese (kanji **or** kana reading accepted).
- **Sentence test** — pick a unit and a time limit; you are shown each meaning and type the Japanese sentence.
- **History** — every test result is recorded (score, correct/total, time used) with a per-question breakdown.

Answers are graded leniently (whitespace/punctuation-insensitive) and **on the server**, using the unit's stored answers.

## Tech stack

- Next.js 16 (App Router, TypeScript) + Tailwind CSS v4
- MongoDB via Mongoose
- Auth: `bcryptjs` (hashing) + `jose` (JWT in an httpOnly cookie); routes guarded by `proxy.ts`

## Setup

1. **MongoDB** — have a MongoDB running. The default connection string is local:

   ```
   mongodb://127.0.0.1:27017/japanese-test
   ```

   To use MongoDB Atlas (or any other instance), edit `MONGODB_URI` in `.env.local`.

2. **Environment** — `.env.local` is already created with `MONGODB_URI` and a random `AUTH_SECRET`.

3. **Install & run**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000 — you'll be redirected to `/login`. Create an account to start.

## Project layout

```
app/
  (auth)/login, (auth)/register   Auth pages
  (app)/dashboard                 Stats overview
  (app)/units, units/[id]         Manage units, words & sentences
  (app)/test/word, test/text      Take timed tests
  (app)/history                   Past results
  api/auth/*                      register / login / logout
  api/units, api/units/[id]       Unit CRUD
  api/tests                       Submit (graded) & list history
lib/
  db.ts        Cached Mongoose connection
  models.ts    User, Unit (words[] + sentences[]), TestHistory
  auth.ts      Password hashing + JWT session
  grade.ts     Lenient answer matching
  api.ts       Route helpers (auth guard, error handling)
  serialize.ts Mongoose doc -> JSON
proxy.ts       Route protection (formerly middleware)
```

## Notes

- `npm run build` requires no network. (The default `create-next-app` Geist Google Fonts were removed in favor of a system font stack so builds work offline.)
- Data model: words and sentences are embedded inside each Unit document; test results live in their own `testhistories` collection.
