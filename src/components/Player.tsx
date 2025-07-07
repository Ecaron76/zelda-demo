/* -------------------------------------------------------------------------
 * Player.tsx – Link + déplacements + attaques “une seule fois”
 * ---------------------------------------------------------------------- */

import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

import { useKeyboard } from '../hooks/useKeyboard'
import { useMouseAttacks, Attack } from '../hooks/useMouseAttacks'

/* --- Constantes ------------------------------------------------------------------ */
const SPEED = 0.05
const FRUSTUM_SIZE = 12      // même valeur que dans le projet vanilla

/* --- Déplacements clavier  ------------------------------------------------------- */
function dirFromKeys(keys: ReturnType<typeof useKeyboard>) {
  let dx = 0, dz = 0
  if (keys.z || keys.ArrowUp)    dz -= 1
  if (keys.s || keys.ArrowDown)  dz += 1
  if (keys.q || keys.ArrowLeft)  dx -= 1
  if (keys.d || keys.ArrowRight) dx += 1
  return { dx, dz, moving: dx !== 0 || dz !== 0 }
}

/* ================================================================================
 *  Composant principal
 * ============================================================================ */
export default function Player() {
  /* ---------- Chargement du modèle GLTF & animations ---------- */
  const group = useRef<Group>(null!)
  const { scene, animations } = useGLTF('/character.glb')
  const { actions, mixer } = useAnimations(animations, group)

  /* ---------- État d’input / animation actuelle ---------- */
  const keys                       = useKeyboard()
  const [attack, setAttack]        = useMouseAttacks()     // clic souris
  const [current, setCurrent]      = useState<'idle' | 'run' | Attack>('idle')

  /* ---------- Prépare toutes les animations d’attaque une fois au mount ---------- */
  useEffect(() => {
    if (!actions) return
    ;['attack1', 'attack4'].forEach(name => {
      const a = actions[name]
      if (a) {
        a.clampWhenFinished = true
        a.setLoop(THREE.LoopOnce, 1)       // ✅ joue exactement 1 fois
      }
    })
  }, [actions])

  /* ---------- Fonction utilitaire pour fondre entre deux actions ---------- */
  const fadeTo = (name: keyof typeof actions, duration = 0.2) => {
    if (!actions || !actions[name] || current === name) return
    actions[current!]?.fadeOut(duration)
    actions[name]!.reset().fadeIn(duration).play()
    setCurrent(name as any)
  }

  /* ---------- Déclenche l’attaque (et son retour à l’idle) ---------- */
  useEffect(() => {
    if (!attack) return                                   // aucune attaque à jouer
    const action = actions[attack]
    if (!action) return

    fadeTo(attack)                                        // joue l’attaque

    const onFinished = () => {
      setAttack(null)                                     // réarme le hook
      fadeTo('idle')                                      // retourne à l'idle
      mixer.removeEventListener('finished', onFinished)   // nettoie
    }

    mixer.addEventListener('finished', onFinished)

    // Nettoyage si le composant démonte ou si une autre attaque remplace
    return () => mixer.removeEventListener('finished', onFinished)
  }, [attack, actions, mixer])

  /* ---------- Boucle frame-par-frame ---------- */
  const { camera, size } = useThree()

  useFrame(() => {
    if (!group.current) return

    /* -- Déplacement joueur -- */
    const { dx, dz, moving } = dirFromKeys(keys)
    if (dx || dz) {
      group.current.position.x += dx * SPEED
      group.current.position.z += dz * SPEED
      group.current.rotation.y = Math.atan2(dx, dz)
    }

    /* -- Animations hors attaque -- */
    if (!attack) {
      fadeTo(moving ? 'run' : 'idle')
    }

    /* -- Caméra ortho qui suit le joueur -- */
    const ortho = camera as THREE.OrthographicCamera
    ortho.position.set(
      group.current.position.x + 10,
      group.current.position.y + 10,
      group.current.position.z + 10,
    )
    ortho.lookAt(group.current.position)

    /* -- Ajuste le frustum quand la fenêtre change -- */
    const aspect = size.width / size.height
    ortho.left   = -FRUSTUM_SIZE * aspect / 2
    ortho.right  =  FRUSTUM_SIZE * aspect / 2
    ortho.top    =  FRUSTUM_SIZE / 2
    ortho.bottom = -FRUSTUM_SIZE / 2
    ortho.updateProjectionMatrix()
  })

  /* ---------- Affiche le modèle dans la scène ---------- */
  return <primitive object={scene} ref={group} scale={1.5} />
}

/* Précharge le GLB pour éviter le “pop-in” */
useGLTF.preload('/character.glb')
