import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
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
    Booking,
    BookingFilters,
    PageProps,
    PaginatedData,
    User,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    DollarSign,
    Edit,
    Scissors,
    Search,
    User as UserIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface StatusOption {
    value: Booking['status'];
    label: string;
    color: string;
}

type StatusTransitions = Record<Booking['status'], Booking['status'][]>;

interface BookingsIndexProps extends PageProps {
    bookings: PaginatedData<Booking>;
    barbers: User[];
    filters: BookingFilters;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
    },
};

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { delayChildren: 0.15 },
    },
};

const slideInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
    },
};

const statusColors = {
    pending:
        'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    in_progress:
        'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200',
    completed:
        'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
};

const statusOptions: StatusOption[] = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600' },
    { value: 'in_progress', label: 'In Progress', color: 'text-indigo-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
];

const statusTransitions: StatusTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: ['confirmed'],
};

export default function Index({
    bookings,
    barbers,
    filters,
}: BookingsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [barberId, setBarberId] = useState(filters.barber_id || 'all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );
    const [newStatus, setNewStatus] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const isInitialMount = useRef(true);

    const applyFilters = useCallback(() => {
        router.get(
            route('admin.bookings.index'),
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                barber_id: barberId !== 'all' ? barberId : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [search, status, dateFrom, dateTo, barberId]);

    const debouncedSearch = useCallback(
        debounce(() => applyFilters(), 400),
        [applyFilters],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    useEffect(() => {
        if (!isInitialMount.current) applyFilters();
    }, [status, dateFrom, dateTo, barberId, applyFilters]);

    useEffect(() => {
        if (selectedBooking) {
            setNewStatus(selectedBooking.status);
            setCancellationReason('');
        }
    }, [selectedBooking]);

    const handleStatusUpdate = async () => {
        if (!selectedBooking || !newStatus) return;

        setIsUpdating(true);
        try {
            router.patch(
                route('admin.bookings.update', selectedBooking.id),
                {
                    status: newStatus,
                    cancellation_reason:
                        newStatus === 'cancelled' ? cancellationReason : null,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedBooking(null);
                        setIsUpdating(false);
                    },
                },
            );
        } catch (error) {
            setIsUpdating(false);
        }
    };

    const getAvailableStatuses = (currentStatus: string) => {
        return statusOptions.filter(
            (option) =>
                option.value === currentStatus ||
                statusTransitions[
                    currentStatus as keyof typeof statusTransitions
                ]?.includes(option.value),
        );
    };

    const formatStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusMap[status] || status;
    };

    const stats = [
        { label: 'Total', value: bookings.total, icon: Calendar },
        {
            label: 'Pending',
            value: bookings.data.filter((b) => b.status === 'pending').length,
            icon: Clock,
        },
        {
            label: 'Completed',
            value: bookings.data.filter((b) => b.status === 'completed').length,
            icon: CheckCircle2,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Bookings" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-4xl font-black tracking-tighter text-black sm:text-5xl lg:text-6xl">
                                    Bookings
                                </h1>
                                <p className="text-base font-medium text-zinc-600 sm:text-lg">
                                    Manage all customer appointments
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
                    >
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={i} variants={fadeInUp}>
                                    <Card className="border-zinc-200 transition-shadow hover:shadow-lg">
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-1 text-2xl font-black text-black sm:text-3xl">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
                                                    <Icon className="h-6 w-6 text-white" />
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
                        className="mb-6"
                    >
                        <Card className="border-zinc-200 bg-white/80 backdrop-blur">
                            <CardContent className="pb-4 pt-5">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            placeholder="Search customer/barber..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="h-11 border-zinc-300 pl-10 focus:border-black"
                                        />
                                    </div>
                                    <Select
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value as
                                                    | 'all'
                                                    | 'pending'
                                                    | 'confirmed'
                                                    | 'in_progress'
                                                    | 'completed'
                                                    | 'cancelled',
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-zinc-300">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="confirmed">
                                                Confirmed
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                In Progress
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        className="h-11 border-zinc-300"
                                    />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                        className="h-11 border-zinc-300"
                                    />
                                    <Select
                                        value={barberId}
                                        onValueChange={setBarberId}
                                    >
                                        <SelectTrigger className="h-11 border-zinc-300">
                                            <SelectValue placeholder="All Barbers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Barbers
                                            </SelectItem>
                                            {barbers.map((barber) => (
                                                <SelectItem
                                                    key={barber.id}
                                                    value={barber.id.toString()}
                                                >
                                                    {barber.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Bookings Grid */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {bookings.data.map((booking) => (
                            <motion.div
                                key={booking.id}
                                variants={fadeInUp}
                                whileHover={{ y: -4 }}
                                className="group cursor-pointer"
                                onClick={() => setSelectedBooking(booking)}
                            >
                                <Card className="h-full border-zinc-200 bg-white/90 backdrop-blur-sm transition-all hover:border-black">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg text-white">
                                                    {booking.customer
                                                        ?.avatar_url ? (
                                                        <img
                                                            src={
                                                                booking.customer
                                                                    ?.avatar_url
                                                            }
                                                            alt={
                                                                booking.customer
                                                                    ?.name
                                                            }
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {booking.customer?.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-black group-hover:underline">
                                                        {booking.customer?.name}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500">
                                                        {format(
                                                            new Date(
                                                                booking.booking_date,
                                                            ),
                                                            'dd MMM yyyy',
                                                            { locale: id },
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`${statusColors[booking.status]} text-xs`}
                                            >
                                                {formatStatus(booking.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-zinc-500" />
                                            <span>
                                                {booking.start_time} -{' '}
                                                {booking.end_time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Scissors className="h-4 w-4 text-zinc-500" />
                                            <span>{booking.service?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <UserIcon className="h-4 w-4 text-zinc-500" />
                                            <span>{booking.barber?.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                                            <div className="flex items-center gap-1 text-sm font-semibold">
                                                <DollarSign className="h-4 w-4" />
                                                Rp{' '}
                                                {Number(
                                                    booking.total_price,
                                                ).toLocaleString('id-ID')}
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-black" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {bookings.data.length === 0 && bookings.total > 10 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100">
                                <Calendar className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-black sm:text-2xl">
                                No bookings found
                            </h3>
                            <p className="mx-auto max-w-md text-zinc-600">
                                {search ||
                                status !== 'all' ||
                                dateFrom ||
                                dateTo ||
                                barberId !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No bookings yet'}
                            </p>
                        </motion.div>
                    )}

                    {/* Detail Modal */}
                    <Dialog
                        open={!!selectedBooking}
                        onOpenChange={() => setSelectedBooking(null)}
                    >
                        <DialogContent className="max-w-[95vw] overflow-hidden border-zinc-200 p-0 sm:max-w-4xl">
                            {selectedBooking && (
                                <div className="flex flex-col lg:flex-row">
                                    {/* Left Section - Booking Details */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex-1 p-6 sm:p-8"
                                    >
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center justify-between text-2xl font-bold text-black">
                                                Booking Details
                                                <Badge
                                                    className={`${statusColors[selectedBooking.status]} text-sm`}
                                                >
                                                    {formatStatus(
                                                        selectedBooking.status,
                                                    )}
                                                </Badge>
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="mt-6 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white">
                                                    {selectedBooking.customer?.name.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-black">
                                                        {
                                                            selectedBooking
                                                                .customer?.name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-zinc-600">
                                                        {
                                                            selectedBooking
                                                                .customer?.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                                                <div>
                                                    <Label className="text-xs text-zinc-500">
                                                        Date & Time
                                                    </Label>
                                                    <p className="font-medium text-black">
                                                        {format(
                                                            new Date(
                                                                selectedBooking.booking_date,
                                                            ),
                                                            'EEEE, dd MMMM yyyy',
                                                            { locale: id },
                                                        )}
                                                        <br />
                                                        {
                                                            selectedBooking.start_time
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            selectedBooking.end_time
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-zinc-500">
                                                        Service
                                                    </Label>
                                                    <p className="font-medium text-black">
                                                        {
                                                            selectedBooking
                                                                .service?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-zinc-500">
                                                        Barber
                                                    </Label>
                                                    <p className="font-medium text-black">
                                                        {
                                                            selectedBooking
                                                                .barber?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-zinc-500">
                                                        Total Price
                                                    </Label>
                                                    <p className="text-lg font-bold text-black">
                                                        Rp{' '}
                                                        {Number(
                                                            selectedBooking.total_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedBooking.notes && (
                                                <div className="border-t border-zinc-100 pt-4">
                                                    <Label className="text-xs text-zinc-500">
                                                        Customer Notes
                                                    </Label>
                                                    <p className="mt-1 text-sm text-zinc-700">
                                                        {selectedBooking.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Right Section - Status Update */}
                                    <motion.div
                                        variants={slideInRight}
                                        initial="hidden"
                                        animate="visible"
                                        className="w-full border-t border-zinc-200 bg-zinc-50 p-6 sm:p-8 lg:w-96 lg:border-l lg:border-t-0"
                                    >
                                        <div className="mb-6 flex items-center gap-2">
                                            <Edit className="h-5 w-5 text-zinc-600" />
                                            <h3 className="text-lg font-bold text-black">
                                                Update Status
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Current Status */}
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium text-zinc-700">
                                                    Current Status
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${statusColors[selectedBooking.status]} text-sm`}
                                                    >
                                                        {formatStatus(
                                                            selectedBooking.status,
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Status Selector */}
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium text-zinc-700">
                                                    Change Status
                                                </Label>
                                                <Select
                                                    value={newStatus}
                                                    onValueChange={setNewStatus}
                                                >
                                                    <SelectTrigger className="border-zinc-300 bg-white">
                                                        <SelectValue placeholder="Select new status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableStatuses(
                                                            selectedBooking.status,
                                                        ).map(
                                                            (statusOption) => (
                                                                <SelectItem
                                                                    key={
                                                                        statusOption.value
                                                                    }
                                                                    value={
                                                                        statusOption.value
                                                                    }
                                                                    className={
                                                                        statusOption.color
                                                                    }
                                                                >
                                                                    {
                                                                        statusOption.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Cancellation Reason */}
                                            {newStatus === 'cancelled' && (
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
                                                    className="space-y-2"
                                                >
                                                    <Label className="text-sm font-medium text-zinc-700">
                                                        Cancellation Reason
                                                    </Label>
                                                    <Textarea
                                                        placeholder="Enter reason for cancellation..."
                                                        value={
                                                            cancellationReason
                                                        }
                                                        onChange={(e) =>
                                                            setCancellationReason(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="min-h-[100px] resize-none border-zinc-300"
                                                    />
                                                </motion.div>
                                            )}

                                            {/* Status Flow */}
                                            <div className="pt-4">
                                                <Label className="mb-3 block text-sm font-medium text-zinc-700">
                                                    Status Flow
                                                </Label>
                                                <div className="space-y-2">
                                                    {statusOptions.map(
                                                        (
                                                            statusOption,
                                                            index,
                                                        ) => (
                                                            <motion.div
                                                                key={
                                                                    statusOption.value
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
                                                                className={`flex items-center gap-3 rounded-lg p-2 text-sm ${
                                                                    selectedBooking.status ===
                                                                    statusOption.value
                                                                        ? 'bg-black text-white'
                                                                        : statusTransitions[
                                                                                selectedBooking.status as keyof typeof statusTransitions
                                                                            ]?.includes(
                                                                                statusOption.value,
                                                                            )
                                                                          ? 'bg-zinc-100 text-black'
                                                                          : 'text-zinc-400'
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`h-2 w-2 rounded-full ${
                                                                        selectedBooking.status ===
                                                                        statusOption.value
                                                                            ? 'bg-white'
                                                                            : statusTransitions[
                                                                                    selectedBooking.status as keyof typeof statusTransitions
                                                                                ]?.includes(
                                                                                    statusOption.value,
                                                                                )
                                                                              ? 'bg-black'
                                                                              : 'bg-zinc-300'
                                                                    }`}
                                                                />
                                                                <span className="font-medium">
                                                                    {
                                                                        statusOption.label
                                                                    }
                                                                </span>
                                                                {selectedBooking.status ===
                                                                    statusOption.value && (
                                                                    <motion.div
                                                                        animate={{
                                                                            scale: [
                                                                                1,
                                                                                1.2,
                                                                                1,
                                                                            ],
                                                                        }}
                                                                        transition={{
                                                                            duration: 2,
                                                                            repeat: Infinity,
                                                                        }}
                                                                        className="ml-auto"
                                                                    >
                                                                        <div className="h-2 w-2 rounded-full bg-white" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setSelectedBooking(null)
                                                    }
                                                    className="flex-1 border-zinc-300"
                                                    disabled={isUpdating}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleStatusUpdate}
                                                    disabled={
                                                        !newStatus ||
                                                        newStatus ===
                                                            selectedBooking.status ||
                                                        isUpdating
                                                    }
                                                    className="flex-1 bg-black hover:bg-zinc-800"
                                                >
                                                    {isUpdating ? (
                                                        <motion.div
                                                            animate={{
                                                                rotate: 360,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                            className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                                                        />
                                                    ) : (
                                                        'Update Status'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
