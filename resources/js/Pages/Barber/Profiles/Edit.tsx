import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    Banknote,
    Briefcase,
    Check,
    LoaderCircle,
    Mail,
    Phone,
    Upload,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const floatingAnimation = {
    y: [0, -6, 0],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

export default function Edit({
    user,
    mustVerifyEmail,
    status,
}: {
    user: User;
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const [preview, setPreview] = useState<string | null>(
        user.avatar_url || null,
    );
    const [isDragging, setIsDragging] = useState(false);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.barber_profile?.bio || '',
        specialization: user.barber_profile?.specialization || '',
        experience_years: user.barber_profile?.experience_years || 0,
        bank_account: user.barber_profile?.bank_account || '',
        avatar: null as File | null,
        _method: 'PATCH',
    });

    // === Avatar Upload & Drag Drop ===
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image must be smaller than 2MB');
                return;
            }
            profileForm.setData('avatar', file);
            setPreview(URL.createObjectURL(file));
            toast.success('Photo updated!');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleAvatarChange({ target: { files: [file] } } as any);
    };

    const removeAvatar = () => {
        profileForm.setData('avatar', null);
        setPreview(user.avatar_url || null);
        const input = document.getElementById('avatar') as HTMLInputElement;
        if (input) input.value = '';
        toast.success('Photo removed');
    };

    // === Form Submit ===
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(route('barber.profiles.update'), {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Profile updated successfully!'),
            onError: () => toast.error('Failed to update profile'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Profile" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-4 sm:py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 sm:mb-8"
                    >
                        <Link href={route('barber.dashboard')}>
                            <Button
                                variant="ghost"
                                className="group -ml-2 mb-4 text-zinc-600 transition-all duration-300 hover:bg-zinc-100 hover:text-black sm:-ml-3"
                                size="sm"
                            >
                                <motion.div
                                    whileHover={{ x: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span className="text-sm font-medium">
                                        Back to Dashboard
                                    </span>
                                </motion.div>
                            </Button>
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <motion.h1
                                    className="text-2xl font-bold tracking-tight text-black sm:text-3xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Profile Settings
                                </motion.h1>
                                <motion.p
                                    className="text-zinc-600"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Manage your professional profile and
                                    preferences
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {/* === Avatar Card === */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                        >
                            <Card className="overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-black">
                                        <UserIcon className="h-5 w-5" />
                                        Profile Photo
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="group relative"
                                        >
                                            <div
                                                className={`relative h-28 w-28 cursor-pointer overflow-hidden rounded-2xl border-4 transition-all duration-300 sm:h-36 sm:w-36 ${
                                                    isDragging
                                                        ? 'border-dashed border-black bg-zinc-100'
                                                        : 'border-zinc-200 bg-white group-hover:border-zinc-400'
                                                }`}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(true);
                                                }}
                                                onDragLeave={() =>
                                                    setIsDragging(false)
                                                }
                                                onDrop={handleDrop}
                                            >
                                                <img
                                                    src={
                                                        preview ||
                                                        '/images/default-avatar.png'
                                                    }
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                                    <motion.div
                                                        // @ts-ignore
                                                        animate={
                                                            floatingAnimation
                                                        }
                                                        className="text-center text-white"
                                                    >
                                                        <Upload className="mx-auto mb-1 h-6 w-6" />
                                                        <p className="text-xs font-medium">
                                                            Upload
                                                        </p>
                                                    </motion.div>
                                                </div>
                                                <input
                                                    id="avatar"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleAvatarChange
                                                    }
                                                    className="absolute inset-0 cursor-pointer opacity-0"
                                                />
                                                {preview && !isDragging && (
                                                    <motion.button
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        onClick={removeAvatar}
                                                        className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 opacity-0 shadow-lg transition-all hover:bg-zinc-100 group-hover:opacity-100"
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.9,
                                                        }}
                                                    >
                                                        <X className="h-3 w-3 text-zinc-700" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h4 className="mb-2 font-semibold text-black">
                                                Professional Photo
                                            </h4>
                                            <p className="mb-3 text-sm text-zinc-600">
                                                Upload a clear, professional
                                                headshot. This helps build trust
                                                with customers.
                                            </p>
                                            <div className="space-y-1 text-xs text-zinc-500">
                                                <p>
                                                    • Recommended: Square ratio
                                                </p>
                                                <p>• Max file size: 2MB</p>
                                                <p>• Formats: JPG, PNG, GIF</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* === Personal Information === */}
                        <motion.div
                            // @ts-ignore
                            variants={item}
                        >
                            <Card className="overflow-hidden border-zinc-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-black">
                                        <UserIcon className="h-5 w-5" />
                                        Personal Information
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleProfileSubmit}
                                        className="space-y-6"
                                    >
                                        {/* Basic Info Grid */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <motion.div
                                                // @ts-ignore
                                                variants={item}
                                                className="space-y-2"
                                            >
                                                <Label
                                                    htmlFor="name"
                                                    className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                                >
                                                    <UserIcon className="h-4 w-4" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={
                                                        profileForm.data.name
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div
                                                // @ts-ignore
                                                variants={item}
                                                className="space-y-2"
                                            >
                                                <Label
                                                    htmlFor="phone"
                                                    className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    value={
                                                        profileForm.data.phone
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                    placeholder="+62 812 3456 7890"
                                                />
                                            </motion.div>

                                            <motion.div
                                                // @ts-ignore
                                                variants={item}
                                                className="space-y-2"
                                            >
                                                <Label
                                                    htmlFor="email"
                                                    className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={
                                                        profileForm.data.email
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                    placeholder="you@example.com"
                                                />
                                            </motion.div>

                                            <motion.div
                                                // @ts-ignore
                                                variants={item}
                                                className="space-y-2"
                                            >
                                                <Label
                                                    htmlFor="experience"
                                                    className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                                >
                                                    <Briefcase className="h-4 w-4" />
                                                    Years of Experience
                                                </Label>
                                                <Input
                                                    id="experience"
                                                    type="number"
                                                    value={
                                                        profileForm.data
                                                            .experience_years
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'experience_years',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                    placeholder="5"
                                                    min="0"
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Specialization */}
                                        <motion.div
                                            // @ts-ignore
                                            variants={item}
                                            className="space-y-2"
                                        >
                                            <Label
                                                htmlFor="specialization"
                                                className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                            >
                                                <Award className="h-4 w-4" />
                                                Specialization
                                            </Label>
                                            <Input
                                                id="specialization"
                                                value={
                                                    profileForm.data
                                                        .specialization
                                                }
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'specialization',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                placeholder="e.g. Fade Expert, Beard Styling, Classic Cuts"
                                            />
                                        </motion.div>

                                        {/* Bio */}
                                        <motion.div
                                            // @ts-ignore
                                            variants={item}
                                            className="space-y-2"
                                        >
                                            <Label
                                                htmlFor="bio"
                                                className="text-sm font-medium text-zinc-700"
                                            >
                                                Professional Bio
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                value={profileForm.data.bio}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'bio',
                                                        e.target.value,
                                                    )
                                                }
                                                className="min-h-32 resize-none border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                placeholder="Tell customers about your expertise, style, and what makes your service special..."
                                            />
                                            <p className="text-xs text-zinc-500">
                                                This will be displayed on your
                                                public profile
                                            </p>
                                        </motion.div>

                                        {/* Bank Account */}
                                        <motion.div
                                            // @ts-ignore
                                            variants={item}
                                            className="space-y-2"
                                        >
                                            <Label
                                                htmlFor="bank"
                                                className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                                            >
                                                <Banknote className="h-4 w-4" />
                                                Bank Account for Payouts
                                            </Label>
                                            <Input
                                                id="bank"
                                                value={
                                                    profileForm.data
                                                        .bank_account
                                                }
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'bank_account',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-zinc-300 bg-white focus:border-black focus:ring-black"
                                                placeholder="BCA 1234567890 a.n. John Doe"
                                            />
                                            <p className="text-xs text-zinc-500">
                                                Ensure this is accurate for
                                                receiving payments
                                            </p>
                                        </motion.div>

                                        {/* Email Verification */}
                                        <AnimatePresence>
                                            {mustVerifyEmail &&
                                                !user.email_verified_at && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: 'auto',
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        className="rounded-xl border border-amber-200 bg-amber-50/80 p-4"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                                                                <span className="text-xs font-bold text-amber-600">
                                                                    !
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="mb-1 text-sm font-medium text-amber-800">
                                                                    Email
                                                                    Verification
                                                                    Required
                                                                </p>
                                                                <p className="mb-2 text-sm text-amber-700">
                                                                    Please
                                                                    verify your
                                                                    email
                                                                    address to
                                                                    access all
                                                                    features.
                                                                </p>
                                                                <Link
                                                                    href={route(
                                                                        'verification.send',
                                                                    )}
                                                                    method="post"
                                                                    as="button"
                                                                    className="text-sm font-medium text-amber-800 underline hover:no-underline"
                                                                >
                                                                    Resend
                                                                    verification
                                                                    email
                                                                </Link>
                                                                {status ===
                                                                    'verification-link-sent' && (
                                                                    <motion.p
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: 10,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                        }}
                                                                        className="mt-2 flex items-center gap-2 text-sm text-green-600"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                        Verification
                                                                        link
                                                                        sent!
                                                                    </motion.p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>

                                        {/* Submit Button */}
                                        <motion.div
                                            // @ts-ignore
                                            variants={item}
                                            className="flex justify-end pt-4"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        profileForm.processing
                                                    }
                                                    className="min-w-32 bg-black px-6 text-white hover:bg-zinc-800"
                                                    size="lg"
                                                >
                                                    {profileForm.processing ? (
                                                        <motion.div
                                                            animate={{
                                                                rotate: 360,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <LoaderCircle className="h-4 w-4" />
                                                            Saving...
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Check className="h-4 w-4" />
                                                            Save Changes
                                                        </div>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
