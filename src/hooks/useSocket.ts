import * as React from "react"
import { getSocket } from "@/lib/socket";

export interface UseSocketOptions {
  enabled?: boolean;
}

export function useSocket<T = unknown, P = unknown>(
  type: 'emit' | 'on',
  event: string,
  payload?: P,
  cb?: (data: T) => void,
  options?: UseSocketOptions
) {
  const enabled = options?.enabled ?? true;

  const [resp, setResp] = React.useState<{
    isLoading: boolean;
    data: T | null;
    error: Error | null;
    message: string | null;
    isError: boolean;
  }>({
    isLoading: false,
    data: null,
    error: null,
    message: null,
    isError: false
  });

  // Track previous payload to detect actual changes
  const prevPayloadRef = React.useRef<string>('');
  const payloadStr = React.useMemo(() => JSON.stringify(payload), [payload]);

  const makeResponse = React.useCallback(() => {
    if (!enabled || !event) return;

    const socket = getSocket();
    if (!socket) return;

    if (type === 'emit') {
      setResp((prev) => ({ ...prev, isLoading: true }));
      socket.emit(event, payload, (data: T) => {
        setResp((prev) => ({ ...prev, isLoading: false, data }));
      });
    } else {
      socket.on(event, (data: T) => {
        cb?.(data);
      });
    }
  }, [cb, enabled, event, payload, type]);

  React.useEffect(() => {
    if (!enabled) {
      prevPayloadRef.current = '';
      return;
    }

    // Only trigger if enabled and payload changed or hasn't run yet
    if (payloadStr !== prevPayloadRef.current) {
      prevPayloadRef.current = payloadStr;
      makeResponse();
    }

    if (type === 'on') {
      return () => {
        const socket = getSocket();
        if (socket && event) {
          socket.off(event);
        }
      };
    }
  }, [enabled, payloadStr, makeResponse, type, event]);

  return { ...resp, refetch: makeResponse };
}



 