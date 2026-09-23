import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const apiRoot = join(__dirname, '..');

describe('pnpm repro (e2e)', () => {
    let output: string;
    let exitCode: number;

    beforeAll(() => {
        try {
            output = execFileSync('pnpm', ['repro'], {
                cwd: apiRoot,
                env: { ...process.env, DATABASE_URL: 'file:./test.db' },
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            exitCode = 0;
        } catch (error) {
            output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
            exitCode = error.status;
        }
    });

    it('exits cleanly', () => {
        expect(exitCode).toBe(0);
    });

    it('prints the three tables it promises', () => {
        expect(output).toContain('calling setSystemRiskLevel(systemId: 1, riskLevel: "High") as alice@acme.test');
        expect(output).toContain('GovernSystem');
        expect(output).toContain('GovernAuditLog (entity GovernSystem 1)');
        expect(output).toContain('Notification (system 1)');
    });
});
