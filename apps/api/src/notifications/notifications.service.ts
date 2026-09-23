import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { GovernSystem } from '@prisma/client';
import { GovernSystemService } from '../govern-system/govern-system.service';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATION_PROVIDER, NotificationProvider } from './notification-provider.types';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => GovernSystemService))
        private readonly governSystemService: GovernSystemService,
        @Inject(NOTIFICATION_PROVIDER)
        private readonly provider: NotificationProvider,
    ) {}

    async notifyOwner(system: GovernSystem): Promise<void> {
        const label = this.governSystemService.formatRiskLabel(system.riskLevel);
        const message = `${system.name} was raised to ${label}`;

        await this.prisma.notification.create({
            data: {
                systemId: system.id,
                recipientId: system.ownerId,
                message,
            },
        });

        this.logger.log(`notifying owner ${system.ownerId} about system ${system.id}`);
        await this.provider.send(message);
    }
}
