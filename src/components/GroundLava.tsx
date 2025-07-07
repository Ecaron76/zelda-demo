import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, Mesh } from 'three'
import { useMemo, useRef } from 'react'

export default function Ground() {
  const [color, emission, rough] = useLoader(TextureLoader, [
    '/textures/lava/Lava004_2K-JPG_Color.jpg',
    '/textures/lava/Lava004_2K-JPG_Emission.jpg',
    '/textures/lava/Lava004_2K-JPG_Roughness.jpg',
  ])

  useMemo(() => {
    [color, emission, rough].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping
      t.repeat.set(10, 10)
    })
  }, [color, emission, rough])

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        map={color}
        roughnessMap={rough}
        emissiveMap={emission}
        emissive={'orange'}
        emissiveIntensity={2}
      />
    </mesh>
  )
}
