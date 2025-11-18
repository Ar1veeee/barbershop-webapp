import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BarberFilters, PageProps, PaginatedData, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    Check,
    DollarSign,
    Edit3,
    Filter,
    Scissors,
    Search,
    UserCheck,
    Users,
    UserX,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BarbersIndexProps extends PageProps {
    barbers: PaginatedData<User>;
    filters: BarberFilters;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
    },
};

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { delayChildren: 0.15 },
    },
};

export default function Index({ barbers, filters }: BarbersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [availability, setAvailability] = useState(
        filters.availability || 'all',
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [commission, setCommission] = useState<string>('');
    const isInitialMount = useRef(true);

    const applyFilters = (
        currentSearch: string,
        currentStatus: string,
        currentAvailability: string,
    ) => {
        router.get(
            route('admin.barbers.index'),
            {
                search: currentSearch || undefined,
                status: currentStatus !== 'all' ? currentStatus : undefined,
                availability:
                    currentAvailability !== 'all'
                        ? currentAvailability
                        : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            applyFilters(query, status, availability);
        }, 400),
        [status, availability],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        applyFilters(search, status, availability);
    }, [status, availability]);

    const handleCommissionSubmit = (barberId: number) => {
        router.post(
            route('admin.barbers.commission', barberId),
            { commission_rate: commission },
            {
                onSuccess: () => {
                    setEditingId(null);
                    setCommission('');
                },
            },
        );
    };

    const stats = [
        { label: 'Total Barbers', value: barbers.total, icon: Users },
        {
            label: 'Available',
            value: barbers.data.filter((b) => b.barber_profile?.is_available)
                .length,
            icon: UserCheck,
        },
        {
            label: 'Busy',
            value: barbers.data.filter((b) => !b.barber_profile?.is_available)
                .length,
            icon: UserX,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Barber Management" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 lg:mb-10"
                    >
                        <h1 className="mb-2 text-3xl font-black tracking-tighter text-black sm:text-4xl lg:text-5xl xl:text-6xl">
                            Barbers
                        </h1>
                        <p className="text-base font-medium text-zinc-600 sm:text-lg">
                            Manage your elite crew
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-10 lg:gap-5"
                    >
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={i} variants={fadeInUp}>
                                    <Card className="border-zinc-200 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                                        <CardContent className="p-4 sm:p-5 lg:p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-1 text-2xl font-black text-black sm:text-3xl">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 sm:h-12 sm:w-12">
                                                    <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 lg:mb-8"
                    >
                        <Card className="border-zinc-200 bg-white/80 backdrop-blur">
                            <CardContent className="p-4 sm:p-5 lg:pb-5 lg:pt-6">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="h-10 border-zinc-200 pl-10 focus:border-black sm:h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                                        <Select
                                            value={status}
                                            onValueChange={(value) => {
                                                setStatus(
                                                    value as
                                                        | 'all'
                                                        | 'active'
                                                        | 'inactive'
                                                        | 'suspended',
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[140px] lg:w-[180px]">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Inactive
                                                </SelectItem>
                                                <SelectItem value="suspended">
                                                    Suspended
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={availability}
                                            onValueChange={(value) => {
                                                setAvailability(
                                                    value as
                                                        | 'all'
                                                        | 'available'
                                                        | 'unavailable',
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[140px] lg:w-[180px]">
                                                <Filter className="mr-2 h-4 w-4 text-zinc-500" />
                                                <SelectValue placeholder="All Availability" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Availability
                                                </SelectItem>
                                                <SelectItem value="available">
                                                    Available
                                                </SelectItem>
                                                <SelectItem value="unavailable">
                                                    Busy
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Barbers Grid */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
                    >
                        {barbers.data.map((barber) => (
                            <motion.div
                                key={barber.id}
                                variants={fadeInUp}
                                className="group"
                            >
                                <Card className="h-full border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:border-black">
                                    <CardHeader className="p-4 sm:pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
                                                    {barber.avatar_url ? (
                                                        <img
                                                            src={
                                                                barber.avatar_url
                                                            }
                                                            alt={barber.name}
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {barber.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base font-bold text-black group-hover:underline sm:text-lg">
                                                        {barber.name}
                                                    </h3>
                                                    <p className="font-mono text-xs text-zinc-500">
                                                        ID: #{barber.id}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`${
                                                    barber.barber_profile
                                                        ?.is_available
                                                        ? 'bg-black text-white'
                                                        : 'bg-zinc-200 text-zinc-600'
                                                } text-xs font-medium`}
                                            >
                                                <span>
                                                    {barber.barber_profile
                                                        ?.is_available
                                                        ? 'Available'
                                                        : 'Busy'}
                                                </span>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:space-y-5 sm:pt-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-600">
                                                Status
                                            </span>
                                            <Badge
                                                className={`${
                                                    barber.status === 'active'
                                                        ? 'bg-black text-white'
                                                        : barber.status ===
                                                            'suspended'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-zinc-100 text-zinc-600'
                                                } text-xs`}
                                            >
                                                <span>
                                                    {barber.status.toUpperCase()}
                                                </span>
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-600">
                                                Total Bookings
                                            </span>
                                            <span className="font-bold text-black">
                                                {barber.barber_bookings_count ||
                                                    0}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-sm text-zinc-600">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">
                                                    Commission
                                                </span>
                                                <span className="sm:hidden">
                                                    Comm
                                                </span>
                                            </span>
                                            {editingId === barber.id ? (
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        handleCommissionSubmit(
                                                            barber.id,
                                                        );
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Input
                                                        type="number"
                                                        value={commission}
                                                        onChange={(e) =>
                                                            setCommission(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-16 border-zinc-300 text-right text-xs sm:h-9 sm:w-20 sm:text-sm"
                                                        min="0"
                                                        max="100"
                                                        required
                                                    />
                                                    <Button
                                                        type="submit"
                                                        size="icon"
                                                        className="h-7 w-7 bg-black hover:bg-zinc-800 sm:h-8 sm:w-8"
                                                    >
                                                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        className="h-7 w-7 sm:h-8 sm:w-8"
                                                    >
                                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </form>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-black">
                                                        {
                                                            barber
                                                                .barber_profile
                                                                ?.commission_rate
                                                        }
                                                        %
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingId(
                                                                barber.id,
                                                            );
                                                            setCommission(
                                                                barber.barber_profile?.commission_rate.toString() ||
                                                                    '',
                                                            );
                                                        }}
                                                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 sm:h-7 sm:w-7"
                                                    >
                                                        <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-zinc-100 pt-3">
                                            <Link
                                                href={route(
                                                    'admin.users.show',
                                                    barber.id,
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="h-9 w-full border-zinc-300 text-xs font-medium hover:border-black hover:bg-zinc-50 sm:h-10 sm:text-sm"
                                                >
                                                    <span className="hidden sm:inline">
                                                        View Profile
                                                    </span>
                                                    <span className="sm:hidden">
                                                        View
                                                    </span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {barbers.data.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 text-center sm:py-16 lg:py-20"
                        >
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                                <Scissors className="h-8 w-8 text-zinc-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-black sm:text-2xl">
                                No barbers found
                            </h3>
                            <p className="mx-auto max-w-md text-sm text-zinc-600 sm:text-base">
                                {search ||
                                status !== 'all' ||
                                availability !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Start by adding your first barber'}
                            </p>
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {barbers.last_page > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8 lg:mt-10"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={barbers.current_page === 1}
                                onClick={() =>
                                    router.get(
                                        route('admin.barbers.index', {
                                            page: barbers.current_page - 1,
                                        }),
                                        { preserveState: true },
                                    )
                                }
                                className="h-8 border-zinc-300 text-xs hover:border-black sm:h-9 sm:text-sm"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: Math.min(5, barbers.last_page) },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === barbers.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                route('admin.barbers.index'),
                                                { page },
                                                { preserveState: true },
                                            )
                                        }
                                        className={`h-8 text-xs sm:h-9 sm:text-sm ${
                                            page === barbers.current_page
                                                ? 'bg-black hover:bg-zinc-800'
                                                : 'border-zinc-300 hover:border-black'
                                        }`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    barbers.current_page === barbers.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        route('admin.barbers.index', {
                                            page: barbers.current_page + 1,
                                        }),
                                        { preserveState: true },
                                    )
                                }
                                className="h-8 border-zinc-300 text-xs hover:border-black sm:h-9 sm:text-sm"
                            >
                                Next
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
