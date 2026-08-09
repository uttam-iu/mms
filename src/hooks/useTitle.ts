import * as React from "react"
import { useAppState } from "@/context/AppContext"

export function useTitle(title: string) {
  const ctx = useAppState()

  const setTitle = ctx?.setTitle

  React.useEffect(() => {
    if (!setTitle) return

    setTitle(title)
    document.title = `${title} | MMS`

    return () => {
      setTitle('')
      document.title = 'MMS'
    }
  }, [setTitle, title])

  return title
}
