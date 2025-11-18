import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface ResponsiveNavLinkProps {
    href: string;
    active?: boolean;
    children: React.ReactNode;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'button' | 'a';
}

export default function ResponsiveNavLink({
    href,
    active,
    children,
    method = 'get',
    as = 'a',
}: ResponsiveNavLinkProps) {
    return (
        <Link
            href={href}
            method={method}
            as={as}
            className={cn(
                'block w-full border-l-4 py-2 pl-3 pr-4 text-left text-base font-medium transition duration-150 ease-in-out focus:outline-none',
                active
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
            )}
        >
            {children}
        </Link>
    );
}
