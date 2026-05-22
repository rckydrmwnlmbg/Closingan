# API_CONTRACTS.md — API Endpoint Contracts
# CLOSINGAN Single Source of Truth

> Semua endpoint, request shape, response shape, dan error codes.
> AI coding assistant wajib merujuk file ini sebelum membuat endpoint baru.
>
> **Base URL:** `https://api.closingan.id/v1`
> **Auth:** Bearer JWT di header `Authorization: Bearer <access_token>`
> **Content-Type:** `application/json`
>
> Owner: Ricky Darmawan Lambogo

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true
  }
}
```

> `meta` hanya ada pada endpoint yang return list/pagination.

### Error

```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "Percakapan tidak ditemukan.",
    "details": {}
  }
}
```

---

## Error Codes Master List

| Code | HTTP | Keterangan |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token tidak valid atau expired |
| `FORBIDDEN` | 403 | Tidak punya akses ke resource ini |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 422 | Input tidak valid (details berisi field errors) |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `INTERNAL_ERROR` | 500 | Server error |
| `USER_NOT_FOUND` | 404 | User tidak ditemukan |
| `EMAIL_ALREADY_EXISTS` | 409 | Email sudah terdaftar |
| `EMAIL_DISPOSABLE` | 422 | Email disposable tidak diizinkan |
| `OTP_INVALID` | 422 | OTP salah |
| `OTP_EXPIRED` | 422 | OTP sudah expired |
| `OTP_MAX_ATTEMPTS` | 429 | Terlalu banyak percobaan OTP, coba lagi nanti |
| `ACCOUNT_LOCKED` | 423 | Akun terkunci sementara |
| `EMAIL_NOT_VERIFIED` | 403 | Email belum diverifikasi |
| `WA_NOT_CONNECTED` | 422 | WhatsApp belum terconnect |
| `WA_ALREADY_CONNECTED` | 409 | WhatsApp sudah terconnect |
| `TRIAL_ALREADY_USED` | 409 | Nomor WA ini sudah pernah digunakan untuk trial |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation tidak ditemukan |
| `AI_QUOTA_EXCEEDED` | 402 | Quota AI habis |
| `PLAN_UPGRADE_REQUIRED` | 403 | Fitur ini membutuhkan upgrade plan |
| `CAMPAIGN_INVALID_STATE` | 422 | Campaign tidak bisa di-update dalam status ini |
| `DUPLICATE_WEBHOOK` | 200 | Webhook sudah diproses sebelumnya (idempotent) |
| `INVOICE_ALREADY_PAID` | 409 | Invoice sudah dibayar |
| `SUPPRESSED_NUMBER` | 422 | Nomor ini ada di suppression list |

---

## AUTH

### `POST /auth/register`
Daftarkan user baru. Trial belum aktif sampai WA connect.

**Request:**
```json
{
  "email": "ricky@gmail.com",
  "password": "Min8chars1",
  "fullName": "Ricky Darmawan"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "userId": "clxxx",
    "email": "ricky@gmail.com",
    "message": "OTP verifikasi telah dikirim ke email kamu."
  }
}
```

**Errors:** `EMAIL_ALREADY_EXISTS` · `EMAIL_DISPOSABLE` · `VALIDATION_ERROR`

---

### `POST /auth/verify-otp`
**Request:** `{ "userId": "clxxx", "code": "123456" }`

**Response 200:** `{ "success": true, "data": { "verified": true } }`

**Errors:** `OTP_INVALID` · `OTP_EXPIRED` · `OTP_MAX_ATTEMPTS`

---

### `POST /auth/resend-otp`
**Request:** `{ "userId": "clxxx" }`

**Response 200:** `{ "success": true, "data": { "message": "OTP baru telah dikirim." } }`

---

### `POST /auth/login`
**Request:** `{ "email": "ricky@gmail.com", "password": "Min8chars1" }`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "clxxx",
      "email": "ricky@gmail.com",
      "fullName": "Ricky Darmawan",
      "role": "SALES"
    }
  }
}
```

**Errors:** `USER_NOT_FOUND` · `ACCOUNT_LOCKED` · `EMAIL_NOT_VERIFIED`

---

### `POST /auth/refresh`
**Request:** `{ "refreshToken": "eyJ..." }`

**Response 200:** `{ "success": true, "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." } }`

**Errors:** `UNAUTHORIZED` (token invalid/expired/already-used)

---

### `POST /auth/logout`
**Auth required.**
**Request:** `{ "refreshToken": "eyJ..." }`
**Response 200:** `{ "success": true }`

---

### `POST /auth/forgot-password`
**Request:** `{ "email": "ricky@gmail.com" }`
**Response 200:** `{ "success": true, "data": { "message": "Link reset dikirim ke email." } }`

---

### `POST /auth/reset-password`
**Request:** `{ "token": "reset_token_xxx", "newPassword": "NewPass123" }`
**Response 200:** `{ "success": true }`

---

## USERS / PROFILE

### `GET /users/me`
**Auth required.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "email": "ricky@gmail.com",
    "fullName": "Ricky Darmawan",
    "avatarUrl": null,
    "dealerName": "Dealer Maju Jaya",
    "dealerCity": "Jakarta",
    "carBrands": ["Toyota", "Daihatsu"],
    "waPersonalNumber": "6281234567890",
    "role": "SALES",
    "subscription": {
      "plan": "PRO",
      "state": "ACTIVE",
      "currentPeriodEnd": "2026-06-17T00:00:00Z"
    }
  }
}
```

---

### `PATCH /users/me`
**Auth required.**

**Request (semua field optional):**
```json
{
  "fullName": "Ricky D. Lambogo",
  "dealerName": "AutoPro Jakarta",
  "dealerCity": "Jakarta Selatan",
  "carBrands": ["Toyota", "Honda"],
  "bio": "Sales otomotif 5 tahun pengalaman",
  "waPersonalNumber": "6281234567890"
}
```

**Response 200:** `{ "success": true, "data": { ...updated user } }`

---

### `POST /users/me/change-password`
**Auth required.**
**Request:** `{ "currentPassword": "OldPass1", "newPassword": "NewPass1" }`
**Response 200:** `{ "success": true }`
**Errors:** `VALIDATION_ERROR` (current password salah)

---

## WHATSAPP

> ⚠️ Model diupdate v1.1: User cukup scan QR. Tidak ada user token input.
> CLOSINGAN memiliki satu system Fonnte account di backend.

### `GET /whatsapp/status`
**Auth required.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "state": "CONNECTED",
    "phoneNumber": "+6281234567890",
    "displayName": "Ricky Sales",
    "lastConnectedAt": "2026-05-17T10:00:00Z"
  }
}
```

---

### `POST /whatsapp/generate-qr`
**Auth required.** Generate QR code untuk user scan.
Dipanggil saat user buka Settings > WA Connection dan belum connected.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2026-05-17T10:01:00Z",
    "expiresInSeconds": 60
  }
}
```

**Errors:** `WA_ALREADY_CONNECTED`

---

### `GET /whatsapp/qr-status`
**Auth required.** Polling endpoint — frontend call setiap 3 detik untuk cek apakah QR sudah di-scan.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "state": "WAITING_SCAN",
    "qrExpired": false
  }
}
```

`state` values: `WAITING_SCAN` · `CONNECTED` · `QR_EXPIRED`

---

### `POST /whatsapp/disconnect`
**Auth required.**
**Response 200:** `{ "success": true }`

---

### `POST /webhook/whatsapp`
**No auth. Validated via `X-Fonnte-Signature` header.**

**Response 200:** `{ "success": true }`
**Response 200 (duplicate):** `{ "success": true, "code": "DUPLICATE_WEBHOOK" }`
**Errors:** `UNAUTHORIZED` (invalid signature)

---

## CONVERSATIONS

### `GET /conversations`
**Auth required.**

**Query params:**
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `state` | string | — | Filter: OPEN / WAITING_CUSTOMER / ESCALATED / ARCHIVED |
| `aiMode` | string | — | Filter: AI_ASSIST / AUTO_REPLY / AI_OFF / SMART_HYBRID |
| `heatTier` | string | — | Filter: LOW / WARM / HOT / CRITICAL |
| `search` | string | — | Search by nama / nomor |
| `cursor` | string | — | Cursor pagination |
| `limit` | int | 20 | Max 50 |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "customerPhone": "+6281234567890",
      "customerName": "Budi Santoso",
      "state": "OPEN",
      "aiMode": "AUTO_REPLY",
      "unreadCount": 3,
      "lastMessageAt": "2026-05-17T10:28:00Z",
      "lastMessagePreview": "Pak, Avanza G ada stoknya?",
      "lastSenderType": "CUSTOMER",
      "heatTier": "HOT",
      "heatReasons": ["Tanya stok", "Balas cepat"],
      "hasOverdueFollowUp": false
    }
  ],
  "meta": { "nextCursor": "clyyy", "hasNext": true }
}
```

---

### `GET /conversations/:id`
**Auth required.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "customerPhone": "+6281234567890",
    "customerName": "Budi Santoso",
    "state": "OPEN",
    "aiMode": "AUTO_REPLY",
    "aiModePausedUntil": null,
    "unreadCount": 0,
    "lead": {
      "heatTier": "HOT",
      "heatReasons": ["Tanya stok", "Balas cepat"],
      "heatScore": 0.82
    },
    "summary": null,
    "labels": ["Avanza", "Kredit"]
  }
}
```

---

### `GET /conversations/:id/messages`
**Auth required.**

**Query:** `cursor`, `limit` (default 30)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "senderType": "CUSTOMER",
      "senderName": "Budi Santoso",
      "content": "Pak, Avanza G ada stoknya?",
      "deliveryState": "READ",
      "isAiGenerated": false,
      "aiMode": null,
      "createdAt": "2026-05-17T10:28:00Z"
    }
  ],
  "meta": { "nextCursor": "clyyy", "hasNext": true }
}
```

---

### `POST /conversations/:id/messages`
**Auth required.** Kirim pesan manual dari seller.

**Request:** `{ "content": "Siap pak, stok tersedia! 😊" }`
**Response 201:** `{ "success": true, "data": { ...message object } }`
**Errors:** `CONVERSATION_NOT_FOUND`

---

### `PATCH /conversations/:id/ai-mode`
**Auth required.**

**Request:** `{ "aiMode": "AI_ASSIST" }`
**Response 200:** `{ "success": true, "data": { "aiMode": "AI_ASSIST" } }`
**Errors:** `VALIDATION_ERROR` (invalid aiMode value)

---

### `PATCH /conversations/:id/archive`
**Auth required.**
**Response 200:** `{ "success": true }`

---

### `POST /conversations/:id/ai-suggest`
**Auth required.** Minta AI suggestion untuk conversation (mode AI_ASSIST).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "suggestion": "Harga OTR Avanza G Jabodetabek sekitar Rp 265-275 juta...",
    "model": "gpt-4o-mini",
    "latencyMs": 820
  }
}
```
**Errors:** `AI_QUOTA_EXCEEDED`

---

## LEADS

### `GET /leads`
**Auth required.**

**Query:** `heatTier`, `cursor`, `limit` (default 20)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "conversationId": "clyyy",
      "customerName": "Budi Santoso",
      "customerPhone": "+6281234567890",
      "heatTier": "HOT",
      "heatReasons": ["Tanya harga", "Balas cepat"],
      "heatScore": 0.85,
      "heatUpdatedAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

---

### `PATCH /leads/:id/heat-override`
**Auth required.** Manual override heat tier oleh seller.

**Request:** `{ "heatTier": "HOT" }`
**Response 200:** `{ "success": true, "data": { "heatTier": "HOT", "sellerOverride": "HOT" } }`

---

## FOLLOW-UPS

### `GET /follow-ups`
**Auth required.**

**Query:** `status` (PENDING/DUE/OVERDUE/COMPLETED), `cursor`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "conversationId": "clyyy",
      "customerName": "Reza Pratama",
      "reason": "Konfirmasi simulasi kredit",
      "dueAt": "2026-05-17T15:00:00Z",
      "status": "DUE",
      "urgency": "HIGH"
    }
  ]
}
```

---

### `POST /follow-ups`
**Auth required.**

**Request:**
```json
{
  "conversationId": "clxxx",
  "reason": "Tindak lanjut simulasi kredit",
  "dueAt": "2026-05-18T10:00:00Z",
  "urgency": "HIGH"
}
```

**Response 201:** `{ "success": true, "data": { ...follow-up object } }`

---

### `PATCH /follow-ups/:id/complete`
**Auth required.**
**Response 200:** `{ "success": true }`

---

### `PATCH /follow-ups/:id/snooze`
**Auth required.**

**Request:** `{ "snoozeUntil": "2026-05-18T10:00:00Z" }`
**Response 200:** `{ "success": true, "data": { "status": "SNOOZED", "snoozedUntil": "..." } }`

---

### `DELETE /follow-ups/:id`
**Auth required.**
**Response 200:** `{ "success": true }`

---

## DASHBOARD

### `GET /dashboard/summary`
**Auth required.** Data operasional hari ini, cached 30 detik.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "hotLeadsToday": 3,
    "pendingReply": 7,
    "longestPendingMinutes": 32,
    "followUpToday": 4,
    "followUpOverdue": 1,
    "aiStatus": {
      "isActive": true,
      "mode": "AUTO_REPLY"
    },
    "waStatus": {
      "state": "CONNECTED",
      "phoneNumber": "+6281234567890"
    },
    "criticalAlerts": [
      {
        "type": "ESCALATION_PENDING",
        "message": "Reza Pratama minta simulasi kredit",
        "conversationId": "clxxx"
      }
    ],
    "quotaUsagePercent": 42
  }
}
```

---

## CAMPAIGNS

### `GET /campaigns`
**Auth required.**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "Follow-up Mei Minggu 3",
      "status": "RUNNING",
      "totalRecipients": 120,
      "sentCount": 67,
      "scheduledAt": "2026-05-17T08:00:00Z"
    }
  ]
}
```

---

### `POST /campaigns`
**Auth required.**

**Request:**
```json
{
  "name": "Follow-up Hot Leads Mei",
  "goal": "Re-engage leads yang belum closing",
  "messageTemplate": "Halo {{nama}}, masih tertarik dengan {{model}}? Kami ada promo menarik minggu ini 😊",
  "recipientSource": "hot_leads",
  "scheduledAt": "2026-05-20T09:00:00Z"
}
```

**Response 201:** `{ "success": true, "data": { ...campaign object, "status": "DRAFT" } }`

---

### `POST /campaigns/:id/approve`
**Auth required.** Seller wajib approve sebelum campaign bisa run.
**Response 200:** `{ "success": true, "data": { "status": "APPROVED" } }`
**Errors:** `CAMPAIGN_INVALID_STATE`

---

### `POST /campaigns/:id/pause`
**Auth required.**
**Response 200:** `{ "success": true, "data": { "status": "PAUSED" } }`

---

### `POST /campaigns/:id/resume`
**Auth required.**
**Response 200:** `{ "success": true, "data": { "status": "RUNNING" } }`

---

### `POST /campaigns/:id/cancel`
**Auth required.**
**Request:** `{ "reason": "Sudah tidak relevan" }`
**Response 200:** `{ "success": true, "data": { "status": "CANCELLED" } }`

---

### `GET /campaigns/:id/recipients`
**Auth required.**
**Query:** `status`, `cursor`, `limit`

---

## BILLING

### `GET /billing/subscription`
**Auth required.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "plan": "PRO",
    "state": "ACTIVE",
    "currentPeriodStart": "2026-05-01T00:00:00Z",
    "currentPeriodEnd": "2026-06-01T00:00:00Z",
    "quota": {
      "total": 50000,
      "used": 21000,
      "usedPercent": 42,
      "graceBuffer": 2500
    }
  }
}
```

---

### `POST /billing/topup`
**Auth required.** Beli AI Credit add-on.

**Request:** `{ "amount": 50000, "creditAmount": 10000 }`
**Response 200:** `{ "success": true, "data": { "invoiceId": "clxxx", "paymentUrl": "https://..." } }`

---

### `GET /billing/invoices`
**Auth required.**
**Query:** `cursor`, `limit`

---

### `POST /webhook/payment`
**No auth.** Validated via payment gateway signature header.

**Response 200:** `{ "success": true }`
**Response 200 (duplicate):** `{ "success": true, "code": "DUPLICATE_WEBHOOK" }`

---

## SETTINGS

### `GET /settings/whatsapp`
### `GET /settings/ai`
### `PATCH /settings/ai`
**Request:** `{ "defaultAiMode": "AI_ASSIST", "humanTakeoverCooldownMinutes": 15 }`

### `GET /settings/notifications`
### `PATCH /settings/notifications`
**Request:** `{ "hotLeadAlert": true, "dailyDigest": false, "dailyDigestTime": "08:00" }`

### `GET /settings/suppression`
### `POST /settings/suppression`
**Request:** `{ "phoneNumber": "081234567890", "reason": "MANUAL_BLOCK" }`

### `DELETE /settings/suppression/:id`

### `GET /settings/quick-replies`
### `POST /settings/quick-replies`
### `PATCH /settings/quick-replies/:id`
### `DELETE /settings/quick-replies/:id`

### `GET /settings/referral`
**Response:** referral code + list referrals + rewards earned

---

## ANALYTICS

### `GET /analytics/seller`
**Auth required.**
**Query:** `range` (7d / 30d)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "avgResponseTimeMinutes": 4.2,
    "leadsRespondedToday": 12,
    "leadsRespondedYesterday": 9,
    "hotLeadConversionRate": 0.68,
    "followUpCompletionRate": 0.81,
    "aiReplyRatio": 0.73,
    "manualReplyRatio": 0.27,
    "trend": [
      { "date": "2026-05-11", "responded": 8 },
      { "date": "2026-05-12", "responded": 12 }
    ]
  }
}
```

---

## ADMIN (Founder Only)

### `GET /admin/queue-health`
**Auth required (ADMIN role).**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "queues": [
      { "name": "HOT_LEAD", "waiting": 0, "active": 1, "failed": 0 },
      { "name": "AI_REPLY", "waiting": 3, "active": 5, "failed": 0 }
    ]
  }
}
```

---

### `GET /admin/failed-jobs`
### `POST /admin/failed-jobs/:id/retry`
### `GET /admin/business-metrics`
### `GET /admin/ai-performance`
### `GET /admin/at-risk-users`

---

## HEALTH

### `GET /health`
**No auth.**
**Response 200:** `{ "status": "ok", "timestamp": "2026-05-17T10:00:00Z" }`

### `GET /status`
**No auth.** Public status page data.

---

## WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `conversation:updated` | Server → Client | `{ conversationId, unreadCount, lastMessage }` |
| `conversation:state_changed` | Server → Client | `{ conversationId, state }` |
| `lead:heat_changed` | Server → Client | `{ conversationId, heatTier, heatReasons }` |
| `ai:mode_changed` | Server → Client | `{ conversationId, aiMode }` |
| `system:alert` | Server → Client | `{ type, message, conversationId? }` |
| `quota:warning` | Server → Client | `{ usedPercent, threshold }` |
| `wa:status_changed` | Server → Client | `{ state, phoneNumber }` |

> Semua events hanya dikirim ke socket rooms milik tenant yang relevan.
> Cross-tenant event broadcast adalah security violation.

---

*Owner: Ricky Darmawan Lambogo*
