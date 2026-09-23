import { Global, Module } from '@nestjs/common';
import { CurrentContextService } from './current-context.service';
import { MeResolver } from './me.resolver';

@Global()
@Module({
    providers: [CurrentContextService, MeResolver],
    exports: [CurrentContextService],
})
export class ContextModule {}
