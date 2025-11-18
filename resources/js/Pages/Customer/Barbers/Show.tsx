import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageProps, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    Calendar,
    Clock,
    Star,
    Users,
    View,
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
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

const avatarVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
        scale: 1.05,
        rotate: 5,
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
};

const buttonVariants = {
    hover: {
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 },
    },
    tap: {
        scale: 0.98,
        y: 0,
    },
};

const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

interface BarberShowProps extends PageProps {
    barber: User;
}

export default function Show({ barber }: BarberShowProps) {
    const profile = barber.barber_profile;
    const isAvailable = profile?.is_available ?? false;

    const formatRating = (
        rating: number | string | null | undefined,
    ): string => {
        const num = Number(rating ?? 0);
        return isNaN(num) ? '0.0' : num.toFixed(1);
    };

    const formatPrice = (price: number | string): string => {
        return Number(price).toLocaleString('id-ID');
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${barber.name} - Barber Profile`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header with Back Button */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <Link href={route('customer.barbers.index')}>
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        className="group rounded-2xl border border-transparent px-4 py-2 backdrop-blur-sm hover:border-gray-200 hover:bg-white/50"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                        <span className="font-medium">
                                            Back to Barbers
                                        </span>
                                    </Button>
                                </motion.div>
                            </Link>

                            {/* Availability Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {isAvailable ? (
                                    <Badge className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                                        <div className="mr-2 h-2 w-2 rounded-full bg-white" />
                                        Available Now
                                    </Badge>
                                ) : (
                                    <Badge className="rounded-full bg-gray-400 px-4 py-2 text-sm font-medium text-white">
                                        Currently Unavailable
                                    </Badge>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                        {/* Left Sidebar - Profile Card */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            // @ts-ignore
                            variants={itemVariants}
                            className="lg:col-span-1"
                        >
                            <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                                <CardContent className="p-6 sm:p-8">
                                    {/* Avatar Section */}
                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <motion.div
                                            // @ts-ignore
                                            variants={avatarVariants}
                                            initial="initial"
                                            whileHover="hover"
                                            className="relative mb-6 cursor-pointer"
                                        >
                                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-2xl sm:h-32 sm:w-32">
                                                {barber.avatar_url ? (
                                                    <img
                                                        src={barber.avatar_url}
                                                        alt={barber.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-black text-white sm:text-4xl">
                                                        {barber.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Experience Badge */}
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: -180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 0.5,
                                                    type: 'spring',
                                                }}
                                                className="absolute -right-2 -top-2 rounded-full bg-black px-3 py-1 text-xs font-bold text-white shadow-lg"
                                            >
                                                {profile?.experience_years || 0}
                                                y
                                            </motion.div>
                                        </motion.div>

                                        <h1 className="mb-2 text-2xl font-black text-gray-900 sm:text-3xl">
                                            {barber.name}
                                        </h1>
                                        {profile?.specialization && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.6 }}
                                                className="text-lg font-medium text-gray-600"
                                            >
                                                {profile.specialization}
                                            </motion.p>
                                        )}
                                    </div>

                                    <Separator className="my-6 bg-gray-200" />

                                    {/* Stats Grid */}
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="mb-6 grid grid-cols-2 gap-4"
                                    >
                                        <motion.div
                                            // @ts-ignore
                                            variants={itemVariants}
                                            className="rounded-2xl bg-gray-50 p-4 text-center transition-colors hover:bg-gray-100"
                                        >
                                            <div className="mb-2 flex items-center justify-center gap-2">
                                                <Star className="h-5 w-5 fill-black text-black" />
                                                <span className="text-2xl font-black text-gray-900">
                                                    {formatRating(
                                                        profile?.rating_average,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Rating
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            // @ts-ignore
                                            variants={itemVariants}
                                            className="rounded-2xl bg-gray-50 p-4 text-center transition-colors hover:bg-gray-100"
                                        >
                                            <div className="mb-2 flex items-center justify-center gap-2">
                                                <Users className="h-5 w-5 text-gray-700" />
                                                <span className="text-2xl font-black text-gray-900">
                                                    {profile?.total_reviews ||
                                                        0}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Reviews
                                            </p>
                                        </motion.div>
                                    </motion.div>

                                    {/* Book Button */}
                                    <Link
                                        href={route(
                                            'customer.bookings.create',
                                            { barber_id: barber.id },
                                        )}
                                        className="block"
                                    >
                                        <motion.div
                                            variants={buttonVariants}
                                            whileHover={
                                                isAvailable
                                                    ? 'hover'
                                                    : undefined
                                            }
                                            whileTap={
                                                isAvailable ? 'tap' : undefined
                                            }
                                        >
                                            <Button
                                                className={`h-14 w-full rounded-2xl text-lg font-bold transition-all ${
                                                    isAvailable
                                                        ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:shadow-xl'
                                                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                                }`}
                                                disabled={!isAvailable}
                                            >
                                                <Calendar className="mr-3 h-5 w-5" />
                                                {isAvailable
                                                    ? 'Book Appointment'
                                                    : 'Not Available'}
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Right Content */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6 lg:col-span-2"
                        >
                            {/* About Section */}
                            {profile?.bio && (
                                <motion.div
                                    // @ts-ignore
                                    variants={itemVariants}
                                >
                                    <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                            <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
                                                <View className="h-6 w-6 text-black" />
                                                About Me
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-lg leading-relaxed text-gray-700"
                                            >
                                                {profile.bio}
                                            </motion.p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Services Section */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                            >
                                <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
                                            <Award className="h-6 w-6 text-black" />
                                            Services & Pricing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8">
                                        <AnimatePresence>
                                            {profile?.services &&
                                            profile.services.length > 0 ? (
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="grid gap-4"
                                                >
                                                    {profile.services.map(
                                                        (service) => (
                                                            <motion.div
                                                                key={service.id}
                                                                // @ts-ignore
                                                                variants={
                                                                    itemVariants
                                                                }
                                                                whileHover={{
                                                                    y: -4,
                                                                    scale: 1.02,
                                                                    transition:
                                                                        {
                                                                            duration: 0.2,
                                                                        },
                                                                }}
                                                                className="group flex cursor-pointer items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:border-black"
                                                            >
                                                                <div className="flex-1">
                                                                    <h3 className="mb-2 text-lg font-black text-gray-900 group-hover:text-black">
                                                                        {
                                                                            service.name
                                                                        }
                                                                    </h3>
                                                                    <div className="flex items-center gap-4 text-gray-600">
                                                                        <span className="flex items-center gap-2 font-medium">
                                                                            <Clock className="h-4 w-4" />
                                                                            {
                                                                                service.duration
                                                                            }{' '}
                                                                            min
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    className="text-right"
                                                                >
                                                                    <div className="text-2xl font-black text-gray-900 group-hover:text-black">
                                                                        Rp{' '}
                                                                        {formatPrice(
                                                                            service
                                                                                .pivot
                                                                                ?.custom_price ??
                                                                                service.base_price,
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </motion.div>
                                                        ),
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="py-12 text-center"
                                                >
                                                    <Award className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                                    <p className="text-lg text-gray-500">
                                                        No services listed yet
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Reviews Section */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                            >
                                <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
                                            <Star className="h-6 w-6 fill-black text-black" />
                                            Customer Reviews
                                            <Badge className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                                                {barber.received_reviews
                                                    ?.length || 0}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8">
                                        <AnimatePresence mode="wait">
                                            {barber.received_reviews &&
                                            barber.received_reviews.length >
                                                0 ? (
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="space-y-6"
                                                >
                                                    {barber.received_reviews.map(
                                                        (review) => (
                                                            <motion.div
                                                                key={review.id}
                                                                // @ts-ignore
                                                                variants={
                                                                    itemVariants
                                                                }
                                                                whileHover={{
                                                                    x: 4,
                                                                    transition:
                                                                        {
                                                                            duration: 0.2,
                                                                        },
                                                                }}
                                                                className="rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:border-gray-400"
                                                            >
                                                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-600 text-sm font-bold text-white">
                                                                            {review.customer?.name
                                                                                ?.charAt(
                                                                                    0,
                                                                                )
                                                                                .toUpperCase() ||
                                                                                'A'}
                                                                        </div>
                                                                        <span className="font-black text-gray-900">
                                                                            {review
                                                                                .customer
                                                                                ?.name ||
                                                                                'Anonymous'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex gap-0.5">
                                                                            {[
                                                                                1,
                                                                                2,
                                                                                3,
                                                                                4,
                                                                                5,
                                                                            ].map(
                                                                                (
                                                                                    star,
                                                                                ) => (
                                                                                    <Star
                                                                                        key={
                                                                                            star
                                                                                        }
                                                                                        className={`h-4 w-4 transition-colors ${
                                                                                            star <=
                                                                                            review.rating
                                                                                                ? 'fill-black text-black'
                                                                                                : 'text-gray-300'
                                                                                        }`}
                                                                                    />
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        {review.created_at && (
                                                                            <span className="text-sm text-gray-500">
                                                                                {formatDate(
                                                                                    review.created_at,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {review.comment && (
                                                                    <motion.p
                                                                        initial={{
                                                                            opacity: 0,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay: 0.2,
                                                                        }}
                                                                        className="leading-relaxed text-gray-700"
                                                                    >
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </motion.p>
                                                                )}
                                                            </motion.div>
                                                        ),
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    className="py-12 text-center"
                                                >
                                                    <motion.div
                                                        // @ts-ignore
                                                        animate={
                                                            floatingAnimation
                                                        }
                                                        className="mb-4"
                                                    >
                                                        <Star className="mx-auto h-16 w-16 text-gray-300" />
                                                    </motion.div>
                                                    <h3 className="mb-2 text-xl font-black text-gray-900">
                                                        No Reviews Yet
                                                    </h3>
                                                    <p className="text-lg text-gray-500">
                                                        Be the first to review{' '}
                                                        {barber.name}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
