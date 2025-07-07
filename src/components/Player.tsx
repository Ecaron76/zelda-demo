/* Player.tsx
 * — Vitesse horizontale exprimée en unités / seconde
 * — Le saut (élévation Y) n’affecte plus la distance parcourue en X-Z
 * -------------------------------------------------------------------- */

import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

import { useKeyboard } from '../hooks/useKeyboard'
import { useMouseAttacks, Attack } from '../hooks/useMouseAttacks'

/* Réglages ------------------------------------------------------------ */
const SPEED        = 8      // unités **par seconde** (≈ mètres/s)
const JUMP_HEIGHT  = 2      // ↕ hauteur du saut
const FRUSTUM_SIZE = 12

/* Calcule la direction voulue --------------------------------------- */
function dirFromKeys(keys: ReturnType<typeof useKeyboard>) {
  let dx = 0, dz = 0
  if (keys.z || keys.ArrowUp)    dz -= 1
  if (keys.s || keys.ArrowDown)  dz += 1
  if (keys.q || keys.ArrowLeft)  dx -= 1
  if (keys.d || keys.ArrowRight) dx += 1
  return { dx, dz, moving: dx !== 0 || dz !== 0 }
}

/* ------------------------------------------------------------------- */
export default function Player() {
  /* 👉 refs & chargement model */
  const group = useRef<Group>(null!)
  const { scene, animations } = useGLTF('/character.glb')
  const { actions, mixer }    = useAnimations(animations, group)

  /* 👉 states */
  const keys                = useKeyboard()
  const [attack, setAttack] = useMouseAttacks()
  const [jump,   setJump]   = useState(false)
  type Anim = 'idle' | 'run' | 'jump' | Attack
  const [current, setCurrent] = useState<Anim>('idle')
  const jumpMeta = useRef<{ start: number; duration: number } | null>(null)

  /* Prépare les clips “once” ---------------------------------------- */
  useEffect(() => {
    if (!actions) return
    ;['attack1', 'attack4', 'jump'].forEach(name => {
      const a = actions[name]
      if (a) {
        a.setLoop(THREE.LoopOnce, 1)
        a.clampWhenFinished = true
      }
    })
  }, [actions])

  /* Fondu helper ----------------------------------------------------- */
  const fadeTo = (name: keyof typeof actions, d = 0.2) => {
    if (!actions || !actions[name] || current === name) return
    actions[current!]?.fadeOut(d)
    actions[name]!.reset().fadeIn(d).play()
    setCurrent(name as Anim)
  }

  /* Saut : déclenche avec barre espace ------------------------------ */
  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      e.code === 'Space' && !jump && !attack && setJump(true)
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [jump, attack])

  useEffect(() => {
    if (!jump) return
    const clip = actions['jump']; if (!clip) return

    fadeTo('jump')
    const duration = clip.getClip().duration           // secondes
    jumpMeta.current = { start: performance.now(), duration }

    const end = () => { setJump(false); jumpMeta.current = null }
    mixer.addEventListener('finished', end)
    return () => mixer.removeEventListener('finished', end)
  }, [jump, actions, mixer])

  /* Attaques --------------------------------------------------------- */
  useEffect(() => {
    if (!attack) return
    const a = actions[attack]; if (!a) return
    fadeTo(attack)
    const end = () => setAttack(null)
    mixer.addEventListener('finished', end)
    return () => mixer.removeEventListener('finished', end)
  }, [attack, actions, mixer, setAttack])

  /* Boucle frame ----------------------------------------------------- */
  const { camera, size } = useThree()

  useFrame((_state, delta) => {
    if (!group.current) return

    /* 1. Mouvement XZ — delta fait que SPEED est en u/s */
    const { dx, dz, moving } = dirFromKeys(keys)
    if (dx || dz) {
      const step = SPEED * delta          // distance cette frame
      group.current.position.x += dx * step
      group.current.position.z += dz * step
      group.current.rotation.y = Math.atan2(dx, dz)
    }

    /* 2. Parabole verticale du saut */
    if (jumpMeta.current) {
      const { start, duration } = jumpMeta.current
      const t = Math.min((performance.now() - start) / (duration * 1000), 1)
      group.current.position.y = Math.sin(Math.PI * t) * JUMP_HEIGHT
    } else {
      group.current.position.y = 0
    }

    /* 3. Animation de base */
    if (!attack && !jump) fadeTo(moving ? 'run' : 'idle')

    /* 4. Caméra ortho suiveuse */
    const ortho = camera as THREE.OrthographicCamera
    ortho.position.set(
      group.current.position.x + 10,
      group.current.position.y + 10,
      group.current.position.z + 10,
    )
    ortho.lookAt(group.current.position)

    const aspect = size.width / size.height
    ortho.left   = -FRUSTUM_SIZE * aspect / 2
    ortho.right  =  FRUSTUM_SIZE * aspect / 2
    ortho.top    =  FRUSTUM_SIZE / 2
    ortho.bottom = -FRUSTUM_SIZE / 2
    ortho.updateProjectionMatrix()
  })

  return <primitive ref={group} object={scene} scale={1.5} />
}

useGLTF.preload('/character.glb')
