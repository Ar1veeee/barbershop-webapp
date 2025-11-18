import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface NavLinkProps {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}

export default function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none',
                active
                    ? 'border-primary text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
            )}
        >
            {children}
        </Link>
    );
}
