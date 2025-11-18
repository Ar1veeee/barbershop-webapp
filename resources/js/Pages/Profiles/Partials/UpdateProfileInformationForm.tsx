// UpdateProfileInformationForm.tsx
'use client';

import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput } from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Camera,
    CheckCircle,
    Mail,
    Phone,
    Upload,
    User,
    X,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;
    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: null as File | null,
            _method: 'PATCH',
        });

    const [preview, setPreview] = useState<string | null>(user.avatar_url);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeAvatar = () => {
        setData('avatar', null);
        setPreview(user.avatar_url);
        (document.getElementById('avatar') as HTMLInputElement).value = '';
    };

    let updateRoute = '';
    switch (user.role) {
        case 'customer':
            updateRoute = route('customer.profile.update');
            break;
        case 'barber':
            updateRoute = route('barber.profile.update');
            break;
        default:
            updateRoute = route('profile.fallback');
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(updateRoute, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <form onSubmit={submit} className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 sm:flex-row">
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                        >
                            <img
                                src={preview || user.avatar_url || '/default-avatar.png'}
                                alt="Avatar"
                                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=1f2937&color=fff&bold=true`;
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-0 transition-all duration-300 hover:bg-opacity-20">
                                <Camera className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
                            </div>
                        </motion.div>
                        {preview && preview !== user.avatar_url && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                type="button"
                                onClick={removeAvatar}
                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
                            >
                                <X className="h-3 w-3" />
                            </motion.button>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="mb-2 font-semibold text-gray-900">
                            Profile Photo
                        </h4>
                        <label className="cursor-pointer">
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-black hover:bg-gray-50"
                            >
                                <Upload className="h-4 w-4" />
                                Change Photo
                            </motion.div>
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG, max 2MB. Recommended: 256x256px
                        </p>
                        <InputError
                            message={errors.avatar}
                            className="mt-1.5 text-sm text-red-600"
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="relative">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <TextInput
                                id="name"
                                className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                isFocused
                                autoComplete="name"
                                placeholder="Your full name"
                            />
                        </div>
                        <InputError
                            message={errors.name}
                            className="mt-1.5 text-sm text-red-600"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <TextInput
                                id="email"
                                type="email"
                                className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoComplete="username"
                                placeholder="you@example.com"
                            />
                        </div>
                        <InputError
                            message={errors.email}
                            className="mt-1.5 text-sm text-red-600"
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="relative md:col-span-2">
                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <TextInput
                                id="phone"
                                type="tel"
                                className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                required
                                autoComplete="tel"
                                placeholder="+62 812 3456 7890"
                            />
                        </div>
                        <InputError
                            message={errors.phone}
                            className="mt-1.5 text-sm text-red-600"
                        />
                    </div>
                </div>

                {/* Email Verification */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700"
                    >
                        <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Your email is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 font-medium underline hover:no-underline"
                            >
                                Resend verification email
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 flex items-center gap-2 text-green-600"
                            >
                                <CheckCircle className="h-4 w-4" />
                                New verification link sent!
                            </motion.p>
                        )}
                    </motion.div>
                )}

                {/* Save Button */}
                <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <PrimaryButton
                            disabled={processing}
                            className="min-w-[140px] rounded-xl bg-black px-8 py-3 text-base font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </motion.div>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <motion.p
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm font-medium text-green-600"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Profile updated successfully
                        </motion.p>
                    </Transition>
                </div>
            </form>
        </motion.div>
    );
}
