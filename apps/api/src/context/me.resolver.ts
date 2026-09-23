import { Query, Resolver } from '@nestjs/graphql';
import { CurrentContextService } from './current-context.service';
import { Me } from './me.graphql.types';

@Resolver(() => Me)
export class MeResolver {
    constructor(private readonly currentContext: CurrentContextService) {}

    @Query(() => Me)
    me(): Me {
        return {
            id: this.currentContext.userId,
            email: this.currentContext.userEmail,
            organizationId: this.currentContext.organizationId,
        };
    }
}
