import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentContextService } from '../context/current-context.service';
import { SystemActivity } from './audit-log.graphql.types';
import { SystemActivityService } from './system-activity.service';

@Resolver(() => SystemActivity)
export class AuditLogResolver {
    constructor(
        private readonly systemActivityService: SystemActivityService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Query(() => SystemActivity)
    async systemActivity(@Args('systemId', { type: () => Int }) systemId: number): Promise<SystemActivity> {
        return this.systemActivityService.getSystemActivity(systemId, this.currentContext.organizationId);
    }
}
