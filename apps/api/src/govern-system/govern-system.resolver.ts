import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentContextService } from '../context/current-context.service';
import { GovernSystemService } from './govern-system.service';
import { GovernSystemPage, GovernSystemPayload } from './govern-system.types';

@Resolver(() => GovernSystemPayload)
export class GovernSystemResolver {
    constructor(
        private readonly governSystemService: GovernSystemService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Query(() => GovernSystemPage)
    async governSystems(
        @Args('page', { type: () => Int, nullable: true }) page?: number,
        @Args('pageSize', { type: () => Int, nullable: true }) pageSize?: number,
    ): Promise<GovernSystemPage> {
        return this.governSystemService.listSystems(this.currentContext.organizationId, page, pageSize);
    }

    @Mutation(() => GovernSystemPayload)
    async setSystemRiskLevel(
        @Args('systemId', { type: () => Int }) systemId: number,
        @Args('riskLevel') riskLevel: string,
        @Args('organizationId', { type: () => Int }) organizationId: number,
        @Args('actorId', { type: () => Int, nullable: true }) actorId?: number,
    ): Promise<GovernSystemPayload> {
        return this.governSystemService.setRiskLevel(systemId, riskLevel, organizationId, actorId);
    }
}
