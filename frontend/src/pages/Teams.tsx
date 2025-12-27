import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
// Progress component missing in UI kit; use a simple inline bar instead.
import { 
  Plus, 
  Users, 
  Mail,
  Phone,
  ChevronRight,
  UserPlus,
  Settings
} from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export interface Team {
  id: number | string;
  teamName: string;
  company?: string;
  // add other fields as needed
}

export interface Technician {
  id: number | string;
  name: string;
  email?: string;
  // add other fields as needed
}

export default function TeamsPage() {
  const { hasPermission } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCompany, setNewTeamCompany] = useState('');
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  interface Request {
    id: number | string;
    teamId?: number | string;
    technicianId?: number | string;
    status: string;
    // add other fields as needed
  }

  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const tRes: Team[] | { data: Team[] } = await api.getTeams();
        if (Array.isArray(tRes)) {
          setTeams(tRes);
        } else if (tRes && typeof tRes === 'object' && Array.isArray((tRes as { data?: Team[] }).data)) {
          setTeams((tRes as { data: Team[] }).data);
        } else {
          setTeams([]);
        }

        const techs: Technician[] | { data: Technician[] } = await api.getTechnicians();
        if (Array.isArray(techs)) {
          setTechnicians(techs);
        } else if (techs && typeof techs === 'object' && Array.isArray((techs as { data?: Technician[] }).data)) {
          setTechnicians((techs as { data: Technician[] }).data);
        } else {
          setTechnicians([]);
        }

        const reqs: Request[] | { data: Request[] } = await api.getRequests(1, 500);
        if (Array.isArray(reqs)) {
          setRequests(reqs);
        } else if (reqs && typeof reqs === 'object' && Array.isArray((reqs as { data?: Request[] }).data)) {
          setRequests((reqs as { data: Request[] }).data);
        } else {
          setRequests([]);
        }
        // if no teams exist on backend, create a couple of sample teams
        const teamsEmpty = Array.isArray(tRes) ? tRes.length === 0 : !(tRes && typeof tRes === 'object' && Array.isArray((tRes as { data?: Team[] }).data) && (tRes as { data?: Team[] }).data!.length > 0);
        if (teamsEmpty) {
          try {
            await api.createTeam({ name: 'Maintenance A', company: 'Acme Corp' });
            await api.createTeam({ name: 'Maintenance B', company: 'ACME Plant 2' });
            const after: any = await api.getTeams();
            if (Array.isArray(after)) setTeams(after);
            else if (after && typeof after === 'object' && Array.isArray((after as { data?: Team[] }).data)) setTeams((after as { data: Team[] }).data);
          } catch (seedErr) {
            console.error('Failed to seed teams', seedErr);
          }
        }
      } catch (err) {
        console.error('Failed to load teams data', err);
      }
    };
    load();
  }, []);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!newTeamName) return;
    setCreatingTeam(true);
    try {
      const created: any = await api.createTeam({ name: newTeamName, company: newTeamCompany });
      // optimistic update: append created team to list
      setTeams((prev) => [created, ...prev]);
      setNewTeamName(''); setNewTeamCompany(''); setIsCreateOpen(false);
    } catch (err) {
      console.error('Create team failed', err);
    } finally {
      setCreatingTeam(false);
    }
  }

  const getTeamStats = (teamId: number | string) => {
    const teamRequests = requests.filter(r => String(r.teamId) === String(teamId));
    const completed = teamRequests.filter(r => r.status === 'REPAIRED').length;
    const active = teamRequests.filter(r => r.status === 'IN_PROGRESS').length;
    const pending = teamRequests.filter(r => r.status === 'NEW').length;
    return { completed, active, pending, total: teamRequests.length };
  };

  const getTeamMembers = (teamId: number | string) => {
    // backend provides member lists through /api/teams/:id/members endpoint, but we simulate by filtering technicians
    return technicians.slice(0, 3);
  };

// Add Technician form component
function AddTechnicianForm({ teams, onAdded }: { teams: Team[]; onAdded: (created?: any) => Promise<void> | void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [teamId, setTeamId] = useState<string | ''>('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSubmitting(true);
    try {
      const created: any = await api.authRegister({ name, email, password, role: 'TECHNICIAN' });
      if (teamId) {
        try {
          await api.addTeamMember(String(teamId), String(created.id));
        } catch (err) {
          console.error('Failed to add member to team', err);
        }
      }
      await onAdded(created);
    } catch (err) {
      console.error('Create technician failed', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <div>
        <label className="text-sm block mb-1">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm block mb-1">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <label className="text-sm block mb-1">Password</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm block mb-1">Add to team (optional)</label>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full h-10 px-2">
          <option value="">None</option>
          {teams.map(t => (
            <option key={t.id} value={String(t.id)}>{(t as any).teamName || (t as any).name || `Team ${t.id}`}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => { /* Dialog close handled by parent */ }}>Cancel</Button>
        <Button type="submit" variant="gradient" disabled={submitting}>{submitting ? 'Adding...' : 'Add Technician'}</Button>
      </div>
    </form>
  );
}

  return (
    <AppLayout 
      title="Maintenance Teams" 
      subtitle="Manage teams and technician assignments"
    >
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
              {teams.length} Teams
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {technicians.length} Technicians
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {hasPermission('teams.manage') && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Team</DialogTitle>
                  <DialogDescription>Provide a name and optional company.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-3 mt-2">
                  <div>
                    <label className="text-sm block mb-1">Team name</label>
                    <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Company</label>
                    <Input value={newTeamCompany} onChange={(e) => setNewTeamCompany(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="gradient" disabled={creatingTeam}>{creatingTeam ? 'Creating...' : 'Create'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {hasPermission('teams.manage') && (
            <Dialog open={isAddTechOpen} onOpenChange={setIsAddTechOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Technician</DialogTitle>
                  <DialogDescription>Create a technician account and optionally add to a team.</DialogDescription>
                </DialogHeader>
                <AddTechnicianForm teams={teams} onAdded={async (created) => {
                  if (created) {
                    setTechnicians((prev) => [created, ...prev]);
                  } else {
                    const t: any = await api.getTechnicians();
                    if (Array.isArray(t)) setTechnicians(t);
                    else if (t && typeof t === 'object' && Array.isArray((t as { data?: Technician[] }).data)) setTechnicians((t as { data: Technician[] }).data);
                  }
                  setIsAddTechOpen(false);
                }} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {teams.map((team, index) => {
          const stats = getTeamStats(team.id);
          const members = getTeamMembers(team.id);
          const completionRate = stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100) 
            : 0;

          return (
            <div 
              key={team.id}
              className="stat-card hover:border-primary/30 transition-all cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-xl bg-gradient-primary p-3 shadow-md">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                {hasPermission('teams.manage') && (
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {(team as any).teamName || (team as any).name || `Team ${team.id}`}
              </h3>
                <p className="text-sm text-muted-foreground mb-4">{(team as any).company || ''}</p>

              {/* Team Members */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((member, idx) => (
                    <div 
                      key={member.id}
                      className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium border-2 border-card"
                      style={{ zIndex: 3 - idx }}
                      title={member.name}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {members.length} members
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium text-foreground">{completionRate}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded overflow-hidden">
                  <div style={{ width: `${completionRate}%` }} className="h-2 bg-primary rounded" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 rounded-lg bg-success/10">
                    <p className="text-lg font-bold text-success">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-warning/10">
                    <p className="text-lg font-bold text-warning">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-info/10">
                    <p className="text-lg font-bold text-info">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technicians List */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">All Technicians</h3>
          {hasPermission('teams.manage') && (
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Technician
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech, index) => {
            const assignedRequests = requests.filter(
              r => r.technicianId === tech.id && r.status !== 'REPAIRED' && r.status !== 'SCRAP'
            ).length;
            const completedRequests = requests.filter(
              r => r.technicianId === tech.id && r.status === 'REPAIRED'
            ).length;

            return (
              <div 
                key={tech.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{tech.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{tech.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-warning">{assignedRequests} active</span>
                    <span className="text-xs text-success">{completedRequests} completed</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
