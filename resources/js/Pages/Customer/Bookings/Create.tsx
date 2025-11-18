import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
    DiscountRecommendation,
    PageProps,
    Service,
    User as UserType,
    ValidateDiscountResponse,
} from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    DollarSign,
    Gift,
    Loader,
    Logs,
    Scissors,
    Star,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15,
            ease: 'easeOut',
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

const pulseAnimation = {
    scale: [1, 1.03, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

const discountSlideIn = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: {
        opacity: 1,
        y: 0,
        height: 'auto',
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
};

interface CreateBookingProps extends PageProps {
    barbers: UserType[];
    services: Service[];
    selected_barber_id?: number;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function Create({
    barbers,
    services,
    selected_barber_id,
}: CreateBookingProps) {
    const [selectedBarber, setSelectedBarber] = useState<UserType | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(
        null,
    );
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<
        ValidateDiscountResponse['discount'] | null
    >(null);
    const [validatingDiscount, setValidatingDiscount] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [discountRecommendations, setDiscountRecommendations] = useState<DiscountRecommendation[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showDiscountDropdown, setShowDiscountDropdown] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        barber_id: '',
        service_id: '',
        booking_date: '',
        start_time: '',
        notes: '',
        discount_code: '',
    });

    // Auto-select barber
    useEffect(() => {
        if (selected_barber_id) {
            const barber = barbers.find((b) => b.id === selected_barber_id);
            if (barber) {
                setSelectedBarber(barber);
                setData('barber_id', barber.id.toString());
            }
        }
    }, [selected_barber_id, barbers, setData]);

    // Fetch time slots
    useEffect(() => {
        let isMounted = true;

        const fetchTimeSlots = async () => {
            if (!selectedBarber || !selectedService || !selectedDate) {
                if (isMounted) {
                    setTimeSlots([]);
                    setSelectedTime('');
                }
                return;
            }

            setLoadingSlots(true);
            try {
                const response = await axios.get(
                    route('customer.barbers.slots', selectedBarber.id),
                    {
                        params: {
                            date: format(selectedDate, 'yyyy-MM-dd'),
                            service_id: selectedService.id,
                        },
                    },
                );

                if (isMounted) {
                    setTimeSlots(response.data.slots || []);
                }
            } catch (error) {
                if (isMounted) {
                    setTimeSlots([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingSlots(false);
                }
            }
        };

        fetchTimeSlots();

        return () => {
            isMounted = false;
        };
    }, [selectedBarber, selectedService, selectedDate]);

    const handleBarberChange = (barberId: string) => {
        const barber = barbers.find((b) => b.id.toString() === barberId);
        setSelectedBarber(barber || null);
        setData('barber_id', barberId);
        setSelectedService(null);
        setData('service_id', '');
        setCurrentStep(2);
        resetDiscount();
    };

    const handleServiceChange = (serviceId: string) => {
        const service = services.find((s) => s.id.toString() === serviceId);
        setSelectedService(service || null);
        setData('service_id', serviceId);
        setCurrentStep(3);
        resetDiscount();
    };

    const handleDateChange = (date: Date | undefined) => {
        setSelectedDate(date);
        setData('booking_date', date ? format(date, 'yyyy-MM-dd') : '');
        setSelectedTime('');
        setData('start_time', '');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setData('start_time', time);
        setCurrentStep(4);
    };

    const fetchDiscountRecommendations = async () => {
        if (!selectedService || !selectedBarber) return;

        setLoadingRecommendations(true);
        try {
            const response = await axios.get(
                route('customer.discounts.recommendations'),
                {
                    params: {
                        service_id: selectedService.id,
                        barber_id: selectedBarber.id,
                        original_price: getFinalPrice(),
                    },
                },
            );

            if (response.data.success) {
                setDiscountRecommendations(response.data.recommendations || []);
            }
        } catch (error) {
            console.error('Failed to fetch discount recommendations:', error);
            setDiscountRecommendations([]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    useEffect(() => {
        if (selectedService && selectedBarber) {
            fetchDiscountRecommendations();
        } else {
            setDiscountRecommendations([]);
        }
    }, [selectedService, selectedBarber]);

    const handleSelectDiscount = async (discount: DiscountRecommendation) => {
        if (!discount.is_eligible) return;

        setDiscountCode(discount.code);
        setShowDiscountDropdown(false);

        setValidatingDiscount(true);
        setDiscountError('');

        try {
            const response = await axios.post(
                route('customer.discounts.validate'),
                {
                    discount_code: discount.code,
                    service_id: selectedService?.id,
                    barber_id: selectedBarber?.id,
                    original_price: getFinalPrice(),
                },
            );

            if (response.data.success) {
                setAppliedDiscount(response.data.discount);
                setData('discount_code', discount.code);
            } else {
                setDiscountError(response.data.message);
            }
        } catch (error: any) {
            setDiscountError(error.response?.data?.message || 'Failed to apply discount');
        } finally {
            setValidatingDiscount(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim() || !selectedService || !selectedBarber) return;

        setValidatingDiscount(true);
        setDiscountError('');

        try {
            const response = await axios.post(
                route('customer.discounts.validate'),
                {
                    discount_code: discountCode.trim(),
                    service_id: selectedService.id,
                    barber_id: selectedBarber.id,
                    original_price: getFinalPrice(),
                },
            );

            if (response.data.success) {
                setAppliedDiscount(response.data.discount);
                setData('discount_code', discountCode.trim());
            } else {
                setDiscountError(response.data.message);
            }
        } catch (error: any) {
            setDiscountError(
                error.response?.data?.message ||
                    'Failed to validate discount code',
            );
        } finally {
            setValidatingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        resetDiscount();
    };

    const resetDiscount = () => {
        setDiscountCode('');
        setAppliedDiscount(null);
        setDiscountError('');
        setData('discount_code', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.bookings.store'));
    };

    const getBarberServices = () => {
        if (!selectedBarber?.barber_profile?.services) return [];
        return selectedBarber.barber_profile.services;
    };

    const getFinalPrice = () => {
        if (!selectedService || !selectedBarber) return 0;
        const barberService = selectedBarber.barber_profile?.services?.find(
            (s: any) => s.id === selectedService.id,
        );
        const customPrice = barberService?.pivot?.custom_price;
        return customPrice !== null && customPrice !== undefined
            ? customPrice
            : selectedService.base_price;
    };

    const getDiscountedPrice = () => {
        const finalPrice = getFinalPrice();
        if (!appliedDiscount) return finalPrice;
        return appliedDiscount.final_price;
    };

    const getDiscountValue = () => {
        if (!appliedDiscount) return 0;
        return appliedDiscount.discount_value;
    };

    const getDiscountAmount = () => {
        if (!appliedDiscount) return 0;
        return appliedDiscount.discount_amount;
    };

    const steps = [
        { number: 1, title: 'Select Barber', completed: !!selectedBarber },
        { number: 2, title: 'Choose Service', completed: !!selectedService },
        {
            number: 3,
            title: 'Pick Date & Time',
            completed: !!selectedDate && !!selectedTime,
        },
        { number: 4, title: 'Confirm Booking', completed: false },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Book Appointment" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white py-4 sm:py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 sm:mb-8"
                    >
                        {/* Back Button */}
                        <Link href={route('customer.bookings.index')}>
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
                                    Back to Bookings
                                </span>
                                </Button>
                            </motion.div>
                        </Link>

                        <div className="space-y-3">
                            <motion.h1
                                className="text-2xl font-bold tracking-tight text-black sm:text-4xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                Book Your Appointment
                            </motion.h1>
                            <motion.p
                                className="text-zinc-600 sm:text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Schedule your perfect grooming experience in
                                just a few steps
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Progress Steps - Desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 hidden sm:block"
                    >
                        <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => (
                                        <motion.div
                                            key={step.number}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 font-semibold transition-all duration-300 ${
                                                    step.completed
                                                        ? 'border-black bg-black text-white'
                                                        : step.number ===
                                                            currentStep
                                                          ? 'border-black text-black'
                                                          : 'border-zinc-300 text-zinc-400'
                                                }`}
                                            >
                                                {step.completed
                                                    ? '✓'
                                                    : step.number}
                                            </div>
                                            <div
                                                className={`font-medium ${
                                                    step.number === currentStep
                                                        ? 'text-black'
                                                        : 'text-zinc-500'
                                                }`}
                                            >
                                                {step.title}
                                            </div>
                                            {index < steps.length - 1 && (
                                                <ChevronRight className="mx-4 h-4 w-4 text-zinc-300" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Progress Steps - Mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 sm:hidden"
                    >
                        <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="mb-2 text-sm font-medium text-zinc-600">
                                        Step {currentStep} of 4
                                    </div>
                                    <div className="text-lg font-semibold text-black">
                                        {
                                            steps.find(
                                                (s) => s.number === currentStep,
                                            )?.title
                                        }
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-center gap-2">
                                    {steps.map((step) => (
                                        <div
                                            key={step.number}
                                            className={`h-2 w-8 rounded-full transition-all duration-300 ${
                                                step.number === currentStep
                                                    ? 'bg-black'
                                                    : step.number < currentStep
                                                      ? 'bg-zinc-800'
                                                      : 'bg-zinc-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Side - Form Steps */}
                            <motion.div
                                // @ts-ignore
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6 lg:col-span-2"
                            >
                                {/* Select Barber */}
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}
                                >
                                    <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    // @ts-ignore
                                                    animate={
                                                        currentStep === 1
                                                            ? pulseAnimation
                                                            : {}
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white"
                                                >
                                                    1
                                                </motion.div>
                                                <div>
                                                    <CardTitle className="text-black">
                                                        Select Your Barber
                                                    </CardTitle>
                                                    <CardDescription className="text-zinc-600">
                                                        Choose from our expert
                                                        grooming professionals
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="barber-select"
                                                        className="text-sm font-medium text-zinc-700"
                                                    >
                                                        Barber
                                                    </Label>
                                                    <Select
                                                        value={data.barber_id}
                                                        onValueChange={
                                                            handleBarberChange
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id="barber-select"
                                                            className={`h-12 w-full border-zinc-300 bg-white ${
                                                                errors.barber_id
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <SelectValue placeholder="Choose your barber..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60">
                                                            {barbers.map(
                                                                (barber) => (
                                                                    <SelectItem
                                                                        key={
                                                                            barber.id
                                                                        }
                                                                        value={barber.id.toString()}
                                                                        className="py-3"
                                                                    >
                                                                        <div className="flex w-full items-center justify-between">
                                                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 text-sm font-bold text-white">
                                                                                    {barber.name.charAt(
                                                                                        0,
                                                                                    )}
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="truncate font-medium text-black">
                                                                                        {
                                                                                            barber.name
                                                                                        }
                                                                                    </div>
                                                                                    {barber
                                                                                        .barber_profile
                                                                                        ?.specialization && (
                                                                                        <div className="truncate text-xs text-zinc-500">
                                                                                            {
                                                                                                barber
                                                                                                    .barber_profile
                                                                                                    .specialization
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="ml-3 flex-shrink-0 text-right">
                                                                                <div className="flex items-center gap-1 text-xs">
                                                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                                    <span className="font-medium text-black">
                                                                                        {barber
                                                                                            .barber_profile
                                                                                            ?.rating_average ||
                                                                                            '0.0'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="text-xs text-zinc-500">
                                                                                    {barber
                                                                                        .barber_profile
                                                                                        ?.total_reviews ||
                                                                                        0}{' '}
                                                                                    reviews
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {errors.barber_id && (
                                                    <motion.p
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        className="text-sm text-red-500"
                                                    >
                                                        {errors.barber_id}
                                                    </motion.p>
                                                )}

                                                <AnimatePresence>
                                                    {selectedBarber && (
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
                                                            transition={{
                                                                duration: 0.3,
                                                            }}
                                                            className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-4"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-2xl font-bold text-white"
                                                                >
                                                                    {selectedBarber.name.charAt(
                                                                        0,
                                                                    )}
                                                                </motion.div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="truncate text-lg font-bold text-black">
                                                                        {
                                                                            selectedBarber.name
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-zinc-600">
                                                                        {
                                                                            selectedBarber
                                                                                .barber_profile
                                                                                ?.specialization
                                                                        }
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                                                        <Badge className="bg-black text-xs text-white">
                                                                            ⭐{' '}
                                                                            {selectedBarber
                                                                                .barber_profile
                                                                                ?.rating_average ||
                                                                                '0.0'}
                                                                        </Badge>
                                                                        <span className="text-xs text-zinc-500">
                                                                            {selectedBarber
                                                                                .barber_profile
                                                                                ?.total_reviews ||
                                                                                0}{' '}
                                                                            reviews
                                                                        </span>
                                                                        {selectedBarber
                                                                            .barber_profile
                                                                            ?.is_available && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="border-green-500 text-xs text-green-600"
                                                                            >
                                                                                Available
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Select Service */}
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}
                                    animate={
                                        selectedBarber ? 'visible' : 'hidden'
                                    }
                                >
                                    <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    // @ts-ignore
                                                    animate={
                                                        currentStep === 2
                                                            ? pulseAnimation
                                                            : {}
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white"
                                                >
                                                    2
                                                </motion.div>
                                                <div>
                                                    <CardTitle className="text-black">
                                                        Choose Service
                                                    </CardTitle>
                                                    <CardDescription className="text-zinc-600">
                                                        Select your preferred
                                                        grooming service
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="service-select"
                                                    className="text-sm font-medium text-zinc-700"
                                                >
                                                    Service
                                                </Label>
                                                <Select
                                                    value={data.service_id}
                                                    onValueChange={
                                                        handleServiceChange
                                                    }
                                                    disabled={!selectedBarber}
                                                >
                                                    <SelectTrigger
                                                        id="service-select"
                                                        className={`h-12 w-full border-zinc-300 bg-white ${
                                                            errors.service_id
                                                                ? 'border-red-500'
                                                                : ''
                                                        } ${!selectedBarber ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    >
                                                        <SelectValue
                                                            placeholder={
                                                                selectedBarber
                                                                    ? 'Select a service...'
                                                                    : 'Select a barber first'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {getBarberServices().map(
                                                            (service: any) => (
                                                                <SelectItem
                                                                    key={
                                                                        service.id
                                                                    }
                                                                    value={service.id.toString()}
                                                                    className="py-3"
                                                                >
                                                                    <div className="flex w-full items-center justify-between">
                                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                                            <Scissors className="h-5 w-5 flex-shrink-0 text-zinc-600" />
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="truncate font-medium text-black">
                                                                                    {
                                                                                        service.name
                                                                                    }
                                                                                </div>
                                                                                <div className="text-sm text-zinc-500">
                                                                                    {
                                                                                        service.duration
                                                                                    }{' '}
                                                                                    minutes
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-3 flex-shrink-0 text-right font-bold text-black">
                                                                            Rp{' '}
                                                                            {Number(
                                                                                service
                                                                                    .pivot
                                                                                    ?.custom_price ||
                                                                                    service.base_price,
                                                                            ).toLocaleString(
                                                                                'id-ID',
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {errors.service_id && (
                                                <motion.p
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="mt-2 text-sm text-red-500"
                                                >
                                                    {errors.service_id}
                                                </motion.p>
                                            )}

                                            {/* Service Details */}
                                            <AnimatePresence>
                                                {selectedService && (
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
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                        className="mt-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Scissors className="h-8 w-8 text-zinc-600" />
                                                                <div>
                                                                    <h4 className="font-bold text-black">
                                                                        {
                                                                            selectedService.name
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-zinc-600">
                                                                        {
                                                                            selectedService.duration
                                                                        }{' '}
                                                                        minutes
                                                                        •{' '}
                                                                        {
                                                                            selectedService.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-black">
                                                                    Rp{' '}
                                                                    {getFinalPrice().toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-zinc-500">
                                                                    Total price
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Date & Time */}
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}
                                    animate={
                                        selectedService ? 'visible' : 'hidden'
                                    }
                                >
                                    <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    // @ts-ignore
                                                    animate={
                                                        currentStep === 3
                                                            ? pulseAnimation
                                                            : {}
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white"
                                                >
                                                    3
                                                </motion.div>
                                                <div>
                                                    <CardTitle className="text-black">
                                                        Pick Date & Time
                                                    </CardTitle>
                                                    <CardDescription className="text-zinc-600">
                                                        Choose your preferred
                                                        schedule
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid gap-6 lg:grid-cols-2">
                                                {/* Calendar */}
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.4,
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <Label className="text-sm font-medium text-zinc-700">
                                                        Select Date
                                                    </Label>
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={
                                                            handleDateChange
                                                        }
                                                        disabled={(date) =>
                                                            date < new Date() ||
                                                            !selectedService
                                                        }
                                                        className="rounded-xl border border-zinc-300 bg-white"
                                                    />
                                                    {errors.booking_date && (
                                                        <motion.p
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            className="text-sm text-red-500"
                                                        >
                                                            {
                                                                errors.booking_date
                                                            }
                                                        </motion.p>
                                                    )}
                                                </motion.div>

                                                {/* Time Slots */}
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium text-zinc-700">
                                                        Available Times
                                                    </Label>
                                                    <AnimatePresence mode="wait">
                                                        {!selectedDate ? (
                                                            <motion.div
                                                                key="no-date"
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                }}
                                                                className="py-12 text-center"
                                                            >
                                                                <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                                                                <p className="text-sm text-zinc-500">
                                                                    Select a
                                                                    date to see
                                                                    available
                                                                    time slots
                                                                </p>
                                                            </motion.div>
                                                        ) : loadingSlots ? (
                                                            <motion.div
                                                                key="loading"
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                }}
                                                                className="py-12 text-center"
                                                            >
                                                                <motion.div
                                                                    animate={{
                                                                        rotate: 360,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        repeat: Infinity,
                                                                        ease: 'linear',
                                                                    }}
                                                                    className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-black border-t-transparent"
                                                                />
                                                                <p className="text-sm text-zinc-500">
                                                                    Loading
                                                                    available
                                                                    slots...
                                                                </p>
                                                            </motion.div>
                                                        ) : timeSlots.length ===
                                                          0 ? (
                                                            <motion.div
                                                                key="no-slots"
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                }}
                                                                className="py-12 text-center"
                                                            >
                                                                <Clock className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                                                                <p className="text-sm text-zinc-500">
                                                                    No available
                                                                    slots for
                                                                    this date
                                                                </p>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="slots"
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                }}
                                                                className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3"
                                                            >
                                                                {timeSlots.map(
                                                                    (
                                                                        slot,
                                                                        index,
                                                                    ) => (
                                                                        <motion.button
                                                                            key={
                                                                                slot.time
                                                                            }
                                                                            type="button"
                                                                            initial={{
                                                                                opacity: 0,
                                                                                scale: 0.8,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                                scale: 1,
                                                                            }}
                                                                            transition={{
                                                                                delay:
                                                                                    index *
                                                                                    0.05,
                                                                            }}
                                                                            whileHover={
                                                                                slot.available
                                                                                    ? {
                                                                                          scale: 1.05,
                                                                                      }
                                                                                    : {}
                                                                            }
                                                                            whileTap={
                                                                                slot.available
                                                                                    ? {
                                                                                          scale: 0.95,
                                                                                      }
                                                                                    : {}
                                                                            }
                                                                            className={`rounded-xl border-2 p-3 text-sm font-medium transition-all duration-300 ${
                                                                                selectedTime ===
                                                                                slot.time
                                                                                    ? 'border-black bg-black text-white'
                                                                                    : slot.available
                                                                                      ? 'border-zinc-300 text-zinc-700 hover:border-black hover:bg-zinc-50'
                                                                                      : 'cursor-not-allowed border-zinc-200 text-zinc-400'
                                                                            }`}
                                                                            onClick={() =>
                                                                                slot.available &&
                                                                                handleTimeSelect(
                                                                                    slot.time,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !slot.available
                                                                            }
                                                                        >
                                                                            {
                                                                                slot.time
                                                                            }
                                                                        </motion.button>
                                                                    ),
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    {errors.start_time && (
                                                        <motion.p
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            className="text-sm text-red-500"
                                                        >
                                                            {errors.start_time}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Step 4: Additional Notes & Discount */}
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}
                                    animate={
                                        selectedTime ? 'visible' : 'hidden'
                                    }
                                >
                                    <Card className="border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    // @ts-ignore
                                                    animate={
                                                        currentStep === 4
                                                            ? pulseAnimation
                                                            : {}
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white"
                                                >
                                                    4
                                                </motion.div>
                                                <div>
                                                    <CardTitle className="text-black">
                                                        Additional Notes &
                                                        Discount
                                                    </CardTitle>
                                                    <CardDescription className="text-zinc-600">
                                                        Any special requests or
                                                        discount codes
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            {/* Discount Section */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-zinc-700">
                                                    Discount Code (Optional)
                                                </Label>

                                                {/* Discount Input Dropdown */}
                                                <div className="relative">
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                placeholder="Enter discount code or choose from available"
                                                                value={discountCode}
                                                                onChange={(e) => {
                                                                    setDiscountCode(e.target.value.toUpperCase());
                                                                    setShowDiscountDropdown(true);
                                                                }}
                                                                onFocus={() => setShowDiscountDropdown(true)}
                                                                disabled={!!appliedDiscount || validatingDiscount}
                                                                className="flex-1 border-zinc-300 bg-white pr-10"
                                                            />

                                                            {/* Dropdown Trigger */}
                                                            {!appliedDiscount && discountRecommendations.length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowDiscountDropdown(!showDiscountDropdown)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                                                >
                                                                    <ChevronDown className={`h-4 w-4 transition-transform ${showDiscountDropdown ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {!appliedDiscount ? (
                                                            <Button
                                                                type="button"
                                                                onClick={handleApplyDiscount}
                                                                disabled={!discountCode.trim() || validatingDiscount || !selectedService || !selectedBarber}
                                                                className="bg-black text-white hover:bg-zinc-800"
                                                            >
                                                                {validatingDiscount ? (
                                                                    <Loader className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    'Apply'
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                onClick={handleRemoveDiscount}
                                                                variant="outline"
                                                                className="border-red-300 text-red-600 hover:border-red-600 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Discount Recommendations Dropdown */}
                                                    <AnimatePresence>
                                                        {showDiscountDropdown && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10, height: 0 }}
                                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
                                                            >
                                                                <div className="p-2">
                                                                    <div className="mb-2 px-3 py-1 text-xs font-medium text-zinc-500">
                                                                        AVAILABLE DISCOUNTS
                                                                    </div>

                                                                    {loadingRecommendations ? (
                                                                        <div className="flex items-center justify-center py-4">
                                                                            <Loader className="h-4 w-4 animate-spin" />
                                                                            <span className="ml-2 text-sm text-zinc-500">Loading discounts...</span>
                                                                        </div>
                                                                    ) : (
                                                                        discountRecommendations.map((discount, index) => (
                                                                            <motion.button
                                                                                key={discount.id}
                                                                                type="button"
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: index * 0.05 }}
                                                                                onClick={() => handleSelectDiscount(discount)}
                                                                                disabled={!discount.is_eligible}
                                                                                className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-all ${
                                                                                    discount.is_eligible
                                                                                        ? 'hover:bg-zinc-50 hover:shadow-sm cursor-pointer'
                                                                                        : 'cursor-not-allowed opacity-50'
                                                                                }`}
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Gift className="h-4 w-4 text-green-600" />
                                                                                        <div>
                                                                                            <div className="font-medium text-black">
                                                                                                {discount.name}
                                                                                            </div>
                                                                                            <div className="text-sm text-zinc-500">
                                                                                                {discount.discount_type === 'percentage'
                                                                                                    ? `${Math.round(discount.discount_value)}% OFF`
                                                                                                    : `Rp ${discount.discount_amount.toLocaleString('id-ID')} OFF`
                                                                                                }
                                                                                                {discount.min_order_amount && (
                                                                                                    <span> • Min. order Rp {discount.min_order_amount.toLocaleString('id-ID')}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {discount.description && (
                                                                                        <div className="mt-1 text-xs text-zinc-400">
                                                                                            {discount.description}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex items-center gap-2">
                                                                                    {discount.is_eligible ? (
                                                                                        <>
                                                                                            <div className="text-right">
                                                                                                <div className="text-sm font-bold text-green-600">
                                                                                                    Rp {discount.final_price.toLocaleString('id-ID')}
                                                                                                </div>
                                                                                                <div className="text-xs text-zinc-400 line-through">
                                                                                                    Rp {getFinalPrice().toLocaleString('id-ID')}
                                                                                                </div>
                                                                                            </div>
                                                                                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                                                                                        </>
                                                                                    ) : (
                                                                                        <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                                                                                            Not eligible
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </motion.button>
                                                                        ))
                                                                    )}

                                                                    {!loadingRecommendations && discountRecommendations.length === 0 && (
                                                                        <div className="py-4 text-center text-sm text-zinc-500">
                                                                            No available discounts
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Click outside to close dropdown */}
                                                {showDiscountDropdown && (
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setShowDiscountDropdown(false)}
                                                    />
                                                )}

                                                {/* Discount Error */}
                                                {discountError && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500"
                                                    >
                                                        {discountError}
                                                    </motion.p>
                                                )}

                                                {/* Applied Discount */}
                                                <AnimatePresence>
                                                    {appliedDiscount && (
                                                        <motion.div
                                                            // @ts-ignore
                                                            variants={discountSlideIn}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="hidden"
                                                            className="rounded-xl border border-green-200 bg-green-50 p-4"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Gift className="h-5 w-5 text-green-600" />
                                                                    <div>
                                                                        <div className="font-semibold text-green-800">
                                                                            {appliedDiscount.name}
                                                                        </div>
                                                                        <div className="text-sm text-green-600">
                                                                            Code: {appliedDiscount.code} •
                                                                            {appliedDiscount.discount_type === 'percentage'
                                                                                ? ` ${Math.round(appliedDiscount.discount_value)}% OFF`
                                                                                : ` Rp ${appliedDiscount.discount_amount.toLocaleString('id-ID')} OFF`
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" className="border-green-500 text-green-600">
                                                                    Applied
                                                                </Badge>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Notes Section */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-zinc-700">
                                                    Additional Notes (Optional)
                                                </Label>
                                                <Textarea
                                                    placeholder="Tell your barber about any specific styling preferences, allergies, or special requirements..."
                                                    value={data.notes}
                                                    onChange={(e) =>
                                                        setData(
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                    className="resize-none border-zinc-300 bg-white"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Right Side - Booking Summary */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                // @ts-ignore
                                variants={slideInRight}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-6 border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-black">
                                            <Logs className="h-5 w-5" />
                                            Booking Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        {/* Barber Info */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex items-start gap-3"
                                        >
                                            <User className="mt-0.5 h-5 w-5 text-zinc-600" />
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-500">
                                                    Barber
                                                </p>
                                                <p className="font-semibold text-black">
                                                    {selectedBarber?.name ||
                                                        'Not selected'}
                                                </p>
                                            </div>
                                        </motion.div>

                                        <Separator className="bg-zinc-200" />

                                        {/* Service Info */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex items-start gap-3"
                                        >
                                            <Scissors className="mt-0.5 h-5 w-5 text-zinc-600" />
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-500">
                                                    Service
                                                </p>
                                                <p className="font-semibold text-black">
                                                    {selectedService?.name ||
                                                        'Not selected'}
                                                </p>
                                                {selectedService && (
                                                    <p className="text-sm text-zinc-600">
                                                        {
                                                            selectedService.duration
                                                        }{' '}
                                                        minutes
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>

                                        <Separator className="bg-zinc-200" />

                                        {/* Date & Time */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CalendarIcon className="mt-0.5 h-5 w-5 text-zinc-600" />
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-500">
                                                    Date & Time
                                                </p>
                                                <p className="font-semibold text-black">
                                                    {selectedDate
                                                        ? format(
                                                              selectedDate,
                                                              'EEE, MMM d',
                                                          )
                                                        : 'Not selected'}
                                                </p>
                                                <p className="text-sm text-zinc-600">
                                                    {selectedTime ||
                                                        'Not selected'}
                                                </p>
                                            </div>
                                        </motion.div>

                                        <Separator className="bg-zinc-200" />

                                        {/* Price Breakdown */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.65 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-600">
                                                    Service Price
                                                </span>
                                                <span className="font-medium text-black">
                                                    Rp{' '}
                                                    {getFinalPrice().toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>

                                            {appliedDiscount && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-yellow-600">
                                                        Discount
                                                    </span>
                                                    <span className="font-medium text-yellow-600">
                                                        {Math.round(
                                                            getDiscountValue(),
                                                        )}{' '}
                                                        %
                                                    </span>
                                                </motion.div>
                                            )}

                                            {appliedDiscount && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-green-600">
                                                        Discount Amount
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        - Rp{' '}
                                                        {getDiscountAmount().toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        <Separator className="bg-zinc-200" />

                                        {/* Total Price */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: 0.7,
                                                type: 'spring',
                                            }}
                                            className="flex items-start gap-3"
                                        >
                                            <DollarSign className="mt-0.5 h-5 w-5 text-zinc-600" />
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-500">
                                                    Total Amount
                                                </p>
                                                <p className="text-2xl font-bold text-black">
                                                    Rp{' '}
                                                    {getDiscountedPrice().toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </p>
                                                {appliedDiscount && (
                                                    <p className="text-sm text-green-600">
                                                        You save Rp{' '}
                                                        {getDiscountAmount().toLocaleString(
                                                            'id-ID',
                                                        )}
                                                        !
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>

                                        <Separator className="bg-zinc-200" />

                                        {/* Submit Button */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                type="submit"
                                                className="h-12 w-full bg-black text-base font-semibold hover:bg-zinc-800"
                                                disabled={
                                                    processing ||
                                                    !data.barber_id ||
                                                    !data.service_id ||
                                                    !data.booking_date ||
                                                    !data.start_time
                                                }
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
                                                        <Loader className="h-4 w-4" />
                                                        Processing...
                                                    </motion.div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Confirm Booking
                                                    </div>
                                                )}
                                            </Button>
                                        </motion.div>

                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                            className="text-center text-xs text-zinc-500"
                                        >
                                            You can cancel or reschedule up to 2
                                            hours before your appointment
                                        </motion.p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
