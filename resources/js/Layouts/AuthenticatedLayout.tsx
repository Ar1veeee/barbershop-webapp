import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

import { isActiveRoute } from '@/utils/routeHelper';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    let profileRoute = '';

    switch (user.role) {
        case 'customer':
            profileRoute = route('customer.profile.edit');
            break;
        case 'barber':
            profileRoute = route('barber.profiles.edit');
            break;
        default:
            profileRoute = route('profile.fallback');
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="relative z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        {/* Logo */}
                        <div className="flex shrink-0 items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden items-center space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            <NavLink
                                href={route('dashboard')}
                                active={[
                                    'customer.dashboard',
                                    'barber.dashboard',
                                ].includes(route().current()!)}
                            >
                                Dashboard
                            </NavLink>

                            {/* Customer - Discounts */}
                            {user.role === 'customer' && (
                                <NavLink
                                    href={route('customer.discounts.index')}
                                    active={isActiveRoute('customer.discounts*')}
                                >
                                    Discounts
                                </NavLink>
                            )}

                            {/* Customer - Bookings */}
                            {user.role === 'customer' && (
                                <NavLink
                                    href={route('customer.bookings.index')}
                                    active={isActiveRoute('customer.bookings*')}
                                >
                                    Bookings
                                </NavLink>
                            )}

                            {/* Customer - Barbers */}
                            {user.role === 'customer' && (
                                <NavLink
                                    href={route('customer.barbers.index')}
                                    active={isActiveRoute('customer.barbers*')}
                                >
                                    Barbers
                                </NavLink>
                            )}

                            {/* Barber - Bookings */}
                            {user.role === 'barber' && (
                                <NavLink
                                    href={route('barber.bookings.index')}
                                    active={isActiveRoute('barber.bookings*')}
                                >
                                    Bookings
                                </NavLink>
                            )}

                            {/* Barber - Services */}
                            {user.role === 'barber' && (
                                <NavLink
                                    href={route('barber.services.index')}
                                    active={isActiveRoute('barber.services*')}
                                >
                                    Services
                                </NavLink>
                            )}

                            {/* Barber - Earnings */}
                            {user.role === 'barber' && (
                                <NavLink
                                    href={route('barber.earnings.index')}
                                    active={isActiveRoute('barber.earnings*')}
                                >
                                    Earnings
                                </NavLink>
                            )}

                            {/* Admin - Users */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.users.index')}
                                    active={isActiveRoute('admin.users*')}
                                >
                                    Users
                                </NavLink>
                            )}

                            {/* Admin - Barbers */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.barbers.index')}
                                    active={isActiveRoute('admin.barbers*')}
                                >
                                    Barbers
                                </NavLink>
                            )}

                            {/* Admin - Schedules */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.schedules.index')}
                                    active={isActiveRoute('admin.schedules*')}
                                >
                                    Schedules
                                </NavLink>
                            )}

                            {/* Admin - Services */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.services.index')}
                                    active={isActiveRoute('admin.services*')}
                                >
                                    Services
                                </NavLink>
                            )}

                            {/* Admin - Categories */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.categories.index')}
                                    active={isActiveRoute('admin.categories*')}
                                >
                                    Categories
                                </NavLink>
                            )}

                            {/* Admin - Discounts */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.discounts.index')}
                                    active={isActiveRoute('admin.discounts*')}
                                >
                                    Discounts
                                </NavLink>
                            )}

                            {/* Admin - Bookings */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.bookings.index')}
                                    active={isActiveRoute('admin.bookings*')}
                                >
                                    Bookings
                                </NavLink>
                            )}

                            {/* Admin - Reports */}
                            {user.role === 'admin' && (
                                <NavLink
                                    href={route('admin.reports.index')}
                                    active={isActiveRoute('admin.reports*')}
                                >
                                    Reports
                                </NavLink>
                            )}
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden items-center sm:ms-6 sm:flex">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group flex items-center gap-3 rounded-full border-2 border-transparent bg-white/50 p-1 transition-all hover:border-gray-300 hover:shadow-md dark:bg-gray-800/50 dark:hover:border-gray-600"
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.avatar_url}
                                                alt={user.name}
                                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-700"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=1f2937&color=fff&bold=true`;
                                                }}
                                            />
                                            <div className="absolute inset-0 rounded-full ring-2 ring-transparent transition group-hover:ring-gray-400 dark:group-hover:ring-gray-500" />
                                        </div>

                                        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 lg:block">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="hidden h-4 w-4 text-gray-500 transition group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 lg:block" />
                                    </motion.button>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="right" width="48">
                                    <Dropdown.Link
                                        href={profileRoute}
                                        className="flex items-center gap-2"
                                    >
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 text-red-600 dark:text-red-400"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        !showingNavigationDropdown,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-600"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={isActiveRoute('dashboard', true)}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {/* Customer - Discounts */}
                        {user.role === 'customer' && (
                            <ResponsiveNavLink
                                href={route('customer.discounts.index')}
                                active={isActiveRoute('customer.discounts*')}
                            >
                                Discounts
                            </ResponsiveNavLink>
                        )}

                        {/* Customer - Bookings */}
                        {user.role === 'customer' && (
                            <ResponsiveNavLink
                                href={route('customer.bookings.index')}
                                active={isActiveRoute('customer.bookings*')}
                            >
                                Bookings
                            </ResponsiveNavLink>
                        )}

                        {/* Customer - Barbers */}
                        {user.role === 'customer' && (
                            <ResponsiveNavLink
                                href={route('customer.barbers.index')}
                                active={isActiveRoute('customer.barbers*')}
                            >
                                Barbers
                            </ResponsiveNavLink>
                        )}

                        {/* Barber - Bookings */}
                        {user.role === 'barber' && (
                            <ResponsiveNavLink
                                href={route('barber.bookings.index')}
                                active={isActiveRoute('barber.bookings*')}
                            >
                                Bookings
                            </ResponsiveNavLink>
                        )}

                        {/* Barber - Services */}
                        {user.role === 'barber' && (
                            <ResponsiveNavLink
                                href={route('barber.services.index')}
                                active={isActiveRoute('barber.services*')}
                            >
                                Services
                            </ResponsiveNavLink>
                        )}

                        {/* Barber - Earnings */}
                        {user.role === 'barber' && (
                            <ResponsiveNavLink
                                href={route('barber.earnings.index')}
                                active={isActiveRoute('barber.earnings*')}
                            >
                                Earnings
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Users */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.users.index')}
                                active={isActiveRoute('admin.users*')}
                            >
                                Users
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Barbers */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.barbers.index')}
                                active={isActiveRoute('admin.barbers*')}
                            >
                                Barbers
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Schedules */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.schedules.index')}
                                active={isActiveRoute('admin.schedules*')}
                            >
                                Schedules
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Services */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.services.index')}
                                active={isActiveRoute('admin.services*')}
                            >
                                Services
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Categories */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.categories.index')}
                                active={isActiveRoute('admin.categories*')}
                            >
                                Categories
                            </ResponsiveNavLink>
                        )}

                        {/* Customer - Discounts */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.discounts.index')}
                                active={isActiveRoute('admin.discounts*')}
                            >
                                Discounts
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Bookings */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.bookings.index')}
                                active={isActiveRoute('admin.bookings*')}
                            >
                                Bookings
                            </ResponsiveNavLink>
                        )}

                        {/* Admin - Reports */}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.reports.index')}
                                active={isActiveRoute('admin.reports*')}
                            >
                                Reports
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-3 pt-4 dark:border-gray-700">
                        <div className="flex items-center gap-3 px-4">
                            <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-700"
                            />
                            <div>
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={profileRoute}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            {header && (
                <header className="relative z-10 bg-white/80 shadow-sm backdrop-blur-xl dark:bg-gray-800/80">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="relative z-0 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
