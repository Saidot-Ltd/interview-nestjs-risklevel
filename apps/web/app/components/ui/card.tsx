import type * as React from 'react';
import { cn } from '~/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-lg border border-[var(--line)] bg-[var(--bg2)] shadow-[var(--shadow-card)]',
                className,
            )}
            {...props}
        />
    );
}
