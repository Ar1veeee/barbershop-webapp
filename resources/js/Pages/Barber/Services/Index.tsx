import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { BarberService, PageProps, Service } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    CircleFadingPlus,
    Clock,
    DollarSign,
    LoaderCircle,
    Plus,
    Scissors,
    Settings,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

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
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
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

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30,
            duration: 0.4,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
            duration: 0.2,
        },
    },
};

const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

interface ServicesIndexProps extends PageProps {
    barberServices: BarberService[];
    availableServices: Service[];
}

export default function Index({
    barberServices,
    availableServices,
}: ServicesIndexProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingService, setEditingService] = useState<BarberService | null>(null);
    const [activeFilter, setActiveFilter] = useState<
        'all' | 'available' | 'unavailable'
    >('all');

    const addForm = useForm({
        service_id: '',
        custom_duration: '',
        is_available: true,
    });
    const editForm = useForm({ custom_duration: '', is_available: true });
    const deleteForm = useForm();

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('barber.services.store'), {
            onSuccess: () => {
                setShowAddDialog(false);
                addForm.reset();
            },
        });
    };

    const handleEdit = (service: BarberService) => {
        setEditingService(service);
        editForm.setData({
            custom_duration: service.custom_duration?.toString() || '',
            is_available: service.is_available,
        });
        setShowEditDialog(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(route('barber.services.update', editingService?.id), {
            onSuccess: () => {
                setShowEditDialog(false);
                setEditingService(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this service?')) {
            deleteForm.delete(route('barber.services.destroy', id));
        }
    };

    // Filter services based on active filter
    const filteredServices = barberServices.filter((service) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'available') return service.is_available;
        if (activeFilter === 'unavailable') return !service.is_available;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="My Services" />

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
                                    My Services
                                </motion.h1>
                                <motion.p
                                    className="text-zinc-600 sm:text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Manage the services you offer to clients
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center gap-3"
                            >
                                {/* Filter Buttons - Mobile */}
                                <div className="flex gap-1 sm:hidden">
                                    <Button
                                        variant={
                                            activeFilter === 'all'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setActiveFilter('all')}
                                        className={`text-xs ${
                                            activeFilter === 'all'
                                                ? 'bg-black text-white'
                                                : 'border-zinc-300'
                                        }`}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={
                                            activeFilter === 'available'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setActiveFilter('available')
                                        }
                                        className={`text-xs ${
                                            activeFilter === 'available'
                                                ? 'bg-black text-white'
                                                : 'border-zinc-300'
                                        }`}
                                    >
                                        Available
                                    </Button>
                                    <Button
                                        variant={
                                            activeFilter === 'unavailable'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setActiveFilter('unavailable')
                                        }
                                        className={`text-xs ${
                                            activeFilter === 'unavailable'
                                                ? 'bg-black text-white'
                                                : 'border-zinc-300'
                                        }`}
                                    >
                                        Unavailable
                                    </Button>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => setShowAddDialog(true)}
                                        className="w-full bg-black hover:bg-zinc-800 sm:w-auto"
                                        disabled={
                                            availableServices.length === 0
                                        }
                                        size="sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Add Service
                                        </span>
                                        <span className="sm:hidden">Add</span>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Filter Buttons - Desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 hidden gap-2 sm:flex"
                        >
                            <Button
                                variant={
                                    activeFilter === 'all'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setActiveFilter('all')}
                                className={
                                    activeFilter === 'all'
                                        ? 'bg-black text-white'
                                        : 'border-zinc-300'
                                }
                            >
                                All Services
                            </Button>
                            <Button
                                variant={
                                    activeFilter === 'available'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setActiveFilter('available')}
                                className={
                                    activeFilter === 'available'
                                        ? 'bg-black text-white'
                                        : 'border-zinc-300'
                                }
                            >
                                Available
                            </Button>
                            <Button
                                variant={
                                    activeFilter === 'unavailable'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setActiveFilter('unavailable')}
                                className={
                                    activeFilter === 'unavailable'
                                        ? 'bg-black text-white'
                                        : 'border-zinc-300'
                                }
                            >
                                Unavailable
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Stats Summary */}
                    {barberServices.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
                        >
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-black">
                                        {barberServices.length}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Total
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-zinc-200 bg-white/80 backdrop-blur-sm">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-black">
                                        {
                                            barberServices.filter(
                                                (s) => s.is_available,
                                            ).length
                                        }
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Available
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="hidden border-zinc-200 bg-white/80 backdrop-blur-sm sm:block">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-black">
                                        {
                                            barberServices.filter(
                                                (s) => !s.is_available,
                                            ).length
                                        }
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Unavailable
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="hidden border-zinc-200 bg-white/80 backdrop-blur-sm sm:block">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-black">
                                        {availableServices.length}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Available to Add
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Services Grid */}
                    <AnimatePresence mode="wait">
                        {filteredServices.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm">
                                    <CardContent className="py-16 text-center">
                                        <motion.div
                                            // @ts-ignore
                                            animate={pulseAnimation}
                                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100"
                                        >
                                            <Scissors className="h-8 w-8 text-zinc-400" />
                                        </motion.div>
                                        <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                                            {activeFilter === 'all'
                                                ? 'No services added yet'
                                                : `No ${activeFilter} services`}
                                        </h3>
                                        <p className="mx-auto mb-6 max-w-sm text-zinc-600">
                                            {activeFilter === 'all'
                                                ? 'Start by adding services you want to offer to your clients'
                                                : `No ${activeFilter} services found. Try changing the filter.`}
                                        </p>
                                        {activeFilter === 'all' && (
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={() =>
                                                        setShowAddDialog(true)
                                                    }
                                                    className="bg-black hover:bg-zinc-800"
                                                    size="lg"
                                                >
                                                    <Scissors className="mr-2 h-4 w-4" />
                                                    Add Your First Service
                                                </Button>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                // @ts-ignore
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
                            >
                                {filteredServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        // @ts-ignore
                                        variants={item}
                                        custom={index}
                                        whileHover={{
                                            y: -8,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 400,
                                            },
                                        }}
                                        className="group"
                                    >
                                        <Card className="overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:border-zinc-300 hover:shadow-2xl">
                                            {/* Status Indicator */}
                                            <div
                                                className={`h-1 ${
                                                    service.is_available
                                                        ? 'bg-black'
                                                        : 'bg-zinc-300'
                                                }`}
                                            />

                                            <CardContent className="p-4 sm:p-6">
                                                {/* Header */}
                                                <div className="mb-4 flex items-start justify-between">
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                    >
                                                        <Badge
                                                            className={` ${
                                                                service.is_available
                                                                    ? 'bg-black text-white'
                                                                    : 'bg-zinc-100 text-zinc-600'
                                                            } px-3 py-1 text-xs font-semibold`}
                                                        >
                                                            {service.is_available ? (
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Available
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <XCircle className="h-3 w-3" />
                                                                    Unavailable
                                                                </div>
                                                            )}
                                                        </Badge>
                                                    </motion.div>

                                                    <Badge
                                                        variant="outline"
                                                        className="border-zinc-300 bg-white text-xs"
                                                    >
                                                        {service.category_name}
                                                    </Badge>
                                                </div>

                                                {/* Service Name */}
                                                <h3 className="mb-3 line-clamp-2 text-xl font-bold text-black transition-colors group-hover:text-zinc-800">
                                                    {service.service_name}
                                                </h3>

                                                {/* Description */}
                                                {service.description && (
                                                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                                                        {service.description}
                                                    </p>
                                                )}

                                                {/* Details Grid */}
                                                <div className="mb-4 space-y-3">
                                                    <motion.div
                                                        className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 transition-colors group-hover:bg-zinc-100"
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-2 text-sm text-zinc-600">
                                                            <Clock className="h-4 w-4" />
                                                            Duration
                                                        </span>
                                                        <span className="font-bold text-black">
                                                            {service.custom_duration ||
                                                                service.duration}{' '}
                                                            min
                                                        </span>
                                                    </motion.div>

                                                    <motion.div
                                                        className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 transition-colors group-hover:bg-zinc-100"
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-2 text-sm text-zinc-600">
                                                            <DollarSign className="h-4 w-4" />
                                                            Price
                                                        </span>
                                                        <span className="text-lg font-bold text-black">
                                                            Rp{' '}
                                                            {Number(
                                                                service.custom_price ||
                                                                    service.base_price,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                <Separator className="my-4 bg-zinc-200" />

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                        className="flex-1"
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    service,
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100"
                                                        >
                                                            <Settings className="mr-2 h-4 w-4" />
                                                            <span className="xs:inline hidden">
                                                                Manage
                                                            </span>
                                                            <span className="xs:hidden">
                                                                Edit
                                                            </span>
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    service.id,
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-zinc-300 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Add Service Dialog */}
                    <AnimatePresence>
                        {showAddDialog && (
                            <Dialog
                                open={showAddDialog}
                                onOpenChange={setShowAddDialog}
                            >
                                <DialogContent className="sm:max-w-md">
                                    <motion.div
                                        // @ts-ignore
                                        variants={modalVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <CircleFadingPlus className="h-5 w-5" />
                                                Add New Service
                                            </DialogTitle>
                                            <DialogDescription>
                                                Choose a service to add to your
                                                offerings
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAdd}>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label>
                                                        Select Service
                                                    </Label>
                                                    <Select
                                                        value={
                                                            addForm.data
                                                                .service_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            addForm.setData(
                                                                'service_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-2 border-zinc-300">
                                                            <SelectValue placeholder="Choose a service..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableServices.map(
                                                                (service) => (
                                                                    <SelectItem
                                                                        key={
                                                                            service.id
                                                                        }
                                                                        value={service.id.toString()}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">
                                                                                {
                                                                                    service.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-xs text-zinc-500">
                                                                                {
                                                                                    service.duration
                                                                                }{' '}
                                                                                min
                                                                                •
                                                                                Rp{' '}
                                                                                {Number(
                                                                                    service.base_price,
                                                                                ).toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>
                                                        Custom Duration
                                                        (minutes)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            addForm.data
                                                                .custom_duration
                                                        }
                                                        onChange={(e) =>
                                                            addForm.setData(
                                                                'custom_duration',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Leave empty for default duration"
                                                        className="mt-2 border-zinc-300"
                                                        min="1"
                                                        max="480"
                                                    />
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        Optional: Set a custom
                                                        duration for this
                                                        service
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                                                    <div>
                                                        <Label className="text-base">
                                                            Available
                                                        </Label>
                                                        <p className="text-sm text-zinc-500">
                                                            Show this service to
                                                            clients
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={
                                                            addForm.data
                                                                .is_available
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            addForm.setData(
                                                                'is_available',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowAddDialog(false)
                                                    }
                                                    className="border-zinc-300"
                                                >
                                                    Cancel
                                                </Button>
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            addForm.processing ||
                                                            !addForm.data
                                                                .service_id
                                                        }
                                                        className="w-full bg-black hover:bg-zinc-800"
                                                    >
                                                        {addForm.processing ? (
                                                            <motion.div
                                                                animate={{
                                                                    rotate: 360,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <LoaderCircle className="h-4 w-4" />
                                                                Adding...
                                                            </motion.div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                Add Service
                                                            </div>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </DialogFooter>
                                        </form>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>

                    {/* Edit Service Dialog */}
                    <AnimatePresence>
                        {showEditDialog && editingService && (
                            <Dialog
                                open={showEditDialog}
                                onOpenChange={setShowEditDialog}
                            >
                                <DialogContent className="sm:max-w-md">
                                    <motion.div
                                        // @ts-ignore
                                        variants={modalVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Settings className="h-5 w-5" />
                                                Manage Service
                                            </DialogTitle>
                                            <DialogDescription>
                                                Update service settings and
                                                availability
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleUpdate}>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label>Service</Label>
                                                    <Input
                                                        value={
                                                            editingService.service_name
                                                        }
                                                        disabled
                                                        className="mt-2 bg-zinc-50 font-medium"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>
                                                        Custom Duration
                                                        (minutes)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            editForm.data
                                                                .custom_duration
                                                        }
                                                        onChange={(e) =>
                                                            editForm.setData(
                                                                'custom_duration',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Default: ${editingService.duration} min`}
                                                        className="mt-2 border-zinc-300"
                                                        min="1"
                                                        max="480"
                                                    />
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        Base duration:{' '}
                                                        {
                                                            editingService.duration
                                                        }{' '}
                                                        minutes
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                                                    <div>
                                                        <Label className="text-base">
                                                            Available
                                                        </Label>
                                                        <p className="text-sm text-zinc-500">
                                                            Show this service to
                                                            clients
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={
                                                            editForm.data
                                                                .is_available
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            editForm.setData(
                                                                'is_available',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowEditDialog(false)
                                                    }
                                                    className="border-zinc-300"
                                                >
                                                    Cancel
                                                </Button>
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            editForm.processing
                                                        }
                                                        className="w-full bg-black hover:bg-zinc-800"
                                                    >
                                                        {editForm.processing ? (
                                                            <motion.div
                                                                animate={{
                                                                    rotate: 360,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                                Saving...
                                                            </motion.div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Save Changes
                                                            </div>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </DialogFooter>
                                        </form>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
