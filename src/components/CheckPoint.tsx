import { ThreeElements } from '@react-three/fiber'

type Props = ThreeElements['mesh'] & {
  active?: boolean
}

export default function Checkpoint({ active = false, ...props }: Props) {
  return (
    <mesh {...props} rotation-x={-Math.PI / 2}>
      <cylinderGeometry args={[0.6, 0.6, 0.12, 16]} />
      <meshStandardMaterial
        color={active ? 'lime' : 'yellow'}
        emissive={active ? 'green' : 'orange'}
      />
    </mesh>
  )
}
