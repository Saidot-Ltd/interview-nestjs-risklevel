import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { RISK_LEVEL_CHANGED, RiskLevelChangedEvent } from '../govern-system.types';

@Injectable()
export class RiskLevelChangedListener {
    private readonly logger = new Logger(RiskLevelChangedListener.name);

    constructor(private readonly prisma: PrismaService) {}

    @OnEvent(RISK_LEVEL_CHANGED)
    async onRiskLevelChanged(event: RiskLevelChangedEvent): Promise<void> {
        const system = await this.prisma.governSystem.findUnique({ where: { id: event.systemId } });
        if (!system) {
            this.logger.warn(`System ${event.systemId} disappeared before the derived state could be refreshed`);
            return;
        }

        const auditRow = await this.prisma.governAuditLog.findFirst({
            where: { entityType: 'GovernSystem', entityId: event.systemId },
            orderBy: { createdAt: 'desc' },
        });

        if (!auditRow) {
            this.logger.warn(`No audit row for system ${event.systemId}, derived state left stale`);
            return;
        }

        this.logger.log(`System ${event.systemId} is now ${system.riskLevel} (audit row ${auditRow.id})`);
    }
}
