import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Booking, DashboardStats, Review, WeeklyActivity } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Award,
    Calendar,
    ChevronRight,
    DollarSign,
    Star,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';

interface DashboardProps {
    stats: DashboardStats;
    upcomingBookings: Booking[];
    recentReviews: Review[];
    weeklyActivity: WeeklyActivity[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            duration: 0.6,
        },
    },
    hover: {
        scale: 1.02,
        y: -4,
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
        y: -4,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    tap: { scale: 0.98 },
};

const glowAnimation = {
    glow: {
        boxShadow: [
            '0 0 0px rgba(0,0,0,0.1)',
            '0 0 20px rgba(0,0,0,0.15)',
            '0 0 0px rgba(0,0,0,0.1)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export default function Dashboard({
    stats,
    upcomingBookings,
    recentReviews = [],
}: DashboardProps) {
    const targetProgress =
        stats.monthly_target > 0
            ? (stats.earnings_month / stats.monthly_target) * 100
            : 0;

    const completionRate = stats.completion_rate || 0;

    const formatRating = (rating: number | null | undefined): string => {
        if (rating === null || rating === undefined) return '0.0';
        return Number(rating).toFixed(1);
    };

    const todayDate = () => format(new Date(), 'yyyy-MM-dd');

    const statsCards = [
        {
            label: 'Today',
            value: stats.today_bookings,
            icon: Calendar,
            desc: 'appointments',
            route: 'barber.bookings.calendar',
            routeText: 'View Calendar',
            gradient: 'from-black to-zinc-800',
        },
        {
            label: 'Pending',
            value: stats.pending_bookings,
            icon: AlertCircle,
            desc: 'to confirm',
            route: 'barber.bookings.index',
            routeParams: { status: 'pending' },
            routeText: 'View Pending',
            gradient: 'from-zinc-800 to-zinc-600',
        },
        {
            label: 'Completed',
            value: stats.completed_today,
            icon: Users,
            desc: 'served today',
            route: 'barber.bookings.index',
            routeParams: {
                status: 'completed',
                date_from: todayDate(),
                date_to: todayDate(),
            },
            routeText: 'View Completed',
            gradient: 'from-zinc-700 to-zinc-500',
        },
        {
            label: 'Today Earned',
            value: `Rp ${(stats.earnings_today ?? 0).toLocaleString('id-ID')}`,
            icon: DollarSign,
            desc: 'gross income',
            route: 'barber.earnings.index',
            routeText: 'View Earnings',
            gradient: 'from-zinc-600 to-zinc-400',
        },
        {
            label: 'This Month',
            value: `Rp ${(stats.earnings_month ?? 0).toLocaleString('id-ID')}`,
            icon: TrendingUp,
            desc: 'total earnings',
            route: 'barber.earnings.index',
            routeText: 'View Monthly',
            gradient: 'from-zinc-500 to-zinc-300',
        },
    ];

    const performanceMetrics = [
        {
            label: 'Total Customers',
            value: stats.total_customers,
            icon: Users,
            color: 'bg-zinc-100 text-zinc-700',
            desc: 'Lifetime clients',
        },
        {
            label: 'Completion Rate',
            value: `${completionRate.toFixed(1)}%`,
            icon: Target,
            color: 'bg-zinc-100 text-zinc-700',
            desc: 'This month',
        },
        {
            label: 'Average Rating',
            value: `${formatRating(stats.average_rating)}`,
            icon: Star,
            color: 'bg-zinc-100 text-zinc-700',
            desc: 'All time',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Barber Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-6 lg:py-8">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <motion.h1
                                    className="mb-2 text-2xl font-black tracking-tight text-black sm:text-3xl lg:text-4xl"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Dashboard
                                </motion.h1>
                                <motion.p
                                    className="text-sm font-medium text-zinc-600 sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {format(new Date(), 'EEEE, d MMMM yyyy')}
                                </motion.p>
                            </div>
                            <motion.div
                                className="flex flex-wrap gap-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link href={route('barber.bookings.index')}>
                                    <Button
                                        variant="outline"
                                        className="h-9 border-zinc-300 text-xs hover:border-black sm:h-10 sm:text-sm"
                                    >
                                        <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            All Bookings
                                        </span>
                                        <span className="sm:hidden">
                                            Bookings
                                        </span>
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mb-8 lg:grid-cols-3 xl:grid-cols-5"
                    >
                        {statsCards.map((stat, index) => (
                            <motion.div
                                key={index}
                                // @ts-ignore
                                variants={itemVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Link
                                    href={route(
                                        stat.route,
                                        stat.routeParams || {},
                                    )}
                                    className="block h-full"
                                >
                                    <Card className="group h-full overflow-hidden border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                                        />
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-5">
                                            <CardTitle className="text-xs font-semibold text-zinc-600 sm:text-sm">
                                                {stat.label}
                                            </CardTitle>
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <stat.icon className="h-3 w-3 text-zinc-600 sm:h-4 sm:w-4" />
                                            </motion.div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 sm:p-5">
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: index * 0.1 + 0.3,
                                                }}
                                            >
                                                <div className="text-xl font-black text-black sm:text-2xl">
                                                    {stat.value}
                                                </div>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {stat.desc}
                                                </p>
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Performance Section */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                        {/* Monthly Target - Desktop */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            // @ts-ignore
                            variants={itemVariants}
                            className="lg:col-span-2"
                        >
                            <motion.div
                                whileHover="hover"
                                // @ts-ignore
                                variants={cardHover}
                            >
                                <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base font-bold text-black sm:text-lg">
                                            <motion.div animate="float">
                                                <Target className="mt-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            </motion.div>
                                            Monthly Target
                                        </CardTitle>
                                        <CardDescription className="text-xs text-zinc-600 sm:text-sm">
                                            Track your progress towards monthly
                                            goal
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 pt-0 sm:p-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-600">
                                                    Current
                                                </span>
                                                <span className="font-semibold text-black">
                                                    Rp{' '}
                                                    {stats.earnings_month.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                            <Progress
                                                value={targetProgress}
                                                className="h-2 bg-zinc-200"
                                            />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-600">
                                                    Target
                                                </span>
                                                <span className="font-semibold text-black">
                                                    Rp{' '}
                                                    {stats.monthly_target.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-zinc-600">
                                                        Progress
                                                    </p>
                                                    <p className="text-2xl font-black text-black">
                                                        {targetProgress.toFixed(
                                                            1,
                                                        )}
                                                        %
                                                    </p>
                                                </div>
                                                <motion.div
                                                    transition={{
                                                        duration: 0.5,
                                                    }}
                                                >
                                                    <Award
                                                        className={`h-8 w-8 sm:h-10 sm:w-10 ${targetProgress >= 100 ? 'text-black' : 'text-zinc-400'}`}
                                                    />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Performance Metrics - Full width on mobile, 1/3 on desktop */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            // @ts-ignore
                            variants={itemVariants}
                        >
                            <motion.div
                                whileHover="hover"
                                // @ts-ignore
                                variants={cardHover}
                            >
                                <Card className="h-full border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base font-bold text-black sm:text-lg">
                                            <motion.div
                                                // @ts-ignore
                                                variants={glowAnimation}
                                                animate="glow"
                                            >
                                                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </motion.div>
                                            Performance
                                        </CardTitle>
                                        <CardDescription className="text-xs text-zinc-600 sm:text-sm">
                                            Your key performance indicators
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-4 pt-0 sm:p-6">
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-3"
                                        >
                                            {performanceMetrics.map(
                                                (metric, i) => (
                                                    <motion.div
                                                        key={i}
                                                        // @ts-ignore
                                                        variants={itemVariants}
                                                        whileHover={{
                                                            x: 4,
                                                            scale: 1.02,
                                                        }}
                                                        className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 transition-all hover:bg-white/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                }}
                                                                className={`rounded-full p-2 ${metric.color}`}
                                                            >
                                                                <metric.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </motion.div>
                                                            <div>
                                                                <p className="text-sm font-medium text-black">
                                                                    {
                                                                        metric.label
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    {
                                                                        metric.desc
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <motion.span
                                                            className="text-lg font-black text-black sm:text-xl"
                                                            initial={{
                                                                scale: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    i * 0.1 +
                                                                    0.5,
                                                            }}
                                                        >
                                                            {metric.value}
                                                        </motion.span>
                                                    </motion.div>
                                                ),
                                            )}
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Bottom Section - Appointments & Reviews */}
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
                        {/* Upcoming Appointments - Desktop */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            // @ts-ignore
                            variants={itemVariants}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <motion.div
                                whileHover="hover"
                                // @ts-ignore
                                variants={cardHover}
                            >
                                <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                                        <div>
                                            <CardTitle className="text-base font-bold text-black sm:text-lg">
                                                Upcoming Appointments
                                            </CardTitle>
                                            <CardDescription className="text-xs text-zinc-600 sm:text-sm">
                                                Your schedule for today and
                                                tomorrow
                                            </CardDescription>
                                        </div>
                                        <Link
                                            href={route(
                                                'barber.bookings.calendar',
                                            )}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs sm:h-9 sm:text-sm"
                                            >
                                                <span className="hidden sm:inline">
                                                    View Calendar
                                                </span>
                                                <span className="sm:hidden">
                                                    Calendar
                                                </span>
                                                <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 sm:p-6">
                                        <AnimatePresence>
                                            {upcomingBookings.length === 0 ? (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    className="py-8 text-center"
                                                >
                                                    <Calendar className="mx-auto h-8 w-8 text-zinc-300 sm:h-12 sm:w-12" />
                                                    <p className="mt-3 text-sm text-zinc-500">
                                                        No upcoming appointments
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="space-y-3"
                                                >
                                                    {upcomingBookings
                                                        .slice(0, 5)
                                                        .map((booking) => (
                                                            <motion.div
                                                                key={booking.id}
                                                                // @ts-ignore
                                                                variants={
                                                                    itemVariants
                                                                }
                                                                whileHover={{
                                                                    scale: 1.01,
                                                                    x: 4,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 300,
                                                                }}
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'barber.bookings.show',
                                                                        booking.id,
                                                                    )}
                                                                    className="block"
                                                                >
                                                                    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 transition-all hover:border-zinc-400 hover:bg-white/50 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <motion.div
                                                                                transition={{
                                                                                    duration: 0.5,
                                                                                }}
                                                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-black to-zinc-700 text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm"
                                                                            >
                                                                                {booking.start_time.slice(
                                                                                    0,
                                                                                    5,
                                                                                )}
                                                                            </motion.div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate font-medium text-black">
                                                                                    {booking
                                                                                        .customer
                                                                                        ?.name ??
                                                                                        'Unknown Customer'}
                                                                                </p>
                                                                                <p className="truncate text-sm text-zinc-600">
                                                                                    {booking
                                                                                        .service
                                                                                        ?.name ??
                                                                                        'Unknown Service'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                                                                            <p className="text-sm text-zinc-500">
                                                                                {format(
                                                                                    new Date(
                                                                                        booking.booking_date,
                                                                                    ),
                                                                                    'dd MMM yyyy',
                                                                                )}
                                                                            </p>
                                                                            <motion.div
                                                                                transition={{
                                                                                    type: 'spring',
                                                                                    stiffness: 400,
                                                                                }}
                                                                            >
                                                                                <Badge
                                                                                    className={
                                                                                        booking.status ===
                                                                                        'confirmed'
                                                                                            ? 'bg-black text-white hover:bg-black'
                                                                                            : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-200'
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        booking.status
                                                                                    }
                                                                                </Badge>
                                                                            </motion.div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Recent Reviews - 1/3 width on desktop */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            // @ts-ignore
                            variants={itemVariants}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.div
                                whileHover="hover"
                                // @ts-ignore
                                variants={cardHover}
                            >
                                <Card className="h-full border-zinc-200 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base font-bold text-black sm:text-lg">
                                            <motion.div
                                                transition={{ duration: 0.5 }}
                                            >
                                                <Star className="h-4 w-4 fill-zinc-900 text-zinc-900 sm:h-5 sm:w-5" />
                                            </motion.div>
                                            Recent Reviews
                                        </CardTitle>
                                        <CardDescription className="text-xs text-zinc-600 sm:text-sm">
                                            What customers say about you
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 sm:p-6">
                                        <AnimatePresence>
                                            {recentReviews.length === 0 ? (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    className="py-8 text-center"
                                                >
                                                    <Star className="mx-auto h-8 w-8 text-zinc-300 sm:h-12 sm:w-12" />
                                                    <p className="mt-3 text-sm text-zinc-500">
                                                        No reviews yet
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="space-y-3"
                                                >
                                                    {recentReviews
                                                        .slice(0, 3)
                                                        .map((review, i) => (
                                                            <motion.div
                                                                key={review.id}
                                                                // @ts-ignore
                                                                variants={
                                                                    itemVariants
                                                                }
                                                                whileHover={{
                                                                    y: -2,
                                                                }}
                                                                className="space-y-2 rounded-lg border border-zinc-200 p-3 transition-all hover:bg-white/50"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <p className="truncate font-medium text-black">
                                                                        {review
                                                                            .customer
                                                                            ?.name ??
                                                                            'Unknown Customer'}
                                                                    </p>
                                                                    <div className="flex gap-0.5">
                                                                        {Array.from(
                                                                            {
                                                                                length: 5,
                                                                            },
                                                                        ).map(
                                                                            (
                                                                                _,
                                                                                starIndex,
                                                                            ) => (
                                                                                <motion.div
                                                                                    key={
                                                                                        starIndex
                                                                                    }
                                                                                    initial={{
                                                                                        scale: 0,
                                                                                    }}
                                                                                    animate={{
                                                                                        scale: 1,
                                                                                    }}
                                                                                    transition={{
                                                                                        delay:
                                                                                            i *
                                                                                                0.1 +
                                                                                            starIndex *
                                                                                                0.05,
                                                                                    }}
                                                                                >
                                                                                    <Star
                                                                                        className={`h-3 w-3 ${
                                                                                            starIndex <
                                                                                            review.rating
                                                                                                ? 'fill-black text-black'
                                                                                                : 'text-zinc-300'
                                                                                        }`}
                                                                                    />
                                                                                </motion.div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {review.comment && (
                                                                    <p className="line-clamp-2 text-xs text-zinc-600">
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-zinc-500">
                                                                    {format(
                                                                        new Date(
                                                                            review.created_at,
                                                                        ),
                                                                        'dd MMM yyyy',
                                                                    )}
                                                                </p>
                                                            </motion.div>
                                                        ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
