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

function KeyboardDeck() {
  const keyRows = useMemo(() => [
    { count: 14, depth: 0.11, width: 0.20, z: -0.95 },
    { count: 14, depth: 0.13, width: 0.20, z: -0.80 },
    { count: 14, depth: 0.13, width: 0.20, z: -0.64 },
    { count: 14, depth: 0.13, width: 0.20, z: -0.48 },
    { count: 14, depth: 0.13, width: 0.20, z: -0.32 },
  ], []);

  const bottomRowWidths = [0.20, 0.20, 0.24, 1.34, 0.24, 0.20, 0.20];
  const bottomRowZ = -0.16;

  const trayWidth = 3.32;
  const trayDepth = 1.04;
  const spacing = 0.23;

  return (
    <group position={[0, 0.031, 0]}>
      {/* Recessed keyboard tray with subtle AO shadow appearance */}
      <mesh position={[0, -0.005, -0.555]}>
        <RoundedBox args={[trayWidth, 0.01, trayDepth]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#1a1b1d" roughness={0.7} metalness={0.2} />
        </RoundedBox>
      </mesh>

      {/* Stylized chiclet key rows */}
      {keyRows.map((row, rIdx) => {
        const startX = -((row.count - 1) * spacing) / 2;
        return (
          <group key={rIdx} position={[0, 0.003, row.z]}>
            {Array.from({ length: row.count }).map((_, kIdx) => (
              <RoundedBox key={kIdx} args={[row.width, 0.012, row.depth]} radius={0.015} smoothness={2} position={[startX + kIdx * spacing, 0, 0]}>
                <meshStandardMaterial color="#26282b" roughness={0.65} metalness={0.15} />
              </RoundedBox>
            ))}
          </group>
        );
      })}

      {/* Bottom symmetrical row */}
      <group position={[0, 0.003, bottomRowZ]}>
        {bottomRowWidths.map((width, i) => {
          // Calculate X position so the row is centered and perfectly spaced
          const prevWidths = bottomRowWidths.slice(0, i).reduce((a, b) => a + b, 0);
          const totalWidth = bottomRowWidths.reduce((a, b) => a + b, 0) + (bottomRowWidths.length - 1) * (spacing - 0.20);
          const startX = -(totalWidth / 2) + (width / 2);
          const currentX = startX + prevWidths + i * (spacing - 0.20);
          return (
            <RoundedBox key={i} args={[width, 0.012, 0.14]} radius={0.015} smoothness={2} position={[currentX, 0, 0]}>
              <meshStandardMaterial color="#26282b" roughness={0.65} metalness={0.15} />
            </RoundedBox>
          );
        })}
      </group>
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
    <group ref={rootRef} scale={responsiveScale} rotation={[baseRotX, baseRotY, 0]}>
      {/* ================= LOWER BASE / DECK ================= */}
      <group position={[0, 0, 0]}>
        {/* Main Light Silver Aluminum Chassis (Thinner, precision machined) */}
        <RoundedBox args={[4.8, 0.06, 3.2]} radius={0.015} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#e3e4e5" roughness={0.4} metalness={0.4} />
        </RoundedBox>

        {/* Keyboard Deck & Recess */}
        <KeyboardDeck />

        {/* Trackpad with Hairline Accent */}
        <group position={[0, 0.03, 0.65]}>
          {/* Subtle Trackpad Well Border */}
          <RoundedBox args={[1.82, 0.004, 1.12]} radius={0.02} smoothness={2} position={[0, -0.001, 0]}>
            <meshStandardMaterial color="#c6c9ce" roughness={0.4} metalness={0.4} />
          </RoundedBox>
          {/* Glass-feel Trackpad Surface */}
          <RoundedBox args={[1.8, 0.004, 1.1]} radius={0.02} smoothness={2} position={[0, 0.001, 0]}>
            <meshStandardMaterial color="#d1d4d8" roughness={0.25} metalness={0.3} />
          </RoundedBox>
        </group>

        {/* Thumb Scoop Notch on Front Lip */}
        <mesh position={[0, 0.015, 1.58]}>
          <boxGeometry args={[0.7, 0.02, 0.05]} />
          <meshStandardMaterial color="#7a7f85" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Thin Front Chamfer Highlight Strip */}
        <mesh position={[0, 0.025, 1.595]}>
          <boxGeometry args={[4.76, 0.005, 0.005]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* ================= HINGE ================= */}
      <group position={[0, 0.035, -1.55]}>
        {/* Sleek, Single Integrated Hinge Barrel */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 2.8, 32]} />
          <meshStandardMaterial color="#3a3c40" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* ================= SCREEN LID ================= */}
      {/* Pivot at hinge: tilted open at ~104 degrees (rotation around X) */}
      <group position={[0, 0.035, -1.55]} rotation={[-0.22, 0, 0]}>
        {/* Outer Back Light Aluminum Cover (Thinner, refined edges) */}
        <RoundedBox args={[4.76, 3.06, 0.03]} radius={0.015} smoothness={4} position={[0, 1.53, -0.015]}>
          <meshStandardMaterial color="#e3e4e5" roughness={0.4} metalness={0.4} />
        </RoundedBox>

        {/* Inner Dark Screen Bezel Assembly */}
        <RoundedBox args={[4.7, 3.0, 0.01]} radius={0.01} smoothness={3} position={[0, 1.53, 0.005]}>
          <meshStandardMaterial color="#090a0c" roughness={0.38} metalness={0.25} />
        </RoundedBox>

        {/* Camera Dot */}
        <mesh position={[0, 2.95, 0.011]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#030408" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Active Screen Surface & HTML Overlay */}
        <group position={[0, 1.50, 0.011]}>
          {/* Dark display background behind HTML overlay */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[4.6, 2.9]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Real SkillBridge Dashboard with Live Scrolling Feed */}
          <Html
            transform
            distanceFactor={3.38}
            position={[0, 0, 0.001]}
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

          {/* Subtle Screen Glass Reflection Layer */}
          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[4.6, 2.9]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} transparent opacity={0.06} depthWrite={false} />
          </mesh>
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
        {/* Professional Studio Product Lighting */}
        <ambientLight intensity={0.5} color="#ffffff" />
        {/* Soft Key Light from upper-left/front */}
        <directionalLight position={[-8, 10, 8]} intensity={1.8} color="#ffffff" />
        {/* Gentle Fill from lower-right */}
        <directionalLight position={[8, 4, 4]} intensity={0.7} color="#f0f4f8" />
        {/* Subtle Rim/Edge Highlight from back-top */}
        <directionalLight position={[0, 10, -10]} intensity={1.2} color="#ffffff" />
        {/* Under-light to soften harsh bottom shadows */}
        <directionalLight position={[0, -5, 5]} intensity={0.4} color="#ffffff" />

        {/* Static composition offset; the model's existing motion remains unchanged. */}
        <group position={[0, -0.85, 0]}>
          <LaptopModel pointerX={pointerX} pointerY={pointerY} reduced={reduced} />

          {/* Contact Shadow Under Base */}
          <ContactShadows
            position={[0, -0.26, 0]}
            opacity={0.45}
            scale={9.0}
            blur={2.5}
            far={4.0}
            color="#08090a"
          />
        </group>
      </Canvas>
    </div>
  );
}
