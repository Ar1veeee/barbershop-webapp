import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Booking,
    BookingFilters,
    PageProps,
    PaginatedData,
    PaginationLink,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    CalendarDays,
    Clock,
    Filter,
    Search,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            ease: 'easeOut',
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const floating = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
        },
    },
};

interface BookingsIndexProps extends PageProps {
    bookings: PaginatedData<Booking>;
    filters: BookingFilters;
}

export default function Index({ bookings, filters }: BookingsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [dateError, setDateError] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (dateFrom && dateTo && dateTo < dateFrom) {
            setDateTo(dateFrom);
            setDateError(true);
            setTimeout(() => setDateError(false), 1000);
        }
    }, [dateFrom, dateTo]);

    const debouncedSearchRef = useRef(
        debounce(
            (
                searchValue: string,
                statusValue: string,
                dateFromValue: string,
                dateToValue: string,
            ) => {
                const params: any = {
                    status: statusValue !== 'all' ? statusValue : undefined,
                    date_from: dateFromValue || undefined,
                    date_to: dateToValue || undefined,
                    search: searchValue || undefined,
                };

                Object.keys(params).forEach(
                    (key) => params[key] === undefined && delete params[key],
                );

                router.get(route('barber.bookings.index'), params, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            },
            200,
        ),
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        debouncedSearchRef.current(search, status, dateFrom, dateTo);

        return () => debouncedSearchRef.current.cancel();
    }, [search, status, dateFrom, dateTo]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-black text-white';
            case 'confirmed':
                return 'bg-gray-800 text-white';
            case 'in_progress':
                return 'bg-gray-600 text-white';
            case 'pending':
                return 'bg-gray-400 text-white';
            case 'cancelled':
                return 'bg-gray-300 text-gray-800';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusAction = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Review';
            case 'confirmed':
                return 'Start';
            case 'in_progress':
                return 'Complete';
            default:
                return 'View';
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setDateFrom('');
        setDateTo('');
        setShowMobileFilters(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Bookings" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="min-h-screen bg-gradient-to-br from-zinc-50 to-white py-6 lg:py-12"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                    >
                        <div className="space-y-2">
                            <motion.h1
                                className="text-3xl font-bold text-gray-900 md:text-4xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Manage Bookings
                            </motion.h1>
                            <motion.p
                                className="text-gray-600 md:text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                View and manage your appointments
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex w-full items-center gap-3 sm:w-auto"
                        >
                            {/* Mobile Filter Toggle */}
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 border-gray-300 sm:hidden"
                                onClick={() =>
                                    setShowMobileFilters(!showMobileFilters)
                                }
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>

                            <Link href={route('barber.bookings.calendar')}>
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-300 bg-white hover:bg-gray-50 sm:w-auto"
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Calendar View
                                    </span>
                                    <span className="sm:hidden">Calendar</span>
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Desktop Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hidden sm:block"
                    >
                        <Card className="mb-6 border-gray-200 bg-white/80 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                    {/* Search */}
                                    <div className="relative lg:col-span-2">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search customer..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="border-gray-300 bg-white pl-10 transition-all focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                    </div>

                                    {/* Status */}
                                    <Select
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value as
                                                    | 'all'
                                                    | 'pending'
                                                    | 'confirmed'
                                                    | 'in_progress'
                                                    | 'completed'
                                                    | 'cancelled',
                                            )
                                        }
                                    >
                                        <SelectTrigger className="border-gray-300 bg-white">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="confirmed">
                                                Confirmed
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                In Progress
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Date From */}
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) =>
                                                setDateFrom(e.target.value)
                                            }
                                            max={dateTo || undefined}
                                            className={`border-gray-300 bg-white transition-all ${
                                                dateError
                                                    ? 'border-red-500 ring-2 ring-red-200'
                                                    : 'focus:border-black focus:ring-1 focus:ring-black'
                                            }`}
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) =>
                                                setDateTo(e.target.value)
                                            }
                                            min={dateFrom || undefined}
                                            className={`border-gray-300 bg-white transition-all ${
                                                dateError
                                                    ? 'border-red-500 ring-2 ring-red-200'
                                                    : 'focus:border-black focus:ring-1 focus:ring-black'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {dateError && (
                                        <motion.p
                                            // @ts-ignore
                                            variants={floating}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="mt-2 text-sm text-red-600"
                                        >
                                            End date cannot be earlier than
                                            start date.
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Mobile Filters Overlay */}
                    <AnimatePresence>
                        {showMobileFilters && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                                    onClick={() => setShowMobileFilters(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100 }}
                                    transition={{ type: 'spring', damping: 25 }}
                                    className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-gray-200 bg-white p-6 sm:hidden"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            Filters
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowMobileFilters(false)
                                            }
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Search
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Search customer..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <Select
                                                value={status}
                                                onValueChange={(value) =>
                                                    setStatus(
                                                        value as
                                                            | 'all'
                                                            | 'pending'
                                                            | 'confirmed'
                                                            | 'in_progress'
                                                            | 'completed'
                                                            | 'cancelled',
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="border-gray-300">
                                                    <SelectValue placeholder="All Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Status
                                                    </SelectItem>
                                                    <SelectItem value="pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="confirmed">
                                                        Confirmed
                                                    </SelectItem>
                                                    <SelectItem value="in_progress">
                                                        In Progress
                                                    </SelectItem>
                                                    <SelectItem value="completed">
                                                        Completed
                                                    </SelectItem>
                                                    <SelectItem value="cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    From
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) =>
                                                        setDateFrom(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-gray-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    To
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) =>
                                                        setDateTo(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-gray-300"
                                                onClick={clearFilters}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                className="flex-1 bg-black hover:bg-gray-800"
                                                onClick={() =>
                                                    setShowMobileFilters(false)
                                                }
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Bookings List */}
                    <AnimatePresence mode="wait">
                        {bookings.data.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-gray-200 bg-white/80 backdrop-blur-sm">
                                    <CardContent className="py-16 text-center">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                        </motion.div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            No bookings found
                                        </h3>
                                        <p className="text-gray-600">
                                            Try adjusting your filters or check
                                            back later
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-4 border-gray-300"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                // @ts-ignore
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {bookings.data.map((booking, index) => (
                                    <motion.div
                                        key={booking.id}
                                        // @ts-ignore
                                        variants={item}
                                        whileHover={{
                                            scale: 1.01,
                                            transition: { duration: 0.2 },
                                        }}
                                        whileTap={{ scale: 0.99 }}
                                        layout
                                        custom={index}
                                    >
                                        <Card className="border-gray-200 bg-white transition-all duration-300 hover:border-gray-400 hover:shadow-md">
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                    {/* Content */}
                                                    <div className="flex-1 space-y-3">
                                                        {/* Header */}
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                                                    {
                                                                        booking
                                                                            .service
                                                                            ?.name
                                                                    }
                                                                </h3>
                                                                <Badge
                                                                    className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}
                                                                >
                                                                    {booking.status.replace(
                                                                        '_',
                                                                        ' ',
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                            <div className="sm:hidden">
                                                                <span className="font-semibold text-gray-900">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        booking.total_price,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Details Grid */}
                                                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 flex-shrink-0" />
                                                                <span className="font-medium">
                                                                    Customer:
                                                                </span>
                                                                <span className="truncate">
                                                                    {
                                                                        booking
                                                                            .customer
                                                                            ?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                                                <span>
                                                                    {format(
                                                                        new Date(
                                                                            booking.booking_date,
                                                                        ),
                                                                        'MMM d, yyyy',
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 flex-shrink-0" />
                                                                <span>
                                                                    {
                                                                        booking.start_time
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        booking.end_time
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="hidden items-center gap-2 sm:flex">
                                                                <span className="font-semibold text-gray-900">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        booking.total_price,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Notes */}
                                                        {booking.notes && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: 'auto',
                                                                }}
                                                                className="rounded-lg bg-gray-50 p-3"
                                                            >
                                                                <p className="text-sm text-gray-700">
                                                                    <span className="font-medium">
                                                                        Notes:
                                                                    </span>{' '}
                                                                    {
                                                                        booking.notes
                                                                    }
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex min-w-[120px] flex-col gap-2 sm:min-w-[140px]">
                                                        <Link
                                                            href={route(
                                                                'barber.bookings.show',
                                                                booking.id,
                                                            )}
                                                        >
                                                            <Button className="w-full bg-black text-sm hover:bg-gray-800 sm:text-base">
                                                                {getStatusAction(
                                                                    booking.status,
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {bookings.links && bookings.links.length > 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
                        >
                            <div className="text-sm text-gray-600">
                                Showing {bookings.from} to{' '}
                                {bookings.to} of {bookings.total}{' '}
                                results
                            </div>
                            <div className="flex gap-1">
                                {bookings.links.map(
                                    (link: PaginationLink, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`flex items-center justify-center rounded-md border px-3 py-2 text-sm transition-all ${
                                                link.active
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label.includes(
                                                    'Previous',
                                                )
                                                    ? '<ChevronLeft className="h-4 w-4" />'
                                                    : link.label.includes(
                                                            'Next',
                                                        )
                                                      ? '<ChevronRight className="h-4 w-4" />'
                                                      : link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
