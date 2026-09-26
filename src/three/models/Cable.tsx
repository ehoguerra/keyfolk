"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  RepeatWrapping,
  TubeGeometry,
  Vector3,
} from "three";
import type { ModelSpec } from "@/data/products";
import { knurledCylinder, lathe, taperedRoundedBox } from "../lib/shapes";

type CableSpec = Extract<ModelSpec, { kind: "cable" }>;

const WIRE_R = 2.1;
const COIL_R = 8.5;

interface CablePath {
  curve: CatmullRomCurve3;
  length: number;
  aviator: { at: Vector3; dir: Vector3 };
  plugA: { at: Vector3; dir: Vector3 };
  plugB: { at: Vector3; dir: Vector3 };
}

/** Centerline (mm): lead-in → coil lying on the desk → aviator coupling → keyboard plug. */
function buildPath(): CablePath {
  const y = WIRE_R;
  const pts: Vector3[] = [];
  const plugAStart = new Vector3(-205, y, 150);
  // lead-in, gentle curve toward the coil start
  const lead = new CatmullRomCurve3([
    plugAStart,
    new Vector3(-190, y, 105),
    new Vector3(-170, y, 62),
    new Vector3(-150, y, 36),
  ]);
  for (let i = 0; i < 24; i++) pts.push(lead.getPoint(i / 24));

  // coil: helix along a horizontal axis, starting and ending at its lowest point
  const a0 = new Vector3(-150, COIL_R + WIRE_R, 30);
  const a1 = new Vector3(20, COIL_R + WIRE_R, -8);
  const axis = a1.clone().sub(a0);
  const axisDir = axis.clone().normalize();
  const up = new Vector3(0, 1, 0);
  const side = new Vector3().crossVectors(axisDir, up).normalize();
  const turns = 30;
  const steps = turns * 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = -Math.PI / 2 + t * turns * Math.PI * 2;
    const c = a0.clone().addScaledVector(axis, t);
    c.addScaledVector(up, Math.sin(ang) * COIL_R).addScaledVector(side, Math.cos(ang) * COIL_R);
    pts.push(c);
  }

  // lead-out to the aviator connector
  const out = new CatmullRomCurve3([
    new Vector3(27, y, -9),
    new Vector3(60, y, -18),
    new Vector3(92, y, -40),
    new Vector3(112, y, -64),
  ]);
  for (let i = 1; i <= 24; i++) pts.push(out.getPoint(i / 24));
  const aviatorAt = new Vector3(112, y, -64);
  const aviatorDir = new Vector3(0.62, 0, -0.78).normalize();
  // straight run through the connector (hidden inside it)
  for (let i = 1; i <= 8; i++) pts.push(aviatorAt.clone().addScaledVector(aviatorDir, i * 6));
  const after = aviatorAt.clone().addScaledVector(aviatorDir, 48);
  const tail = new CatmullRomCurve3([
    after,
    after.clone().add(new Vector3(24, 0, -22)),
    new Vector3(200, y, -120),
    new Vector3(215, y, -160),
  ]);
  for (let i = 1; i <= 30; i++) pts.push(tail.getPoint(i / 30));

  const curve = new CatmullRomCurve3(pts, false, "centripetal");
  const plugBEnd = new Vector3(215, y, -160);
  const plugBDir = tail.getTangent(1).normalize();
  const plugADir = lead.getTangent(0).normalize().negate();
  return {
    curve,
    length: curve.getLength(),
    aviator: { at: aviatorAt.clone().addScaledVector(aviatorDir, 24), dir: aviatorDir },
    plugA: { at: plugAStart, dir: plugADir },
    plugB: { at: plugBEnd, dir: plugBDir },
  };
}

function braidTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 7;
  for (let i = -64; i < 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 64, 64);
    ctx.stroke();
  }
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 3;
  for (let i = -64; i < 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i + 64, 0);
    ctx.lineTo(i, 64);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

const UP = new Vector3(0, 1, 0);

/** Local +Y along `dir`, local +Z pointing up (so flat parts lie flat on the desk). */
function orient(dir: Vector3): Quaternion {
  const y = dir.clone().normalize();
  const x = new Vector3().crossVectors(y, UP).normalize();
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x, y, UP));
}

export function CableModel({ spec, onReady }: { spec: CableSpec; onReady?: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  const path = useMemo(() => buildPath(), []);
  const tube = useMemo(
    () => new TubeGeometry(path.curve, Math.round(path.length / 0.9), WIRE_R, 12, false),
    [path],
  );
  const [bump] = useState(() => {
    if (typeof document === "undefined") return null;
    const t = braidTexture();
    t.repeat.set(path.length / 2.6, 1);
    return t;
  });

  const mats = useMemo(
    () => ({
      sleeve: new MeshPhysicalMaterial({
        color: spec.sleeve,
        roughness: 0.62,
        sheen: 0.6,
        sheenRoughness: 0.5,
        sheenColor: new Color(spec.sleeve).lerp(new Color("#ffffff"), 0.5),
        bumpMap: bump ?? undefined,
        bumpScale: 0.6,
      }),
      metal: new MeshStandardMaterial({ color: spec.connector, metalness: 1, roughness: 0.22 }),
      darkMetal: new MeshStandardMaterial({ color: "#3a3d44", metalness: 0.9, roughness: 0.35 }),
      housing: new MeshPhysicalMaterial({ color: spec.sleeve, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
      rubber: new MeshStandardMaterial({ color: "#26282c", roughness: 0.7 }),
      gold: new MeshStandardMaterial({ color: "#d9b36a", metalness: 1, roughness: 0.3 }),
    }),
    [spec, bump],
  );

  const parts = useMemo(() => {
    const nut = knurledCylinder(8.2, 14, { ridges: 44, depth: 0.35, band: [1.6, 12.4], chamfer: 0.7 });
    const body = lathe(
      [
        [0, 0],
        [6.8, 0],
        [7.4, 0.6],
        [7.4, 12],
        [6.6, 12.6],
        [6.6, 13.4],
        [7.6, 14.2],
        [7.6, 22],
        [5.4, 25],
        [3.2, 27],
        [0, 27],
      ],
      72,
    );
    const ring = lathe(
      [
        [0, 0],
        [7.7, 0],
        [7.7, 1.6],
        [0, 1.6],
      ],
      72,
    );
    const relief = lathe(
      [
        [0, 0],
        [4.2, 0],
        [4.2, 2],
        [3.2, 9],
        [2.5, 14],
        [0, 14],
      ],
      40,
    );
    const plugBody = taperedRoundedBox(12.5, 22, 7.2, 3.2, [0.96, 0.96]);
    const plugShell = taperedRoundedBox(8.4, 6.5, 2.6, 1.25);
    return { nut, body, ring, relief, plugBody, plugShell };
  }, []);

  useEffect(
    () => () => {
      tube.dispose();
      Object.values(parts).forEach((g) => g.dispose());
    },
    [tube, parts],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  useEffect(() => () => bump?.dispose(), [bump]);

  useEffect(() => {
    invalidate();
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => cancelAnimationFrame(id);
  }, [invalidate, onReady]);

  const avQ = orient(path.aviator.dir);
  const plugs = [path.plugA, path.plugB];

  return (
    <group scale={0.0086} position={[0, 0, -0.12]} rotation={[0, 0.06, 0]}>
      <mesh geometry={tube} material={mats.sleeve} castShadow receiveShadow />
      {/* GX16 aviator coupling, lying on the desk */}
      <group position={[path.aviator.at.x, 8.2, path.aviator.at.z]} quaternion={avQ}>
        <group position={[0, -24, 0]}>
          <mesh geometry={parts.body} material={mats.metal} castShadow />
          <mesh geometry={parts.ring} material={mats.housing} position={[0, 14.4, 0]} castShadow />
          <mesh geometry={parts.nut} material={mats.metal} position={[0, 16.6, 0]} castShadow />
        </group>
        <group rotation={[Math.PI, 0, 0]} position={[0, 24, 0]}>
          <mesh geometry={parts.body} material={mats.metal} castShadow />
        </group>
      </group>
      {/* USB-C plugs at both ends */}
      {plugs.map((p, i) => (
        <group key={i} position={[p.at.x, 3.7, p.at.z]} quaternion={orient(p.dir)}>
          <mesh geometry={parts.relief} material={mats.rubber} rotation={[Math.PI, 0, 0]} position={[0, 0, 0]} />
          <mesh geometry={parts.plugBody} material={mats.housing} castShadow />
          <mesh geometry={parts.plugShell} material={mats.metal} position={[0, 22, 0]} castShadow />
        </group>
      ))}
    </group>
  );
}
