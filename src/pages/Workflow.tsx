import { useState } from "react";
import { User } from "@/lib/mockData";
import { useInitiatives } from "@/hooks/useInitiatives";
import { useWorkflowStages, usePendingApprovals, useApproveStage, useRejectStage } from "@/hooks/useWorkflowStages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User as UserIcon, ArrowLeft } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

interface WorkflowProps {
  user: User;
}

export default function Workflow({ user }: WorkflowProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  
  const { data: initiativesData } = useInitiatives();
  const { data: workflowStages = [], refetch: refetchStages } = useWorkflowStages(selectedInitiative || 0);
  const { data: pendingApprovals = [] } = usePendingApprovals(Number(user.id));
  const approveStage = useApproveStage();
  const rejectStage = useRejectStage();
  
  const initiatives = initiativesData?.content || initiativesData || [];
  const itemsPerPage = 6;
  const totalPages = Math.ceil(initiatives.length / itemsPerPage);
  const paginatedInitiatives = initiatives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleApprove = (stageId: number) => {
    approveStage.mutate(
      { stageId, comments: comments[stageId] || '' },
      {
        onSuccess: () => {
          toast({ title: "Stage approved successfully" });
          refetchStages();
          setComments(prev => ({ ...prev, [stageId]: '' }));
        },
        onError: () => {
          toast({ title: "Error approving stage", variant: "destructive" });
        }
      }
    );
  };

  const handleReject = (stageId: number) => {
    rejectStage.mutate(
      { stageId, comments: comments[stageId] || 'Rejected' },
      {
        onSuccess: () => {
          toast({ title: "Stage rejected" });
          refetchStages();
          setComments(prev => ({ ...prev, [stageId]: '' }));
        },
        onError: () => {
          toast({ title: "Error rejecting stage", variant: "destructive" });
        }
      }
    );
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
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'on hold': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedInitiativeData = initiatives.find((i: any) => i.id === selectedInitiative);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Management</h1>
        <p className="text-muted-foreground">Manage approval workflows and stage progressions</p>
      </div>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList>
          <TabsTrigger value="stages">Initiative Workflow</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-6">
          {!selectedInitiative ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Select Initiative</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedInitiatives.map((initiative: any) => (
                  <Card
                    key={initiative.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                    onClick={() => setSelectedInitiative(initiative.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{initiative.title}</CardTitle>
                        <Badge className={getStatusColor(initiative.status)}>
                          {initiative.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">{initiative.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Site: {initiative.site}</span>
                          <span className="text-muted-foreground">Stage: {initiative.currentStage || 1}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{initiative.progressPercentage}%</span>
                          </div>
                          <Progress value={initiative.progressPercentage} className="h-2" />
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            View Workflow →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink 
                          href="#" 
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedInitiative(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Initiatives
                </Button>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedInitiativeData?.title}</h2>
                  <p className="text-muted-foreground">Workflow Stages</p>
                </div>
              </div>
              
              {workflowStages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No workflow stages found for this initiative.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {workflowStages.map((stage: any, index: number) => (
                    <Card key={stage.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                              {stage.stageNumber}
                            </div>
                            <div>
                              <CardTitle className="text-xl">
                                {stage.stageName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Required Role: <span className="font-medium">{stage.requiredRole}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(stage.status)}
                            <Badge className={getStatusColor(stage.status)}>
                              {stage.status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {stage.approvedBy && (
                          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <UserIcon className="h-4 w-4" />
                            <span>Approved by: <span className="font-medium">{stage.approvedBy}</span></span>
                            <span className="text-muted-foreground">
                              on {new Date(stage.approvedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {stage.comments && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-1">Comments:</p>
                            <p className="text-sm">{stage.comments}</p>
                          </div>
                        )}

                        {stage.status === 'pending' && stage.requiredRole === user.role && (
                          <div className="space-y-4 border-t pt-4">
                            <Textarea
                              placeholder="Add comments (optional)"
                              value={comments[stage.id] || ''}
                              onChange={(e) => setComments(prev => ({ ...prev, [stage.id]: e.target.value }))}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => handleApprove(stage.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Stage
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleReject(stage.id)}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Stage
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
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground">All caught up! No stages require your approval at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingApprovals.map((stage: any) => (
                <Card key={stage.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {stage.initiative?.title}
                        </CardTitle>
                        <p className="text-lg text-muted-foreground">
                          Stage {stage.stageNumber}: {stage.stageName}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">PENDING</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Site:</span>
                        <p>{stage.initiative?.site}</p>
                      </div>
                      <div>
                        <span className="font-medium">Discipline:</span>
                        <p>{stage.initiative?.discipline}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <p>{stage.initiative?.priority}</p>
                      </div>
                      <div>
                        <span className="font-medium">Required Role:</span>
                        <p>{stage.requiredRole}</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Add comments (optional)"
                      value={comments[stage.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [stage.id]: e.target.value }))}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApprove(stage.id)}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(stage.id)}
                        className="flex-1"
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