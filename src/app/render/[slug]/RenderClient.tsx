"use client";

import dynamic from "next/dynamic";

const RenderCanvas = dynamic(() => import("@/three/scenes/RenderCanvas"), { ssr: false });

export function RenderClient({ slug }: { slug: string }) {
  return <RenderCanvas slug={slug} />;
}
