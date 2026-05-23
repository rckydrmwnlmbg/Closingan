1. Spec Compliance Findings (Grouped by High, Medium, Low severity).

**High Severity**
*   **Endpoints missing JwtAuthGuard or tenant extraction**: `apps/api/src/health/health.controller.ts`, `apps/api/src/app.controller.ts`, and `apps/api/src/webhook/webhook.controller.ts` are missing JwtAuthGuard. `apps/api/src/modules/dashboard/dashboard.controller.ts` missing `@TenantId()` extraction.
*   **Prisma queries missing tenantId (Tenant Isolation Breach)**: 56 occurrences found across multiple services (e.g., `audit.service.ts`, `dashboard.service.ts`, `follow-up.service.ts`, `hot-lead.service.ts`, `conversation.service.ts`, `ai-reply.worker.ts`, `whatsapp.controller.ts`, `auth.service.ts`).
*   **AI flows bypassing AISafetyService**: `OpenAiService` is used directly in tests and providers without passing through `AISafetyService`. `AISafetyService` does exist but is not used in the main logic (e.g., in `OpenAiService` or `ai-reply.worker.ts`).
*   **Error handling violations (Error() instead of AppException)**: Found instances in `apps/api/src/queue/workers/ai-reply.worker.ts` throwing generic `Error` instead of `AppException`.
*   **Phone normalization & monetary value handling violations**: Phone number normalization is not implemented.

**Medium Severity**
*   **Forbidden console.log**: Found in `apps/web/src/components/inbox/MessageThread.tsx` and `apps/web/src/app/dashboard/page.tsx`.
*   **Invalid conversation/AI mode state transitions**: Hardcoded strings like `'AI_MODE_CHANGED'` used instead of strict schema enum values.

**Low Severity**
*   **Hardcoded enums instead of schema enums**: Found in `apps/api/src/queue/workers/ai-reply.worker.ts` (`'AI_MODE_CHANGED' as any`, `'AI_REPLY' as any`).
*   **API contract or DTO/schema mismatches**: Response format (`ResponseBuilder`) mostly compliant, but detailed schema verification is needed for some DTOs.
*   **Forbidden features accidentally introduced**: AI Safety limits are checked via basic regex that might be too superficial for simulasi kredit.

2. List of exact files that need changes.
- apps/api/src/health/health.controller.ts
- apps/api/src/app.controller.ts
- apps/api/src/webhook/webhook.controller.ts
- apps/api/src/modules/dashboard/dashboard.controller.ts
- apps/api/src/common/audit/audit.service.ts
- apps/api/src/modules/dashboard/dashboard.service.ts
- apps/api/src/modules/follow-up/follow-up.service.ts
- apps/api/src/modules/lead/hot-lead.service.ts
- apps/api/src/modules/lead/queue/hot-lead.processor.ts
- apps/api/src/modules/conversation/conversation.repository.ts
- apps/api/src/modules/conversation/conversation.service.ts
- apps/api/src/queue/workers/ai-reply.worker.ts
- apps/api/src/whatsapp/controllers/whatsapp.controller.ts
- apps/api/src/whatsapp/tasks/disconnect-detection.service.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/ai/openai.service.ts
- apps/api/src/ai/ai.module.ts
- apps/web/src/components/inbox/MessageThread.tsx
- apps/web/src/app/dashboard/page.tsx

3. Compliance score out of 10.
4/10.

Which severity level or specific domain should we fix first?
