'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PERMISSIONS } from '@/lib/utils/auth';

interface UseAuthReturn {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string[]) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const hasPermission = (permission: string[]): boolean => {
    if (!isAuthenticated || !user?.role) return false;
    return permission.includes(user.role);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission,
    login,
    logout,
  };
}