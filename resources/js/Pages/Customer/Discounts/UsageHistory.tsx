import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationLink } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Filter,
    History,
    Package,
    Receipt,
    Sparkles,
    TrendingDown,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface UsageData {
    id: number;
    discount_name: string;
    discount_code: string;
    service_name: string;
    barber_name: string;
    original_amount: number;
    discount_amount: number;
    final_amount: number;
    used_at: string;
    booking_date: string;
}

interface Props {
    auth: any;
    usages: {
        data: UsageData[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        date_from?: string;
        date_to?: string;
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function UsageHistory({ usages, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleFilter = () => {
        router.get(
            route('discounts.usage-history'),
            { date_from: dateFrom, date_to: dateTo },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilter = () => {
        setDateFrom('');
        setDateTo('');
        router.get(route('discounts.usage-history'));
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);

    // Calculate total savings
    const totalSavings = usages.data.reduce(
        (sum, usage) => sum + usage.discount_amount,
        0,
    );

    return (
        <AuthenticatedLayout>
            <Head title="Usage History" />

            {/* Back Button */}
            <Link href={route('customer.discounts.index')}>
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
                        <span className="font-medium">Back to Discounts</span>
                    </Button>
                </motion.div>
            </Link>

            <div className="min-h-screen bg-white">
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-800">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: '50px 50px',
                            }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <motion.div
                            // @ts-ignore
                            variants={headerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center"
                        >
                            {/* Icon Badge */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-xl"
                            >
                                <History className="h-8 w-8 text-white" />
                            </motion.div>

                            <h1 className="mb-4 text-4xl font-black text-white sm:text-5xl lg:text-6xl">
                                Usage History
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-zinc-300 sm:text-xl">
                                Track your savings journey and discover how much
                                you've saved
                            </p>

                            {/* Stats Cards */}
                            {usages.data.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="mt-12 grid gap-4 sm:grid-cols-3"
                                >
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                                        <div className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
                                            Total Savings
                                        </div>
                                        <div className="text-2xl font-black text-white sm:text-3xl">
                                            {formatCurrency(totalSavings)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                                        <div className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
                                            Discounts Used
                                        </div>
                                        <div className="text-2xl font-black text-white sm:text-3xl">
                                            {usages.total}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                                        <div className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
                                            Avg. Discount
                                        </div>
                                        <div className="text-2xl font-black text-white sm:text-3xl">
                                            {formatCurrency(
                                                Math.round(
                                                    totalSavings /
                                                        usages.total || 0,
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Wave Divider */}
                    <div className="relative h-16">
                        <svg
                            className="absolute bottom-0 w-full"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1440 120"
                            preserveAspectRatio="none"
                        >
                            <path
                                fill="#ffffff"
                                d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-black">
                                Filter History
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="group"
                            >
                                <Filter
                                    className={`mr-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                                />
                                {isFilterOpen ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                    <Calendar className="h-3 w-3" />
                                                    From Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) =>
                                                        setDateFrom(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                    <Calendar className="h-3 w-3" />
                                                    To Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) =>
                                                        setDateTo(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                />
                                            </div>
                                            <div className="flex items-end gap-2 sm:col-span-2">
                                                <Button
                                                    onClick={handleFilter}
                                                    className="flex-1 bg-black text-white hover:bg-zinc-800"
                                                >
                                                    Apply Filter
                                                </Button>
                                                {(dateFrom || dateTo) && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={clearFilter}
                                                        className="border-zinc-300 hover:border-red-500 hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Usage Cards Grid */}
                    {usages.data.length > 0 ? (
                        <>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {usages.data.map((usage, index) => (
                                    <motion.div
                                        key={usage.id}
                                        // @ts-ignore
                                        variants={itemVariants}
                                        whileHover={{
                                            y: -8,
                                            transition: { duration: 0.2 },
                                        }}
                                        className="group relative"
                                    >
                                        {/* Card */}
                                        <div className="relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 group-hover:border-zinc-300 group-hover:shadow-2xl">
                                            {/* Top Accent */}
                                            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-black via-zinc-600 to-black" />

                                            {/* Glow Effect on Hover */}
                                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200/50 to-zinc-300/50 blur-xl" />
                                            </div>

                                            <div className="relative p-6">
                                                {/* Header */}
                                                <div className="mb-6 flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <Badge className="mb-3 rounded-lg bg-black px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-white hover:bg-zinc-800">
                                                            {
                                                                usage.discount_code
                                                            }
                                                        </Badge>
                                                        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-black">
                                                            {
                                                                usage.discount_name
                                                            }
                                                        </h3>
                                                    </div>
                                                    <motion.div
                                                        transition={{
                                                            duration: 0.6,
                                                        }}
                                                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-50"
                                                    >
                                                        <TrendingDown className="h-6 w-6 text-green-600" />
                                                    </motion.div>
                                                </div>

                                                {/* Service & Barber Info */}
                                                <div className="mb-6 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                        <Package className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {usage.service_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                        <User className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {usage.barber_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                <div className="mb-6 border-t border-dashed border-zinc-200" />

                                                {/* Financial Breakdown */}
                                                <div className="mb-6 space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-zinc-500">
                                                            Original
                                                        </span>
                                                        <span className="font-mono text-zinc-400 line-through">
                                                            {formatCurrency(
                                                                usage.original_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-green-600">
                                                            You Saved
                                                        </span>
                                                        <span className="font-mono font-bold text-green-600">
                                                            -
                                                            {formatCurrency(
                                                                usage.discount_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-black px-4 py-3 text-white">
                                                        <span className="font-semibold">
                                                            Total Paid
                                                        </span>
                                                        <span className="font-mono text-lg font-black">
                                                            {formatCurrency(
                                                                usage.final_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Date Info */}
                                                <div className="space-y-2 rounded-xl bg-zinc-50 p-4">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-zinc-500">
                                                            Used On
                                                        </span>
                                                        <span className="font-semibold text-zinc-700">
                                                            {format(
                                                                new Date(
                                                                    usage.used_at,
                                                                ),
                                                                'dd MMM yyyy',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-zinc-500">
                                                            Booking Date
                                                        </span>
                                                        <span className="font-semibold text-zinc-700">
                                                            {format(
                                                                new Date(
                                                                    usage.booking_date,
                                                                ),
                                                                'dd MMM yyyy',
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Receipt Edge Effect */}
                                            <div className="relative h-6 bg-zinc-50">
                                                <div
                                                    className="absolute top-0 flex h-6 w-full justify-around"
                                                    style={{
                                                        background:
                                                            'radial-gradient(circle at 50% 0, transparent 12px, #fafafa 12px)',
                                                        backgroundSize:
                                                            '24px 100%',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Card Index Number */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-lg"
                                        >
                                            {index + 1}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Pagination */}
                            {usages.links.length > 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-12 flex justify-center"
                                >
                                    <div className="flex items-center gap-2">
                                        {usages.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all ${
                                                    link.active
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : !link.url
                                                          ? 'cursor-not-allowed border-transparent text-zinc-300'
                                                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 hover:text-black'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                                preserveState
                                                preserveScroll
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="py-24"
                        >
                            <div className="mx-auto max-w-md text-center">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="mb-8 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-8"
                                >
                                    <Receipt className="h-16 w-16 text-zinc-400" />
                                </motion.div>

                                <h3 className="mb-2 text-2xl font-bold text-black">
                                    No History Yet
                                </h3>
                                <p className="mb-8 text-zinc-500">
                                    Start using discount codes to see your
                                    savings here
                                </p>

                                <Link href={route('discounts.index')}>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Button
                                            size="lg"
                                            className="group bg-black text-white hover:bg-zinc-800"
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Explore Discounts
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
