import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useInitiatives } from '@/hooks/useInitiatives';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  role: string;
  site: string;
}

interface MonthlyMonitoringEntry {
  id?: number;
  monitoringMonth: string; // YYYY-MM format
  kpiDescription: string;
  targetValue: number;
  achievedValue?: number;
  deviation?: number;
  remarks?: string;
  isFinalized: boolean;
  faApproval: boolean;
  faComments?: string;
  enteredBy: string;
}

interface MonthlyMonitoringProps {
  user: User;
}

const monitoringAPI = {
  getByInitiative: (initiativeId: number) => 
    axios.get(`/api/monthly-monitoring/${initiativeId}`).then(res => res.data.data),
  getByInitiativeAndMonth: (initiativeId: number, month: string) => 
    axios.get(`/api/monthly-monitoring/${initiativeId}/month/${month}`).then(res => res.data.data),
  create: (initiativeId: number, entry: MonthlyMonitoringEntry) => 
    axios.post(`/api/monthly-monitoring/${initiativeId}`, entry).then(res => res.data.data),
  update: (id: number, entry: MonthlyMonitoringEntry) => 
    axios.put(`/api/monthly-monitoring/entry/${id}`, entry).then(res => res.data.data),
  updateFinalization: (id: number, isFinalized: boolean) => 
    axios.put(`/api/monthly-monitoring/entry/${id}/finalize`, null, {
      params: { isFinalized }
    }).then(res => res.data.data),
  updateFAApproval: (id: number, faApproval: boolean, faComments?: string) => 
    axios.put(`/api/monthly-monitoring/entry/${id}/fa-approval`, null, {
      params: { faApproval, faComments }
    }).then(res => res.data.data),
  delete: (id: number) => 
    axios.delete(`/api/monthly-monitoring/entry/${id}`).then(res => res.data),
};

export default function MonthlyMonitoring({ user }: MonthlyMonitoringProps) {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MonthlyMonitoringEntry | null>(null);
  const [formData, setFormData] = useState<Partial<MonthlyMonitoringEntry>>({});
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 6;

  // Fetch initiatives
  const { data: initiatives = [], isLoading: initiativesLoading } = useInitiatives();

  // Fetch monitoring entries for selected initiative
  const { data: monitoringEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['monitoring-entries', selectedInitiativeId],
    queryFn: () => monitoringAPI.getByInitiative(selectedInitiativeId!),
    enabled: !!selectedInitiativeId,
  });

  // Fetch entries for specific month
  const { data: monthlyEntries = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['monitoring-entries', selectedInitiativeId, selectedMonth],
    queryFn: () => monitoringAPI.getByInitiativeAndMonth(selectedInitiativeId!, selectedMonth),
    enabled: !!selectedInitiativeId && !!selectedMonth,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (entry: MonthlyMonitoringEntry) => monitoringAPI.create(selectedInitiativeId!, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry created successfully" });
      setIsDialogOpen(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, entry }: { id: number; entry: MonthlyMonitoringEntry }) => 
      monitoringAPI.update(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry updated successfully" });
      setIsDialogOpen(false);
      setEditingEntry(null);
      setFormData({});
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ id, isFinalized }: { id: number; isFinalized: boolean }) => 
      monitoringAPI.updateFinalization(id, isFinalized),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Finalization status updated" });
    },
  });

  const faApprovalMutation = useMutation({
    mutationFn: ({ id, faApproval, faComments }: { id: number; faApproval: boolean; faComments?: string }) => 
      monitoringAPI.updateFAApproval(id, faApproval, faComments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "F&A approval status updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: monitoringAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry deleted successfully" });
    },
  });

  // Pagination logic for initiatives
  const paginatedInitiatives = initiatives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(initiatives.length / itemsPerPage);

  // Generate chart data
  const chartData = monitoringEntries.map((entry: MonthlyMonitoringEntry) => ({
    month: entry.monitoringMonth,
    target: entry.targetValue,
    achieved: entry.achievedValue || 0,
    deviation: entry.deviation || 0,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kpiDescription || !formData.targetValue || !formData.monitoringMonth) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const entryData = {
      ...formData,
      enteredBy: user.role,
      isFinalized: false,
      faApproval: false,
    } as MonthlyMonitoringEntry;

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id!, entry: entryData });
    } else {
      createMutation.mutate(entryData);
    }
  };

  const handleEdit = (entry: MonthlyMonitoringEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setIsDialogOpen(true);
  };

  const canEdit = (entry: MonthlyMonitoringEntry) => {
    return user.role === 'Site TSO' || user.role === 'Corp TSO' || 
           (user.role === 'F&A Approver' && !entry.isFinalized);
  };

  const canApprove = () => {
    return user.role === 'F&A Approver';
  };

  if (initiativesLoading) {
    return <div className="flex justify-center items-center h-64">Loading initiatives...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monthly Monitoring Sheet</h1>
        {selectedInitiativeId && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData({}); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add KPI Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit KPI Entry' : 'Add KPI Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="kpiDescription">KPI Description *</Label>
                  <Input
                    id="kpiDescription"
                    value={formData.kpiDescription || ''}
                    onChange={(e) => setFormData({ ...formData, kpiDescription: e.target.value })}
                    placeholder="Enter KPI description"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="monitoringMonth">Monitoring Month *</Label>
                  <Input
                    id="monitoringMonth"
                    type="month"
                    value={formData.monitoringMonth || ''}
                    onChange={(e) => setFormData({ ...formData, monitoringMonth: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target Value *</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.01"
                      value={formData.targetValue || ''}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                      placeholder="Enter target value"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievedValue">Achieved Value</Label>
                    <Input
                      id="achievedValue"
                      type="number"
                      step="0.01"
                      value={formData.achievedValue || ''}
                      onChange={(e) => setFormData({ ...formData, achievedValue: parseFloat(e.target.value) })}
                      placeholder="Enter achieved value"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter any remarks"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingEntry ? 'Update' : 'Create'} Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedInitiativeId ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select an Initiative</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedInitiatives.map((initiative) => (
              <Card
                key={initiative.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedInitiativeId(initiative.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{initiative.title}</CardTitle>
                  <Badge variant="outline">{initiative.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Site: {initiative.site}</div>
                    <div>Lead: {initiative.initiativeLead}</div>
                    <div>Expected Savings: ₹{initiative.expectedSavings} Lakhs</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Monitoring for: {initiatives.find(i => i.id === selectedInitiativeId)?.title}
            </h2>
            <Button variant="outline" onClick={() => setSelectedInitiativeId(null)}>
              Back to Initiatives
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {entriesLoading ? (
                <div className="flex justify-center items-center h-64">Loading monitoring entries...</div>
              ) : (
                <div className="space-y-4">
                  {monitoringEntries.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No monitoring entries found for this initiative.</p>
                        <p className="text-sm text-muted-foreground mt-2">Click "Add KPI Entry" to get started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>KPI Description</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Achieved</TableHead>
                          <TableHead>Deviation</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monitoringEntries.map((entry: MonthlyMonitoringEntry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.monitoringMonth}</TableCell>
                            <TableCell>{entry.kpiDescription}</TableCell>
                            <TableCell>{entry.targetValue}</TableCell>
                            <TableCell>{entry.achievedValue || '-'}</TableCell>
                            <TableCell>
                              <span className={`${entry.deviation && entry.deviation < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {entry.deviation || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {entry.isFinalized && <Badge variant="outline">Finalized</Badge>}
                                {entry.faApproval && <Badge variant="outline">F&A Approved</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {canEdit(entry) && (
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {!entry.isFinalized && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => finalizeMutation.mutate({ id: entry.id!, isFinalized: true })}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                {canApprove() && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => faApprovalMutation.mutate({ id: entry.id!, faApproval: !entry.faApproval })}
                                  >
                                    <Target className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteMutation.mutate(entry.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="monthly">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="monthSelect">Select Month:</Label>
                  <Input
                    id="monthSelect"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-48"
                  />
                </div>

                {monthlyLoading ? (
                  <div className="flex justify-center items-center h-64">Loading monthly entries...</div>
                ) : (
                  <div className="space-y-4">
                    {monthlyEntries.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">No entries found for {selectedMonth}.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      monthlyEntries.map((entry: MonthlyMonitoringEntry) => (
                        <Card key={entry.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{entry.kpiDescription}</CardTitle>
                              <div className="flex space-x-2">
                                {entry.isFinalized && <Badge variant="outline">Finalized</Badge>}
                                {entry.faApproval && <Badge variant="outline">F&A Approved</Badge>}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium">Target Value</Label>
                                <p className="text-2xl font-bold">{entry.targetValue}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Achieved Value</Label>
                                <p className="text-2xl font-bold">{entry.achievedValue || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Deviation</Label>
                                <p className={`text-2xl font-bold ${entry.deviation && entry.deviation < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {entry.deviation || '-'}
                                </p>
                              </div>
                            </div>

                            {entry.remarks && (
                              <div className="mb-4">
                                <Label className="text-sm font-medium">Remarks</Label>
                                <p className="text-sm text-muted-foreground">{entry.remarks}</p>
                              </div>
                            )}

                            {entry.faComments && (
                              <div className="mb-4">
                                <Label className="text-sm font-medium">F&A Comments</Label>
                                <p className="text-sm text-muted-foreground">{entry.faComments}</p>
                              </div>
                            )}

                            <div className="flex space-x-2">
                              {canEdit(entry) && (
                                <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              )}
                              {!entry.isFinalized && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => finalizeMutation.mutate({ id: entry.id!, isFinalized: true })}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Finalize
                                </Button>
                              )}
                              {canApprove() && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => faApprovalMutation.mutate({ id: entry.id!, faApproval: !entry.faApproval })}
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  {entry.faApproval ? 'Remove' : 'Give'} F&A Approval
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                {chartData.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Performance Trend Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="target" stroke="#8884d8" name="Target" strokeWidth={2} />
                            <Line type="monotone" dataKey="achieved" stroke="#82ca9d" name="Achieved" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Target vs Achieved Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="target" fill="#8884d8" name="Target" />
                            <Bar dataKey="achieved" fill="#82ca9d" name="Achieved" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No data available for analytics.</p>
                      <p className="text-sm text-muted-foreground mt-2">Add some monitoring entries to see analytics.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}