"use client";

import { playThock, unlockAudio } from "@/lib/thock";
import { useSound } from "@/store/sound";
import { Icon } from "../ui/Icon";

export function SoundToggle({ className = "" }: { className?: string }) {
  const enabled = useSound((s) => s.enabled);
  const setEnabled = useSound((s) => s.setEnabled);
  return (
    <button
      type="button"
      aria-pressed={enabled}
      className={`btn btn-sm ${enabled ? "btn-accent" : ""} ${className}`}
      onClick={() => {
        const next = !enabled;
        if (next) {
          // Created lazily, inside the click, so browsers allow audio.
          unlockAudio();
          playThock(useSound.getState().profile);
        }
        setEnabled(next);
      }}
      data-testid="sound-toggle"
    >
      <Icon name={enabled ? "sound-on" : "sound-off"} size={18} />
      Som: {enabled ? "ligado" : "desligado"}
    </button>
  );
}
