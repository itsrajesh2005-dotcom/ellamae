"use client"

import { useMemo, useRef, useState, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Sparkles } from "@react-three/drei"
import type { Points } from "three"
import { GiftBox } from "./gift-box"

/* Soft pink floating "heart" motes that drift upward around the box */
function FloatingMotes({ count = 30 }: { count?: number }) {
  const ref = useRef<Points>(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
      speeds[i] = 0.12 + Math.random() * 0.3
    }
    return { positions, speeds }
  }, [count])

  useFrame((_, dt) => {
    const geo = ref.current?.geometry
    if (!geo) return
    const arr = geo.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt
      if (arr[i * 3 + 1] > 3.2) arr[i * 3 + 1] = -3.2
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f4b8c4" size={0.1} transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function ResponsiveGroup({
  opened,
  setOpened,
  hovered,
  setHovered,
  children,
}: {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  hovered: boolean
  setHovered: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}) {
  const { width } = useThree((state) => state.size)
  const responsiveScale = width < 640 ? 0.45 : width < 1024 ? 0.58 : 0.72

  return (
    <group
      scale={responsiveScale}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        setOpened((v) => !v)
      }}
    >
      {children}
    </group>
  )
}

export function HeroScene({
  opened,
  setOpened,
  hovered,
  setHovered,
}: {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  hovered: boolean
  setHovered: React.Dispatch<React.SetStateAction<boolean>>
}) {

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 5.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      onPointerMissed={() => setHovered(false)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: hovered ? "pointer" : "default",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#faf6f0", 1)
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.75} />
        <Environment preset="studio" />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[0, 2, 5.5]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#f8c8d0" />
        <spotLight position={[0, 8, 4]} angle={0.45} penumbra={1} intensity={1.0} color="#f4d98a" />
        <pointLight position={[0, -1.5, 3]} intensity={0.4} color="#d4af37" />

        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7} floatingRange={[-0.1, 0.18]}>
          <ResponsiveGroup
            opened={opened}
            setOpened={setOpened}
            hovered={hovered}
            setHovered={setHovered}
          >
            <GiftBox hovered={hovered} opened={opened} />
          </ResponsiveGroup>
        </Float>

        <Sparkles
          count={opened ? 90 : 45}
          scale={[6, 5, 6]}
          size={2.8}
          speed={0.3}
          opacity={0.75}
          color="#e8c66a"
        />
        <FloatingMotes count={50} />

        {/* soft realistic ground shadow circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
          <circleGeometry args={[1.5, 64]} />
          <meshBasicMaterial color="#e0cebe" transparent opacity={0.42} />
        </mesh>
      </Suspense>
    </Canvas>
  )
}
