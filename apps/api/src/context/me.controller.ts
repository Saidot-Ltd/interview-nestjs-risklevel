import { Controller, Get } from '@nestjs/common';
import { CurrentContextService } from './current-context.service';
import { Me } from './me.graphql.types';

@Controller('me')
export class MeController {
    constructor(private readonly currentContext: CurrentContextService) {}

    @Get()
    me(): Me {
        return {
            id: this.currentContext.userId,
            email: this.currentContext.userEmail,
            organizationId: this.currentContext.organizationId,
        };
    }
}
