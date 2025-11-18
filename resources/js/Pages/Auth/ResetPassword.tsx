import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput } from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
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

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 opacity-50 blur-3xl dark:from-gray-800 dark:to-gray-900" />
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
                                // @ts-ignore    // @ts-igno
                                animate={floatingAnimation}
                                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-black dark:bg-white"
                            >
                                <Shield className="h-10 w-10 text-white dark:text-black" />
                            </motion.div>

                            <motion.h1
                                // @ts-ignore
                                variants={itemVariants}
                                className="mb-3 text-3xl font-black text-gray-900 dark:text-white sm:text-4xl"
                            >
                                New Password
                            </motion.h1>

                            <motion.p
                                // @ts-ignore
                                variants={itemVariants}
                                className="text-lg text-gray-600 dark:text-gray-400"
                            >
                                Create a strong, secure password for your
                                account
                            </motion.p>
                        </motion.div>

                        {/* Reset Password Form */}
                        <motion.form
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={submit}
                            className="space-y-6"
                        >
                            {/* Email Field (Read-only) */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="space-y-2"
                            >
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
                                        value={data.email}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-gray-50 pl-12 text-base text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                        readOnly
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <motion.div
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        >
                                            Verified
                                        </motion.div>
                                    </div>
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="text-sm text-red-600 dark:text-red-400"
                                />
                            </motion.div>

                            {/* New Password Field */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Create a strong password"
                                        value={data.password}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-white pl-12 pr-12 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                        autoComplete="new-password"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="text-sm text-red-600 dark:text-red-400"
                                />
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        placeholder="Confirm your new password"
                                        value={data.password_confirmation}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-white pl-12 pr-12 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="text-sm text-red-600 dark:text-red-400"
                                />
                            </motion.div>

                            {/* Password Strength Indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: data.password ? 1 : 0 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Password strength
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {data.password.length >= 8
                                            ? 'Strong'
                                            : data.password.length >= 4
                                              ? 'Medium'
                                              : 'Weak'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.min((data.password.length / 12) * 100, 100)}%`,
                                        }}
                                        className={`h-full ${
                                            data.password.length >= 8
                                                ? 'bg-green-500'
                                                : data.password.length >= 4
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        }`}
                                    />
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="pt-4"
                            >
                                <PrimaryButton
                                    disabled={processing}
                                    className="group relative h-14 w-full overflow-hidden rounded-xl bg-black text-base font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-white dark:focus:ring-offset-gray-900"
                                >
                                    <motion.span
                                        animate={
                                            processing
                                                ? { opacity: [1, 0.7, 1] }
                                                : {}
                                        }
                                        transition={{
                                            duration: 1,
                                            repeat: processing ? Infinity : 0,
                                        }}
                                        className="flex items-center justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                    className="mr-3 h-5 w-5 rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
                                                />
                                                Updating Password...
                                            </>
                                        ) : (
                                            <>Update Password</>
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

                        {/* Security Tips */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20"
                        >
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Create a strong password
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Use at least 8 characters with a mix of
                                        letters, numbers, and symbols
                                    </p>
                                </div>
                            </div>
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
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
}
