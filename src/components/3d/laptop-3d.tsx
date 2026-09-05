"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, ContactShadows, Html } from "@react-three/drei";
import { DashboardContent } from "../sections/dashboard-content";

interface Laptop3DProps {
  pointerX?: number;
  pointerY?: number;
  reduced?: boolean;
}

// Low-poly keyboard rows for authentic deck impression without excessive geometry
function KeyboardDeck() {
  const keyRows = useMemo(() => [
    { count: 14, depth: 0.12, width: 0.24, z: -1.14 },
    { count: 14, depth: 0.18, width: 0.24, z: -0.92 },
    { count: 14, depth: 0.18, width: 0.24, z: -0.68 },
    { count: 14, depth: 0.18, width: 0.24, z: -0.44 },
    { count: 14, depth: 0.18, width: 0.24, z: -0.20 },
    { count: 7, depth: 0.20, width: 0.44, z: 0.04, isBottom: true },
  ], []);

  return (
    <group position={[0, 0.06, 0]}>
      {/* Recessed keyboard tray */}
      <mesh position={[0, -0.005, -0.54]}>
        <boxGeometry args={[4.1, 0.015, 1.55]} />
        <meshStandardMaterial color="#141619" roughness={0.75} metalness={0.2} />
      </mesh>

      {/* Stylized chiclet key rows */}
      {keyRows.map((row, rIdx) => {
        if (row.isBottom) {
          return (
            <group key={rIdx} position={[0, 0.005, row.z]}>
              <mesh position={[-1.6, 0, 0]}>
                <boxGeometry args={[0.38, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
              <mesh position={[-1.15, 0, 0]}>
                <boxGeometry args={[0.38, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
              {/* Spacebar */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.7, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
              <mesh position={[1.15, 0, 0]}>
                <boxGeometry args={[0.38, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
              <mesh position={[1.6, 0, 0]}>
                <boxGeometry args={[0.38, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
            </group>
          );
        }

        const spacing = 0.28;
        const startX = -((row.count - 1) * spacing) / 2;

        return (
          <group key={rIdx} position={[0, 0.005, row.z]}>
            {Array.from({ length: row.count }).map((_, kIdx) => (
              <mesh key={kIdx} position={[startX + kIdx * spacing, 0, 0]}>
                <boxGeometry args={[row.width, 0.015, row.depth]} />
                <meshStandardMaterial color="#1e2025" roughness={0.48} metalness={0.22} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function LaptopModel({ pointerX = 0, pointerY = 0, reduced = false }: Laptop3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Responsive scale to guarantee clean sizing across desktop, tablet, and mobile
  const responsiveScale = useMemo(() => {
    if (viewport.width < 5.8) {
      return Math.max(0.72, viewport.width / 5.2);
    }
    return 1.44;
  }, [viewport.width]);

  // Front-facing tilted perspective: rotateY = 0, rotateX = 0.16 rad (so keyboard deck is visible)
  const baseRotX = 0.16;
  const baseRotY = 0;

  // Smooth breathing and pointer parallax motion
  useFrame((state) => {
    if (!rootRef.current) return;
    if (reduced) {
      rootRef.current.rotation.x = baseRotX;
      rootRef.current.rotation.y = baseRotY;
      rootRef.current.position.y = 0;
      return;
    }

    const t = state.clock.getElapsedTime();
    const idleY = Math.sin(t * 0.7) * 0.012;
    const idleX = Math.cos(t * 0.5) * 0.007;
    const idleFloat = Math.sin(t * 0.9) * 0.022;

    const targetRotX = baseRotX + pointerY * 0.035 + idleX;
    const targetRotY = baseRotY + pointerX * 0.05 + idleY;

    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetRotX, 0.05);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotY, 0.05);
    rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, idleFloat, 0.05);
  });

  return (
    <group ref={rootRef} scale={responsiveScale} position={[0, -0.2, 0]} rotation={[baseRotX, baseRotY, 0]}>
      {/* ================= LOWER BASE / DECK ================= */}
      <group position={[0, 0, 0]}>
        {/* Main Light Silver Aluminum Chassis */}
        <RoundedBox args={[4.8, 0.11, 3.2]} radius={0.06} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#eef0f3" roughness={0.34} metalness={0.48} />
        </RoundedBox>

        {/* Keyboard Deck & Recess */}
        <KeyboardDeck />

        {/* Trackpad with Hairline Accent */}
        <group position={[0, 0.058, 0.86]}>
          {/* Subtle Trackpad Well Border */}
          <mesh position={[0, -0.002, 0]}>
            <boxGeometry args={[1.68, 0.006, 1.08]} />
            <meshStandardMaterial color="#cbd0d8" roughness={0.35} metalness={0.45} />
          </mesh>
          {/* Glass-feel Trackpad Surface */}
          <mesh position={[0, 0.001, 0]}>
            <boxGeometry args={[1.65, 0.008, 1.05]} />
            <meshStandardMaterial color="#e2e5ea" roughness={0.32} metalness={0.38} />
          </mesh>
        </group>

        {/* Thumb Scoop Notch on Front Lip */}
        <mesh position={[0, 0.038, 1.58]}>
          <boxGeometry args={[0.7, 0.035, 0.06]} />
          <meshStandardMaterial color="#5f6368" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Thin Front Chamfer Highlight Strip */}
        <mesh position={[0, 0.05, 1.595]}>
          <boxGeometry args={[4.6, 0.01, 0.01]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* ================= HINGE ================= */}
      <group position={[0, 0.065, -1.55]}>
        {/* Central Cylindrical Hinge Barrel */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 1.8, 24]} />
          <meshStandardMaterial color="#16181b" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Outer Hinge Spacers */}
        <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#d8dce2" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#d8dce2" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* ================= SCREEN LID ================= */}
      {/* Pivot at hinge: tilted open at ~104 degrees (rotation around X) */}
      <group position={[0, 0.065, -1.55]} rotation={[-0.22, 0, 0]}>
        {/* Outer Back Light Aluminum Cover */}
        <RoundedBox args={[4.8, 3.12, 0.07]} radius={0.06} smoothness={4} position={[0, 1.56, -0.01]}>
          <meshStandardMaterial color="#eef0f3" roughness={0.34} metalness={0.48} />
        </RoundedBox>

        {/* Inner Dark Screen Bezel Assembly */}
        <RoundedBox args={[4.7, 3.02, 0.015]} radius={0.04} smoothness={3} position={[0, 1.56, 0.028]}>
          <meshStandardMaterial color="#090a0c" roughness={0.38} metalness={0.25} />
        </RoundedBox>

        {/* Camera Dot */}
        <mesh position={[0, 3.0, 0.038]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#030408" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Active Screen Surface & HTML Overlay */}
        <group position={[0, 1.53, 0.038]}>
          {/* Dark display background behind HTML overlay */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[4.48, 2.8]} />
            <meshBasicMaterial color="#0a0b0e" />
          </mesh>

          {/* Real SkillBridge Dashboard with Live Scrolling Feed */}
          <Html
            transform
            distanceFactor={3.38}
            position={[0, 0, 0.004]}
            occlude={false}
            className="select-none"
            style={{
              width: 530,
              height: 332,
              pointerEvents: "auto",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="h-[332px] w-[530px] overflow-hidden rounded-[4px] bg-white shadow-inner">
              <DashboardContent reduced={reduced} />
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

export function Laptop3D({ pointerX = 0, pointerY = 0, reduced = false }: Laptop3DProps) {
  return (
    <div className="relative h-[370px] sm:h-[420px] lg:h-[480px] w-full select-none">
      <Canvas
        camera={{ position: [0, 0.7, 5.6], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        {/* Soft Studio Lighting */}
        <ambientLight intensity={1.05} color="#ffffff" />
        <directionalLight position={[6, 9, 6]} intensity={1.7} color="#ffffff" />
        <directionalLight position={[-6, 5, 4]} intensity={0.85} color="#e8f2ff" />
        <directionalLight position={[0, 8, -1]} intensity={0.7} color="#ffffff" />
        <directionalLight position={[0, -1, 5]} intensity={0.4} color="#ffffff" />

        {/* 3D Laptop Model */}
        <LaptopModel pointerX={pointerX} pointerY={pointerY} reduced={reduced} />

        {/* Contact Shadow Under Base */}
        <ContactShadows
          position={[0, -0.26, 0]}
          opacity={0.45}
          scale={10.0}
          blur={2.8}
          far={3.5}
          color="#0c0e12"
        />
      </Canvas>
    </div>
  );
}
