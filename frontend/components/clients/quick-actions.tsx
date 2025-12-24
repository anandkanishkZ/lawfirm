'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Flag,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  clientId: string;
  currentPriority: string;
  currentKycStatus: string;
  onUpdate: () => void;
}

export function QuickActions({ clientId, currentPriority, currentKycStatus, onUpdate }: QuickActionsProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updatePriority = async (newPriority: string) => {
    try {
      setUpdating(true);
      // Call API to update priority (to be implemented)
      // await updateClient(clientId, { priority: newPriority });
      
      toast({
        title: 'Priority Updated',
        description: `Client priority changed to ${newPriority}`,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateKycStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      // Call API to update KYC status (to be implemented)
      // await updateClient(clientId, { kycStatus: newStatus });
      
      toast({
        title: 'KYC Status Updated',
        description: `KYC status changed to ${newStatus.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update KYC status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Priority Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={updating}>
            <Flag className="mr-2 h-3 w-3" />
            {currentPriority}
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updatePriority('URGENT')}>
            <Badge className="bg-red-100 text-red-800 mr-2">URGENT</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePriority('HIGH')}>
            <Badge className="bg-orange-100 text-orange-800 mr-2">HIGH</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePriority('MEDIUM')}>
            <Badge className="bg-yellow-100 text-yellow-800 mr-2">MEDIUM</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePriority('LOW')}>
            <Badge className="bg-green-100 text-green-800 mr-2">LOW</Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* KYC Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={updating}>
            <Shield className="mr-2 h-3 w-3" />
            KYC
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Update KYC Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateKycStatus('VERIFIED')}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Verified
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateKycStatus('UNDER_REVIEW')}>
            <Clock className="mr-2 h-4 w-4 text-blue-600" />
            Under Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateKycStatus('INCOMPLETE')}>
            <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
            Incomplete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateKycStatus('REJECTED')}>
            <XCircle className="mr-2 h-4 w-4 text-red-600" />
            Rejected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateKycStatus('PENDING')}>
            <Clock className="mr-2 h-4 w-4 text-gray-600" />
            Pending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
