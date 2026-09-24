import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentContextService } from '../context/current-context.service';
import {
    PageSchema,
    PageSizeSchema,
    SetRiskLevelBody,
    SetRiskLevelBodySchema,
    SystemIdSchema,
} from './govern-system.schemas';
import { GovernSystemService } from './govern-system.service';
import { GovernSystemPage, GovernSystemPayload } from './govern-system.types';

@Controller('systems')
export class GovernSystemController {
    constructor(
        private readonly governSystemService: GovernSystemService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Get()
    async governSystems(
        @Query('page', new ZodValidationPipe(PageSchema)) page?: number,
        @Query('pageSize', new ZodValidationPipe(PageSizeSchema)) pageSize?: number,
    ): Promise<GovernSystemPage> {
        return this.governSystemService.listSystems(this.currentContext.organizationId, page, pageSize);
    }

    @Patch(':systemId/risk-level')
    async setSystemRiskLevel(
        @Param('systemId', new ZodValidationPipe(SystemIdSchema)) systemId: number,
        @Body(new ZodValidationPipe(SetRiskLevelBodySchema)) body: SetRiskLevelBody,
    ): Promise<GovernSystemPayload> {
        return this.governSystemService.setRiskLevel(systemId, body.riskLevel, body.organizationId, body.actorId);
    }
}
