import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:4373',
    credentials: true,
};
