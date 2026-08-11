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
  }, []);

  React.useEffect(() => {
    makeResponse()
  }, [makeResponse])

  return {...resp, refetch: makeResponse};
};


 