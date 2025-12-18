import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Lock, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PaymentPageProps extends PageProps {
    booking: {
        id: number;
        barber: { name: string };
        service: { name: string; duration: number };
        booking_date: string;
        start_time: string;
        total_price: number;
        payment_expiry_at?: string; // optional, kalau kamu tambah kolom expiry
    };
    snapToken: string;
}

export default function Payment({ auth, booking, snapToken }: PaymentPageProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Countdown 30 menit (asumsi expiry 30 menit dari sekarang kalau tidak ada kolom)
    useEffect(() => {
        const expiry = booking.payment_expiry_at
            ? new Date(booking.payment_expiry_at)
            : new Date(Date.now() + 30 * 60 * 1000);

        const timer = setInterval(() => {
            const now = new Date();
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Expired');
                clearInterval(timer);
                return;
            }

            const minutes = Math.floor(diff / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [booking.payment_expiry_at]);

    // Load Snap.js
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePay = () => {
        if (!(window as any).snap) {
            alert('Payment system not loaded. Please refresh.');
            return;
        }

        (window as any).snap.pay(snapToken, {
            onSuccess: () => {
                router.visit(route('customer.bookings.show', booking.id));
            },
            onPending: () => {
                router.visit(route('customer.bookings.show', booking.id));
            },
            onError: () => {
                alert('Payment failed. Please try again.');
            },
            onClose: () => {
                // optional: warn user
            },
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Complete Payment" />

            <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.visit(route('customer.bookings.index'))}
                        className="mb-8 flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to bookings
                    </motion.button>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="rounded-2xl bg-white shadow-lg overflow-hidden"
                    >
                        {/* Header */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-black px-8 py-12 text-center"
                        >
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Complete Your Payment
                            </h1>
                            <p className="text-zinc-300 text-lg">
                                Secure checkout powered by Midtrans
                            </p>
                        </motion.div>

                        {/* Main Content */}
                        <div className="p-8 lg:p-12">
                            {/* Timer */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-10 text-center"
                            >
                                <div className="flex items-center justify-center gap-3 text-zinc-600">
                                    <Clock className="h-5 w-5" />
                                    <span className="text-lg font-medium">
                                        Complete payment in
                                    </span>
                                    <span className={`font-bold text-xl ${timeLeft === 'Expired' ? 'text-red-600' : 'text-black'}`}>
                                        {timeLeft || '30m 0s'}
                                    </span>
                                </div>
                                {timeLeft === 'Expired' && (
                                    <p className="mt-2 text-sm text-red-600">
                                        Payment window expired. Please create a new booking.
                                    </p>
                                )}
                            </motion.div>

                            {/* Summary */}
                            <motion.div variants={itemVariants} className="space-y-6 mb-10">
                                <div className="flex justify-between py-4 border-b border-zinc-200">
                                    <span className="text-zinc-600">Barber</span>
                                    <span className="font-semibold text-black">{booking.barber.name}</span>
                                </div>
                                <div className="flex justify-between py-4 border-b border-zinc-200">
                                    <span className="text-zinc-600">Service</span>
                                    <span className="font-semibold text-black">{booking.service.name}</span>
                                </div>
                                <div className="flex justify-between py-4 border-b border-zinc-200">
                                    <span className="text-zinc-600">Date & Time</span>
                                    <span className="font-semibold text-black text-right">
                                        {format(new Date(booking.booking_date), 'EEE, dd MMM yyyy')}
                                        <br />
                                        {booking.start_time}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Total */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-12 pb-8 border-b border-zinc-200"
                            >
                                <div className="flex justify-between items-end">
                                    <span className="text-lg text-zinc-600">Total Amount</span>
                                    <span className="text-4xl font-bold text-black">
                                        Rp {booking.total_price.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Pay Button */}
                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={handlePay}
                                    disabled={timeLeft === 'Expired'}
                                    className="w-full bg-black text-white font-semibold text-lg py-5 rounded-xl hover:bg-zinc-800 transition-all duration-300 disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <Lock className="h-5 w-5" />
                                    Pay Securely Now
                                </button>
                            </motion.div>

                            {/* Trust Badges */}
                            <motion.div
                                variants={itemVariants}
                                className="mt-8 flex items-center justify-center gap-6 text-zinc-500 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="h-5 w-px bg-zinc-300" />
                                <span>SSL Encrypted</span>
                                <div className="h-5 w-px bg-zinc-300" />
                                <span>Midtrans Verified</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}