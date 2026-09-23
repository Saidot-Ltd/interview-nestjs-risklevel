import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export const CLS_USER_ID = 'userId';
export const CLS_USER_EMAIL = 'userEmail';
export const CLS_ORGANIZATION_ID = 'organizationId';

@Injectable()
export class CurrentContextService {
    constructor(private readonly cls: ClsService) {}

    get organizationId(): number {
        const organizationId = this.cls.get<number>(CLS_ORGANIZATION_ID);
        if (!organizationId) {
            throw new UnauthorizedException('No organization in the current context');
        }
        return organizationId;
    }

    get userId(): number {
        const userId = this.cls.get<number>(CLS_USER_ID);
        if (!userId) {
            throw new UnauthorizedException('No user in the current context');
        }
        return userId;
    }

    get userEmail(): string {
        const userEmail = this.cls.get<string>(CLS_USER_EMAIL);
        if (!userEmail) {
            throw new UnauthorizedException('No user in the current context');
        }
        return userEmail;
    }
}
