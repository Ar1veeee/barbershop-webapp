// UpdatePasswordForm.tsx
'use client';

import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { TextInput } from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, Lock, Key } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            <form onSubmit={updatePassword} className="space-y-5">
                {/* Current Password */}
                <div className="relative">
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            type={showCurrent ? 'text' : 'password'}
                            className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 pr-12 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            autoComplete="current-password"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                            {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.current_password} className="mt-1.5 text-sm text-red-600" />
                </div>

                {/* New Password */}
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            type={showNew ? 'text' : 'password'}
                            className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 pr-12 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                            {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-sm text-red-600" />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <TextInput
                            id="password_confirmation"
                            type={showConfirm ? 'text' : 'password'}
                            className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-11 pr-12 text-base focus:border-black focus:ring-2 focus:ring-black/10"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5 text-sm text-red-600" />
                </div>

                {/* Update Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <PrimaryButton
                            disabled={processing}
                            className="rounded-xl bg-black px-8 py-3 text-base font-medium text-white transition-all hover:shadow-lg hover:bg-gray-800 min-w-[160px]"
                        >
                            {processing ? 'Updating...' : 'Update Password'}
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
                            className="flex items-center gap-2 text-sm text-green-600 font-medium"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Password updated
                        </motion.p>
                    </Transition>
                </div>
            </form>
        </motion.div>
    );
}
