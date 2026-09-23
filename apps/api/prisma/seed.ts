import { PrismaClient } from '@prisma/client';

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
    await prisma.notification.deleteMany();
    await prisma.governAuditLog.deleteMany();
    await prisma.governSystem.deleteMany();
    await prisma.appUser.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence');

    await prisma.organization.create({ data: { id: 1, name: 'Acme' } });
    await prisma.organization.create({ data: { id: 2, name: 'Globex' } });

    await prisma.appUser.create({
        data: { id: 1, email: 'alice@acme.test', displayName: 'Alice Acme', organizationId: 1 },
    });
    await prisma.appUser.create({
        data: { id: 2, email: 'bob@globex.test', displayName: 'Bob Globex', organizationId: 2 },
    });

    const acmeSystems = [
        { id: 1, name: 'Acme Credit Scoring', riskLevel: 'Medium' },
        { id: 2, name: 'Acme CV Screening', riskLevel: 'High' },
        { id: 3, name: 'Acme Chat Assistant', riskLevel: 'Low' },
        { id: 4, name: 'Acme Fraud Triage', riskLevel: 'Medium' },
        { id: 5, name: 'Acme Demand Forecast', riskLevel: 'Low' },
        { id: 6, name: 'Acme Retired Pilot', riskLevel: 'Medium', deletedAt: new Date('2026-06-01T00:00:00Z') },
    ];
    for (const system of acmeSystems) {
        await prisma.governSystem.create({ data: { ...system, organizationId: 1, ownerId: 1 } });
    }

    const globexSystems = [
        { id: 7, name: 'Globex Loan Advisor', riskLevel: 'High' },
        { id: 8, name: 'Globex Route Planner', riskLevel: 'Low' },
        { id: 9, name: 'Globex Support Bot', riskLevel: 'Medium' },
        { id: 10, name: 'Globex Quality Vision', riskLevel: 'Medium' },
        { id: 11, name: 'Globex Churn Model', riskLevel: 'Low' },
    ];
    for (const system of globexSystems) {
        await prisma.governSystem.create({ data: { ...system, organizationId: 2, ownerId: 2 } });
    }
}

if (require.main === module) {
    const prisma = new PrismaClient();
    seedDatabase(prisma)
        .then(async () => {
            console.log('seeded 2 organizations, 2 users, 11 systems (1 soft-deleted)');
            await prisma.$disconnect();
        })
        .catch(async (error) => {
            console.error(error);
            await prisma.$disconnect();
            process.exit(1);
        });
}
