# CLOSINGAN

AI-powered WhatsApp CRM for automotive sales teams in Indonesia.

## Status
🚧 **In active development.** Pre-launch — not yet live with paying customers.

## What it does
CLOSINGAN helps automotive sales teams manage and respond to WhatsApp leads with AI-assisted conversation handling. It uses a QR-code connection model: CLOSINGAN owns the system's WhatsApp account via the Fonnte API, so end users don't need to supply their own API tokens.

## Tech stack
TypeScript, Next.js, Prisma ORM, PostgreSQL, Redis (background job processing), Fonnte WhatsApp Business API, OpenAI integration.

## Engineering notes
Built and maintained solo, using an AI-agent-assisted development workflow (Google Jules). Notable production issues resolved during development include:
- A blocked Prisma database migration in production
- A CI pipeline out-of-memory crash (resolved by running tests serially)
- A Redis-based queue/throttling incompatibility

## Documentation
See [`/Docs`](./Docs) for PRD, phase plans, API contracts, and schema documentation.

## Contact
Ricky Darmawan Lambogo — rickydarmawan212@gmail.com
