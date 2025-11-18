import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CustomerDiscountFilters,
    Discount,
    PageProps,
    PaginatedDiscounts,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import {
    Calendar,
    ChevronDown,
    CircleCheckBig,
    Clock,
    DollarSign,
    Filter,
    History,
    Percent,
    Search,
    Siren,
    TicketCheck,
    TicketPercent,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DiscountsIndexProps extends PageProps {
    discounts: PaginatedDiscounts;
    filters: CustomerDiscountFilters;
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

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
    hover: {
        y: -6,
        scale: 1.02,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

const glowAnimation = {
    initial: { boxShadow: '0 0 0 0 rgba(0,0,0,0.1)' },
    hover: {
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
        y: -4,
    },
};

export default function Index({ discounts, filters }: DiscountsIndexProps) {
    const [search, setSearch] = useState('');
    const [type, setType] = useState(filters.type || 'all');
    const [appliesTo, setAppliesTo] = useState(filters.applies_to || 'all');
    const [hasQuota, setHasQuota] = useState(filters.has_quota || false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const isInitialMount = useRef(true);

    const debouncedSearchRef = useRef(
        debounce(
            (
                searchValue: string,
                typeValue: string,
                appliesToValue: string,
                hasQuotaValue: boolean,
            ) => {
                router.get(
                    route('customer.discounts.index'),
                    {
                        search: searchValue || undefined,
                        type: typeValue !== 'all' ? typeValue : undefined,
                        applies_to:
                            appliesToValue !== 'all'
                                ? appliesToValue
                                : undefined,
                        has_quota: hasQuotaValue || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            },
            400,
        ),
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        debouncedSearchRef.current(search, type, appliesTo, hasQuota);

        return () => debouncedSearchRef.current.cancel();
    }, [search, type, appliesTo, hasQuota]);

    const resetFilters = () => {
        setSearch('');
        setType('all');
        setAppliesTo('all');
        setHasQuota(false);
    };

    const getDiscountTypeIcon = (type: string) => {
        return type === 'percentage' ? Percent : DollarSign;
    };

    const getDiscountColor = (discount: Discount) => {
        if (discount.customer_usage && discount.customer_usage.used_count > 0) {
            return 'bg-black text-white font-sm';
        }

        if (!discount.is_available) {
            return 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100';
        }

        if (discount.discount_type === 'percentage') {
            return 'bg-black text-white';
        }

        return 'bg-zinc-800 text-white';
    };

    const getApplicablesText = (discount: Discount) => {
        if (discount.applies_to === 'all') return 'All Services';

        const types = discount.applicables?.map((a) => a.applicable_type);
        if (types?.includes('service')) return 'Specific Services';
        if (types?.includes('category')) return 'Specific Categories';
        if (types?.includes('barber')) return 'Specific Barbers';

        return 'Specific Items';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Available Discounts" />
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-lg"
                                    >
                                        <TicketPercent className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl">
                                            Special Offers
                                        </h1>
                                        <p className="mt-2 text-lg text-zinc-600">
                                            Enjoy various exciting promotions
                                            and discounts for your hair care
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2">
                                        <div className="h-2 w-2 rounded-full bg-black" />
                                        <span className="text-sm font-medium text-zinc-700">
                                            Total
                                        </span>
                                        <span className="text-sm font-bold text-black">
                                            {discounts.total}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-zinc-700">
                                            Available
                                        </span>
                                        <span className="text-sm font-bold text-black">
                                            {
                                                discounts.data.filter(
                                                    (d) => d.is_available,
                                                ).length
                                            }
                                        </span>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex flex-shrink-0 gap-3">
                                <Link
                                    href={route(
                                        'customer.discounts.usage-history',
                                    )}
                                >
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-zinc-300"
                                    >
                                        <History className="mr-2 h-4 w-4" />
                                        Usage History
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                            <CardContent className="p-4 sm:p-6">
                                {/* Desktop Filters */}
                                <div className="hidden lg:block">
                                    <div className="flex flex-row gap-4">
                                        <div className="relative w-full flex-1">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <Input
                                                placeholder="Search discounts..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="pl-10"
                                            />
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileFocus={{ scale: 1.02 }}
                                            className="w-40"
                                        >
                                            <Select
                                                value={type}
                                                onValueChange={(value) =>
                                                    setType(
                                                        value as
                                                            | 'all'
                                                            | 'percentage'
                                                            | 'fixed_amount',
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="border-zinc-300">
                                                    <Percent className="h-4 w-4" />
                                                    <SelectValue placeholder="Discount Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Types
                                                    </SelectItem>
                                                    <SelectItem value="percentage">
                                                        Percentage
                                                    </SelectItem>
                                                    <SelectItem value="fixed_amount">
                                                        Fixed Amount
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileFocus={{ scale: 1.02 }}
                                            className="w-40"
                                        >
                                            <Select
                                                value={appliesTo}
                                                onValueChange={(value) =>
                                                    setAppliesTo(
                                                        value as
                                                            | 'all'
                                                            | 'specific',
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="border-zinc-300">
                                                    <Users className="h-4 w-4" />
                                                    <SelectValue placeholder="Applies To" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="specific">
                                                        Specific
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </motion.div>

                                        <div className="flex gap-3">
                                            <Button
                                                onClick={resetFilters}
                                                variant="outline"
                                                className="rounded-xl border-zinc-300 bg-zinc-900 text-white"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tablet Filters */}
                                <div className="hidden md:block lg:hidden">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative col-span-2">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <Input
                                                placeholder="Search discounts..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select
                                            value={type}
                                            onValueChange={(value) =>
                                                setType(
                                                    value as
                                                        | 'all'
                                                        | 'percentage'
                                                        | 'fixed_amount',
                                                )
                                            }
                                        >
                                            <SelectTrigger className="border-zinc-300">
                                                <Percent className="h-4 w-4" />
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Types
                                                </SelectItem>
                                                <SelectItem value="percentage">
                                                    Percentage
                                                </SelectItem>
                                                <SelectItem value="fixed_amount">
                                                    Fixed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={appliesTo}
                                            onValueChange={(value) =>
                                                setAppliesTo(
                                                    value as 'all' | 'specific',
                                                )
                                            }
                                        >
                                            <SelectTrigger className="border-zinc-300">
                                                <Users className="h-4 w-4" />
                                                <SelectValue placeholder="For" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All
                                                </SelectItem>
                                                <SelectItem value="specific">
                                                    Specific
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="col-span-2 flex gap-3">
                                            <Button
                                                onClick={resetFilters}
                                                variant="outline"
                                                className="rounded-xl border-zinc-300"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Filter Dropdown */}
                                <div className="md:hidden">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="h-12 w-full justify-between rounded-xl border-2 border-zinc-200 bg-white"
                                            onClick={() =>
                                                setIsFilterOpen(!isFilterOpen)
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <Filter className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Filter Discounts
                                                </span>
                                            </div>
                                            <motion.div
                                                animate={{
                                                    rotate: isFilterOpen
                                                        ? 180
                                                        : 0,
                                                }}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>

                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 space-y-3"
                                            >
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                    <Input
                                                        placeholder="Search discounts..."
                                                        value={search}
                                                        onChange={(e) =>
                                                            setSearch(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="pl-10"
                                                    />
                                                </div>

                                                <Select
                                                    value={type}
                                                    onValueChange={(value) =>
                                                        setType(
                                                            value as
                                                                | 'all'
                                                                | 'percentage'
                                                                | 'fixed_amount',
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="border-zinc-300">
                                                        <Percent className="h-4 w-4" />
                                                        <SelectValue placeholder="Discount Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All Types
                                                        </SelectItem>
                                                        <SelectItem value="percentage">
                                                            Percentage
                                                        </SelectItem>
                                                        <SelectItem value="fixed_amount">
                                                            Fixed Amount
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={appliesTo}
                                                    onValueChange={(value) =>
                                                        setAppliesTo(
                                                            value as
                                                                | 'all'
                                                                | 'specific',
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="border-zinc-300">
                                                        <Users className="h-4 w-4" />
                                                        <SelectValue placeholder="Applies To" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All
                                                        </SelectItem>
                                                        <SelectItem value="specific">
                                                            Specific
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={resetFilters}
                                                        variant="outline"
                                                        className="rounded-xl border-zinc-300"
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Discounts Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
                    >
                        <AnimatePresence>
                            {discounts.data.map((discount) => {
                                const DiscountIcon = getDiscountTypeIcon(
                                    discount.discount_type,
                                );
                                return (
                                    <motion.div
                                        key={discount.id}
                                        layout
                                        // @ts-ignore
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        whileHover="hover"
                                        className="group relative"
                                    >
                                        <motion.div
                                            variants={glowAnimation}
                                            className="relative h-auto overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                                        >
                                            {/* Status Badge */}
                                            <div className="absolute right-4 top-4 z-10">
                                                <Badge
                                                    className={`${getDiscountColor(
                                                        discount,
                                                    )} rounded-full border-0 px-3 py-1.5 text-xs font-medium`}
                                                >
                                                    {discount.customer_usage &&
                                                    discount.customer_usage
                                                        .used_count > 0 ? (
                                                        <>
                                                            <motion.div
                                                                animate={{
                                                                    scale: [
                                                                        1, 1.2,
                                                                        1,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                }}
                                                                className="mr-1 h-2 w-2 rounded-full bg-current"
                                                            />
                                                            Used
                                                        </>
                                                    ) : discount.is_available ? (
                                                        <>
                                                            <TicketCheck className="mr-1 h-3 w-3" />
                                                            Available
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            Unavailable
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>

                                            <div className="p-4 sm:p-6">
                                                {/* Mobile Layout */}
                                                <div className="block space-y-4 lg:hidden">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    rotate: 5,
                                                                }}
                                                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white"
                                                            >
                                                                <DiscountIcon className="h-5 w-5" />
                                                            </motion.div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="truncate text-lg font-black text-black">
                                                                    {
                                                                        discount.name
                                                                    }
                                                                </h3>
                                                                {discount.code && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="mt-1 border-zinc-300 bg-white font-mono text-xs"
                                                                    >
                                                                        {
                                                                            discount.code
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Discount Value */}
                                                    <div className="text-center">
                                                        <motion.p className="text-2xl font-black text-black">
                                                            {discount.discount_type ===
                                                            'percentage'
                                                                ? `${discount.discount_value}%`
                                                                : `Rp ${discount.discount_value.toLocaleString('id-ID')}`}
                                                        </motion.p>
                                                        <p className="text-sm text-zinc-600">
                                                            {discount.discount_type ===
                                                            'percentage'
                                                                ? 'OFF'
                                                                : 'DISCOUNT'}
                                                        </p>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-zinc-500">
                                                                PERIOD
                                                            </p>
                                                            <p className="text-xs text-zinc-700">
                                                                {format(
                                                                    new Date(
                                                                        discount.start_date,
                                                                    ),
                                                                    'dd MMM',
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}{' '}
                                                                -{' '}
                                                                {format(
                                                                    new Date(
                                                                        discount.end_date,
                                                                    ),
                                                                    'dd MMM',
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-zinc-500">
                                                                FOR
                                                            </p>
                                                            <p className="text-xs text-zinc-700">
                                                                {getApplicablesText(
                                                                    discount,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="pt-2">
                                                        <Link
                                                            href={route(
                                                                'customer.discounts.show',
                                                                discount.id,
                                                            )}
                                                        >
                                                            <Button
                                                                className="w-full rounded-xl bg-black hover:bg-zinc-800"
                                                                disabled={
                                                                    !discount.is_available
                                                                }
                                                            >
                                                                {discount.is_available ? (
                                                                    <>
                                                                        <CircleCheckBig className="mr-2 h-4 w-4" />
                                                                        Use Now
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock className="mr-2 h-4 w-4" />
                                                                        Expired
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Desktop/Tablet Layout */}
                                                <div className="hidden space-y-4 lg:block">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex min-w-0 flex-1 items-start gap-4">
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    rotate: 5,
                                                                }}
                                                                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-white"
                                                            >
                                                                <DiscountIcon className="h-6 w-6" />
                                                            </motion.div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="truncate text-xl font-black text-black group-hover:underline">
                                                                    {
                                                                        discount.name
                                                                    }
                                                                </h3>
                                                                {discount.code && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="mt-2 border-zinc-300 bg-white font-mono text-xs"
                                                                    >
                                                                        {
                                                                            discount.code
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Discount Value */}
                                                    <div className="text-center">
                                                        <motion.p className="text-3xl font-black text-black">
                                                            {discount.discount_type ===
                                                            'percentage'
                                                                ? `${discount.discount_value}%`
                                                                : `Rp ${discount.discount_value.toLocaleString('id-ID')}`}
                                                        </motion.p>
                                                        <p className="text-sm text-zinc-600">
                                                            {discount.discount_type ===
                                                            'percentage'
                                                                ? 'OFF'
                                                                : 'DISCOUNT'}
                                                        </p>
                                                    </div>

                                                    {/* Description */}
                                                    {discount.description && (
                                                        <p className="line-clamp-2 text-center text-sm text-zinc-600">
                                                            {
                                                                discount.description
                                                            }
                                                        </p>
                                                    )}

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-zinc-400" />
                                                                <span className="font-medium">
                                                                    Valid
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-zinc-600">
                                                                {format(
                                                                    new Date(
                                                                        discount.start_date,
                                                                    ),
                                                                    'dd MMM yyyy',
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}{' '}
                                                                -{' '}
                                                                {format(
                                                                    new Date(
                                                                        discount.end_date,
                                                                    ),
                                                                    'dd MMM yyyy',
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-zinc-400" />
                                                                <span className="font-medium">
                                                                    For
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-zinc-600">
                                                                {getApplicablesText(
                                                                    discount,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Conditions */}
                                                    <div className="space-y-2">
                                                        {discount.min_order_amount && (
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-zinc-500">
                                                                    Min. Order
                                                                </span>
                                                                <span className="font-semibold">
                                                                    Rp{' '}
                                                                    {discount.min_order_amount.toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {discount.remaining_quota !==
                                                            null && (
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-zinc-500">
                                                                    Remaining
                                                                    Quota
                                                                </span>
                                                                <span className="font-semibold">
                                                                    {
                                                                        discount.remaining_quota
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {discount.usage_limit && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-zinc-500">
                                                                    Usage
                                                                    Progress
                                                                </span>
                                                                <span>
                                                                    {
                                                                        discount.used_count
                                                                    }
                                                                    /
                                                                    {
                                                                        discount.usage_limit
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                                                                <motion.div
                                                                    initial={{
                                                                        width: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: `${(discount.used_count / discount.usage_limit) * 100}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        delay: 0.5,
                                                                    }}
                                                                    className="h-full rounded-full bg-black"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <div className="pt-2">
                                                        <Link
                                                            href={route(
                                                                'customer.discounts.show',
                                                                discount.id,
                                                            )}
                                                        >
                                                            <Button
                                                                className="w-full rounded-xl bg-black hover:bg-zinc-800"
                                                                disabled={
                                                                    !discount.is_available
                                                                }
                                                            >
                                                                {discount.is_available ? (
                                                                    <>
                                                                        <CircleCheckBig className="mr-2 h-4 w-4" />
                                                                        Use Now
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock className="mr-2 h-4 w-4" />
                                                                        Not
                                                                        Available
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Tablet Layout */}
                                                <div className="hidden space-y-4 md:block lg:hidden">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-1 items-start gap-3">
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    rotate: 5,
                                                                }}
                                                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white"
                                                            >
                                                                <DiscountIcon className="h-5 w-5" />
                                                            </motion.div>
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-black text-black">
                                                                    {
                                                                        discount.name
                                                                    }
                                                                </h3>
                                                                {discount.code && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="mt-1 border-zinc-300 bg-white font-mono text-xs"
                                                                    >
                                                                        {
                                                                            discount.code
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="text-center">
                                                            <motion.p className="text-2xl font-black text-black">
                                                                {discount.discount_type ===
                                                                'percentage'
                                                                    ? `${discount.discount_value}%`
                                                                    : `Rp ${discount.discount_value.toLocaleString('id-ID')}`}
                                                            </motion.p>
                                                            <p className="text-sm text-zinc-600">
                                                                {discount.discount_type ===
                                                                'percentage'
                                                                    ? 'OFF'
                                                                    : 'DISCOUNT'}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-4 w-4 text-zinc-400" />
                                                                <span className="text-zinc-600">
                                                                    {format(
                                                                        new Date(
                                                                            discount.start_date,
                                                                        ),
                                                                        'dd MMM',
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {format(
                                                                        new Date(
                                                                            discount.end_date,
                                                                        ),
                                                                        'dd MMM',
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Users className="h-4 w-4 text-zinc-400" />
                                                                <span className="text-zinc-600">
                                                                    {getApplicablesText(
                                                                        discount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <Link
                                                            href={route(
                                                                'customer.discounts.show',
                                                                discount.id,
                                                            )}
                                                        >
                                                            <Button
                                                                className="w-full rounded-xl bg-black hover:bg-zinc-800"
                                                                disabled={
                                                                    !discount.is_available
                                                                }
                                                            >
                                                                {discount.is_available ? (
                                                                    <>
                                                                        <CircleCheckBig className="mr-2 h-4 w-4" />
                                                                        Use Now
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock className="mr-2 h-4 w-4" />
                                                                        Not
                                                                        Available
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {discounts.data.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-16 text-center"
                        >
                            <motion.div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
                                <Siren className="h-10 w-10 text-zinc-400" />
                            </motion.div>
                            <h3 className="mb-3 text-xl font-black text-black">
                                No Discounts Available
                            </h3>
                            <p className="mb-6 text-zinc-600">
                                {search || type !== 'all' || appliesTo !== 'all'
                                    ? 'Try changing your search filters'
                                    : 'Please check back later'}
                            </p>
                            <Button
                                onClick={resetFilters}
                                variant="outline"
                                className="rounded-xl border-zinc-300"
                            >
                                Reset Filters
                            </Button>
                        </motion.div>
                    )}

                    {/* Load More */}
                    {discounts.current_page < discounts.last_page && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 text-center"
                        >
                            <Button
                                onClick={() =>
                                    router.get(
                                        route('customer.discounts.index', {
                                            page: discounts.current_page + 1,
                                        }),
                                    )
                                }
                                variant="outline"
                                className="rounded-xl border-zinc-300"
                            >
                                Load More Discounts
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
