import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn(
                'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-25',
                disabled && 'opacity-25',
                className,
            )}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
