import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '~/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-[.72rem]', {
    variants: {
        variant: {
            neutral: 'border-[var(--line)] bg-[var(--bg3)] text-[var(--fg2)]',
            low: 'border-[var(--green-line)] bg-[var(--green-bg)] text-[var(--green)]',
            medium: 'border-[var(--amber-line)] bg-[var(--amber-bg)] text-[var(--amber)]',
            high: 'border-[var(--red-line)] bg-[var(--red-bg)] text-[var(--red)]',
        },
    },
    defaultVariants: {
        variant: 'neutral',
    },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
