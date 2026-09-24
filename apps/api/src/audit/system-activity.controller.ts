import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CurrentContextService } from '../context/current-context.service';
import { SystemActivity } from './audit-log.graphql.types';
import { SystemActivityService } from './system-activity.service';

@Controller('systems')
export class SystemActivityController {
    constructor(
        private readonly systemActivityService: SystemActivityService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Get(':systemId/activity')
    async systemActivity(@Param('systemId', ParseIntPipe) systemId: number): Promise<SystemActivity> {
        return this.systemActivityService.getSystemActivity(systemId, this.currentContext.organizationId);
    }
}
