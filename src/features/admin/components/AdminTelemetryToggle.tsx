'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTelemetryAction, fetchTelemetryStateAction } from '@/actions/admin-actions';
import { Switch } from '@/components/ui/switch'; 

export function AdminTelemetryToggle() {
  const queryClient = useQueryClient();
  
  const { data: telemetryEnabled = true, isLoading: loading } = useQuery({
    queryKey: ['admin-telemetry-state'],
    queryFn: async () => {
      const res = await fetchTelemetryStateAction();
      return res.success ? res.enabled : true;
    }
  });

  const { mutate } = useMutation({
    mutationFn: toggleTelemetryAction,
    onMutate: async (newChecked) => {
      await queryClient.cancelQueries({ queryKey: ['admin-telemetry-state'] });
      const previousState = queryClient.getQueryData(['admin-telemetry-state']);
      queryClient.setQueryData(['admin-telemetry-state'], newChecked);
      return { previousState };
    },
    onError: (err, newChecked, context) => {
      queryClient.setQueryData(['admin-telemetry-state'], context?.previousState);
      alert('Failed to update telemetry settings');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-telemetry-state'] });
    }
  });

  const handleToggle = (checked: boolean) => mutate(checked);

  if (loading) return <div className="text-sm text-gray-500">Loading settings...</div>;

  return (
    <div className="flex items-center justify-between p-4 border rounded-md bg-white shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Live Telemetry & Tracking</h3>
        <p className="text-sm text-gray-500">
          Enable/Disable background Telegram event logs (Page Views, Dwell Time).
        </p>
      </div>
      <Switch 
        checked={telemetryEnabled} 
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
