import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import {
    ArrowRight,
    Award,
    Brain,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    Menu,
    Quote,
    Scissors,
    Star,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const { props } = usePage<PageProps>();
    const user = auth.user ?? props.auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Animated Counter Hook
    const useCounter = (end: number, duration = 2000) => {
        const [count, setCount] = useState(0);
        useEffect(() => {
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start > end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }, [end, duration]);
        return count;
    };

    const bookings = useCounter(12400);
    const barbers = useCounter(89);
    const cities = useCounter(12);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    return (
        <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white text-gray-900 dark:from-gray-900 dark:to-black dark:text-gray-100">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-black/80"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-3"
                        >
                            <Link href="/" className="group">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-xl bg-black p-2 transition-all group-hover:bg-gray-800 dark:bg-white dark:group-hover:bg-gray-200">
                                        <ApplicationLogo className="h-6 w-6 fill-current text-white dark:text-black sm:h-8 sm:w-8" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight sm:text-2xl">
                                        BarberRiv
                                    </span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center space-x-4 md:flex">
                            {user ? (
                                <Button
                                    asChild
                                    className="rounded-xl bg-black px-6 font-medium text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                    <Link href={route('dashboard')}>
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="rounded-xl font-medium"
                                    >
                                        <Link href={route('login')}>
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="rounded-xl bg-black px-6 font-medium text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                    >
                                        <Link href={route('register')}>
                                            Get Started
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <Sheet
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            <SheetTrigger asChild className="md:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-full border-l border-gray-200 dark:border-gray-800 sm:max-w-md"
                            >
                                <div className="flex flex-col space-y-6 pt-10">
                                    {user ? (
                                        <Button
                                            asChild
                                            className="w-full justify-center rounded-xl bg-black py-3 font-medium text-white dark:bg-white dark:text-black"
                                        >
                                            <Link
                                                href={route('dashboard')}
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                Dashboard
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                asChild
                                                className="w-full justify-center rounded-xl py-3 font-medium"
                                            >
                                                <Link
                                                    href={route('login')}
                                                    onClick={() =>
                                                        setMobileMenuOpen(false)
                                                    }
                                                >
                                                    Sign In
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                className="w-full justify-center rounded-xl bg-black py-3 font-medium text-white dark:bg-white dark:text-black"
                                            >
                                                <Link
                                                    href={route('register')}
                                                    onClick={() =>
                                                        setMobileMenuOpen(false)
                                                    }
                                                >
                                                    Get Started
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </nav>
                </div>
            </motion.header>

            {/* Hero Section */}
            <main className="relative">
                {/* Hero */}
                <section className="relative py-16 sm:py-20 lg:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="mx-auto max-w-4xl text-center"
                        >
                            <motion.h1
                                variants={itemVariants}
                                className="mb-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                            >
                                Book Your{' '}
                                <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                                    Perfect Cut
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl lg:mb-12 lg:text-2xl"
                            >
                                Seamless barber booking. Real reviews. Zero
                                wait. All in one minimalist platform.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
                            >
                                <Button
                                    size="lg"
                                    asChild
                                    className="h-14 rounded-2xl bg-black px-8 text-base font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:px-10"
                                >
                                    <Link
                                        href={
                                            user
                                                ? route('dashboard')
                                                : route('register')
                                        }
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    className="h-14 rounded-2xl border-2 border-gray-300 bg-transparent px-8 text-base font-bold hover:border-black hover:bg-gray-50 dark:border-gray-700 dark:hover:border-white dark:hover:bg-gray-900 sm:px-10"
                                >
                                    <Link
                                        href={route('customer.barbers.index')}
                                    >
                                        Explore Barbers
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-y border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900/50 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3"
                        >
                            {[
                                {
                                    icon: (
                                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
                                    ),
                                    value: bookings,
                                    label: 'Bookings Made',
                                    suffix: '+',
                                },
                                {
                                    icon: (
                                        <Scissors className="h-6 w-6 sm:h-8 sm:w-8" />
                                    ),
                                    value: barbers,
                                    label: 'Expert Barbers',
                                    suffix: '+',
                                },
                                {
                                    icon: (
                                        <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />
                                    ),
                                    value: cities,
                                    label: 'Cities Covered',
                                    suffix: '+',
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="text-center"
                                >
                                    <motion.div className="mb-4 flex justify-center">
                                        <div className="rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
                                            {stat.icon}
                                        </div>
                                    </motion.div>
                                    <div className="text-3xl font-black sm:text-4xl lg:text-5xl">
                                        {stat.value.toLocaleString()}
                                        {stat.suffix}
                                    </div>
                                    <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-base">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 sm:py-20 lg:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            variants={containerVariants}
                            className="text-center"
                        >
                            <motion.h2
                                variants={itemVariants}
                                className="mb-4 text-3xl font-black sm:text-4xl lg:text-5xl"
                            >
                                Why Choose BarberRiv?
                            </motion.h2>
                            <motion.p
                                variants={itemVariants}
                                className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
                            >
                                Designed for the modern generation who values
                                time, style, and convenience
                            </motion.p>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-4"
                        >
                            {[
                                {
                                    icon: <Scissors className="h-6 w-6" />,
                                    title: 'Instant Bookings',
                                    desc: 'Select time, confirm, done. No calls needed.',
                                    features: [
                                        '24/7 Booking',
                                        'Real-time Availability',
                                        'Instant Confirmation',
                                    ],
                                },
                                {
                                    icon: <Star className="h-6 w-6" />,
                                    title: 'Verified Reviews',
                                    desc: 'Photos, ratings, and real customer experiences.',
                                    features: [
                                        'Photo Reviews',
                                        'Rating System',
                                        'Verified Customers',
                                    ],
                                },
                                {
                                    icon: <Clock className="h-6 w-6" />,
                                    title: 'No Waiting',
                                    desc: 'Arrive on time. Your barber is ready and waiting.',
                                    features: [
                                        'Time Slots',
                                        'Reminder Alerts',
                                        'On-time Guarantee',
                                    ],
                                },
                                {
                                    icon: <Brain className="h-6 w-6" />,
                                    title: 'Smart Management',
                                    desc: 'Complete control over bookings, users, and analytics.',
                                    features: [
                                        'Dashboard',
                                        'Analytics',
                                        'User Management',
                                    ],
                                },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group"
                                >
                                    <Card className="h-full border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-black dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-white">
                                        <CardHeader className="pb-4">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black transition-all group-hover:bg-gray-800 dark:bg-white dark:group-hover:bg-gray-200">
                                                <div className="text-white dark:text-black">
                                                    {feature.icon}
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl font-black dark:text-white">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                                                {feature.desc}
                                            </CardDescription>
                                            <ul className="space-y-2">
                                                {feature.features.map(
                                                    (item, j) => (
                                                        <li
                                                            key={j}
                                                            className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                            {item}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-gray-50 py-16 dark:bg-gray-900/50 sm:py-20 lg:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            variants={containerVariants}
                            className="text-center"
                        >
                            <motion.h2
                                variants={itemVariants}
                                className="mb-4 text-3xl font-black sm:text-4xl lg:text-5xl"
                            >
                                Get Started in 3 Steps
                            </motion.h2>
                            <motion.p
                                variants={itemVariants}
                                className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
                            >
                                Simple, fast, and designed for your convenience
                            </motion.p>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            className="grid gap-8 lg:grid-cols-3"
                        >
                            {[
                                {
                                    step: '01',
                                    title: 'Choose Your Barber',
                                    desc: 'Browse verified barbers with real photos, ratings, and specialties.',
                                    icon: <Users className="h-8 w-8" />,
                                    cta: 'Explore Barbers',
                                    link: route('customer.barbers.index'),
                                },
                                {
                                    step: '02',
                                    title: 'Pick Time & Service',
                                    desc: 'Select available slot, choose service, and confirm booking instantly.',
                                    icon: <Calendar className="h-8 w-8" />,
                                    cta: 'View Services',
                                    link: '#services',
                                },
                                {
                                    step: '03',
                                    title: 'Arrive & Enjoy',
                                    desc: 'Come on time. Your barber is ready. No queue, no stress.',
                                    icon: <Award className="h-8 w-8" />,
                                    cta: 'Book Now',
                                    link: user
                                        ? route('customer.bookings.create')
                                        : route('register'),
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                    className="group text-center"
                                >
                                    <Card className="h-full border-2 border-gray-200 bg-white p-6 transition-all hover:border-black hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-white sm:p-8">
                                        {/* Step Number */}
                                        <div className="mb-6 text-6xl font-black text-gray-200 group-hover:text-gray-300 dark:text-gray-800 dark:group-hover:text-gray-700">
                                            {item.step}
                                        </div>

                                        {/* Icon */}
                                        <motion.div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black transition-colors group-hover:bg-gray-800 dark:bg-white dark:group-hover:bg-gray-200">
                                            <div className="text-white dark:text-black">
                                                {item.icon}
                                            </div>
                                        </motion.div>

                                        {/* Content */}
                                        <CardTitle className="mb-4 text-xl font-black dark:text-white sm:text-2xl">
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription className="mb-6 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                                            {item.desc}
                                        </CardDescription>

                                        {/* CTA */}
                                        <Button
                                            asChild
                                            variant="ghost"
                                            className="group/btn font-bold"
                                        >
                                            <Link href={item.link}>
                                                {item.cta}
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-16 sm:py-20 lg:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            variants={containerVariants}
                            className="text-center"
                        >
                            <motion.h2
                                variants={itemVariants}
                                className="mb-4 text-3xl font-black sm:text-4xl lg:text-5xl"
                            >
                                Loved by Thousands
                            </motion.h2>
                            <motion.p
                                variants={itemVariants}
                                className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
                            >
                                See what our community says about their
                                experience
                            </motion.p>
                        </motion.div>

                        <div className="grid gap-8 lg:grid-cols-2">
                            {[
                                {
                                    quote: 'Bookings jadi gampang banget. Gak perlu telpon, langsung pilih jam, dateng, selesai. Hemat waktu!',
                                    author: 'Adit Pratama',
                                    role: 'College Student',
                                    rating: 5,
                                },
                                {
                                    quote: 'Sebagai barber, saya bisa atur jadwal dan lihat earning real-time. Sistemnya clean dan gak ribet.',
                                    author: 'Fajar Maulana',
                                    role: 'Barber Shop Owner',
                                    rating: 5,
                                },
                            ].map((testimonial, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 0,
                                        x: i % 2 === 0 ? -30 : 30,
                                    }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="border-2 border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
                                        <CardContent className="p-6 sm:p-8">
                                            <div className="mb-4 flex">
                                                {[
                                                    ...Array(
                                                        testimonial.rating,
                                                    ),
                                                ].map((_, j) => (
                                                    <Star
                                                        key={j}
                                                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                            </div>
                                            <Quote className="mb-4 h-8 w-8 text-gray-300 dark:text-gray-700" />
                                            <p className="mb-6 text-lg italic text-gray-700 dark:text-gray-300 sm:text-xl">
                                                "{testimonial.quote}"
                                            </p>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {testimonial.author}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-black py-16 text-white dark:bg-white dark:text-black sm:py-20 lg:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            className="text-center"
                        >
                            <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                                Ready to Transform Your Grooming Experience?
                            </h2>
                            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90 sm:text-xl">
                                Join thousands of satisfied customers and
                                barbers today
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    asChild
                                    className="h-14 rounded-2xl bg-white px-8 text-base font-bold text-black transition-all hover:bg-gray-200 hover:shadow-xl dark:bg-black dark:text-white dark:hover:bg-gray-800 sm:px-10"
                                >
                                    <Link
                                        href={
                                            user
                                                ? route('dashboard')
                                                : route('register')
                                        }
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    className="h-14 rounded-2xl border-2 border-white bg-transparent px-8 text-base font-bold text-white hover:bg-white hover:text-black dark:border-black dark:text-black dark:hover:bg-black dark:hover:text-white sm:px-10"
                                >
                                    <Link
                                        href={route('customer.barbers.index')}
                                    >
                                        Browse Barbers
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div className="text-center md:text-left">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="mb-4 inline-flex items-center space-x-3"
                            >
                                <div className="rounded-xl bg-black p-2 dark:bg-white">
                                    <ApplicationLogo className="h-6 w-6 fill-current text-white dark:text-black" />
                                </div>
                                <span className="text-xl font-black">
                                    BarberRiv
                                </span>
                            </motion.div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Seamless booking for modern grooming
                                experiences.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="text-center md:text-left">
                            <h4 className="mb-4 font-bold">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <Link
                                        href={route('customer.barbers.index')}
                                        className="hover:underline"
                                    >
                                        Find Barbers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('login')}
                                        className="hover:underline"
                                    >
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('register')}
                                        className="hover:underline"
                                    >
                                        Register
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="text-center md:text-left">
                            <h4 className="mb-4 font-bold">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <Link href="#" className="hover:underline">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:underline">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:underline">
                                        Privacy Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Tech & Social */}
                        <div className="text-center md:text-right">
                            <h4 className="mb-4 font-bold">Connect</h4>
                            <div className="mb-6 flex justify-center gap-3 md:justify-end">
                                {['Instagram', 'Twitter', 'Facebook'].map(
                                    (social) => (
                                        <Button
                                            key={social}
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-full border border-gray-300 hover:border-black dark:border-gray-700 dark:hover:border-white"
                                        >
                                            <span className="text-xs font-medium">
                                                {social[0]}
                                            </span>
                                        </Button>
                                    ),
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} StackRiv. All
                                rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
