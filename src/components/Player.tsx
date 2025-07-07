/* Player.tsx – checkpoints colorés et respawn
 * ------------------------------------------------------------------ */

import { useRef, useState, useEffect } from 'react'
import { Group, Vector3 } from 'three'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

import { useKeyboard } from '../hooks/useKeyboard'
import { useMouseAttacks, Attack } from '../hooks/useMouseAttacks'
import { CHECKPOINTS } from '../constants/checkpoints'
import { useCheckpoint } from '../stores/useCheckpoints'

const SPEED = 8
const JUMP_HEIGHT = 2
const GRAVITY = 12
const FRUSTUM_SIZE = 12
const HALF_W = 30
const HALF_D = 10
const FALL_Y_END = -5
const CP_RADIUS = 2

function dir(keys: ReturnType<typeof useKeyboard>) {
  let dx = 0, dz = 0
  if (keys.z || keys.ArrowUp) dz -= 1
  if (keys.s || keys.ArrowDown) dz += 1
  if (keys.q || keys.ArrowLeft) dx -= 1
  if (keys.d || keys.ArrowRight) dx += 1
  return { dx, dz, moving: dx !== 0 || dz !== 0 }
}

export default function Player() {
  const group = useRef<Group>(null!)
  const { scene, animations } = useGLTF('/character.glb')
  const { actions, mixer } = useAnimations(animations, group)

  /* état global checkpoint */
  const currentCP = useCheckpoint((s) => s.current)
  const setCurrentCP = useCheckpoint((s) => s.setCurrent)

  const keys = useKeyboard()
  const [attack, setAttack] = useMouseAttacks()
  const [jump, setJump] = useState(false)
  const [fall, setFall] = useState(false)

  type Anim = 'idle' | 'run' | 'jump' | 'fall' | Attack
  const [current, setCurrent] = useState<Anim>('idle')

  const jumpMeta = useRef<{ start: number; duration: number } | null>(null)
  const respawnPos = useRef(new Vector3(...CHECKPOINTS[currentCP]))

  /* clips LoopOnce */
  useEffect(() => {
    if (!actions) return
    ;['attack1', 'attack4', 'jump', 'fall'].forEach((n) => {
      const a = actions[n]
      if (a) {
        a.setLoop(THREE.LoopOnce, 1)
        a.clampWhenFinished = true
      }
    })
  }, [actions])

  const fadeTo = (name: keyof typeof actions, d = 0.2) => {
    if (!actions || !actions[name] || current === name) return
    actions[current!]?.fadeOut(d)
    actions[name]!.reset().fadeIn(d).play()
    setCurrent(name as Anim)
  }

  /* input saut */
  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      e.code === 'Space' && !jump && !attack && !fall && setJump(true)
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [jump, attack, fall])

  useEffect(() => {
    if (!jump) return
    const clip = actions['jump']; if (!clip) return
    fadeTo('jump')
    jumpMeta.current = { start: performance.now(), duration: clip.getClip().duration }
    const end = () => { setJump(false); jumpMeta.current = null }
    mixer.addEventListener('finished', end)
    return () => mixer.removeEventListener('finished', end)
  }, [jump, actions, mixer])

  /* attaques */
  useEffect(() => {
    if (!attack) return
    const a = actions[attack]; if (!a) return
    fadeTo(attack)
    const end = () => setAttack(null)
    mixer.addEventListener('finished', end)
    return () => mixer.removeEventListener('finished', end)
  }, [attack, actions, mixer, setAttack])

  /* respawn */
  const respawn = () => {
    group.current.position.copy(respawnPos.current)
    setFall(false)
    fadeTo('idle', 0.1)
  }

  /* boucle frame */
  const { camera, size } = useThree()
  useFrame((_s, delta) => {
    if (!group.current) return

    /* mouvement */
    const { dx, dz, moving } = dir(keys)
    if (!fall && (dx || dz)) {
      const step = SPEED * delta
      group.current.position.x += dx * step
      group.current.position.z += dz * step
      group.current.rotation.y = Math.atan2(dx, dz)
    }

    /* saut */
    if (jumpMeta.current) {
      const { start, duration } = jumpMeta.current
      const t = Math.min((performance.now() - start) / (duration * 1000), 1)
      group.current.position.y = Math.sin(Math.PI * t) * JUMP_HEIGHT
    } else if (!fall) {
      group.current.position.y = 0
    }

    /* checkpoints */
    CHECKPOINTS.forEach((arr, i) => {
      if (i === currentCP) return
      if (group.current.position.distanceTo(new Vector3(...arr)) < CP_RADIUS) {
        setCurrentCP(i)
        respawnPos.current.set(...arr)
      }
    })

    /* détection hors-sol → chute */
    if (
      !fall &&
      (Math.abs(group.current.position.x) > HALF_W ||
        Math.abs(group.current.position.z) > HALF_D)
    ) {
      setFall(true)
      fadeTo('fall')
    }

    /* chute */
    if (fall) {
      group.current.position.y -= GRAVITY * delta
      if (group.current.position.y < FALL_Y_END) respawn()
    }

    /* anim run/idle */
    if (!attack && !jump && !fall) fadeTo(moving ? 'run' : 'idle')

    /* caméra */
    const ortho = camera as THREE.OrthographicCamera
    ortho.position.set(
      group.current.position.x + 10,
      group.current.position.y + 10,
      group.current.position.z + 10,
    )
    ortho.lookAt(group.current.position)
    const aspect = size.width / size.height
    ortho.left = (-FRUSTUM_SIZE * aspect) / 2
    ortho.right = (FRUSTUM_SIZE * aspect) / 2
    ortho.top = FRUSTUM_SIZE / 2
    ortho.bottom = -FRUSTUM_SIZE / 2
    ortho.updateProjectionMatrix()
  })

  return <primitive ref={group} object={scene} scale={1.5} />
}

useGLTF.preload('/character.glb')
