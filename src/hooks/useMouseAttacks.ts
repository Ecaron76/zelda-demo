import { useEffect, useState } from 'react'

export type Attack = 'attack1' | 'attack4' | null

export function useMouseAttacks() {
  const [attack, setAttack] = useState<Attack>(null)

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (attack) return               // ignore si déjà en plein combo
      if (e.button === 0) setAttack('attack1')
      if (e.button === 2) setAttack('attack4')
    }
    window.addEventListener('mousedown', down)
    return () => window.removeEventListener('mousedown', down)
  }, [attack])

  /** Le composant consommateur remet à `null` quand l’anim est finie */
  return [attack, setAttack] as const
}
