import * as React from "react"
import { getSocket } from "@/lib/socket";

export function useSocket<T = unknown, P = unknown>(
  type: 'emit' | 'on',
  event: string,
  payload: P,
  cb?: (data: T) => void
) {
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
  })

  // Track previous payload to detect actual changes
  const prevPayloadRef = React.useRef<string>('');
  const payloadStr = React.useMemo(() => JSON.stringify(payload), [payload]);

  const makeResponse = React.useCallback(() => {
    if(type === 'emit') {
        setResp((prev) => ({ ...prev, isLoading: true }))
        const socket = getSocket();
        if (socket) socket.emit(event, payload, (data: T) => {
          setResp((prev) => ({ ...prev, isLoading: false, data }))
        })
      } else {
        const socket = getSocket();
        socket?.on(event, (data: T) => {
          cb?.(data)
        })
      }
  }, [cb, event, payload, type]);

  React.useEffect(() => {
    // Only call makeResponse if payload actually changed
    if (payloadStr !== prevPayloadRef.current) {
      prevPayloadRef.current = payloadStr;
      makeResponse();
    }
  }, [payloadStr, makeResponse])

  return {...resp, refetch: makeResponse};
};


 