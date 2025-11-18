import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    BarberFilters,
    PageProps,
    PaginatedData,
    PaginationLink,
    Service,
    User,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    Calendar,
    HandHeart,
    Search,
    Star,
    UserRoundSearch,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface BarbersIndexProps extends PageProps {
    barbers: PaginatedData<User>;
    services: Service[];
    filters: BarberFilters;
}

const cardVariants: Variants = {
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
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    hover: {
        y: -8,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.1,
        },
    },
} satisfies Variants;

export default function Index({
    barbers,
    services,
    filters,
}: BarbersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [serviceId, setServiceId] = useState(filters.service_id || 'all');
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useCallback(
        debounce(() => {
            setIsLoading(true);
            router.get(
                route('customer.barbers.index'),
                {
                    search: search || undefined,
                    service_id: serviceId === 'all' ? undefined : serviceId,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 500),
        [search, serviceId],
    );

    useEffect(() => {
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [search, serviceId, debouncedSearch]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            debouncedSearch.flush();
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Find Barbers" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
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
                                        <UserRoundSearch className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl">
                                            Find Your Barber
                                        </h1>
                                        <p className="mt-2 text-lg text-zinc-600">
                                            Discover skilled barbers who
                                            understand your style
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search & Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-12"
                    >
                        <Card className="rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                            <CardContent className="p-6 sm:p-8">
                                <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
                                    {/* Search Input */}
                                    <div className="relative w-full flex-1">
                                        <motion.div
                                            whileFocus={{ scale: 1.02 }}
                                            className="relative"
                                        >
                                            <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search barber by name..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                onKeyUp={handleKeyPress}
                                                className="pl-10"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Service Filter */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileFocus={{ scale: 1.02 }}
                                        className="w-full lg:w-56"
                                    >
                                        <Select
                                            value={serviceId}
                                            onValueChange={setServiceId}
                                        >
                                            <SelectTrigger className="text-md">
                                                <HandHeart className="h-4 w-4" />
                                                <SelectValue placeholder="All Services" />
                                            </SelectTrigger>
                                            <SelectContent className="border-zinc-300">
                                                <SelectItem value="all">
                                                    All Services
                                                </SelectItem>
                                                {services.map((service) => (
                                                    <SelectItem
                                                        key={service.id}
                                                        value={service.id.toString()}
                                                    >
                                                        {service.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Barbers Grid */}
                    <AnimatePresence mode="wait">
                        {barbers.data.length === 0 && !isLoading ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="py-16 text-center"
                            >
                                <motion.div className="mb-6">
                                    <Search className="mx-auto h-20 w-20 text-gray-300" />
                                </motion.div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                                    No barbers found
                                </h3>
                                <p className="mx-auto max-w-md text-lg text-gray-600">
                                    Try adjusting your search terms or filters
                                    to find what you're looking for
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {barbers.data.map((barber, index) => (
                                    <motion.div
                                        key={barber.id}
                                        variants={cardVariants}
                                        whileHover="hover"
                                        layout
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.05,
                                        }}
                                    >
                                        <Card className="group h-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                            <CardContent className="flex h-full flex-col p-0">
                                                {/* Header with Avatar */}
                                                <div className="relative p-6 pb-4">
                                                    <div className="flex items-start justify-between">
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            className="relative"
                                                        >
                                                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg">
                                                                {barber.avatar_url ? (
                                                                    <img
                                                                        src={
                                                                            barber.avatar_url
                                                                        }
                                                                        alt={
                                                                            barber.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-2xl font-bold text-white">
                                                                        {barber.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Online Status Indicator */}
                                                            {barber
                                                                .barber_profile
                                                                ?.is_available && (
                                                                <motion.div
                                                                    initial={{
                                                                        scale: 0,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                    }}
                                                                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500"
                                                                />
                                                            )}
                                                        </motion.div>

                                                        {/* Rating Badge */}
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            className="flex items-center gap-1 rounded-xl bg-black px-3 py-2 text-white"
                                                        >
                                                            <Star className="h-4 w-4 fill-white" />
                                                            <span className="text-sm font-bold">
                                                                {Number(
                                                                    barber
                                                                        .barber_profile
                                                                        ?.rating_average ||
                                                                        0,
                                                                ).toFixed(1)}
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-6 pt-2">
                                                    {/* Name and Specialization */}
                                                    <div className="mb-4">
                                                        <h3 className="mb-1 text-xl font-black text-gray-900">
                                                            {barber.name}
                                                        </h3>
                                                        {barber.barber_profile
                                                            ?.specialization && (
                                                            <p className="font-medium text-gray-600">
                                                                {
                                                                    barber
                                                                        .barber_profile
                                                                        .specialization
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Bio */}
                                                    {barber.barber_profile
                                                        ?.bio && (
                                                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                                            {
                                                                barber
                                                                    .barber_profile
                                                                    .bio
                                                            }
                                                        </p>
                                                    )}

                                                    {/* Stats */}
                                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                {barber
                                                                    .barber_profile
                                                                    ?.experience_years ||
                                                                    0}{' '}
                                                                years
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Star className="h-4 w-4" />
                                                            <span>
                                                                {barber
                                                                    .barber_profile
                                                                    ?.total_reviews ||
                                                                    0}{' '}
                                                                reviews
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="p-6 pt-0">
                                                    <Link
                                                        href={route(
                                                            'customer.barbers.show',
                                                            barber.id,
                                                        )}
                                                    >
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                        >
                                                            <Button
                                                                className={`h-12 w-full rounded-xl text-lg font-bold transition-all ${
                                                                    barber
                                                                        .barber_profile
                                                                        ?.is_available
                                                                        ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:shadow-xl'
                                                                        : 'cursor-not-allowed bg-gray-300 text-gray-600'
                                                                }`}
                                                                disabled={
                                                                    !barber
                                                                        .barber_profile
                                                                        ?.is_available
                                                                }
                                                            >
                                                                {barber
                                                                    .barber_profile
                                                                    ?.is_available
                                                                    ? 'Book Now'
                                                                    : 'Unavailable'}
                                                            </Button>
                                                        </motion.div>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {barbers.links && barbers.links.length > 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-12 flex flex-wrap justify-center gap-2"
                        >
                            {barbers.links.map(
                                (link: PaginationLink, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`flex h-12 min-w-[44px] items-center justify-center rounded-xl px-4 font-medium transition-all duration-300 hover:scale-105 ${
                                            link.active
                                                ? 'bg-black text-white shadow-lg'
                                                : 'border border-gray-200 bg-white text-gray-700 shadow-md hover:shadow-lg'
                                        } ${!link.url && 'cursor-not-allowed opacity-30'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
