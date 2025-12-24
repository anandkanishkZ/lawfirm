'use client';

import { useAuth } from '@/lib/auth';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BackToTop } from '@/components/ui/back-to-top';
import { PageTransition } from '@/components/ui/page-transition';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto bg-gradient-mesh">
          <PageTransition className="min-h-full p-6">
            {children}
          </PageTransition>
          <BackToTop />
        </main>
      </div>
    </div>
  );
}