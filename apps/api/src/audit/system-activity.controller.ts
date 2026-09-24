import { Controller, Get, Param } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentContextService } from '../context/current-context.service';
import { SystemActivity } from './audit-log.graphql.types';
import { SystemIdSchema } from './system-activity.schemas';
import { SystemActivityService } from './system-activity.service';

@Controller('systems')
export class SystemActivityController {
    constructor(
        private readonly systemActivityService: SystemActivityService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Get(':systemId/activity')
    async systemActivity(
        @Param('systemId', new ZodValidationPipe(SystemIdSchema)) systemId: number,
    ): Promise<SystemActivity> {
        return this.systemActivityService.getSystemActivity(systemId, this.currentContext.organizationId);
    }
}
