import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { corsOptions } from './cors.options';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { cors: corsOptions });
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 4300);
    console.log(`api listening on ${await app.getUrl()}/graphql`);
}

bootstrap();
