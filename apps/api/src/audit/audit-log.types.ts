export const SYSTEM_ACTOR_ID = 0;
export const SYSTEM_ACTOR_EMAIL = 'system@governance.test';

export interface AuditMeta {
    entityType: string;
    entityId: number;
    organizationId: number;
    actorId?: number;
}
