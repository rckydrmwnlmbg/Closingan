import { Inject } from "@nestjs/common";
import { Injectable, Logger } from '@nestjs/common';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LeadAnalysisSchema, LeadAnalysisDto } from './dto/lead-analysis.dto';
import { HeatTier } from '@prisma/client';

@Injectable()
export class HotLeadService {
  private readonly logger = new Logger(HotLeadService.name);

  // Kata kunci sederhana untuk mendeteksi intent awal.
  private readonly intentKeywords = [
    'harga',
    'price',
    'promo',
    'diskon',
    'cicilan',
    'kredit',
    'dp',
    'simulasi',
    'stok',
    'ready',
    'warna',
    'test drive',
    'lokasi',
    'dealer',
    'showroom',
    'kapan',
    'besok',
    'hari ini',
    'nego',
    'minat',
  ];

  constructor(
    @Inject('AI_PROVIDER') private readonly openAiService: AiProviderInterface,
    private readonly prisma: PrismaService,
    @InjectQueue('hot-lead') private readonly hotLeadQueue: Queue,
  ) {}

  /**
   * Pre-filtering untuk menentukan apakah pesan layak dikirim ke LLM.
   */
  shouldAnalyzeMessage(messageContent: string): boolean {
    const contentLower = messageContent.toLowerCase();

    // Jika pesan terlalu pendek dan tidak mengandung angka, abaikan
    if (contentLower.length < 5 && !/\d/.test(contentLower)) {
      return false;
    }

    // Cek apakah ada keyword intent
    const hasIntentKeyword = this.intentKeywords.some((keyword) =>
      contentLower.includes(keyword),
    );

    // Cek apakah ada angka (mungkin nominal harga/DP)
    const hasNumbers = /\d{4,}/.test(contentLower);

    return hasIntentKeyword || hasNumbers;
  }

  /**
   * Menganalisis lead menggunakan AI.
   * Mengharapkan pemanggilan di dalam worker/background job yang sudah dibungkus `cls.run()`.
   */
  async analyzeLead(
    tenantId: string,
    conversationId: string,
    messageContent: string,
  ): Promise<void> {
    // 1. Cost Control & Pre-Filtering
    if (!this.shouldAnalyzeMessage(messageContent)) {
      this.logger.debug(
        `Message skipped from analysis for conversation: ${conversationId}`,
      );
      return;
    }

    // Ambil data lead saat ini
    const lead = await this.prisma.lead.findUnique({
      where: { conversationId },
    });

    if (!lead || lead.tenantId !== tenantId) {
      this.logger.warn(`Lead not found or tenant mismatch for conversation: ${conversationId}`);
      return;
    }

    // 2. Analisis dengan AI (Zod Validated)
    let aiResult: LeadAnalysisDto;
    try {
      // Dapatkan beberapa riwayat chat untuk konteks (batasi jumlahnya)
      const recentMessages = await this.prisma.message.findMany({
        where: { conversationId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const historyText = recentMessages
        .reverse()
        .map((m) => `${m.senderType}: ${m.content}`)
        .join('\n');
      const prompt = `Analyze this automotive sales conversation:\n${historyText}\n\nAssess the lead's heat tier. Output JSON: { "heat_tier": "LOW"|"WARM"|"HOT"|"CRITICAL", "heat_score": 0-100, "heat_reasons": ["reason1", "reason2"] }`;

      const rawResult = await this.openAiService.analyzeLead(tenantId, prompt);

      // Strict Schema Validation dengan Zod
      aiResult = LeadAnalysisSchema.parse(rawResult);
    } catch (error) {
      this.logger.error(
        `AI Analysis failed or invalid JSON for conversation ${conversationId}`,
        error instanceof Error ? error.message : 'Unknown',
      );
      return;
    }

    // Update data Lead di Database
    const updatedLead = await this.prisma.lead.update({
      where: { id: lead.id },
      data: {
        heatTier: aiResult.heat_tier,
        heatScore: aiResult.heat_score,
        heatReasons: aiResult.heat_reasons,
        heatUpdatedAt: new Date(),
      },
    });

    // 3. Anti-Spam Alerting (Idempotency)
    this.checkAndTriggerAlert(tenantId, lead, updatedLead);
  }

  private async checkAndTriggerAlert(
    tenantId: string,
    oldLead: any,
    newLead: any,
  ) {
    const isNowHotOrCritical =
      newLead.heatTier === HeatTier.HOT ||
      newLead.heatTier === HeatTier.CRITICAL;

    if (!isNowHotOrCritical) {
      return;
    }

    const tierIncreased =
      this.getTierWeight(newLead.heatTier) >
      this.getTierWeight(oldLead.heatTier);

    // Cooldown 30 menit
    const COOLDOWN_MS = 30 * 60 * 1000;
    const timeSinceLastAlert = newLead.lastAlertSentAt
      ? Date.now() - newLead.lastAlertSentAt.getTime()
      : Infinity;
    const isCooldownPassed = timeSinceLastAlert > COOLDOWN_MS;

    // Trigger JIKA:
    // 1. Tier naik ke HOT/CRITICAL, ATAU
    // 2. Masih di HOT/CRITICAL tapi cooldown sudah lewat
    if (tierIncreased || isCooldownPassed) {
      await this.hotLeadQueue.add('process-hot-lead', {
        tenantId,
        leadId: newLead.id,
        conversationId: newLead.conversationId,
        heatTier: newLead.heatTier,
        heatReasons: newLead.heatReasons,
      });

      // Update timestamp kapan terakhir kali alert dikirim
      await this.prisma.lead.update({
        where: { id: newLead.id },
        data: { lastAlertSentAt: new Date() },
      });

      this.logger.log(`Hot lead alert triggered for lead: ${newLead.id}`);
    } else {
      this.logger.debug(
        `Hot lead alert suppressed (cooldown) for lead: ${newLead.id}`,
      );
    }
  }

  private getTierWeight(tier: HeatTier): number {
    switch (tier) {
      case HeatTier.LOW:
        return 1;
      case HeatTier.WARM:
        return 2;
      case HeatTier.HOT:
        return 3;
      case HeatTier.CRITICAL:
        return 4;
      default:
        return 0;
    }
  }
}
