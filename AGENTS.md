# AGENTS.md — Instruksi untuk AI Coding Agent
# CLOSINGAN — AI Assistant untuk Sales Mobil Indonesia

> File ini dibaca oleh AI coding agent (Claude, Cursor, Copilot, Jules, dll)
> sebelum mengerjakan task apapun di repository ini.
> Ikuti semua instruksi di sini tanpa pengecualian.
>
> Owner: Ricky Darmawan Lambogo

---

## Identitas Project

**Nama:** CLOSINGAN
**Deskripsi:** SaaS multi-tenant berbasis WhatsApp untuk sales mobil Indonesia.
AI membantu sales merespons lead lebih cepat, mendeteksi hot lead, dan tidak melewatkan follow-up.
**Stack:** NestJS · PostgreSQL · Prisma · Redis · BullMQ · Next.js · shadcn/ui · Socket.io · Fonnte · OpenAI

---

## Dokumen Referensi Wajib

Sebelum menulis kode, AI agent WAJIB merujuk dokumen berikut sesuai jenis task:

| Dokumen | Lokasi | Wajib Dibaca Untuk |
|---|---|---|
| `CONVENTIONS.md` | `/docs/CONVENTIONS.md` | **Semua task tanpa kecuali** |
| `SCHEMA.md` | `/docs/SCHEMA.md` | Task yang menyentuh database |
| `API_CONTRACTS.md` | `/docs/API_CONTRACTS.md` | Task yang membuat atau memodifikasi endpoint |
| `PROJECT_CONTEXT.md` | `/docs/PROJECT_CONTEXT.md` | Orientasi awal di session baru |
| `srs/fr-[module].md` | `/docs/srs/` | Task untuk modul spesifik |
| `CHANGELOG.md` | `/CHANGELOG.md` | Cek progress sebelum mulai task baru |

---

## Aturan Wajib — Tidak Bisa Dikompromikan

### 1. Tenant Isolation — SELALU

```typescript
// SETIAP query database WAJIB include tenantId
// Ambil tenantId dari JWT via decorator — BUKAN dari request body

// ✅ BENAR
const conversations = await prisma.conversation.findMany({
  where: { tenantId, ...otherFilters }
})

// ❌ SALAH — SECURITY BUG, jangan pernah tulis ini
const conversations = await prisma.conversation.findMany({
  where: { ...otherFilters }  // missing tenantId
})
```

### 2. AI Safety — SELALU

```typescript
// Semua AI output WAJIB melewati AISafetyService sebelum dikirim
// Jangan pernah kirim AI output langsung ke WhatsApp tanpa validasi

// ✅ BENAR
const aiOutput = await aiProvider.generate(prompt)
const safetyCheck = await aiSafetyService.validate(aiOutput)
if (!safetyCheck.isSafe) {
  await escalationService.create({ reason: safetyCheck.blockReason })
  return  // stop — jangan kirim
}
await whatsappProvider.send(phone, aiOutput)

// ❌ SALAH — DANGEROUS
const aiOutput = await aiProvider.generate(prompt)
await whatsappProvider.send(phone, aiOutput)  // tidak ada safety check
```

### 3. Provider Abstraction — SELALU

```typescript
// CLOSINGAN punya satu system Fonnte account
// User TIDAK perlu input token apapun
// User hanya scan QR dari dashboard

// ✅ BENAR — gunakan system token dari ConfigService
const systemToken = this.configService.get('FONNTE_SYSTEM_TOKEN')
const qr = await this.waProvider.generateQrCode(tenantId, systemToken)

// ✅ BENAR — gunakan fonnteDeviceId per tenant (dari database)
await this.waProvider.sendMessage(session.fonnteDeviceId, to, message)

// ❌ SALAH — meminta user input token
// JANGAN PERNAH buat form yang meminta Fonnte token dari user
// JANGAN PERNAH simpan token user di WhatsappSession
```

**Interface yang benar:**
```typescript
interface WhatsappProviderInterface {
  generateQrCode(tenantId: string): Promise<{ qrCode: string, expiresAt: Date }>
  checkConnectionStatus(deviceId: string): Promise<WaSessionState>
  sendMessage(deviceId: string, to: string, message: string): Promise<{ messageId: string }>
  validateWebhookSignature(payload: any, signature: string): boolean
}
```

### 4. Error Handling — SELALU

```typescript
// Selalu gunakan AppException dengan error code
// Jangan pernah throw Error() biasa

// ✅ BENAR
throw new AppException('CONVERSATION_NOT_FOUND', 'Percakapan tidak ditemukan.', 404)

// ❌ SALAH
throw new Error('not found')
throw new HttpException('Error', 400)
return null  // silent failure
```

### 5. Logging — SELALU

```typescript
// Gunakan Pino logger — bukan console.log
// Jangan pernah log: token, password, API key, secret

// ✅ BENAR
this.logger.info('Message sent', { tenantId, conversationId, latencyMs })
this.logger.error('WA send failed', { tenantId, error: error.message })

// ❌ SALAH
console.log('token:', fonnteToken)
this.logger.info('user:', JSON.stringify(user))  // bisa expose passwordHash
```

---

## Hal yang TIDAK BOLEH Dibuat

Jangan pernah membuat fitur atau kode untuk hal berikut, apapun alasannya:

- Instagram / Facebook DM integration
- Loan calculator atau simulasi kredit engine
- Enterprise CRM pipeline
- AI yang mengirim angka DP, cicilan, atau kredit secara otomatis
- Query database tanpa `tenantId` filter
- Menyimpan secret/token dalam plain text di database
- `console.log()` di production code
- `any` type di TypeScript kecuali benar-benar tidak bisa dihindari
- `localStorage` atau `sessionStorage` di frontend
- Hard-coded nilai enum sebagai string literal

---

## Cara AI Agent Harus Bekerja

### Sebelum Menulis Kode

1. Baca `CHANGELOG.md` — cek task apa yang sudah selesai
2. Baca task yang diminta dari Phase Plan yang relevan
3. Identifikasi dokumen referensi yang diperlukan
4. **Jelaskan rencana implementasi terlebih dahulu** sebelum menulis kode
5. Tunggu konfirmasi dari owner jika ada keputusan arsitektur yang tidak jelas

### Saat Menulis Kode

1. Ikuti semua naming convention di `CONVENTIONS.md`
2. Gunakan enum dari `SCHEMA.md` — jangan buat ulang
3. Gunakan error codes dari `API_CONTRACTS.md` — jangan buat kode baru
4. Setiap service method yang query database: **wajib ada `tenantId` parameter**
5. Setiap endpoint: **wajib ada `JwtAuthGuard` dan `@TenantId()` decorator**
6. Setiap AI operation: **wajib ada safety validation**

### Setelah Menulis Kode

1. Sertakan unit test untuk setiap fungsi kritis
2. Pastikan ada test untuk **cross-tenant isolation** di setiap module baru
3. Sebutkan checklist yang sudah dan belum selesai dari task tersebut
4. Ingatkan owner untuk update `CHANGELOG.md`

---

## Response Format dari AI Agent

Saat menyelesaikan task, AI agent harus memberikan response dalam format ini:

```
## Task: [Nama Task]

### Yang Dikerjakan
- [daftar singkat apa yang dibuat/diubah]

### File yang Dibuat / Dimodifikasi
- `src/modules/xxx/xxx.service.ts` — [deskripsi singkat]
- `src/modules/xxx/xxx.controller.ts` — [deskripsi singkat]

### Checklist dari Phase Plan
- [x] Requirement 1 selesai
- [x] Requirement 2 selesai
- [ ] Requirement 3 belum — [alasan / perlu keputusan]

### Test yang Disertakan
- Unit test: [deskripsi]
- Integration test: [deskripsi jika ada]

### Hal yang Perlu Diperhatikan Owner
- [warning, keputusan yang perlu dikonfirmasi, atau risiko]

### Langkah Berikutnya
- Update CHANGELOG.md: tandai task ini selesai
- Jalankan: `npm test` untuk verify
- Lanjut ke task: [nama task berikutnya]
```

---

## Queue Priority — Jangan Dilanggar

```typescript
// Urutan priority TIDAK BOLEH diubah tanpa persetujuan owner
const QUEUE_PRIORITY = {
  'hot-lead':   { priority: 1, maxConcurrent: 10 },  // CRITICAL
  'ai-reply':   { priority: 2, maxConcurrent: 10 },  // HIGH
  'escalation': { priority: 2, maxConcurrent: 5  },  // HIGH
  'follow-up':  { priority: 3, maxConcurrent: 3  },  // MEDIUM
  'summary':    { priority: 3, maxConcurrent: 3  },  // MEDIUM
  'analytics':  { priority: 4, maxConcurrent: 2  },  // LOW
  'blast':      { priority: 5, maxConcurrent: 2  },  // LOWEST — isolated pool
}

// blast queue TIDAK BOLEH menggunakan worker pool yang sama dengan ai-reply
```

---

## Conversation & AI State — Jangan Diubah Sembarangan

```
Conversation States yang valid:
OPEN → WAITING_CUSTOMER → WAITING_SELLER
                        → HUMAN_ACTIVE   (sales balas manual)
                        → AI_ACTIVE      (AI sedang aktif)
                        → ESCALATED      (butuh intervensi sales)
                        → ARCHIVED

AI Modes yang valid (per conversation):
AI_ASSIST · SMART_HYBRID · AUTO_REPLY · AI_OFF

Human Takeover Rule:
Sales balas manual → state = HUMAN_ACTIVE → AI pause cooldown 15 menit
→ setelah cooldown → kembali ke mode sebelumnya (jika HYBRID/AUTO)

JANGAN buat transition state yang tidak ada di daftar ini.
```

---

## Monetary Values

```typescript
// SELALU simpan dalam integer IDR tanpa desimal
// 99000 = Rp 99.000
// JANGAN gunakan float untuk uang

// ✅ BENAR
const amount = 99000  // Rp 99.000

// ❌ SALAH
const amount = 99.000   // float, rounding error
const amount = "99000"  // string
```

---

## Phone Number Format

```typescript
// Simpan SELALU dua format
phoneNumber: '081234567890'           // raw, seperti yang user input
phoneNormalized: '+6281234567890'     // E.164, untuk deduplication & suppression

// Fungsi normalisasi:
function normalizePhoneId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+62' + digits.slice(1)
  if (digits.startsWith('62')) return '+' + digits
  return '+62' + digits
}
```

---

## Environment Variables

```typescript
// SELALU akses via ConfigService — BUKAN process.env langsung
// ✅
const key = this.configService.get<string>('OPENAI_API_KEY')
// ❌
const key = process.env.OPENAI_API_KEY
```

---

## Pertanyaan yang Harus Ditanyakan ke Owner Sebelum Lanjut

AI agent WAJIB berhenti dan bertanya ke owner jika menemukan situasi berikut:

1. Ada keputusan arsitektur yang tidak tercakup di dokumen manapun
2. Ada konflik antara dua dokumen (misalnya SCHEMA.md vs FR file)
3. Task membutuhkan perubahan pada schema database yang sudah ada
4. Task melibatkan fitur yang ada di "Hal yang TIDAK BOLEH Dibuat"
5. Ada risiko security yang ditemukan di kode yang sudah ada
6. Ada ambiguitas di requirement yang bisa menghasilkan implementasi berbeda

**Jangan pernah "menebak" untuk hal-hal di atas. Lebih baik tanya dan lambat daripada salah implementasi.**

---

## Update CHANGELOG.md

Setiap kali task selesai, ingatkan owner untuk:

```markdown
# Di CHANGELOG.md, ganti:
- [ ] ⏳ TASK X.X — Nama Task

# Menjadi:
- [x] ✅ TASK X.X — Nama Task

# Dan tambahkan entry di bagian LOG:
### [Tanggal]
- ✅ TASK X.X — Nama Task selesai
  - [catatan singkat jika ada keputusan penting]
```

---

*File ini adalah instruksi permanen untuk semua AI coding agent yang bekerja di repository CLOSINGAN.*
*Jangan modifikasi file ini tanpa persetujuan Ricky Darmawan Lambogo.*
