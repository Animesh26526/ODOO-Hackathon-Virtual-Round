
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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // demo/sample requests to ensure each column has content for nicer UX
  const sampleRequests: MaintenanceRequest[] = [
    { id: 'demo-new-1', subject: 'Replace air filter', status: 'NEW', priority: 'MEDIUM', type: 'CORRECTIVE', equipment: { name: 'HVAC Unit' }, technician: null, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-new-2', subject: 'Check coolant level', status: 'NEW', priority: 'MEDIUM', type: 'PREVENTIVE', equipment: { name: 'Compressor' }, technician: null, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-progress-1', subject: 'Inspect conveyor belt', status: 'IN_PROGRESS', priority: 'HIGH', type: 'CORRECTIVE', equipment: { name: 'Conveyor 1' }, technician: { name: 'Alex' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-progress-2', subject: 'Replace worn rollers', status: 'IN_PROGRESS', priority: 'HIGH', type: 'CORRECTIVE', equipment: { name: 'Conveyor 2' }, technician: { name: 'Sam' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-progress-3', subject: 'Lubricate bearings', status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'PREVENTIVE', equipment: { name: 'Roller A' }, technician: { name: 'Lee' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-repaired-1', subject: 'Calibrate sensor', status: 'REPAIRED', priority: 'LOW', type: 'PREVENTIVE', equipment: { name: 'Sensor A' }, technician: { name: 'Priya' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-repaired-2', subject: 'Tighten bolts', status: 'REPAIRED', priority: 'LOW', type: 'CORRECTIVE', equipment: { name: 'Pump B' }, technician: { name: 'Jordan' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-repaired-3', subject: 'Replace gasket', status: 'REPAIRED', priority: 'LOW', type: 'CORRECTIVE', equipment: { name: 'Valve 3' }, technician: { name: 'Ravi' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-repaired-4', subject: 'Update firmware', status: 'REPAIRED', priority: 'LOW', type: 'PREVENTIVE', equipment: { name: 'Controller X' }, technician: { name: 'Mira' }, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-scrap-1', subject: 'Dispose old motor', status: 'SCRAP', priority: 'LOW', type: 'CORRECTIVE', equipment: { name: 'Motor X' }, technician: null, createdAt: new Date().toISOString(), isOverdue: false },
    { id: 'demo-scrap-2', subject: 'Remove corroded panel', status: 'SCRAP', priority: 'LOW', type: 'CORRECTIVE', equipment: { name: 'Panel Z' }, technician: null, createdAt: new Date().toISOString(), isOverdue: false },
  ];

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
        // ensure each column has a small set of demo items for visual completeness
        const targetCounts: Record<RequestStatus, number> = { NEW: 2, IN_PROGRESS: 3, REPAIRED: 4, SCRAP: 2 };
        const augmented = [...list];
        for (const statusKey of Object.keys(targetCounts) as RequestStatus[]) {
          const needed = targetCounts[statusKey] - augmented.filter(r => r.status === statusKey).length;
          if (needed > 0) {
            const candidates = sampleRequests.filter(d => d.status === statusKey).slice(0, needed);
            // if not enough distinct samples, clone with suffixes
            for (let i = 0; i < needed; i++) {
              const base = candidates[i] || sampleRequests.find(d => d.status === statusKey)!;
              const clone = { ...base, id: `${base.id}-extra-${i}-${Math.random().toString(36).slice(2,6)}` } as MaintenanceRequest;
              augmented.push(clone);
            }
          }
        }
        setRequests(augmented);
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
          <Button variant="gradient" onClick={() => navigate('/requests')}>
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
                        {request.scheduledDate ? (
                          <span>{new Date(request.scheduledDate).toLocaleDateString()}</span>
                        ) : (
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        )}
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
