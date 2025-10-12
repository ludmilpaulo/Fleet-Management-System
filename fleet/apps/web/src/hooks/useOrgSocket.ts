import { useEffect, useRef } from 'react';
import { baseApi } from '@/lib/baseApi';

export function useOrgSocket(orgId: number | string | null | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const utils = baseApi.util;
  useEffect(() => {
    if (!orgId) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/org/${orgId}/`);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.data?.topic === 'inspection.update') {
          // Invalidate Inspection-related queries
          utils.invalidateTags?.(['Inspection']);
        }
      } catch {}
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [orgId, utils]);
}


