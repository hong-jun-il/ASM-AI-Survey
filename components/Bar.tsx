"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { TalliedOption } from "@/lib/types";

interface BarProps {
  opt: TalliedOption;
  denom: number;
  delay: number;
}

export function Bar({ opt, denom, delay }: BarProps) {
  const pct = denom ? (opt.tally / denom) * 100 : 0;
  const [w, setW] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setW(pct), 40 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div>
      <div className="mb-1.75 flex items-baseline justify-between gap-3">
        <span className="text-[14.5px] font-[550] tracking-[-0.005em] text-ink">
          {opt.label}
          {opt.desc ? (
            <span className="text-[13px] font-[450] text-muted">
              {" "}
              · {opt.desc}
            </span>
          ) : null}
          {opt.mine && (
            <span className="ml-2 rounded-full bg-accent-soft px-1.75 py-0.5 align-[1px] text-[11px] font-[650]">
              내 응답
            </span>
          )}
        </span>
        <span className="inline-flex flex-none items-baseline gap-2 tabular-nums">
          <b className="text-[15px] font-bold">{Math.round(pct)}%</b>
          <span className="text-[12.5px] text-faint">{opt.tally}</span>
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-track">
        <div
          className={clsx(
            "h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none",
            opt.mine ? "opacity-100" : "opacity-[0.42]",
          )}
          style={{ width: w + "%" }}
        />
      </div>
    </div>
  );
}
