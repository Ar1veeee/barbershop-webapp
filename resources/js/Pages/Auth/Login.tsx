import { Checkbox } from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput } from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Scissors } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleGoogleLogin = () => {
        window.location.href = route('google');
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
            <Head title="Log in" />

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
                                href="/"
                                className="group inline-flex items-center text-sm font-medium text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Back to Home
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
                                <Scissors className="h-10 w-10 text-white dark:text-black" />
                            </motion.div>

                            <motion.h1
                                // @ts-ignore
                                variants={itemVariants}
                                className="mb-3 text-3xl font-black text-gray-900 dark:text-white sm:text-4xl"
                            >
                                Welcome Back
                            </motion.h1>

                            <motion.p
                                // @ts-ignore
                                variants={itemVariants}
                                className="text-lg text-gray-600 dark:text-gray-400"
                            >
                                Sign in to your BarberRiv account
                            </motion.p>
                        </motion.div>

                        {/* Status Message */}
                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{
                                        opacity: 1,
                                        height: 'auto',
                                        y: 0,
                                    }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="mb-6 overflow-hidden rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                >
                                    {status}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google Login Button */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                            className="mb-6"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGoogleLogin}
                                type="button"
                                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-base">
                                    Continue with Google
                                </span>
                            </motion.button>
                        </motion.div>

                        {/* Divider */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                            className="relative mb-8"
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-gradient-to-br from-gray-50 to-white px-4 text-gray-500 dark:from-gray-900 dark:to-black dark:text-gray-400">
                                    Or sign in with email
                                </span>
                            </div>
                        </motion.div>

                        {/* Login Form */}
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
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <InputLabel
                                    htmlFor="email"
                                    value="Email Address"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                />
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={data.email}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-white pl-12 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                        autoComplete="email"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="text-sm text-red-600 dark:text-red-400"
                                />
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    />
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-medium text-gray-600 underline-offset-2 hover:underline dark:text-gray-400"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Enter your password"
                                        value={data.password}
                                        className="h-14 w-full rounded-xl border-2 border-gray-300 bg-white pl-12 pr-12 text-base transition-all focus:border-black focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                        autoComplete="current-password"
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

                            {/* Remember Me */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
                                className="flex items-center"
                            >
                                <label className="flex items-center space-x-3">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded-lg border-2 border-gray-300 text-black focus:ring-2 focus:ring-black focus:ring-offset-2 dark:border-gray-600 dark:text-white dark:focus:ring-white dark:focus:ring-offset-gray-900"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Remember me for 30 days
                                    </span>
                                </label>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                // @ts-ignore
                                variants={itemVariants}
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
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowLeft className="ml-3 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
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

                        {/* Sign Up Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-bold text-black underline-offset-2 hover:underline dark:text-white"
                                >
                                    Create an account
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
                                <span>
                                    Your data is securely encrypted and
                                    protected
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
}
