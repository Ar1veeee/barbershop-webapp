import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/components/ui/pagination';
import {
    Booking,
    BookingFilters,
    PageProps,
    PaginatedData,
    StatusCounts,
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Plus, Scissors } from 'lucide-react';
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface BookingsIndexProps extends PageProps {
    bookings: PaginatedData<Booking>;
    filters: BookingFilters;
    counts: StatusCounts;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; count: number }
> = {
    all: { label: 'All Bookings', color: 'bg-black text-white', count: 0 },
    pending: { label: 'Pending', color: 'bg-gray-500 text-white', count: 0 },
    confirmed: {
        label: 'Confirmed',
        color: 'bg-gray-800 text-white',
        count: 0,
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-gray-700 text-white',
        count: 0,
    },
    completed: { label: 'Completed', color: 'bg-black text-white', count: 0 },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-gray-300 text-gray-700',
        count: 0,
    },
};

export default function Index({
    bookings,
    filters,
    counts,
}: BookingsIndexProps) {
    const selectedStatus = filters.status || 'all';

    Object.keys(STATUS_CONFIG).forEach((key) => {
        STATUS_CONFIG[key].count = (counts as any)[key] || 0;
    });

    const getDiscountDisplay = (booking: Booking) => {
        if (!booking.discount_amount || booking.discount_amount <= 0)
            return null;
        return booking.discount?.discount_type === 'percentage'
            ? `${Math.round(booking.discount.discount_value)}% OFF`
            : `Rp ${booking.discount_amount.toLocaleString('id-ID')} OFF`;
    };

    const originalPrice = (booking: Booking) =>
        booking.original_price || booking.total_price + booking.discount_amount;

    return (
        <AuthenticatedLayout>
            <Head title="My Bookings" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                My Bookings
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Manage and track your appointments
                            </p>
                        </div>
                        <Link href={route('customer.bookings.create')}>
                            <Button className="h-12 rounded-xl bg-black px-6 text-base shadow-lg hover:bg-gray-800">
                                <Plus className="mr-2 h-4 w-4" /> New Booking
                            </Button>
                        </Link>
                    </div>

                    {/* Filters - Responsive Grid */}
                    <Card className="mb-8 rounded-2xl border border-gray-200 shadow-sm">
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                {Object.entries(STATUS_CONFIG).map(
                                    ([value, config]) => (
                                        <Link
                                            key={value}
                                            href={route(
                                                'customer.bookings.index',
                                                {
                                                    status:
                                                        value === 'all'
                                                            ? undefined
                                                            : value,
                                                },
                                            )}
                                            preserveState
                                            preserveScroll
                                        >
                                            <div
                                                className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                                                    selectedStatus === value
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="text-sm font-medium">
                                                    {config.label}
                                                </div>
                                                <div
                                                    className={`mt-1 text-lg font-bold ${selectedStatus === value ? 'text-white' : 'text-black'}`}
                                                >
                                                    {config.count}
                                                </div>
                                            </div>
                                        </Link>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bookings List */}
                    {bookings.data.length === 0 ? (
                        <Card className="rounded-2xl border border-gray-200 shadow-sm">
                            <CardContent className="py-16 text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                                    <Calendar className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="mb-3 text-2xl font-bold">
                                    No bookings found
                                </h3>
                                <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
                                    {selectedStatus === 'all'
                                        ? 'Ready for a fresh look? Book your first appointment.'
                                        : `No ${selectedStatus.replace('_', ' ')} bookings found.`}
                                </p>
                                {selectedStatus === 'all' && (
                                    <Link
                                        href={route('customer.bookings.create')}
                                    >
                                        <Button className="h-12 rounded-xl bg-black px-8 shadow-lg hover:bg-gray-800">
                                            <Scissors className="mr-2 h-4 w-4" />{' '}
                                            Book Appointment
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.data.map((booking) => {
                                const hasDiscount = booking.discount_amount > 0;
                                const discountText =
                                    getDiscountDisplay(booking);

                                return (
                                    <Card
                                        key={booking.id}
                                        className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-lg"
                                    >
                                        <div
                                            className={`h-1.5 ${STATUS_CONFIG[booking.status]?.color.split(' ')[0] || 'bg-gray-500'}`}
                                        />
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                                {/* Left: Service Info */}
                                                <div className="flex items-center gap-4 min-w-[280px]">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                                                        <Scissors className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold">
                                                            {
                                                                booking.service
                                                                    ?.name
                                                            }
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            with{' '}
                                                            {
                                                                booking.barber
                                                                    ?.name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Center: Details */}
                                                <div className="flex gap-6">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            DATE
                                                        </p>
                                                        <p className="font-semibold">
                                                            {format(
                                                                new Date(
                                                                    booking.booking_date,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            TIME
                                                        </p>
                                                        <p className="font-mono font-semibold">
                                                            {booking.start_time}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            AMOUNT
                                                        </p>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {hasDiscount && (
                                                                <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-600">
                                                                    {
                                                                        discountText
                                                                    }
                                                                </span>
                                                            )}
                                                            <span className="font-bold">
                                                                Rp{' '}
                                                                {booking.total_price.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                        </div>
                                                        {hasDiscount && (
                                                            <p className="text-xs text-gray-500 line-through">
                                                                Rp{' '}
                                                                {originalPrice(
                                                                    booking,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Status + Action */}
                                                <div className="flex items-center justify-between gap-4 md:justify-end">
                                                    <Badge
                                                        className={`${STATUS_CONFIG[booking.status]?.color} rounded-full px-3 py-1`}
                                                    >
                                                        {booking.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                    <Link
                                                        href={route(
                                                            'customer.bookings.show',
                                                            booking.id,
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl border-2"
                                                        >
                                                            View{' '}
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {bookings.links && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                {bookings.links.map((link, index) => {
                                    // Previous
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <PaginationItem key="prev">
                                                <Link
                                                    href={link.url || '#'}
                                                    preserveState
                                                    preserveScroll
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: 'ghost',
                                                            size: 'default',
                                                        }),
                                                        'gap-1 pl-2.5',
                                                        !link.url &&
                                                            'pointer-events-none opacity-50',
                                                    )}
                                                    aria-label="Go to previous page"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    <span>Previous</span>
                                                </Link>
                                            </PaginationItem>
                                        );
                                    }

                                    // Next
                                    if (link.label.includes('Next')) {
                                        return (
                                            <PaginationItem key="next">
                                                <Link
                                                    href={link.url || '#'}
                                                    preserveState
                                                    preserveScroll
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: 'ghost',
                                                            size: 'default',
                                                        }),
                                                        'gap-1 pr-2.5',
                                                        !link.url &&
                                                            'pointer-events-none opacity-50',
                                                    )}
                                                    aria-label="Go to next page"
                                                >
                                                    <span>Next</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </PaginationItem>
                                        );
                                    }

                                    // Ellipsis
                                    if (
                                        link.label === '&hellip;' ||
                                        link.label === '…'
                                    ) {
                                        return (
                                            <PaginationItem
                                                key={`ellipsis-${index}`}
                                            >
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    // Number pages
                                    return (
                                        <PaginationItem key={link.url || index}>
                                            <Link
                                                href={link.url || '#'}
                                                preserveState
                                                preserveScroll
                                                className={cn(
                                                    buttonVariants({
                                                        variant: link.active
                                                            ? 'outline'
                                                            : 'ghost',
                                                        size: 'icon',
                                                    }),
                                                    !link.url &&
                                                        'pointer-events-none opacity-50',
                                                )}
                                                aria-current={
                                                    link.active
                                                        ? 'page'
                                                        : undefined
                                                }
                                            >
                                                {link.label
                                                    .replace(
                                                        /&laquo;|&raquo;|…/g,
                                                        '',
                                                    )
                                                    .trim()}
                                            </Link>
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
