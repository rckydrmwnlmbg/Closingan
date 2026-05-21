import { Injectable, Logger } from '@nestjs/common';
import { EscalationReason } from '@prisma/client';

export interface ValidationResult {
  isSafe: boolean;
  reason?: EscalationReason;
  blockedContent?: string;
  sanitizedOutput?: string;
}

@Injectable()
export class AiSafetyService {
  private readonly logger = new Logger(AiSafetyService.name);

  // Regex patterns for prompt injection
  private readonly injectionPatterns = [
    /ignore (?:all )?previous instructions/i,
    /system (?:message|prompt)/i,
    /forget (?:all )?(?:rules|instructions)/i,
    /bypass/i,
    /override/i,
    /you are now/i,
    /act as/i,
    /roleplay/i,
    /print (?:all )?(?:the )?instructions/i,
    /show (?:all )?(?:the )?instructions/i
  ];

  // Patterns for low confidence
  private readonly lowConfidencePatterns = [
    /kurang tahu/i,
    /tidak yakin/i,
    /saya tidak tahu/i,
    /tidak bisa memastikan/i,
    /belum pasti/i,
    /sepertinya tidak ada/i,
    /mungkin tidak/i,
    /i am not sure/i,
    /i don't know/i,
    /i do not know/i
  ];

  // Patterns for credit/loan (TASK 5.2: tidak ada angka simulasi kredit/DP/cicilan)
  // We look for dp, cicilan, angsuran, kredit followed by numbers
  private readonly creditPatterns = [
    /(?:dp|down payment)(?:.*?)?\s*(?:rp\.?|rupiah|:|=)?\s*\d+/i,
    /(?:cicilan|angsuran|kredit)(?:.*?)?\s*(?:rp\.?|rupiah|:|=)?\s*\d+/i,
    /(?:tenor|bulan|tahun)(?:.*?)?\s*(?::|=)?\s*\d+\s*(?:bulan|tahun|x)/i,
    /simulasi(?:\s+)?(?:kredit|cicilan)/i,
    /bunga\s*\d+\s*%/i,
  ];

  // Patterns for fake promos (this can be basic or check against a dictionary)
  private readonly fakePromoPatterns = [
    /diskon \d{2,}%/i, // Big unrealistic discounts
    /gratis (?:semua|mobil|motor)/i,
    /cashback\s*(?:rp\.?|rupiah)?\s*\d{8,}/i, // Crazy cashback amounts
    /promo khusus hari ini saja/i,
  ];

  // Allowed URL whitelist (example)
  private readonly allowedDomains = [
    'honda-indonesia.com',
    'toyota.astra.co.id',
    'suzuki.co.id',
    'mitsubishi-motors.co.id',
    'wuling.id',
    'hyundai.com',
    'closingan.com',
    'wa.me'
  ];

  public validateInput(prompt: string): ValidationResult {
    if (!prompt || typeof prompt !== 'string') {
      return { isSafe: false, reason: 'UNKNOWN_INTENT', blockedContent: prompt };
    }

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(prompt)) {
        return {
          isSafe: false,
          reason: 'MANUAL_TRIGGER', // Represents a manual attempt to override
          blockedContent: prompt,
        };
      }
    }

    return { isSafe: true };
  }

  public validateOutput(output: string): ValidationResult {
    if (!output || typeof output !== 'string') {
      return { isSafe: false, reason: 'UNKNOWN_INTENT', blockedContent: output };
    }

    // 1. Low Confidence Check
    for (const pattern of this.lowConfidencePatterns) {
      if (pattern.test(output)) {
        return {
          isSafe: false,
          reason: 'AI_LOW_CONFIDENCE',
          blockedContent: output,
        };
      }
    }

    // 2. Financial/Credit Claim Check
    for (const pattern of this.creditPatterns) {
      if (pattern.test(output)) {
        return {
          isSafe: false,
          reason: 'CREDIT_SIMULATION_REQUEST',
          blockedContent: output,
        };
      }
    }

    // 3. Fake Promo Check
    for (const pattern of this.fakePromoPatterns) {
      if (pattern.test(output)) {
        return {
          isSafe: false,
          reason: 'FINANCIAL_CLAIM_BLOCKED', // Closest match in EscalationReason
          blockedContent: output,
        };
      }
    }

    return { isSafe: true };
  }

  public sanitizeOutput(output: string): string {
    if (!output) return '';

    let sanitized = output;

    // 1. Remove messy markdown that breaks WhatsApp UI
    // WA supports: *bold*, _italic_, ~strikethrough~, ```code```
    // Remove headers (#, ##, etc)
    sanitized = sanitized.replace(/^#{1,6}\s+/gm, '');

    // Remove lists (- or *) if they are too messy (Optional, WA supports lists fine if simple, but we'll remove overly nested ones or just keep it simple)
    // Actually WA doesn't support bullet points rendering well, so convert to standard text or clean them

    // Remove bold inside words or unbalanced asterisks (basic cleanup)
    // We'll leave *bold* as is since WA supports it.

    // Remove Markdown links [text](url) -> text (url)
    sanitized = sanitized.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    // 2. Check and filter URLs
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    sanitized = sanitized.replace(urlRegex, (url) => {
      try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace(/^www\./, '');

        const isAllowed = this.allowedDomains.some(allowed =>
          domain === allowed || domain.endsWith(`.${allowed}`)
        );

        if (!isAllowed) {
          return '[LINK REMOVED]';
        }
        return url;
      } catch (e) {
        // Invalid URL format
        return '[INVALID LINK]';
      }
    });

    return sanitized.trim();
  }
}
