import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// Remove PrismaAdapter temporarily until database is properly set up
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/utils/prisma';

export const authOptions: NextAuthOptions = {
  // Remove adapter temporarily until database is properly set up
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.isActive) {
          throw new Error('This account has been deactivated');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirection after sign in
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect based on role will be handled in the client
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// Helper function to check if user has required role
export const hasRequiredRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Define role-based access control
export const ROLES = {
  MANAGING_DIRECTOR: 'MANAGING_DIRECTOR',
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  CASHIER: 'CASHIER',
  REPORT_VIEWER: 'REPORT_VIEWER',
};

// Define role permissions
export const PERMISSIONS = {
  // Dashboard access
  VIEW_DASHBOARD: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.CASHIER, ROLES.REPORT_VIEWER],
  
  // Inventory management
  VIEW_INVENTORY: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.CASHIER],
  MANAGE_INVENTORY: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
  
  // Product management
  VIEW_PRODUCTS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
  MANAGE_PRODUCTS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
  EDIT_PRODUCTS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
  
  // Sales management
  VIEW_SALES: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.CASHIER, ROLES.REPORT_VIEWER],
  PROCESS_SALES: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.CASHIER],
  
  // Reports
  VIEW_REPORTS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN, ROLES.REPORT_VIEWER],
  
  // User management
  VIEW_USERS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN],
  MANAGE_USERS: [ROLES.MANAGING_DIRECTOR, ROLES.ADMIN],
};

// Helper function to check if user has permission
export const hasPermission = (userRole: string, permission: string[]): boolean => {
  return permission.includes(userRole);
};