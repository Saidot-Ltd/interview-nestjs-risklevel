import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ClsMiddleware, ClsModule } from 'nestjs-cls';
import { AuditModule } from './audit/audit.module';
import { ContextModule } from './context/context.module';
import { SessionMiddleware } from './context/session.middleware';
import { GovernSystemModule } from './govern-system/govern-system.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ClsModule.forRoot({ global: true, middleware: { mount: false } }),
        EventEmitterModule.forRoot(),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: true,
            introspection: true,
        }),
        PrismaModule,
        ContextModule,
        AuditModule,
        GovernSystemModule,
        NotificationsModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(ClsMiddleware, SessionMiddleware).forRoutes('{*splat}');
    }
}
