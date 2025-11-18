// DeleteUserForm.tsx
'use client';

import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { TextInput } from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Trash2, Shield } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                        <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Delete Account Permanently
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Once you delete your account, there is no going back.
                            All your data, bookings, and preferences will be permanently removed.
                        </p>
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <DangerButton
                        onClick={confirmUserDeletion}
                        className="rounded-xl border-2 border-red-600 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-base font-medium text-white transition-all hover:shadow-lg w-full sm:w-auto"
                    >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Account
                    </DangerButton>
                </motion.div>
            </div>

            <AnimatePresence>
                {confirmingUserDeletion && (
                    <Modal show={confirmingUserDeletion} onClose={closeModal}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-6 sm:p-8"
                        >
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <AlertCircle className="h-6 w-6" />
                                <h2 className="text-xl font-bold">
                                    Delete Your Account?
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-600 leading-relaxed">
                                    This action <strong className="text-red-600">cannot be undone</strong>.
                                    Please enter your password to confirm you want to permanently delete your account.
                                </p>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="h-12 w-full rounded-xl border-2 border-red-200 bg-white pl-11 text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                                        placeholder="Enter your password to confirm"
                                        isFocused
                                    />
                                </div>
                                <InputError message={errors.password} className="text-sm text-red-600" />
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                                <SecondaryButton
                                    onClick={closeModal}
                                    className="rounded-xl px-6 py-3 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                                >
                                    Cancel
                                </SecondaryButton>
                                <DangerButton
                                    disabled={processing}
                                    onClick={deleteUser}
                                    className="rounded-xl border-2 border-red-600 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-base font-medium text-white transition-all hover:shadow-lg"
                                >
                                    {processing ? 'Deleting...' : 'Delete Account'}
                                </DangerButton>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
