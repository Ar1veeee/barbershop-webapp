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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    DailyEarning,
    PageProps,
    PeakHour,
    RecentBooking,
    TopService,
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BanknoteArrowUp,
    BarChart3,
    Calendar,
    Crown,
    DollarSign,
    Download,
    History,
    Repeat,
    Scissors,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// === Animasi Variants ===
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
            ease: 'easeOut',
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const barVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    show: (i: number) => ({
        scaleY: 1,
        opacity: 1,
        transition: {
            duration: 0.6,
            delay: i * 0.05,
            ease: 'backOut',
        },
    }),
};

const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

const comparisonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

interface EarningsIndexProps extends PageProps {
    monthlyEarnings: number;
    commission: number;
    netEarnings: number;
    commissionRate: number;
    dailyEarnings: DailyEarning[];
    topServices: TopService[];
    recentBookings: RecentBooking[];
    month: number;
    year: number;
    growthRate: number;
    peakHours: PeakHour[];
    retentionRate: number;
    lastMonthEarnings: number;
}

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export default function Index({
    monthlyEarnings,
    commission,
    netEarnings,
    commissionRate,
    dailyEarnings,
    topServices,
    recentBookings,
    month,
    year,
    growthRate,
    peakHours,
    retentionRate,
    lastMonthEarnings,
}: EarningsIndexProps) {
    const handlePeriodChange = (newMonth: string, newYear: string) => {
        window.location.href = route('barber.earnings.index', {
            month: newMonth,
            year: newYear,
        });
    };

    const isGrowthPositive = growthRate >= 0;
    const avgPerBooking =
        dailyEarnings.length > 0
            ? monthlyEarnings /
              dailyEarnings.reduce((a, b) => a + b.bookings, 0)
            : 0;

    const earningsDifference = monthlyEarnings - lastMonthEarnings;
    const currentMonthName = MONTHS[month - 1];
    const lastMonthName = MONTHS[month - 2] || MONTHS[11];

    return (
        <AuthenticatedLayout>
            <Head title="Earnings Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-3 text-center sm:text-left">
                                <motion.h1
                                    className="text-3xl font-bold tracking-tight text-black sm:text-4xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Earnings Dashboard
                                </motion.h1>
                                <motion.p
                                    className="text-zinc-600 sm:text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Track your income and performance metrics
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                            >
                                {/* Period Selectors */}
                                <div className="flex gap-2">
                                    <Select
                                        value={month.toString()}
                                        onValueChange={(m) =>
                                            handlePeriodChange(
                                                m,
                                                year.toString(),
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-28 border-zinc-300 sm:w-32">
                                            <Calendar className="h-4 w-4" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, i) => (
                                                <SelectItem
                                                    key={i}
                                                    value={(i + 1).toString()}
                                                >
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={year.toString()}
                                        onValueChange={(y) =>
                                            handlePeriodChange(
                                                month.toString(),
                                                y,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-24 border-zinc-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2024, 2025, 2026].map((y) => (
                                                <SelectItem
                                                    key={y}
                                                    value={y.toString()}
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-zinc-300 sm:w-auto"
                                        size="sm"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        <span className="xs:inline hidden">
                                            Export
                                        </span>
                                        <span className="xs:hidden">PDF</span>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Main Stats Cards */}
                    <motion.div
                        // @ts-ignore
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mb-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4"
                    >
                        {/* Total Revenue */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{
                                y: -6,
                                transition: { type: 'spring', stiffness: 400 },
                            }}
                            className="lg:col-span-2"
                        >
                            <Card className="overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="mb-1 text-sm font-medium text-zinc-600">
                                                Total Revenue
                                            </p>
                                            <motion.div
                                                className="text-2xl font-bold text-black sm:text-3xl"
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Rp{' '}
                                                {monthlyEarnings.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </motion.div>

                                            {/* Last Month Comparison */}
                                            <motion.div
                                                // @ts-ignore
                                                variants={comparisonVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="mt-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-3"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200"
                                                >
                                                    <History className="h-4 w-4 text-zinc-600" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-zinc-600">
                                                        {lastMonthName} Earnings
                                                    </p>
                                                    <p className="text-sm font-semibold text-black">
                                                        Rp{' '}
                                                        {lastMonthEarnings.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1 ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    <motion.div
                                                        animate={
                                                            isGrowthPositive
                                                                ? {
                                                                      scale: [
                                                                          1,
                                                                          1.3,
                                                                          1,
                                                                      ],
                                                                  }
                                                                : {}
                                                        }
                                                        transition={{
                                                            duration: 0.6,
                                                            repeat: isGrowthPositive
                                                                ? Infinity
                                                                : 0,
                                                            repeatDelay: 2,
                                                        }}
                                                    >
                                                        {isGrowthPositive ? (
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowDownRight className="h-4 w-4" />
                                                        )}
                                                    </motion.div>
                                                    <span className="text-sm font-bold">
                                                        {Math.abs(
                                                            growthRate,
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </motion.div>
                                        </div>
                                        <motion.div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                                            <DollarSign className="h-6 w-6 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Commission */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{
                                y: -6,
                                transition: { type: 'spring', stiffness: 400 },
                            }}
                        >
                            <Card className="overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-zinc-600">
                                                Commission ({commissionRate}%)
                                            </p>
                                            <div className="text-2xl font-bold text-black sm:text-3xl">
                                                - Rp{' '}
                                                {commission.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </div>
                                        </div>
                                        <motion.div
                                            // @ts-ignore
                                            animate={pulseAnimation}
                                            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100"
                                        >
                                            <TrendingUp className="h-6 w-6 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Barbershop commission fee
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Net Earnings */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{
                                scale: 1.02,
                                transition: { type: 'spring', stiffness: 400 },
                            }}
                        >
                            <Card className="hover:shadow-3xl overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl transition-all duration-500">
                                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/5" />
                                <CardContent className="relative p-4 sm:p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
                                                <Award className="h-4 w-4" />
                                                Net Earnings
                                            </p>
                                            <motion.div
                                                className="text-2xl font-bold text-white sm:text-3xl"
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Rp{' '}
                                                {netEarnings.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </motion.div>
                                        </div>
                                        <motion.div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                                            <BanknoteArrowUp className="h-6 w-6 text-white" />
                                        </motion.div>
                                    </div>
                                    <p className="text-xs text-white/60">
                                        Your actual take-home pay
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Insights Cards with Last Month Comparison */}
                    <motion.div
                        // @ts-ignore
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mb-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-4"
                    >
                        {/* Monthly Comparison Card */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                            className="md:col-span-2"
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <History className="h-4 w-4" />
                                        Monthly Comparison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-zinc-500">
                                                    {currentMonthName} {year}
                                                </p>
                                                <p className="text-lg font-bold text-black">
                                                    Rp{' '}
                                                    {monthlyEarnings.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500">
                                                    {lastMonthName}
                                                </p>
                                                <p className="text-lg font-bold text-zinc-600">
                                                    Rp{' '}
                                                    {lastMonthEarnings.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">
                                                    Growth
                                                </span>
                                                <span
                                                    className={`font-semibold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {isGrowthPositive
                                                        ? '+'
                                                        : ''}
                                                    {earningsDifference.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${Math.min(Math.max(Math.abs(growthRate), 2), 100)}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        delay: 0.5,
                                                    }}
                                                    className={`h-full rounded-full ${isGrowthPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">
                                                    Change
                                                </span>
                                                <span
                                                    className={`font-semibold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {isGrowthPositive
                                                        ? '+'
                                                        : ''}
                                                    {growthRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Peak Hour */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Peak Hour
                                            </p>
                                            <p className="text-xl font-bold text-black">
                                                {peakHours[0]?.hour || 0}:00
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                {peakHours[0]?.bookings || 0}{' '}
                                                bookings
                                            </p>
                                        </div>
                                        <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                                            <Zap className="h-5 w-5 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Retention Rate */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Retention
                                            </p>
                                            <p className="text-xl font-bold text-black">
                                                {retentionRate.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                returning clients
                                            </p>
                                        </div>
                                        <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                                            <Repeat className="h-5 w-5 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Additional Metric */}
                    <motion.div
                        // @ts-ignore
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
                    >
                        {/* Avg per Booking */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                            className="col-span-2 md:col-span-1"
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Avg/Booking
                                            </p>
                                            <p className="text-xl font-bold text-black">
                                                Rp{' '}
                                                {avgPerBooking.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                average revenue
                                            </p>
                                        </div>
                                        <motion.div
                                            whileHover={{ rotate: 15 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100"
                                        >
                                            <Target className="h-5 w-5 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Growth Indicator */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                            className="col-span-2 md:col-span-1"
                        >
                            <Card
                                className={`border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${isGrowthPositive ? 'hover:border-green-200' : 'hover:border-red-200'}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Monthly Growth
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {isGrowthPositive ? '+' : ''}
                                                {growthRate.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                vs {lastMonthName}
                                            </p>
                                        </div>
                                        <motion.div
                                            animate={
                                                isGrowthPositive
                                                    ? { scale: [1, 1.2, 1] }
                                                    : {}
                                            }
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${isGrowthPositive ? 'bg-green-100' : 'bg-red-100'}`}
                                        >
                                            {isGrowthPositive ? (
                                                <ArrowUpRight className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5 text-red-600" />
                                            )}
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Earnings Difference */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                            className="col-span-2 md:col-span-1"
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Earnings Change
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {isGrowthPositive ? '+' : ''}Rp{' '}
                                                {Math.abs(
                                                    earningsDifference,
                                                ).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                from last month
                                            </p>
                                        </div>
                                        <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                                            <DollarSign className="h-5 w-5 text-zinc-600" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Performance Badge */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                            whileHover={{ scale: 1.05 }}
                            className="col-span-2 md:col-span-1"
                        >
                            <Card
                                className={`border-zinc-200 ${isGrowthPositive ? 'bg-green-50' : 'bg-red-50'} backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-xs text-zinc-500">
                                                Performance
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {isGrowthPositive
                                                    ? 'Growing'
                                                    : 'Declining'}
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                this month
                                            </p>
                                        </div>
                                        <motion.div
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${isGrowthPositive ? 'bg-green-100' : 'bg-red-100'}`}
                                        >
                                            <TrendingUp
                                                className={`h-5 w-5 ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Charts and Top Services */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Daily Earnings Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="lg:col-span-2"
                        >
                            <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Daily Revenue
                                    </CardTitle>
                                    <CardDescription>
                                        Daily earnings breakdown for{' '}
                                        {MONTHS[month - 1]} {year}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart data={dailyEarnings}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e4e4e7"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="day"
                                                stroke="#71717a"
                                                fontSize={12}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                stroke="#71717a"
                                                fontSize={12}
                                                axisLine={false}
                                                tickLine={false}
                                                width={60}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter:
                                                        'blur(10px)',
                                                    border: '1px solid #e4e4e7',
                                                    borderRadius: '12px',
                                                    boxShadow:
                                                        '0 10px 25px rgba(0,0,0,0.1)',
                                                }}
                                                formatter={(value) => [
                                                    `Rp ${Number(value).toLocaleString('id-ID')}`,
                                                    'Earnings',
                                                ]}
                                            />
                                            <Bar
                                                dataKey="earnings"
                                                fill="#18181b"
                                                radius={[4, 4, 0, 0]}
                                            >
                                                {dailyEarnings.map(
                                                    (_entry, index) => (
                                                        // @ts-ignore
                                                        <motion.cell
                                                            key={`cell-${index}`}
                                                            custom={index}
                                                            variants={
                                                                barVariants
                                                            }
                                                            initial="hidden"
                                                            animate="show"
                                                        />
                                                    ),
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Services */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card className="h-full border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Crown className="h-5 w-5" />
                                        Top Services
                                    </CardTitle>
                                    <CardDescription>
                                        Best performing services by revenue
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnimatePresence>
                                        {topServices.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="py-12 text-center"
                                            >
                                                <Scissors className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
                                                <p className="text-zinc-500">
                                                    No service data available
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                // @ts-ignore
                                                variants={container}
                                                initial="hidden"
                                                animate="show"
                                                className="space-y-4"
                                            >
                                                {topServices.map(
                                                    (
                                                        service: TopService,
                                                        index,
                                                    ) => (
                                                        <motion.div
                                                            key={index}
                                                            // @ts-ignore
                                                            variants={item}
                                                            whileHover={{
                                                                x: 4,
                                                            }}
                                                            className="group"
                                                        >
                                                            <div className="flex items-start justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="mb-1 flex items-center gap-2">
                                                                        <motion.div
                                                                            initial={{
                                                                                scale: 0,
                                                                            }}
                                                                            animate={{
                                                                                scale: 1,
                                                                            }}
                                                                            transition={{
                                                                                delay:
                                                                                    0.1 *
                                                                                    index,
                                                                            }}
                                                                        >
                                                                            <Badge className="bg-black text-xs text-white">
                                                                                #
                                                                                {index +
                                                                                    1}
                                                                            </Badge>
                                                                        </motion.div>
                                                                        <p className="truncate text-sm font-semibold text-black">
                                                                            {
                                                                                service.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                                        <span>
                                                                            {
                                                                                service.count
                                                                            }{' '}
                                                                            bookings
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="ml-2 whitespace-nowrap text-sm font-bold text-black">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        service.revenue,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {index <
                                                                topServices.length -
                                                                    1 && (
                                                                <Separator className="bg-zinc-200" />
                                                            )}
                                                        </motion.div>
                                                    ),
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Recent Completed Bookings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mt-6"
                    >
                        <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>
                                        Recent Completed Bookings
                                    </CardTitle>
                                    <CardDescription>
                                        Latest completed services with earnings
                                    </CardDescription>
                                </div>
                                <Link
                                    href={route('barber.bookings.index', {
                                        status: 'completed',
                                    })}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-zinc-300"
                                        >
                                            View All
                                            <ArrowUpRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence>
                                    {recentBookings.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-12 text-center"
                                        >
                                            <Users className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
                                            <p className="text-zinc-500">
                                                No completed bookings this
                                                period
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            // @ts-ignore
                                            variants={container}
                                            initial="hidden"
                                            animate="show"
                                            className="space-y-3"
                                        >
                                            {recentBookings.map(
                                                (
                                                    booking: RecentBooking,
                                                    index,
                                                ) => (
                                                    <motion.div
                                                        key={booking.id}
                                                        // @ts-ignore
                                                        variants={item}
                                                        custom={index}
                                                        whileHover={{
                                                            y: -2,
                                                            boxShadow:
                                                                '0 8px 25px rgba(0,0,0,0.1)',
                                                        }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                        }}
                                                    >
                                                        <Link
                                                            href={route(
                                                                'barber.bookings.show',
                                                                booking.id,
                                                            )}
                                                        >
                                                            <div className="group flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-all hover:border-zinc-400 hover:bg-white/50">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    <motion.div
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-600 text-sm font-bold text-white"
                                                                    >
                                                                        {booking.customer?.name?.charAt(
                                                                            0,
                                                                        ) ||
                                                                            'C'}
                                                                    </motion.div>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-semibold text-black">
                                                                            {booking
                                                                                .customer
                                                                                ?.name ||
                                                                                'Customer'}
                                                                        </p>
                                                                        <p className="truncate text-sm text-zinc-600">
                                                                            {
                                                                                booking
                                                                                    .service
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0 text-right">
                                                                    <p className="text-lg font-bold text-black">
                                                                        Rp{' '}
                                                                        {Number(
                                                                            booking.total_price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm text-zinc-500">
                                                                        {new Date(
                                                                            booking.booking_date,
                                                                        ).toLocaleDateString(
                                                                            'id-ID',
                                                                            {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ),
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
