import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarBooking, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarProps extends PageProps {
    bookings: CalendarBooking[];
    month: number;
    year: number;
}

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.02,
            delayChildren: 0.1,
        },
    },
};

const dayItem = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
            duration: 0.4,
        },
    },
};

const mixDayItemAndCardHover = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
            duration: 0.4,
        },
    },
    hover: {
        scale: 1.02,
        y: -2,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    tap: { scale: 0.98 },
};

const cardHover = {
    hover: {
        scale: 1.02,
        y: -2,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    tap: { scale: 0.98 },
};

const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const pulseAnimation = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export default function Calendar({ bookings, month, year }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(Number(month));
    const [currentYear, setCurrentYear] = useState(Number(year));

    const getDaysInMonth = (m: number, y: number) =>
        new Date(y, m, 0).getDate();
    const getFirstDayOfMonth = (m: number, y: number) =>
        new Date(y, m - 1, 1).getDay();

    const handlePrevMonth = () => {
        const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        window.location.href = route('barber.bookings.calendar', {
            month: newMonth,
            year: newYear,
        });
    };

    const handleNextMonth = () => {
        const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        window.location.href = route('barber.bookings.calendar', {
            month: newMonth,
            year: newYear,
        });
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const getBookingsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter((b) => b.start.startsWith(dateStr));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-black border-black';
            case 'confirmed':
                return 'bg-green-600 border-green-600';
            case 'in_progress':
                return 'bg-red-600 border-red-600';
            case 'pending':
                return 'bg-yellow-400 border-yellow-400';
            default:
                return 'bg-zinc-500 border-zinc-500';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-black';
            case 'confirmed':
                return 'bg-zinc-800';
            case 'in_progress':
                return 'bg-zinc-600';
            case 'pending':
                return 'bg-zinc-400';
            default:
                return 'bg-zinc-500';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calendar View" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-6 lg:py-8">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                                <Link href={route('barber.bookings.index')}>
                                    <motion.div
                                        whileHover={{ x: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="mb-4 h-9 hover:bg-zinc-100 sm:h-10"
                                        >
                                            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="text-xs sm:text-sm">
                                                Back
                                            </span>
                                        </Button>
                                    </motion.div>
                                </Link>
                                <div>
                                    <motion.h1
                                        className="mb-1 text-2xl font-black tracking-tight text-black sm:text-3xl lg:text-4xl"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {MONTHS[currentMonth - 1]} {currentYear}
                                    </motion.h1>
                                    <motion.p
                                        className="text-sm font-medium text-zinc-600"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Your appointment calendar
                                    </motion.p>
                                </div>
                            </div>

                            {/* Month Navigation */}
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevMonth}
                                    className="h-8 w-8 border-zinc-300 p-0 hover:border-black sm:h-9 sm:w-9"
                                >
                                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextMonth}
                                    className="h-8 w-8 border-zinc-300 p-0 hover:border-black sm:h-9 sm:w-9"
                                >
                                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Calendar Container */}
                    <motion.div
                        variants={slideIn}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 lg:mb-8"
                    >
                        <motion.div
                            whileHover="hover"
                            // @ts-ignore
                            variants={cardHover}
                        >
                            <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-3 sm:p-4 lg:p-6">
                                    {/* Days Header - Responsif */}
                                    <div className="mb-3 grid grid-cols-7 gap-1 sm:mb-4 sm:gap-2">
                                        {DAYS.map((day) => (
                                            <motion.div
                                                key={day}
                                                whileHover={{ scale: 1.1 }}
                                                className="py-2 text-center text-xs font-semibold text-zinc-600 sm:text-sm"
                                            >
                                                {day}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                        className="grid grid-cols-7 gap-1 sm:gap-2"
                                    >
                                        {/* Empty Days */}
                                        {emptyDays.map((i) => (
                                            <motion.div
                                                key={`empty-${i}`}
                                                // @ts-ignore
                                                variants={dayItem}
                                                className="min-h-16 rounded-lg border border-zinc-100 bg-zinc-50/50 sm:min-h-24 lg:min-h-28"
                                            />
                                        ))}

                                        {/* Days with Bookings */}
                                        {days.map((day) => {
                                            const dayBookings =
                                                getBookingsForDay(day);
                                            const isToday =
                                                day === new Date().getDate() &&
                                                currentMonth ===
                                                    new Date().getMonth() + 1 &&
                                                currentYear ===
                                                    new Date().getFullYear();

                                            return (
                                                <motion.div
                                                    key={day}
                                                    // @ts-ignore
                                                    variants={
                                                        mixDayItemAndCardHover
                                                    }
                                                    whileHover="hover"
                                                    className={`group relative min-h-16 rounded-lg border p-1 transition-all sm:min-h-24 sm:p-2 lg:min-h-28 ${
                                                        isToday
                                                            ? 'border-black bg-black/5 shadow-sm'
                                                            : 'border-zinc-200 hover:border-zinc-400'
                                                    }`}
                                                >
                                                    {/* Date Number */}
                                                    <motion.div
                                                        className={`mb-1 text-sm font-semibold sm:text-base ${
                                                            isToday
                                                                ? 'text-black'
                                                                : 'text-zinc-700'
                                                        }`}
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                    >
                                                        {day}
                                                        {isToday && (
                                                            <motion.span
                                                                // @ts-ignore
                                                                variants={
                                                                    pulseAnimation
                                                                }
                                                                animate="pulse"
                                                                className="ml-1 inline-block h-1 w-1 rounded-full bg-black"
                                                            />
                                                        )}
                                                    </motion.div>

                                                    {/* Bookings - Mobile: Dots, Desktop: Details */}
                                                    <div className="space-y-1">
                                                        {/* Mobile: Status Dots */}
                                                        <div className="flex flex-wrap gap-1 sm:hidden">
                                                            {dayBookings
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        booking: CalendarBooking,
                                                                    ) => (
                                                                        <motion.div
                                                                            key={
                                                                                booking.id
                                                                            }
                                                                            whileHover={{
                                                                                scale: 1.3,
                                                                            }}
                                                                            className={`h-2 w-2 rounded-full ${getStatusDot(booking.status)}`}
                                                                        />
                                                                    ),
                                                                )}
                                                            {dayBookings.length >
                                                                4 && (
                                                                <div className="text-[10px] text-zinc-500">
                                                                    +
                                                                    {dayBookings.length -
                                                                        4}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Desktop: Booking Details */}
                                                        <div className="hidden space-y-1 sm:block">
                                                            {dayBookings
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        booking: CalendarBooking,
                                                                    ) => (
                                                                        <Link
                                                                            key={
                                                                                booking.id
                                                                            }
                                                                            href={route(
                                                                                'barber.bookings.show',
                                                                                booking.id,
                                                                            )}
                                                                        >
                                                                            <motion.div
                                                                                whileHover={{
                                                                                    scale: 1.03,
                                                                                    x: 2,
                                                                                }}
                                                                                whileTap={{
                                                                                    scale: 0.98,
                                                                                }}
                                                                                className={`rounded border p-1 text-xs text-white ${getStatusColor(
                                                                                    booking.status,
                                                                                )} cursor-pointer transition-all hover:shadow-sm`}
                                                                            >
                                                                                <div className="truncate font-medium">
                                                                                    {
                                                                                        booking.customer
                                                                                    }
                                                                                </div>
                                                                                <div className="truncate text-[10px] opacity-90">
                                                                                    {
                                                                                        booking.service
                                                                                    }
                                                                                </div>
                                                                            </motion.div>
                                                                        </Link>
                                                                    ),
                                                                )}
                                                            {dayBookings.length >
                                                                2 && (
                                                                <motion.div
                                                                    className="cursor-pointer text-center text-xs text-zinc-500 hover:text-black"
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                >
                                                                    +
                                                                    {dayBookings.length -
                                                                        2}{' '}
                                                                    more
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 rounded-lg bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Legend & Quick Stats */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                    >
                        {/* Status Legend */}
                        <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
                            <CardContent className="p-4 sm:p-5">
                                <h3 className="mb-3 text-sm font-semibold text-black sm:text-base">
                                    Status Legend
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                    {[
                                        {
                                            status: 'pending',
                                            label: 'Pending',
                                            color: 'bg-yellow-400',
                                        },
                                        {
                                            status: 'confirmed',
                                            label: 'Confirmed',
                                            color: 'bg-green-600',
                                        },
                                        {
                                            status: 'in_progress',
                                            label: 'In Progress',
                                            color: 'bg-red-600',
                                        },
                                        {
                                            status: 'completed',
                                            label: 'Completed',
                                            color: 'bg-black',
                                        },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.status}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.5 + index * 0.1,
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.2,
                                                    rotate: 180,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className={`h-3 w-3 rounded-full ${item.color} sm:h-4 sm:w-4`}
                                            />
                                            <span className="text-xs text-zinc-700 sm:text-sm">
                                                {item.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
                            <CardContent className="p-4 sm:p-5">
                                <h3 className="mb-3 text-sm font-semibold text-black sm:text-base">
                                    This Month
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        {
                                            label: 'Total',
                                            value: bookings.length,
                                            color: 'text-black',
                                        },
                                        {
                                            label: 'Pending',
                                            value: bookings.filter(
                                                (b) => b.status === 'pending',
                                            ).length,
                                            color: 'text-zinc-500',
                                        },
                                        {
                                            label: 'Confirmed',
                                            value: bookings.filter(
                                                (b) => b.status === 'confirmed',
                                            ).length,
                                            color: 'text-zinc-700',
                                        },
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: 0.6 + index * 0.1,
                                            }}
                                            className="text-center"
                                        >
                                            <motion.div
                                                className={`text-lg font-black sm:text-xl lg:text-2xl ${stat.color}`}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                {stat.value}
                                            </motion.div>
                                            <div className="text-xs text-zinc-600 sm:text-sm">
                                                {stat.label}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Mobile Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 lg:hidden"
                    >
                        <Card className="border-zinc-200 bg-black text-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Need to manage bookings?
                                        </p>
                                        <p className="text-xs text-zinc-300">
                                            Access full booking tools
                                        </p>
                                    </div>
                                    <Link href={route('barber.bookings.index')}>
                                        <Button
                                            size="sm"
                                            className="bg-white text-black hover:bg-zinc-100"
                                        >
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
