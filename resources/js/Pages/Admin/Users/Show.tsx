import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Booking, DashboardStats, PageProps, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    DollarSign,
    Edit,
    Lock,
    Mail,
    Phone,
    Scissors,
    Shield,
    ShoppingBag,
    Star,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface UserShowProps extends PageProps {
    user: User & {
        customerBookings?: Booking[];
        barberBookings?: Booking[];
    };
    stats: DashboardStats;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.1,
        },
    },
};

export default function Show({ user, stats }: UserShowProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
    } = useForm({
        name: user.name,
        phone: user.phone || '',
        status: user.status,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        post,
        processing: passwordProcessing,
        reset: resetPassword,
        errors: passwordErrors,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const { delete: destroy } = useForm();

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => setShowEditDialog(false),
        });
    };

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.reset-password', user.id), {
            onSuccess: () => {
                setShowPasswordDialog(false);
                resetPassword();
            },
        });
    };

    const handleDelete = () => {
        destroy(route('admin.users.destroy', user.id), {
            onSuccess: () => router.visit(route('admin.users.index')),
        });
    };

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'admin':
                return {
                    color: 'bg-black text-white border-black',
                    icon: Shield,
                    label: 'Administrator',
                };
            case 'barber':
                return {
                    color: 'bg-zinc-800 text-white border-zinc-800',
                    icon: Scissors,
                    label: 'Barber',
                };
            case 'customer':
                return {
                    color: 'bg-zinc-400 text-white border-zinc-400',
                    icon: ShoppingBag,
                    label: 'Customer',
                };
            default:
                return {
                    color: 'bg-zinc-500 text-white border-zinc-500',
                    icon: UserIcon,
                    label: role,
                };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-black text-white border-black';
            case 'inactive':
                return 'bg-zinc-400 text-white border-zinc-400';
            case 'suspended':
                return 'bg-zinc-100 text-zinc-600 border-zinc-300';
            default:
                return 'bg-zinc-500 text-white border-zinc-500';
        }
    };

    const isBarber = user.role === 'barber';

    const roleConfig = getRoleConfig(user.role);
    const RoleIcon = roleConfig.icon;

    const statsCards = isBarber
        ? [
              {
                  label: 'Total Bookings',
                  value: stats.total_bookings || 0,
                  icon: Activity,
              },
              {
                  label: 'Completed',
                  value: stats.completed_bookings || 0,
                  icon: CheckCircle2,
              },
              {
                  label: 'Total Revenue',
                  value: `Rp ${(stats.total_revenue || 0).toLocaleString('id-ID')}`,
                  icon: DollarSign,
              },
              {
                  label: 'Avg Rating',
                  value: Number(stats.average_rating || 0).toFixed(1),
                  icon: Star,
              },
          ]
        : [
              {
                  label: 'Total Bookings',
                  value: stats.total_bookings || 0,
                  icon: Activity,
              },
              {
                  label: 'Completed',
                  value: stats.completed_bookings || 0,
                  icon: CheckCircle2,
              },
              {
                  label: 'Total Spent',
                  value: `Rp ${(stats.total_spent || 0).toLocaleString('id-ID')}`,
                  icon: DollarSign,
              },
          ];

    return (
        <AuthenticatedLayout>
            <Head title={`User: ${user.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <Link href={route('admin.users.index')}>
                            <Button
                                variant="ghost"
                                className="group -ml-2 mb-4 text-zinc-600 transition-colors hover:bg-transparent hover:text-black sm:mb-6"
                            >
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    <span className="text-sm font-medium">
                                        Back to Users
                                    </span>
                                </motion.div>
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:gap-6">
                                <motion.div
                                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                    }}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </motion.div>
                                <div className="flex-1">
                                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-3xl lg:text-4xl">
                                        {user.name}
                                    </h1>
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <Badge
                                            className={`${roleConfig.color} flex items-center gap-1.5 border px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm`}
                                        >
                                            <RoleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                            <span className="hidden sm:inline">
                                                {roleConfig.label}
                                            </span>
                                            <span className="sm:hidden">
                                                {user.role}
                                            </span>
                                        </Badge>
                                        <Badge
                                            className={`${getStatusColor(user.status)} border px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm`}
                                        >
                                            <span>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </Badge>
                                        {user.email_verified_at && (
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1 border-zinc-300 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm"
                                            >
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Verified</span>
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="font-mono text-xs text-zinc-500 sm:text-sm">
                                        User ID: #{user.id}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={() => setShowEditDialog(true)}
                                        variant="outline"
                                        className="h-9 border-2 border-zinc-300 px-3 text-xs hover:border-black hover:bg-zinc-50 sm:h-10 sm:px-4 sm:text-sm"
                                    >
                                        <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            Edit
                                        </span>
                                        <span className="sm:hidden">Edit</span>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={() =>
                                            setShowPasswordDialog(true)
                                        }
                                        variant="outline"
                                        className="h-9 border-2 border-zinc-300 px-3 text-xs hover:border-black hover:bg-zinc-50 sm:h-10 sm:px-4 sm:text-sm"
                                    >
                                        <Lock className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            Reset Password
                                        </span>
                                        <span className="sm:hidden">Reset</span>
                                    </Button>
                                </motion.div>
                                {user.role !== 'admin' && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={() =>
                                                setShowDeleteDialog(true)
                                            }
                                            variant="outline"
                                            className="h-9 border-2 border-red-300 px-3 text-xs text-red-600 hover:border-red-600 hover:bg-red-50 sm:h-10 sm:px-4 sm:text-sm"
                                        >
                                            <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">
                                                Delete
                                            </span>
                                            <span className="sm:hidden">
                                                Delete
                                            </span>
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:mb-8 lg:grid-cols-4"
                    >
                        {statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                        <CardContent className="p-3 sm:p-4 lg:p-5">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                                                    <Icon className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-0.5 text-xs text-zinc-500 sm:text-sm">
                                                        {stat.label}
                                                    </p>
                                                    <p className="text-lg font-bold text-black sm:text-xl lg:text-2xl">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                        {/* User Information */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-1"
                        >
                            <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b border-zinc-100 p-4 sm:p-6">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-6 sm:pt-6">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                            <Mail className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                Email
                                            </p>
                                            <p className="break-all text-sm font-semibold text-black">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                            <Phone className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                Phone
                                            </p>
                                            <p className="text-sm font-semibold text-black">
                                                {user.phone || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator className="bg-zinc-100" />

                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                            <Calendar className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                                                Member Since
                                            </p>
                                            <p className="text-sm font-semibold text-black">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Barber Profile Info */}
                            {isBarber && user.barber_profile && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-4"
                                >
                                    <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                        <CardHeader className="border-b border-zinc-100 p-4 sm:p-6">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
                                                Barber Profile
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6 sm:pt-6">
                                            <div>
                                                <p className="mb-1 text-xs text-zinc-500">
                                                    Bio
                                                </p>
                                                <p className="line-clamp-2 text-sm text-zinc-700">
                                                    {user.barber_profile.bio ||
                                                        'No bio provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-zinc-500">
                                                    Experience
                                                </p>
                                                <p className="text-sm font-semibold text-black">
                                                    {user.barber_profile
                                                        .experience_years ||
                                                        0}{' '}
                                                    years
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-zinc-500">
                                                    Commission Rate
                                                </p>
                                                <p className="text-sm font-semibold text-black">
                                                    {user.barber_profile
                                                        .commission_rate || 0}
                                                    %
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-zinc-500">
                                                    Availability
                                                </p>
                                                <Badge
                                                    className={`${user.barber_profile.is_available ? 'bg-black' : 'bg-zinc-400'} text-xs text-white`}
                                                >
                                                    {user.barber_profile
                                                        .is_available
                                                        ? 'Available'
                                                        : 'Unavailable'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Recent Bookings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b border-zinc-100 p-4 sm:p-6">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
                                        Recent Bookings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 sm:pt-4">
                                    {(
                                        user.customerBookings ||
                                        user.barberBookings
                                    )?.length > 0 ? (
                                        <div className="space-y-3">
                                            {(
                                                user.customerBookings ||
                                                user.barberBookings
                                            )
                                                ?.slice(0, 5)
                                                .map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 transition-all hover:border-black sm:flex-row sm:items-center sm:justify-between sm:p-4"
                                                    >
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                                                                {booking.service?.name.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-black">
                                                                    {
                                                                        booking
                                                                            .service
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-zinc-600">
                                                                    {
                                                                        booking.booking_date
                                                                    }{' '}
                                                                    •{' '}
                                                                    {
                                                                        booking.start_time
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                                                            <p className="text-sm font-bold text-black">
                                                                Rp{' '}
                                                                {booking.total_price.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </p>
                                                            <Badge
                                                                className={`mt-1 text-xs ${
                                                                    booking.status ===
                                                                    'completed'
                                                                        ? 'bg-black text-white'
                                                                        : booking.status ===
                                                                            'confirmed'
                                                                          ? 'bg-zinc-800 text-white'
                                                                          : booking.status ===
                                                                              'pending'
                                                                            ? 'bg-zinc-400 text-white'
                                                                            : 'bg-zinc-200 text-zinc-600'
                                                                }`}
                                                            >
                                                                <span className="hidden sm:inline">
                                                                    {
                                                                        booking.status
                                                                    }
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    {booking.status
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center sm:py-12">
                                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 sm:h-16 sm:w-16">
                                                <Activity className="h-6 w-6 text-zinc-400 sm:h-8 sm:w-8" />
                                            </div>
                                            <p className="text-sm text-zinc-600">
                                                No bookings yet
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Edit Dialog */}
                    <Dialog
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                    >
                        <DialogContent className="border-zinc-200">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-black">
                                    Edit User
                                </DialogTitle>
                                <DialogDescription className="text-zinc-600">
                                    Update user information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={editData.name}
                                        onChange={(e) =>
                                            setEditData('name', e.target.value)
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                    {editErrors.name && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {editErrors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={editData.phone}
                                        onChange={(e) =>
                                            setEditData('phone', e.target.value)
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                    {editErrors.phone && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {editErrors.phone}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={editData.status}
                                        onValueChange={(value: any) =>
                                            setEditData('status', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-2 border-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="suspended">
                                                Suspended
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditDialog(false)}
                                    className="border-2 border-zinc-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleEditSubmit}
                                    disabled={editProcessing}
                                    className="bg-black hover:bg-zinc-800"
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Password Reset Dialog */}
                    <Dialog
                        open={showPasswordDialog}
                        onOpenChange={setShowPasswordDialog}
                    >
                        <DialogContent className="border-zinc-200">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-black">
                                    Reset Password
                                </DialogTitle>
                                <DialogDescription className="text-zinc-600">
                                    Set a new password for {user.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) =>
                                            setPasswordData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                    {passwordErrors.password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {passwordErrors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={
                                            passwordData.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setPasswordData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPasswordDialog(false)}
                                    className="border-2 border-zinc-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePasswordSubmit}
                                    disabled={passwordProcessing}
                                    className="bg-black hover:bg-zinc-800"
                                >
                                    Reset Password
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation */}
                    <AlertDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                    >
                        <AlertDialogContent className="border-zinc-200">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold text-black">
                                    Delete User
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-600">
                                    Are you sure you want to delete{' '}
                                    <strong>{user.name}</strong>? This action
                                    cannot be undone and will permanently remove
                                    all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-2 border-zinc-300">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete User
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
