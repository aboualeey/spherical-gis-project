import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROLES, PERMISSIONS, hasPermission } from './auth';

interface AuthOptions {
  requiredRoles?: string[];
  requiredPermissions?: (keyof typeof PERMISSIONS)[];
  allowUnauthenticated?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
}

interface ApiContext {
  params?: Record<string, string | string[]>;
  [key: string]: unknown;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  response?: NextResponse;
}

/**
 * Middleware function to protect API routes with authentication and authorization
 */
export async function withAuth(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthResult> {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    allowUnauthenticated = false,
  } = options;

  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Check if user is authenticated
    if (!token && !allowUnauthenticated) {
      return {
        success: false,
        error: 'Authentication required',
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // If unauthenticated access is allowed and no token, return success
    if (!token && allowUnauthenticated) {
      return { success: true };
    }

    const userRole = token?.role as string;

    // Check required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return {
        success: false,
        error: 'Insufficient role permissions',
        response: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(userRole, PERMISSIONS[permission])
      );

      if (!hasAllPermissions) {
        return {
          success: false,
          error: 'Insufficient permissions',
          response: NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          ),
        };
      }
    }

    return {
      success: true,
      user: token,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      error: 'Authentication error',
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with authentication
 */
export function withApiAuth(
  handler: (request: NextRequest, context: ApiContext, user?: User) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async function authHandler(
    request: NextRequest,
    context: ApiContext
  ): Promise<NextResponse> {
    const authResult = await withAuth(request, options);

    if (!authResult.success) {
      return authResult.response!;
    }

    // Call the original handler with the authenticated user
    return handler(request, context, authResult.user);
  };
}

/**
 * Utility function to check if a user has specific permissions
 */
export function checkUserPermissions(
  userRole: string,
  requiredPermissions: (keyof typeof PERMISSIONS)[]
): boolean {
  return requiredPermissions.every(permission => 
    hasPermission(userRole, PERMISSIONS[permission])
  );
}

/**
 * Utility function to get user role from request
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    return token;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Common auth configurations for different types of routes
 */
export const AUTH_CONFIGS = {
  // Admin only routes
  ADMIN_ONLY: {
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR],
  },
  
  // Manager and above
  MANAGER_PLUS: {
    requiredRoles: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
  },
  
  // Any authenticated user
  AUTHENTICATED: {
    requiredRoles: Object.values(ROLES),
  },
  
  // Specific permission-based configs
  USER_MANAGEMENT: {
    requiredPermissions: ['MANAGE_USERS' as keyof typeof PERMISSIONS],
  },
  
  INVENTORY_MANAGEMENT: {
    requiredPermissions: ['MANAGE_INVENTORY' as keyof typeof PERMISSIONS],
  },
  
  SALES_PROCESSING: {
    requiredPermissions: ['PROCESS_SALES' as keyof typeof PERMISSIONS],
  },
  
  REPORTS_ACCESS: {
    requiredPermissions: ['VIEW_REPORTS' as keyof typeof PERMISSIONS],
  },
} as const;