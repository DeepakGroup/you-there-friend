import { useState } from "react";
import { User } from "@/lib/mockData";
import { useInitiatives } from "@/hooks/useInitiatives";
import { useWorkflowStages, usePendingApprovals } from "@/hooks/useWorkflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User as UserIcon } from "lucide-react";
import { workflowAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface WorkflowProps {
  user: User;
}

export default function Workflow({ user }: WorkflowProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  
  const { data: initiatives = [] } = useInitiatives();
  const { data: workflowStages = [], refetch: refetchStages } = useWorkflowStages(selectedInitiative || 0);
  const { data: pendingApprovals = [] } = usePendingApprovals(Number(user.id));

  const handleApprove = async (stageId: number) => {
    try {
      await workflowAPI.approveStage(stageId, comments[stageId] || '');
      toast({ title: "Stage approved successfully" });
      refetchStages();
      setComments(prev => ({ ...prev, [stageId]: '' }));
    } catch (error) {
      toast({ title: "Error approving stage", variant: "destructive" });
    }
  };

  const handleReject = async (stageId: number) => {
    try {
      await workflowAPI.rejectStage(stageId, comments[stageId] || 'Rejected');
      toast({ title: "Stage rejected" });
      refetchStages();
      setComments(prev => ({ ...prev, [stageId]: '' }));
    } catch (error) {
      toast({ title: "Error rejecting stage", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Management</h1>
        <p className="text-muted-foreground">Manage approval workflows and stage progressions</p>
      </div>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList>
          <TabsTrigger value="stages">Initiative Stages</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Initiative</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedInitiative?.toString()} onValueChange={(value) => setSelectedInitiative(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an initiative to view workflow" />
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
              <h2 className="text-2xl font-semibold">Workflow Stages</h2>
              
              {workflowStages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No workflow stages found for this initiative.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {workflowStages.map((stage: any) => (
                    <Card key={stage.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(stage.status)}
                            <div>
                              <CardTitle className="text-lg">
                                Stage {stage.stageNumber}: {stage.stageName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Required Role: {stage.requiredRole}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(stage.status)}>
                            {stage.status?.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {stage.approvedBy && (
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-4 w-4" />
                            <span>Approved by: {stage.approvedBy}</span>
                            <span className="text-muted-foreground">
                              on {new Date(stage.approvedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {stage.comments && (
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm">{stage.comments}</p>
                          </div>
                        )}

                        {stage.status === 'pending' && stage.requiredRole === user.role && (
                          <div className="space-y-3 border-t pt-4">
                            <Textarea
                              placeholder="Add comments (optional)"
                              value={comments[stage.id] || ''}
                              onChange={(e) => setComments(prev => ({ ...prev, [stage.id]: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleApprove(stage.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleReject(stage.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Pending Approvals</h2>
            <p className="text-muted-foreground">Stages waiting for your approval</p>
          </div>
          
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No pending approvals found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApprovals.map((stage: any) => (
                <Card key={stage.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {stage.initiative?.title} - Stage {stage.stageNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {stage.stageName}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">PENDING</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Add comments (optional)"
                      value={comments[stage.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [stage.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(stage.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(stage.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}