import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Player from './Player';
import Ground from './GroundLava';

export function CameraController() {
  const { camera } = useThree()
  const target: [number, number, number] = [30, 2, 0];
  const position: [number, number, number] = [30, 10, 30];


  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(...position), 0.1)
    camera.lookAt(...target)
  })

  return null
}

type WallProps = {
  position: [number, number, number];
  size: [number, number, number];
};

function Wall({ position, size }: WallProps) {
  return (
    <RigidBody type="fixed">
      <mesh position={position as [number, number, number]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#5e5e5e" />
      </mesh>
    </RigidBody>
  )
}

type SpikeProps = {
  position: [number, number, number];
};

function Spike({ position }: SpikeProps) {
  return (
    <RigidBody type="fixed">
      <mesh position={position} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="crimson" />
      </mesh>
    </RigidBody>
  )
}

type PitProps = {
  position: [number, number, number];
  size: [number, number, number];
};

function Pit({ position, size }: PitProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="black" />
    </mesh>
  )
}

type MovingPlatformProps = {
  position: [number, number, number];
};

function MovingPlatform({ position }: MovingPlatformProps) {
  return (
    <RigidBody type="kinematicPosition" position={position}>
      <mesh castShadow>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial color="#8ac" />
      </mesh>
    </RigidBody>
  )
}

type StartPlatformProps = {
  position?: [number, number, number];
};

function StartPlatform({ position = [0, 0, 0] }: StartPlatformProps) {
  return (
    <RigidBody type="fixed">
      <mesh position={position}>
        <boxGeometry args={[6, 0.5, 6]} />
        <meshStandardMaterial color="limegreen" />
      </mesh>
    </RigidBody>
  )
}

export function SlidingWall({ origin = [0, 0, 0], range = 2, speed = 1 }) {
  const ref = useRef<any>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta * speed
    const x = origin[0] + Math.sin(t.current) * range
    ref.current.setNextKinematicTranslation({ x, y: origin[1], z: origin[2] })
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition">
      <mesh>
        <boxGeometry args={[2, 2, 0.5]} />
        <meshStandardMaterial color="#ff8c00" />
      </mesh>
    </RigidBody>
  )
}

type RotatingBarProps = {
  position?: [number, number, number];
  length?: number;
  speed?: number;
};

export function RotatingBar({ position = [0, 1, 0], length = 5, speed = 1 }: RotatingBarProps) {
  const ref = useRef<any>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const angle = t.current;
    if (ref.current) {
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
      ref.current.setNextKinematicRotation(quat);
    }
  });

  return (
    <RigidBody type="kinematicPosition" position={position}>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[length, 0.3, 0.3]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}

export function AnimatedPlatform({ start = [0, 0, 0], range = 5, speed = 1 }) {
  const ref = useRef<any>(null)
  const t = useRef(0)

  useFrame((state, delta) => {
    if (ref.current) {
      t.current += delta * speed
      const y = start[1] + Math.sin(t.current) * range
      ref.current.setNextKinematicTranslation({ x: start[0], y, z: start[2] })
    }
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders="cuboid">
      <mesh castShadow>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial color="deepskyblue" />
      </mesh>
    </RigidBody>
  )
}

export function AnimatedSpike({ position = [0, 0, 0], height = 1, speed = 2 }) {
  const ref = useRef<any>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta * speed
    const y = position[1] + Math.abs(Math.sin(t.current)) * height
    ref.current.setNextKinematicTranslation({ x: position[0], y, z: position[2] })
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders="hull">
      <mesh rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="crimson" />
      </mesh>
    </RigidBody>
  )
}

type EndPlatformProps = {
  position: [number, number, number];
};

type SeesawProps = {
  position?: [number, number, number];
};

function Seesaw({ position = [0, 1, 0] }: SeesawProps) {
  return (
    <RigidBody type="dynamic" mass={1} friction={1}>
      <mesh position={position as [number, number, number]}>
        <boxGeometry args={[6, 0.3, 1]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
    </RigidBody>
  )
}

type BouncyPadProps = {
  position?: [number, number, number];
};

function BouncyPad({ position = [0, 0, 0] }: BouncyPadProps) {
  return (
    <RigidBody type="fixed" restitution={2}>
      <mesh position={position}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="dodgerblue" />
      </mesh>
    </RigidBody>
  )
}

function EndPlatform({ position }: EndPlatformProps) {
  return (
    <RigidBody type="fixed">
      <mesh position={position as [number, number, number]}>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </RigidBody>
  )
}

export default function LevelScene() {
  return (
   <Canvas
      shadows
      camera={{ position: [20, 15, 20], fov: 50 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <OrbitControls />
      <CameraController />
      <Physics gravity={[0, -9.81, 0]}>
        {/* Sol général */}
        <Ground />

        <Suspense fallback={null}>
            <Player />
        </Suspense>

        {/* Murs de la scène */}
        <Wall position={[-50, 2, 0]} size={[1, 5, 100]} />
        <Wall position={[0, 2, -50]} size={[100, 5, 1]} />
        <Wall position={[0, 2, 50]} size={[100, 5, 1]} />

        {/* Départ */}
        <StartPlatform position={[0, 0, 0]} />

        {/* Étape 1 : Montée d'obstacles */}
        <Wall position={[5, 0.5, 0]} size={[2, 1, 2]} />
        <Wall position={[10, 1, 0]} size={[2, 2, 2]} />
        <Wall position={[15, 2, 0]} size={[2, 3, 2]} />

        {/* Étape 2 : Pics animés */}
        <AnimatedSpike position={[20, 0, 0]} />
        <AnimatedSpike position={[22, 0, 0]} />
        <AnimatedSpike position={[24, 0, 0]} />

        {/* Étape 3 : Plateforme qui monte/descend */}
        <AnimatedPlatform start={[30, 0, 0]} range={2} speed={1} />
        <Wall position={[34, 1, 0]} size={[4, 1, 4]} />

        {/* Étape 4 : Plateforme mobile + pics */}
        <AnimatedPlatform start={[40, 2, 0]} range={1.5} speed={1.5} />
        <AnimatedSpike position={[44, 0, 0]} />
        <AnimatedSpike position={[45.5, 0, 0]} />

        {/* Étape 6 : Tapis rebondissant */}
        <BouncyPad position={[56, 0, 0]} />
        <Wall position={[60, 1, 0]} size={[4, 1, 4]} />

        {/* Étape 7 : Bascule instable */}
        <Seesaw position={[66, 2, 0]} />

        {/* Étape 8 : Saut final */}
        <Wall position={[72, 1, 0]} size={[3, 1, 3]} />
        <EndPlatform position={[78, 0.25, 0]} />
      </Physics>
    </Canvas>

  )
}
