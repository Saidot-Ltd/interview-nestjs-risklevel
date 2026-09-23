import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cn } from '~/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                'flex h-9 items-center justify-between gap-2 rounded border border-[var(--line)] bg-[var(--bg2)] px-2 py-1 text-[var(--fg)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-tint)]',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="size-4 text-[var(--fg3)]" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={cn(
                    'z-50 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg2)] shadow-[var(--shadow-card)]',
                    className,
                )}
                position="popper"
                sideOffset={4}
                {...props}
            >
                <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 pr-6 text-[var(--fg)] text-sm outline-none data-[highlighted]:bg-[var(--accent-tint)]',
                className,
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
                <Check className="size-4 text-[var(--accent)]" />
            </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}
