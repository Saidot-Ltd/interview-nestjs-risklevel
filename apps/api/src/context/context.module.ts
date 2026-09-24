import { Global, Module } from '@nestjs/common';
import { CurrentContextService } from './current-context.service';
import { MeController } from './me.controller';
import { MeResolver } from './me.resolver';

@Global()
@Module({
    controllers: [MeController],
    providers: [CurrentContextService, MeResolver],
    exports: [CurrentContextService],
})
export class ContextModule {}
