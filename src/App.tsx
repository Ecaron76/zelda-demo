import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import "./index.css";

export default function App() {
  return (
    /* App.tsx */
<Canvas
  shadows
  gl={{ antialias: true }}
  style={{ width: '100%', height: '100%', display: 'block' }}
>
  <Scene />
</Canvas>

  )
}
