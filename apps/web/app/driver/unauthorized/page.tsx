'use client';

import Link from 'next/link';
import { ShieldAlert, Home, LogOut, Truck } from 'lucide-react';
import { useAuthStore } from '../../../lib/stores/authStore';

export default function DriverUnauthorizedPage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 text-orange-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Driver Access Required
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-2">
                        You don't have permission to access the driver dashboard.
                    </p>

                    {user && (
                        <p className="text-sm text-gray-500 mb-6">
                            Logged in as: <span className="font-medium">{user.email || user.displayName}</span>
                        </p>
                    )}

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-orange-800">
                            <strong>Driver account required.</strong> This area is only accessible to registered drivers. If you're a driver and seeing this message, please contact support.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Go to Homepage
                        </Link>

                        <Link
                            href="/driver/login"
                            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Truck className="w-5 h-5 mr-2" />
                            Driver Login
                        </Link>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Want to become a driver?{' '}
                        <a href="mailto:drivers@jaddpi.com" className="text-orange-600 hover:text-orange-700 font-medium">
                            Apply Here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
