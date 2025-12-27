import { MaintenanceRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentRequestsCardProps {
  requests: MaintenanceRequest[];
}

const statusConfig = {
  NEW: { label: 'New', class: 'status-new', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', class: 'status-in-progress', icon: AlertTriangle },
  REPAIRED: { label: 'Repaired', class: 'status-repaired', icon: CheckCircle2 },
  SCRAP: { label: 'Scrap', class: 'status-scrap', icon: Trash2 },
};

const priorityConfig = {
  HIGH: { label: 'High', class: 'priority-high' },
  MEDIUM: { label: 'Medium', class: 'priority-medium' },
  LOW: { label: 'Low', class: 'priority-low' },
};

export function RecentRequestsCard({ requests }: RecentRequestsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Requests</h3>
        <Link to="/requests" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {requests.slice(0, 5).map((request) => {
          const status = statusConfig[request.status] || { label: 'Unknown', class: 'status-new', icon: Clock };
          const priority = priorityConfig[request.priority] || { label: 'Medium', class: 'priority-medium' };
          const StatusIcon = status?.icon || Clock;
          
          return (
            <div 
              key={request.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", (status.class || '').replace('status-', 'bg-') + '/20')}>
                  <StatusIcon className={cn("h-4 w-4", status.class || '')} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {request.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.equipment?.name || 'Unknown Equipment'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {request.isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
                <span className={cn("text-xs font-medium", priority.class || '')}>
                  {priority.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
