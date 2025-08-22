import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROLES, PERMISSIONS, hasPermission } from '@/lib/utils/auth';

interface UseAuthGuardOptions {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  allowUnauthenticated?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = '/login',
    allowUnauthenticated = false,
  } = options;

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;
  const userRole = user?.role as string;

  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || 
    (userRole && requiredRoles.includes(userRole));

  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    (userRole && requiredPermissions.every(permission => 
      hasPermission(userRole, PERMISSIONS[permission as keyof typeof PERMISSIONS])
    ));

  const isAuthorized = hasRequiredRole && hasRequiredPermissions;

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (!allowUnauthenticated && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If user is authenticated but doesn't have required permissions
    if (isAuthenticated && !isAuthorized) {
      router.push('/unauthorized');
      return;
    }
  }, [isLoading, isAuthenticated, isAuthorized, router, redirectTo, allowUnauthenticated]);

  return {
    isLoading,
    isAuthenticated,
    isAuthorized,
    user,
    userRole,
    hasRequiredRole,
    hasRequiredPermissions,
    // Helper functions for common role checks
    isAdmin: userRole === ROLES.ADMIN || userRole === ROLES.MANAGING_DIRECTOR,
    isManager: userRole === ROLES.MANAGING_DIRECTOR,
    canManageUsers: hasPermission(userRole || '', PERMISSIONS.MANAGE_USERS),
    canManageInventory: hasPermission(userRole || '', PERMISSIONS.MANAGE_INVENTORY),
    canProcessSales: hasPermission(userRole || '', PERMISSIONS.PROCESS_SALES),
    canViewReports: hasPermission(userRole || '', PERMISSIONS.VIEW_REPORTS),
  };
};

// Higher-order component for protecting pages
export const withAuthGuard = function <P extends object>(
  Component: React.ComponentType<P>,
  options: UseAuthGuardOptions = {}
) {
  const AuthGuardedComponent = (props: P) => {
    const { isLoading, isAuthorized } = useAuthGuard(options);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthorized) {
      return null; // useAuthGuard will handle the redirect
    }

    return <Component {...props} />;
  };

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return AuthGuardedComponent;
};

// Hook for checking specific permissions
export const usePermissions = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role as string;

  return {
    hasPermission: (permission: keyof typeof PERMISSIONS) => 
      hasPermission(userRole || '', PERMISSIONS[permission]),
    
    checkMultiplePermissions: (permissions: (keyof typeof PERMISSIONS)[]) => 
      permissions.every(permission => 
        hasPermission(userRole || '', PERMISSIONS[permission])
      ),
    
    hasAnyPermission: (permissions: (keyof typeof PERMISSIONS)[]) => 
      permissions.some(permission => 
        hasPermission(userRole || '', PERMISSIONS[permission])
      ),
  };
};