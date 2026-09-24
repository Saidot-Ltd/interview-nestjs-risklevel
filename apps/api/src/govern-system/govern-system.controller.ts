import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CurrentContextService } from '../context/current-context.service';
import { GovernSystemService } from './govern-system.service';
import { GovernSystemPage, GovernSystemPayload, SetRiskLevelBody } from './govern-system.types';

@Controller('systems')
export class GovernSystemController {
    constructor(
        private readonly governSystemService: GovernSystemService,
        private readonly currentContext: CurrentContextService,
    ) {}

    @Get()
    async governSystems(
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    ): Promise<GovernSystemPage> {
        return this.governSystemService.listSystems(this.currentContext.organizationId, page, pageSize);
    }

    @Patch(':systemId/risk-level')
    async setSystemRiskLevel(
        @Param('systemId', ParseIntPipe) systemId: number,
        @Body() body: SetRiskLevelBody,
    ): Promise<GovernSystemPayload> {
        return this.governSystemService.setRiskLevel(systemId, body.riskLevel, body.organizationId, body.actorId);
    }
}
