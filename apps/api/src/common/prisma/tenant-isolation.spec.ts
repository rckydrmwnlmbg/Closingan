import { Prisma } from '@prisma/client';

describe('Tenant Isolation Architecture Test', () => {
  const EXEMPTED_MODELS = [
    'Tenant',
    'RefreshToken',
    'OtpCode',
    'UserBadge',
    'FailedJob',
    'DeadLetterLog',
    'User',
  ];

  it('should enforce that all core models have a tenantId field and a relation to Tenant', () => {
    const models = Prisma.dmmf.datamodel.models;
    const errors: string[] = [];

    for (const model of models) {
      if (EXEMPTED_MODELS.includes(model.name)) {
        continue;
      }

      const hasTenantId = model.fields.some((f) => f.name === 'tenantId');
      if (!hasTenantId) {
        errors.push(`${model.name} is missing tenantId field`);
      }

      const hasTenantRelation = model.fields.some(
        (f) => f.type === 'Tenant' && f.relationName,
      );
      if (!hasTenantRelation) {
        errors.push(`${model.name} is missing a relation to Tenant`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        'Tenant isolation violations found:\n' + errors.join('\n'),
      );
    }
  });
});
