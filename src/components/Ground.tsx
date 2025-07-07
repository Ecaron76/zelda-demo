import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, MeshStandardMaterial } from 'three'
import { useMemo } from 'react'

export default function Ground() {
  const [color, normal, rough, ao] = useLoader(TextureLoader, [
    '/textures/grass/color.jpg',
    '/textures/grass/normal.jpg',
    '/textures/grass/roughness.jpg',
    '/textures/grass/ao.jpg',
  ])

  // répète les textures une seule fois au mount
  useMemo(() => {
    [color, normal, rough, ao].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping
      t.repeat.set(10, 10)
    })
  }, [color, normal, rough, ao])

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[20, 20, 64, 64]} />
      <meshStandardMaterial
        map={color}
        normalMap={normal}
        roughnessMap={rough}
        aoMap={ao}
      />
    </mesh>
  )
}
