'use client';

import { useState, useEffect } from 'react';
import { toggleTelemetryAction, fetchTelemetryStateAction } from '@/actions/admin-actions';
import { Switch } from '@/components/ui/switch'; 

export function AdminTelemetryToggle() {
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTelemetryStateAction().then((res) => {
      if (res.success) setTelemetryEnabled(res.enabled);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (checked: boolean) => {
    // Optimistic Update
    setTelemetryEnabled(checked);
    
    // Server update
    const res = await toggleTelemetryAction(checked);
    
    if (!res.success) {
      setTelemetryEnabled(!checked);
      alert('Failed to update telemetry settings');
    }
  };

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
