import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemActivity } from './audit-log.graphql.types';

@Injectable()
export class SystemActivityService {
    constructor(private readonly prisma: PrismaService) {}

    async getSystemActivity(systemId: number, organizationId: number): Promise<SystemActivity> {
        const system = await this.prisma.governSystem.findFirst({
            where: { id: systemId, organizationId, deletedAt: null },
        });
        if (!system) {
            return { auditLog: [], notifications: [] };
        }

        const [auditRows, notificationRows] = await Promise.all([
            this.prisma.governAuditLog.findMany({
                where: { entityType: 'GovernSystem', entityId: systemId, organizationId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.findMany({
                where: { systemId },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            auditLog: auditRows.map((row) => ({
                id: row.id,
                actorId: row.actorId,
                actorEmail: row.actorEmail,
                before: row.before,
                after: row.after,
                createdAt: row.createdAt.toISOString(),
            })),
            notifications: notificationRows.map((row) => ({
                id: row.id,
                recipientId: row.recipientId,
                message: row.message,
                createdAt: row.createdAt.toISOString(),
            })),
        };
    }
}
