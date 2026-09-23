import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { CLS_ORGANIZATION_ID, CLS_USER_EMAIL, CLS_USER_ID } from './current-context.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    constructor(
        private readonly cls: ClsService,
        private readonly prisma: PrismaService,
    ) {}

    async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
        const email = req.header('x-user-email') ?? req.cookies?.interview_user;
        if (email) {
            const user = await this.prisma.appUser.findUnique({ where: { email } });
            if (user) {
                this.cls.set(CLS_USER_ID, user.id);
                this.cls.set(CLS_USER_EMAIL, user.email);
                this.cls.set(CLS_ORGANIZATION_ID, user.organizationId);
            }
        }
        next();
    }
}
