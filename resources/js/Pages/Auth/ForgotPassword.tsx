import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput } from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Mail, Lock } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const floatingAnimation = {
        y: [0, -8, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 opacity-50 blur-3xl dark:from-gray-800 dark:to-gray-900" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 opacity-50 blur-3xl dark:from-gray-700 dark:to-gray-800" />
                </div>

                <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Back Button */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <Link
                                href={route('login')}
                                className="group inline-flex items-center text-sm font-medium text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Back to Login
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Header Section */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="mb-8 text-center"
                        >
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                // @ts-ignore
                                animate={floatingAnimation}
                                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-black dark:bg-white"
                            >
                                <Lock className="h-10 w-10 text-white dark:text-black" />
                            </motion.div>

                            <motion.h1
                                // @ts-ignore
                                variants={itemVariants}
                                className="mb-3 text-3xl font-black text-gray-900 dark:text-white sm:text-4xl"
                            >
                                Reset Password
                            </motion.h1>

                            <motion.p
                                // @ts-ignore
                                variants={itemVariants}
                                className="text-lg text-gray-600 dark:text-gray-400"
                            >
                                Enter your email and we'll send you a reset link
                            </motion.p>
                        </motion.div>

                        {/* Success Status */}
                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="mb-6 overflow-hidden rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>{status}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Reset Password Form */}
                        <motion.form
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={submit}
                            className="space-y-6"
                        >
                            {/* Email Field */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants} className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email address"
                                        value={data.email}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-white pl-12 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="text-sm text-red-600 dark:text-red-400"
                                />
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}>
                                <PrimaryButton
                                    disabled={processing}
                                    className="group relative h-14 w-full overflow-hidden rounded-xl bg-black text-base font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-white dark:focus:ring-offset-gray-900"
                                >
                                    <motion.span
                                        animate={processing ? { opacity: [1, 0.7, 1] } : {}}
                                        transition={{ duration: 1, repeat: processing ? Infinity : 0 }}
                                        className="flex items-center justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="mr-3 h-5 w-5 rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
                                                />
                                                Sending Reset Link...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
                                            </>
                                        )}
                                    </motion.span>

                                    {/* Animated background effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.8 }}
                                    />
                                </PrimaryButton>
                            </motion.div>
                        </motion.form>

                        {/* Additional Help Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We'll email you a secure link to reset your password
                            </p>
                        </motion.div>

                        {/* Login Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                Remember your password?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-bold text-black underline-offset-2 hover:underline dark:text-white"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </motion.div>

                        {/* Security Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 text-center"
                        >
                            <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <Lock className="h-3 w-3" />
                                <span>Reset links expire after 1 hour for security</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
}
