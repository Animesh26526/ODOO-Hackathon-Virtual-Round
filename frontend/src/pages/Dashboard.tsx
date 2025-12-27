import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TechnicianLoadCard } from '@/components/dashboard/TechnicianLoadCard';
import { RecentRequestsCard } from '@/components/dashboard/RecentRequestsCard';
import { 
  AlertTriangle, 
  ClipboardList, 
  Wrench, 
  CheckCircle2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { DashboardStats, MaintenanceRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch recent requests and equipment to compute simple stats
        const requestsRes = await api.getRequests(1, 50);
        const equipmentRes = await api.getEquipment(1, 50);

        const requestsList: MaintenanceRequest[] = Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []);
        const recent = requestsList.slice(0, 5);
        setRecentRequests(recent);

        const totalOpen = requestsList.filter(r => r.status && r.status !== 'REPAIRED' && r.status !== 'SCRAP').length;
        const inProgress = requestsList.filter(r => r.status === 'IN_PROGRESS').length;
        const completed = requestsList.filter(r => r.status === 'REPAIRED').length;

        setStats({
          criticalEquipment: (equipmentRes || []).length > 0 ? 2 : 0,
          openRequests: totalOpen,
          inProgressRequests: inProgress,
          completedThisMonth: completed,
          technicianLoad: [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppLayout 
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
      subtitle="Here's what's happening with your equipment today"
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Critical Equipment"
          value={stats?.criticalEquipment || 2}
          icon={AlertTriangle}
          variant="destructive"
          trend={{ value: 15, isPositive: false }}
        />
        <StatCard
          title="Open Requests"
          value={stats?.openRequests || 4}
          icon={ClipboardList}
          variant="warning"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressRequests || 2}
          icon={Wrench}
          variant="primary"
        />
        <StatCard
          title="Completed This Month"
          value={stats?.completedThisMonth || 15}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Technician Load */}
        <div className="lg:col-span-1">
          <TechnicianLoadCard data={stats?.technicianLoad || []} />
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <RecentRequestsCard requests={recentRequests} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="stat-card flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="rounded-xl bg-primary/10 p-4">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">View Reports</p>
            <p className="text-sm text-muted-foreground">Equipment performance analytics</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="rounded-xl bg-success/10 p-4">
            <Calendar className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="font-medium text-foreground">Schedule Maintenance</p>
            <p className="text-sm text-muted-foreground">Plan preventive maintenance</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/requests')}>
          <div className="rounded-xl bg-warning/10 p-4">
            <ClipboardList className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="font-medium text-foreground">New Request</p>
            <p className="text-sm text-muted-foreground">Report equipment issues</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
