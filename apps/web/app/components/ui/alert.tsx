import type * as React from 'react';
import { cn } from '~/lib/utils';

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-lg border-[var(--red-line)] border-l-[3px] bg-[var(--red-bg)] p-4 text-[var(--red)]',
                className,
            )}
            {...props}
        />
    );
}
