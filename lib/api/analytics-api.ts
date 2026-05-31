import { apiClient } from './client';

export type ShadeAnalyticsEventType =
  | 'SHADE_MATCH_STARTED'
  | 'SHADE_CAPTURE_BLOCKED'
  | 'SHADE_CAPTURE_VALIDATION_FAILED';

export async function trackShadeAnalyticsEvent(payload: {
  eventType: ShadeAnalyticsEventType;
  screen?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await apiClient.post('/analytics/shade-events', payload);
}
