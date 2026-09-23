import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { AuditLogService } from '../../audit/audit-log.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GovernSystemService } from '../govern-system.service';

describe('GovernSystemService', () => {
    const system = {
        id: 1,
        name: 'Acme Credit Scoring',
        riskLevel: 'Medium',
        organizationId: 1,
        ownerId: 1,
        deletedAt: null,
        version: 1,
    };

    const prisma = {
        governSystem: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        appUser: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    const auditLog = { persist: jest.fn() };
    const notifications = { notifyOwner: jest.fn() };

    let service: GovernSystemService;

    beforeEach(async () => {
        jest.clearAllMocks();

        prisma.governSystem.findUnique.mockResolvedValue(system);
        prisma.governSystem.update.mockResolvedValue({ ...system, riskLevel: 'High', version: 2 });
        prisma.appUser.findMany.mockResolvedValue([{ id: 1, email: 'alice@acme.test' }]);
        prisma.$transaction.mockImplementation(async (callback: any) => callback(prisma));

        const moduleRef = await Test.createTestingModule({
            providers: [
                GovernSystemService,
                { provide: PrismaService, useValue: prisma },
                { provide: AuditLogService, useValue: auditLog },
                { provide: NotificationsService, useValue: notifications },
                { provide: EventEmitter2, useValue: new EventEmitter2() },
            ],
        }).compile();

        service = moduleRef.get(GovernSystemService);
    });

    it('formats the risk label', () => {
        expect(service.formatRiskLabel('High')).toBe('High risk');
    });

    it('updates the system once', async () => {
        await service.setRiskLevel(1, 'High', 1, 1);

        expect(prisma.governSystem.update).toHaveBeenCalledTimes(1);
        expect(prisma.governSystem.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { riskLevel: 'High', version: { increment: 1 } },
        });
    });

    it('writes an audit row', async () => {
        await service.setRiskLevel(1, 'High', 1, 1);

        expect(auditLog.persist).toHaveBeenCalledTimes(1);
    });
});
