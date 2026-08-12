import * as React from "react"
import axios from "axios"
import { getJwtToken } from "@/lib/localStorageHelper"

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const buildRequestKey = (endpoint: string, method: ApiMethod, params: Record<string, unknown>): string => {
  let paramsKey = ''
  try {
    paramsKey = JSON.stringify(params ?? {})
  } catch {
    paramsKey = String(params)
  }
  return `${endpoint}|${method}|${paramsKey}`
}

export function useApiCall<T = unknown>(
  endpoint = '',
  method: ApiMethod = 'GET',
  params: Record<string, unknown> = {}
) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [resp, setResp] = React.useState<T | null>(null)
  const [error, setError] = React.useState<Error | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const serializedParams = React.useMemo(() => JSON.stringify(params ?? {}), [JSON.stringify(params ?? {})])
  const stableParams = React.useMemo(() => {
    try {
      return JSON.parse(serializedParams)
    } catch {
      return params
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams])

  const requestKey = React.useMemo(
    () => buildRequestKey(endpoint, method, stableParams as Record<string, unknown>),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, method, serializedParams]
  )

  const cacheRef = React.useRef<{ key: string; data: T } | null>(null)
  const fetchRef = React.useRef<((force?: boolean) => Promise<T>) | null>(null)

  const fetchData = React.useCallback(
    async (force = false) => {
      if (!force && cacheRef.current?.key === requestKey) {
        return cacheRef.current.data
      }

      setIsLoading(true)
      setError(null)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$|\s+/g, '') ?? ''
        const trimmedEndpoint = endpoint?.toString().trim() || ''
        const url = trimmedEndpoint.startsWith('http')
          ? trimmedEndpoint
          : `${baseUrl}${trimmedEndpoint.startsWith('/') ? '' : '/'}${trimmedEndpoint}`

        const token = getJwtToken()
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await axios.request({
          url,
          method,
          headers,
          params: method === 'GET' ? stableParams : undefined,
          data: method !== 'GET' ? stableParams : undefined,
        })

        cacheRef.current = { key: requestKey, data: response.data }
        setResp(response.data)
        return response.data
      } catch (fetchError) {
        const error = fetchError instanceof Error ? fetchError : new Error(String(fetchError))
        setResp(null)
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, method, requestKey, stableParams]
  )

  React.useEffect(() => {
    fetchRef.current = fetchData
  }, [fetchData])

  React.useEffect(() => {
    if (!endpoint) {
      return
    }

    if (cacheRef.current?.key === requestKey) {
      setResp(cacheRef.current.data)
      return
    }

    if (fetchRef.current) {
      void fetchRef.current().catch(() => {})
    }
  }, [endpoint, requestKey])

  const refetch = React.useCallback(() => {
    cacheRef.current = null
    return fetchRef.current ? fetchRef.current(true) : Promise.reject(new Error('No fetch function'))
  }, [])

  return { isLoading, resp, error, fetchData, refetch }
}
