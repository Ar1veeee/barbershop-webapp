// resources/js/Components/TextInput.tsx

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react';

export interface TextInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean; // <-- TAMBAHKAN INI
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ className, type = 'text', isFocused, ...props }, ref) => {
        const localRef = useRef<HTMLInputElement>(null);

        // Gabungkan ref eksternal + internal
        useEffect(() => {
            if (isFocused && localRef.current) {
                localRef.current.focus();
            }
        }, [isFocused]);

        return (
            <input
                type={type}
                ref={ref || localRef}
                className={cn(
                    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm',
                    className
                )}
                {...props}
            />
        );
    }
);

TextInput.displayName = 'TextInput';

export { TextInput };
