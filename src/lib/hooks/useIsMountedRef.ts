import { useEffect, useRef } from 'react'

export default function useIsMountedRef() {
  const isMountedRef = useRef(null as null | boolean)
  // @ts-ignore
  useEffect(() => {
    isMountedRef.current = true
    return () => (isMountedRef.current = false)
  })
  return isMountedRef
}
