import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BookingStatusCount,
    DailyEarning,
    DashboardStats,
    PageProps,
    RecentBooking,
    TopBarber,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Package,
    PieChart,
    Scissors,
    Star,
    Tags,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface AdminDashboardProps extends PageProps {
    stats: DashboardStats & {
        total_customers: number;
        total_barbers: number;
        total_revenue: number;
    };
    periodStats?: {
        bookings: number;
        revenue: number;
        completed: number;
        cancelled: number;
    };
    recentBookings: RecentBooking[];
    topBarbers: TopBarber[];
    bookingsByStatus?: BookingStatusCount[];
    revenueTrend?: DailyEarning[];
    period?: string;
}

const fadeInUp: Variants = {
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

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.1,
        },
    },
};

const slideIn: Variants = {
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

const scaleIn: Variants = {
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

const progressVariants = {
    hidden: { width: 0 },
    visible: (percentage: number) => ({
        width: `${percentage}%`,
        transition: {
            duration: 1.5,
            ease: 'easeOut',
            delay: 0.5,
        },
    }),
};

export default function Dashboard({
    auth,
    stats,
    periodStats,
    recentBookings,
    topBarbers,
    bookingsByStatus = [],
    period = 'month',
}: AdminDashboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    console.log(recentBookings);
    const formatBookingDateTime = (dateString: string, timeString: string) => {
        try {
            const date = new Date(dateString);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });

            const time = new Date(`1970-01-01T${timeString}`);
            const formattedTime = time.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            return `${formattedDate} • ${formattedTime}`;
        } catch (error) {
            return `${dateString} • ${timeString}`;
        }
    };

    const formatStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusMap[status] || status;
    };

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get(
            route('admin.dashboard'),
            { period: newPeriod },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Calculate total bookings for percentage
    const totalBookings = bookingsByStatus.reduce(
        (total, item) => total + item.count,
        0,
    );

    // Status configuration with colors and icons
    const statusConfig = {
        pending: {
            label: 'Pending',
            color: 'bg-amber-500',
            textColor: 'text-amber-700',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            icon: Clock,
        },
        confirmed: {
            label: 'Confirmed',
            color: 'bg-blue-500',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: UserCheck,
        },
        in_progress: {
            label: 'In Progress',
            color: 'bg-purple-500',
            textColor: 'text-purple-700',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            icon: Activity,
        },
        completed: {
            label: 'Completed',
            color: 'bg-green-500',
            textColor: 'text-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            icon: CheckCircle2,
        },
        cancelled: {
            label: 'Cancelled',
            color: 'bg-red-500',
            textColor: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: XCircle,
        },
    };

    const mainStats = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            subtitle: `${stats.total_customers} customers, ${stats.total_barbers} barbers`,
            gradient: 'from-zinc-900 to-zinc-700',
            link: route('admin.users.index'),
        },
        {
            title: 'Total Bookings',
            value: stats.total_bookings,
            icon: Calendar,
            subtitle: `${stats.pending_bookings} pending`,
            gradient: 'from-zinc-800 to-zinc-600',
            growth: stats.booking_growth,
            link: route('admin.bookings.index'),
        },
        {
            title: 'Total Revenue',
            value: `Rp ${Number(stats.total_revenue ?? 0).toLocaleString('id-ID')}`,
            icon: DollarSign,
            subtitle: periodStats
                ? `This ${selectedPeriod}: Rp ${Number(periodStats.revenue ?? 0).toLocaleString('id-ID')}`
                : 'All time revenue',
            gradient: 'from-zinc-700 to-zinc-500',
            growth: stats.revenue_growth ?? 0,
            link: route('admin.reports.index'),
        },
        {
            title: 'Average Rating',
            value: stats.average_rating
                ? Number(stats.average_rating).toFixed(1)
                : '0.0',
            icon: Star,
            subtitle: `${stats.total_reviews} total reviews`,
            gradient: 'from-zinc-600 to-zinc-400',
            link: route('admin.bookings.index'),
        },
    ];

    const quickStats = [
        {
            label: 'Active Services',
            value: stats.active_services,
            total: stats.total_services,
            icon: Package,
        },
        {
            label: 'Confirmed',
            value: stats.confirmed_bookings,
            icon: UserCheck,
        },
        {
            label: 'Completed',
            value: stats.completed_bookings,
            icon: CheckCircle2,
        },
        {
            label: 'Cancelled',
            value: stats.cancelled_bookings,
            icon: XCircle,
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-black text-white border-black';
            case 'confirmed':
                return 'bg-zinc-800 text-white border-zinc-800';
            case 'in_progress':
                return 'bg-zinc-600 text-white border-zinc-600';
            case 'pending':
                return 'bg-zinc-400 text-white border-zinc-400';
            case 'cancelled':
                return 'bg-zinc-100 text-zinc-600 border-zinc-300';
            default:
                return 'bg-zinc-500 text-white border-zinc-500';
        }
    };

    const periods = [
        { value: 'day', label: 'Today', shortLabel: 'Today' },
        { value: 'week', label: 'This Week', shortLabel: 'Week' },
        { value: 'month', label: 'This Month', shortLabel: 'Month' },
        { value: 'year', label: 'This Year', shortLabel: 'Year' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-10"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-4xl font-bold tracking-tight text-black sm:text-5xl">
                                    Admin Dashboard
                                </h1>
                                <p className="text-lg text-zinc-600">
                                    Welcome back, {auth.user.name.split(' ')[0]}
                                </p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                <Badge className="border-black bg-black px-4 py-2 text-sm font-semibold text-white">
                                    ADMINISTRATOR
                                </Badge>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Period Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                                    {/* Label */}
                                    <div className="flex flex-shrink-0 items-center gap-2 text-sm">
                                        <Filter className="h-4 w-4 text-zinc-500" />
                                        <span className="whitespace-nowrap font-medium text-zinc-700">
                                            <span className="hidden sm:inline">
                                                Filter by
                                            </span>{' '}
                                            Period:
                                        </span>
                                    </div>

                                    {/* Filter Buttons */}
                                    <div className="w-full sm:w-auto">
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 xl:flex xl:flex-wrap">
                                            {periods.map((p) => (
                                                <motion.div
                                                    key={p.value}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full xl:w-auto"
                                                >
                                                    <Button
                                                        onClick={() =>
                                                            handlePeriodChange(
                                                                p.value,
                                                            )
                                                        }
                                                        variant={
                                                            selectedPeriod ===
                                                            p.value
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        className={`h-9 w-full text-xs font-medium sm:h-8 sm:text-xs ${
                                                            selectedPeriod ===
                                                            p.value
                                                                ? 'bg-black text-white shadow-sm hover:bg-zinc-800'
                                                                : 'border-zinc-300 text-zinc-700 hover:border-black hover:bg-white'
                                                        } `}
                                                    >
                                                        <span className="sm:hidden">
                                                            {p.shortLabel ||
                                                                p.label}
                                                        </span>
                                                        <span className="hidden sm:inline">
                                                            {p.label}
                                                        </span>
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Stats Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {mainStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Link href={stat.link}>
                                        <motion.div
                                            whileHover={{
                                                y: -6,
                                                transition: { duration: 0.2 },
                                            }}
                                            className="h-full cursor-pointer"
                                        >
                                            <Card
                                                className={`group relative h-full overflow-hidden border-zinc-200 bg-gradient-to-br shadow-sm transition-all hover:shadow-lg ${stat.gradient}`}
                                            >
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                                                <CardContent className="relative z-10 pb-6 pt-6">
                                                    <div className="mb-4 flex items-start justify-between">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                                                            <Icon className="h-6 w-6 text-white" />
                                                        </div>
                                                        {stat.growth !==
                                                            undefined && (
                                                            <motion.div
                                                                className="flex items-center gap-1 text-white/90"
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        0.3 +
                                                                        index *
                                                                            0.1,
                                                                }}
                                                            >
                                                                {stat.growth >=
                                                                0 ? (
                                                                    <TrendingUp className="h-4 w-4" />
                                                                ) : (
                                                                    <TrendingDown className="h-4 w-4" />
                                                                )}
                                                                <span className="text-sm font-semibold">
                                                                    {Math.abs(
                                                                        stat.growth,
                                                                    )}
                                                                    %
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                                                            {stat.title}
                                                        </p>
                                                        <motion.p
                                                            className="mb-1 text-3xl font-bold text-white"
                                                            initial={{
                                                                scale: 0.5,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    0.2 +
                                                                    index * 0.1,
                                                                type: 'spring',
                                                            }}
                                                        >
                                                            {stat.value}
                                                        </motion.p>
                                                        <p className="line-clamp-1 text-xs text-white/80">
                                                            {stat.subtitle}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Period Stats (if available) */}
                    {periodStats && (
                        <motion.div
                            variants={scaleIn}
                            initial="hidden"
                            animate="visible"
                            className="mb-8"
                        >
                            <Card className="overflow-hidden border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b border-white/10">
                                    <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                                        <Activity className="h-4 w-4" />
                                        Period Overview ({selectedPeriod})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                                        <div>
                                            <p className="mb-1 text-xs text-white/70">
                                                Total Bookings
                                            </p>
                                            <p className="text-3xl font-bold">
                                                {periodStats.bookings}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-xs text-white/70">
                                                Revenue
                                            </p>
                                            <p className="text-2xl font-bold">
                                                Rp{' '}
                                                {Number(
                                                    periodStats.revenue,
                                                ).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-xs text-white/70">
                                                Completed
                                            </p>
                                            <p className="text-3xl font-bold text-green-400">
                                                {periodStats.completed}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-xs text-white/70">
                                                Cancelled
                                            </p>
                                            <p className="text-3xl font-bold text-red-400">
                                                {periodStats.cancelled}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Quick Access */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mb-8"
                    >
                        <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader className="border-b border-zinc-100">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Quick Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                                    {[
                                        {
                                            label: 'Users',
                                            icon: Users,
                                            href: route('admin.users.index'),
                                        },
                                        {
                                            label: 'Barbers',
                                            icon: Scissors,
                                            href: route('admin.barbers.index'),
                                        },
                                        {
                                            label: 'Services',
                                            icon: Package,
                                            href: route('admin.services.index'),
                                        },
                                        {
                                            label: 'Categories',
                                            icon: BarChart3,
                                            href: route(
                                                'admin.categories.index',
                                            ),
                                        },
                                        {
                                            label: 'Discounts',
                                            icon: Tags,
                                            href: route(
                                                'admin.discounts.index',
                                            ),
                                        },
                                        {
                                            label: 'Bookings',
                                            icon: Calendar,
                                            href: route('admin.bookings.index'),
                                        },
                                        {
                                            label: 'Reports',
                                            icon: TrendingUp,
                                            href: route('admin.reports.index'),
                                        },
                                    ].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.7 + index * 0.05,
                                                }}
                                            >
                                                <Link href={item.href}>
                                                    <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-zinc-200 p-4 transition-all hover:border-black hover:bg-zinc-50">
                                                        <Icon className="mb-2 h-6 w-6 text-zinc-600 transition-colors group-hover:text-black" />
                                                        <span className="text-xs font-semibold text-zinc-700 transition-colors group-hover:text-black">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Bookings By Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader className="border-b border-zinc-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        <PieChart className="h-4 w-4" />
                                        Bookings by Status
                                    </CardTitle>
                                    <Link href={route('admin.bookings.index')}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs hover:bg-zinc-50"
                                        >
                                            View Details
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Status Progress Bars */}
                                    <div className="space-y-4">
                                        {bookingsByStatus.map(
                                            (
                                                item: BookingStatusCount,
                                                index,
                                            ) => {
                                                const percentage =
                                                    totalBookings > 0
                                                        ? (item.count /
                                                              totalBookings) *
                                                          100
                                                        : 0;
                                                const config = statusConfig[
                                                    item.status as keyof typeof statusConfig
                                                ] || {
                                                    label: formatStatus(
                                                        item.status,
                                                    ),
                                                    color: 'bg-gray-500',
                                                    textColor: 'text-gray-700',
                                                    bgColor: 'bg-gray-50',
                                                    borderColor:
                                                        'border-gray-200',
                                                    icon: PieChart,
                                                };
                                                const Icon = config.icon;

                                                return (
                                                    <motion.div
                                                        key={item.status}
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
                                                                0.5 +
                                                                index * 0.1,
                                                        }}
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor} ${config.borderColor} border`}
                                                                >
                                                                    <Icon
                                                                        className={`h-4 w-4 ${config.textColor}`}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-zinc-900">
                                                                        {
                                                                            config.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-zinc-500">
                                                                        {
                                                                            item.count
                                                                        }{' '}
                                                                        bookings
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-bold text-zinc-700">
                                                                {percentage.toFixed(
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>

                                                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                                                            <motion.div
                                                                className={`h-full rounded-full ${config.color}`}
                                                                // @ts-ignore
                                                                variants={
                                                                    progressVariants
                                                                }
                                                                initial="hidden"
                                                                animate="visible"
                                                                custom={
                                                                    percentage
                                                                }
                                                            />
                                                        </div>
                                                    </motion.div>
                                                );
                                            },
                                        )}
                                    </div>

                                    {/* Status Summary Cards */}
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                                        {bookingsByStatus
                                            .slice(0, 4)
                                            .map((item, index) => {
                                                const config = statusConfig[
                                                    item.status as keyof typeof statusConfig
                                                ] || {
                                                    label: formatStatus(
                                                        item.status,
                                                    ),
                                                    color: 'bg-gray-500',
                                                    textColor: 'text-gray-700',
                                                    bgColor: 'bg-gray-50',
                                                    borderColor:
                                                        'border-gray-200',
                                                    icon: PieChart,
                                                };
                                                const Icon = config.icon;

                                                return (
                                                    <motion.div
                                                        key={item.status}
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.8,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        transition={{
                                                            delay:
                                                                0.6 +
                                                                index * 0.1,
                                                        }}
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                    >
                                                        <Card
                                                            className={`border ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
                                                        >
                                                            <CardContent className="p-4 text-center">
                                                                <div
                                                                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${config.color} bg-opacity-10`}
                                                                >
                                                                    <Icon
                                                                        className={`h-6 w-6 ${config.textColor}`}
                                                                    />
                                                                </div>
                                                                <p className="text-2xl font-bold text-zinc-900">
                                                                    {item.count}
                                                                </p>
                                                                <p className="text-xs font-medium text-zinc-600">
                                                                    {
                                                                        config.label
                                                                    }
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Mobile View - Compact Version */}
                                <div className="mt-6 lg:hidden">
                                    <div className="grid grid-cols-2 gap-3">
                                        {bookingsByStatus.map((item, index) => {
                                            const config = statusConfig[
                                                item.status as keyof typeof statusConfig
                                            ] || {
                                                label: formatStatus(
                                                    item.status,
                                                ),
                                                color: 'bg-gray-500',
                                                textColor: 'text-gray-700',
                                                bgColor: 'bg-gray-50',
                                                borderColor: 'border-gray-200',
                                                icon: PieChart,
                                            };
                                            const Icon = config.icon;

                                            return (
                                                <motion.div
                                                    key={item.status}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            0.7 + index * 0.1,
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <Card
                                                        className={`border ${config.borderColor} ${config.bgColor}`}
                                                    >
                                                        <CardContent className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color} bg-opacity-10`}
                                                                >
                                                                    <Icon
                                                                        className={`h-4 w-4 ${config.textColor}`}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-semibold text-zinc-900">
                                                                        {
                                                                            config.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-lg font-bold text-zinc-900">
                                                                        {
                                                                            item.count
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div className="mb-8 flex flex-col gap-6 lg:grid lg:grid-cols-3">
                        {/* Recent Bookings */}
                        <motion.div
                            variants={slideIn}
                            initial="hidden"
                            animate="visible"
                            className="w-full lg:col-span-2"
                        >
                            <Card className="h-full border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            <Clock className="h-4 w-4" />
                                            Recent Bookings
                                        </CardTitle>
                                        <Link
                                            href={route('admin.bookings.index')}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs hover:bg-zinc-50"
                                            >
                                                View All
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        {recentBookings
                                            ?.slice(0, 5)
                                            .map((booking, idx) => (
                                                <motion.div
                                                    key={booking.id}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: 0.5 + idx * 0.05,
                                                    }}
                                                    whileHover={{
                                                        x: 4,
                                                        transition: {
                                                            duration: 0.2,
                                                        },
                                                    }}
                                                >
                                                    <Link
                                                        href={route(
                                                            'admin.bookings.show',
                                                            booking.id,
                                                        )}
                                                    >
                                                        <div className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-zinc-200 p-4 transition-all hover:border-black hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                                            {/* Left Section - Customer & Service Info */}
                                                            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-sm font-bold text-white">
                                                                    {booking
                                                                        .customer
                                                                        .avatar_url ? (
                                                                        <img
                                                                            src={
                                                                                booking
                                                                                    .customer
                                                                                    .avatar_url
                                                                            }
                                                                            alt={
                                                                                booking
                                                                                    .customer
                                                                                    .name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-2xl font-bold text-white">
                                                                            {booking.customer.name
                                                                                .charAt(
                                                                                    0,
                                                                                )
                                                                                .toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-black group-hover:underline">
                                                                        {booking
                                                                            .service
                                                                            ?.name ||
                                                                            'Unknown Service'}
                                                                    </p>
                                                                    <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                                                        <p className="truncate text-xs text-zinc-600">
                                                                            <span className="font-medium">
                                                                                {booking
                                                                                    .customer
                                                                                    ?.name ||
                                                                                    'Unknown Customer'}
                                                                            </span>
                                                                            <span className="mx-1">
                                                                                →
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {booking
                                                                                    .barber
                                                                                    ?.name ||
                                                                                    'Unknown Barber'}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                        <p className="text-xs font-medium text-zinc-500">
                                                                            {formatBookingDateTime(
                                                                                booking.booking_date,
                                                                                booking.start_time,
                                                                            )}
                                                                        </p>
                                                                        <span className="text-xs text-zinc-300">
                                                                            •
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right Section - Status & Price */}
                                                            <div className="flex flex-shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
                                                                <Badge
                                                                    className={`${getStatusColor(booking.status)} border px-2 py-1 text-xs font-medium`}
                                                                >
                                                                    {formatStatus(
                                                                        booking.status,
                                                                    )}
                                                                </Badge>
                                                                <div className="text-right">
                                                                    <span className="text-sm font-bold text-black">
                                                                        Rp{' '}
                                                                        {Number(
                                                                            booking.total_price ??
                                                                                0,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Barbers */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="w-full lg:col-span-1"
                        >
                            <Card className="h-full border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            <TrendingUp className="h-4 w-4" />
                                            Top Barbers
                                        </CardTitle>
                                        <Link
                                            href={route('admin.barbers.index')}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs hover:bg-zinc-50"
                                            >
                                                View All
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        {topBarbers
                                            ?.slice(0, 5)
                                            .map((barber: TopBarber, index) => (
                                                <motion.div
                                                    key={barber.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            0.4 + index * 0.1,
                                                    }}
                                                >
                                                    <Link
                                                        href={route(
                                                            'admin.users.show',
                                                            barber.id,
                                                        )}
                                                    >
                                                        <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-zinc-50">
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <div className="relative">
                                                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 font-bold text-white">
                                                                        {barber.avatar_url ? (
                                                                            <img
                                                                                src={
                                                                                    barber.avatar_url
                                                                                }
                                                                                alt={
                                                                                    barber.name
                                                                                }
                                                                                className="h-full w-full rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-2xl font-bold text-white">
                                                                                {barber.name
                                                                                    .charAt(
                                                                                        0,
                                                                                    )
                                                                                    .toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <motion.div
                                                                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-bold text-white"
                                                                        initial={{
                                                                            scale: 0,
                                                                        }}
                                                                        animate={{
                                                                            scale: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                0.5 +
                                                                                index *
                                                                                    0.1,
                                                                            type: 'spring',
                                                                        }}
                                                                    >
                                                                        {index +
                                                                            1}
                                                                    </motion.div>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-black group-hover:underline">
                                                                        {
                                                                            barber.name
                                                                        }
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="h-3 w-3 fill-black text-black" />
                                                                            <span className="text-xs font-semibold text-black">
                                                                                {
                                                                                    barber
                                                                                        .barber_profile
                                                                                        .rating_average
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-xs text-zinc-400">
                                                                            •
                                                                        </span>
                                                                        <span className="text-xs text-zinc-600">
                                                                            {barber.total_bookings ||
                                                                                barber.completed_bookings ||
                                                                                0}{' '}
                                                                            bookings
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <Eye className="h-4 w-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
