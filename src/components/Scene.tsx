import { Suspense } from 'react'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import Ground from './Ground'
import Player from './Player'

export default function Scene() {
  return (
    <>
      {/* Camera ortho par défaut */}
      <OrthographicCamera makeDefault position={[10, 10, 20]} />

      {/* Lumières */}
      <ambientLight intensity={2} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Sol */}
      <Ground />

      {/* Joueur + suspense (chargement glb) */}
      <Suspense fallback={null}>
        <Player />
      </Suspense>

      {/* Contrôles souris (debug) */}
      <OrbitControls />
    </>
  )
}
