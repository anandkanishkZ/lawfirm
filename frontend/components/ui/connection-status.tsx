'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { api } from '@/lib/api/client';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    // Check backend connection
    const checkBackendConnection = async () => {
      try {
        await api.get('/health');
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    // Initial check
    checkBackendConnection();

    // Check network status
    const handleOnline = () => {
      setIsOnline(true);
      checkBackendConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBackendStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic backend check (every 30 seconds)
    const interval = setInterval(checkBackendConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && backendStatus === 'online') {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {!isOnline && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            No internet connection. Please check your network.
          </AlertDescription>
        </Alert>
      )}

      {isOnline && backendStatus === 'offline' && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Backend server is not responding. Some features may not work.
          </AlertDescription>
        </Alert>
      )}

      {backendStatus === 'checking' && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950 mt-2">
          <Wifi className="h-4 w-4 animate-pulse" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Connecting to server...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}