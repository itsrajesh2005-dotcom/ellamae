"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { MathUtils, DoubleSide } from "three"
import { Html } from "@react-three/drei"

// Luxury colors matching Tiffany/Cartier style
const GOLD = "#dfb76c"
const GOLD_BRIGHT = "#dfb76c"
const CHAMPAGNE = "#dfb76c"
const BOX = "#5c1334"
const BOX_DEEP = "#5c1334"

type GiftBoxProps = {
  hovered: boolean
  opened: boolean
}

// A small luxury gift that "emerges" when the box opens
function EmergingGift({
  position,
  color,
  delay,
  opened,
}: {
  position: [number, number, number]
  color: string
  delay: number
  opened: boolean
}) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const target = opened ? 1 : 0
    const cur = ref.current.userData.t ?? 0
    const next = MathUtils.damp(cur, target, 4, dt * (1 - delay * 0.3))
    ref.current.userData.t = next
    ref.current.position.y = position[1] + next * 0.95
    ref.current.scale.setScalar(next)
    ref.current.rotation.y += dt * 0.6
  })
  return (
    <group ref={ref} position={position} scale={0}>
      <mesh>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.07, 0.02, 16, 32]} />
        <meshStandardMaterial color="#dfb76c" roughness={0.25} metalness={0.45} />
      </mesh>
    </group>
  )
}

// Unwinding and falling ribbon segment chain
function UnwindingRibbon({
  initialPosition,
  initialRotation,
  opened,
  color,
  type,
  sideIndex = 0,
}: {
  initialPosition: [number, number, number]
  initialRotation: [number, number, number]
  opened: boolean
  color: string
  type: "side" | "loop-left" | "loop-right" | "tail-left" | "tail-right"
  sideIndex?: number
}) {
  const rootRef = useRef<Group>(null)
  const seg1Ref = useRef<Group>(null)
  const seg2Ref = useRef<Group>(null)
  const seg3Ref = useRef<Group>(null)

  const progressRef = useRef(0)

  useFrame((_, dt) => {
    const target = opened ? 1 : 0
    progressRef.current = MathUtils.damp(progressRef.current, target, 2.5, dt)
    const p = progressRef.current

    if (!rootRef.current || !seg1Ref.current || !seg2Ref.current || !seg3Ref.current) return

    if (type === "side") {
      // 1. Root group: slides outward and falls down below the floor level
      const slideDist = p * 1.6
      const fallDist = p * 2.2

      rootRef.current.position.set(
        initialPosition[0] + (sideIndex === 2 ? slideDist : sideIndex === 3 ? -slideDist : 0),
        initialPosition[1] - fallDist,
        initialPosition[2] + (sideIndex === 0 ? slideDist : sideIndex === 1 ? -slideDist : 0)
      )

      // Joint rotations to simulate curling and laying flat
      seg1Ref.current.rotation.x = p * 1.55 // ~89 degrees
      seg2Ref.current.rotation.x = p * -0.7 // curl back
      seg3Ref.current.rotation.x = p * 0.35 // curl forward
      seg1Ref.current.rotation.y = p * (sideIndex % 2 === 0 ? 0.15 : -0.15)
    } else if (type === "loop-left" || type === "loop-right") {
      const isLeft = type === "loop-left"

      // Path of fall: slides off the lid and drops down below the floor
      const tX = isLeft ? -0.8 - p * 1.8 : 0.8 + p * 1.8
      const tY = 0.82 - p * 2.6
      const tZ = p * 0.6

      rootRef.current.position.set(
        MathUtils.lerp(initialPosition[0], tX, p),
        MathUtils.lerp(initialPosition[1], tY, p),
        MathUtils.lerp(initialPosition[2], tZ, p)
      )

      rootRef.current.rotation.set(
        p * 2.5,
        p * 1.8,
        p * (isLeft ? -3.0 : 3.0)
      )

      if (p < 0.15) {
        // Closed loop shape (horizontal elegant loops like a real satin bow)
        const loopFactor = 1 - (p / 0.15)
        seg1Ref.current.rotation.z = isLeft ? Math.PI * 0.45 * loopFactor : -Math.PI * 0.45 * loopFactor
        seg2Ref.current.rotation.z = isLeft ? -Math.PI * 0.9 * loopFactor : Math.PI * 0.9 * loopFactor
        seg3Ref.current.rotation.z = isLeft ? -Math.PI * 0.8 * loopFactor : Math.PI * 0.8 * loopFactor
      } else {
        // Straightening and waving as it falls
        const fallP = (p - 0.15) / 0.85
        seg1Ref.current.rotation.z = Math.sin(fallP * 8) * 0.25 * (1 - fallP)
        seg2Ref.current.rotation.z = Math.sin(fallP * 12) * 0.2 * (1 - fallP)
        seg3Ref.current.rotation.z = Math.sin(fallP * 10) * 0.15 * (1 - fallP)
      }
    } else if (type === "tail-left" || type === "tail-right") {
      const isLeft = type === "tail-left"

      const tX = isLeft ? -0.6 - p * 1.8 : 0.6 + p * 1.8
      const tY = 0.82 - p * 2.6
      const tZ = 0.2 + p * 0.8

      rootRef.current.position.set(
        MathUtils.lerp(initialPosition[0], tX, p),
        MathUtils.lerp(initialPosition[1], tY, p),
        MathUtils.lerp(initialPosition[2], tZ, p)
      )

      rootRef.current.rotation.set(
        p * 1.5,
        p * -2.2,
        p * (isLeft ? -2.0 : 2.0)
      )

      seg1Ref.current.rotation.x = Math.sin(p * 6) * 0.3 * (1 - p)
      seg2Ref.current.rotation.x = Math.cos(p * 8) * 0.2 * (1 - p)
      seg3Ref.current.rotation.x = Math.sin(p * 10) * 0.15 * (1 - p)
    }

    // Traverse and fade out materials as they fall
    rootRef.current.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        const mat = mesh.material as any
        if (mat) {
          mat.transparent = true
          mat.opacity = MathUtils.clamp(1 - (p - 0.45) / 0.5, 0, 1)
        }
      }
    })
  })

  const width = type === "side" ? 0.28 : 0.20
  const height = type === "side" ? 0.4 : 0.3
  const thickness = type === "side" ? 0.02 : 0.01

  return (
    <group ref={rootRef} position={initialPosition} rotation={initialRotation}>
      <group ref={seg1Ref}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.45} side={DoubleSide} transparent />
        </mesh>

        <group ref={seg2Ref} position={[0, height, 0]}>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, thickness]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.45} side={DoubleSide} transparent />
          </mesh>

          <group ref={seg3Ref} position={[0, height, 0]}>
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[width, height, thickness]} />
              <meshStandardMaterial color={color} roughness={0.25} metalness={0.45} side={DoubleSide} transparent />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

// Group that handles the 4 side ribbons that unwind from the box base
function SideRibbons({ opened }: { opened: boolean }) {
  return (
    <group>
      <UnwindingRibbon type="side" sideIndex={0} opened={opened} color={CHAMPAGNE} initialPosition={[0, -0.6, 0.802]} initialRotation={[0, 0, 0]} />
      <UnwindingRibbon type="side" sideIndex={1} opened={opened} color={CHAMPAGNE} initialPosition={[0, -0.6, -0.802]} initialRotation={[0, Math.PI, 0]} />
      <UnwindingRibbon type="side" sideIndex={2} opened={opened} color={CHAMPAGNE} initialPosition={[0.802, -0.6, 0]} initialRotation={[0, -Math.PI / 2, 0]} />
      <UnwindingRibbon type="side" sideIndex={3} opened={opened} color={CHAMPAGNE} initialPosition={[-0.802, -0.6, 0]} initialRotation={[0, Math.PI / 2, 0]} />
    </group>
  )
}

// Static bow that sits on the lid and moves with it
function LidBow({ color }: { color: string }) {
  return (
    <group position={[0, 0.12, 0]}>
      {/* Center knot */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Left loop */}
      <mesh position={[-0.22, 0.04, 0]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.14, 0.03, 12, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} side={DoubleSide} />
      </mesh>

      {/* Right loop */}
      <mesh position={[0.22, 0.04, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.14, 0.03, 12, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} side={DoubleSide} />
      </mesh>

      {/* Left tail */}
      <mesh position={[-0.28, -0.08, 0.02]} rotation={[0.15, 0, 0.6]}>
        <boxGeometry args={[0.18, 0.04, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} side={DoubleSide} />
      </mesh>

      {/* Right tail */}
      <mesh position={[0.28, -0.08, 0.02]} rotation={[0.15, 0, -0.6]}>
        <boxGeometry args={[0.18, 0.04, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} side={DoubleSide} />
      </mesh>
    </group>
  )
}










export function GiftBox({ hovered, opened }: GiftBoxProps) {
  const group = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const glow = useRef<Group>(null)
  const openProgressRef = useRef(0)



  useFrame((state, dt) => {
    const t = state.clock.elapsedTime

    // Damp open progress smoothly
    const target = opened ? 1 : 0
    openProgressRef.current = MathUtils.damp(openProgressRef.current, target, 2.5, dt)
    const progress = openProgressRef.current

    // 1. Slow levitation and rotation (Stage 1 Idle) + hover scale
    if (group.current) {
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        opened ? 0 : Math.sin(t * 0.2) * 0.25,
        2,
        dt
      )
      const targetScale = opened ? 1.0 : hovered ? 1.22 : 1.0
      group.current.scale.setScalar(MathUtils.damp(group.current.scale.x, targetScale, 4.5, dt))
    }

    // 2. Lid: lifts up above the box and tilts backward
    if (lid.current) {
      // Lift slightly above the box, with a smaller offset
      const targetX = progress * 0.35
      const targetY = 0.62 + progress * 0.75
      const targetZ = progress * 0.2
      // Tilt backward so lid shows top surface
      const tiltX = progress * -0.6
      const tiltZ = progress * -0.15
      const tiltY = progress * 0.1

      lid.current.position.x = MathUtils.damp(lid.current.position.x, targetX, 3.5, dt)
      lid.current.position.y = MathUtils.damp(lid.current.position.y, targetY, 3.5, dt)
      lid.current.position.z = MathUtils.damp(lid.current.position.z, targetZ, 3.5, dt)
      lid.current.rotation.x = MathUtils.damp(lid.current.rotation.x, tiltX, 3.5, dt)
      lid.current.rotation.z = MathUtils.damp(lid.current.rotation.z, tiltZ, 3.5, dt)
      lid.current.rotation.y = MathUtils.damp(lid.current.rotation.y, tiltY, 3.5, dt)
    }



    // 4. Glow: expands and becomes intense on open
    if (glow.current) {
      const targetScale = opened ? 2.2 : hovered ? 1.8 : 1.4
      glow.current.scale.setScalar(MathUtils.damp(glow.current.scale.x, targetScale, 3, dt))
    }


  })

  return (
    <group ref={group} dispose={null}>
      {/* Shared SVG Linear Gold Gradient definition inject */}
      <Html position={[0, 0, 0]} pointerEvents="none">
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <linearGradient id="luxury-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8e5b6" />
              <stop offset="45%" stopColor="#d4af37" />
              <stop offset="75%" stopColor="#aa7c11" />
              <stop offset="100%" stopColor="#f8e5b6" />
            </linearGradient>
          </defs>
        </svg>
      </Html>





      {/* Golden glow halo from box center (removed) */}
      <group ref={glow} position={[0, 0.2, 0]} />

      {/* Emerging gifts inside the opened box — all white, smaller, positioned symmetrically */}
      <EmergingGift position={[-0.25, -0.2, -0.15]} color="#ffffff" delay={0.15} opened={opened} />
      <EmergingGift position={[0.25, -0.2, -0.15]} color="#ffffff" delay={0.45} opened={opened} />
      <EmergingGift position={[0, -0.2, 0.2]} color="#ffffff" delay={0.7} opened={opened} />

      {/* Hollow Box base (5 walls: bottom, left, right, front, back) */}
      {/* Bottom wall */}
      <mesh position={[0, -0.57, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.6]} />
        <meshStandardMaterial color={BOX} roughness={0.35} metalness={0.08} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-0.77, 0, 0]}>
        <boxGeometry args={[0.06, 1.2, 1.6]} />
        <meshStandardMaterial color={BOX} roughness={0.35} metalness={0.08} />
      </mesh>
      {/* Right wall */}
      <mesh position={[0.77, 0, 0]}>
        <boxGeometry args={[0.06, 1.2, 1.6]} />
        <meshStandardMaterial color={BOX} roughness={0.35} metalness={0.08} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 0, 0.77]}>
        <boxGeometry args={[1.48, 1.2, 0.06]} />
        <meshStandardMaterial color={BOX} roughness={0.35} metalness={0.08} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0, -0.77]}>
        <boxGeometry args={[1.48, 1.2, 0.06]} />
        <meshStandardMaterial color={BOX} roughness={0.35} metalness={0.08} />
      </mesh>

      {/* Bottom Cross Ribbon bands (always flat on floor) */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[1.62, 0.02, 0.28]} />
        <meshStandardMaterial color={CHAMPAGNE} roughness={0.25} metalness={0.45} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[0.28, 0.02, 1.62]} />
        <meshStandardMaterial color={CHAMPAGNE} roughness={0.25} metalness={0.45} />
      </mesh>

      {/* Side ribbons that unwind from the box base */}
      <SideRibbons opened={opened} />

      {/* Lid group (flies off dramatically with bow attached) */}
      <group ref={lid} position={[0, 0.62, 0]}>
        <mesh>
          <boxGeometry args={[1.66, 0.22, 1.66]} />
          <meshStandardMaterial color={BOX_DEEP} roughness={0.95} metalness={0.02} />
        </mesh>

        {/* Ribbon bands on lid — positioned only on top and outer sides to keep underside clean */}
        {/* Ribbon 1 (along Z-axis) */}
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[0.40, 0.01, 1.66]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.835]}>
          <boxGeometry args={[0.40, 0.22, 0.01]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.835]}>
          <boxGeometry args={[0.40, 0.22, 0.01]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Ribbon 2 (along X-axis) */}
        <mesh position={[0, 0.116, 0]}>
          <boxGeometry args={[1.66, 0.01, 0.40]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0.835, 0, 0]}>
          <boxGeometry args={[0.01, 0.22, 0.40]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[-0.835, 0, 0]}>
          <boxGeometry args={[0.01, 0.22, 0.40]} />
          <meshStandardMaterial color={CHAMPAGNE} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Bow stays attached to the lid */}
        <LidBow color={GOLD_BRIGHT} />
      </group>
    </group>
  )
}
