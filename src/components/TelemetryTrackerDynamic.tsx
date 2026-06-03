'use client';

import dynamic from 'next/dynamic';

export const TelemetryTrackerDynamic = dynamic(
  () => import('./TelemetryTracker').then((m) => m.TelemetryTracker),
  { ssr: false }
);
