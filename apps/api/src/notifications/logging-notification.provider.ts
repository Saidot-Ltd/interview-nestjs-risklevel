import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from './notification-provider.types';

@Injectable()
export class LoggingNotificationProvider implements NotificationProvider {
    private readonly logger = new Logger(LoggingNotificationProvider.name);

    async send(message: string): Promise<void> {
        this.logger.log(`notification sent: ${message}`);
    }
}
