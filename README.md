# Closingan 
**The AI Sales Copilot for Automotive Dealerships**

Closingan is NOT a standard CRM, a generic WhatsApp clone, or a passive reporting dashboard. 

It is an **AI-driven execution engine** designed specifically for automotive salespeople. By transforming raw WhatsApp conversations into actionable insights, Closingan bridges the gap between lead generation and vehicle sales, ensuring no prospect is left behind due to missed follow-ups or slow response times.

## 🎯 Core Philosophy
- **Lead-Centric, Not Conversation-Centric:** Focuses on the status and intent of the buyer rather than just sorting chronological chat bubbles.
- **Action over Analytics:** The dashboard is an *Action Center* built to answer one question: *"What should I do right now to close a deal?"*
- **Proactive over Reactive:** Powered by Follow-Up Intelligence to detect overdue leads before they go cold.

## ✨ Key Capabilities
*   **AI Copilot Workspace:** Integrates directly into the chat interface, providing real-time Buying Intent analysis, Risk Signals, and Context-Aware Suggested Replies based on car brochures and financing rules.
*   **Smart Lead Prioritization (Heat Score):** Automatically ranks leads (Low, Warm, Hot, Critical) based on conversation context and engagement velocity.
*   **Automated Data Ingestion:** Seamlessly captures incoming WhatsApp messages via Fonnte webhook and maps them to the correct dealership and sales rep.
*   **Enterprise-Grade B2B Security:** Built from day one with strict Multi-Tenant architecture (Dealership/Supervisor isolation) to prevent data leakage.

## 🏗️ Architecture & Tech Stack

Closingan is built as a modern, scalable monorepo designed for high-throughput messaging and AI processing.

**Frontend (UI/UX)**
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS (Bento-box UI, ultra-premium data-dense design)
*   **Focus:** Mobile-first responsiveness for field sales reps.

**Backend (API & Core Logic)**
*   **Framework:** NestJS (TypeScript, Domain-Driven Design)
*   **Database:** PostgreSQL with `pgvector` (for AI Semantic Search & Knowledge Base embeddings)
*   **ORM:** Prisma Client
*   **Message Queue:** BullMQ + Redis (for handling asynchronous AI generation and WhatsApp Webhook bursts without blocking the main thread)
*   **AI Engine:** OpenAI API (`gpt-4o-mini` optimized for speed and token efficiency)
*   **Messaging Gateway:** Fonnte API

## 🚀 Development Roadmap
- [x] **Phase 1:** Frontend Action Center Refactor (UI/UX Locked)
- [x] **Phase 2:** Database Foundation & Strict Multi-Tenant Schema (Merged)
- [x] **Phase 3:** Fonnte Webhook Data Ingestion Pipeline (Merged)
- [ ] **Phase 4:** BullMQ Queue Integration & OpenAI Context Processing *(In Progress)*
- [ ] **Phase 5:** Two-way WhatsApp Message Delivery
- [ ] **Phase 6:** AI Knowledge Base (Vectorizing car brochures and credit simulation rules)
