import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-black dark:to-gray-900">
            {/* Background Blur Orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-r from-gray-300/20 to-transparent blur-3xl dark:from-gray-700/20" />
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-l from-gray-300/20 to-transparent blur-3xl dark:from-gray-700/20" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >


                {/* Glass Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
