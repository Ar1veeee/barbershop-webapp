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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Discount,
    DiscountFilters,
    DiscountStatus,
    PageProps,
    PaginatedDiscounts,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    CircleCheckBig,
    Clock,
    Edit,
    Eye,
    Gift,
    History,
    Package,
    Plus,
    Search,
    Tag,
    Tags,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DiscountsIndexProps extends PageProps {
    discounts: PaginatedDiscounts;
    filters: DiscountFilters;
}

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
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
            delayChildren: 0.15,
        },
    },
};

const cardHover: Variants = {
    initial: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -6,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
};

const floatingAnimation: Variants = {
    float: {
        y: [-4, 4],
        transition: {
            y: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 2,
                ease: 'easeInOut',
            },
        },
    },
};

export default function Index({ discounts, filters }: DiscountsIndexProps) {
    const [deleteDiscount, setDeleteDiscount] = useState<Discount | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const { data, setData, get } = useForm<
        Pick<
            DiscountFilters,
            'search' | 'status' | 'discount_type' | 'applies_to'
        >
    >({
        search: filters.search || '',
        status: filters.status || 'all',
        discount_type: filters.discount_type || 'all',
        applies_to: filters.applies_to || 'all',
    });

    const handleFilter = useCallback(() => {
        get(route('admin.discounts.index', data), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [data, get]);

    const debouncedSearch = useCallback(
        debounce(() => handleFilter(), 400),
        [handleFilter],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [data.search, debouncedSearch]);

    useEffect(() => {
        if (!isInitialMount.current) handleFilter();
    }, [data.status, data.discount_type, data.applies_to, handleFilter]);

    const resetFilters = () => {
        setData({
            search: '',
            status: 'all',
            discount_type: 'all',
            applies_to: 'all',
        });
        get(route('admin.discounts.index'), {
            preserveState: true,
        });
    };

    const handleStatusToggle = (discount: Discount) => {
        router.post(route('admin.discounts.toggle-status', discount.id), {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (deleteDiscount) {
            router.delete(route('admin.discounts.destroy', deleteDiscount.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteDiscount(null),
            });
        }
    };

    const stats = [
        {
            label: 'Total Discounts',
            value: discounts.total,
            icon: Tag,
            color: 'from-black to-gray-800',
            trend: 'stable' as const,
        },
        {
            label: 'Active Now',
            value: discounts.data.filter((d) => (d.is_active ? 'active' : ''))
                .length,
            icon: CircleCheckBig,
            color: 'from-black to-gray-800',
            trend: 'up' as const,
        },
        {
            label: 'Total Usage',
            value: discounts.data.reduce(
                (sum, discount) => sum + discount.used_count,
                0,
            ),
            icon: TrendingUp,
            color: 'from-black to-gray-800',
            trend: 'up' as const,
        },
        {
            label: 'Usage Rate',
            value: `${Math.round(
                discounts.data.reduce((sum, discount) => {
                    if (!discount.usage_limit) return sum;
                    return (
                        sum + (discount.used_count / discount.usage_limit) * 100
                    );
                }, 0) /
                    (discounts.data.filter((d) => d.usage_limit).length || 1),
            )}%`,
            icon: BarChart3,
            color: 'from-black to-gray-800',
            trend: 'stable' as const,
        },
    ];

    const getStatusBadge = (discount: Discount) => {
        let status: DiscountStatus;

        if (!discount.is_active) {
            status = 'inactive';
        } else {
            const now = new Date();
            const startDate = new Date(discount.start_date);
            const endDate = new Date(discount.end_date);

            if (now < startDate) {
                status = 'upcoming';
            } else if (now > endDate) {
                status = 'expired';
            } else {
                status = 'active';
            }
        }

        const statusConfig = {
            active: {
                label: 'Active',
                variant: 'default' as const,
                className: 'bg-black text-white border-black',
                icon: CircleCheckBig,
            },
            upcoming: {
                label: 'Soon',
                variant: 'secondary' as const,
                className: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: Clock,
            },
            expired: {
                label: 'Ended',
                variant: 'outline' as const,
                className: 'border-gray-300 text-gray-500',
                icon: Calendar,
            },
            inactive: {
                label: 'Deactivate',
                variant: 'outline' as const,
                className: 'border-gray-200 text-gray-400',
                icon: AlertCircle,
            },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <Badge
                variant={config.variant}
                className={`gap-1 text-xs font-medium ${config.className}`}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getDiscountTypeBadge = (type: string) => {
        return (
            <Badge
                variant="outline"
                className="border-gray-300 font-mono text-xs text-gray-700"
            >
                {type === 'percentage' ? '% OFF' : 'FIXED'}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
    };

    // Mobile Action Buttons Component
    const MobileActionButtons = ({ discount }: { discount: Discount }) => (
        <div className="flex items-center justify-between gap-1">
            <div className="flex gap-1">
                {/* View Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() =>
                            router.get(
                                route('admin.discounts.show', discount.id),
                            )
                        }
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 border-gray-300 p-0"
                        title="View Details"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                </motion.div>

                {/* Edit Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() =>
                            router.get(
                                route('admin.discounts.edit', discount.id),
                            )
                        }
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 border-gray-300 p-0"
                        title="Edit Discount"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                </motion.div>

                {/* History Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() =>
                            router.get(
                                route(
                                    'admin.discounts.discount-usage-history',
                                    discount.id,
                                ),
                            )
                        }
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 border-gray-300 p-0"
                        title="Usage History"
                    >
                        <History className="h-3.5 w-3.5" />
                    </Button>
                </motion.div>
            </div>

            <div className="flex gap-1">
                {/* Status Toggle Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() => handleStatusToggle(discount)}
                        variant={discount.is_active ? 'outline' : 'default'}
                        size="sm"
                        className={`h-8 px-2 ${
                            discount.is_active
                                ? 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        title={
                            discount.is_active
                                ? 'Pause Discount'
                                : 'Activate Discount'
                        }
                    >
                        {discount.is_active ? 'Pause' : 'Activate'}
                    </Button>
                </motion.div>

                {/* Delete Button */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={() => setDeleteDiscount(discount)}
                        variant="outline"
                        size="sm"
                        disabled={discount.used_count > 0}
                        className={`h-8 w-8 border-2 p-0 transition-all ${
                            discount.used_count > 0
                                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                : 'border-red-300 text-red-600 hover:border-red-600 hover:bg-red-50'
                        }`}
                        title={
                            discount.used_count > 0
                                ? `Cannot delete discount with ${discount.used_count} usage(s)`
                                : 'Delete discount'
                        }
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </motion.div>
            </div>
        </div>
    );

    // Desktop Action Buttons Component
    const DesktopActionButtons = ({ discount }: { discount: Discount }) => (
        <div className="flex flex-wrap gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() =>
                        router.get(route('admin.discounts.show', discount.id))
                    }
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="ml-1.5">View</span>
                </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() =>
                        router.get(route('admin.discounts.edit', discount.id))
                    }
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="ml-1.5">Edit</span>
                </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() =>
                        router.get(
                            route(
                                'admin.discounts.discount-usage-history',
                                discount.id,
                            ),
                        )
                    }
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                >
                    <History className="h-3.5 w-3.5" />
                    <span className="ml-1.5">History</span>
                </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() => handleStatusToggle(discount)}
                    variant={discount.is_active ? 'outline' : 'default'}
                    size="sm"
                    className={
                        discount.is_active
                            ? 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                            : 'bg-black text-white hover:bg-gray-800'
                    }
                >
                    {discount.is_active ? 'Pause' : 'Activate'}
                </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() => setDeleteDiscount(discount)}
                    variant="outline"
                    size="sm"
                    disabled={discount.used_count > 0}
                    className={`border-2 transition-all ${
                        discount.used_count > 0
                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            : 'border-red-300 text-red-600 hover:border-red-600 hover:bg-red-50'
                    }`}
                    title={
                        discount.used_count > 0
                            ? `Cannot delete discount with ${discount.used_count} usage(s)`
                            : 'Delete discount'
                    }
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </motion.div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Discounts Management" />

            <div className="min-h-screen bg-white py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <motion.div
                                    className="mb-2 flex items-center gap-3"
                                    animate="float"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black sm:h-10 sm:w-10">
                                        <Tags className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">
                                        Discounts
                                    </h1>
                                </motion.div>
                                <p className="text-sm text-gray-600 sm:text-base">
                                    Create and manage promotional campaigns
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial="initial"
                                animate="glow"
                            >
                                <Button
                                    onClick={() =>
                                        router.get(
                                            route('admin.discounts.create'),
                                        )
                                    }
                                    className="h-10 bg-black px-4 font-semibold text-white shadow-sm hover:bg-gray-800 sm:h-12 sm:px-6"
                                >
                                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">
                                        New Discount
                                    </span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
                    >
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <motion.div whileHover={{ y: -2 }}>
                                        <Card className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md">
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} sm:h-10 sm:w-10`}
                                                    >
                                                        <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-gray-500 sm:text-sm">
                                                            {stat.label}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-lg font-bold text-black sm:text-xl">
                                                                {stat.value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 sm:mb-6"
                    >
                        <Card className="border-gray-200 shadow-sm">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-row lg:items-center lg:gap-4">
                                        {/* Search */}
                                        <div className="lg:min-w-[240px] lg:flex-1">
                                            <motion.div
                                                animate={{
                                                    scale: searchFocused
                                                        ? 1.02
                                                        : 1,
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                                    <Input
                                                        placeholder="Search discounts..."
                                                        value={data.search}
                                                        onChange={(e) =>
                                                            setData(
                                                                'search',
                                                                e.target.value,
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            setSearchFocused(
                                                                true,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setSearchFocused(
                                                                false,
                                                            )
                                                        }
                                                        onKeyUp={(e) =>
                                                            e.key === 'Enter' &&
                                                            handleFilter()
                                                        }
                                                        className="h-10 border-gray-300 pl-10 focus:border-black focus:ring-black"
                                                    />
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="lg:min-w-[140px]">
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'status',
                                                        value as DiscountFilters['status'],
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-10 border-gray-300 focus:ring-black">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Status
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="upcoming">
                                                        Upcoming
                                                    </SelectItem>
                                                    <SelectItem value="expired">
                                                        Expired
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Type Filter */}
                                        <div className="lg:min-w-[140px]">
                                            <Select
                                                value={data.discount_type}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'discount_type',
                                                        value as DiscountFilters['discount_type'],
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-10 border-gray-300 focus:ring-black">
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
                                                        Fixed Amount
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={resetFilters}
                                            variant="outline"
                                            className="h-10 border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                                        >
                                            <span className="hidden sm:inline">
                                                Reset
                                            </span>
                                            <span className="sm:hidden">
                                                Clear
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Discounts Grid */}
                    <AnimatePresence mode="wait">
                        {discounts.data.length > 0 ? (
                            <motion.div
                                key="discounts-grid"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                            >
                                {discounts.data.map((discount) => (
                                    <motion.div
                                        key={discount.id}
                                        variants={fadeInUp}
                                        layout
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <motion.div
                                            variants={cardHover}
                                            initial="initial"
                                            whileHover="hover"
                                            className="h-full"
                                        >
                                            <Card className="group relative h-full overflow-hidden border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl">
                                                {/* Accent Border */}
                                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-black to-gray-600" />

                                                <CardHeader className="relative pb-3 pl-6 pr-4 pt-4 sm:pb-4 sm:pl-8">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            <motion.div
                                                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-black to-gray-800 sm:h-12 sm:w-12"
                                                                whileHover={{
                                                                    rotate: [
                                                                        0, -5,
                                                                        5, 0,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 0.5,
                                                                }}
                                                            >
                                                                <Tag className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                                            </motion.div>
                                                            <div className="min-w-0 flex-1">
                                                                <CardTitle className="mb-1 truncate text-base font-bold text-black group-hover:underline sm:text-lg">
                                                                    {
                                                                        discount.name
                                                                    }
                                                                </CardTitle>
                                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                                    {getStatusBadge(
                                                                        discount,
                                                                    )}
                                                                    {getDiscountTypeBadge(
                                                                        discount.discount_type,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <motion.div
                                                                className="text-xl font-bold text-black sm:text-2xl"
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 400,
                                                                }}
                                                            >
                                                                {discount.discount_type ===
                                                                'percentage'
                                                                    ? `${discount.discount_value}%`
                                                                    : formatCurrency(
                                                                          discount.discount_value,
                                                                      )}
                                                            </motion.div>
                                                            {discount.code && (
                                                                <div className="font-mono text-xs text-gray-500 sm:text-sm">
                                                                    {
                                                                        discount.code
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="relative pb-4 pl-6 pr-4 pt-0 sm:pl-8">
                                                    {/* Description */}
                                                    <p className="mb-3 line-clamp-2 min-h-[40px] text-sm text-gray-600">
                                                        {discount.description ||
                                                            'No description available'}
                                                    </p>

                                                    {/* Usage Progress */}
                                                    {/* Progress Bar */}
                                                    {discount.usage_limit && (
                                                        <div className="mb-3 space-y-1">
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

                                                    {/* Discount Details */}
                                                    <div className="mb-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Calendar className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                                            <span className="text-xs sm:text-sm">
                                                                {formatDate(
                                                                    discount.start_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Calendar className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                                            <span className="text-xs sm:text-sm">
                                                                {formatDate(
                                                                    discount.end_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                        {discount.min_order_amount && (
                                                            <div className="col-span-2 flex items-center gap-2 text-gray-600 sm:col-span-1">
                                                                <Package className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                                                <span className="text-xs sm:text-sm">
                                                                    Min:{' '}
                                                                    {formatCurrency(
                                                                        discount.min_order_amount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {discount.max_discount_amount && (
                                                            <div className="col-span-2 flex items-center gap-2 text-gray-600 sm:col-span-1">
                                                                <Gift className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                                                <span className="text-xs sm:text-sm">
                                                                    Max:{' '}
                                                                    {formatCurrency(
                                                                        discount.max_discount_amount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Applicable Items */}
                                                    {discount.applicables &&
                                                        discount.applicables
                                                            .length > 0 && (
                                                            <div className="mb-3">
                                                                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-700">
                                                                    <Users className="h-3 w-3" />
                                                                    Applies to:
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {discount.applicables
                                                                        .slice(
                                                                            0,
                                                                            isMobile
                                                                                ? 2
                                                                                : 3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                applicable,
                                                                                index,
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    variant="outline"
                                                                                    className="border-gray-300 text-xs text-gray-600"
                                                                                >
                                                                                    {
                                                                                        applicable.name
                                                                                    }
                                                                                </Badge>
                                                                            ),
                                                                        )}
                                                                    {discount
                                                                        .applicables
                                                                        .length >
                                                                        (isMobile
                                                                            ? 2
                                                                            : 3) && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="border-gray-300 text-xs text-gray-600"
                                                                        >
                                                                            +
                                                                            {discount
                                                                                .applicables
                                                                                .length -
                                                                                (isMobile
                                                                                    ? 2
                                                                                    : 3)}{' '}
                                                                            more
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Actions */}
                                                    <div className="border-t border-gray-100 pt-3">
                                                        {/* Desktop Actions */}
                                                        <div className="hidden sm:block">
                                                            <DesktopActionButtons
                                                                discount={
                                                                    discount
                                                                }
                                                            />
                                                        </div>

                                                        {/* Mobile Actions */}
                                                        <div className="sm:hidden">
                                                            <MobileActionButtons
                                                                discount={
                                                                    discount
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: 0.3 }}
                                className="py-12 text-center sm:py-20"
                            >
                                <motion.div
                                    className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:mb-6 sm:h-24 sm:w-24"
                                    variants={floatingAnimation}
                                    animate="float"
                                >
                                    <Gift className="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                                </motion.div>
                                <h3 className="mb-2 text-xl font-bold text-black sm:text-2xl">
                                    No discounts yet
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-sm text-gray-600 sm:mb-8 sm:text-base">
                                    Start creating promotional discounts to
                                    attract more customers
                                </p>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() =>
                                            router.get(
                                                route('admin.discounts.create'),
                                            )
                                        }
                                        className="h-10 bg-black px-6 font-semibold text-white hover:bg-gray-800 sm:h-12 sm:px-8"
                                    >
                                        <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Create First Discount
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {discounts.data.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
                        >
                            <div className="text-sm text-gray-600">
                                Showing {discounts.data.length} of{' '}
                                {discounts.total} discounts
                            </div>
                            <div className="flex gap-2">
                                {discounts.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            get(discounts.prev_page_url!)
                                        }
                                        className="border-gray-300 hover:border-black"
                                    >
                                        Previous
                                    </Button>
                                )}
                                {discounts.has_more_pages && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            get(discounts.next_page_url!)
                                        }
                                        className="border-gray-300 hover:border-black"
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Delete Confirmation */}
                    <AlertDialog
                        open={!!deleteDiscount}
                        onOpenChange={() => setDeleteDiscount(null)}
                    >
                        <AlertDialogContent className="border-gray-200">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-black sm:text-2xl">
                                        <AlertCircle className="h-5 w-5 text-red-600 sm:h-6 sm:w-6" />
                                        Delete Discount
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="leading-relaxed text-gray-600">
                                        Are you sure you want to delete{' '}
                                        <strong className="text-black">
                                            {deleteDiscount?.name}
                                        </strong>
                                        ?
                                        {deleteDiscount &&
                                        deleteDiscount.used_count > 0 ? (
                                            <span className="mt-2 block text-sm font-medium text-red-600">
                                                ⚠️ This discount has been used{' '}
                                                {deleteDiscount.used_count}{' '}
                                                time(s) and cannot be deleted.
                                            </span>
                                        ) : (
                                            <span className="mt-2 block text-sm">
                                                This action cannot be undone.
                                            </span>
                                        )}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4 sm:mt-6">
                                    <AlertDialogCancel className="border-2 border-gray-300 font-semibold hover:bg-gray-50">
                                        Cancel
                                    </AlertDialogCancel>
                                    {deleteDiscount &&
                                        deleteDiscount.used_count === 0 && (
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-red-600 font-semibold text-white hover:bg-red-700"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Discount
                                            </AlertDialogAction>
                                        )}
                                </AlertDialogFooter>
                            </motion.div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
