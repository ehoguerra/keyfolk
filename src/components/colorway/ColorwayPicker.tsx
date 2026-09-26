"use client";

import { useId, type CSSProperties } from "react";
import { COLORWAY_LIST, type ColorwayId } from "@/lib/colorways";
import { useColorway } from "@/store/colorway";
import { useUi } from "@/store/ui";
import styles from "./ColorwayPicker.module.css";

interface ColorwayPickerProps {
  size?: "md" | "sm";
  showLabel?: boolean;
  className?: string;
}

/**
 * Colorway selector drawn as five tiny keycaps. Native radios give us arrow-key
 * navigation; the pressed look is driven by <html data-colorway> so it is right before hydration.
 */
export function ColorwayPicker({ size = "md", showLabel = true, className = "" }: ColorwayPickerProps) {
  const name = useId();
  const labelId = `${name}-label`;
  const colorway = useColorway((s) => s.colorway);
  const setColorway = useColorway((s) => s.setColorway);
  const announce = useUi((s) => s.announce);

  const choose = (id: ColorwayId) => {
    setColorway(id);
    const cw = COLORWAY_LIST.find((c) => c.id === id);
    if (cw) announce(`Colorway ${cw.name} aplicado ao site.`);
  };

  return (
    <div className={`${styles.root} ${size === "sm" ? styles.sm : ""} ${className}`}>
      {showLabel ? (
        <p id={labelId} className="ui text-sm">
          Colorway: <span className={styles.current} />
        </p>
      ) : (
        <p id={labelId} className="sr-only">
          Colorway do site
        </p>
      )}
      <div role="radiogroup" aria-labelledby={labelId} className={styles.keys} data-testid="colorway-picker">
        {COLORWAY_LIST.map((cw) => (
          <label
            key={cw.id}
            className={`cw-key ${styles.key}`}
            data-cw={cw.id}
            title={`${cw.name}: ${cw.mood}`}
            style={
              {
                "--k-skirt": cw.mod,
                "--k-top": cw.alpha,
                "--k-legend": cw.alphaLegend,
                "--k-accent": cw.accent,
              } as CSSProperties
            }
          >
            <input
              type="radio"
              name={name}
              value={cw.id}
              checked={colorway === cw.id}
              onChange={() => choose(cw.id)}
              className="sr-only"
              data-testid={`colorway-${cw.id}`}
            />
            <span className={styles.cap} aria-hidden="true">
              <span className={styles.top}>
                <span className={styles.legend}>{cw.name.charAt(0)}</span>
                <span className={styles.dot} />
              </span>
            </span>
            <span className="sr-only">{cw.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
