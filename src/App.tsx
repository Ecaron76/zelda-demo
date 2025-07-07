import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

export default function App() {
  return (
    /* App.tsx */
<Canvas
  shadows
  gl={{ antialias: true }}
  style={{ width: '100vw', height: '100vh', display: 'block' }}
>
  <Scene />
</Canvas>

  )
}
