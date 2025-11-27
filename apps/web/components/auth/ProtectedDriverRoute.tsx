'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/authStore';

export default function ProtectedDriverRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication and driver role
        const checkAccess = () => {
            if (!isAuthenticated() && pathname !== '/driver/login') {
                router.push('/driver/login');
                return;
            }

            // Check if user has driver role
            if (isAuthenticated() && pathname !== '/driver/login' && pathname !== '/driver/unauthorized') {
                const hasDriverRole = user?.roles?.includes('driver');
                if (!hasDriverRole) {
                    router.push('/driver/unauthorized');
                    return;
                }
            }

            setIsLoading(false);
        };

        checkAccess();
    }, [isAuthenticated, user, pathname, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated and not on login page, don't render children
    if (!isAuthenticated() && pathname !== '/driver/login') {
        return null;
    }

    // Check if user has driver role (after authentication is confirmed)
    if (isAuthenticated() && pathname !== '/driver/login' && pathname !== '/driver/unauthorized') {
        const hasDriverRole = user?.roles?.includes('driver');
        if (!hasDriverRole) {
            return null; // Will redirect via useEffect
        }
    }

    return <>{children}</>;
}
