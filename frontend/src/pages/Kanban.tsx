
// Define RequestStatus type locally
type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  User,
  Calendar,
  GripVertical
} from 'lucide-react';
import { MaintenanceRequest } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface KanbanColumn {
  status: RequestStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  { status: 'NEW', label: 'New', icon: Clock, color: 'text-info', bgColor: 'bg-info/10' },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, color: 'text-warning', bgColor: 'bg-warning/10' },
  { status: 'REPAIRED', label: 'Repaired', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
  { status: 'SCRAP', label: 'Scrap', icon: Trash2, color: 'text-destructive', bgColor: 'bg-destructive/10' },
];

const priorityColors = {
  HIGH: 'border-l-destructive',
  MEDIUM: 'border-l-warning',
  LOW: 'border-l-success',
};

export default function KanbanPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res: unknown = await api.getRequests(1, 200);
        let list: MaintenanceRequest[] = [];
        if (Array.isArray(res)) {
          list = res as MaintenanceRequest[];
        } else if (
          res &&
          typeof res === 'object' &&
          'data' in res &&
          Array.isArray((res as { data: unknown }).data)
        ) {
          list = (res as { data: MaintenanceRequest[] }).data;
        }
        setRequests(list);
      } catch (err) {
        console.error('Failed to load requests', err);
      }
    };
    load();
  }, []);

  const getRequestsByStatus = (status: RequestStatus) => {
    return requests.filter(r => r.status === status);
  };

  const handleDragStart = (e: React.DragEvent, requestId: string) => {
    setDraggedCard(requestId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: RequestStatus) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    // Check permission
    if (!hasPermission('requests.update-status')) {
      toast.error('You do not have permission to update request status');
      return;
    }

    setRequests(prev => prev.map(r => r.id === draggedCard ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r));
    // persist change
    (async () => {
      try {
        await api.updateRequestStatus(draggedCard, newStatus);
        toast.success(`Request moved to ${columns.find(c => c.status === newStatus)?.label}`);
      } catch (err) {
        toast.error('Failed to update status');
        console.error('Status update error', err);
      }
    })();
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  return (
    <AppLayout 
      title="Kanban Board" 
      subtitle="Drag and drop to update maintenance request status"
    >
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-info" />
            {getRequestsByStatus('NEW').length} New
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {getRequestsByStatus('IN_PROGRESS').length} In Progress
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-success" />
            {getRequestsByStatus('REPAIRED').length} Repaired
          </Badge>
        </div>
        
        {hasPermission('requests.create') && (
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnRequests = getRequestsByStatus(column.status);
          const Icon = column.icon;
          
          return (
            <div
              key={column.status}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg", column.bgColor)}>
                    <Icon className={cn("h-4 w-4", column.color)} />
                  </div>
                  <h3 className="font-semibold text-foreground">{column.label}</h3>
                </div>
                <Badge variant="secondary">{columnRequests.length}</Badge>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnRequests.map((request, index) => (
                  <div
                    key={request.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, request.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "kanban-card border-l-4",
                      priorityColors[request.priority],
                      draggedCard === request.id && "opacity-50 scale-95"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      {request.isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                      {request.subject}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {request.equipment?.name || 'Unknown Equipment'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {request.technician?.name || 'Unassigned'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          request.type === 'PREVENTIVE' 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {request.type}
                      </Badge>
                    </div>
                  </div>
                ))}

                {columnRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No requests
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
