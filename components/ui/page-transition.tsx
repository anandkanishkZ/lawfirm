'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div 
      className={cn("animate-fade-in", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <div 
      className={cn("animate-slide-up", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}