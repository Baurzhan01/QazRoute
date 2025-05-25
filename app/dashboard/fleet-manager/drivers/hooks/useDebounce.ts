import { useState } from "react"

import { useEffect } from "react"

export function useDebounce<T>(value: T, delay: number = 100): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
  
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
  
    return debouncedValue
  }
  
