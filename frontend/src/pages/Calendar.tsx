import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Wrench
} from 'lucide-react';
import { api } from '@/services/api';
import { MaintenanceRequest } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { hasPermission } = useAuth();

  const [allRequests, setAllRequests] = useState<MaintenanceRequest[]>([]);

  // Get preventive maintenance requests
  const preventiveRequests = allRequests
    .filter(r => r.type === 'PREVENTIVE');

  // Get scheduled dates
  const scheduledDates = preventiveRequests
    .filter(r => r.scheduledDate)
    .map(r => new Date(r.scheduledDate!));

  // Get requests for selected date
  const getRequestsForDate = (date: Date) => {
    return preventiveRequests.filter(r => {
      if (!r.scheduledDate) return false;
      const scheduled = new Date(r.scheduledDate);
      return scheduled.toDateString() === date.toDateString();
    });
  };

  const selectedDateRequests = selectedDate ? getRequestsForDate(selectedDate) : [];

  // Upcoming scheduled maintenance
  const upcomingMaintenance = preventiveRequests
    .filter(r => r.scheduledDate && new Date(r.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
    .slice(0, 5);

  useEffect(() => {
    const load = async () => {
      try {
        const res: unknown = await api.getRequests(1, 500, {});
        const list: MaintenanceRequest[] = Array.isArray(res)
          ? res as MaintenanceRequest[]
          : ((res as { data?: MaintenanceRequest[] })?.data || []);
        setAllRequests(list);
      } catch (err) {
        console.error('Failed to load requests', err);
      }
    };
    load();
  }, []);

  return (
    <AppLayout 
      title="Maintenance Calendar" 
      subtitle="Schedule and track preventive maintenance"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const prev = new Date(currentMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentMonth(prev);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const next = new Date(currentMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentMonth(next);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border-0"
              modifiers={{
                scheduled: scheduledDates,
              }}
              modifiersClassNames={{
                scheduled: "bg-primary/20 text-primary font-semibold",
              }}
            />

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded bg-primary/20" />
                <span className="text-muted-foreground">Scheduled Maintenance</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">Selected Date</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="stat-card mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                {hasPermission('requests.schedule') && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                )}
              </div>

              {selectedDateRequests.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="rounded-lg bg-success/10 p-3">
                        <Wrench className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{req.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {req.equipment?.name} • {req.technician?.name || 'Unassigned'}
                        </p>
                      </div>
                      <Badge className="status-new">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No maintenance scheduled for this date</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Maintenance Sidebar */}
        <div className="lg:col-span-1">
          <div className="stat-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Upcoming Maintenance
            </h3>
            
            {upcomingMaintenance.length > 0 ? (
              <div className="space-y-4">
                {upcomingMaintenance.map((req, index) => (
                  <div 
                    key={req.id}
                    className={cn(
                      "pb-4",
                      index < upcomingMaintenance.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm line-clamp-1">
                          {req.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {req.equipment?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(req.scheduledDate!).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Badge>
                          {req.technician && (
                            <span className="text-xs text-muted-foreground">
                              • {req.technician.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No upcoming maintenance</p>
              </div>
            )}

            {hasPermission('requests.schedule') && (
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="stat-card mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              This Month
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-semibold text-foreground">
                  {preventiveRequests.filter(r => r.scheduledDate).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-success">
                  {preventiveRequests.filter(r => r.status === 'REPAIRED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-warning">
                  {preventiveRequests.filter(r => r.status === 'NEW').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
