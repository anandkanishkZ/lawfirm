'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  UserPlus, 
  Edit, 
  FileText, 
  Mail, 
  Phone, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

export interface ActivityEvent {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'document_added' | 'email_sent' | 'call_made' | 'meeting_scheduled' | 'case_assigned';
  title: string;
  description?: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'created':
        return <UserPlus className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'document_added':
        return <FileText className="h-4 w-4" />;
      case 'email_sent':
        return <Mail className="h-4 w-4" />;
      case 'call_made':
        return <Phone className="h-4 w-4" />;
      case 'meeting_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'case_assigned':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'created':
        return 'bg-green-500';
      case 'updated':
        return 'bg-blue-500';
      case 'status_change':
        return 'bg-purple-500';
      case 'document_added':
        return 'bg-orange-500';
      case 'email_sent':
        return 'bg-indigo-500';
      case 'call_made':
        return 'bg-teal-500';
      case 'meeting_scheduled':
        return 'bg-pink-500';
      case 'case_assigned':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No activity recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Complete history of client interactions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index !== events.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getColor(event.type)} flex items-center justify-center text-white z-10`}>
                {getIcon(event.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4 flex-shrink-0">
                    {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {event.user && (
                  <p className="text-xs text-gray-500 mt-1">by {event.user}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
