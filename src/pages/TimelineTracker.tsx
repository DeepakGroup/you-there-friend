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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInitiatives } from '@/hooks/useInitiatives';

interface User {
  id: string;
  fullName: string;
  role: string;
  site: string;
}

interface TimelineEntry {
  id?: number;
  stageName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  responsiblePerson: string;
  remarks?: string;
  documentPath?: string;
  siteLeadApproval: boolean;
  initiativeLeadApproval: boolean;
}

interface TimelineTrackerProps {
  user: User;
}

export default function TimelineTracker({ user }: TimelineTrackerProps) {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [formData, setFormData] = useState<Partial<TimelineEntry>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 6;

  // Fetch initiatives with fallback mock data
  const { data: initiatives = [], isLoading: initiativesLoading } = useInitiatives();
  
  // Mock data fallback
  const mockInitiatives = [
    {
      id: 1,
      title: "Process Improvement Initiative",
      status: "IN_PROGRESS",
      site: "Mumbai",
      initiativeLead: "John Doe",
      expectedSavings: 150
    },
    {
      id: 2,
      title: "Cost Reduction Program",
      status: "PLANNING",
      site: "Delhi",
      initiativeLead: "Jane Smith",
      expectedSavings: 200
    },
    {
      id: 3,
      title: "Quality Enhancement Project",
      status: "COMPLETED",
      site: "Bangalore",
      initiativeLead: "Mike Johnson",
      expectedSavings: 120
    }
  ];
  
  // Ensure initiatives is always an array
  const safeInitiatives = Array.isArray(initiatives) && initiatives.length > 0 ? initiatives : mockInitiatives;

  // Custom hooks for timeline tracker
  const { data: timelineEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['timeline-entries', selectedInitiativeId],
    queryFn: async () => {
      if (!selectedInitiativeId) return [];
      const response = await fetch(`http://localhost:9090/api/timeline-tracker/${selectedInitiativeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('opex_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!selectedInitiativeId,
  });

  const createMutation = useMutation({
    mutationFn: async (entry: TimelineEntry) => {
      const response = await fetch(`http://localhost:9090/api/timeline-tracker/${selectedInitiativeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('opex_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast({ title: "Success", description: "Timeline entry created successfully" });
      setIsDialogOpen(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, entry }: { id: number; entry: TimelineEntry }) => {
      const response = await fetch(`http://localhost:9090/api/timeline-tracker/entry/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('opex_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast({ title: "Success", description: "Timeline entry updated successfully" });
      setIsDialogOpen(false);
      setEditingEntry(null);
      setFormData({});
    },
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ id, siteLeadApproval, initiativeLeadApproval }: {
      id: number;
      siteLeadApproval?: boolean;
      initiativeLeadApproval?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (siteLeadApproval !== undefined) params.append('siteLeadApproval', siteLeadApproval.toString());
      if (initiativeLeadApproval !== undefined) params.append('initiativeLeadApproval', initiativeLeadApproval.toString());
      
      const response = await fetch(`http://localhost:9090/api/timeline-tracker/entry/${id}/approvals?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('opex_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast({ title: "Success", description: "Approval status updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:9090/api/timeline-tracker/entry/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('opex_token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast({ title: "Success", description: "Timeline entry deleted successfully" });
    },
  });


  // Pagination logic for initiatives
  const paginatedInitiatives = safeInitiatives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(safeInitiatives.length / itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stageName || !formData.plannedStartDate || !formData.plannedEndDate || !formData.responsiblePerson) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const entryData = {
      ...formData,
      siteLeadApproval: false,
      initiativeLeadApproval: false,
    } as TimelineEntry;

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id!, entry: entryData });
    } else {
      createMutation.mutate(entryData);
    }
  };

  const handleEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setIsDialogOpen(true);
  };

  const DatePicker = ({ 
    date, 
    onDateChange, 
    placeholder 
  }: { 
    date?: string; 
    onDateChange: (date: string) => void; 
    placeholder: string; 
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(new Date(date), "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : undefined}
          onSelect={(selectedDate) => selectedDate && onDateChange(selectedDate.toISOString().split('T')[0])}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  if (initiativesLoading) {
    return <div className="flex justify-center items-center h-64">Loading initiatives...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timeline Tracker</h1>
        {selectedInitiativeId && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData({}); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Timeline Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="stageName">Stage/Activity Name *</Label>
                  <Input
                    id="stageName"
                    value={formData.stageName || ''}
                    onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                    placeholder="Enter stage name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Planned Start Date *</Label>
                    <DatePicker
                      date={formData.plannedStartDate}
                      onDateChange={(date) => setFormData({ ...formData, plannedStartDate: date })}
                      placeholder="Select planned start date"
                    />
                  </div>
                  <div>
                    <Label>Planned End Date *</Label>
                    <DatePicker
                      date={formData.plannedEndDate}
                      onDateChange={(date) => setFormData({ ...formData, plannedEndDate: date })}
                      placeholder="Select planned end date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Actual Start Date</Label>
                    <DatePicker
                      date={formData.actualStartDate}
                      onDateChange={(date) => setFormData({ ...formData, actualStartDate: date })}
                      placeholder="Select actual start date"
                    />
                  </div>
                  <div>
                    <Label>Actual End Date</Label>
                    <DatePicker
                      date={formData.actualEndDate}
                      onDateChange={(date) => setFormData({ ...formData, actualEndDate: date })}
                      placeholder="Select actual end date"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsiblePerson">Responsible Person *</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson || ''}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    placeholder="Enter responsible person name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter any remarks or notes"
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
              Timeline for: {safeInitiatives.find(i => i.id === selectedInitiativeId)?.title}
            </h2>
            <Button variant="outline" onClick={() => setSelectedInitiativeId(null)}>
              Back to Initiatives
            </Button>
          </div>

          {entriesLoading ? (
            <div className="flex justify-center items-center h-64">Loading timeline entries...</div>
          ) : (
            <div className="space-y-4">
              {timelineEntries.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No timeline entries found for this initiative.</p>
                    <p className="text-sm text-muted-foreground mt-2">Click "Add Timeline Entry" to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                timelineEntries.map((entry: TimelineEntry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={cn("w-3 h-3 rounded-full", getStatusColor(entry.status))} />
                          <CardTitle className="text-lg">{entry.stageName}</CardTitle>
                          {getStatusIcon(entry.status)}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(entry.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium">Planned Start</Label>
                          <p className="text-sm">{format(new Date(entry.plannedStartDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Planned End</Label>
                          <p className="text-sm">{format(new Date(entry.plannedEndDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Actual Start</Label>
                          <p className="text-sm">
                            {entry.actualStartDate 
                              ? format(new Date(entry.actualStartDate), 'MMM dd, yyyy') 
                              : 'Not started'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Actual End</Label>
                          <p className="text-sm">
                            {entry.actualEndDate 
                              ? format(new Date(entry.actualEndDate), 'MMM dd, yyyy') 
                              : 'Not completed'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium">Responsible Person</Label>
                          <p className="text-sm">{entry.responsiblePerson}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge variant="outline">{entry.status.replace('_', ' ')}</Badge>
                        </div>
                      </div>

                      {entry.remarks && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium">Remarks</Label>
                          <p className="text-sm text-muted-foreground">{entry.remarks}</p>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entry.siteLeadApproval}
                            onChange={(e) => approvalMutation.mutate({
                              id: entry.id!,
                              siteLeadApproval: e.target.checked
                            })}
                            className="rounded"
                          />
                          <Label className="text-sm">Site Lead Approval</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entry.initiativeLeadApproval}
                            onChange={(e) => approvalMutation.mutate({
                              id: entry.id!,
                              initiativeLeadApproval: e.target.checked
                            })}
                            className="rounded"
                          />
                          <Label className="text-sm">Initiative Lead Approval</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}