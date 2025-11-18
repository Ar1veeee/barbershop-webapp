import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Discount, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Copy,
    DollarSign,
    Percent,
    Sparkles,
    Tag,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface DiscountShowProps extends PageProps {
    discount: Discount;
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
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const scaleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function Show({ discount }: DiscountShowProps) {
    const [copied, setCopied] = useState(false);
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

    const DiscountIcon =
        discount.discount_type === 'percentage' ? Percent : DollarSign;

    const handleCopyCode = () => {
        if (discount.code) {
            navigator.clipboard.writeText(discount.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getApplicablesDetails = () => {
        if (discount.applies_to === 'all') {
            return 'All services and barbers';
        }

        const applicableNames = (discount.applicables ?? [])
            .map((a) => a.name)
            .filter(Boolean);
        if (applicableNames.length === 0) return 'Specific items';

        return applicableNames.join(', ');
    };

    const calculateExample = (price: number) => {
        if (discount.discount_type === 'percentage') {
            const discountAmount = (price * discount.discount_value) / 100;
            const finalAmount = discount.max_discount_amount
                ? Math.min(discountAmount, discount.max_discount_amount)
                : discountAmount;
            return {
                original: price,
                discount: finalAmount,
                final: price - finalAmount,
            };
        } else {
            return {
                original: price,
                discount: Math.min(discount.discount_value, price),
                final: price - Math.min(discount.discount_value, price),
            };
        }
    };

    const example = calculateExample(100000);
    const availableQuota = discount.usage_limit
        ? discount.usage_limit - discount.used_count
        : null;
    const quotaPercentage = discount.usage_limit
        ? ((availableQuota || 0) / discount.usage_limit) * 100
        : 100;

    return (
        <AuthenticatedLayout>
            <Head title={discount.name} />

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
                        <span className="font-medium">
                                    Back to Discounts
                                </span>
                    </Button>
                </motion.div>
            </Link>

            <div className="min-h-screen bg-white">
                {/* Hero Section with Parallax */}
                <motion.div
                    style={{ opacity: headerOpacity }}
                    className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-zinc-800"
                >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
                            }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                        <div className="grid items-center gap-8 lg:grid-cols-2">
                            {/* Left: Title & Info */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}>
                                    <Badge
                                        className={`mb-4 rounded-full border-0 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                                            discount.customer_usage?.used_count
                                                ? 'bg-white/20 text-white'
                                                : discount.is_available
                                                  ? 'bg-green-500/20 text-green-300'
                                                  : 'bg-zinc-700 text-zinc-400'
                                        }`}
                                    >
                                        {discount.customer_usage?.used_count ? (
                                            <>
                                                <Check className="mr-1 h-3 w-3" />
                                                Used
                                            </>
                                        ) : discount.is_available ? (
                                            <>
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="mr-1 h-3 w-3" />
                                                Expired
                                            </>
                                        )}
                                    </Badge>

                                    <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                                        {discount.name}
                                    </h1>
                                </motion.div>

                                <motion.p
                                    // @ts-ignore
                                    variants={itemVariants}
                                    className="text-lg leading-relaxed text-zinc-300 sm:text-xl"
                                >
                                    {discount.description ||
                                        'Special discount for you'}
                                </motion.p>

                                {/* Discount Code */}
                                {discount.code && (
                                    <motion.div
                                        // @ts-ignore
                                        variants={itemVariants}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                                            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
                                                <Tag className="h-3 w-3" />
                                                Promo Code
                                            </div>
                                            <code className="text-2xl font-bold text-white">
                                                {discount.code}
                                            </code>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCopyCode}
                                            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur-xl hover:bg-white/10"
                                        >
                                            {copied ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <Copy className="h-5 w-5" />
                                            )}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Right: Discount Value Card */}
                            <motion.div
                                // @ts-ignore
                                variants={scaleVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex justify-center lg:justify-end"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, rotate: 1 }}
                                    className="relative"
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-zinc-500/20 to-zinc-700/20 blur-2xl" />

                                    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl sm:p-12">
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                            className="absolute right-4 top-4 h-16 w-16 rounded-full bg-gradient-to-br from-white/5 to-white/10"
                                        />

                                        <div className="relative text-center">
                                            <motion.div
                                                className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 p-4"
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <DiscountIcon className="h-8 w-8 text-white" />
                                            </motion.div>

                                            <div className="mb-2 text-sm uppercase tracking-widest text-zinc-400">
                                                Save
                                            </div>
                                            <div className="text-6xl font-black text-white sm:text-7xl lg:text-8xl">
                                                {discount.discount_type ===
                                                'percentage'
                                                    ? `${discount.discount_value}%`
                                                    : `${(discount.discount_value / 1000).toFixed(0)}K`}
                                            </div>
                                            <div className="mt-2 text-sm uppercase tracking-widest text-zinc-400">
                                                Discount
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
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
                </motion.div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Left Column - Details */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Example Calculation */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}>
                                <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-50 to-white shadow-xl shadow-zinc-100">
                                    <CardContent className="p-6 sm:p-8">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                            <h2 className="text-xl font-bold text-black">
                                                Savings Calculator
                                            </h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between rounded-xl bg-white p-4">
                                                <span className="text-zinc-600">
                                                    Original Price
                                                </span>
                                                <span className="font-mono text-lg font-semibold">
                                                    Rp{' '}
                                                    {example.original.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>

                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                whileInView={{ scaleX: 1 }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 0.6,
                                                    delay: 0.3,
                                                }}
                                                className="h-1 origin-left rounded-full bg-gradient-to-r from-black to-zinc-600"
                                            />

                                            <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                                                <span className="text-green-700">
                                                    You Save
                                                </span>
                                                <span className="font-mono text-lg font-bold text-green-600">
                                                    - Rp{' '}
                                                    {example.discount.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-xl bg-black p-4 text-white">
                                                <span className="font-semibold">
                                                    Final Price
                                                </span>
                                                <span className="font-mono text-2xl font-black">
                                                    Rp{' '}
                                                    {example.final.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Terms & Conditions */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}>
                                <Card className="border-0 bg-white shadow-xl shadow-zinc-100">
                                    <CardContent className="p-6 sm:p-8">
                                        <h2 className="mb-6 text-xl font-bold text-black">
                                            Terms & Conditions
                                        </h2>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {discount.min_order_amount && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                                                >
                                                    <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                                                        Min. Order
                                                    </div>
                                                    <div className="font-mono text-lg font-bold text-black">
                                                        Rp{' '}
                                                        {discount.min_order_amount.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {discount.max_discount_amount && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                                                >
                                                    <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                                                        Max. Discount
                                                    </div>
                                                    <div className="font-mono text-lg font-bold text-black">
                                                        Rp{' '}
                                                        {discount.max_discount_amount.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:col-span-2"
                                            >
                                                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                                    <Calendar className="h-3 w-3" />
                                                    Valid Period
                                                </div>
                                                <div className="font-semibold text-black">
                                                    {format(
                                                        new Date(
                                                            discount.start_date,
                                                        ),
                                                        'dd MMM yyyy',
                                                        { locale: id },
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        new Date(
                                                            discount.end_date,
                                                        ),
                                                        'dd MMM yyyy',
                                                        { locale: id },
                                                    )}
                                                </div>
                                            </motion.div>

                                            {discount.customer_usage_limit && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                                                >
                                                    <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                                                        Usage Limit
                                                    </div>
                                                    <div className="font-mono text-lg font-bold text-black">
                                                        {
                                                            discount.customer_usage_limit
                                                        }{' '}
                                                        times
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Applicable Items */}
                                        <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                                <Users className="h-3 w-3" />
                                                Applicable For
                                            </div>
                                            <div className="text-sm text-zinc-700">
                                                {getApplicablesDetails()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Action Card */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}>
                                <Card className="overflow-hidden border-0 bg-black text-white shadow-2xl">
                                    <CardContent className="p-6">
                                        <div className="mb-6 text-center">
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                                className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 p-4"
                                            >
                                                <Zap className="h-6 w-6" />
                                            </motion.div>
                                            <h3 className="text-lg font-bold">
                                                Ready to Save?
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                className="w-full bg-white text-black hover:bg-zinc-100"
                                                size="lg"
                                                disabled={
                                                    !discount.is_available
                                                }
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            'customer.bookings.create',
                                                        ),
                                                    )
                                                }
                                            >
                                                {discount.is_available
                                                    ? 'Book Now'
                                                    : 'Not Available'}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            'customer.barbers.index',
                                                        ),
                                                    )
                                                }
                                            >
                                                Browse Services
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Quota Progress */}
                            {discount.usage_limit && (
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}>
                                    <Card className="border-0 bg-white shadow-xl shadow-zinc-100">
                                        <CardContent className="p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-zinc-600">
                                                    Remaining Quota
                                                </span>
                                                <span className="text-sm font-bold text-black">
                                                    {availableQuota} /{' '}
                                                    {discount.usage_limit}
                                                </span>
                                            </div>

                                            <div className="relative h-3 overflow-hidden rounded-full bg-zinc-100">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{
                                                        width: `${quotaPercentage}%`,
                                                    }}
                                                    viewport={{ once: true }}
                                                    transition={{
                                                        duration: 1,
                                                        ease: 'easeOut',
                                                    }}
                                                    className="h-full rounded-full bg-gradient-to-r from-black to-zinc-600"
                                                />
                                            </div>

                                            <p className="mt-3 text-xs text-zinc-500">
                                                {quotaPercentage > 50
                                                    ? '🎉 Plenty available!'
                                                    : quotaPercentage > 20
                                                      ? '⚡ Limited stock'
                                                      : '🔥 Almost gone!'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* User Usage Info */}
                            {discount.customer_usage && (
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}>
                                    <Card className="border-0 bg-zinc-50 shadow-xl shadow-zinc-100">
                                        <CardContent className="p-6">
                                            <h3 className="mb-4 font-semibold text-black">
                                                Your Usage
                                            </h3>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-600">
                                                        Times Used
                                                    </span>
                                                    <span className="font-bold text-black">
                                                        {
                                                            discount
                                                                .customer_usage
                                                                .used_count
                                                        }
                                                    </span>
                                                </div>
                                                {discount.customer_usage
                                                    .expires_at && (
                                                    <div className="flex justify-between">
                                                        <span className="text-zinc-600">
                                                            Expires
                                                        </span>
                                                        <span className="font-semibold text-black">
                                                            {format(
                                                                new Date(
                                                                    discount.customer_usage.expires_at,
                                                                ),
                                                                'dd MMM yyyy',
                                                                { locale: id },
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
