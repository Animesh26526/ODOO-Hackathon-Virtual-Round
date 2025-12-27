import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Wrench,
  MapPin,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Equipment } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  interface TeamOption { id: number | string; teamName?: string; name?: string; company?: string }
  interface CategoryOption { id: number | string; name: string }
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { hasPermission } = useAuth();

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: unknown = await api.getEquipment(1, 50);
      if (Array.isArray(response)) {
        setEquipment(response as Equipment[]);
        // extract categories and teams from returned equipment
        const cats = Array.from(new Map((response as Equipment[]).map(e => [String(e.category?.id || ''), e.category])).values()).filter(Boolean) as CategoryOption[];
        setCategories(cats);
        const ts = Array.from(new Map((response as Equipment[]).map(e => [String(e.team?.id || ''), e.team])).values()).filter(Boolean) as TeamOption[];
        setTeams(ts);
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data?: unknown }).data)) {
        setEquipment((response as { data: Equipment[] }).data || []);
        const list = (response as { data: Equipment[] }).data || [];
        const cats = Array.from(new Map(list.map(e => [String(e.category?.id || ''), e.category])).values()).filter(Boolean) as CategoryOption[];
        setCategories(cats);
        const ts = Array.from(new Map(list.map(e => [String(e.team?.id || ''), e.team])).values()).filter(Boolean) as TeamOption[];
        setTeams(ts);
      } else {
        setEquipment([]);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Create equipment modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newWarrantyEnd, setNewWarrantyEnd] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreating(true);
    try {
      const payload: { [k: string]: unknown } = {
        name: newName,
        serialNumber: newSerial,
        department: newDepartment,
        location: newLocation,
        warrantyEnd: newWarrantyEnd || null,
        teamId: selectedTeamId || (teams[0] && teams[0].id),
        categoryId: selectedCategoryId || (categories[0] && categories[0].id),
      };
      const res = await api.createEquipment(payload);
      // assume success if no thrown error
      toast.success('Equipment created');
      setIsCreateOpen(false);
      // reset form
      setNewName(''); setNewSerial(''); setNewDepartment(''); setNewLocation(''); setNewWarrantyEnd('');
      setSelectedTeamId(null); setSelectedCategoryId(null);
      // refresh list
      await fetchEquipment();
    } catch (err) {
      console.error('Create equipment failed', err);
      // try to confirm by refetching list; if equipment with same serial exists, treat as success
      try {
        await fetchEquipment();
        const exists = equipment.find(eq => eq.serialNumber === newSerial) || null;
        if (exists) {
          toast.success('Equipment created (confirmed)');
          setIsCreateOpen(false);
          setNewName(''); setNewSerial(''); setNewDepartment(''); setNewLocation(''); setNewWarrantyEnd('');
          setSelectedTeamId(null); setSelectedCategoryId(null);
          return;
        }
      } catch (_e) {
        // ignore
      }
      toast.error('Failed to create equipment');
    } finally {
      setCreating(false);
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWarrantyStatus = (warrantyEnd: string) => {
    const now = new Date();
    const warranty = new Date(warrantyEnd);
    const daysLeft = Math.ceil((warranty.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { label: 'Expired', class: 'bg-destructive/10 text-destructive' };
    if (daysLeft < 90) return { label: 'Expiring Soon', class: 'bg-warning/10 text-warning' };
    return { label: 'Active', class: 'bg-success/10 text-success' };
  };

  return (
    <AppLayout 
      title="Equipment" 
      subtitle="Manage and track all equipment in your facility"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment by name, serial, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {hasPermission('equipment.create') && (
            <>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <h3 className="text-lg font-semibold">Create Equipment</h3>
                    <div>
                      <label className="block text-sm mb-1">Name</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} required />
                    </div>
                      <div>
                        <label className="block text-sm mb-1">Team</label>
                        <select value={selectedTeamId ?? ''} onChange={(e) => setSelectedTeamId(e.target.value)} className="w-full h-10 px-2" required>
                          <option value="">Choose team</option>
                          {teams.map(t => (
                            <option key={t.id} value={String(t.id)}>{t.teamName || t.name || `Team ${t.id}`}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Category</label>
                        <select value={selectedCategoryId ?? ''} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full h-10 px-2" required>
                          <option value="">Choose category</option>
                          {categories.map(c => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    <div>
                      <label className="block text-sm mb-1">Serial Number</label>
                      <Input value={newSerial} onChange={(e) => setNewSerial(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Department</label>
                      <Input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Location</label>
                      <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Warranty End</label>
                      <Input type="date" value={newWarrantyEnd} onChange={(e) => setNewWarrantyEnd(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="gradient" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      {/* Equipment Table */}
      <div className="stat-card p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading equipment...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((eq) => {
                const warranty = getWarrantyStatus(eq.warrantyEnd);
                return (
                  <TableRow key={eq.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-xs text-muted-foreground">{eq.employeeName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{eq.serialNumber}</TableCell>
                    <TableCell>{eq.department}</TableCell>
                    <TableCell>{eq.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{eq.category?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{eq.team?.teamName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={warranty.class}>{warranty.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
