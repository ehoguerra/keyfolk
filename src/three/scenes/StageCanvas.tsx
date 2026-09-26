"use client";

import { Canvas, useThree, type RootState } from "@react-three/fiber";
import { useLayoutEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from "three";
import type { StageConfig, Vec3 } from "./config";

type Frameloop = "always" | "demand" | "never";

interface StageCanvasProps {
  stage: StageConfig;
  children: ReactNode;
  frameloop?: Frameloop;
  dpr?: number | [number, number];
  preserveDrawingBuffer?: boolean;
  className?: string;
  style?: CSSProperties;
  onCreated?: (state: RootState) => void;
  /** Skip lookAt when OrbitControls manage the camera target. */
  controlled?: boolean;
  eventPrefix?: "offset" | "client" | "page" | "layer" | "screen";
}

function LookAt({ target }: { target: Vec3 }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, target, invalidate]);
  return null;
}

/** Shared renderer setup: transparent, ACES filmic tone mapping, sRGB output, soft shadows. */
export function StageCanvas({
  stage,
  children,
  frameloop = "demand",
  dpr = [1, 1.75],
  preserveDrawingBuffer = false,
  className,
  style,
  onCreated,
  controlled = false,
  eventPrefix,
}: StageCanvasProps) {
  // Stable identity: R3F re-applies camera options (and resets lookAt) when this object changes.
  const camera = useMemo(
    () => ({ fov: stage.fov, position: stage.position, near: 0.1, far: 60 }),
    [stage.fov, stage.position],
  );
  return (
    <Canvas
      className={className}
      style={style}
      frameloop={frameloop}
      dpr={dpr}
      eventPrefix={eventPrefix}
      shadows={{ type: PCFShadowMap }}
      camera={camera}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer, powerPreference: "high-performance" }}
      onCreated={(state) => {
        state.gl.toneMapping = ACESFilmicToneMapping;
        state.gl.toneMappingExposure = 0.92;
        state.gl.outputColorSpace = SRGBColorSpace;
        // Skip program info-log checks (perf, and no driver warnings in the console).
        state.gl.debug.checkShaderErrors = false;
        state.gl.setClearColor(0x000000, 0);
        onCreated?.(state);
      }}
    >
      {controlled ? null : <LookAt target={stage.target} />}
      {children}
    </Canvas>
  );
}
