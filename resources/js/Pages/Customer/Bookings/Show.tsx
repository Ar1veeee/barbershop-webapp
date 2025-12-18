import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Booking, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Gift,
    Info,
    Scissors,
    Star,
    Timer,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

// Animasi Variants
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
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
            duration: 0.6,
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

const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
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

const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

const glowAnimation = {
    boxShadow: [
        '0 0 0 0 rgba(0, 0, 0, 0.1)',
        '0 0 0 10px rgba(0, 0, 0, 0)',
        '0 0 0 0 rgba(0, 0, 0, 0.1)',
    ],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

interface BookingShowProps extends PageProps {
    booking: Booking;
}

export default function Show({ booking }: BookingShowProps) {
    const { toast } = useToast();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');

    const hasDiscount = booking.discount_amount > 0 && booking.discount;
    const discountSavings = booking.original_price - booking.total_price;

    // Helper functions
    const getFormattedDiscountValue = () => {
        if (!booking.discount) return '';
        if (booking.discount.discount_type === 'percentage') {
            return `${Math.round(booking.discount.discount_value)}%`;
        } else {
            return `Rp ${booking.discount.discount_value.toLocaleString('id-ID')}`;
        }
    };

    const getDiscountDisplay = () => {
        if (!booking.discount) return '';
        if (booking.discount.discount_type === 'percentage') {
            return `${Math.round(booking.discount.discount_value)}% OFF`;
        } else {
            return `Rp ${booking.discount.discount_value.toLocaleString('id-ID')} OFF`;
        }
    };

    const canBeCancelledByTime = () => {
        try {
            const startTime = new Date(booking.booking_date);
            const now = new Date();
            const diffMs = startTime.getTime() - now.getTime();
            const diffMinutes = diffMs / (1000 * 60);
            return diffMinutes >= 30;
        } catch (error) {
            return false;
        }
    };

    const getTimeUntilAppointment = () => {
        try {
            const startTime = new Date(booking.booking_date);
            const now = new Date();
            const diffMs = startTime.getTime() - now.getTime();

            if (diffMs <= 0) return 'Starting soon';

            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(
                (diffMs % (1000 * 60 * 60)) / (1000 * 60),
            );

            if (diffHours > 24) {
                const days = Math.floor(diffHours / 24);
                return `${days} day${days > 1 ? 's' : ''} away`;
            } else if (diffHours > 0) {
                return `${diffHours}h ${diffMinutes}m away`;
            } else {
                return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} away`;
            }
        } catch {
            return null;
        }
    };

    const isStatusCancellable = ['pending', 'confirmed'].includes(
        booking.status,
    );
    const isTimeCancellable = canBeCancelledByTime();
    const canReview = booking.status === 'completed' && !booking.review;
    const timeUntil = getTimeUntilAppointment();

    const handleCancelClick = () => {
        if (!isTimeCancellable) {
            toast({
                title: 'Cannot Cancel',
                description:
                    'Bookings can only be cancelled at least 30 minutes before the appointment time.',
                variant: 'destructive',
            });
            return;
        }
        setShowCancelDialog(true);
    };

    const handleCancel = () => {
        router.post(route('customer.bookings.cancel', booking.id), {
            reason: cancellationReason,
        });
        setShowCancelDialog(false);
    };

    const handleReview = () => {
        router.post(route('customer.reviews.store', booking.id), {
            rating,
            comment,
        });
        setShowReviewDialog(false);
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            completed: {
                color: 'bg-black text-white',
                icon: CheckCircle2,
                message: 'Service completed successfully',
                bgGradient: 'from-gray-900 to-black',
            },
            confirmed: {
                color: 'bg-gray-800 text-white',
                icon: CheckCircle2,
                message: 'Your appointment is confirmed',
                bgGradient: 'from-gray-800 to-gray-700',
            },
            pending: {
                color: 'bg-gray-500 text-white',
                icon: Timer,
                message: 'Waiting for confirmation',
                bgGradient: 'from-gray-600 to-gray-500',
            },
            cancelled: {
                color: 'bg-gray-200 text-gray-700',
                icon: X,
                message: 'This booking has been cancelled',
                bgGradient: 'from-gray-200 to-gray-100',
            },
            in_progress: {
                color: 'bg-gray-700 text-white',
                icon: Timer,
                message: 'Service in progress',
                bgGradient: 'from-gray-700 to-gray-600',
            },
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const statusConfig = getStatusConfig(booking.status);
    const StatusIcon = statusConfig.icon;

    return (
        <AuthenticatedLayout>
            <Head title="Booking Details" />

            <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                // @ts-ignore
                transition={pageTransition}
                className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
            >
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <motion.div
                        // @ts-ignore
                        variants={slideUpVariants}
                        className="mb-8"
                    >
                        {/* Back Button */}
                        <Link href={route('customer.bookings.index')}>
                            <motion.div
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="mb-8"
                            >
                                <Button
                                    variant="ghost"
                                    className="group rounded-2xl border border-transparent px-4 py-2 backdrop-blur-sm hover:border-gray-200 hover:bg-white/50"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    <span className="font-medium">
                                    Back to Bookings
                                </span>
                                </Button>
                            </motion.div>
                        </Link>
                        <div className="flex flex-col gap-6">
                            {/* Back Button & Main Header */}
                            <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <motion.h1
                                            className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl"
                                            // @ts-ignore
                                            variants={slideUpVariants}
                                        >
                                            Booking Details
                                        </motion.h1>
                                        <motion.p
                                            className="font-mono text-sm text-gray-500"
                                            // @ts-ignore
                                            variants={slideUpVariants}
                                        >
                                            ID #{booking.id}
                                        </motion.p>
                                    </div>

                                {/* Status Badge */}
                                <motion.div
                                    // @ts-ignore
                                    variants={scaleInVariants}
                                    // @ts-ignore
                                    animate={
                                        booking.status === 'pending'
                                            ? pulseAnimation
                                            : {}
                                    }
                                >
                                    <Badge
                                        className={`${statusConfig.color} flex items-center gap-2 rounded-full border-0 px-4 py-2.5 text-xs font-semibold tracking-wide shadow-sm hover:bg-gray-200`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        <span className="capitalize">
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                    </Badge>
                                </motion.div>
                            </div>

                            {/* Status Message */}
                            <AnimatePresence>
                                {statusConfig.message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm"
                                    >
                                        <Info className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                            {statusConfig.message}
                                        </span>
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
                                // @ts-ignore
                                variants={cardVariants}
                                className="mb-8"
                            >
                                <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-xl">
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${statusConfig.bgGradient}`}
                                    />
                                    <CardContent className="relative p-6 text-white sm:p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <motion.div
                                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm sm:h-16 sm:w-16"
                                                >
                                                    <Timer className="h-6 w-6 sm:h-8 sm:w-8" />
                                                </motion.div>
                                                <div>
                                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/70">
                                                        Time Until Appointment
                                                    </p>
                                                    <p className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                                                        {timeUntil}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div
                                                transition={{
                                                    duration: 20,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                className="hidden lg:block"
                                            >
                                                <Scissors className="h-8 w-8 text-white" />
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    {/* Main Content Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6 lg:space-y-8"
                    >
                        {/* Top Row: Service & Barber Info */}
                        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-2">
                            {/* Service Card */}
                            <motion.div
                                // @ts-ignore
                                variants={cardVariants}
                            >
                                <Card className="overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl text-black">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                                <Scissors className="h-5 w-5" />
                                            </div>
                                            Service Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="mb-3 text-2xl font-bold text-black">
                                                {booking.service?.name}
                                            </h3>
                                            <p className="leading-relaxed text-gray-600">
                                                {booking.service?.description}
                                            </p>
                                        </div>
                                        <Separator className="bg-gray-200" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center"
                                            >
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Duration
                                                </p>
                                                <p className="text-lg font-bold text-black">
                                                    {booking.service?.duration}{' '}
                                                    min
                                                </p>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center"
                                            >
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Price
                                                </p>
                                                <p className="text-lg font-bold text-black">
                                                    Rp{' '}
                                                    {Number(
                                                        booking.total_price,
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Barber Card */}
                            <motion.div
                                // @ts-ignore
                                variants={cardVariants}
                            >
                                <Card className="overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl text-black">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                                <User className="h-5 w-5" />
                                            </div>
                                            Barber Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.05,
                                                    rotate: 2,
                                                }}
                                                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-black text-2xl font-bold text-white shadow-lg sm:h-20 sm:w-20"
                                            >
                                                {booking.barber?.name?.charAt(
                                                    0,
                                                ) || 'B'}
                                            </motion.div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="mb-1 text-xl font-bold text-black">
                                                    {booking.barber?.name}
                                                </h4>
                                                <p className="mb-3 text-gray-600">
                                                    {booking.barber
                                                        ?.barber_profile
                                                        ?.specialization ||
                                                        'Professional Barber'}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-semibold text-black">
                                                            {booking.barber
                                                                ?.barber_profile
                                                                ?.rating_average ||
                                                                '0.0'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        (
                                                        {booking.barber
                                                            ?.barber_profile
                                                            ?.total_reviews ||
                                                            0}{' '}
                                                        reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Discount Card */}
                        {hasDiscount && (
                            <motion.div
                                // @ts-ignore
                                variants={cardVariants}
                            >
                                <Card className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                                            <motion.div
                                                // @ts-ignore
                                                animate={glowAnimation}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white"
                                            >
                                                <Gift className="h-5 w-5" />
                                            </motion.div>
                                            Discount Applied
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-200 bg-green-100">
                                                        <Gift className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 text-lg font-bold text-green-800">
                                                            {
                                                                booking
                                                                    .discount!
                                                                    .name
                                                            }
                                                        </h4>
                                                        <p className="text-green-600">
                                                            Code:{' '}
                                                            {
                                                                booking
                                                                    .discount!
                                                                    .code
                                                            }{' '}
                                                            •{' '}
                                                            {getDiscountDisplay()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="rounded-full border-0 bg-green-500 px-3 py-1.5 text-sm text-white">
                                                    Applied
                                                </Badge>
                                            </div>

                                            <Separator className="bg-green-200" />

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                {[
                                                    {
                                                        label: 'Type',
                                                        value:
                                                            booking.discount!
                                                                .discount_type ===
                                                            'percentage'
                                                                ? 'Percentage'
                                                                : 'Fixed Amount',
                                                    },
                                                    {
                                                        label: 'Value',
                                                        value: getFormattedDiscountValue(),
                                                    },
                                                    {
                                                        label: 'You Saved',
                                                        value: `Rp ${discountSavings.toLocaleString('id-ID')}`,
                                                    },
                                                    {
                                                        label: 'Final Price',
                                                        value: `Rp ${booking.total_price.toLocaleString('id-ID')}`,
                                                    },
                                                ].map((item, index) => (
                                                    <motion.div
                                                        key={item.label}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.1,
                                                        }}
                                                        className="text-center"
                                                    >
                                                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-green-600">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-sm font-semibold text-green-800">
                                                            {item.value}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Bottom Row: Appointment & Payment */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                            {/* Appointment Details */}
                            <motion.div
                                // @ts-ignore
                                variants={cardVariants}
                            >
                                <Card className="h-full overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl text-black">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            Appointment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            {
                                                icon: Calendar,
                                                label: 'Date',
                                                value: format(
                                                    new Date(
                                                        booking.booking_date,
                                                    ),
                                                    'EEEE, MMMM d, yyyy',
                                                ),
                                            },
                                            {
                                                icon: Clock,
                                                label: 'Time',
                                                value: `${booking.start_time} - ${booking.end_time}`,
                                            },
                                            ...(booking.notes
                                                ? [
                                                      {
                                                          icon: FileText,
                                                          label: 'Notes',
                                                          value: booking.notes,
                                                          isNote: true,
                                                      },
                                                  ]
                                                : []),
                                        ].map((item, index) => (
                                            <motion.div
                                                key={item.label}
                                                // @ts-ignore
                                                variants={slideUpVariants}
                                                custom={index}
                                                className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 transition-all group-hover:bg-black">
                                                    <item.icon className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        {item.label}
                                                    </p>
                                                    {item.isNote ? (
                                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                            <p className="text-sm leading-relaxed text-gray-700">
                                                                {item.value}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.value}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Payment & Review Section */}
                            <div className="space-y-6 lg:space-y-8">
                                {/* Payment Summary */}
                                <motion.div
                                    // @ts-ignore
                                    variants={scaleInVariants}
                                >
                                    <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-gray-900 to-black text-white shadow-xl transition-all duration-300 hover:shadow-2xl">
                                        <CardHeader className="border-b border-white/10 pb-4">
                                            <CardTitle className="flex items-center gap-3 text-xl">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                Payment Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/80">
                                                        Original Price
                                                    </span>
                                                    <span className="font-semibold">
                                                        Rp{' '}
                                                        {Number(
                                                            booking.original_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>

                                                {hasDiscount && (
                                                    <>
                                                        <div className="flex items-center justify-between text-green-300">
                                                            <span className="text-sm">
                                                                Discount (
                                                                {getFormattedDiscountValue()}
                                                                )
                                                            </span>
                                                            <span className="font-semibold">
                                                                - Rp{' '}
                                                                {Number(
                                                                    booking.discount_amount,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                        </div>
                                                        <Separator className="bg-white/10" />
                                                    </>
                                                )}

                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-lg font-bold">
                                                        Total Amount
                                                    </span>
                                                    <span className="text-2xl font-bold">
                                                        Rp{' '}
                                                        {Number(
                                                            booking.total_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>

                                                {hasDiscount && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: 0.3,
                                                        }}
                                                        className="rounded-xl border border-green-500/30 bg-green-500/20 p-4"
                                                    >
                                                        <div className="flex items-center justify-between text-green-300">
                                                            <span className="text-sm font-medium">
                                                                You saved
                                                            </span>
                                                            <span className="text-lg font-bold">
                                                                Rp{' '}
                                                                {discountSavings.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-lg font-bold">
                                                        Payment Status
                                                    </span>
                                                    <span className="text-2xl font-bold">
                                                        {booking.payment_status}
                                                    </span>
                                                </div>

                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Review Section */}
                                <AnimatePresence>
                                    {booking.review ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            // @ts-ignore
                                            variants={cardVariants}
                                        >
                                            <Card className="overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="flex items-center gap-3 text-xl text-black">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                                            <Star className="h-5 w-5" />
                                                        </div>
                                                        Your Review
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-center gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
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
                                                                            0.1,
                                                                    }}
                                                                >
                                                                    <Star
                                                                        className={`h-7 w-7 ${
                                                                            star <=
                                                                            booking
                                                                                .review!
                                                                                .rating
                                                                                ? 'fill-black text-black'
                                                                                : 'text-gray-200'
                                                                        }`}
                                                                    />
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                        {booking.review
                                                            .comment && (
                                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                                <p className="text-sm italic leading-relaxed text-gray-700">
                                                                    "
                                                                    {
                                                                        booking
                                                                            .review
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
                                    ) : canReview ? (
                                        <motion.div
                                            // @ts-ignore
                                            variants={scaleInVariants}
                                        >
                                            <Card className="overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                                                <CardContent className="p-6 text-center">
                                                    <motion.div
                                                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100"
                                                    >
                                                        <Star className="h-8 w-8 text-gray-400" />
                                                    </motion.div>
                                                    <h4 className="mb-2 text-lg font-bold text-black">
                                                        Share Your Experience
                                                    </h4>
                                                    <p className="mb-4 text-sm text-gray-600">
                                                        Help others by reviewing
                                                        your service
                                                    </p>
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                setShowReviewDialog(
                                                                    true,
                                                                )
                                                            }
                                                            className="h-12 w-full rounded-xl bg-black text-base hover:bg-gray-800"
                                                        >
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Write Review
                                                        </Button>
                                                    </motion.div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {(canReview || isStatusCancellable) && (
                            <motion.div
                                // @ts-ignore
                                variants={slideUpVariants}
                                className="pt-4"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    {canReview && (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1"
                                        >
                                            <Button
                                                onClick={() =>
                                                    setShowReviewDialog(true)
                                                }
                                                className="h-12 w-full rounded-xl border-0 bg-black text-base hover:bg-gray-800"
                                            >
                                                <Star className="mr-2 h-4 w-4" />
                                                Write Review
                                            </Button>
                                        </motion.div>
                                    )}

                                    {isStatusCancellable && (
                                        <motion.div
                                            whileHover={
                                                isTimeCancellable
                                                    ? { scale: 1.02 }
                                                    : {}
                                            }
                                            whileTap={
                                                isTimeCancellable
                                                    ? { scale: 0.98 }
                                                    : {}
                                            }
                                            className="flex-1"
                                        >
                                            <Button
                                                onClick={handleCancelClick}
                                                variant="outline"
                                                disabled={!isTimeCancellable}
                                                className={`h-12 w-full rounded-xl border-2 text-base ${
                                                    !isTimeCancellable
                                                        ? 'cursor-not-allowed border-gray-300 text-gray-400 opacity-50'
                                                        : 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50 hover:text-black'
                                                }`}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel Booking
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Cancellation Info */}
                        {isStatusCancellable && !isTimeCancellable && (
                            <motion.div
                                // @ts-ignore
                                variants={slideUpVariants}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="rounded-2xl border border-gray-300 bg-gray-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                                            <div>
                                                <p className="mb-1 text-sm font-semibold text-gray-800">
                                                    Cancellation Not Available
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Bookings can only be
                                                    cancelled at least 30
                                                    minutes before the
                                                    appointment time.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Dialogs */}
                <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                >
                    <AlertDialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold text-black">
                                    Cancel Booking
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Are you sure you want to cancel this
                                    booking? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="mt-4">
                                <Textarea
                                    placeholder="Reason for cancellation (optional)"
                                    value={cancellationReason}
                                    onChange={(e) =>
                                        setCancellationReason(e.target.value)
                                    }
                                    className="min-h-[100px] resize-none rounded-xl border border-gray-300"
                                />
                            </div>
                            <AlertDialogFooter className="mt-6 gap-3">
                                <AlertDialogCancel className="flex-1 rounded-xl border border-gray-300 hover:bg-gray-50">
                                    Keep Booking
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCancel}
                                    className="flex-1 rounded-xl border-0 bg-black hover:bg-gray-800"
                                >
                                    Cancel Booking
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </motion.div>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    open={showReviewDialog}
                    onOpenChange={setShowReviewDialog}
                >
                    <AlertDialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold text-black">
                                    Write a Review
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Share your experience with{' '}
                                    {booking.barber?.name}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-6 py-4">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700">
                                        Rating
                                    </label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Star
                                                    className={`h-10 w-10 cursor-pointer transition-all ${
                                                        star <= rating
                                                            ? 'fill-black text-black'
                                                            : 'text-gray-200 hover:text-gray-400'
                                                    }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700">
                                        Comment (optional)
                                    </label>
                                    <Textarea
                                        placeholder="Tell us about your experience..."
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(e.target.value)
                                        }
                                        rows={4}
                                        className="resize-none rounded-xl border border-gray-300"
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter className="gap-3">
                                <AlertDialogCancel className="flex-1 rounded-xl border border-gray-300 hover:bg-gray-50">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleReview}
                                    className="flex-1 rounded-xl border-0 bg-black hover:bg-gray-800"
                                >
                                    Submit Review
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </motion.div>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        </AuthenticatedLayout>
    );
}
