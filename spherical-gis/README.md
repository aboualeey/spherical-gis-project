# Spherical GIS Inventory Management System

A comprehensive inventory management system for Spherical GIS, a company specializing in GIS services and solar installations. This project is built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **User Authentication**: Secure login with role-based access control
- **Inventory Management**: Track products, stock levels, and locations
- **Sales Processing**: Create and manage sales transactions
- **Reporting**: Generate reports on sales and inventory
- **User Management**: Add, edit, and manage user accounts with different permission levels
- **Public Website**: Showcase services and allow customers to request quotes

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or SQLite for development)

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/spherical-gis.git
cd spherical-gis
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/spherical_gis"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Start the development server

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font.

## Default Login Credentials

- **Admin User**:
  - Email: admin@sphericalgis.com
  - Password: admin123

- **Inventory Manager**:
  - Email: manager@sphericalgis.com
  - Password: manager123

- **Cashier**:
  - Email: cashier@sphericalgis.com
  - Password: cashier123

- **Report Viewer**:
  - Email: viewer@sphericalgis.com
  - Password: viewer123

## Project Structure

```
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js app router
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── api/          # API routes
│   │   ├── login/        # Authentication pages
│   │   ├── public/       # Public website pages
│   ├── components/       # React components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI components
│   ├── lib/              # Utility functions and hooks
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # Service functions
│   │   ├── utils/        # Utility functions
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
