import { forwardRef, Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GovernSystemResolver } from './govern-system.resolver';
import { GovernSystemService } from './govern-system.service';
import { RiskLevelChangedListener } from './listeners/risk-level-changed.listener';

@Module({
    imports: [AuditModule, forwardRef(() => NotificationsModule)],
    providers: [GovernSystemService, GovernSystemResolver, RiskLevelChangedListener],
    exports: [GovernSystemService],
})
export class GovernSystemModule {}
