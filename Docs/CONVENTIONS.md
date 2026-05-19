# CONVENTIONS.md — Coding Conventions CLOSINGAN
> Aturan penamaan, pola kode, format response, dan standar yang WAJIB diikuti
> di seluruh codebase. Berlaku untuk backend (NestJS) dan frontend (Next.js).
>
> **AI coding assistant: baca file ini sebelum menulis kode apapun.**
>
> Owner: Ricky Darmawan Lambogo

---

## 1. Naming Conventions

### File & Folder

```
# Backend NestJS — kebab-case
src/
  modules/
    conversation/
      conversation.module.ts
      conversation.controller.ts
      conversation.service.ts
      conversation.repository.ts
      dto/
        create-conversation.dto.ts
        update-conversation.dto.ts
      entities/
        conversation.entity.ts
  common/
    guards/
      jwt-auth.guard.ts
      entitlement.guard.ts
    decorators/
      tenant.decorator.ts
      audit.decorator.ts
    pipes/
      parse-tenant.pipe.ts
    filters/
      global-exception.filter.ts

# Frontend Next.js — kebab-case folders, PascalCase components
app/
  (dashboard)/
    page.tsx
  inbox/
    page.tsx
    [conversationId]/
      page.tsx
components/
  inbox/
    ConversationList.tsx
    ConversationItem.tsx
    MessageBubble.tsx
    AiSuggestionPanel.tsx
  ui/
    HeatBadge.tsx
    AiModeBadge.tsx
```

---

### Variables & Functions

```typescript
// ✅ BENAR — camelCase
const tenantId = 'clxxx'
const hotLeadCount = 5
const isAiActive = true
const conversationState = ConversationState.OPEN

async function findConversationById(id: string, tenantId: string) {}
async function updateAiMode(conversationId: string, mode: AiMode) {}

// ❌ SALAH
const TenantId = 'clxxx'          // PascalCase untuk variable
const hot_lead_count = 5          // snake_case
const isactive = true             // tidak jelas
```

---

### Classes & Interfaces

```typescript
// ✅ BENAR — PascalCase
class ConversationService {}
class HotLeadDetector {}
interface WhatsappProviderInterface {}
interface AiProviderInterface {}

// DTOs
class CreateFollowUpDto {}
class UpdateAiModeDto {}

// Entities (Prisma)
// Gunakan nama sesuai schema: Conversation, Message, Lead, dll
```

---

### Database (Prisma)

```
// Model names — PascalCase singular
model Conversation { ... }
model WhatsappSession { ... }

// Field names — camelCase
tenantId, createdAt, updatedAt, heatTier, aiMode

// Relation names — camelCase
conversations, followUps, aiUsageLogs

// ❌ JANGAN
tenant_id, heat_tier, created_at  // snake_case di Prisma bukan konvensi kita
```

---

### API Endpoints

```
// REST — kebab-case, plural nouns
GET    /conversations
POST   /conversations
GET    /conversations/:id
PATCH  /conversations/:id/ai-mode
POST   /conversations/:id/archive

GET    /follow-ups
POST   /follow-ups
PATCH  /follow-ups/:id/complete
PATCH  /follow-ups/:id/snooze

// ❌ JANGAN
GET /getConversations           // verb dalam URL
GET /Conversation               // singular + PascalCase
POST /conversations/createNew   // redundant
```

---

### Constants & Enums

```typescript
// Enums — PascalCase type, SCREAMING_SNAKE_CASE values
enum AiMode {
  AI_ASSIST = 'AI_ASSIST',
  SMART_HYBRID = 'SMART_HYBRID',
  AUTO_REPLY = 'AUTO_REPLY',
  AI_OFF = 'AI_OFF',
}

enum HeatTier {
  LOW = 'LOW',
  WARM = 'WARM',
  HOT = 'HOT',
  CRITICAL = 'CRITICAL',
}

// Constants
const QUOTA_WARNING_THRESHOLD = 70
const HUMAN_TAKEOVER_COOLDOWN_MINUTES = 15
const MAX_BLAST_MESSAGES_PER_MINUTE = 20
```

---

### Events (BullMQ & WebSocket)

```typescript
// Queue job names — SCREAMING_SNAKE_CASE
'PROCESS_AI_REPLY'
'DETECT_HOT_LEAD'
'SEND_ESCALATION_ALERT'
'SEND_FOLLOW_UP_REMINDER'
'GENERATE_CONVERSATION_SUMMARY'

// WebSocket events — kebab-case dengan namespace
'conversation:updated'
'conversation:state_changed'
'lead:heat_changed'
'ai:mode_changed'
'system:alert'
'quota:warning'
'wa:status_changed'
```

---

## 2. Response Format Pattern

**Selalu gunakan format standar ini. Jangan buat format sendiri.**

```typescript
// ✅ Gunakan ResponseBuilder helper
import { ResponseBuilder } from '@/common/helpers/response.builder'

// Single object
return ResponseBuilder.success(data)

// List dengan pagination
return ResponseBuilder.list(data, { nextCursor, hasNext })

// Error
throw new AppException('CONVERSATION_NOT_FOUND', 'Percakapan tidak ditemukan.')
```

```typescript
// ResponseBuilder implementation
export class ResponseBuilder {
  static success(data: any) {
    return { success: true, data }
  }

  static list(data: any[], meta: PaginationMeta) {
    return { success: true, data, meta }
  }
}

// AppException
export class AppException extends HttpException {
  constructor(code: string, message: string, httpStatus = 400, details = {}) {
    super({ success: false, error: { code, message, details } }, httpStatus)
  }
}
```

---

## 3. Error Handling Pattern

```typescript
// ✅ BENAR — throw AppException dengan error code
async findConversation(id: string, tenantId: string) {
  const conversation = await this.prisma.conversation.findFirst({
    where: { id, tenantId }  // WAJIB include tenantId
  })

  if (!conversation) {
    throw new AppException('CONVERSATION_NOT_FOUND', 'Percakapan tidak ditemukan.', 404)
  }

  return conversation
}

// ✅ BENAR — try/catch untuk external calls
async sendWhatsappMessage(to: string, content: string) {
  try {
    return await this.whatsappProvider.send(to, content)
  } catch (error) {
    this.logger.error('WA send failed', { to, error: error.message })
    throw new AppException('WA_SEND_FAILED', 'Gagal mengirim pesan WhatsApp.', 500)
  }
}

// ❌ SALAH
throw new Error('not found')          // tidak pakai AppException
throw new HttpException('Error', 400) // tidak pakai error code
if (!conv) return null                // silent failure
```

---

## 4. Tenant Isolation Pattern

**Ini adalah aturan PALING KRITIS. Pelanggaran = security bug.**

```typescript
// ✅ BENAR — selalu include tenantId dari JWT
async getConversations(tenantId: string, filters: any) {
  return this.prisma.conversation.findMany({
    where: {
      tenantId,          // WAJIB — jangan pernah skip ini
      ...filters,
    }
  })
}

// ✅ BENAR — extract tenantId dari decorator
@Get()
async list(@TenantId() tenantId: string) {
  return this.conversationService.findAll(tenantId)
}

// ❌ SALAH — query tanpa tenantId
async getConversations(filters: any) {
  return this.prisma.conversation.findMany({ where: filters })
  // ^^^^^^ SECURITY BUG — bisa return data tenant lain
}

// ❌ SALAH — ambil tenantId dari body
async getConversations(@Body() body: { tenantId: string }) {
  // ^^^^^^ SECURITY BUG — user bisa manipulasi tenantId
}
```

---

## 5. AI Safety Pattern

**Semua AI output WAJIB melewati AISafetyService.**

```typescript
// ✅ BENAR
async processAiReply(conversation: Conversation, message: string) {
  const aiOutput = await this.aiProvider.generateReply(message)

  // WAJIB — validasi sebelum kirim
  const safetyCheck = await this.aiSafetyService.validate(aiOutput)

  if (!safetyCheck.isSafe) {
    // Block dan escalate
    await this.escalationService.create({
      conversationId: conversation.id,
      reason: safetyCheck.blockReason,
      blockedContent: aiOutput,
    })
    return  // jangan kirim
  }

  await this.whatsappProvider.send(conversation.customerPhone, aiOutput)
}

// ❌ SALAH — kirim tanpa safety check
async processAiReply(conversation: Conversation, message: string) {
  const aiOutput = await this.aiProvider.generateReply(message)
  await this.whatsappProvider.send(conversation.customerPhone, aiOutput)
  // ^^^^^^ DANGEROUS — tidak ada safety validation
}
```

---

## 6. Logging Pattern

```typescript
// ✅ BENAR — structured logging dengan Pino
this.logger.info('AI reply sent', {
  tenantId,
  conversationId,
  model: 'gpt-4o-mini',
  latencyMs: 820,
})

this.logger.error('Fonnte API failed', {
  tenantId,
  error: error.message,
  // ❌ JANGAN masukkan: fonnteToken, passwordHash, apiKey
})

// ✅ Log level yang tepat
this.logger.debug(...)  // development detail
this.logger.info(...)   // normal operations
this.logger.warn(...)   // degraded state
this.logger.error(...)  // failures

// ❌ JANGAN pernah log
this.logger.info('token: ' + fonnteToken)    // secret
this.logger.info('password: ' + password)    // credential
this.logger.info(JSON.stringify(user))       // bisa contain sensitive data
```

---

## 7. Queue Job Pattern

```typescript
// ✅ BENAR — job data harus minimal, cukup untuk fetch dari DB
await this.hotLeadQueue.add('DETECT_HOT_LEAD', {
  tenantId: 'clxxx',
  conversationId: 'clyyy',
  messageId: 'clzzz',
  // Jangan masukkan konten pesan lengkap — fetch dari DB di worker
})

// ✅ Worker pattern
@Processor('hot-lead')
export class HotLeadProcessor {
  @Process('DETECT_HOT_LEAD')
  async handle(job: Job<{ tenantId: string; conversationId: string }>) {
    const { tenantId, conversationId } = job.data

    // Fetch fresh dari DB di dalam worker
    const conversation = await this.conversationRepo.findById(conversationId, tenantId)
    // ...proses
  }
}

// ❌ SALAH — masukkan data besar ke job
await this.queue.add('DETECT', {
  tenantId,
  conversationId,
  fullConversationHistory: [...],  // terlalu besar, gunakan DB
  customerDetails: { ... },
})
```

---

## 8. DTO Pattern

```typescript
// ✅ BENAR — validasi ketat dengan class-validator
import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator'

export class CreateFollowUpDto {
  @IsString()
  conversationId: string

  @IsString()
  @MaxLength(200)
  reason: string

  @IsDateString()
  dueAt: string

  @IsOptional()
  @IsEnum(FollowUpUrgency)
  urgency?: FollowUpUrgency = FollowUpUrgency.MEDIUM
}

// ✅ Controller wajib pakai ValidationPipe
@Post()
async create(
  @Body() dto: CreateFollowUpDto,
  @TenantId() tenantId: string,
) {
  return this.followUpService.create(tenantId, dto)
}

// ❌ SALAH — tidak ada validasi
@Post()
async create(@Body() body: any) {
  return this.followUpService.create(body.tenantId, body)
  // ^^^^^^ SECURITY BUG — tenantId dari body + no validation
}
```

---

## 9. Frontend Patterns

### Component naming
```tsx
// ✅ PascalCase, deskriptif
export function ConversationItem({ conversation }: Props) {}
export function HeatBadge({ tier }: Props) {}
export function AiSuggestionPanel({ suggestion, onSend, onEdit }: Props) {}

// ❌
export function item() {}      // lowercase
export function Comp1() {}     // tidak deskriptif
```

### State management
```tsx
// ✅ Zustand untuk global state
const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
}))

// ✅ useState untuk local UI state
const [isDropdownOpen, setIsDropdownOpen] = useState(false)

// ❌ localStorage / sessionStorage — tidak supported di Claude.ai artifacts
// ❌ Redux — overkill, gunakan Zustand
```

### API calls
```tsx
// ✅ Custom hooks untuk data fetching
function useConversations(filters: ConversationFilters) {
  return useSWR(['/conversations', filters], fetcher)
}

// ✅ Error handling di UI
{error && (
  <div className="text-red-500">
    {error.code === 'WA_NOT_CONNECTED'
      ? 'WhatsApp belum terconnect. Hubungkan dulu di Settings.'
      : 'Terjadi kesalahan. Coba lagi.'}
  </div>
)}
```

---

## 10. Commit Message Convention

```
feat: tambah hot lead detection service
fix: perbaiki race condition di token quota counter
chore: update dependencies
refactor: pisahkan AI safety layer ke service terpisah
test: tambah unit test untuk tenant isolation
docs: update API contracts untuk endpoint campaigns

# Format: <type>: <deskripsi singkat dalam bahasa Indonesia atau Inggris>
# Types: feat | fix | chore | refactor | test | docs | perf
```

---

## 11. Anti-Patterns — JANGAN DILAKUKAN

| Anti-Pattern | Kenapa Salah | Solusi |
|---|---|---|
| Query tanpa `tenantId` | Security leak | Selalu include `tenantId` dari JWT |
| `console.log()` di production | Tidak structured | Gunakan Pino logger |
| Secret/key di log | Expose credentials | Jangan pernah log sensitive data |
| tenantId dari request body | User bisa manipulasi | Ambil dari JWT via decorator |
| AI reply tanpa safety check | Klaim berbahaya terkirim | Selalu lewat AISafetyService |
| Hard-code enum values sebagai string | Inconsistency | Import dan gunakan enum |
| Kirim konten pesan besar ke queue | Memory overhead | Hanya kirim ID, fetch di worker |
| `throw new Error()` biasa | Tidak ada error code | Gunakan AppException |
| localStorage di frontend | Tidak supported | Gunakan Zustand state |
| `any` type di TypeScript | Hilangkan type safety | Selalu define proper types |

---

## 12. Environment Variables — Cara Pakai

```typescript
// ✅ BENAR — akses via ConfigService (NestJS)
constructor(private configService: ConfigService) {}

const jwtSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
const openAiKey = this.configService.get<string>('OPENAI_API_KEY')

// ❌ SALAH — akses langsung process.env
const jwtSecret = process.env.JWT_ACCESS_SECRET
// ^^^^^^ Tidak testable, tidak ada type safety
```

---

*File ini adalah konvensi koding yang berlaku di seluruh CLOSINGAN codebase.*
*Setiap PR yang melanggar konvensi ini harus diperbaiki sebelum merge.*
*Owner: Ricky Darmawan Lambogo*
