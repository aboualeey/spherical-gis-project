import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spherical GIS - Public Pages',
  description: 'Public pages for Spherical GIS services and information',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}