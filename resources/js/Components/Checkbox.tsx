import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, ...props }, ref) => (
        <input
            type="checkbox"
            ref={ref}
            className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                className,
            )}
            {...props}
        />
    ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
