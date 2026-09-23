import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';

const TOUR_SEEN_KEY = 'tour-seen';

const STEPS = [
    {
        anchor: 'user',
        title: 'Your tenant',
        body: 'You are alice at Acme. Switch to bob at Globex to see the other tenant.',
    },
    {
        anchor: 'risk-select',
        title: 'Change a risk level',
        body: 'Pick a level. It calls setSystemRiskLevel from the browser and refreshes the list.',
    },
    {
        anchor: 'error-slot',
        title: 'Failed saves',
        body: 'A failed save shows here. Run pnpm repro in the API to see what it leaves in the database.',
    },
    {
        anchor: 'activity',
        title: 'Audit trail',
        body: 'Every save must leave an audit row here, signed by the real user. Open it after a save and after pnpm repro.',
    },
];

function readSeen(): boolean {
    try {
        return window.localStorage.getItem(TOUR_SEEN_KEY) === '1';
    } catch {
        return false;
    }
}

function writeSeen() {
    try {
        window.localStorage.setItem(TOUR_SEEN_KEY, '1');
    } catch {
        // ignore, tour just reopens next visit
    }
}

interface AnchorRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

function measure(anchor: string): AnchorRect | null {
    const el = document.querySelector(`[data-tour="${anchor}"]`);
    if (!el) {
        return null;
    }
    const rect = el.getBoundingClientRect();
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

interface TourProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function Tour({ open, onOpenChange }: TourProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState<AnchorRect | null>(null);

    useEffect(() => {
        if (!readSeen()) {
            onOpenChange(true);
        }
    }, [onOpenChange]);

    useEffect(() => {
        if (open) {
            setStepIndex(0);
        }
    }, [open]);

    const recompute = useCallback(() => {
        setRect(measure(STEPS[stepIndex].anchor));
    }, [stepIndex]);

    useEffect(() => {
        if (!open) {
            return;
        }
        recompute();
        let frame = 0;
        const onResize = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(recompute);
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
        };
    }, [open, recompute]);

    function close() {
        onOpenChange(false);
        writeSeen();
    }

    if (!open) {
        return null;
    }

    const step = STEPS[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === STEPS.length - 1;

    const popoverTop = rect ? Math.min(rect.top + rect.height + 8, window.innerHeight - 200) : 80;
    const popoverLeft = rect ? Math.min(Math.max(rect.left, 16), window.innerWidth - 336) : 16;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[var(--fg)]/40" />
                {rect ? (
                    <div
                        className="pointer-events-none fixed z-40 rounded border-2 border-[var(--accent)]"
                        style={{
                            top: rect.top - 4,
                            left: rect.left - 4,
                            width: rect.width + 8,
                            height: rect.height + 8,
                        }}
                    />
                ) : null}
                <DialogPrimitive.Content
                    className="fixed z-50 w-80 rounded-lg border border-[var(--line)] bg-[var(--bg2)] p-4 shadow-[var(--shadow-card)]"
                    style={{ top: popoverTop, left: popoverLeft }}
                    onEscapeKeyDown={close}
                >
                    <DialogPrimitive.Title className="font-semibold text-[var(--fg)]">
                        {step.title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-[var(--fg2)] text-sm">
                        {step.body}
                    </DialogPrimitive.Description>
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={close}
                            className="text-[var(--fg3)] text-xs underline hover:text-[var(--fg2)]"
                        >
                            Skip tour
                        </button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isFirst}
                                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                            >
                                Back
                            </Button>
                            {isLast ? (
                                <Button type="button" size="sm" onClick={close}>
                                    Done
                                </Button>
                            ) : (
                                <Button type="button" size="sm" onClick={() => setStepIndex((index) => index + 1)}>
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
