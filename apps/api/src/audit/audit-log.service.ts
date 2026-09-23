import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTransaction } from '../prisma/prisma.types';
import { AuditMeta, SYSTEM_ACTOR_EMAIL, SYSTEM_ACTOR_ID } from './audit-log.types';

@Injectable()
export class AuditLogService {
    constructor(private readonly prisma: PrismaService) {}

    async persist(
        trx: PrismaTransaction | undefined,
        before: Record<string, unknown>,
        after: Record<string, unknown>,
        meta: AuditMeta,
    ): Promise<void> {
        const diff = this.diff(before, after);
        if (Object.keys(diff).length === 0) {
            return;
        }

        const client = trx ?? this.prisma;
        const actorId = meta.actorId ?? SYSTEM_ACTOR_ID;
        const actorEmail = await this.resolveActorEmail(actorId);

        await client.governAuditLog.create({
            data: {
                entityType: meta.entityType,
                entityId: meta.entityId,
                organizationId: meta.organizationId,
                actorId,
                actorEmail,
                before: JSON.stringify(before),
                after: JSON.stringify(after),
            },
        });
    }

    private async resolveActorEmail(actorId: number): Promise<string> {
        if (actorId === SYSTEM_ACTOR_ID) {
            return SYSTEM_ACTOR_EMAIL;
        }
        const actor = await this.prisma.appUser.findUnique({ where: { id: actorId } });
        return actor?.email ?? SYSTEM_ACTOR_EMAIL;
    }

    private diff(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, unknown> {
        const changed: Record<string, unknown> = {};
        for (const key of Object.keys(after)) {
            if (before[key] !== after[key]) {
                changed[key] = after[key];
            }
        }
        return changed;
    }
}
