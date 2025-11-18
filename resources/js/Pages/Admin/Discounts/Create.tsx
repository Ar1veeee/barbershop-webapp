import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    ApplicableType,
    PageProps,
    Service,
    ServiceCategory,
    User,
} from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BadgeInfo,
    Bolt,
    Calendar,
    Check,
    LoaderCircle,
    Plus,
    Settings2,
    TicketPercent,
    Trash2,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';

interface CreateProps extends PageProps {
    services: Service[];
    categories: ServiceCategory[];
    barbers: User[];
}

interface ApplicableItem {
    type: ApplicableType;
    id: number;
    name: string;
}

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

const glowEffect = {
    initial: { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
    glow: {
        boxShadow: [
            '0 0 0 0 rgba(0,0,0,0)',
            '0 0 0 4px rgba(0,0,0,0.1)',
            '0 0 0 0 rgba(0,0,0,0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
        },
    },
};

export default function Create({ services, categories, barbers }: CreateProps) {
    const [applicable, setApplicable] = useState<ApplicableItem[]>([]);
    const [selectedType, setSelectedType] = useState<ApplicableType>('service');
    const [selectedId, setSelectedId] = useState<number | ''>('');
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed_amount',
        discount_value: 0,
        max_discount_amount: null as number | null,
        min_order_amount: null as number | null,
        start_date: '',
        end_date: '',
        usage_limit: null as number | null,
        customer_usage_limit: null as number | null,
        is_active: true,
        applies_to: 'all' as 'all' | 'specific',
        applicables: [] as ApplicableItem[],
    });

    const addApplicable = () => {
        if (!selectedId) return;

        let name = '';
        switch (selectedType) {
            case 'service':
                name = services.find((s) => s.id === selectedId)?.name || '';
                break;
            case 'category':
                name = categories.find((c) => c.id === selectedId)?.name || '';
                break;
            case 'barber':
                name = barbers.find((b) => b.id === selectedId)?.name || '';
                break;
        }

        const newApplicable: ApplicableItem = {
            type: selectedType,
            id: selectedId as number,
            name,
        };

        if (
            !applicable.some(
                (a) =>
                    a.type === newApplicable.type && a.id === newApplicable.id,
            )
        ) {
            const newApplicables = [...applicable, newApplicable];
            setApplicable(newApplicables);
            setData('applicables', newApplicables);
        }

        setSelectedId('');
    };

    const removeApplicable = (index: number) => {
        const newApplicables = applicable.filter((_, i) => i !== index);
        setApplicable(newApplicables);
        setData('applicables', newApplicables);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.discounts.store'), {
            onSuccess: () => {
                router.get(route('admin.discounts.index'));
            },
            onError: (errors: any) => {
                console.error('Gagal submit:', errors);
            },
        });
    };

    const getAvailableItems = () => {
        switch (selectedType) {
            case 'service':
                return services;
            case 'category':
                return categories;
            case 'barber':
                return barbers;
            default:
                return [];
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Discount" />

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
                        <div>
                            <motion.div
                                className="my-4 flex items-center gap-3"
                                animate="float"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black sm:h-10 sm:w-10">
                                    <TicketPercent className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">
                                    Create Discount
                                </h1>
                            </motion.div>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Create promotional discounts to attract more
                                customers
                            </p>
                        </div>
                    </motion.div>

                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Form - Left Column */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Basic Information Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
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
                                                    <BadgeInfo className="h-5 w-5" />
                                                    Basic Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                                                {/* Name & Code */}
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="name"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Discount Name *
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Summer Sale 2024"
                                                            className="border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                        {errors.name && (
                                                            <p className="text-sm text-red-600">
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="code"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Discount Code
                                                        </Label>
                                                        <Input
                                                            id="code"
                                                            value={data.code}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'code',
                                                                    e.target.value.toUpperCase(),
                                                                )
                                                            }
                                                            placeholder="SUMMER24"
                                                            className="border-gray-300 font-mono focus:border-black focus:ring-black"
                                                        />
                                                        {errors.code && (
                                                            <p className="text-sm text-red-600">
                                                                {errors.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="description"
                                                        className="text-sm font-semibold text-gray-700 sm:text-base"
                                                    >
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.description}
                                                        onChange={(e) =>
                                                            setData(
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Describe this discount..."
                                                        rows={3}
                                                        className="border-gray-300 focus:border-black focus:ring-black"
                                                    />
                                                    {errors.description && (
                                                        <p className="text-sm text-red-600">
                                                            {errors.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Discount Type & Value */}
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="discount_type"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Discount Type *
                                                        </Label>
                                                        <Select
                                                            value={
                                                                data.discount_type
                                                            }
                                                            onValueChange={(
                                                                value:
                                                                    | 'percentage'
                                                                    | 'fixed_amount',
                                                            ) =>
                                                                setData(
                                                                    'discount_type',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:ring-black">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="percentage">
                                                                    Percentage
                                                                    (%)
                                                                </SelectItem>
                                                                <SelectItem value="fixed_amount">
                                                                    Fixed Amount
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.discount_type && (
                                                            <p className="text-sm text-red-600">
                                                                {
                                                                    errors.discount_type
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="discount_value"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Discount Value *
                                                        </Label>
                                                        <Input
                                                            id="discount_value"
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={
                                                                data.discount_value
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'discount_value',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            placeholder={
                                                                data.discount_type ===
                                                                'percentage'
                                                                    ? '10'
                                                                    : '50000'
                                                            }
                                                            className="border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                        {errors.discount_value && (
                                                            <p className="text-sm text-red-600">
                                                                {
                                                                    errors.discount_value
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Min & Max Amounts */}
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="min_order_amount"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Minimum Order
                                                        </Label>
                                                        <Input
                                                            id="min_order_amount"
                                                            type="number"
                                                            step="1000"
                                                            min="0"
                                                            value={
                                                                data.min_order_amount ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'min_order_amount',
                                                                    e.target
                                                                        .value
                                                                        ? parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                        : null,
                                                                )
                                                            }
                                                            placeholder="0"
                                                            className="border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                        {errors.min_order_amount && (
                                                            <p className="text-sm text-red-600">
                                                                {
                                                                    errors.min_order_amount
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="max_discount_amount"
                                                            className="text-sm font-semibold text-gray-700 sm:text-base"
                                                        >
                                                            Maximum Discount
                                                        </Label>
                                                        <Input
                                                            id="max_discount_amount"
                                                            type="number"
                                                            step="1000"
                                                            min="0"
                                                            value={
                                                                data.max_discount_amount ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'max_discount_amount',
                                                                    e.target
                                                                        .value
                                                                        ? parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                        : null,
                                                                )
                                                            }
                                                            placeholder="No limit"
                                                            className="border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                        {errors.max_discount_amount && (
                                                            <p className="text-sm text-red-600">
                                                                {
                                                                    errors.max_discount_amount
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                {/* Date Range Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
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
                                                    Date Range
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="start_date"
                                                        className="text-sm font-semibold text-gray-700 sm:text-base"
                                                    >
                                                        Start Date *
                                                    </Label>
                                                    <Input
                                                        id="start_date"
                                                        type="date"
                                                        value={data.start_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                'start_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        min={
                                                            new Date()
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }
                                                        className="border-gray-300 focus:border-black focus:ring-black"
                                                    />
                                                    {errors.start_date && (
                                                        <p className="text-sm text-red-600">
                                                            {errors.start_date}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="end_date"
                                                        className="text-sm font-semibold text-gray-700 sm:text-base"
                                                    >
                                                        End Date *
                                                    </Label>
                                                    <Input
                                                        id="end_date"
                                                        type="date"
                                                        value={data.end_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                'end_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        min={
                                                            data.start_date ||
                                                            new Date()
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }
                                                        className="border-gray-300 focus:border-black focus:ring-black"
                                                    />
                                                    {errors.end_date && (
                                                        <p className="text-sm text-red-600">
                                                            {errors.end_date}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                {/* Applicable Items Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
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
                                            <CardContent className="space-y-4 p-4 sm:p-6">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 sm:text-base">
                                                        Applies To
                                                    </Label>
                                                    <Select
                                                        value={data.applies_to}
                                                        onValueChange={(
                                                            value:
                                                                | 'all'
                                                                | 'specific',
                                                        ) =>
                                                            setData(
                                                                'applies_to',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="border-gray-300 focus:ring-black">
                                                            <SelectValue placeholder="Select scope" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">
                                                                All Services &
                                                                Barbers
                                                            </SelectItem>
                                                            <SelectItem value="specific">
                                                                Specific Items
                                                                Only
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.applies_to && (
                                                        <p className="text-sm text-red-600">
                                                            {errors.applies_to}
                                                        </p>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {data.applies_to ===
                                                        'specific' && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: 'auto',
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                className="space-y-4"
                                                            >
                                                                <div
                                                                    className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}
                                                                >
                                                                    <Select
                                                                        value={
                                                                            selectedType
                                                                        }
                                                                        onValueChange={(
                                                                            value: ApplicableType,
                                                                        ) =>
                                                                            setSelectedType(
                                                                                value,
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="border-gray-300 focus:ring-black">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="service">
                                                                                Service
                                                                            </SelectItem>
                                                                            <SelectItem value="category">
                                                                                Category
                                                                            </SelectItem>
                                                                            <SelectItem value="barber">
                                                                                Barber
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Select
                                                                        value={selectedId.toString()}
                                                                        onValueChange={(
                                                                            value,
                                                                        ) =>
                                                                            setSelectedId(
                                                                                parseInt(
                                                                                    value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="border-gray-300 focus:ring-black">
                                                                            <SelectValue
                                                                                placeholder={`Select ${selectedType}`}
                                                                            />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {getAvailableItems().map(
                                                                                (
                                                                                    item,
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            item.id
                                                                                        }
                                                                                        value={item.id.toString()}
                                                                                    >
                                                                                        {
                                                                                            item.name
                                                                                        }
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Button
                                                                        type="button"
                                                                        onClick={
                                                                            addApplicable
                                                                        }
                                                                        disabled={
                                                                            !selectedId
                                                                        }
                                                                        className="bg-black text-white hover:bg-gray-800"
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                        Add Item
                                                                    </Button>
                                                                </div>

                                                                {applicable.length >
                                                                    0 && (
                                                                        <motion.div
                                                                            initial={{
                                                                                opacity: 0,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                            }}
                                                                            className="space-y-3"
                                                                        >
                                                                            <Label className="text-sm font-semibold text-gray-700">
                                                                                Selected
                                                                                Items:
                                                                            </Label>
                                                                            <div className="space-y-2">
                                                                                {applicable.map(
                                                                                    (
                                                                                        applicable,
                                                                                        index,
                                                                                    ) => (
                                                                                        <motion.div
                                                                                            key={`${applicable.type}-${applicable.id}`}
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
                                                                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                                                                                        >
                                                                                            <div className="flex-1">
                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                            {
                                                                                                applicable.name
                                                                                            }
                                                                                        </span>
                                                                                                <span className="ml-2 text-xs capitalize text-gray-500">
                                                                                            (
                                                                                                    {
                                                                                                        applicable.type
                                                                                                    }

                                                                                                    )
                                                                                        </span>
                                                                                            </div>
                                                                                            <motion.div
                                                                                                whileHover={{
                                                                                                    scale: 1.05,
                                                                                                }}
                                                                                                whileTap={{
                                                                                                    scale: 0.95,
                                                                                                }}
                                                                                            >
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant="outline"
                                                                                                    size="sm"
                                                                                                    onClick={() =>
                                                                                                        removeApplicable(
                                                                                                            index,
                                                                                                        )
                                                                                                    }
                                                                                                    className="h-8 w-8 border-red-300 p-0 text-red-600 hover:border-red-600 hover:bg-red-50"
                                                                                                >
                                                                                                    <Trash2 className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </motion.div>
                                                                                        </motion.div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                {errors.applicables && (
                                                                    <p className="text-sm text-red-600">
                                                                        {
                                                                            errors.applicables
                                                                        }
                                                                    </p>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Sidebar - Right Column */}
                            <div className="space-y-6">
                                {/* Settings Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
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
                                                    <Bolt className="h-4 w-4" />
                                                    Settings
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 p-4 sm:p-6">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        htmlFor="is_active"
                                                        className="text-sm font-semibold text-gray-700"
                                                    >
                                                        Active Status
                                                    </Label>
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                    >
                                                        <input
                                                            id="is_active"
                                                            type="checkbox"
                                                            checked={
                                                                data.is_active
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'is_active',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                        />
                                                    </motion.div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                {/* Usage Limits Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
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
                                                    <Settings2 className="h-4 w-4" />
                                                    Usage Limits
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 p-4 sm:p-6">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="usage_limit"
                                                        className="text-sm font-semibold text-gray-700"
                                                    >
                                                        Total Usage Limit
                                                    </Label>
                                                    <Input
                                                        id="usage_limit"
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            data.usage_limit ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'usage_limit',
                                                                e.target.value
                                                                    ? parseInt(
                                                                        e
                                                                            .target
                                                                            .value,
                                                                    )
                                                                    : null,
                                                            )
                                                        }
                                                        placeholder="No limit"
                                                        className="border-gray-300 focus:border-black focus:ring-black"
                                                    />
                                                    {errors.usage_limit && (
                                                        <p className="text-sm text-red-600">
                                                            {errors.usage_limit}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="customer_usage_limit"
                                                        className="text-sm font-semibold text-gray-700"
                                                    >
                                                        Per Customer Limit
                                                    </Label>
                                                    <Input
                                                        id="customer_usage_limit"
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            data.customer_usage_limit ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'customer_usage_limit',
                                                                e.target.value
                                                                    ? parseInt(
                                                                        e
                                                                            .target
                                                                            .value,
                                                                    )
                                                                    : null,
                                                            )
                                                        }
                                                        placeholder="No limit"
                                                        className="border-gray-300 focus:border-black focus:ring-black"
                                                    />
                                                    {errors.customer_usage_limit && (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                errors.customer_usage_limit
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                {/* Actions Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <motion.div
                                        // @ts-ignore
                                        variants={glowEffect}
                                        initial="initial"
                                        animate="glow"
                                    >
                                        <Card className="border-gray-200 shadow-sm">
                                            <CardContent className="space-y-3 p-4 sm:p-6">
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full bg-black text-white hover:bg-gray-800"
                                                    >
                                                        {processing ? (
                                                            <motion.div
                                                                transition={{
                                                                    duration: 1,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <LoaderCircle className="h-4 w-4" />
                                                                <span>
                                                                    Creating...
                                                                </span>
                                                            </motion.div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Check className="h-4 w-4" />
                                                                <span>
                                                                    Create
                                                                    Discount
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.get(
                                                                route(
                                                                    'admin.discounts.index',
                                                                ),
                                                            )
                                                        }
                                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
