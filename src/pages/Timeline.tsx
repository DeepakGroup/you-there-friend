import { useState } from "react";
import { User } from "@/lib/mockData";
import { useInitiatives } from "@/hooks/useInitiatives";
import { useTimelineTasks, useUpdateTaskProgress } from "@/hooks/useTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";

interface TimelineProps {
  user: User;
}

export default function Timeline({ user }: TimelineProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<number | null>(null);
  const { data: initiatives = [], isLoading: initiativesLoading } = useInitiatives();
  const { data: timelineTasks = [], isLoading: tasksLoading } = useTimelineTasks(selectedInitiative || 0);
  const updateProgressMutation = useUpdateTaskProgress();

  const handleProgressUpdate = (taskId: number, progress: number) => {
    updateProgressMutation.mutate({ id: taskId, progress });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeline Tracking</h1>
        <p className="text-muted-foreground">Track initiative timelines and progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Initiative</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedInitiative?.toString()} onValueChange={(value) => setSelectedInitiative(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an initiative to view timeline" />
            </SelectTrigger>
            <SelectContent>
              {initiatives.map((initiative: any) => (
                <SelectItem key={initiative.id} value={initiative.id.toString()}>
                  {initiative.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedInitiative && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Timeline Tasks</h2>
          
          {tasksLoading ? (
            <div>Loading timeline tasks...</div>
          ) : timelineTasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No timeline tasks found for this initiative.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {timelineTasks.map((task: any) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{task.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>End: {new Date(task.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Responsible: {task.responsible}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{task.progress || 0}%</span>
                      </div>
                      <Progress value={task.progress || 0} className="h-2" />
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleProgressUpdate(task.id, Math.min((task.progress || 0) + 25, 100))}
                          disabled={updateProgressMutation.isPending}
                        >
                          +25%
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleProgressUpdate(task.id, 100)}
                          disabled={updateProgressMutation.isPending}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}