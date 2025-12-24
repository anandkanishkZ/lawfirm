'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Database, Shield, Clock } from 'lucide-react';
import { api } from '@/lib/api/client';

interface SystemStatus {
  api: 'online' | 'offline' | 'checking';
  database: 'connected' | 'disconnected' | 'checking';
  lastCheck: Date;
  responseTime?: number;
}

export function SystemStatusCard() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'checking',
    database: 'checking',
    lastCheck: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemStatus = async () => {
    setIsRefreshing(true);
    const startTime = performance.now();

    try {
      const response = await api.get('/health');
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setStatus({
        api: 'online',
        database: 'connected',
        lastCheck: new Date(),
        responseTime,
      });
    } catch (error) {
      setStatus({
        api: 'offline',
        database: 'disconnected',
        lastCheck: new Date(),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSystemStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (statusType: 'online' | 'offline' | 'checking' | 'connected' | 'disconnected') => {
    switch (statusType) {
      case 'online':
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>;
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Backend services and database connectivity
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">API Server</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Authentication & Core Services</p>
            </div>
          </div>
          {getStatusBadge(status.api)}
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PostgreSQL Connection</p>
            </div>
          </div>
          {getStatusBadge(status.database)}
        </div>

        {/* Performance Info */}
        {status.responseTime && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Health Check</p>
              </div>
            </div>
            <Badge variant="outline">
              {status.responseTime}ms
            </Badge>
          </div>
        )}

        {/* Last Check */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t">
          Last checked: {status.lastCheck.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}