'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }

    // Check if user has admin role
    if (!isLoading && isAuthenticated && pathname !== '/admin/login') {
      const hasAdminRole = user?.roles?.includes('admin');
      if (!hasAdminRole) {
        router.push('/admin/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

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
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  // Check if user has admin role (after authentication is confirmed)
  if (isAuthenticated && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
    const hasAdminRole = user?.roles?.includes('admin');
    if (!hasAdminRole) {
      return null; // Will redirect via useEffect
    }
  }

  return <>{children}</>;
}
