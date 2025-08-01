import { useQuery } from '@tanstack/react-query';
import { workflowAPI } from '@/lib/api';

export const useWorkflowStages = (initiativeId: number) => {
  return useQuery({
    queryKey: ['workflow-stages', initiativeId],
    queryFn: () => workflowAPI.getStages(initiativeId),
    enabled: !!initiativeId,
  });
};

export const usePendingApprovals = (userId: number) => {
  return useQuery({
    queryKey: ['pending-approvals', userId],
    queryFn: () => workflowAPI.getPendingApprovals(userId),
    enabled: !!userId,
  });
};