"use client";

import { useMemo } from "react";
import type { ColorwayId } from "@/lib/colorways";
import type { KeyAnimator } from "../lib/keyAnimator";
import { LAYOUT_75 } from "../lib/layouts";
import { colorwayPalette } from "../lib/palette";
import { KeyboardModel } from "../models/Keyboard";
import { HERO_STAGE } from "./config";
import { Studio } from "./Studio";

interface HeroSceneProps {
  colorway: ColorwayId;
  animator?: KeyAnimator;
  animatePalette?: boolean;
  onKeyPointerDown?: (code: string) => void;
  onReady?: () => void;
}

/** The hero keyboard: a 75% dressed in the active colorway. */
export function HeroScene({ colorway, animator, animatePalette, onKeyPointerDown, onReady }: HeroSceneProps) {
  const palette = useMemo(() => colorwayPalette(colorway), [colorway]);
  return (
    <>
      <Studio shadowSize={HERO_STAGE.shadowSize} contactShadow={HERO_STAGE.contact} />
      <group scale={0.01} rotation={[0, -0.035, 0]}>
        <KeyboardModel
          layout={LAYOUT_75}
          palette={palette}
          animatePalette={animatePalette}
          animator={animator}
          onKeyPointerDown={onKeyPointerDown}
          onReady={onReady}
        />
      </group>
    </>
  );
}
