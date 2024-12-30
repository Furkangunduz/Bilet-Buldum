import useSWR from 'swr';
import { searchAlertsApi } from '~/lib/api';

export function useSearchAlerts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/search-alerts',
    () => searchAlertsApi.getSearchAlerts().then(res => res.data.data),
    {
      refreshInterval: 60 * 1000, // 1 minutes
    }
  );

  return {
    searchAlerts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
} 