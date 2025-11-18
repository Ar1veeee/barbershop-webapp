import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

export default function InputError({
    message,
    className = '',
}: PropsWithChildren<{ message?: string; className?: string }>) {
    return message ? (
        <p className={cn('text-sm text-red-600', className)}>{message}</p>
    ) : null;
}
