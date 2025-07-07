import { useEffect, useState } from 'react'

type Keys =
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  | 'z' | 's' | 'q' | 'd'

const ALL_KEYS: Keys[] = [
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'z', 's', 'q', 'd',
]

export function useKeyboard() {
  const [keys, setKeys] = useState<Record<Keys, boolean>>(
    () => Object.fromEntries(ALL_KEYS.map(k => [k, false])) as Record<Keys, boolean>,
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key in keys) setKeys(k => ({ ...k, [e.key as Keys]: true }))
    }
    const up = (e: KeyboardEvent) => {
      if (e.key in keys) setKeys(k => ({ ...k, [e.key as Keys]: false }))
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [keys])

  return keys
}
