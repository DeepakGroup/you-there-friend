import { useQuery } from '@tanstack/react-query';
import { initiativeAPI } from '@/lib/api';

export const useInitiatives = (filters?: {
  status?: string;
  site?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['initiatives', filters],
    queryFn: () => initiativeAPI.getAll(filters),
  });
};

export const useInitiative = (id: number) => {
  return useQuery({
    queryKey: ['initiative', id],
    queryFn: () => initiativeAPI.getById(id),
    enabled: !!id,
  });
};