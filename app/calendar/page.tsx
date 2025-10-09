'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  User,
  Briefcase,
  CheckSquare,
  Bell,
  Filter,
} from 'lucide-react';
import { mockCalendarEvents } from '@/lib/mock-data';
import { MONTHS, WEEKDAYS } from '@/lib/constants';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState('all');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  if (!user) return null;

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    }).filter(event => {
      if (filterType === 'all') return true;
      return event.type === filterType;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hearing': return 'bg-red-100 text-red-800 border-red-200';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'task': return 'bg-green-100 text-green-800 border-green-200';
      case 'holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'hearing': return <CalendarIcon className="h-3 w-3" />;
      case 'meeting': return <User className="h-3 w-3" />;
      case 'deadline': return <Clock className="h-3 w-3" />;
      case 'task': return <CheckSquare className="h-3 w-3" />;
      case 'holiday': return <Bell className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-100 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const events = getEventsForDate(date);

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate`}
              >
                <div className="flex items-center space-x-1">
                  {getEventTypeIcon(event.type)}
                  <span className="truncate">{event.title}</span>
                </div>
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const canCreateEvent = ['admin', 'lawyer'].includes(user.role);

  return (
    <MainLayout title="Calendar">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            <p className="text-gray-600">Manage your schedule and track important dates</p>
          </div>
          {canCreateEvent && (
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Add a new event to your calendar
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input id="title" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hearing">Hearing</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input id="date" type="date" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Input id="time" type="time" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsEventDialogOpen(false)}>
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Calendar Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="hearing">Hearings</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="deadline">Deadlines</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border-l border-t">
              {renderCalendarGrid()}
            </div>
          </CardContent>
        </Card>

        {/* Event Details Sidebar */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Events for {selectedDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      {event.time && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.time}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="mr-1 h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center mt-2 space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <div className="flex -space-x-1">
                            {event.attendees.slice(0, 3).map((attendee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs">
                                  {attendee.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {event.attendees.length > 3 && (
                              <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{event.attendees.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <Badge variant="outline" className={`mt-2 ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No events scheduled for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}