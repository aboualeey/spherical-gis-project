import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ProductsProvider } from '@/lib/contexts/ProductsContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spherical GIS',
  description: 'Professional GIS services and solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProductsProvider>
          {children}
          <Toaster position="top-right" />
        </ProductsProvider>
      </body>
    </html>
  )
}