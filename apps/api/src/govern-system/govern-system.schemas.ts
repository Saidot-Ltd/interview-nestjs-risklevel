import { z } from 'zod';

export const SystemIdSchema = z.coerce.number().int();
export const PageSchema = z.coerce.number().int().nullish();
export const PageSizeSchema = z.coerce.number().int().nullish();
export const RiskLevelSchema = z.string();
export const OrganizationIdSchema = z.number().int();
export const ActorIdSchema = z.number().int().nullish();

export const SetRiskLevelBodySchema = z.object({
    riskLevel: RiskLevelSchema,
    organizationId: OrganizationIdSchema,
    actorId: ActorIdSchema,
});

export type SetRiskLevelBody = z.infer<typeof SetRiskLevelBodySchema>;
