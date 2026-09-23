import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, Page, test } from '@playwright/test';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const ACME_SYSTEM_NAMES = [
    'Acme Credit Scoring',
    'Acme CV Screening',
    'Acme Chat Assistant',
    'Acme Fraud Triage',
    'Acme Demand Forecast',
];

test.describe.configure({ mode: 'serial' });

// db:seed rewrites the rows in place; db:reset unlinks the SQLite file under the running API.
function reseedDatabase(): void {
    execFileSync('pnpm', ['--filter', 'api', 'db:seed'], { cwd: repoRoot, stdio: 'ignore' });
}

async function skipTour(page: Page): Promise<void> {
    await page.addInitScript(() => window.localStorage.setItem('tour-seen', '1'));
}

function systemRow(page: Page, systemName: string) {
    return page.getByRole('row').filter({ hasText: systemName });
}

async function pickRiskLevel(page: Page, systemName: string, riskLevel: string): Promise<void> {
    await systemRow(page, systemName).getByRole('combobox').click();
    await page.getByRole('option', { name: riskLevel, exact: true }).click();
}

function statsStrip(page: Page, systems: number, high: number, medium: number) {
    return page.getByText(new RegExp(`^${systems}Systems${high}High${medium}Medium$`));
}

test.beforeAll(() => {
    reseedDatabase();
});

test('lists the signed-in tenant systems with matching stat tiles', async ({ page }) => {
    await skipTour(page);
    await page.goto('/');

    await expect(page.getByRole('banner').getByText('alice@acme.test')).toBeVisible();

    for (const name of ACME_SYSTEM_NAMES) {
        await expect(systemRow(page, name)).toBeVisible();
    }
    await expect(page.getByRole('row')).toHaveCount(ACME_SYSTEM_NAMES.length + 1);
    await expect(page.getByText('5 systems · organisation 1 · acting as alice@acme.test')).toBeVisible();

    await expect(statsStrip(page, 5, 1, 2)).toBeVisible();
});

test('shows the four-step tour once and reopens it on demand', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Your tenant')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Change a risk level')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Failed saves')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Audit trail')).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByText('Audit trail')).toBeHidden();

    await page.reload();
    await expect(page.getByText('Your tenant')).toBeHidden();

    await page.getByRole('button', { name: 'Tour' }).click();
    await expect(page.getByText('Your tenant')).toBeVisible();
});

test('switches to the other tenant and resets every piece of page state', async ({ page, context }) => {
    await skipTour(page);
    await page.goto('/');

    await page.getByRole('link', { name: 'Switch user' }).click();

    await expect(page).toHaveURL('http://localhost:4373/');
    const cookie = (await context.cookies()).find((candidate) => candidate.name === 'interview_user');
    expect(decodeURIComponent(cookie!.value)).toBe('bob@globex.test');

    await expect(page.getByRole('banner').getByText('bob@globex.test')).toBeVisible();
    await expect(systemRow(page, 'Globex Loan Advisor')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(6);
    await expect(page.getByText('Acme Credit Scoring')).toBeHidden();
    await expect(page.getByText('5 systems · organisation 2 · acting as bob@globex.test')).toBeVisible();
});

test('renders the signed-in tenant in the server HTML, before any script runs', async ({ request }) => {
    const response = await request.get('/', { headers: { Cookie: 'interview_user=bob%40globex.test' } });
    const html = (await response.text()).replaceAll('<!-- -->', '');

    expect(response.status()).toBe(200);
    expect(html).toContain('Globex Loan Advisor');
    expect(html).toContain('5 systems \u00b7 organisation 2 \u00b7 acting as bob@globex.test');
    for (const name of ACME_SYSTEM_NAMES) {
        expect(html).not.toContain(name);
    }
});

test('raises a risk level and refreshes the row, the version and the stat tiles', async ({ page }) => {
    await skipTour(page);
    await page.goto('/');

    const row = systemRow(page, 'Acme Credit Scoring');
    await expect(row.getByText('Medium', { exact: true }).first()).toBeVisible();
    await expect(row.getByRole('cell').nth(2)).toHaveText('1');

    await pickRiskLevel(page, 'Acme Credit Scoring', 'High');

    await expect(row.getByText('High', { exact: true }).first()).toBeVisible({ timeout: 3_000 });
    await expect(row.getByRole('cell').nth(2)).toHaveText('2');
    await expect(statsStrip(page, 5, 2, 1)).toBeVisible();
});

test('shows the audit row and the notification for the change just made', async ({ page }) => {
    await skipTour(page);
    await page.goto('/');

    await systemRow(page, 'Acme Credit Scoring').getByRole('button', { name: 'Activity' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Acme Credit Scoring · activity')).toBeVisible();
    await expect(dialog.getByText('alice@acme.test')).toBeVisible();
    await expect(dialog.getByText('riskLevel: Medium → High')).toBeVisible();
    await expect(dialog.getByText('Acme Credit Scoring was raised to High risk')).toBeVisible();
    await expect(dialog.getByText('1 audit rows · 1 notifications')).toBeVisible();
});

test('shows an empty audit trail for an untouched system of the other tenant', async ({ page }) => {
    await skipTour(page);
    await page.goto('/login?as=bob@globex.test');

    await systemRow(page, 'Globex Loan Advisor').getByRole('button', { name: 'Activity' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('No audit rows')).toBeVisible();
    await expect(dialog.getByText('No notifications')).toBeVisible();
    await expect(dialog.getByText('0 audit rows · 0 notifications')).toBeVisible();
});
