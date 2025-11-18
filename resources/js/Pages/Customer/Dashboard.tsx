import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Booking, DashboardStats, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    Award,
    BadgeQuestionMark,
    Calendar,
    Check,
    Clock,
    Crown,
    Fingerprint,
    MessageCircle,
    Percent,
    Scissors,
    Shield,
    Sparkles,
    Star,
    User,
    Zap,
} from 'lucide-react';

interface DashboardProps extends PageProps {
    upcomingBookings: Booking[];
    stats: DashboardStats;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
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
            stiffness: 200,
            damping: 20,
        },
    },
};

const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
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

const pulseAnimation = {
    scale: [1, 1.03, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

export default function Dashboard({
    auth,
    upcomingBookings,
    stats,
}: DashboardProps) {
    const completionRate =
        stats.total_bookings > 0
            ? Math.round(
                  (stats.completed_bookings / stats.total_bookings) * 100,
              )
            : 0;

    const statsData = [
        {
            title: 'Total Bookings',
            value: stats.total_bookings,
            icon: Calendar,
            gradient: 'from-zinc-900 to-zinc-700',
            color: 'text-black',
        },
        {
            title: 'Completed',
            value: stats.completed_bookings,
            icon: Check,
            gradient: 'from-zinc-800 to-zinc-600',
            color: 'text-green-600',
        },
        {
            title: 'Upcoming',
            value: stats.upcoming_bookings,
            icon: Clock,
            gradient: 'from-zinc-700 to-zinc-500',
            color: 'text-blue-600',
        },
        {
            title: 'Pending Reviews',
            value: stats.pending_reviews,
            icon: Star,
            gradient: 'from-zinc-600 to-zinc-400',
            color: 'text-amber-600',
        },
    ];

    const achievements = [
        {
            label: 'First Booking',
            unlocked: stats.total_bookings > 0,
            icon: Award,
            description: 'Completed your first appointment',
        },
        {
            label: '5+ Bookings',
            unlocked: stats.total_bookings >= 5,
            icon: Zap,
            description: 'Reached 5 total bookings',
        },
        {
            label: 'Loyal Customer',
            unlocked: stats.completed_bookings >= 10,
            icon: Crown,
            description: '10+ completed services',
        },
        {
            label: 'Review Master',
            unlocked: stats.completed_bookings - stats.pending_reviews >= 5,
            icon: Star,
            description: 'Left 5+ reviews',
        },
    ];

    const quickActions = [
        {
            title: 'Book Appointment',
            description: 'Schedule your next haircut',
            icon: Scissors,
            href: route('customer.bookings.create'),
            color: 'bg-black text-white hover:bg-zinc-800',
            variant: 'default' as const,
        },
        {
            title: 'Browse Barbers',
            description: 'Discover top barbers',
            icon: User,
            href: route('customer.barbers.index'),
            color: 'border-zinc-300 hover:border-black hover:bg-zinc-50',
            variant: 'outline' as const,
        },
        {
            title: 'My Bookings',
            description: 'View all appointments',
            icon: Calendar,
            href: route('customer.bookings.index'),
            color: 'border-zinc-300 hover:border-black hover:bg-zinc-50',
            variant: 'outline' as const,
        },
        {
            title: 'Discounts',
            description: 'View all discounts',
            icon: Percent,
            href: route('customer.discounts.index'),
            color: 'border-zinc-300 hover:border-black hover:bg-zinc-50',
            variant: 'outline' as const,
        },
    ];

    const tips = [
        {
            title: 'Book in Advance',
            description:
                'Reserve your slot 2-3 days early for best availability',
            icon: Calendar,
        },
        {
            title: 'Leave Reviews',
            description: 'Help barbers improve by sharing your experience',
            icon: MessageCircle,
        },
        {
            title: 'Try New Styles',
            description: 'Explore different barbers and techniques',
            icon: Sparkles,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3"
                                >
                                    <motion.div
                                        // @ts-ignore
                                        animate={pulseAnimation}
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black"
                                    >
                                        <Fingerprint className="h-6 w-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">
                                            Welcome back,{' '}
                                            {auth.user.name.split(' ')[0]}!
                                        </h1>
                                        <motion.p
                                            className="text-zinc-600 sm:text-lg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Ready for your next transformation?
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Mobile Stats Summary */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex gap-2 sm:hidden"
                            >
                                <Badge
                                    variant="secondary"
                                    className="bg-zinc-100 text-zinc-700"
                                >
                                    {stats.upcoming_bookings} Upcoming
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-zinc-100 text-zinc-700"
                                >
                                    {stats.pending_reviews} Reviews
                                </Badge>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                    >
                        {statsData.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    // @ts-ignore
                                    variants={fadeInUp}
                                >
                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 400,
                                            },
                                        }}
                                        className="h-full"
                                    >
                                        <Card className="group relative h-full overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                                            />
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                        {stat.title}
                                                    </CardTitle>
                                                    <motion.div
                                                        whileHover={{
                                                            rotate: 15,
                                                            scale: 1.1,
                                                        }}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-black sm:h-10 sm:w-10"
                                                    >
                                                        <Icon className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white sm:h-5 sm:w-5" />
                                                    </motion.div>
                                                </div>
                                                <motion.div
                                                    className={`text-2xl font-bold sm:text-3xl ${stat.color}`}
                                                    initial={{ scale: 0.5 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay:
                                                            0.2 + index * 0.1,
                                                        type: 'spring',
                                                    }}
                                                >
                                                    {stat.value}
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Quick Actions & Tips */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Quick Actions */}
                            <motion.div
                                // @ts-ignore
                                variants={slideInLeft}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-black">
                                            <Zap className="h-5 w-5" />
                                            Quick Actions
                                        </CardTitle>
                                        <CardDescription className="text-zinc-600">
                                            Everything you need in one place
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {quickActions.map(
                                                (action, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: 0.1 * index,
                                                        }}
                                                    >
                                                        <Link
                                                            href={action.href}
                                                        >
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.02,
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.98,
                                                                }}
                                                            >
                                                                <Button
                                                                    variant={
                                                                        action.variant
                                                                    }
                                                                    className={`group h-16 w-full justify-start text-left ${action.color} transition-all duration-300`}
                                                                >
                                                                    <div className="flex w-full items-center gap-3">
                                                                        <motion.div
                                                                            whileHover={{
                                                                                rotate: 15,
                                                                            }}
                                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"
                                                                        >
                                                                            <action.icon className="h-5 w-5" />
                                                                        </motion.div>
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-semibold sm:text-base">
                                                                                {
                                                                                    action.title
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs opacity-80">
                                                                                {
                                                                                    action.description
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                                    </div>
                                                                </Button>
                                                            </motion.div>
                                                        </Link>
                                                    </motion.div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Tips & Recommendations */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-black">
                                            <BadgeQuestionMark className="h-5 w-5" />
                                            Pro Tips
                                        </CardTitle>
                                        <CardDescription className="text-zinc-600">
                                            Get the most out of your experience
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-4">
                                            {tips.map((tip, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            0.1 + index * 0.1,
                                                    }}
                                                    whileHover={{ x: 4 }}
                                                    className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-zinc-50"
                                                >
                                                    <motion.div className="mt-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                                                        <tip.icon className="h-5 w-5 text-zinc-600" />
                                                    </motion.div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-black sm:text-base">
                                                            {tip.title}
                                                        </h4>
                                                        <p className="mt-1 text-sm text-zinc-600">
                                                            {tip.description}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Right Column - Performance & Achievements */}
                        <div className="space-y-6">
                            {/* Performance Card */}
                            <motion.div
                                // @ts-ignore
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="h-full border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-black">
                                            <Activity className="h-5 w-5" />
                                            Your Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-medium text-zinc-600">
                                                    Completion Rate
                                                </span>
                                                <span className="text-2xl font-bold text-black">
                                                    {completionRate}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-black to-zinc-700"
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${completionRate}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 0.5,
                                                        ease: 'easeOut',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-200" />

                                        <div>
                                            <div className="mb-4 flex items-center gap-2">
                                                <Crown className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-600">
                                                    Achievements
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {achievements.map(
                                                    (achievement, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    0.6 +
                                                                    idx * 0.1,
                                                            }}
                                                            className="group flex items-center gap-3"
                                                        >
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                                    achievement.unlocked
                                                                        ? 'bg-black text-white'
                                                                        : 'bg-zinc-100 text-zinc-400'
                                                                } transition-all duration-300`}
                                                            >
                                                                <achievement.icon className="h-5 w-5" />
                                                            </motion.div>
                                                            <div className="min-w-0 flex-1">
                                                                <p
                                                                    className={`text-sm font-medium ${
                                                                        achievement.unlocked
                                                                            ? 'text-black'
                                                                            : 'text-zinc-400'
                                                                    }`}
                                                                >
                                                                    {
                                                                        achievement.label
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    {
                                                                        achievement.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            {achievement.unlocked && (
                                                                <motion.div
                                                                    initial={{
                                                                        scale: 0,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                    }}
                                                                    className="h-2 w-2 rounded-full bg-green-500"
                                                                />
                                                            )}
                                                        </motion.div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Security Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card className="overflow-hidden border-zinc-200 bg-gradient-to-br from-zinc-900 to-black text-white">
                                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full bg-white/5" />
                                    <CardContent className="relative p-4 sm:p-6">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                // @ts-ignore
                                                animate={pulseAnimation}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm"
                                            >
                                                <Shield className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    Secure Account
                                                </h3>
                                                <p className="text-sm text-white/70">
                                                    Your data is protected
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-6"
                    >
                        <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                            <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <Calendar className="h-5 w-5" />
                                        Upcoming Appointments
                                    </CardTitle>
                                    <CardDescription className="text-zinc-600">
                                        Your scheduled grooming sessions
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-zinc-300 font-medium text-zinc-700"
                                >
                                    {upcomingBookings.length} Active
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence>
                                    {upcomingBookings.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: 0.5,
                                            }}
                                            className="py-12 text-center"
                                        >
                                            <motion.div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                                                <Calendar className="h-8 w-8 text-zinc-400" />
                                            </motion.div>
                                            <h3 className="mb-2 text-lg font-bold text-black">
                                                No upcoming bookings
                                            </h3>
                                            <p className="mx-auto mb-6 max-w-sm text-sm text-zinc-600">
                                                Ready for your next fresh look?
                                                Book an appointment with your
                                                favorite barber.
                                            </p>
                                            <Link
                                                href={route(
                                                    'customer.bookings.create',
                                                )}
                                            >
                                                <Button className="bg-black px-6 hover:bg-zinc-800">
                                                    <Scissors className="mr-2 h-4 w-4" />
                                                    Book Appointment
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-3"
                                        >
                                            {upcomingBookings.map((booking) => (
                                                <motion.div
                                                    key={booking.id}
                                                    // @ts-ignore
                                                    variants={fadeInUp}
                                                    whileHover={{
                                                        y: -2,
                                                        transition: {
                                                            type: 'spring',
                                                            stiffness: 400,
                                                        },
                                                    }}
                                                    className="group"
                                                >
                                                    <Link
                                                        href={route(
                                                            'customer.bookings.show',
                                                            booking.id,
                                                        )}
                                                    >
                                                        <div className="group flex flex-col justify-between gap-4 rounded-xl border-2 border-zinc-200 p-4 transition-all hover:border-black hover:bg-white/50 sm:flex-row sm:items-center">
                                                            <div className="flex min-w-0 items-start gap-4">
                                                                <motion.div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-600 text-white">
                                                                    <Scissors className="h-6 w-6" />
                                                                </motion.div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="mb-1 truncate text-sm font-bold text-black group-hover:underline sm:text-base">
                                                                        {
                                                                            booking
                                                                                .service
                                                                                ?.name
                                                                        }
                                                                    </h4>
                                                                    <p className="mb-2 text-sm text-zinc-600">
                                                                        with{' '}
                                                                        <span className="font-semibold text-black">
                                                                            {
                                                                                booking
                                                                                    .barber
                                                                                    ?.name
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {format(
                                                                                new Date(
                                                                                    booking.booking_date,
                                                                                ),
                                                                                'EEE, MMM d',
                                                                            )}
                                                                        </span>
                                                                        <span className="flex items-center gap-1 font-mono">
                                                                            <Clock className="h-3 w-3" />
                                                                            {
                                                                                booking.start_time
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                                                                <div className="text-lg font-bold text-black sm:text-xl">
                                                                    Rp{' '}
                                                                    {booking.total_price.toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </div>
                                                                <Badge
                                                                    className={`${
                                                                        booking.status ===
                                                                        'confirmed'
                                                                            ? 'border-black bg-black text-white'
                                                                            : 'border-zinc-400 bg-zinc-400 text-white'
                                                                    } border text-xs font-semibold`}
                                                                >
                                                                    {booking.status.toUpperCase()}
                                                                </Badge>
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

                    {/* Support Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6"
                    >
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bS00IDB2Mmgtdi0yaDJ6bS00IDBoMnYyaC0ydi0yem0tNCAwaDJ2MmgtMnYtMnptLTQgMGgydjJoLTJ2LTJ6bS00IDBoMnYyaC0ydi0yem0tNCAwaDJ2MmgtMnYtMnptLTQgMGgydjJoLTJ2LTJ6bS00IDBoMnYyaC0ydi0yem0wIDR2Mmgtdi0yaDJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                            <CardContent className="relative z-10 py-6 sm:py-8">
                                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                                    <div className="text-center sm:text-left">
                                        <motion.h3
                                            className="mb-2 text-xl font-bold sm:text-2xl"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            Need Help?
                                        </motion.h3>
                                        <motion.p
                                            className="text-sm text-zinc-300 sm:text-base"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            Our support team is here to help you
                                            24/7
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="h-12 border-0 bg-white px-6 font-semibold text-black hover:bg-zinc-100"
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Contact Support
                                        </Button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
