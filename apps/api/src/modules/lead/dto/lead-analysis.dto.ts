import { z } from 'zod';
import { HeatTier } from '@prisma/client';

export const LeadAnalysisSchema = z.object({
  heat_tier: z.nativeEnum({ LOW: 'LOW', WARM: 'WARM', HOT: 'HOT', CRITICAL: 'CRITICAL' } as any),
  heat_score: z.number().min(0).max(100),
  heat_reasons: z.array(z.string()).min(1),
});

export type LeadAnalysisDto = z.infer<typeof LeadAnalysisSchema>;
