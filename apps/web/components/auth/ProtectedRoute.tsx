'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[ProtectedRoute] Auth state:', { 
      isLoading, 
      isAuthenticated, 
      hasUser: !!user, 
      roles: user?.roles, 
      pathname 
    });

    // Don't do anything while loading
    if (isLoading) {
      return;
    }

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== '/admin/login') {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      router.push('/admin/login');
      return;
    }

    // If authenticated but not on login page, check admin role
    if (isAuthenticated && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
      const hasAdminRole = user?.roles?.includes('admin');
      console.log('[ProtectedRoute] Checking admin role:', { hasAdminRole, roles: user?.roles });
      
      if (!hasAdminRole) {
        console.log('[ProtectedRoute] User does not have admin role, redirecting to unauthorized');
        router.push('/admin/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
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
