import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineTrackerAPI } from '@/lib/api';
import { toast } from 'sonner';

export const useTimelineEntries = (initiativeId: number) => {
  return useQuery({
    queryKey: ['timeline-entries', initiativeId],
    queryFn: () => timelineTrackerAPI.getTimelineEntries(initiativeId),
    enabled: !!initiativeId,
  });
};

export const useTimelineEntry = (id: number) => {
  return useQuery({
    queryKey: ['timeline-entry', id],
    queryFn: () => timelineTrackerAPI.getTimelineEntryById(id),
    enabled: !!id,
  });
};

export const useCreateTimelineEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ initiativeId, entryData }: { initiativeId: number; entryData: any }) => 
      timelineTrackerAPI.createTimelineEntry(initiativeId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast.success('Timeline entry created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create timeline entry');
    },
  });
};

export const useUpdateTimelineEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, entryData }: { id: number; entryData: any }) => 
      timelineTrackerAPI.updateTimelineEntry(id, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      queryClient.invalidateQueries({ queryKey: ['timeline-entry'] });
      toast.success('Timeline entry updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update timeline entry');
    },
  });
};

export const useUpdateApprovals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, siteLeadApproval, initiativeLeadApproval }: { 
      id: number; 
      siteLeadApproval?: boolean; 
      initiativeLeadApproval?: boolean; 
    }) => timelineTrackerAPI.updateApprovals(id, siteLeadApproval, initiativeLeadApproval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      queryClient.invalidateQueries({ queryKey: ['timeline-entry'] });
      toast.success('Approvals updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update approvals');
    },
  });
};

export const useDeleteTimelineEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => timelineTrackerAPI.deleteTimelineEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-entries'] });
      toast.success('Timeline entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete timeline entry');
    },
  });
};

export const usePendingApprovals = (initiativeId: number) => {
  return useQuery({
    queryKey: ['pending-approvals', initiativeId],
    queryFn: () => timelineTrackerAPI.getPendingApprovals(initiativeId),
    enabled: !!initiativeId,
  });
};