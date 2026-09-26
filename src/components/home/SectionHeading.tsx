import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  title: string;
  aside?: string;
  children?: ReactNode;
}

/** Left-aligned display heading with an optional note on the right. */
export function SectionHeading({ id, title, aside, children }: SectionHeadingProps) {
  return (
    <div className="grid-k items-end gap-y-4">
      <h2 id={id} className="display col-span-4 text-[clamp(2.25rem,4.6vw,3.5rem)] md:col-span-7">
        {title}
      </h2>
      <div className="col-span-4 flex flex-col items-start gap-4 md:col-span-5 md:flex-row md:items-end md:justify-end md:gap-6">
        {aside ? <p className="max-w-[36ch] text-muted md:text-right">{aside}</p> : null}
        {children}
      </div>
    </div>
  );
}
