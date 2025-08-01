import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  FileText,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const workflowStages = [
  { stage: 1, name: "Register Initiative", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 2, name: "Approval (Decision Point)", role: "APPROVER", roleName: "Approver" },
  { stage: 3, name: "Assign Initiative ID & Define Responsibilities", role: "SITE_TSO_LEAD", roleName: "Site TSO Lead / Dept. Head" },
  { stage: 4, name: "MOC Required? (Decision Point)", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 5, name: "MOC", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 6, name: "MOC Approved", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 7, name: "CAPEX Required? (Decision Point)", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 8, name: "CAPEX Process", role: "SITE_TSO_LEAD", roleName: "Site TSO Lead" },
  { stage: 9, name: "CAPEX Approved", role: "SITE_TSO_LEAD", roleName: "Site TSO Lead" },
  { stage: 10, name: "Prepare Initiative Timeline Tracker", role: "INIT_LEAD", roleName: "Initiative Lead" },
  { stage: 11, name: "Trial Implementation and Performance Check", role: "SITE_TSO_LEAD", roleName: "Site TSO Lead" },
  { stage: 12, name: "Periodic Status Review with CMO", role: "CORP_TSO", roleName: "Corp TSO" },
  { stage: 13, name: "Savings Monitoring for 1 Month", role: "SITE_CORP_TSO", roleName: "Site TSO Lead & Corp TSO" },
  { stage: 14, name: "Savings Validation with F&A", role: "SITE_CORP_TSO", roleName: "Site TSO Lead & Corp TSO" },
  { stage: 15, name: "Initiative Closure", role: "SITE_TSO_LEAD", roleName: "Site TSO Lead" }
];

const mockInitiatives = [
  {
    id: "NDS/25/OP/AB/001",
    title: "Energy Optimization in Reactor Unit",
    site: "NDS",
    currentStage: 3,
    status: "In Progress",
    submittedDate: "2025-01-15",
    expectedSavings: "₹8.5L",
    priority: "High",
    initiator: "Rajesh Kumar",
    currentOwner: "Site TSO Lead",
    daysInStage: 5,
    comments: []
  },
  {
    id: "HSD1/25/EG/CD/002", 
    title: "Downtime Reduction Initiative",
    site: "HSD1",
    currentStage: 7,
    status: "Pending Decision",
    submittedDate: "2025-01-10",
    expectedSavings: "₹12.3L",
    priority: "Medium",
    initiator: "Priya Sharma",
    currentOwner: "Initiative Lead", 
    daysInStage: 2,
    comments: []
  },
  {
    id: "APL/25/QA/EF/003",
    title: "Quality Control Enhancement",
    site: "APL", 
    currentStage: 11,
    status: "Implementation",
    submittedDate: "2024-12-20",
    expectedSavings: "₹6.7L",
    priority: "High",
    initiator: "Amit Patel",
    currentOwner: "Site TSO Lead",
    daysInStage: 12,
    comments: []
  }
];

export default function Workflow() {
  const [selectedInitiative, setSelectedInitiative] = useState(mockInitiatives[0]);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<string>("");

  const getStageStatus = (stageNumber: number, currentStage: number) => {
    if (stageNumber < currentStage) return "completed";
    if (stageNumber === currentStage) return "current";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "current": return "bg-warning text-warning-foreground";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive text-destructive-foreground";
      case "Medium": return "bg-warning text-warning-foreground";
      case "Low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleApproval = (action: "approve" | "reject") => {
    console.log(`${action} initiative:`, selectedInitiative.id, "Comment:", comment);
    setComment("");
    setDecision("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflow Management</h1>
          <p className="text-muted-foreground">Manage initiative approval workflows and track progress</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {mockInitiatives.filter(i => i.currentStage <= 15).length} Active Workflows
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Initiative List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Initiatives Requiring Action</CardTitle>
            <CardDescription>Select an initiative to review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockInitiatives.map((initiative) => (
              <div
                key={initiative.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedInitiative?.id === initiative.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedInitiative(initiative)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {initiative.id}
                  </Badge>
                  <Badge className={getPriorityColor(initiative.priority)}>
                    {initiative.priority}
                  </Badge>
                </div>
                
                <h4 className="font-semibold text-sm mb-2">{initiative.title}</h4>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Stage {initiative.currentStage}/15</span>
                  <span className="font-semibold text-success">{initiative.expectedSavings}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{initiative.daysInStage} days in current stage</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedInitiative.title}
            </CardTitle>
            <CardDescription>
              Initiative ID: {selectedInitiative.id} | Site: {selectedInitiative.site}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="workflow" className="space-y-4">
              <TabsList>
                <TabsTrigger value="workflow">Workflow Progress</TabsTrigger>
                <TabsTrigger value="actions">Actions Required</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="workflow" className="space-y-4">
                {/* Workflow Progress */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Workflow Progress</h3>
                  <div className="space-y-2">
                    {workflowStages.map((stage) => {
                      const status = getStageStatus(stage.stage, selectedInitiative.currentStage);
                      const isCurrent = stage.stage === selectedInitiative.currentStage;
                      
                      return (
                        <div 
                          key={stage.stage}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isCurrent ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-12">
                            <span className="text-sm font-medium">{stage.stage}</span>
                            {status === "completed" && <CheckCircle className="h-4 w-4 text-success" />}
                            {status === "current" && <Clock className="h-4 w-4 text-warning" />}
                            {status === "pending" && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{stage.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Owner: {stage.roleName}
                            </p>
                          </div>
                          
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                {/* Action Required */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Action Required</h3>
                  
                  <div className="p-4 border border-warning/20 bg-warning/10 rounded-lg">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {workflowStages[selectedInitiative.currentStage - 1]?.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Current owner: {selectedInitiative.currentOwner}
                        </p>
                        
                        {/* Decision Points */}
                        {[2, 4, 7].includes(selectedInitiative.currentStage) && (
                          <div className="space-y-3">
                            <Select value={decision} onValueChange={setDecision}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select decision..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approve">Approve & Continue</SelectItem>
                                <SelectItem value="reject">Reject & Return</SelectItem>
                                {selectedInitiative.currentStage === 4 && (
                                  <>
                                    <SelectItem value="moc_required">MOC Required</SelectItem>
                                    <SelectItem value="moc_not_required">MOC Not Required</SelectItem>
                                  </>
                                )}
                                {selectedInitiative.currentStage === 7 && (
                                  <>
                                    <SelectItem value="capex_required">CAPEX Required</SelectItem>
                                    <SelectItem value="capex_not_required">CAPEX Not Required</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Add comments or feedback..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[80px]"
                          />
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleApproval("approve")}
                              className="gap-2"
                              disabled={!comment.trim()}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Approve & Forward
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleApproval("reject")}
                              className="gap-2"
                              disabled={!comment.trim()}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Reject & Return
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {/* History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Activity History</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Initiative Submitted</span>
                          <span className="text-xs text-muted-foreground">2025-01-15</span>
                        </div>
                        <p className="text-xs text-muted-foreground">By: {selectedInitiative.initiator}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Stage 1 Completed</span>
                          <span className="text-xs text-muted-foreground">2025-01-16</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Initiative registered successfully</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <MessageSquare className="h-4 w-4 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Approval Received</span>
                          <span className="text-xs text-muted-foreground">2025-01-18</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Approved with minor modifications suggested</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Pending Reviews</p>
                <p className="text-2xl font-bold text-warning">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Approved Today</p>
                <p className="text-2xl font-bold text-success">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-destructive">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-primary">15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}