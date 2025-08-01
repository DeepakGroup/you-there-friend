import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll(),
  });
};

export const useUsersBySite = (site: string) => {
  return useQuery({
    queryKey: ['users', 'site', site],
    queryFn: () => userAPI.getBySite(site),
    enabled: !!site,
  });
};

export const useUsersByRole = (role: string) => {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: () => userAPI.getByRole(role),
    enabled: !!role,
  });
};

export const useUsersBySiteAndRole = (site: string, role: string) => {
  return useQuery({
    queryKey: ['users', 'site', site, 'role', role],
    queryFn: () => userAPI.getBySiteAndRole(site, role),
    enabled: !!site && !!role,
  });
};