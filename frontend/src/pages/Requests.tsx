import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// Removed Select, SelectContent, SelectItem, SelectTrigger, SelectValue import
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  Wrench,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { MaintenanceRequest, User, Equipment } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  NEW: { label: 'New', icon: Clock, class: 'status-new' },
  IN_PROGRESS: { label: 'In Progress', icon: Wrench, class: 'status-in-progress' },
  REPAIRED: { label: 'Repaired', icon: CheckCircle2, class: 'status-repaired' },
  SCRAP: { label: 'Scrap', icon: Trash2, class: 'status-scrap' },
};

const priorityConfig: Record<string, { label: string; class: string }> = {
  HIGH: { label: 'High', class: 'priority-high' },
  MEDIUM: { label: 'Medium', class: 'priority-medium' },
  LOW: { label: 'Low', class: 'priority-low' },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [type, setType] = useState<'PREVENTIVE' | 'CORRECTIVE'>('CORRECTIVE');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  // Assign
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const { hasPermission } = useAuth();
  const [viewRequest, setViewRequest] = useState<MaintenanceRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  

  function normalizeArray<T>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === 'object' && 'data' in res) {
      const d = (res as { data?: unknown }).data;
      if (Array.isArray(d)) return d as T[];
    }
    return [];
  }

  const loadEquipments = useCallback(async () => {
    try {
      const res: unknown = await api.getEquipment(1, 200);
      const list = normalizeArray<Equipment>(res);
      setEquipments(list);
    } catch (err) {
      console.error('Failed to load equipment', err);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: unknown = await api.getRequests(1, 200);
      let list: MaintenanceRequest[] = [];
      if (Array.isArray(res)) list = res as MaintenanceRequest[];
      else if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data?: unknown }).data)) list = (res as { data: MaintenanceRequest[] }).data;
      setRequests(list);
    } catch (err) {
      console.error('Failed to load requests', err);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    loadEquipments();
  }, [loadRequests, loadEquipments]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: Partial<MaintenanceRequest> = { subject, description, equipmentId, type, priority };
      const created: unknown = await api.createRequest(payload);
      toast.success('Request created');
      // optimistic UI update: attach equipment object if available
      let equipmentObj = null;
      if (created && typeof created === 'object' && 'equipmentId' in created) {
        const eid = (created as { equipmentId?: unknown }).equipmentId;
        equipmentObj = equipments.find((eq) => String(eq.id) === String(eid)) || null;
      }
      const createdReq = (created as MaintenanceRequest);
      const displayReq = { ...createdReq, equipment: equipmentObj, technician: createdReq.technician ?? null } as MaintenanceRequest;
      setRequests((prev) => [displayReq, ...prev]);
      setIsCreateOpen(false);
      setSubject(''); setDescription(''); setEquipmentId(null);
      // refresh list in background to ensure server data is in sync
      loadRequests().catch((err) => console.error('Refresh after create failed', err));
    } catch (err) {
      console.error('Create request failed', err);
      // attempt to confirm creation by refetching requests (in case backend created but returned an error)
      try {
        await loadRequests();
        const found = requests.find(r => r.subject === subject && String(r.equipmentId) === String(equipmentId));
        if (found) {
          toast.success('Request created (confirmed)');
          setIsCreateOpen(false);
          setSubject(''); setDescription(''); setEquipmentId(null);
          setCreating(false);
          return;
        }
      } catch (_e) {
        // ignore
      }
      const msg = (err && typeof err === 'object') ? (err.error || (err.message as string) || JSON.stringify(err)) : String(err);
      toast.error(msg || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  }

  async function openAssignModal(requestId: string) {
    setSelectedRequestId(requestId);
    setIsAssignOpen(true);
    try {
      const techs: unknown = await api.getTechnicians();
      if (Array.isArray(techs)) setTechnicians(techs as User[]);
      else if (techs && typeof techs === 'object' && 'data' in techs && Array.isArray((techs as { data?: unknown }).data)) setTechnicians((techs as { data: User[] }).data);
    } catch (err) {
      console.error('Failed to load technicians', err);
      toast.error('Failed to load technicians');
    }
  }

  async function handleAssign() {
    if (!selectedRequestId || !selectedTechnician) return toast.error('Select a technician');
    try {
      await api.assignRequest(selectedRequestId, selectedTechnician);
      toast.success('Request assigned');
      setIsAssignOpen(false);
      setSelectedRequestId(null);
      setSelectedTechnician(null);
      // optimistic update: update local request's technician immediately
      const tech = technicians.find(t => String(t.id) === String(selectedTechnician)) || null;
      setRequests(prev => prev.map(r => String(r.id) === String(selectedRequestId) ? { ...r, technician: tech, technicianId: selectedTechnician } : r));
      // refresh in background
      loadRequests().catch(() => {});
    } catch (err) {
      console.error('Assign failed', err);
      toast.error('Failed to assign request');
    }
  }

  const filteredRequests = requests.filter(req => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (req.subject || '').toLowerCase().includes(q) ||
      (req.equipment?.name || '').toLowerCase().includes(q) ||
      (req.technician?.name || '').toLowerCase().includes(q);
    
    const reqStatus = (req.status || '').toString().toUpperCase();
    const matchesStatus = statusFilter === 'all' || reqStatus === String(statusFilter).toUpperCase();
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppLayout 
      title="Maintenance Requests" 
      subtitle="View and manage all maintenance requests"
    >
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject, equipment, or technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-40 h-10 px-2 rounded border border-input bg-background"
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REPAIRED">Repaired</option>
            <option value="SCRAP">Scrap</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-40 h-10 px-2 rounded border border-input bg-background"
          >
            <option value="all">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {hasPermission('requests.create') && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-sm mb-1">Subject</label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Equipment</label>
                    <select value={equipmentId ?? ''} onChange={(e) => setEquipmentId(e.target.value)} required className="w-full h-10 px-2">
                      <option value="">Choose equipment</option>
                      {equipments.map((eq) => (
                        <option key={eq.id} value={String(eq.id)}>{eq.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={type} onChange={(e) => setType(e.target.value as 'PREVENTIVE' | 'CORRECTIVE')} className="h-10 px-2">
                      <option value="CORRECTIVE">Corrective</option>
                      <option value="PREVENTIVE">Preventive</option>
                    </select>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')} className="h-10 px-2">
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="gradient" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm"><strong>Subject:</strong> {viewRequest?.subject}</p>
            <p className="text-sm"><strong>Description:</strong> {viewRequest?.description || '—'}</p>
            <p className="text-sm"><strong>Equipment:</strong> {viewRequest?.equipment?.name || 'N/A'}</p>
            <p className="text-sm"><strong>Priority:</strong> {viewRequest?.priority}</p>
            <p className="text-sm"><strong>Status:</strong> {viewRequest?.status}</p>
            <p className="text-sm"><strong>Technician:</strong> {viewRequest?.technician?.name || 'Unassigned'}</p>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>Select a technician to assign this request to.</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <select value={selectedTechnician ?? ''} onChange={(e) => setSelectedTechnician(e.target.value)} className="w-full h-10 px-2">
              <option value="">Choose technician</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleAssign}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = requests.filter(r => (r.status || '').toString().toUpperCase() === status).length;
          const Icon = config.icon;
          return (
            <div 
              key={status}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                statusFilter === status ? "border-primary bg-primary/5" : "border-border bg-card"
              )}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", config.class.replace('status-', 'bg-') + '/20')}>
                  <Icon className={cn("h-4 w-4", config.class)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requests Table */}
      <div className="stat-card p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3">
                  Subject <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading requests...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => {
                const statusCfg = statusConfig[req.status] ?? { label: req.status ?? 'Unknown', icon: Clock, class: 'status-unknown' };
                const priorityCfg = priorityConfig[req.priority] ?? { label: req.priority ?? '—', class: 'priority-unknown' };
                const StatusIcon = statusCfg.icon ?? Clock;
                
                return (
                  <TableRow key={req.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {req.isOverdue && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium line-clamp-1">{req.subject}</span>
                      </div>
                    </TableCell>
                    <TableCell>{req.equipment?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          req.type === 'PREVENTIVE' 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {req.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("status-badge", statusCfg.class)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-medium", priorityCfg.class)}>
                        {priorityCfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {req.technician ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs">
                            {req.technician.name.charAt(0)}
                          </div>
                          <span className="text-sm">{req.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setViewRequest(req); setIsViewOpen(true); }}>
                        View
                      </Button>
                      {hasPermission('requests.assign') && (
                        <Button variant="ghost" size="sm" onClick={() => openAssignModal(req.id)}>
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}
