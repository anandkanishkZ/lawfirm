'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  Flag
} from 'lucide-react';
import type { ClientStats } from '@/lib/api/clients';

interface ClientStatsDashboardProps {
  stats: ClientStats;
}

export function ClientStatsDashboard({ stats }: ClientStatsDashboardProps) {
  const kycVerifiedPercentage = stats.totalClients > 0 
    ? Math.round((stats.verifiedKyc / stats.totalClients) * 100) 
    : 0;

  const activePercentage = stats.totalClients > 0 
    ? Math.round((stats.activeClients / stats.totalClients) * 100) 
    : 0;

  const highPriorityEstimate = Math.round(stats.totalClients * 0.15); // Estimate 15% as high priority

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <User className="mr-1 h-3 w-3" />
              {stats.individualClients} Individual
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Building2 className="mr-1 h-3 w-3" />
              {stats.companyClients} Company
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All registered clients in the system
          </p>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all" 
                style={{ width: `${activePercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium">{activePercentage}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Currently active and engaged
          </p>
        </CardContent>
      </Card>

      {/* KYC Verified */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.verifiedKyc}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${kycVerifiedPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium">{kycVerifiedPercentage}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Identity verification complete
          </p>
        </CardContent>
      </Card>

      {/* Pending KYC */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingKyc}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              Needs Review
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Awaiting verification
          </p>
        </CardContent>
      </Card>

      {/* KYC Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">KYC Status Breakdown</CardTitle>
          <CardDescription>Distribution of KYC verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(stats.verifiedKyc / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">{stats.verifiedKyc}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(stats.pendingKyc / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">{stats.pendingKyc}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Others</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${((stats.totalClients - stats.verifiedKyc - stats.pendingKyc) / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">
                  {stats.totalClients - stats.verifiedKyc - stats.pendingKyc}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Type Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Client Type Distribution</CardTitle>
          <CardDescription>Breakdown by client category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Individual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(stats.individualClients / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">{stats.individualClients}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span className="text-sm">Company</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(stats.companyClients / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">{stats.companyClients}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-600" />
                <span className="text-sm">Other Entities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full" 
                    style={{ width: `${((stats.totalClients - stats.individualClients - stats.companyClients) / stats.totalClients) * 100}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">
                  {stats.totalClients - stats.individualClients - stats.companyClients}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
