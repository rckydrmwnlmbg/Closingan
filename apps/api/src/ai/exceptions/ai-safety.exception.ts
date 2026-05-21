import { EscalationReason } from '@prisma/client';

export class AiSafetyException extends Error {
  public reason: EscalationReason;
  public blockedContent: string | null;

  constructor(reason: EscalationReason, message: string, blockedContent: string | null = null) {
    super(message);
    this.name = 'AiSafetyException';
    this.reason = reason;
    this.blockedContent = blockedContent;
  }
}
