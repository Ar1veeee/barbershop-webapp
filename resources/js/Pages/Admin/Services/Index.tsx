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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    PageProps,
    PaginatedData,
    Service,
    ServiceCategory,
    ServiceFilters,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    CheckCircle2,
    Clock,
    DollarSign,
    Edit,
    Filter,
    Package,
    Plus,
    Search,
    Tag,
    Trash2,
    XCircle,
} from 'lucide-react';
import {
    FormEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

interface ServicesIndexProps extends PageProps {
    services: PaginatedData<Service>;
    categories: ServiceCategory[];
    filters: ServiceFilters;
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

export default function Index({
    services,
    categories,
    filters,
}: ServicesIndexProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deleteService, setDeleteService] = useState<Service | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const isInitialMount = useRef(true);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        category_id: '',
        duration: '',
        base_price: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingService(null);
        setShowDialog(true);
    };

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description || '',
            category_id: service.category_id.toString(),
            duration: service.duration.toString(),
            base_price: service.base_price.toString(),
            is_active: service.is_active,
        });
        setShowDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingService) {
            put(route('admin.services.update', editingService.id), {
                onSuccess: () => {
                    setShowDialog(false);
                    reset();
                },
            });
        } else {
            post(route('admin.services.store'), {
                onSuccess: () => {
                    setShowDialog(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteService) {
            router.delete(route('admin.services.destroy', deleteService.id), {
                onSuccess: () => setDeleteService(null),
            });
        }
    };

    const applyFilters = (
        currentSearch: string,
        currentCategory: string,
        currentStatus: string,
    ) => {
        router.get(
            route('admin.services.index'),
            {
                search: currentSearch || undefined,
                category_id:
                    currentCategory !== 'all' ? currentCategory : undefined,
                status: currentStatus !== 'all' ? currentStatus : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            applyFilters(query, category, status);
        }, 400),
        [category, status],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        applyFilters(search, category, status);
    }, [category, status]);

    const stats = [
        { label: 'Total Services', value: services.total, icon: Package },
        {
            label: 'Active',
            value: services.data.filter((s) => s.is_active).length,
            icon: CheckCircle2,
        },
        {
            label: 'Inactive',
            value: services.data.filter((s) => !s.is_active).length,
            icon: XCircle,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Services Management" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-3xl lg:text-4xl">
                                    Services Management
                                </h1>
                                <p className="text-sm text-zinc-600 sm:text-base lg:text-lg">
                                    Manage barbershop services and pricing
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={openCreateDialog}
                                    className="h-10 bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800 sm:h-12 sm:px-6 sm:text-base"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Add Service</span>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-8"
                    >
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                                    <Icon className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" />
                                                </div>
                                                <div>
                                                    <p className="mb-0.5 text-xs text-zinc-500">
                                                        {stat.label}
                                                    </p>
                                                    <p className="text-xl font-bold text-black sm:text-2xl">
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

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-4 lg:mb-6"
                    >
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                                            <Input
                                                placeholder="Search services..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="h-10 border-zinc-200 pl-10 focus:border-black sm:h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                                        <Select
                                            value={category}
                                            onValueChange={(value) =>
                                                setCategory(value)
                                            }
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[160px] lg:w-[200px]">
                                                <Filter className="mr-2 h-4 w-4 text-zinc-500" />
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Categories
                                                </SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={status}
                                            onValueChange={(value) =>
                                                setStatus(
                                                    value as
                                                        | 'all'
                                                        | 'active'
                                                        | 'inactive',
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[140px] lg:w-[150px]">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Inactive
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Services Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4"
                    >
                        {services.data.map((service) => (
                            <motion.div key={service.id} variants={fadeInUp}>
                                <Card className="group h-full border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                    <CardHeader className="border-b border-zinc-100 p-4 sm:pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="mb-2 text-base font-bold text-black group-hover:underline sm:text-lg">
                                                    {service.name}
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-zinc-300 text-xs text-zinc-700"
                                                    >
                                                        <Tag className="mr-1 h-3 w-3" />
                                                        <span className="truncate">
                                                            {
                                                                service.category
                                                                    ?.name
                                                            }
                                                        </span>
                                                    </Badge>
                                                    <Badge
                                                        className={`${service.is_active ? 'border-black bg-black text-white' : 'border-zinc-300 bg-zinc-100 text-zinc-600'} border text-xs`}
                                                    >
                                                        <span className="hidden sm:inline">
                                                            {service.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {service.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:pb-4 sm:pt-6">
                                        <p className="mb-4 line-clamp-2 text-sm text-zinc-600">
                                            {service.description ||
                                                'No description available'}
                                        </p>
                                        <div className="mb-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                                                    <Clock className="h-4 w-4 text-zinc-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-zinc-500">
                                                        Duration
                                                    </p>
                                                    <p className="text-sm font-semibold text-black">
                                                        {service.duration}{' '}
                                                        minutes
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                                                    <DollarSign className="h-4 w-4 text-zinc-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-zinc-500">
                                                        Base Price
                                                    </p>
                                                    <p className="text-base font-bold text-black sm:text-lg">
                                                        Rp{' '}
                                                        {Number(
                                                            service.base_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-4">
                                            <Button
                                                onClick={() =>
                                                    openEditDialog(service)
                                                }
                                                variant="outline"
                                                size="sm"
                                                className="h-9 flex-1 border-zinc-300 text-xs hover:border-black hover:bg-zinc-50 sm:h-10 sm:text-sm"
                                            >
                                                <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">
                                                    Edit
                                                </span>
                                                <span className="sm:hidden">
                                                    Edit
                                                </span>
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setDeleteService(service)
                                                }
                                                variant="outline"
                                                size="sm"
                                                className="h-9 flex-1 border-red-300 text-xs text-red-600 hover:border-red-600 hover:bg-red-50 sm:h-10 sm:text-sm"
                                            >
                                                <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">
                                                    Delete
                                                </span>
                                                <span className="sm:hidden">
                                                    Delete
                                                </span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {services.data.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 text-center sm:py-16"
                        >
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 sm:h-20 sm:w-20">
                                <Package className="h-8 w-8 text-zinc-400 sm:h-10 sm:w-10" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-black sm:text-xl">
                                No services found
                            </h3>
                            <p className="mb-6 text-sm text-zinc-600 sm:text-base">
                                {search ||
                                category !== 'all' ||
                                status !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first service'}
                            </p>
                            {!search &&
                                category === 'all' &&
                                status === 'all' && (
                                    <Button
                                        onClick={openCreateDialog}
                                        className="h-10 bg-black text-sm hover:bg-zinc-800 sm:h-11 sm:text-base"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Service
                                    </Button>
                                )}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {services.last_page > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={services.current_page === 1}
                                onClick={() =>
                                    router.get(
                                        route('admin.services.index', {
                                            page:
                                                services.current_page - 1,
                                        }),
                                        { preserveState: true },
                                    )
                                }
                                className="h-8 border-zinc-300 text-xs hover:border-black sm:h-9 sm:text-sm"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            services.last_page,
                                        ),
                                    },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === services.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                route('admin.services.index'),
                                                { page },
                                                { preserveState: true },
                                            )
                                        }
                                        className={`h-8 text-xs sm:h-9 sm:text-sm ${
                                            page === services.current_page
                                                ? 'bg-black hover:bg-zinc-800'
                                                : 'border-zinc-300 hover:border-black'
                                        }`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    services.current_page ===
                                    services.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        route('admin.services.index', {
                                            page:
                                                services.current_page + 1,
                                        }),
                                        { preserveState: true },
                                    )
                                }
                                className="h-8 border-zinc-300 text-xs hover:border-black sm:h-9 sm:text-sm"
                            >
                                Next
                            </Button>
                        </motion.div>
                    )}

                    {/* Create/Edit Dialog */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-md border-zinc-200 sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-black sm:text-2xl">
                                    {editingService
                                        ? 'Edit Service'
                                        : 'Create New Service'}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-600">
                                    {editingService
                                        ? 'Update service information'
                                        : 'Add a new service to your offerings'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-semibold text-zinc-700"
                                        >
                                            Service Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="e.g., Premium Haircut"
                                            className="mt-2 border-zinc-200 focus:border-black"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="category_id"
                                            className="text-sm font-semibold text-zinc-700"
                                        >
                                            Category *
                                        </Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(value) =>
                                                setData('category_id', value)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="mt-2 border-zinc-200">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="description"
                                            className="text-sm font-semibold text-zinc-700"
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
                                            placeholder="Describe the service..."
                                            rows={3}
                                            className="mt-2 border-zinc-200 focus:border-black"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label
                                                htmlFor="duration"
                                                className="text-sm font-semibold text-zinc-700"
                                            >
                                                Duration (minutes) *
                                            </Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={data.duration}
                                                onChange={(e) =>
                                                    setData(
                                                        'duration',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="30"
                                                className="mt-2 border-zinc-200 focus:border-black"
                                                required
                                            />
                                            {errors.duration && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors.duration}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="base_price"
                                                className="text-sm font-semibold text-zinc-700"
                                            >
                                                Base Price (Rp) *
                                            </Label>
                                            <Input
                                                id="base_price"
                                                type="number"
                                                value={data.base_price}
                                                onChange={(e) =>
                                                    setData(
                                                        'base_price',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="50000"
                                                className="mt-2 border-zinc-200 focus:border-black"
                                                required
                                            />
                                            {errors.base_price && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors.base_price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="text-sm font-medium text-zinc-700"
                                        >
                                            Active (Available for booking)
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter className="mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowDialog(false)}
                                        className="h-10 border-2 border-zinc-300 text-sm hover:bg-zinc-50 sm:h-11 sm:text-base"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 bg-black text-sm hover:bg-zinc-800 sm:h-11 sm:text-base"
                                    >
                                        {editingService
                                            ? 'Update Service'
                                            : 'Create Service'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation */}
                    <AlertDialog
                        open={!!deleteService}
                        onOpenChange={() => setDeleteService(null)}
                    >
                        <AlertDialogContent className="max-w-sm border-zinc-200 sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold text-black sm:text-2xl">
                                    Delete Service
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-600">
                                    Are you sure you want to delete{' '}
                                    <strong>{deleteService?.name}</strong>? This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
                                <AlertDialogCancel className="h-10 border-2 border-zinc-300 text-sm hover:bg-zinc-50 sm:h-11 sm:text-base">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="h-10 bg-red-600 text-sm text-white hover:bg-red-700 sm:h-11 sm:text-base"
                                >
                                    Delete Service
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
