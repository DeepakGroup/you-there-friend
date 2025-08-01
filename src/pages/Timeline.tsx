import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Edit,
  Save,
  Target,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const mockInitiatives = [
  {
    id: "NDS/25/OP/AB/001",
    title: "Energy Optimization in Reactor Unit",
    site: "NDS",
    status: "In Progress",
    overallProgress: 65,
    timeline: [
      {
        taskId: 1,
        taskName: "Initial Assessment & Data Collection",
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-01-30"),
        status: "Completed",
        progress: 100,
        responsible: "Rajesh Kumar",
        accountable: "Site TSO Lead",
        consulted: "Process Engineers",
        informed: "Plant Manager",
        comments: "Baseline data collected successfully"
      },
      {
        taskId: 2,
        taskName: "Technical Solution Development",
        startDate: new Date("2025-01-31"),
        endDate: new Date("2025-02-15"),
        status: "In Progress",
        progress: 70,
        responsible: "Engineering Team",
        accountable: "Initiative Lead",
        consulted: "Technology Vendor",
        informed: "CMO",
        comments: "Design review scheduled for next week"
      },
      {
        taskId: 3,
        taskName: "MOC Documentation & Approval",
        startDate: new Date("2025-02-16"),
        endDate: new Date("2025-03-01"),
        status: "Not Started",
        progress: 0,
        responsible: "Initiative Lead",
        accountable: "Safety Manager",
        consulted: "Process Safety Team",
        informed: "Regulatory Team",
        comments: ""
      },
      {
        taskId: 4,
        taskName: "Implementation & Testing",
        startDate: new Date("2025-03-02"),
        endDate: new Date("2025-03-30"),
        status: "Not Started",
        progress: 0,
        responsible: "Operations Team",
        accountable: "Site TSO Lead",
        consulted: "Maintenance Team",
        informed: "All Stakeholders",
        comments: ""
      }
    ]
  }
];

const taskStatuses = ["Not Started", "In Progress", "On Hold", "Completed", "Overdue"];
const roles = ["Rajesh Kumar", "Engineering Team", "Operations Team", "Site TSO Lead", "Initiative Lead", "Safety Manager"];

export default function Timeline() {
  const [selectedInitiative, setSelectedInitiative] = useState(mockInitiatives[0]);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({
    taskName: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    responsible: "",
    accountable: "",
    consulted: "",
    informed: "",
    status: "Not Started",
    progress: 0,
    comments: ""
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-success text-success-foreground";
      case "In Progress": return "bg-primary text-primary-foreground";
      case "On Hold": return "bg-warning text-warning-foreground";
      case "Overdue": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-success";
    if (progress >= 70) return "text-primary";
    if (progress >= 40) return "text-warning";
    return "text-destructive";
  };

  const handleSaveTask = () => {
    console.log("Saving task updates for initiative:", selectedInitiative.id);
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (newTask.taskName && newTask.startDate && newTask.endDate) {
      console.log("Adding new task:", newTask);
      setNewTask({
        taskName: "",
        startDate: undefined,
        endDate: undefined,
        responsible: "",
        accountable: "",
        consulted: "",
        informed: "",
        status: "Not Started",
        progress: 0,
        comments: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timeline Tracking</h1>
          <p className="text-muted-foreground">Manage initiative timelines and RACI responsibilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Initiative: {selectedInitiative.id}
          </Badge>
          <Badge className="text-sm bg-primary text-primary-foreground">
            {selectedInitiative.overallProgress}% Complete
          </Badge>
        </div>
      </div>

      {/* Initiative Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {selectedInitiative.title}
          </CardTitle>
          <CardDescription>Site: {selectedInitiative.site} | Status: {selectedInitiative.status}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className={`font-semibold ${getProgressColor(selectedInitiative.overallProgress)}`}>
                {selectedInitiative.overallProgress}%
              </span>
            </div>
            <Progress value={selectedInitiative.overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline Management</TabsTrigger>
          <TabsTrigger value="raci">RACI Matrix</TabsTrigger>
          <TabsTrigger value="add-task">Add New Task</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Task Timeline
              </CardTitle>
              <CardDescription>Track progress and manage task timelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedInitiative.timeline.map((task) => (
                  <div key={task.taskId} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{task.taskName}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTask(editingTask === task.taskId ? null : task.taskId)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <p className="text-sm">{format(task.startDate, "PPP")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <p className="text-sm">{format(task.endDate, "PPP")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Responsible</label>
                        <p className="text-sm">{task.responsible}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Progress</label>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className={`text-sm font-semibold ${getProgressColor(task.progress)}`}>
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {editingTask === task.taskId && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select defaultValue={task.status}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {taskStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Progress (%)</label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              defaultValue={task.progress}
                              placeholder="Progress percentage"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Comments</label>
                          <Textarea 
                            defaultValue={task.comments}
                            placeholder="Add task comments or notes..."
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveTask} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {task.comments && (
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="text-sm text-muted-foreground">{task.comments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raci" className="space-y-4">
          {/* RACI Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                RACI Matrix
              </CardTitle>
              <CardDescription>
                Responsible, Accountable, Consulted, Informed matrix for all tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left font-semibold">Task</th>
                      <th className="border border-border p-3 text-center font-semibold">Responsible</th>
                      <th className="border border-border p-3 text-center font-semibold">Accountable</th>
                      <th className="border border-border p-3 text-center font-semibold">Consulted</th>
                      <th className="border border-border p-3 text-center font-semibold">Informed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInitiative.timeline.map((task) => (
                      <tr key={task.taskId} className="hover:bg-muted/50">
                        <td className="border border-border p-3 font-medium">
                          {task.taskName}
                        </td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            R
                          </Badge>
                          <p className="text-xs mt-1">{task.responsible}</p>
                        </td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="outline" className="bg-success/10 text-success">
                            A
                          </Badge>
                          <p className="text-xs mt-1">{task.accountable}</p>
                        </td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            C
                          </Badge>
                          <p className="text-xs mt-1">{task.consulted}</p>
                        </td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            I
                          </Badge>
                          <p className="text-xs mt-1">{task.informed}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">R</Badge>
                  <span>Responsible - Does the work</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success">A</Badge>
                  <span>Accountable - Signs off</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-warning/10 text-warning">C</Badge>
                  <span>Consulted - Provides input</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">I</Badge>
                  <span>Informed - Receives updates</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-task" className="space-y-4">
          {/* Add New Task */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Task
              </CardTitle>
              <CardDescription>Create a new task for the initiative timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Name *</label>
                <Input 
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                  placeholder="Enter task name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTask.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.startDate ? format(newTask.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.startDate}
                        onSelect={(date) => setNewTask({...newTask, startDate: date})}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium">End Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTask.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.endDate ? format(newTask.endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.endDate}
                        onSelect={(date) => setNewTask({...newTask, endDate: date})}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Responsible *</label>
                  <Select value={newTask.responsible} onValueChange={(value) => setNewTask({...newTask, responsible: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select responsible person" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Accountable *</label>
                  <Select value={newTask.accountable} onValueChange={(value) => setNewTask({...newTask, accountable: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select accountable person" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Consulted</label>
                  <Input 
                    value={newTask.consulted}
                    onChange={(e) => setNewTask({...newTask, consulted: e.target.value})}
                    placeholder="Who should be consulted"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Informed</label>
                  <Input 
                    value={newTask.informed}
                    onChange={(e) => setNewTask({...newTask, informed: e.target.value})}
                    placeholder="Who should be informed"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Comments</label>
                <Textarea 
                  value={newTask.comments}
                  onChange={(e) => setNewTask({...newTask, comments: e.target.value})}
                  placeholder="Add any additional notes or comments"
                  className="min-h-[80px]"
                />
              </div>

              <Button 
                onClick={handleAddTask}
                disabled={!newTask.taskName || !newTask.startDate || !newTask.endDate || !newTask.responsible || !newTask.accountable}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task to Timeline
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}