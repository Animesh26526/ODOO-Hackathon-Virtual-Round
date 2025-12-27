import { TechnicianLoad } from '@/types';
import { Progress } from '@/components/ui/progress';

interface TechnicianLoadCardProps {
  data: TechnicianLoad[];
}

export function TechnicianLoadCard({ data }: TechnicianLoadCardProps) {
  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Technician Workload</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const totalTasks = item.assignedCount + item.completedCount;
          const completionRate = totalTasks > 0 ? (item.completedCount / totalTasks) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {item.technician.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.technician.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.assignedCount} active • {item.completedCount} completed
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
