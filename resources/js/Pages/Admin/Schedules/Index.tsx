import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { BarberSchedule, BarberTimeOff, PageProps, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    Clock,
    Loader,
    Plus,
    Save,
    Trash2,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.03, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
};

interface ScheduleIndexProps extends PageProps {
    barbers: User[];
    selectedBarber: number;
    schedules: BarberSchedule[];
    timeOff: BarberTimeOff[];
    flash?: { success?: string };
}

const DAYS = [
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
    { value: 0, label: 'Sun', fullLabel: 'Sunday' },
];

export default function Index({
    barbers,
    selectedBarber: initialSelectedBarber,
    schedules,
    timeOff,
    flash,
}: ScheduleIndexProps) {
    const [selectedBarberId, setSelectedBarberId] = useState<number>(
        initialSelectedBarber,
    );
    const [localSchedules, setLocalSchedules] = useState<BarberSchedule[]>(
        DAYS.map((day) => {
            const existing = schedules.find((s) => s.day_of_week === day.value);
            return (
                existing || {
                    day_of_week: day.value,
                    start_time: '09:00',
                    end_time: '18:00',
                    is_available: false,
                }
            );
        }),
    );

    const scheduleForm = useForm({
        barber_id: selectedBarberId,
        schedules: localSchedules,
    });

    const timeOffForm = useForm({
        barber_id: selectedBarberId,
        start_date: '',
        end_date: '',
        reason: '',
    });

    useEffect(() => {
        if (selectedBarberId) {
            router.get(
                route('admin.schedules.index'),
                { barber_id: selectedBarberId },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    }, [selectedBarberId]);

    useEffect(() => {
        const mappedSchedules = DAYS.map((day) => {
            const existing = schedules.find((s) => s.day_of_week === day.value);
            return (
                existing || {
                    day_of_week: day.value,
                    start_time: null,
                    end_time: null,
                    is_available: false,
                }
            );
        });
        setLocalSchedules(mappedSchedules);
        scheduleForm.setData('schedules', mappedSchedules);
        scheduleForm.setData('barber_id', selectedBarberId);
        timeOffForm.setData('barber_id', selectedBarberId);
    }, [schedules, selectedBarberId]);

    const handleScheduleChange = (index: number, field: string, value: any) => {
        const updated = [...localSchedules];
        if (field === 'is_available') {
            updated[index] = value
                ? {
                      ...updated[index],
                      is_available: true,
                      start_time: updated[index].start_time || '09:00',
                      end_time: updated[index].end_time || '18:00',
                  }
                : {
                      ...updated[index],
                      is_available: false,
                      start_time: '',
                      end_time: '',
                  };
        } else {
            updated[index] = { ...updated[index], [field]: value || '' };
        }
        setLocalSchedules(updated);
        scheduleForm.setData('schedules', updated);
    };

    const handleSaveSchedule = () => {
        scheduleForm.post(route('admin.schedules.update'), {
            preserveScroll: true,
            onSuccess: () => {
                scheduleForm.setData('schedules', localSchedules);
            },
        });
    };

    const handleAddTimeOff = (e: React.FormEvent) => {
        e.preventDefault();
        timeOffForm.post(route('admin.schedules.timeoff.store'), {
            preserveScroll: true,
            onSuccess: () =>
                timeOffForm.reset('start_date', 'end_date', 'reason'),
        });
    };

    const handleDeleteTimeOff = (id: number) => {
        if (confirm('Are you sure you want to delete this time off?')) {
            router.delete(route('admin.schedules.timeoff.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

    return (
        <AuthenticatedLayout>
            <Head title="Schedule Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 sm:text-3xl lg:text-4xl">
                                    Schedule Management
                                </h1>
                                <p className="mt-1 text-base text-gray-600 sm:text-lg">
                                    Manage barber schedules and time off
                                </p>
                            </div>
                            <motion.div className="flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-white">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {
                                        Intl.DateTimeFormat().resolvedOptions()
                                            .timeZone
                                    }
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Flash Success */}
                    <AnimatePresence>
                        {flash?.success && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 sm:mb-6"
                            >
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center gap-3 text-green-800">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                            <Save className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-medium sm:text-base">
                                            {flash.success}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Barber Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 sm:mb-8"
                    >
                        <Label className="mb-3 block text-sm font-medium text-gray-700">
                            Select Barber
                        </Label>
                        <div className="relative">
                            <Users className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <select
                                value={selectedBarberId}
                                onChange={(e) =>
                                    setSelectedBarberId(Number(e.target.value))
                                }
                                className="h-12 w-full appearance-none rounded-xl border-2 border-gray-300 bg-white pl-11 pr-10 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                            >
                                {barbers.map((barber) => (
                                    <option key={barber.id} value={barber.id}>
                                        {barber.name} • {barber.email}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Weekly Schedule Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <div className="space-y-4 sm:space-y-6">
                                {/* Section Header */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
                                        Weekly Schedule
                                    </h2>
                                    <p className="mt-1 text-gray-600">
                                        Set working hours for{' '}
                                        {selectedBarber?.name}
                                    </p>
                                </div>

                                {/* Schedule Grid - Mobile Optimized */}
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid gap-3 sm:gap-4"
                                >
                                    {DAYS.map((day, index) => (
                                        <motion.div
                                            key={day.value}
                                            // @ts-ignore
                                            variants={item}
                                            whileHover={{
                                                scale: 1.01,
                                                borderColor: 'rgb(156 163 175)',
                                            }}
                                            className="rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                {/* Day and Toggle */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={
                                                                localSchedules[
                                                                    index
                                                                ].is_available
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    'is_available',
                                                                    checked,
                                                                )
                                                            }
                                                            className="h-6 w-11 data-[state=checked]:bg-black"
                                                        />
                                                        <div className="min-w-[80px] sm:min-w-[100px]">
                                                            <Label className="block text-base font-semibold text-gray-900 sm:hidden">
                                                                {day.label}
                                                            </Label>
                                                            <Label className="hidden text-base font-semibold text-gray-900 sm:block">
                                                                {day.fullLabel}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Time Inputs */}
                                                {localSchedules[index]
                                                    .is_available ? (
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="grid flex-1 grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-gray-500">
                                                                    Start
                                                                </Label>
                                                                <Input
                                                                    type="time"
                                                                    value={
                                                                        localSchedules[
                                                                            index
                                                                        ]
                                                                            .start_time ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            'start_time',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                    className="h-10 rounded-xl border-2 border-gray-300 text-sm sm:text-base"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-gray-500">
                                                                    End
                                                                </Label>
                                                                <Input
                                                                    type="time"
                                                                    value={
                                                                        localSchedules[
                                                                            index
                                                                        ]
                                                                            .end_time ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleScheduleChange(
                                                                            index,
                                                                            'end_time',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                    className="h-10 rounded-xl border-2 border-gray-300 text-sm sm:text-base"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 text-center sm:text-left">
                                                        <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500">
                                                            Unavailable
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Error Alert */}
                                <AnimatePresence>
                                    {Object.keys(scheduleForm.errors).length >
                                        0 && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="rounded-xl border border-red-200 bg-red-50 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-red-800 sm:text-base">
                                                        Validation Error
                                                    </h4>
                                                    <ul className="mt-1 space-y-1 text-sm text-red-700">
                                                        {Object.values(
                                                            scheduleForm.errors,
                                                        ).map((error, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                                                {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Save Button */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="pt-2"
                                >
                                    <Button
                                        onClick={handleSaveSchedule}
                                        disabled={scheduleForm.processing}
                                        className="relative h-12 w-full overflow-hidden rounded-xl bg-black text-base font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
                                    >
                                        <motion.span
                                            animate={
                                                scheduleForm.processing
                                                    ? { opacity: [1, 0.7, 1] }
                                                    : {}
                                            }
                                            transition={{
                                                duration: 1,
                                                repeat: scheduleForm.processing
                                                    ? Infinity
                                                    : 0,
                                            }}
                                            className="flex items-center justify-center"
                                        >
                                            {scheduleForm.processing ? (
                                                <>
                                                    <motion.div
                                                        animate={{
                                                            rotate: 360,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                        className="mr-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                                                    />
                                                    <Loader />
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-5 w-5" />
                                                    Save Schedule
                                                </>
                                            )}
                                        </motion.span>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Time Off Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <div className="space-y-4 sm:space-y-6">
                                {/* Section Header */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
                                        Time Off
                                    </h2>
                                    <p className="mt-1 text-gray-600">
                                        Manage time off requests
                                    </p>
                                </div>

                                {/* Add Time Off Form */}
                                <motion.form
                                    onSubmit={handleAddTimeOff}
                                    className="space-y-4"
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                >
                                    <motion.div
                                        // @ts-ignore
                                        variants={item}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                    >
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Start Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={
                                                    timeOffForm.data.start_date
                                                }
                                                onChange={(e) =>
                                                    timeOffForm.setData(
                                                        'start_date',
                                                        e.target.value,
                                                    )
                                                }
                                                min={format(
                                                    new Date(),
                                                    'yyyy-MM-dd',
                                                )}
                                                className="h-11 rounded-xl border-2 border-gray-300"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                End Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={
                                                    timeOffForm.data.end_date
                                                }
                                                onChange={(e) =>
                                                    timeOffForm.setData(
                                                        'end_date',
                                                        e.target.value,
                                                    )
                                                }
                                                min={
                                                    timeOffForm.data
                                                        .start_date ||
                                                    format(
                                                        new Date(),
                                                        'yyyy-MM-dd',
                                                    )
                                                }
                                                className="h-11 rounded-xl border-2 border-gray-300"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        // @ts-ignore
                                        variants={item}
                                        className="space-y-2"
                                    >
                                        <Label className="text-sm font-medium text-gray-700">
                                            Reason
                                        </Label>
                                        <Textarea
                                            value={timeOffForm.data.reason}
                                            onChange={(e) =>
                                                timeOffForm.setData(
                                                    'reason',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Vacation, personal matters, sick leave..."
                                            className="h-24 resize-none rounded-xl border-2 border-gray-300 text-base"
                                            required
                                        />
                                    </motion.div>

                                    <motion.div
                                        // @ts-ignore
                                        variants={item}
                                    >
                                        <Button
                                            type="submit"
                                            disabled={timeOffForm.processing}
                                            className="h-12 w-full rounded-xl bg-black text-base font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            {timeOffForm.processing
                                                ? 'Adding...'
                                                : 'Add Time Off'}
                                        </Button>
                                    </motion.div>
                                </motion.form>

                                {/* Time Off List */}
                                {timeOff.length > 0 && (
                                    <motion.div
                                        className="space-y-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Scheduled Time Off
                                        </h3>
                                        <motion.div
                                            variants={container}
                                            initial="hidden"
                                            animate="show"
                                            className="max-h-[400px] space-y-3 overflow-y-auto"
                                        >
                                            {timeOff.map(
                                                (item: BarberTimeOff) => {
                                                    const start = new Date(
                                                        item.start_date,
                                                    );
                                                    const end = new Date(
                                                        item.end_date,
                                                    );
                                                    const isSameDay =
                                                        start.toDateString() ===
                                                        end.toDateString();

                                                    return (
                                                        <motion.div
                                                            key={item.id}
                                                            // @ts-ignore
                                                            variants={item}
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            className="group rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-gray-300"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                                                        <span className="truncate">
                                                                            {format(
                                                                                start,
                                                                                'MMM d, yyyy',
                                                                            )}
                                                                            {isSameDay
                                                                                ? ''
                                                                                : ` - ${format(end, 'MMM d, yyyy')}`}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                                        {
                                                                            item.reason
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleDeleteTimeOff(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 flex-shrink-0 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                },
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
