    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import {
        Booking,
        BookingFilters,
        PageProps,
        PaginatedData,
        PaginationLink, StatusCounts,
    } from '@/types';
    import { Head, Link } from '@inertiajs/react';
    import { format } from 'date-fns';
    import { AnimatePresence, motion } from 'framer-motion';
    import {
        ArrowRight,
        Calendar,
        ChevronDown,
        Clock,
        Filter,
        GalleryVerticalEnd,
        Plus,
        Scissors,
        User,
    } from 'lucide-react';
    import { useEffect, useState } from 'react';

    interface BookingsIndexProps extends PageProps {
        bookings: PaginatedData<Booking>;
        filters: BookingFilters;
        counts: StatusCounts;
    }

    export default function Index({ bookings, filters, counts }: BookingsIndexProps) {
        const [selectedStatus, setSelectedStatus] = useState(
            filters.status || 'all',
        );
        const [isFilterOpen, setIsFilterOpen] = useState(false);
        const [isScrolled, setIsScrolled] = useState(false);

        useEffect(() => {
            setSelectedStatus(filters.status || 'all');
        }, [filters.status]);

        useEffect(() => {
            const handleScroll = () => {
                setIsScrolled(window.scrollY > 20);
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }, []);

        const getStatusColor = (status: string) => {
            const colors = {
                completed: 'bg-black text-white',
                confirmed: 'bg-gray-800 text-white',
                pending: 'bg-gray-500 text-white',
                cancelled: 'bg-gray-200 text-gray-700 hover:bg-gray-200',
                in_progress: 'bg-gray-700 text-white',
            };
            return (
                colors[status as keyof typeof colors] || 'bg-gray-500 text-white'
            );
        };

        // Animasi Variants
        const pageVariants = {
            initial: { opacity: 0, y: 20 },
            in: { opacity: 1, y: 0 },
            out: { opacity: 0, y: -20 },
        };

        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                },
            },
        };

        const cardVariants = {
            hidden: {
                opacity: 0,
                y: 30,
                scale: 0.95,
            },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                },
            },
        };

        const slideUpVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 120,
                    damping: 12,
                },
            },
        };

        const floatingAnimation = {
            y: [0, -8, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        };

        const glowAnimation = {
            initial: { boxShadow: '0 0 0 0 rgba(0,0,0,0.1)' },
            hover: {
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                y: -4,
            },
        };

        const statusFilters = [
            {
                value: 'all',
                label: 'All Bookings',
                count: counts.all,
                icon: GalleryVerticalEnd,
            },
            {
                value: 'pending',
                label: 'Pending',
                count: counts.pending,
                icon: Clock,
            },
            {
                value: 'confirmed',
                label: 'Confirmed',
                count: counts.confirmed,
                icon: Calendar,
            },
            {
                value: 'in_progress',
                label: 'In Progress',
                count: counts.in_progress,
                icon: Scissors,
            },
            {
                value: 'completed',
                label: 'Completed',
                count: counts.completed,
                icon: User,
            },
            {
                value: 'cancelled',
                label: 'Cancelled',
                count: counts.cancelled,
                icon: Clock,
            },
        ];

        const getDiscountDisplay = (booking: Booking) => {
            if (!booking.discount_amount || booking.discount_amount <= 0)
                return null;
            if (booking.discount?.discount_type === 'percentage') {
                return `${Math.round(booking.discount.discount_value)}% OFF`;
            } else {
                return `Rp ${booking.discount_amount.toLocaleString('id-ID')} OFF`;
            }
        };

        const getOriginalPrice = (booking: Booking) => {
            return (
                booking.original_price ||
                booking.total_price + booking.discount_amount
            );
        };

        return (
            <AuthenticatedLayout>
                <Head title="My Bookings" />

                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={{ duration: 0.5 }}
                    className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
                >
                    <div className="mx-auto max-w-7xl px-4 py-6 pt-8 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <motion.div
                            // @ts-ignore
                            variants={slideUpVariants}
                            className="mb-8"
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg"
                                            >
                                                <Scissors className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <motion.h1
                                                    className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl"
                                                    // @ts-ignore
                                                    variants={slideUpVariants}
                                                >
                                                    My Bookings
                                                </motion.h1>
                                                <motion.p
                                                    className="mt-2 text-lg text-gray-600"
                                                    // @ts-ignore
                                                    variants={slideUpVariants}
                                                >
                                                    Manage and track your
                                                    appointments
                                                </motion.p>
                                            </div>
                                        </div>

                                        {/* Quick Stats - All Devices */}
                                        <motion.div
                                            // @ts-ignore
                                            variants={slideUpVariants}
                                            className="flex flex-wrap gap-4"
                                        >
                                            {statusFilters
                                                .slice(0, 4)
                                                .map((filter) => (
                                                    <div
                                                        key={filter.value}
                                                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2"
                                                    >
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${
                                                                filter.value ===
                                                                'all'
                                                                    ? 'bg-black'
                                                                    : filter.value ===
                                                                        'confirmed'
                                                                      ? 'bg-gray-800'
                                                                      : filter.value ===
                                                                          'pending'
                                                                        ? 'bg-gray-500'
                                                                        : 'bg-gray-700'
                                                            }`}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {filter.label}
                                                        </span>
                                                        <span className="text-sm font-bold text-black">
                                                            {filter.count}
                                                        </span>
                                                    </div>
                                                ))}
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        // @ts-ignore
                                        variants={slideUpVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-shrink-0"
                                    >
                                        <Link
                                            href={route('customer.bookings.create')}
                                        >
                                            <Button className="h-12 w-full rounded-xl border-0 bg-black px-6 text-base shadow-lg hover:bg-gray-800 lg:w-auto">
                                                <Plus className="mr-2 h-4 w-4" />
                                                <span>New Booking</span>
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Filter Section */}
                        <motion.div
                            // @ts-ignore
                            variants={cardVariants}
                            className="mb-8"
                        >
                            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-4 sm:p-6">
                                    {/* Desktop Filters - Grid Layout */}
                                    <div className="hidden lg:block">
                                        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                                            {statusFilters.map((filter) => {
                                                const Icon = filter.icon;
                                                return (
                                                    <Link
                                                        key={filter.value}
                                                        href={route(
                                                            'customer.bookings.index',
                                                            {
                                                                status:
                                                                    filter.value ===
                                                                    'all'
                                                                        ? undefined
                                                                        : filter.value,
                                                            },
                                                        )}
                                                        preserveState
                                                        preserveScroll
                                                    >
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.02,
                                                                y: -2,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                                                selectedStatus ===
                                                                filter.value
                                                                    ? 'border-black bg-black text-white shadow-lg'
                                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Icon className="h-4 w-4" />
                                                                    <span className="font-medium">
                                                                        {
                                                                            filter.label
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <span
                                                                    className={`font-bold ${
                                                                        selectedStatus ===
                                                                        filter.value
                                                                            ? 'text-white'
                                                                            : 'text-black'
                                                                    }`}
                                                                >
                                                                    {filter.count}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tablet Filters - 2 Columns */}
                                    <div className="hidden md:block lg:hidden">
                                        <div className="grid grid-cols-2 gap-3">
                                            {statusFilters.map((filter) => (
                                                <Link
                                                    key={filter.value}
                                                    href={route(
                                                        'customer.bookings.index',
                                                        {
                                                            status:
                                                                filter.value ===
                                                                'all'
                                                                    ? undefined
                                                                    : filter.value,
                                                        },
                                                    )}
                                                    preserveState
                                                    preserveScroll
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`rounded-xl border-2 p-3 transition-all ${
                                                            selectedStatus ===
                                                            filter.value
                                                                ? 'border-black bg-black text-white'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">
                                                                {filter.label}
                                                            </span>
                                                            <span
                                                                className={`text-sm font-bold ${
                                                                    selectedStatus ===
                                                                    filter.value
                                                                        ? 'text-white'
                                                                        : 'text-black'
                                                                }`}
                                                            >
                                                                {filter.count}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Filter Dropdown */}
                                    <div className="md:hidden">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="h-12 w-full justify-between rounded-xl border-2 border-gray-200 bg-white"
                                                onClick={() =>
                                                    setIsFilterOpen(!isFilterOpen)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Filter className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {
                                                            statusFilters.find(
                                                                (f) =>
                                                                    f.value ===
                                                                    selectedStatus,
                                                            )?.label
                                                        }
                                                    </span>
                                                </div>
                                                <motion.div
                                                    animate={{
                                                        rotate: isFilterOpen
                                                            ? 180
                                                            : 0,
                                                    }}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </motion.div>
                                            </Button>
                                        </motion.div>

                                        <AnimatePresence>
                                            {isFilterOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 space-y-2"
                                                >
                                                    {statusFilters.map((filter) => (
                                                        <Link
                                                            key={filter.value}
                                                            href={route(
                                                                'customer.bookings.index',
                                                                {
                                                                    status:
                                                                        filter.value ===
                                                                        'all'
                                                                            ? undefined
                                                                            : filter.value,
                                                                },
                                                            )}
                                                            preserveState
                                                            preserveScroll
                                                        >
                                                            <motion.div
                                                                whileHover={{
                                                                    x: 4,
                                                                }}
                                                                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                                                                    selectedStatus ===
                                                                    filter.value
                                                                        ? 'border-black bg-black text-white'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <span className="font-medium">
                                                                    {filter.label}
                                                                </span>
                                                                <span
                                                                    className={`font-bold ${
                                                                        selectedStatus ===
                                                                        filter.value
                                                                            ? 'text-white'
                                                                            : 'text-black'
                                                                    }`}
                                                                >
                                                                    {filter.count}
                                                                </span>
                                                            </motion.div>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Bookings List */}
                        <AnimatePresence mode="wait">
                            {bookings.data.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <CardContent className="py-16 text-center">
                                            <motion.div
                                                // @ts-ignore
                                                animate={floatingAnimation}
                                                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100"
                                            >
                                                <Calendar className="h-10 w-10 text-gray-400" />
                                            </motion.div>
                                            <h3 className="mb-3 text-2xl font-bold text-black">
                                                No bookings found
                                            </h3>
                                            <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
                                                {selectedStatus === 'all'
                                                    ? 'Ready for a fresh look? Book your first appointment with our expert barbers.'
                                                    : `No ${selectedStatus} bookings found. Try changing the filter.`}
                                            </p>
                                            {selectedStatus === 'all' && (
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Link
                                                        href={route(
                                                            'customer.bookings.create',
                                                        )}
                                                    >
                                                        <Button className="h-12 rounded-xl border-0 bg-black px-8 text-base shadow-lg hover:bg-gray-800">
                                                            <Scissors className="mr-2 h-4 w-4" />
                                                            Book Your First
                                                            Appointment
                                                        </Button>
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4 sm:space-y-6"
                                >
                                    {bookings.data.map((booking) => {
                                        const hasDiscount =
                                            booking.discount_amount > 0;
                                        const discountDisplay =
                                            getDiscountDisplay(booking);
                                        const originalPrice =
                                            getOriginalPrice(booking);

                                        return (
                                            <motion.div
                                                key={booking.id}
                                                // @ts-ignore
                                                variants={cardVariants}
                                                whileHover="hover"
                                                initial="initial"
                                                animate="initial"
                                                className="group"
                                            >
                                                <motion.div
                                                    variants={glowAnimation}
                                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                                                >
                                                    {/* Status Indicator Bar */}
                                                    <div
                                                        className={`h-1.5 ${
                                                            booking.status ===
                                                            'completed'
                                                                ? 'bg-black'
                                                                : booking.status ===
                                                                    'confirmed'
                                                                  ? 'bg-gray-800'
                                                                  : booking.status ===
                                                                      'in_progress'
                                                                    ? 'bg-gray-600'
                                                                    : booking.status ===
                                                                        'pending'
                                                                      ? 'bg-gray-500'
                                                                      : 'bg-gray-300'
                                                        }`}
                                                    />

                                                    <div className="p-4 sm:p-6">
                                                        {/* Mobile Layout */}
                                                        <div className="block space-y-4 lg:hidden">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                                    <motion.div
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                            rotate: 5,
                                                                        }}
                                                                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white"
                                                                    >
                                                                        <Scissors className="h-5 w-5" />
                                                                    </motion.div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="truncate text-lg font-bold text-black">
                                                                            {
                                                                                booking
                                                                                    .service
                                                                                    ?.name
                                                                            }
                                                                        </h3>
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            with{' '}
                                                                            {
                                                                                booking
                                                                                    .barber
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge
                                                                    className={`${getStatusColor(booking.status)} rounded-full px-3 py-1 text-xs font-medium`}
                                                                >
                                                                    {booking.status.replace(
                                                                        '_',
                                                                        ' ',
                                                                    )}
                                                                </Badge>
                                                            </div>

                                                            {/* Details Grid */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-medium text-gray-500">
                                                                        DATE
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-black">
                                                                        {format(
                                                                            new Date(
                                                                                booking.booking_date,
                                                                            ),
                                                                            'MMM d, yyyy',
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-medium text-gray-500">
                                                                        TIME
                                                                    </p>
                                                                    <p className="font-mono text-sm font-semibold text-black">
                                                                        {
                                                                            booking.start_time
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Price & Action */}
                                                            <div className="flex items-center justify-between pt-2">
                                                                <div className="flex items-baseline gap-2">
                                                                    {hasDiscount && (
                                                                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                                                                            {
                                                                                discountDisplay
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    <span className="text-lg font-bold text-black">
                                                                        Rp{' '}
                                                                        {Number(
                                                                            booking.total_price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                    {hasDiscount && (
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            Rp{' '}
                                                                            {originalPrice.toLocaleString(
                                                                                'id-ID',
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Link
                                                                    href={route(
                                                                        'customer.bookings.show',
                                                                        booking.id,
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="rounded-xl border-2 border-gray-200"
                                                                    >
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>

                                                        {/* Desktop/Tablet Layout */}
                                                        <div className="hidden lg:block">
                                                            <div className="flex items-center justify-between gap-6">
                                                                {/* Service Info */}
                                                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                                                    <motion.div
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                            rotate: 5,
                                                                        }}
                                                                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-white"
                                                                    >
                                                                        <Scissors className="h-6 w-6" />
                                                                    </motion.div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="truncate text-xl font-bold text-black">
                                                                            {
                                                                                booking
                                                                                    .service
                                                                                    ?.name
                                                                            }
                                                                        </h3>
                                                                        <p className="mt-1 text-gray-600">
                                                                            with{' '}
                                                                            {
                                                                                booking
                                                                                    .barber
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Details */}
                                                                <div className="flex flex-1 items-center justify-between gap-8">
                                                                    <div className="space-y-1 text-center">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            DATE
                                                                        </p>
                                                                        <p className="font-semibold text-black">
                                                                            {format(
                                                                                new Date(
                                                                                    booking.booking_date,
                                                                                ),
                                                                                'EEE, MMM d',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1 text-center">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            TIME
                                                                        </p>
                                                                        <p className="font-mono font-semibold text-black">
                                                                            {
                                                                                booking.start_time
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="min-w-[120px] space-y-1 text-center">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            AMOUNT
                                                                        </p>
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            {hasDiscount && (
                                                                                <span className="text-xs font-medium text-green-600">
                                                                                    {
                                                                                        discountDisplay
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            <span className="font-bold text-black">
                                                                                Rp{' '}
                                                                                {Number(
                                                                                    booking.total_price,
                                                                                ).toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {hasDiscount && (
                                                                            <span className="block text-xs text-gray-500 line-through">
                                                                                Rp{' '}
                                                                                {originalPrice.toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Status & Action */}
                                                                <div className="flex flex-shrink-0 items-center gap-4">
                                                                    <Badge
                                                                        className={`${getStatusColor(booking.status)} rounded-full px-4 py-2 font-medium`}
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
                                                                            className="rounded-xl border-2 border-gray-200 hover:border-black"
                                                                        >
                                                                            View
                                                                            Details
                                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Tablet Layout */}
                                                        <div className="hidden md:block lg:hidden">
                                                            <div className="space-y-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex flex-1 items-start gap-3">
                                                                        <motion.div
                                                                            whileHover={{
                                                                                scale: 1.1,
                                                                                rotate: 5,
                                                                            }}
                                                                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white"
                                                                        >
                                                                            <Scissors className="h-5 w-5" />
                                                                        </motion.div>
                                                                        <div className="flex-1">
                                                                            <h3 className="text-lg font-bold text-black">
                                                                                {
                                                                                    booking
                                                                                        .service
                                                                                        ?.name
                                                                                }
                                                                            </h3>
                                                                            <p className="mt-1 text-sm text-gray-600">
                                                                                with{' '}
                                                                                {
                                                                                    booking
                                                                                        .barber
                                                                                        ?.name
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge
                                                                        className={`${getStatusColor(booking.status)} rounded-full px-3 py-1 text-sm font-medium`}
                                                                    >
                                                                        {booking.status.replace(
                                                                            '_',
                                                                            ' ',
                                                                        )}
                                                                    </Badge>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            DATE
                                                                        </p>
                                                                        <p className="font-semibold text-black">
                                                                            {format(
                                                                                new Date(
                                                                                    booking.booking_date,
                                                                                ),
                                                                                'MMM d',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            TIME
                                                                        </p>
                                                                        <p className="font-mono font-semibold text-black">
                                                                            {
                                                                                booking.start_time
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-medium text-gray-500">
                                                                            AMOUNT
                                                                        </p>
                                                                        <div className="flex items-center gap-2">
                                                                            {hasDiscount && (
                                                                                <span className="text-xs font-medium text-green-600">
                                                                                    {
                                                                                        discountDisplay
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            <span className="font-bold text-black">
                                                                                Rp{' '}
                                                                                {Number(
                                                                                    booking.total_price,
                                                                                ).toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-end">
                                                                    <Link
                                                                        href={route(
                                                                            'customer.bookings.show',
                                                                            booking.id,
                                                                        )}
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            className="rounded-xl border-2 border-gray-200"
                                                                        >
                                                                            View
                                                                            Details
                                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination */}
                        {bookings.links && bookings.links.length > 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="mt-8"
                            >
                                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                                            <div className="text-sm font-medium text-gray-600">
                                                Showing {bookings.from} to{' '}
                                                {bookings.to} of{' '}
                                                {bookings.total} results
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {bookings.links.map(
                                                    (link: PaginationLink, index: number) => (
                                                        <Link
                                                            key={index}
                                                            href={link.url || '#'}
                                                            preserveState
                                                            className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl border-2 px-3 text-sm font-medium transition-all ${
                                                                link.active
                                                                    ? 'border-black bg-black text-white'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                            } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AuthenticatedLayout>
        );
    }
