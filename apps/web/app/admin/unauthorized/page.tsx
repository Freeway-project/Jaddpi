'use client';

import Link from 'next/link';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function UnauthorizedPage() {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 text-red-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Access Denied
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-2">
                        You don't have permission to access the admin panel.
                    </p>

                    {user && (
                        <p className="text-sm text-gray-500 mb-6">
                            Logged in as: <span className="font-medium">{user.email || user.displayName}</span>
                        </p>
                    )}

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800">
                            <strong>Admin access required.</strong> If you believe this is an error, please contact your system administrator.
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
                        Need admin access?{' '}
                        <a href="mailto:admin@jaddpi.com" className="text-blue-600 hover:text-blue-700 font-medium">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
