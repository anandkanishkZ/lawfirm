'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { ConnectionStatus } from '@/components/ui/connection-status';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Law Firm Management System</title>
        <meta name="description" content="Comprehensive law firm management solution" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <ConnectionStatus />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}