# SCHEMA.md — Database Schema CLOSINGAN
> **Single Source of Truth untuk struktur database.**
> Jika ada konflik antara dokumen lain dan file ini — **file ini yang benar.**
> Update file ini setiap kali ada migrasi database.
>
> Owner: Ricky Darmawan Lambogo

---

## Enums

```prisma
enum UserRole          { SALES  ADMIN }

enum SubscriptionState { TRIAL  ACTIVE  PAST_DUE  SUSPENDED  CANCELLED }
enum SubscriptionPlan  { STARTER  PRO  ELITE }

enum ConversationState {
  OPEN  WAITING_CUSTOMER  WAITING_SELLER
  HUMAN_ACTIVE  AI_ACTIVE  ESCALATED  ARCHIVED
}

enum AiMode { AI_ASSIST  SMART_HYBRID  AUTO_REPLY  AI_OFF }

enum HeatTier { LOW  WARM  HOT  CRITICAL }

enum MessageSenderType   { CUSTOMER  SELLER  AI  SYSTEM }
enum MessageDeliveryState { QUEUED  SENT  DELIVERED  READ  FAILED }

enum FollowUpStatus  { PENDING  DUE  OVERDUE  COMPLETED  SNOOZED  CANCELLED }
enum FollowUpUrgency { LOW  MEDIUM  HIGH  CRITICAL }

enum CampaignStatus {
  DRAFT  PENDING_REVIEW  APPROVED
  RUNNING  PAUSED  COMPLETED  FAILED  CANCELLED
}
enum RecipientStatus { QUEUED  SENT  DELIVERED  FAILED  SUPPRESSED  SKIPPED }

enum EscalationReason {
  CREDIT_SIMULATION_REQUEST  PRICE_NEGOTIATION  SERIOUS_COMPLAINT
  AI_LOW_CONFIDENCE  UNKNOWN_INTENT  FINANCIAL_CLAIM_BLOCKED  MANUAL_TRIGGER
}

enum AuditAction {
  USER_LOGIN  USER_LOGOUT  USER_REGISTER  PASSWORD_CHANGED  EMAIL_CHANGED
  WA_CONNECTED  WA_DISCONNECTED  AI_MODE_CHANGED
  FOLLOW_UP_CREATED  FOLLOW_UP_COMPLETED  FOLLOW_UP_SNOOZED
  LEAD_HEAT_UPDATED  CAMPAIGN_CREATED  CAMPAIGN_APPROVED  CAMPAIGN_CANCELLED
  SUBSCRIPTION_CHANGED  PAYMENT_PROCESSED  QUOTA_TOPPED_UP
  SUPPRESSION_ADDED  SUPPRESSION_REMOVED  DATA_EXPORTED  PROFILE_UPDATED
}

enum WaSessionState { CONNECTED  DISCONNECTED  RECONNECTING  EXPIRED }
enum InvoiceStatus  { PENDING  PAID  FAILED  EXPIRED  REFUNDED }
enum ReferralStatus { SIGNED_UP  TRIAL_ACTIVE  CONVERTED_TO_PAID  EXPIRED }
enum QueueName      { HOT_LEAD  AI_REPLY  ESCALATION  FOLLOW_UP  SUMMARY  ANALYTICS  BLAST }
```

---

## Models

```prisma
// ─── TENANT & USER ──────────────────────────────────────────

model Tenant {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users               User[]
  whatsappSession     WhatsappSession?
  conversations       Conversation[]
  leads               Lead[]
  followUps           FollowUp[]
  tokenQuota          TokenQuota?
  aiUsageLogs         AiUsageLog[]
  auditLogs           AuditLog[]
  campaigns           Campaign[]
  suppressionList     SuppressionList[]
  analyticsEvents     AnalyticsEvent[]
  knowledgeBase       KnowledgeBase[]
  subscription        Subscription?
  quickReplyTemplates QuickReplyTemplate[]
  conversationLabels  ConversationLabel[]
  churnSignals        ChurnSignal[]
  notificationPrefs   NotificationPreference?
}

model User {
  id             String   @id @default(cuid())
  tenantId       String
  email          String   @unique
  emailVerified  Boolean  @default(false)
  passwordHash   String
  role           UserRole @default(SALES)

  // Profile
  fullName       String?
  avatarUrl      String?
  dealerName     String?
  dealerCity     String?
  carBrands      String[]        // e.g. ["Toyota", "Honda"]
  bio            String?         @db.VarChar(200)

  // WA personal number for system notifications
  waPersonalNumber   String?
  waPersonalVerified Boolean  @default(false)

  // Security
  loginAttempts  Int       @default(0)
  lockedUntil    DateTime?
  lastLoginAt    DateTime?
  lastLoginIp    String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant         Tenant         @relation(fields: [tenantId], references: [id])
  refreshTokens  RefreshToken[]
  otpCodes       OtpCode[]
  auditLogs      AuditLog[]
  aiFeedback     AiFeedback[]
  referralsMade  Referral[]     @relation("ReferralMaker")
  referralUsed   Referral?      @relation("ReferralReceiver")
  exitSurveys    ExitSurvey[]
  badges         UserBadge[]

  @@index([tenantId])
  @@index([email])
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

model OtpCode {
  id        String    @id @default(cuid())
  userId    String
  code      String
  type      String    // EMAIL_VERIFY | PASSWORD_RESET | WA_VERIFY
  expiresAt DateTime
  attempts  Int       @default(0)
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ─── WHATSAPP ────────────────────────────────────────────────

model WhatsappSession {
  id                 String         @id @default(cuid())
  tenantId           String         @unique
  phoneNumber        String
  phoneNumberHash    String         // SHA-256 for trial abuse prevention
  displayName        String?
  fonnteToken        String         // AES-256 encrypted
  state              WaSessionState @default(DISCONNECTED)
  lastConnectedAt    DateTime?
  lastDisconnectedAt DateTime?
  reconnectAttempts  Int            @default(0)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  tenant             Tenant @relation(fields: [tenantId], references: [id])

  @@index([phoneNumberHash])
}

// ─── CONVERSATION & MESSAGES ─────────────────────────────────

model Conversation {
  id                 String            @id @default(cuid())
  tenantId           String
  customerPhone      String
  customerName       String?
  state              ConversationState @default(OPEN)
  aiMode             AiMode            @default(AI_ASSIST)
  aiModePausedUntil  DateTime?         // human takeover cooldown end time
  unreadCount        Int               @default(0)
  lastMessageAt      DateTime?
  lastMessagePreview String?
  lastSenderType     MessageSenderType?
  isArchived         Boolean           @default(false)
  archivedAt         DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  tenant           Tenant                       @relation(fields: [tenantId], references: [id])
  messages         Message[]
  lead             Lead?
  followUps        FollowUp[]
  escalations      EscalationLog[]
  summary          ConversationSummary?
  labelAssignments ConversationLabelAssignment[]

  @@index([tenantId])
  @@index([tenantId, state])
  @@index([tenantId, lastMessageAt])
  @@index([customerPhone, tenantId])
}

model Message {
  id              String               @id @default(cuid())
  tenantId        String
  conversationId  String
  externalId      String?              // Fonnte message ID — for deduplication
  senderType      MessageSenderType
  senderName      String?
  content         String               @db.Text
  deliveryState   MessageDeliveryState @default(QUEUED)
  deliveredAt     DateTime?
  isAiGenerated   Boolean              @default(false)
  aiMode          AiMode?
  knowledgeBaseId String?
  idempotencyKey  String?              @unique

  createdAt       DateTime @default(now())

  conversation    Conversation @relation(fields: [conversationId], references: [id])

  @@index([conversationId])
  @@index([tenantId])
  @@index([externalId])
}

// ─── LEADS ───────────────────────────────────────────────────

model Lead {
  id             String    @id @default(cuid())
  tenantId       String
  conversationId String    @unique
  customerPhone  String
  customerName   String?
  heatScore      Float     @default(0)
  heatTier       HeatTier  @default(LOW)
  heatReasons    String[]  // human-readable: ["Tanya harga", "Balas cepat"]
  heatUpdatedAt  DateTime?
  heatDecayAt    DateTime?
  isHotAlertSent Boolean   @default(false)
  lastAlertSentAt DateTime?
  notes          String?   @db.Text
  sellerOverride HeatTier?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant       Tenant       @relation(fields: [tenantId], references: [id])
  conversation Conversation @relation(fields: [conversationId], references: [id])

  @@index([tenantId])
  @@index([tenantId, heatTier])
  @@index([tenantId, heatUpdatedAt])
}

// ─── FOLLOW-UPS ──────────────────────────────────────────────

model FollowUp {
  id             String          @id @default(cuid())
  tenantId       String
  conversationId String
  reason         String
  dueAt          DateTime
  status         FollowUpStatus  @default(PENDING)
  urgency        FollowUpUrgency @default(MEDIUM)
  snoozedUntil   DateTime?
  completedAt    DateTime?
  cancelledAt    DateTime?
  notifiedAt     DateTime?
  createdBy      String          // user_id or "AI"

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant       Tenant       @relation(fields: [tenantId], references: [id])
  conversation Conversation @relation(fields: [conversationId], references: [id])

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, dueAt, status])
}

// ─── AI SYSTEM ───────────────────────────────────────────────

model AiUsageLog {
  id               String     @id @default(cuid())
  tenantId         String
  conversationId   String?
  messageId        String?
  model            String     // gpt-4o-mini | gpt-4o
  promptTokens     Int
  completionTokens Int
  totalTokens      Int
  latencyMs        Int
  wasBlocked       Boolean    @default(false)
  blockReason      String?
  knowledgeBaseId  String?
  queueName        QueueName?

  createdAt        DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, createdAt])
}

model EscalationLog {
  id             String           @id @default(cuid())
  tenantId       String
  conversationId String
  reason         EscalationReason
  triggeredBy    String           // "AI" or user_id
  aiOutput       String?          @db.Text
  blockedContent String?          @db.Text
  resolvedAt     DateTime?
  resolvedBy     String?

  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])

  @@index([tenantId])
  @@index([conversationId])
}

model AiFeedback {
  id              String   @id @default(cuid())
  tenantId        String
  userId          String
  messageId       String
  feedbackType    String   // HELPFUL | NOT_HELPFUL
  aiSuggestion    String   @db.Text
  actualReplySent String?  @db.Text

  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, createdAt])
}

model KnowledgeBase {
  id                  String   @id @default(cuid())
  tenantId            String
  objectionPattern    String   @db.Text
  recommendedResponse String   @db.Text
  category            String   // HARGA | KREDIT | STOK | KOMPETITOR | TIMING | LAINNYA
  isActive            Boolean  @default(true)
  usageCount          Int      @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, isActive])
}

model ConversationSummary {
  id             String   @id @default(cuid())
  tenantId       String
  conversationId String   @unique
  summaryText    String   @db.Text
  leadStatus     String   // interested | not-interested | follow-up-needed | deal-done
  nextAction     String?
  keyInfo        Json?    // { budget, preferredModel, timeline }

  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])

  @@index([tenantId])
}

// ─── CAMPAIGNS ───────────────────────────────────────────────

model Campaign {
  id              String         @id @default(cuid())
  tenantId        String
  name            String
  goal            String?
  status          CampaignStatus @default(DRAFT)
  messageTemplate String         @db.Text
  recipientSource String         // hot_leads | follow_up | manual | csv
  scheduledAt     DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  totalRecipients Int            @default(0)
  sentCount       Int            @default(0)
  deliveredCount  Int            @default(0)
  failedCount     Int            @default(0)
  approvedBy      String?
  approvedAt      DateTime?
  cancelledBy     String?
  cancelledReason String?
  createdBy       String

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant     Tenant              @relation(fields: [tenantId], references: [id])
  recipients CampaignRecipient[]

  @@index([tenantId])
  @@index([tenantId, status])
}

model CampaignRecipient {
  id              String          @id @default(cuid())
  tenantId        String
  campaignId      String
  phoneNumber     String
  phoneNormalized String          // E.164: +6281234567890
  name            String?
  status          RecipientStatus @default(QUEUED)
  sentAt          DateTime?
  deliveredAt     DateTime?
  failureReason   String?
  externalMsgId   String?

  createdAt       DateTime @default(now())

  campaign Campaign @relation(fields: [campaignId], references: [id])

  @@unique([campaignId, phoneNormalized])
  @@index([campaignId])
  @@index([tenantId, status])
}

model SuppressionList {
  id              String    @id @default(cuid())
  tenantId        String
  phoneNumber     String
  phoneNormalized String
  reason          String    // OPTED_OUT | MANUAL_BLOCK | REPEATED_FAILURE
  addedBy         String    // user_id or "SYSTEM"
  isActive        Boolean   @default(true)
  addedAt         DateTime  @default(now())
  removedAt       DateTime?
  removedBy       String?
  removalReason   String?

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, phoneNormalized])
  @@index([tenantId, isActive])
}

// ─── BILLING ─────────────────────────────────────────────────

model Subscription {
  id                 String            @id @default(cuid())
  tenantId           String            @unique
  plan               SubscriptionPlan  @default(STARTER)
  state              SubscriptionState @default(TRIAL)
  trialEndsAt        DateTime?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelledAt        DateTime?
  suspendedAt        DateTime?
  pastDueAt          DateTime?
  waNumberHash       String?           // trial abuse prevention
  referralCode       String?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  invoices Invoice[]

  @@index([state])
  @@index([trialEndsAt])
}

model Invoice {
  id              String        @id @default(cuid())
  tenantId        String
  subscriptionId  String
  amount          Int           // IDR, no decimal: 99000 = Rp 99.000
  currency        String        @default("IDR")
  status          InvoiceStatus @default(PENDING)
  description     String
  externalId      String?       // payment gateway ID
  paymentUrl      String?
  paidAt          DateTime?
  failedAt        DateTime?
  expiredAt       DateTime?
  idempotencyKey  String        @unique

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([tenantId])
  @@index([externalId])
}

model TokenQuota {
  id           String   @id @default(cuid())
  tenantId     String   @unique
  totalQuota   Int
  usedQuota    Int      @default(0)
  graceBuffer  Int      // 5% of totalQuota
  periodStart  DateTime
  periodEnd    DateTime
  warned70At   DateTime?
  warned85At   DateTime?
  warned95At   DateTime?
  lastSyncAt   DateTime @default(now())

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])
}

// ─── ANALYTICS ───────────────────────────────────────────────

model AnalyticsEvent {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String?
  eventName  String
  sessionId  String?
  properties Json?
  ipAddress  String?
  userAgent  String?

  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, eventName])
  @@index([tenantId, createdAt])
}

// ─── AUDIT LOG ───────────────────────────────────────────────

model AuditLog {
  id         String      @id @default(cuid())
  tenantId   String
  userId     String?
  action     AuditAction
  entityType String?
  entityId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?

  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User?  @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, action])
  @@index([tenantId, createdAt])
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

model NotificationPreference {
  id                String   @id @default(cuid())
  tenantId          String   @unique
  hotLeadAlert      Boolean  @default(true)
  escalationAlert   Boolean  @default(true)  // NOT user-configurable
  disconnectAlert   Boolean  @default(true)  // NOT user-configurable
  dailyDigest       Boolean  @default(true)
  dailyDigestTime   String   @default("07:30")
  weeklySummary     Boolean  @default(true)
  idleAlert         Boolean  @default(true)
  quotaWarning      Boolean  @default(true)

  updatedAt         DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])
}

// ─── REFERRAL ────────────────────────────────────────────────

model Referral {
  id           String         @id @default(cuid())
  referrerId   String
  receiverId   String?        @unique
  referralCode String         @unique
  status       ReferralStatus @default(SIGNED_UP)
  rewardGivenAt DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  referrer Tenant @relation("ReferralMaker", fields: [referrerId], references: [id])
  receiver Tenant? @relation("ReferralReceiver", fields: [receiverId], references: [id])

  @@index([referrerId])
  @@index([referralCode])
}

// ─── UX FEATURES ─────────────────────────────────────────────

model QuickReplyTemplate {
  id         String   @id @default(cuid())
  tenantId   String
  name       String
  shortcut   String   // /harga, /greeting
  content    String   @db.Text
  category   String   // Greeting | Info Produk | Harga | Follow-up | Closing
  variables  String[] // ["nama", "model", "dealer"]
  usageCount Int      @default(0)
  isActive   Boolean  @default(true)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, shortcut])
  @@index([tenantId])
}

model ConversationLabel {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  color     String   // hex: #FF4D4D

  createdAt DateTime @default(now())

  tenant      Tenant                       @relation(fields: [tenantId], references: [id])
  assignments ConversationLabelAssignment[]

  @@unique([tenantId, name])
  @@index([tenantId])
}

model ConversationLabelAssignment {
  id             String   @id @default(cuid())
  conversationId String
  labelId        String
  assignedAt     DateTime @default(now())

  conversation Conversation      @relation(fields: [conversationId], references: [id])
  label        ConversationLabel @relation(fields: [labelId], references: [id])

  @@unique([conversationId, labelId])
  @@index([conversationId])
}

// ─── RETENTION ───────────────────────────────────────────────

model ChurnSignal {
  id         String    @id @default(cuid())
  tenantId   String
  signalType String    // LOGIN_FREQUENCY_DROP | AI_INACTIVE | RENEWAL_NEAR_NO_ACTIVITY
  detectedAt DateTime  @default(now())
  resolvedAt DateTime?
  notes      String?

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}

model ExitSurvey {
  id                  String   @id @default(cuid())
  tenantId            String
  userId              String
  reason              String   // PRICE | NO_TIME | WRONG_FIT | SWITCHING | TEMPORARY | OTHER
  reasonDetail        String?  @db.Text
  npsScore            Int?
  saveOfferShown      Boolean  @default(false)
  saveOfferAccepted   Boolean  @default(false)

  createdAt           DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([tenantId])
}

// ─── SYSTEM ──────────────────────────────────────────────────

model FailedJob {
  id           String    @id @default(cuid())
  queueName    QueueName
  jobId        String
  jobData      Json
  errorMessage String    @db.Text
  errorStack   String?   @db.Text
  attemptCount Int
  failedAt     DateTime  @default(now())
  retriedAt    DateTime?
  resolvedAt   DateTime?

  @@index([queueName])
  @@index([failedAt])
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badge    String   // EARLY_ADOPTER | EARLY_CONTRIBUTOR | PRO_USER
  earnedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, badge])
}
```

---

## Aturan Wajib

| Aturan | Detail |
|---|---|
| **tenantId di semua tabel** | Kecuali `RefreshToken`, `OtpCode`, `UserBadge` (scope via userId) |
| **Soft delete** | Gunakan `isArchived`, `isActive`, `cancelledAt` — bukan hard delete |
| **Timestamps** | Semua tabel: `createdAt`. Yang bisa update: `updatedAt` |
| **Monetary values** | Integer IDR tanpa desimal: `99000` = Rp 99.000 |
| **Phone numbers** | Simpan dua format: raw (`081234`) dan E.164 normalized (`+6281234`) |
| **Secrets** | Selalu enkripsi sebelum simpan (Fonnte token, dll) |
| **Idempotency** | Payment operations wajib punya `idempotencyKey` |

---

*Owner: Ricky Darmawan Lambogo*
