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
    isLoading: true,
    data: null,
    error: null,
    message: null,
    isError: false
  });

  const prevPayloadRef = React.useRef<string>('');
  const payloadRef = React.useRef(payload);
  const cbRef = React.useRef(cb);
  const payloadStr = React.useMemo(() => JSON.stringify(payload ?? null), [payload]);

  React.useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  React.useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  const makeResponse = React.useCallback(() => {
    if (!enabled || !event) return;

    const socket = getSocket();
    if (!socket) return;

    if (type === 'emit') {
      setResp((prev) => ({ ...prev, isLoading: true }));
      socket.emit(event, payloadRef.current, (data: T) => {
        setResp((prev) => ({ ...prev, isLoading: false, data }));
      });
      return;
    }

    const onMessage = (data: T) => {
      cbRef.current?.(data);
    };

    socket.on(event, onMessage);
    return () => {
      socket.off(event, onMessage);
    };
  }, [enabled, event, type]);

  React.useEffect(() => {
    if (!enabled) {
      prevPayloadRef.current = '';
      return;
    }

    if (type === 'on') {
      const cleanup = makeResponse();
      return () => cleanup?.();
    }

    if (payloadStr !== prevPayloadRef.current) {
      prevPayloadRef.current = payloadStr;
      makeResponse();
    }
  }, [enabled, event, makeResponse, payloadStr, type]);

  return { ...resp, refetch: makeResponse };
}



 