import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentContextService } from '../context/current-context.service';
import {
    ActorIdSchema,
    OrganizationIdSchema,
    PageSchema,
    PageSizeSchema,
    RiskLevelSchema,
    SystemIdSchema,
} from './govern-system.schemas';
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
        @Args('page', { type: () => Int, nullable: true }, new ZodValidationPipe(PageSchema)) page?: number,
        @Args('pageSize', { type: () => Int, nullable: true }, new ZodValidationPipe(PageSizeSchema)) pageSize?: number,
    ): Promise<GovernSystemPage> {
        return this.governSystemService.listSystems(this.currentContext.organizationId, page, pageSize);
    }

    @Mutation(() => GovernSystemPayload)
    async setSystemRiskLevel(
        @Args('systemId', { type: () => Int }, new ZodValidationPipe(SystemIdSchema)) systemId: number,
        @Args('riskLevel', new ZodValidationPipe(RiskLevelSchema)) riskLevel: string,
        @Args('organizationId', { type: () => Int }, new ZodValidationPipe(OrganizationIdSchema))
        organizationId: number,
        @Args('actorId', { type: () => Int, nullable: true }, new ZodValidationPipe(ActorIdSchema)) actorId?: number,
    ): Promise<GovernSystemPayload> {
        return this.governSystemService.setRiskLevel(systemId, riskLevel, organizationId, actorId);
    }
}
