# EduAI Calendar + Todo Feature

This workspace contains a transplantable `Next.js + TypeScript + Tailwind + MongoDB` calendar feature for EduAI. It includes:

- A modern three-column planner UI with sidebar, weekly calendar, and right rail
- Event creation, editing, deletion, and drag-to-reschedule
- Todo list with priorities, completion state, and optional calendar linking
- In-app notifications plus email reminder dispatch logic
- MongoDB-backed persistence and API routes ready for integration
- AI-assisted schedule suggestions

## Structure

- `app/calendar/page.tsx`: calendar feature entry page
- `components/calendar/*`: UI components
- `app/api/events`, `app/api/tasks`, `app/api/notifications`: backend route handlers
- `lib/calendar/*`: repository, Mongo models, email, AI scheduling, utility functions

## API Endpoints

- `GET /api/calendar/overview`
- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `GET /api/notifications`
- `POST /api/notifications/run`
- `POST /api/ai/auto-schedule`

## Notification Flow

1. Events and tasks store their reminder windows in the database.
2. `POST /api/notifications/run` scans for near-term events and incomplete tasks.
3. The dispatcher writes `in_app` and `email` notifications.
4. Email notifications are sent with NodeMailer when SMTP credentials are configured.
5. If SMTP is missing, the route returns email previews instead of failing.

Recommended scheduling options:

- `Vercel Cron`: call `/api/notifications/run` every 15 minutes
- `node-cron` in a worker process if you have a custom server

## Integration Steps

1. Copy the `components/calendar`, `lib/calendar`, and `app/api/*` routes into your EduAI app.
2. Merge `app/globals.css` tokens and the `tailwind.config.ts` theme extensions into your existing setup.
3. Add the dependencies from `package.json`.
4. Configure `.env` values for MongoDB (`MONGODB_URI`, optional `MONGODB_DB_NAME`) and SMTP.
5. Replace the demo `userId` lookup inside `lib/calendar/repository.ts` with your authenticated user session.
6. Wire your sidebar route to `/calendar`.
7. Schedule `POST /api/notifications/run` with your preferred cron system.

## Local Setup

The feature now uses MongoDB directly. Start a local Mongo instance (or use MongoDB Atlas), set `MONGODB_URI` in `.env.local`, then run `npm run dev`.
