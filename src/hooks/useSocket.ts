/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { getSocket } from "@/lib/socket";

export function useSocket(type: 'emit' | 'on', event: string, payload: any, cb?: (...args: any[]) => void) {
  const [resp, setResp] = React.useState<{
    isLoading: boolean;
    data: any;
    error: any;
    message: any;
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
  const payloadStr = JSON.stringify(payload);

  const makeResponse = React.useCallback(() => {
    if(type === 'emit') {
        setResp((prev) => ({ ...prev, isLoading: true }))
        const socket = getSocket();
        if (socket) socket.emit(event, payload, (data: any) => {
          setResp((prev) => ({ ...prev, isLoading: false, data }))
        })
      } else {
        const socket = getSocket();
        socket?.on(event, (data: any) => {
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


 