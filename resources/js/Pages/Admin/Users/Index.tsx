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
import { PageProps, PaginatedData, User, UserFilters } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import { debounce } from 'lodash';
import {
    ArrowUpDown,
    Calendar,
    CheckCircle,
    Eye,
    EyeOff,
    Filter,
    Lock,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    Scissors,
    Search,
    Shield,
    ShieldUser,
    ShoppingBag,
    Trash2,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import {
    FormEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

interface UsersIndexProps extends PageProps {
    users: PaginatedData<User>;
    filters: UserFilters;
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

export default function Index({ users, filters }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const {
        data: addData,
        setData: setAddData,
        post,
        processing: addProcessing,
        errors: addErrors,
    } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'customer' as 'customer' | 'barber' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'suspended',
    });

    const { delete: destroy } = useForm();

    const applyFilter = (
        currentSearch: string,
        currentRole: string,
        currentStatus: string,
    ) => {
        router.get(
            route('admin.users.index'),
            {
                search: currentSearch || undefined,
                role: currentRole !== 'all' ? currentRole : undefined,
                status: currentStatus !== 'all' ? currentStatus : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            applyFilter(query, role, status);
        }, 400),
        [role, status],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        applyFilter(search, role, status);
    }, [role, status]);

    const handleAdd: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setShowAddDialog(false);
                setAddData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    password_confirmation: '',
                    role: 'customer',
                    status: 'active',
                });
            },
        });
    };

    const handleDelete = () => {
        if (deleteUser) {
            destroy(route('admin.users.destroy', deleteUser.id), {
                onSuccess: () => setDeleteUser(null),
            });
        }
    };

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'admin':
                return {
                    color: 'bg-black text-white border-black',
                    icon: Shield,
                    label: 'Admin',
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
                    icon: Users,
                    label: 'User',
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
                return 'bg-zinc-100 hover:bg-zinc-100 text-zinc-600 border-zinc-300';
            default:
                return 'bg-zinc-500 text-white border-zinc-500';
        }
    };

    const stats = [
        { label: 'Total Users', value: users.total, icon: Users },
        {
            label: 'Active',
            value: users.data.filter((u) => u.status === 'active').length,
            icon: UserCheck,
        },
        {
            label: 'Suspended',
            value: users.data.filter((u) => u.status === 'suspended').length,
            icon: UserX,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-3xl lg:text-4xl xl:text-5xl">
                                    User Management
                                </h1>
                                <p className="text-sm text-zinc-600 sm:text-base lg:text-lg">
                                    Manage all users in the system
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => setShowAddDialog(true)}
                                    className="h-10 bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800 sm:h-12 sm:px-6 sm:text-base"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Add User</span>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-8"
                    >
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                                    <Icon className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" />
                                                </div>
                                                <div>
                                                    <p className="mb-0.5 text-xs text-zinc-500 sm:text-sm">
                                                        {stat.label}
                                                    </p>
                                                    <p className="text-xl font-bold text-black sm:text-2xl">
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

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-4 lg:mb-6"
                    >
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                    {/* Search Input */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="h-10 border-zinc-200 pl-10 focus:border-black sm:h-11"
                                            />
                                        </div>
                                    </div>

                                    {/* Filters Row */}
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                                        <Select
                                            value={role}
                                            onValueChange={(value) => {
                                                setRole(
                                                    value as
                                                        | 'all'
                                                        | 'customer'
                                                        | 'barber'
                                                        | 'admin',
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[140px] lg:w-[160px]">
                                                <Filter className="mr-2 h-4 w-4 text-zinc-500" />
                                                <SelectValue placeholder="All Roles" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Roles
                                                </SelectItem>
                                                <SelectItem value="customer">
                                                    Customer
                                                </SelectItem>
                                                <SelectItem value="barber">
                                                    Barber
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    Admin
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={status}
                                            onValueChange={(value) => {
                                                setStatus(
                                                    value as
                                                        | 'all'
                                                        | 'active'
                                                        | 'inactive'
                                                        | 'suspended',
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-10 border-zinc-200 sm:h-11 sm:w-[140px] lg:w-[160px]">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
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
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Users List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader className="border-b border-zinc-100 p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
                                        Users List
                                    </CardTitle>
                                    <span className="font-mono text-xs text-zinc-500 sm:text-sm">
                                        {users.data.length} of {users.total}{' '}
                                        users
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Desktop Table */}
                                <div className="hidden lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="border-b border-zinc-100 bg-zinc-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            User
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            Contact
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            Role
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            Status
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            Joined
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-right">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                                            Actions
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {users.data.map(
                                                    (user, index) => {
                                                        const roleConfig =
                                                            getRoleConfig(
                                                                user.role,
                                                            );
                                                        const RoleIcon =
                                                            roleConfig.icon;

                                                        return (
                                                            <motion.tr
                                                                key={user.id}
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        0.5 +
                                                                        index *
                                                                            0.05,
                                                                }}
                                                                className="transition-colors hover:bg-zinc-50"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white">
                                                                            {user.avatar_url ? (
                                                                                <img
                                                                                    src={
                                                                                        user.avatar_url
                                                                                    }
                                                                                    alt={
                                                                                        user.name
                                                                                    }
                                                                                    className="h-full w-full rounded-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <span>
                                                                                    {user.name
                                                                                        .charAt(
                                                                                            0,
                                                                                        )
                                                                                        .toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-black">
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-zinc-500">
                                                                                ID:{' '}
                                                                                {
                                                                                    user.id
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2 text-sm text-zinc-700">
                                                                            <Mail className="h-3 w-3 text-zinc-400" />
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </div>
                                                                        {user.phone && (
                                                                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                                                                                <Phone className="h-3 w-3 text-zinc-400" />
                                                                                {
                                                                                    user.phone
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge
                                                                        className={`${roleConfig.color} flex w-fit items-center gap-1 border px-3 py-1 text-xs`}
                                                                    >
                                                                        <RoleIcon className="h-3 w-3" />
                                                                        {user.role.toUpperCase()}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge
                                                                        className={`${getStatusColor(user.status)} border px-3 py-1 text-xs`}
                                                                    >
                                                                        {user.status.toUpperCase()}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                                        <Calendar className="h-3 w-3 text-zinc-400" />
                                                                        {new Date(
                                                                            user.created_at,
                                                                        ).toLocaleDateString(
                                                                            'en-US',
                                                                            {
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Link
                                                                            href={route(
                                                                                'admin.users.show',
                                                                                user.id,
                                                                            )}
                                                                        >
                                                                            <motion.div
                                                                                whileHover={{
                                                                                    scale: 1.1,
                                                                                }}
                                                                                whileTap={{
                                                                                    scale: 0.9,
                                                                                }}
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 hover:bg-zinc-100"
                                                                                >
                                                                                    <Eye className="h-4 w-4 text-zinc-600" />
                                                                                </Button>
                                                                            </motion.div>
                                                                        </Link>
                                                                        <motion.div
                                                                            whileHover={{
                                                                                scale: 1.1,
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.9,
                                                                            }}
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    setDeleteUser(
                                                                                        user,
                                                                                    )
                                                                                }
                                                                                className="h-8 w-8 p-0 hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                                            </Button>
                                                                        </motion.div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile & Tablet Cards */}
                                <div className="lg:hidden">
                                    <div className="space-y-3 p-4 sm:p-6">
                                        {users.data.map((user, index) => {
                                            const roleConfig = getRoleConfig(
                                                user.role,
                                            );
                                            const RoleIcon = roleConfig.icon;

                                            return (
                                                <motion.div
                                                    key={user.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            0.5 + index * 0.05,
                                                    }}
                                                    className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50"
                                                >
                                                    {/* User Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white">
                                                                {user.avatar_url ? (
                                                                    <img
                                                                        src={
                                                                            user.avatar_url
                                                                        }
                                                                        alt={
                                                                            user.name
                                                                        }
                                                                        className="h-full w-full rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span>
                                                                        {user.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-black">
                                                                    {user.name}
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    ID:{' '}
                                                                    {user.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setMobileMenuOpen(
                                                                        mobileMenuOpen ===
                                                                            user.id.toString()
                                                                            ? null
                                                                            : user.id.toString(),
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>

                                                            {/* Mobile Actions Menu */}
                                                            {mobileMenuOpen ===
                                                                user.id.toString() && (
                                                                <div className="absolute right-0 top-10 z-10 w-32 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
                                                                    <Link
                                                                        href={route(
                                                                            'admin.users.show',
                                                                            user.id,
                                                                        )}
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="w-full justify-start text-xs"
                                                                        >
                                                                            <Eye className="mr-2 h-3 w-3" />
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setDeleteUser(
                                                                                user,
                                                                            );
                                                                            setMobileMenuOpen(
                                                                                null,
                                                                            );
                                                                        }}
                                                                        className="w-full justify-start text-xs text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="mr-2 h-3 w-3" />
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* User Details */}
                                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        {/* Contact Info */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                                                                <Mail className="h-3 w-3 text-zinc-400" />
                                                                <span className="truncate">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                            {user.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-zinc-700">
                                                                    <Phone className="h-3 w-3 text-zinc-400" />
                                                                    <span>
                                                                        {
                                                                            user.phone
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Role & Status */}
                                                        <div className="flex items-center gap-2 sm:justify-end">
                                                            <Badge
                                                                className={`${roleConfig.color} flex items-center gap-1 border px-2 py-1 text-xs`}
                                                            >
                                                                <RoleIcon className="h-3 w-3" />
                                                                <span className="hidden sm:inline">
                                                                    {
                                                                        roleConfig.label
                                                                    }
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    {user.role}
                                                                </span>
                                                            </Badge>
                                                            <Badge
                                                                className={`${getStatusColor(user.status)} border px-2 py-1 text-xs`}
                                                            >
                                                                <span>
                                                                    {user.status.toUpperCase()}
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Joined Date */}
                                                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                                                        <Calendar className="h-3 w-3" />
                                                        Joined{' '}
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Pagination */}
                    {users.data.length > 0 && users.total > 10 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:mt-6"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === 1}
                                onClick={() =>
                                    router.get(
                                        route('admin.users.index', {
                                            page: users.current_page - 1,
                                        }),
                                    )
                                }
                                className="border-zinc-300 text-xs sm:text-sm"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: Math.min(5, users.last_page) },
                                    (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <Button
                                                key={page}
                                                variant={
                                                    page === users.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        route(
                                                            'admin.users.index',
                                                            { page },
                                                        ),
                                                    )
                                                }
                                                className={`text-xs sm:text-sm ${
                                                    page === users.current_page
                                                        ? 'bg-black hover:bg-zinc-800'
                                                        : 'border-zinc-300'
                                                }`}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    },
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    users.current_page === users.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        route('admin.users.index', {
                                            page: users.current_page + 1,
                                        }),
                                    )
                                }
                                className="border-zinc-300 text-xs sm:text-sm"
                            >
                                Next
                            </Button>
                        </motion.div>
                    )}

                    {/* Add Dialog */}
                    <Dialog
                        open={showAddDialog}
                        onOpenChange={setShowAddDialog}
                    >
                        <DialogContent className="max-w-md border-zinc-200 sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-black sm:text-2xl">
                                    Add New User
                                </DialogTitle>
                                <DialogDescription className="text-zinc-600">
                                    Create a new user account
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleAdd}
                                className="space-y-4 py-4"
                            >
                                {/* Form fields remain the same */}
                                <div>
                                    <Label
                                        htmlFor="add-name"
                                        className="flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <Users className="h-4 w-4 text-zinc-500" />
                                        Name
                                    </Label>
                                    <Input
                                        id="add-name"
                                        value={addData.name}
                                        onChange={(e) =>
                                            setAddData('name', e.target.value)
                                        }
                                        className="mt-2 border-zinc-200"
                                        placeholder="John Doe"
                                    />
                                    {addErrors.name && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="add-email"
                                        className="flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <Mail className="h-4 w-4 text-zinc-500" />
                                        Email
                                    </Label>
                                    <Input
                                        id="add-email"
                                        type="email"
                                        value={addData.email}
                                        onChange={(e) =>
                                            setAddData('email', e.target.value)
                                        }
                                        className="mt-2 border-zinc-200"
                                        placeholder="john@example.com"
                                    />
                                    {addErrors.email && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="add-phone"
                                        className="flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <Phone className="h-4 w-4 text-zinc-500" />
                                        Phone
                                    </Label>
                                    <Input
                                        id="add-phone"
                                        type="phone"
                                        value={addData.phone}
                                        onChange={(e) =>
                                            setAddData('phone', e.target.value)
                                        }
                                        className="mt-2 border-zinc-200"
                                        placeholder="0812xxxxxxxx"
                                    />
                                    {addErrors.phone && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addErrors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Label
                                        htmlFor="add-password"
                                        className="flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <Lock className="h-4 w-4 text-zinc-500" />
                                        Password
                                    </Label>
                                    <Input
                                        id="add-password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={addData.password}
                                        onChange={(e) =>
                                            setAddData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-10 text-zinc-500 hover:text-zinc-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                    {addErrors.password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Label
                                        htmlFor="add-confirm"
                                        className="flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <CheckCircle className="h-4 w-4 text-zinc-500" />
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="add-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={addData.password_confirmation}
                                        onChange={(e) =>
                                            setAddData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-2 border-zinc-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm(!showConfirm)
                                        }
                                        className="absolute right-3 top-10 text-zinc-500 hover:text-zinc-700"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                    {addErrors.password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="add-role"
                                        className="flex items-center gap-2"
                                    >
                                        <ShieldUser className="h-4 w-4 text-zinc-500" />
                                        Role
                                    </Label>
                                    <Select
                                        value={addData.role}
                                        onValueChange={(value: any) =>
                                            setAddData('role', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-2 border-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="customer">
                                                Customer
                                            </SelectItem>
                                            <SelectItem value="barber">
                                                Barber
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddDialog(false);
                                            setAddData({
                                                name: '',
                                                email: '',
                                                phone: '',
                                                password: '',
                                                password_confirmation: '',
                                                role: 'customer',
                                                status: 'active',
                                            });
                                        }}
                                        className="border-2 border-zinc-300 text-sm sm:text-base"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={addProcessing}
                                        className="bg-black text-sm hover:bg-zinc-800 sm:text-base"
                                    >
                                        {addProcessing
                                            ? 'Creating...'
                                            : 'Create User'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog
                        open={!!deleteUser}
                        onOpenChange={() => setDeleteUser(null)}
                    >
                        <AlertDialogContent className="max-w-sm border-zinc-200 sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold text-black sm:text-2xl">
                                    Delete User
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-600">
                                    Are you sure you want to delete{' '}
                                    <strong>{deleteUser?.name}</strong>? This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
                                <AlertDialogCancel className="border-2 border-zinc-300 text-sm hover:bg-zinc-50 sm:text-base">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 text-sm text-white hover:bg-red-700 sm:text-base"
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
