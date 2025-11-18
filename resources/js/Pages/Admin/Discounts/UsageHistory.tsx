import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Discount,
    DiscountUsageFilters,
    PageProps,
    PaginatedDiscountUsages,
    User,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    DollarSign,
    Filter,
    Gift,
    Package,
    Scissors,
    User as UserIcon,
} from 'lucide-react';

interface UsageHistoryProps extends PageProps {
    usages: PaginatedDiscountUsages;
    discount?: Discount;
    customers: User[];
    discounts: Discount[];
    filters: DiscountUsageFilters;
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function UsageHistory({
    usages,
    discount,
    customers,
    discounts,
    filters,
}: UsageHistoryProps) {
    const { data, setData, get } = useForm({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        customer_id: filters.customer_id || '',
    });

    const handleFilter = () => {
        const routeName = discount
            ? 'admin.discounts.discount-usage-history'
            : 'admin.discounts.usage-history';

        const routeParams = discount
            ? { discount: discount.id, ...data }
            : data;

        get(route(routeName, routeParams), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setData({
            date_from: '',
            date_to: '',
            customer_id: '',
        });

        const routeName = discount
            ? 'admin.discounts.discount-usage-history'
            : 'admin.discounts.usage-history';

        const routeParams = discount ? { discount: discount.id } : {};

        get(route(routeName, routeParams), {
            preserveState: true,
        });
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
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stats = [
        {
            label: 'Total Uses',
            value: usages.total,
            icon: BarChart3,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Total Discount Given',
            value: formatCurrency(
                usages.data.reduce(
                    (sum, usage) => sum + usage.discount_amount,
                    0,
                ),
            ),
            icon: Gift,
            color: 'from-emerald-500 to-green-500',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(
                usages.data.reduce((sum, usage) => sum + usage.final_amount, 0),
            ),
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: 'Avg Discount',
            value: formatCurrency(
                usages.data.length > 0
                    ? usages.data.reduce(
                          (sum, usage) => sum + usage.discount_amount,
                          0,
                      ) / usages.data.length
                    : 0,
            ),
            icon: Package,
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head
                title={
                    discount
                        ? `Usage History - ${discount.name}`
                        : 'Discount Usage History'
                }
            />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.get(
                                            discount
                                                ? route(
                                                      'admin.discounts.show',
                                                      discount.id,
                                                  )
                                                : route(
                                                      'admin.discounts.index',
                                                  ),
                                        )
                                    }
                                    className="border-zinc-300"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                                        {discount
                                            ? `Usage History - ${discount.name}`
                                            : 'Discount Usage History'}
                                    </h1>
                                    <p className="mt-2 text-zinc-600">
                                        Track how discounts are being used by
                                        customers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    {!discount && (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
                        >
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div key={index} variants={fadeInUp}>
                                        <Card className="overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                            <CardContent className="px-4 py-4 sm:px-4 sm:py-4 lg:py-5">
                                                <div className="flex flex-row items-center gap-3 sm:flex-row sm:items-center sm:gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${stat.color}`}
                                                    >
                                                        <Icon className="h-5 w-5 text-white sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-zinc-500 sm:text-base">
                                                            {stat.label}
                                                        </p>
                                                        <p className="text-xl font-bold text-black sm:text-xl lg:text-2xl">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                                        {/* Date From */}
                                        <div className="min-w-[150px]">
                                            <Label
                                                htmlFor="date_from"
                                                className="mb-2 block text-sm font-medium text-zinc-700"
                                            >
                                                From Date
                                            </Label>
                                            <Input
                                                id="date_from"
                                                type="date"
                                                value={data.date_from}
                                                onChange={(e) =>
                                                    setData(
                                                        'date_from',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-zinc-200 focus:border-black focus:ring-black"
                                            />
                                        </div>

                                        {/* Date To */}
                                        <div className="min-w-[150px]">
                                            <Label
                                                htmlFor="date_to"
                                                className="mb-2 block text-sm font-medium text-zinc-700"
                                            >
                                                To Date
                                            </Label>
                                            <Input
                                                id="date_to"
                                                type="date"
                                                value={data.date_to}
                                                onChange={(e) =>
                                                    setData(
                                                        'date_to',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-zinc-200 focus:border-black focus:ring-black"
                                            />
                                        </div>

                                        {/* Customer Filter */}
                                        {!discount && (
                                            <div className="min-w-[200px]">
                                                <Label
                                                    htmlFor="customer_id"
                                                    className="mb-2 block text-sm font-medium text-zinc-700"
                                                >
                                                    Customer
                                                </Label>
                                                <Select
                                                    value={data.customer_id}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'customer_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="border-zinc-200 focus:ring-black">
                                                        <SelectValue placeholder="All Customers" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All Customers
                                                        </SelectItem>
                                                        {customers.map(
                                                            (customer) => (
                                                                <SelectItem
                                                                    key={
                                                                        customer.id
                                                                    }
                                                                    value={customer.id.toString()}
                                                                >
                                                                    {
                                                                        customer.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Discount Filter */}
                                            <div className="min-w-[200px]">
                                                <Label
                                                    htmlFor="discount_id"
                                                    className="mb-2 block text-sm font-medium text-zinc-700"
                                                >
                                                    Discount
                                                </Label>
                                                <Select
                                                    value={
                                                        discount?.id.toString() ||
                                                        'all'
                                                    }
                                                    onValueChange={(value) => {
                                                        if (value === 'all') {
                                                            router.get(
                                                                route(
                                                                    'admin.discounts.usage-history',
                                                                ),
                                                            );
                                                        } else if (value) {
                                                            router.get(
                                                                route(
                                                                    'admin.discounts.discount-usage-history',
                                                                    value,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="border-zinc-200 focus:ring-black">
                                                        <SelectValue placeholder="All Discounts" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All Discounts
                                                        </SelectItem>
                                                        {discounts.map(
                                                            (disc) => (
                                                                <SelectItem
                                                                    key={
                                                                        disc.id
                                                                    }
                                                                    value={disc.id.toString()}
                                                                >
                                                                    {disc.name}{' '}
                                                                    ({disc.code}
                                                                    )
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleFilter}
                                            className="h-10 bg-black px-4 text-white hover:bg-zinc-800"
                                        >
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply
                                        </Button>
                                        <Button
                                            onClick={resetFilters}
                                            variant="outline"
                                            className="h-10 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Usage History */}
                    {usages.data.length > 0 ? (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="space-y-4"
                        >
                            {usages.data.map((usage, index) => (
                                <motion.div
                                    key={usage.id}
                                    variants={fadeInUp}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex flex-1 items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700">
                                                        <Gift className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            {!discount && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-zinc-300 text-zinc-700"
                                                                >
                                                                    {usage
                                                                        .discount
                                                                        ?.code ||
                                                                        'No Code'}
                                                                </Badge>
                                                            )}
                                                            <Badge
                                                                variant="default"
                                                                className="bg-emerald-500 text-white"
                                                            >
                                                                Used
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <UserIcon className="h-4 w-4 text-zinc-500" />
                                                                <span className="font-medium text-black">
                                                                    {usage
                                                                        .customer
                                                                        ?.name ||
                                                                        'Unknown Customer'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Scissors className="h-4 w-4 text-zinc-500" />
                                                                <span className="text-zinc-700">
                                                                    {usage
                                                                        .booking
                                                                        ?.service
                                                                        ?.name ||
                                                                        'Unknown Service'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <UserIcon className="h-4 w-4 text-zinc-500" />
                                                                <span className="text-zinc-700">
                                                                    {usage
                                                                        .booking
                                                                        ?.barber
                                                                        ?.name ||
                                                                        'Unknown Barber'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-4 w-4 text-zinc-500" />
                                                                <span className="text-zinc-700">
                                                                    {formatDate(
                                                                        usage.used_at,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-zinc-500">
                                                            Original Amount
                                                        </div>
                                                        <div className="text-lg font-bold text-black">
                                                            {formatCurrency(
                                                                usage.original_amount,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-zinc-500">
                                                            Discount
                                                        </div>
                                                        <div className="text-lg font-bold text-emerald-600">
                                                            -
                                                            {formatCurrency(
                                                                usage.discount_amount,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-zinc-500">
                                                            Final Amount
                                                        </div>
                                                        <div className="text-xl font-bold text-black">
                                                            {formatCurrency(
                                                                usage.final_amount,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        Used on{' '}
                                                        {formatDateTime(
                                                            usage.used_at,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="py-20 text-center"
                        >
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100">
                                <BarChart3 className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-black">
                                No usage history found
                            </h3>
                            <p className="mx-auto mb-8 max-w-md text-zinc-600">
                                {discount
                                    ? `No customers have used ${discount.name} yet`
                                    : 'No discount usage records found for the selected filters'}
                            </p>
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {usages.data.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex items-center justify-between"
                        >
                            <div className="text-sm text-zinc-600">
                                Showing {usages.data.length} of {usages.total}{' '}
                                records
                            </div>
                            <div className="flex gap-2">
                                {usages.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const routeName = discount
                                                ? 'admin.discounts.discount-usage-history'
                                                : 'admin.discounts.usage-history';
                                            const routeParams = discount
                                                ? {
                                                      discount: discount.id,
                                                      ...data,
                                                      page:
                                                          usages.current_page -
                                                          1,
                                                  }
                                                : {
                                                      ...data,
                                                      page:
                                                          usages.current_page -
                                                          1,
                                                  };
                                            get(route(routeName, routeParams));
                                        }}
                                        className="border-zinc-300"
                                    >
                                        Previous
                                    </Button>
                                )}
                                {usages.current_page < usages.last_page && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const routeName = discount
                                                ? 'admin.discounts.discount-usage-history'
                                                : 'admin.discounts.usage-history';
                                            const routeParams = discount
                                                ? {
                                                      discount: discount.id,
                                                      ...data,
                                                      page:
                                                          usages.current_page +
                                                          1,
                                                  }
                                                : {
                                                      ...data,
                                                      page:
                                                          usages.current_page +
                                                          1,
                                                  };
                                            get(route(routeName, routeParams));
                                        }}
                                        className="border-zinc-300"
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
