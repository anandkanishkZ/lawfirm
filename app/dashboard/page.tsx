'use client';

import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FadeIn } from '@/components/ui/page-transition';
import {
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { mockDashboardStats, mockCases, mockHearings, mockTasks } from '@/lib/mock-data';
import { CASE_STATUS, PRIORITY_LEVELS } from '@/lib/constants';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = mockDashboardStats;

  const getStatusColor = (status: string) => {
    return CASE_STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Total Cases',
        value: stats.totalCases.toString(),
        icon: Briefcase,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        change: '+12%',
        trend: 'up',
      },
      {
        title: 'Active Cases',
        value: stats.activeCases.toString(),
        icon: Clock,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        change: '+8%',
        trend: 'up',
      },
      {
        title: 'Hearings Today',
        value: stats.hearingsToday.toString(),
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        change: '',
        trend: 'neutral',
      },
      {
        title: 'Pending Tasks',
        value: stats.pendingTasks.toString(),
        icon: CheckSquare,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        change: '-5%',
        trend: 'down',
      },
    ];

    const roleSpecificCards = {
      admin: [
        {
          title: 'Total Clients',
          value: stats.totalClients.toString(),
          icon: Users,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
          change: '+15%',
          trend: 'up',
        },
        {
          title: 'Pending Payments',
          value: stats.pendingPayments.toString(),
          icon: DollarSign,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          change: '-2%',
          trend: 'down',
        },
        {
          title: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          icon: TrendingUp,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          change: '+25%',
          trend: 'up',
        },
      ],
      lawyer: [
        {
          title: 'My Clients',
          value: '8',
          icon: Users,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
          change: '+3%',
          trend: 'up',
        },
        {
          title: 'Billing This Month',
          value: formatCurrency(125000),
          icon: DollarSign,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          change: '+18%',
          trend: 'up',
        },
      ],
      staff: [
        {
          title: 'Documents Processed',
          value: '34',
          icon: CheckSquare,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          change: '+12%',
          trend: 'up',
        },
      ],
      client: [
        {
          title: 'My Cases',
          value: '2',
          icon: Briefcase,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          change: '',
          trend: 'neutral',
        },
        {
          title: 'Upcoming Hearings',
          value: '1',
          icon: Calendar,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          change: '',
          trend: 'neutral',
        },
      ],
    };

    return [
      ...baseCards,
      ...(roleSpecificCards[user.role as keyof typeof roleSpecificCards] || []),
    ];
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Message */}
        <FadeIn>
          <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground shadow-strong">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">Welcome back, {user.name}!</h2>
              <p className="text-primary-foreground/90 text-lg">
                {user.role === 'admin' && 'Manage your law firm operations and monitor performance.'}
                {user.role === 'lawyer' && 'Stay on top of your cases and upcoming hearings.'}
                {user.role === 'staff' && 'Manage documents and support case operations.'}
                {user.role === 'client' && 'Track your cases and stay updated on progress.'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getDashboardCards().map((card, index) => (
            <FadeIn key={card.title} delay={index * 0.1}>
              <Card className="relative overflow-hidden card-hover-subtle group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <p className="text-3xl font-bold text-foreground">{card.value}</p>
                      {card.change && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className={`h-3 w-3 ${
                            card.trend === 'up' ? 'text-green-600' : 
                            card.trend === 'down' ? 'text-red-600 rotate-180' : 
                            'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            card.trend === 'up' ? 'text-green-600' : 
                            card.trend === 'down' ? 'text-red-600' : 
                            'text-gray-400'
                          }`}>
                            {card.change} from last month
                          </p>
                        </div>
                      )}
                    </div>
                    <div className={`p-4 rounded-xl ${card.bgColor} transition-transform duration-200 group-hover:scale-105`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Cases */}
          <FadeIn delay={0.2}>
            <Card className="card-hover-subtle">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span>Recent Cases</span>
                  </CardTitle>
                  <CardDescription>Latest case updates and activities</CardDescription>
                </div>
                <Link href="/cases">
                  <Button variant="outline" size="sm" className="btn-hover">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCases.slice(0, 3).map((case_, index) => (
                    <div key={case_.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{case_.title}</h4>
                        <p className="text-sm text-muted-foreground">{case_.caseNumber}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary" className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{case_.assignedLawyer}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(case_.updatedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Upcoming Hearings */}
          <FadeIn delay={0.3}>
            <Card className="card-hover-subtle">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Upcoming Hearings</span>
                  </CardTitle>
                  <CardDescription>Scheduled court hearings</CardDescription>
                </div>
                <Link href="/hearings">
                  <Button variant="outline" size="sm" className="btn-hover">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHearings.slice(0, 3).map((hearing) => (
                    <div key={hearing.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{hearing.caseTitle}</h4>
                          <p className="text-sm text-muted-foreground">{hearing.court}</p>
                          <p className="text-xs text-muted-foreground">Judge: {hearing.judge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{formatDate(hearing.date)}</p>
                        <p className="text-xs text-muted-foreground">{hearing.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Task Overview */}
          <FadeIn delay={0.4}>
            <Card className="card-hover-subtle">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <span>Task Overview</span>
                  </CardTitle>
                  <CardDescription>Current task status and progress</CardDescription>
                </div>
                <Link href="/tasks">
                  <Button variant="outline" size="sm" className="btn-hover">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{formatDate(task.dueDate)}</p>
                        <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={0.5}>
            <Card className="card-hover-subtle">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {user.role === 'admin' && (
                    <>
                      <Link href="/cases/new">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          New Case
                        </Button>
                      </Link>
                      <Link href="/clients/new">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          New Client
                        </Button>
                      </Link>
                      <Link href="/hearings/new">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule Hearing
                        </Button>
                      </Link>
                      <Link href="/billing/new">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      </Link>
                    </>
                  )}
                  {user.role === 'lawyer' && (
                    <>
                      <Link href="/cases">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View Cases
                        </Button>
                      </Link>
                      <Link href="/templates">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Templates
                        </Button>
                      </Link>
                      <Link href="/calendar">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Calendar className="mr-2 h-4 w-4" />
                          Calendar
                        </Button>
                      </Link>
                      <Link href="/clients">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Users className="mr-2 h-4 w-4" />
                          Clients
                        </Button>
                      </Link>
                    </>
                  )}
                  {user.role === 'staff' && (
                    <>
                      <Link href="/documents">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Documents
                        </Button>
                      </Link>
                      <Link href="/upload">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Upload Files
                        </Button>
                      </Link>
                      <Link href="/tasks">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <CheckSquare className="mr-2 h-4 w-4" />
                          My Tasks
                        </Button>
                      </Link>
                      <Link href="/cases">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Cases
                        </Button>
                      </Link>
                    </>
                  )}
                  {user.role === 'client' && (
                    <>
                      <Link href="/cases">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          My Cases
                        </Button>
                      </Link>
                      <Link href="/documents">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Documents
                        </Button>
                      </Link>
                      <Link href="/billing">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Invoices
                        </Button>
                      </Link>
                      <Link href="/calendar">
                        <Button className="w-full justify-start btn-hover" variant="outline">
                          <Calendar className="mr-2 h-4 w-4" />
                          Calendar
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </MainLayout>
  );
}