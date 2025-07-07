import { Suspense } from 'react'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import Ground from './Ground'
import Player from './Player'
import { CHECKPOINTS } from '../constants/checkpoints'
import { useCheckpoint } from '../stores/useCheckpoints'
import Checkpoint from './CheckPoint'

export default function Scene() {
  const current = useCheckpoint((s) => s.current)

  return (
    <>
      <OrthographicCamera makeDefault position={[10, 10, 20]} />

      <ambientLight intensity={2} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      <Ground />

      {/* repères visuels */}
      {CHECKPOINTS.map(([x, y, z], i) => (
        <Checkpoint
          key={i}
          position={[x, y + 0.05, z]}
          active={i === current}
        />
      ))}

      <Suspense fallback={null}>
        <Player />
      </Suspense>

      <OrbitControls />
    </>
  )
}
