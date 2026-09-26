"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

interface StudioProps {
  /** Half-size of the shadow camera frustum (world units). */
  shadowSize?: number;
  contactShadow?: { scale: number; opacity?: number; blur?: number; far?: number; y?: number };
  keyLight?: number;
}

/**
 * Product-photography lighting built only from Lightformers (no HDR downloads):
 * a big overhead softbox, two strip lights that draw highlights along metal edges,
 * a warm front fill and a cool rim, plus one soft shadow-casting key.
 */
export function Studio({ shadowSize = 2.4, contactShadow, keyLight = 2.4 }: StudioProps) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#3b3f45"]} />
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={3.2} scale={[9, 5, 1]} position={[0, 7, 1.2]} />
        {/* strip lights, left & right: draw highlights along the case bevels */}
        <Lightformer form="rect" intensity={2.2} scale={[0.7, 6, 1]} position={[-6, 4, 2.5]} />
        <Lightformer form="rect" intensity={1.8} scale={[0.7, 6, 1]} position={[6, 4, 1.5]} />
        {/* warm front fill, low */}
        <Lightformer form="rect" intensity={0.55} color="#fff1e0" scale={[14, 2.5, 1]} position={[0, 2, 8]} />
        {/* cool rim from behind */}
        <Lightformer form="rect" intensity={2.2} color="#eef6ff" scale={[14, 1.2, 1]} position={[0, 3.5, -7]} />
        {/* soft ground bounce */}
        <Lightformer form="rect" intensity={0.28} color="#f3eee6" scale={[24, 24, 1]} position={[0, -3, 0]} />
      </Environment>
      <directionalLight
        position={[-2.2, 6, 3.2]}
        intensity={keyLight}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
        shadow-normalBias={0.012}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-shadowSize, shadowSize, shadowSize, -shadowSize, 0.5, 16]} />
      </directionalLight>
      {contactShadow ? (
        <ContactShadows
          position={[0, contactShadow.y ?? 0, 0]}
          scale={contactShadow.scale}
          opacity={contactShadow.opacity ?? 0.5}
          blur={contactShadow.blur ?? 2.6}
          far={contactShadow.far ?? 1.4}
          resolution={1024}
          frames={1}
          color="#1b1a22"
        />
      ) : null}
    </>
  );
}
