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
import { Textarea } from '@/components/ui/textarea';
import { PageProps, ServiceCategory } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Edit,
    Grid3x3,
    Layers,
    LoaderCircle,
    Package,
    PackagePlus,
    Plus,
    Trash2,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface CategoriesIndexProps extends PageProps {
    categories: ServiceCategory[];
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

const iconsList = ['✂️', '💈', '🪒', '💇', '💆', '🧔', '👨', '✨', '⭐', '🎨'];

export default function Index({ categories }: CategoriesIndexProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ServiceCategory | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<
        (ServiceCategory & { services_count: number }) | null
    >(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        icon: '✂️',
    });

    const openCreateDialog = () => {
        reset();
        setEditingCategory(null);
        setShowDialog(true);
    };

    const openEditDialog = (category: ServiceCategory) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '✂️',
        });
        setShowDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingCategory) {
            put(route('admin.categories.update', editingCategory.id), {
                onSuccess: () => {
                    setShowDialog(false);
                    reset();
                },
            });
        } else {
            post(route('admin.categories.store'), {
                onSuccess: () => {
                    setShowDialog(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteCategory) {
            router.delete(
                route('admin.categories.destroy', deleteCategory.id),
                {
                    onSuccess: () => setDeleteCategory(null),
                },
            );
        }
    };

    const stats = [
        { label: 'Total Categories', value: categories.length, icon: Grid3x3 },
        {
            label: 'Total Services',
            value: categories.reduce((sum, cat) => sum + cat.services_count, 0),
            icon: Package,
        },
        {
            label: 'Avg Services/Category',
            value:
                categories.length > 0
                    ? Math.round(
                          categories.reduce(
                              (sum, cat) => sum + cat.services_count,
                              0,
                          ) / categories.length,
                      )
                    : 0,
            icon: Layers,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Categories Management" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-4xl font-bold tracking-tight text-black sm:text-5xl">
                                    Categories Management
                                </h1>
                                <p className="text-lg text-zinc-600">
                                    Organize services into categories
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={openCreateDialog}
                                    className="h-12 bg-black px-6 font-semibold text-white shadow-sm hover:bg-zinc-800 hover:shadow-md"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Add Category
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-3 lg:gap-4"
                    >
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={index} variants={fadeInUp}>
                                    <motion.div whileHover={{ y: -2 }}>
                                        <Card className="border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                            <CardContent className="px-4 py-4 sm:px-4 sm:py-4 lg:py-5">
                                                <div className="flex flex-row items-center gap-3 sm:flex-row sm:items-center sm:gap-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 sm:h-10 sm:w-10">
                                                        <Icon className="h-5 w-5 text-zinc-600 sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-zinc-500 sm:text-base">
                                                            {stat.label}
                                                        </p>
                                                        <p className="text-xl font-bold text-black sm:text-xl lg:text-2xl">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Categories Grid */}
                    {categories.length > 0 ? (
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {categories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    variants={fadeInUp}
                                >
                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                            transition: { duration: 0.2 },
                                        }}
                                        className="h-full"
                                    >
                                        <Card className="group relative h-full overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-lg">
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                            <CardHeader className="relative border-b border-zinc-100 pb-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <motion.div
                                                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-2xl"
                                                            transition={{
                                                                duration: 0.5,
                                                            }}
                                                        >
                                                            {category.icon ||
                                                                '✂️'}
                                                        </motion.div>
                                                        <div className="min-w-0 flex-1">
                                                            <CardTitle className="mb-1 truncate text-lg font-bold text-black group-hover:underline">
                                                                {category.name}
                                                            </CardTitle>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-zinc-300 px-2 py-0.5 text-xs text-zinc-700"
                                                            >
                                                                <Package className="mr-1 h-3 w-3" />
                                                                {category.services_count ||
                                                                    0}{' '}
                                                                services
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="relative pb-4 pt-4">
                                                <p className="mb-4 line-clamp-2 min-h-[40px] text-sm text-zinc-600">
                                                    {category.description ||
                                                        'No description available'}
                                                </p>

                                                <div className="flex gap-2 border-t border-zinc-100 pt-3">
                                                    <motion.div
                                                        className="flex-1"
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    category,
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full border-zinc-300 transition-all hover:border-black hover:bg-zinc-50"
                                                        >
                                                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                                                            Edit
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                setDeleteCategory(
                                                                    category,
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                category.services_count >
                                                                0
                                                            }
                                                            className={`border-2 transition-all ${
                                                                category.services_count >
                                                                0
                                                                    ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-100'
                                                                    : 'border-red-300 text-red-600 hover:border-red-600 hover:bg-red-50'
                                                            }`}
                                                            title={
                                                                category.services_count >
                                                                0
                                                                    ? `Cannot delete category with ${category.services_count} service(s)`
                                                                    : 'Delete category'
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="py-20 text-center"
                        >
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100">
                                <Grid3x3 className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-black">
                                No categories yet
                            </h3>
                            <p className="mx-auto mb-8 max-w-md text-zinc-600">
                                Start organizing your services by creating your
                                first category
                            </p>
                            <Button
                                onClick={openCreateDialog}
                                className="h-12 bg-black px-8 font-semibold hover:bg-zinc-800"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create First Category
                            </Button>
                        </motion.div>
                    )}

                    {/* Create / Edit Dialog */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-md border-zinc-200 sm:max-w-lg lg:max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <DialogHeader className="px-4 sm:px-6">
                                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-black sm:text-2xl">
                                        {editingCategory ? (
                                            <>
                                                <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
                                                Edit Category
                                            </>
                                        ) : (
                                            <>
                                                <PackagePlus className="h-5 w-5 sm:h-6 sm:w-6" />
                                                Create New Category
                                            </>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription className="text-zinc-600">
                                        {editingCategory
                                            ? 'Update category information and organization'
                                            : 'Add a new category to organize your services'}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
                                    <div>
                                        <Label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-zinc-700"
                                        >
                                            Category Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="e.g., Hair Services"
                                            className="h-10 border-zinc-200 focus:border-black focus:ring-black sm:h-11"
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="description"
                                            className="mb-2 block text-sm font-semibold text-zinc-700"
                                        >
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe this category..."
                                            rows={3}
                                            className="resize-none border-zinc-200 focus:border-black focus:ring-black"
                                        />
                                        {errors.description && (
                                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="mb-3 block text-sm font-semibold text-zinc-700">
                                            Icon (Emoji)
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconsList.map((icon) => (
                                                <motion.button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() =>
                                                        setData('icon', icon)
                                                    }
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-all sm:h-12 sm:w-12 sm:text-2xl ${
                                                        data.icon === icon
                                                            ? 'border-black bg-zinc-50 shadow-sm'
                                                            : 'border-zinc-200 hover:border-zinc-400'
                                                    }`}
                                                >
                                                    {icon}
                                                </motion.button>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs text-zinc-500">
                                                Or enter custom emoji:
                                            </span>
                                            <Input
                                                value={data.icon}
                                                onChange={(e) =>
                                                    setData(
                                                        'icon',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="🎨"
                                                maxLength={2}
                                                className="h-8 w-16 border-zinc-200 text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Dialog */}
                                <DialogFooter className="gap-2 px-4 pb-4 sm:px-6 sm:pb-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowDialog(false)}
                                        className="h-10 border-2 border-zinc-300 text-sm font-semibold hover:bg-zinc-50 sm:h-11 sm:text-base"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={processing || !data.name}
                                        className="h-10 min-w-[120px] bg-black text-sm font-semibold hover:bg-zinc-800 sm:h-11 sm:text-base"
                                    >
                                        {processing ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            >
                                                <LoaderCircle className="h-4 w-4" />
                                            </motion.div>
                                        ) : (
                                            <>
                                                {editingCategory ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Update Category
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create Category
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </motion.div>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation */}
                    <AlertDialog
                        open={!!deleteCategory}
                        onOpenChange={() => setDeleteCategory(null)}
                    >
                        <AlertDialogContent className="border-zinc-200">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-2xl font-bold text-black">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                        Delete Category
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="leading-relaxed text-zinc-600">
                                        Are you sure you want to delete{' '}
                                        <strong className="text-black">
                                            {deleteCategory?.name}
                                        </strong>
                                        ?
                                        {deleteCategory &&
                                        deleteCategory.services_count > 0 ? (
                                            <span className="mt-2 block font-medium text-red-600">
                                                ⚠️ This category has{' '}
                                                {deleteCategory.services_count}{' '}
                                                service(s) and cannot be
                                                deleted.
                                            </span>
                                        ) : (
                                            <span className="mt-2 block">
                                                This action cannot be undone.
                                            </span>
                                        )}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="border-2 border-zinc-300 font-semibold hover:bg-zinc-50">
                                        Cancel
                                    </AlertDialogCancel>
                                    {deleteCategory &&
                                        deleteCategory.services_count === 0 && (
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-red-600 font-semibold text-white hover:bg-red-700"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Category
                                            </AlertDialogAction>
                                        )}
                                </AlertDialogFooter>
                            </motion.div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
