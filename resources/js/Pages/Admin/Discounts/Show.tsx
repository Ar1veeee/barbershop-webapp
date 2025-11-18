import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Discount, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Gift,
    Package,
    ScanEye,
    Tag,
    TrendingUp,
    User,
    Users,
    Zap,
} from 'lucide-react';
import React from 'react';

interface ShowProps extends PageProps {
    discount: Discount;
}

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: {
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
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardHover = {
    initial: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
};

const progressBar = {
    initial: { width: 0 },
    animate: {
        width: '100%',
        transition: {
            duration: 1.5,
            ease: 'easeOut',
        },
    },
};

export default function Show({ discount }: ShowProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (discount: Discount) => {
        const statusConfig = {
            active: {
                label: 'Live',
                className: 'bg-black text-white border-black',
                icon: Zap,
            },
            upcoming: {
                label: 'Soon',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: Clock,
            },
            expired: {
                label: 'Ended',
                className: 'border-gray-300 text-gray-500',
                icon: Calendar,
            },
            inactive: {
                label: 'Paused',
                className: 'border-gray-200 text-gray-400',
                icon: Eye,
            },
        };

        const config =
            statusConfig[discount.status as keyof typeof statusConfig] ||
            statusConfig.inactive;
        const Icon = config.icon;

        return (
            <Badge
                variant={
                    discount.status === 'expired' ||
                    discount.status === 'inactive'
                        ? 'outline'
                        : 'default'
                }
                className={`gap-1 ${config.className}`}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const usageStats = discount.usage_stats || {
        total_used: discount.used_count,
        remaining_quota: discount.usage_limit
            ? discount.usage_limit - discount.used_count
            : null,
        usage_percentage: discount.usage_limit
            ? round((discount.used_count / discount.usage_limit) * 100, 2)
            : 0,
        total_revenue: 0,
        total_discount_given: 0,
    };

    function round(value: number, decimals: number) {
        return Number(
            Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals,
        );
    }

    const MobileActionButtons = () => (
        <div className="flex gap-2 sm:hidden">
            <Button
                onClick={() =>
                    router.get(
                        route('admin.discounts.usage-history', discount.id),
                    )
                }
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300"
            >
                <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
                onClick={() =>
                    router.get(route('admin.discounts.edit', discount.id))
                }
                size="sm"
                className="flex-1 bg-black text-white hover:bg-gray-800"
            >
                <Edit className="h-4 w-4" />
            </Button>
        </div>
    );

    const DesktopActionButtons = () => (
        <div className="hidden gap-2 sm:flex">
            <Button
                onClick={() =>
                    router.get(
                        route('admin.discounts.usage-history', discount.id),
                    )
                }
                variant="outline"
                className="border-gray-300"
            >
                <BarChart3 className="mr-2 h-4 w-4" />
                Usage History
            </Button>
            <Button
                onClick={() =>
                    router.get(route('admin.discounts.edit', discount.id))
                }
                className="bg-black text-white hover:bg-gray-800"
            >
                <Edit className="mr-2 h-4 w-4" />
                Edit Discount
            </Button>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Discount - ${discount.name}`} />

            <div className="min-h-screen bg-white py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <Link href={route('admin.discounts.index')}>
                            <motion.div
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    className="group -ml-2 text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-black sm:-ml-3"
                                    size="sm"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span className="ml-2 text-sm font-medium sm:block">
                                        Back to Discounts
                                    </span>
                                </Button>
                            </motion.div>
                        </Link>
                        <div className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <motion.div
                                        className="mb-2 flex items-center gap-3"
                                        animate="float"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black sm:h-10 sm:w-10">
                                            <Tag className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                        </div>
                                        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">
                                            {discount.name}
                                        </h1>
                                    </motion.div>
                                    <p className="text-sm text-gray-600 sm:text-base">
                                        Discount details and usage statistics
                                    </p>
                                </div>
                            </div>

                            {/* Desktop Actions */}
                            <DesktopActionButtons />
                        </div>

                        {/* Mobile Actions */}
                        <MobileActionButtons />
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                    >
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Discount Overview Card */}
                            <motion.div
                                // @ts-ignore
                                variants={fadeInUp}
                            >
                                <motion.div
                                    // @ts-ignore
                                    variants={cardHover}
                                    initial="initial"
                                    whileHover="hover"
                                >
                                    <Card className="border-gray-200 shadow-sm">
                                        <CardHeader className="border-b border-gray-100 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-black sm:text-xl">
                                                <ScanEye className="h-5 w-5" />
                                                Discount Overview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6 p-4 sm:p-6">
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Discount Code
                                                        </label>
                                                        <p className="mt-1 font-mono text-xl font-bold text-black sm:text-2xl">
                                                            {discount.code ||
                                                                'No Code'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Discount Value
                                                        </label>
                                                        <p className="mt-1 text-xl font-bold text-black sm:text-2xl">
                                                            {discount.discount_type ===
                                                            'percentage'
                                                                ? `${discount.discount_value}%`
                                                                : formatCurrency(
                                                                      discount.discount_value,
                                                                  )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Status
                                                        </label>
                                                        <div className="mt-1">
                                                            {getStatusBadge(
                                                                discount,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Applies To
                                                        </label>
                                                        <p className="mt-1 text-lg font-semibold text-black">
                                                            {discount.applies_to ===
                                                            'all'
                                                                ? 'All Services & Barbers'
                                                                : 'Specific Items'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Created By
                                                        </label>
                                                        <p className="mt-1 text-lg font-semibold text-black">
                                                            {discount.created_by_name ||
                                                                'System'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Created Date
                                                        </label>
                                                        <p className="mt-1 text-sm font-semibold text-black sm:text-base">
                                                            {formatDate(
                                                                discount.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {discount.description && (
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <label className="text-sm font-medium text-gray-500">
                                                        Description
                                                    </label>
                                                    <p className="mt-2 text-gray-700">
                                                        {discount.description}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Date & Limits Card */}
                            <motion.div
                                // @ts-ignore
                                variants={fadeInUp}
                            >
                                <motion.div
                                    // @ts-ignore
                                    variants={cardHover}
                                    initial="initial"
                                    whileHover="hover"
                                >
                                    <Card className="border-gray-200 shadow-sm">
                                        <CardHeader className="border-b border-gray-100 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-black sm:text-xl">
                                                <Calendar className="h-5 w-5" />
                                                Date & Limits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Start Date
                                                        </label>
                                                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-black sm:text-base">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(
                                                                discount.start_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            End Date
                                                        </label>
                                                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-black sm:text-base">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(
                                                                discount.end_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {discount.min_order_amount && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-500">
                                                                Minimum Order
                                                            </label>
                                                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-black sm:text-base">
                                                                <Package className="h-4 w-4" />
                                                                {formatCurrency(
                                                                    discount.min_order_amount,
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {discount.max_discount_amount && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-500">
                                                                Maximum Discount
                                                            </label>
                                                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-black sm:text-base">
                                                                <Gift className="h-4 w-4" />
                                                                {formatCurrency(
                                                                    discount.max_discount_amount,
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Applicable Items Card */}
                            <AnimatePresence>
                                {discount.applies_to === 'specific' &&
                                    discount.applicables &&
                                    discount.applicables.length > 0 && (
                                        <motion.div
                                            // @ts-ignore
                                            variants={fadeInUp}
                                            initial="initial"
                                            animate="animate"
                                            exit="initial"
                                        >
                                            <motion.div
                                                // @ts-ignore
                                                variants={cardHover}
                                                initial="initial"
                                                whileHover="hover"
                                            >
                                                <Card className="border-gray-200 shadow-sm">
                                                    <CardHeader className="border-b border-gray-100 pb-4">
                                                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-black sm:text-xl">
                                                            <Users className="h-5 w-5" />
                                                            Applicable Items
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 sm:p-6">
                                                        <div
                                                            className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
                                                        >
                                                            {discount.applicables.map(
                                                                (
                                                                    applicable,
                                                                    index,
                                                                ) => (
                                                                    <motion.div
                                                                        key={
                                                                            index
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            scale: 0.9,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            scale: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                index *
                                                                                0.1,
                                                                        }}
                                                                        className="rounded-lg border border-gray-200 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 sm:h-10 sm:w-10">
                                                                                <User className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-semibold text-black sm:text-base">
                                                                                    {
                                                                                        applicable.name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs capitalize text-gray-500 sm:text-sm">
                                                                                    {
                                                                                        applicable.applicable_type
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Usage Statistics Card */}
                            <motion.div
                                // @ts-ignore
                                variants={fadeInUp}
                            >
                                <motion.div
                                    // @ts-ignore
                                    variants={cardHover}
                                    initial="initial"
                                    whileHover="hover"
                                >
                                    <Card className="border-gray-200 shadow-sm">
                                        <CardHeader className="border-b border-gray-100 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                                                <TrendingUp className="h-4 w-4" />
                                                Usage Statistics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-4 sm:p-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-black sm:text-3xl">
                                                    {usageStats.total_used}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Total Uses
                                                </div>
                                            </div>

                                            {discount.usage_limit && (
                                                <div>
                                                    <div className="mb-2 flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            Usage Progress
                                                        </span>
                                                        <span className="font-medium text-black">
                                                            {
                                                                discount.used_count
                                                            }{' '}
                                                            /{' '}
                                                            {
                                                                discount.usage_limit
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                        <motion.div
                                                            className="h-full rounded-full bg-gradient-to-r from-black to-gray-600"
                                                            initial="initial"
                                                            animate="animate"
                                                            // @ts-ignore
                                                            variants={
                                                                progressBar
                                                            }
                                                            style={{
                                                                width: `${usageStats.usage_percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mt-1 text-right text-xs text-gray-500">
                                                        {
                                                            usageStats.usage_percentage
                                                        }
                                                        % used
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="text-center">
                                                    <DollarSign className="mx-auto h-5 w-5 text-gray-600 sm:h-6 sm:w-6" />
                                                    <div className="mt-1 text-sm font-bold text-black sm:text-lg">
                                                        {formatCurrency(
                                                            usageStats.total_revenue,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Total Revenue
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <Gift className="mx-auto h-5 w-5 text-gray-600 sm:h-6 sm:w-6" />
                                                    <div className="mt-1 text-sm font-bold text-black sm:text-lg">
                                                        {formatCurrency(
                                                            usageStats.total_discount_given,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Discount Given
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Usage Limits Card */}
                            <motion.div
                                // @ts-ignore
                                variants={fadeInUp}
                            >
                                <motion.div
                                    // @ts-ignore
                                    variants={cardHover}
                                    initial="initial"
                                    whileHover="hover"
                                >
                                    <Card className="border-gray-200 shadow-sm">
                                        <CardHeader className="border-b border-gray-100 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                                                <Zap className="h-4 w-4" />
                                                Usage Limits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 p-4 sm:p-6">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Total Limit
                                                </span>
                                                <span className="font-medium text-black">
                                                    {discount.usage_limit ||
                                                        'Unlimited'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Per Customer
                                                </span>
                                                <span className="font-medium text-black">
                                                    {discount.customer_usage_limit ||
                                                        'Unlimited'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Remaining
                                                </span>
                                                <span className="font-medium text-black">
                                                    {usageStats.remaining_quota ??
                                                        'Unlimited'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Customer Specific Discounts Card */}
                            <AnimatePresence>
                                {discount.customerDiscounts &&
                                    discount.customerDiscounts.length > 0 && (
                                        <motion.div
                                            // @ts-ignore
                                            variants={fadeInUp}
                                            initial="initial"
                                            animate="animate"
                                            exit="initial"
                                        >
                                            <motion.div
                                                // @ts-ignore
                                                variants={cardHover}
                                                initial="initial"
                                                whileHover="hover"
                                            >
                                                <Card className="border-gray-200 shadow-sm">
                                                    <CardHeader className="border-b border-gray-100 pb-4">
                                                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                                                            <User className="h-4 w-4" />
                                                            Customer Specific
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 sm:p-6">
                                                        <div className="space-y-3">
                                                            {discount.customerDiscounts
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        cd,
                                                                        index,
                                                                    ) => (
                                                                        <motion.div
                                                                            key={
                                                                                index
                                                                            }
                                                                            initial={{
                                                                                opacity: 0,
                                                                                x: -10,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                                x: 0,
                                                                            }}
                                                                            transition={{
                                                                                delay:
                                                                                    index *
                                                                                    0.1,
                                                                            }}
                                                                            className="flex items-center justify-between text-sm"
                                                                        >
                                                                            <span className="truncate font-medium text-black">
                                                                                {
                                                                                    cd.customer_name
                                                                                }
                                                                            </span>
                                                                            <span className="text-gray-500">
                                                                                {
                                                                                    cd.used_count
                                                                                }

                                                                                /
                                                                                {cd.max_usage ||
                                                                                    '∞'}
                                                                            </span>
                                                                        </motion.div>
                                                                    ),
                                                                )}
                                                            {discount
                                                                .customerDiscounts
                                                                .length > 3 && (
                                                                <div className="text-center text-sm text-gray-500">
                                                                    +
                                                                    {discount
                                                                        .customerDiscounts
                                                                        .length -
                                                                        3}{' '}
                                                                    more
                                                                    customers
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
