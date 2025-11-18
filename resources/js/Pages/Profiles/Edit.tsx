import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Bell,
    CreditCard,
    Lock,
    Shield,
    Trash2,
    User,
} from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

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

export default function Edit({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile Settings" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <Link href={route('customer.dashboard')}>
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
                                            Back to Dashboard
                                        </span>
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>

                        <div className="text-center sm:text-left">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-4 text-4xl font-black text-gray-900 sm:text-5xl"
                            >
                                Profile{' '}
                                <span className="text-gray-600">Settings</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="max-w-2xl text-lg text-gray-600"
                            >
                                Manage your account settings and preferences
                            </motion.p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
                    >
                        {/* Profile Information */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                            className="lg:col-span-2"
                        >
                            <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
                                        <User className="h-6 w-6 text-black" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Security & Password */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                        >
                            <Card className="h-full overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black text-gray-900">
                                        <Shield className="h-5 w-5 text-black" />
                                        Security
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <UpdatePasswordForm />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                        >
                            <Card className="h-full overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black text-gray-900">
                                        <Bell className="h-5 w-5 text-black" />
                                        Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="group cursor-pointer rounded-2xl border-2 border-gray-200 p-4 transition-all duration-300 hover:border-black"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-black">
                                                    <Bell className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-black">
                                                        Notifications
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Manage your alerts
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="group cursor-pointer rounded-2xl border-2 border-gray-200 p-4 transition-all duration-300 hover:border-black"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-black">
                                                    <CreditCard className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-black">
                                                        Payment Methods
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Update your cards
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Danger Zone */}
                        <motion.div
                            // @ts-ignore
                            variants={itemVariants}
                            className="lg:col-span-2"
                        >
                            <Card className="overflow-hidden rounded-3xl border-2 border-red-200 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardHeader className="border-b border-red-200 bg-gradient-to-r from-red-50 to-red-100">
                                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-red-600">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                        Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8">
                                    <DeleteUserForm />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                            <Lock className="h-4 w-4" />
                            <span>Your data is securely encrypted</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
