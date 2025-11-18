import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Booking, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Mail,
    MessageSquare,
    Phone,
    Scissors,
    Star,
    Timer,
    TrendingUp,
    User,
} from 'lucide-react';

interface BookingShowProps extends PageProps {
    booking: Booking;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 12,
            duration: 0.6,
        },
    },
};

const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
        },
    },
};

export default function Show({ booking }: BookingShowProps) {
    const getStatusConfig = (status: string) => {
        const configs = {
            completed: {
                color: 'bg-black text-white border-black',
                icon: CheckCircle2,
                message: 'Service completed successfully',
                bgGradient: 'from-zinc-900 to-zinc-700',
                pulse: false,
            },
            confirmed: {
                color: 'bg-zinc-800 text-white border-zinc-800',
                icon: CheckCircle2,
                message: 'Appointment confirmed',
                bgGradient: 'from-zinc-800 to-zinc-600',
                pulse: true,
            },
            in_progress: {
                color: 'bg-zinc-600 text-white border-zinc-600',
                icon: Activity,
                message: 'Service in progress',
                bgGradient: 'from-zinc-700 to-zinc-500',
                pulse: true,
            },
            pending: {
                color: 'bg-zinc-400 text-white border-zinc-400',
                icon: Timer,
                message: 'Waiting for confirmation',
                bgGradient: 'from-zinc-500 to-zinc-400',
                pulse: true,
            },
            cancelled: {
                color: 'bg-zinc-100 text-zinc-600 border-zinc-300',
                icon: AlertCircle,
                message: 'Booking cancelled',
                bgGradient: 'from-zinc-200 to-zinc-100',
                pulse: false,
            },
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const getTimeUntilAppointment = () => {
        try {
            const bookingDate = new Date(booking.booking_date);

            // Extract date parts from bookingDate
            const year = bookingDate.getFullYear();
            const month = bookingDate.getMonth();
            const day = bookingDate.getDate();

            // Parse start_time
            const [startHours, startMinutes, startSeconds] =
                booking.start_time.split(':');

            const startTime = new Date(
                year,
                month,
                day,
                parseInt(startHours),
                parseInt(startMinutes),
                parseInt(startSeconds || '0'),
            );

            const now = new Date();

            const diffMs = startTime.getTime() - now.getTime();

            if (diffMs < 0) {
                const absDiffMs = Math.abs(diffMs);
                const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
                const diffHours = Math.floor(diffMinutes / 60);
                const diffDays = Math.floor(diffHours / 24);

                if (diffDays > 0) {
                    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                } else if (diffHours > 0) {
                    return `${diffHours}h ${diffMinutes % 60}m ago`;
                } else if (diffMinutes > 0) {
                    return `${diffMinutes} minutes ago`;
                }
                return 'Just started';
            }

            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffDays > 0) {
                return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
            } else if (diffHours > 0) {
                return `${diffHours}h ${diffMinutes % 60}m away`;
            } else if (diffMinutes > 0) {
                return `${diffMinutes} minutes away`;
            }
            return 'Starting now';
        } catch (error) {
            return null;
        }
    };

    const statusConfig = getStatusConfig(booking.status);
    const StatusIcon = statusConfig.icon;
    const timeUntil = getTimeUntilAppointment();

    return (
        <AuthenticatedLayout>
            <Head title={`Booking #${booking.id}`} />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white py-4 sm:py-8">
                <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 sm:mb-8"
                    >
                        {/* Back Button - Mobile Optimized */}
                        <div className="mb-4 flex items-center justify-between sm:mb-6">
                            <Link href={route('barber.bookings.index')}>
                                <Button
                                    variant="ghost"
                                    className="group -ml-2 text-zinc-600 transition-all duration-300 hover:bg-zinc-100 hover:text-black sm:-ml-3"
                                    size="sm"
                                >
                                    <motion.div
                                        whileHover={{ x: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                        <span className="xs:inline hidden text-sm font-medium">
                                            Back to Bookings
                                        </span>
                                        <span className="xs:hidden text-sm font-medium">
                                            Back
                                        </span>
                                    </motion.div>
                                </Button>
                            </Link>

                            {/* Status Badge - Mobile Optimized */}
                            <motion.div
                                animate={
                                    statusConfig.pulse
                                        ? { scale: [1, 1.02, 1] }
                                        : {}
                                }
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Badge
                                    className={`${statusConfig.color} flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold tracking-wide sm:gap-2 sm:px-4 sm:py-2`}
                                >
                                    <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>
                                        {booking.status
                                            .replace('_', ' ')
                                            .toUpperCase()}
                                    </span>
                                </Badge>
                            </motion.div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-3 text-center sm:text-left">
                            <div>
                                <h1 className="mb-1 text-2xl font-bold tracking-tight text-black sm:text-4xl">
                                    Booking Details
                                </h1>
                                <p className="font-mono text-xs tracking-wide text-zinc-500 sm:text-sm">
                                    ID #{booking.id}
                                </p>
                            </div>

                            {/* Status Message */}
                            <AnimatePresence>
                                {statusConfig.message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex justify-center sm:justify-start"
                                    >
                                        <div className="inline-flex max-w-md items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-xs text-zinc-600 shadow-sm backdrop-blur-sm sm:text-sm">
                                            <StatusIcon className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                            <span>{statusConfig.message}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Countdown Timer */}
                    {['pending', 'confirmed', 'in_progress'].includes(
                        booking.status,
                    ) &&
                        timeUntil && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="mb-6"
                            >
                                <Card
                                    className={`border-0 bg-gradient-to-br shadow-lg ${statusConfig.bgGradient} overflow-hidden text-white`}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm sm:h-12 sm:w-12">
                                                    <Timer className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </motion.div>
                                                <div>
                                                    <p className="mb-1 text-xs uppercase tracking-wider text-white/70">
                                                        Time Until Appointment
                                                    </p>
                                                    <p className="font-mono text-xl font-bold sm:text-2xl">
                                                        {timeUntil}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div className="hidden sm:block">
                                                <Scissors className="h-8 w-8 text-white/20" />
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        {/* Left Column - Customer & Service */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                            {/* Customer Information */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card className="overflow-hidden border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="border-b border-zinc-100 bg-white/80 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            <User className="h-4 w-4" />
                                            Customer Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="xs:flex-row flex flex-col items-start gap-4 sm:gap-6">
                                            {/* Avatar */}
                                            <motion.div
                                                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-2xl"
                                                whileHover={{
                                                    scale: 1.05,
                                                    rotate: 2,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                            >
                                                {booking.customer
                                                    ?.avatar_url ? (
                                                    <img
                                                        src={
                                                            booking.customer
                                                                .avatar_url
                                                        }
                                                        alt={
                                                            booking.customer
                                                                .name
                                                        }
                                                        className="h-full w-full rounded-2xl object-cover"
                                                    />
                                                ) : (
                                                    <span>
                                                        {booking.customer?.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </motion.div>

                                            {/* Customer Details */}
                                            <div className="min-w-0 flex-1 space-y-4">
                                                <div>
                                                    <h3 className="mb-1 truncate text-xl font-bold text-black sm:text-2xl">
                                                        {booking.customer?.name}
                                                    </h3>
                                                </div>

                                                {/* Contact Info Grid */}
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <motion.div
                                                        // @ts-ignore
                                                        variants={slideIn}
                                                        className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 shadow-sm transition-all duration-300 group-hover:bg-black">
                                                            <Phone className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                                Phone
                                                            </p>
                                                            <p className="truncate text-sm font-semibold text-black">
                                                                {booking
                                                                    .customer
                                                                    ?.phone ??
                                                                    'Not provided'}
                                                            </p>
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        // @ts-ignore
                                                        variants={slideIn}
                                                        className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 shadow-sm transition-all duration-300 group-hover:bg-black">
                                                            <Mail className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                                Email
                                                            </p>
                                                            <p className="truncate text-sm font-semibold text-black">
                                                                {
                                                                    booking
                                                                        .customer
                                                                        ?.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Service Details */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card className="overflow-hidden border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="border-b border-zinc-100 bg-white/80 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            <Scissors className="h-4 w-4" />
                                            Service Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="space-y-5">
                                            <div>
                                                <h3 className="mb-3 text-xl font-bold tracking-tight text-black sm:text-2xl">
                                                    {booking.service?.name}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                                                    {booking.service
                                                        ?.description ||
                                                        'No description provided.'}
                                                </p>
                                            </div>
                                            <Separator className="bg-zinc-100" />
                                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                                <motion.div
                                                    className="space-y-2 rounded-xl p-3 text-center transition-colors hover:bg-zinc-50 sm:text-left"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400 sm:justify-start">
                                                        <Clock className="h-3 w-3" />
                                                        Duration
                                                    </p>
                                                    <p className="text-lg font-bold text-black sm:text-xl">
                                                        {
                                                            booking.service
                                                                ?.duration
                                                        }{' '}
                                                        min
                                                    </p>
                                                </motion.div>
                                                <motion.div
                                                    className="space-y-2 rounded-xl p-3 text-center transition-colors hover:bg-zinc-50 sm:text-left"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400 sm:justify-start">
                                                        <CreditCard className="h-3 w-3" />
                                                        Price
                                                    </p>
                                                    <p className="text-lg font-bold tracking-tight text-black sm:text-2xl">
                                                        Rp{' '}
                                                        {Number(
                                                            booking.total_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Right Column - Schedule & Payment */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Appointment Details */}
                            <motion.div
                                // @ts-ignore
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card className="overflow-hidden border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="border-b border-zinc-100 bg-white/80 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            <Calendar className="h-4 w-4" />
                                            Schedule
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="space-y-4">
                                            <motion.div
                                                // @ts-ignore
                                                variants={slideIn}
                                                className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-50"
                                            >
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 shadow-sm transition-all group-hover:bg-black sm:h-12 sm:w-12">
                                                    <Calendar className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                        Date
                                                    </p>
                                                    <p className="text-sm font-bold leading-tight text-black sm:text-base">
                                                        {format(
                                                            new Date(
                                                                booking.booking_date,
                                                            ),
                                                            'EEE, MMM d, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                // @ts-ignore
                                                variants={slideIn}
                                                className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-50"
                                            >
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 shadow-sm transition-all group-hover:bg-black sm:h-12 sm:w-12">
                                                    <Clock className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                        Time
                                                    </p>
                                                    <p className="font-mono text-sm font-bold text-black sm:text-base">
                                                        {booking.start_time} -{' '}
                                                        {booking.end_time}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {booking.notes && (
                                                <motion.div
                                                    // @ts-ignore
                                                    variants={slideIn}
                                                    className="group flex items-start gap-3 pt-3"
                                                >
                                                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 shadow-sm transition-all group-hover:bg-black sm:h-12 sm:w-12">
                                                        <MessageSquare className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                            Customer Notes
                                                        </p>
                                                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                                                            <p className="text-sm leading-relaxed text-zinc-700 sm:text-base">
                                                                {booking.notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Payment Summary */}
                            <motion.div
                                // @ts-ignore
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-lg transition-all duration-500 hover:shadow-xl">
                                    <CardHeader className="border-b border-white/10 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                                            <CreditCard className="h-4 w-4" />
                                            Payment Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-white/80 sm:text-base">
                                                    Service Fee
                                                </span>
                                                <span className="text-sm font-semibold text-white sm:text-base">
                                                    Rp{' '}
                                                    {Number(
                                                        booking.total_price,
                                                    ).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <Separator className="bg-white/10" />
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-lg font-bold text-white">
                                                    Total Earned
                                                </span>
                                                <span className="text-2xl font-bold text-white sm:text-3xl">
                                                    Rp{' '}
                                                    {Number(
                                                        booking.total_price,
                                                    ).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Review Section */}
                            {booking.review && (
                                <motion.div
                                    // @ts-ignore
                                    variants={scaleIn}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="overflow-hidden border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                        <CardHeader className="border-b border-zinc-100 bg-white/80 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                <TrendingUp className="h-4 w-4" />
                                                Customer Review
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <motion.div
                                                                    key={star}
                                                                    initial={{
                                                                        scale: 0,
                                                                        rotate: -180,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                        rotate: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            star *
                                                                            0.05,
                                                                        type: 'spring',
                                                                        stiffness: 200,
                                                                    }}
                                                                >
                                                                    <Star
                                                                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                                                            star <=
                                                                            booking
                                                                                .review!
                                                                                .rating
                                                                                ? 'fill-black text-black'
                                                                                : 'text-zinc-200'
                                                                        }`}
                                                                    />
                                                                </motion.div>
                                                            ),
                                                        )}
                                                    </div>
                                                    <span className="text-xl font-bold text-black sm:text-2xl">
                                                        {booking.review.rating}
                                                        .0
                                                    </span>
                                                </div>
                                                {booking.review.comment && (
                                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                                                        <p className="text-sm leading-relaxed text-zinc-700 sm:text-base">
                                                            "
                                                            {
                                                                booking.review
                                                                    .comment
                                                            }
                                                            "
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
