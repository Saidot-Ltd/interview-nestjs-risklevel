import { Module } from '@nestjs/common';
import { ContextModule } from '../context/context.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogResolver } from './audit-log.resolver';
import { AuditLogService } from './audit-log.service';
import { SystemActivityController } from './system-activity.controller';
import { SystemActivityService } from './system-activity.service';

@Module({
    imports: [PrismaModule, ContextModule],
    controllers: [SystemActivityController],
    providers: [AuditLogService, SystemActivityService, AuditLogResolver],
    exports: [AuditLogService],
})
export class AuditModule {}
