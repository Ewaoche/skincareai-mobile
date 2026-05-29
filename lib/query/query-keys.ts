export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  analysis: {
    latest: ['analysis', 'latest'] as const,
    history: ['analysis', 'history'] as const,
    detail: (analysisId: string) => ['analysis', 'detail', analysisId] as const,
    routine: (analysisId: string) => ['analysis', 'routine', analysisId] as const,
  },
  subscriptions: {
    current: ['subscriptions', 'current'] as const,
    usage: ['subscriptions', 'usage'] as const,
  },
};
