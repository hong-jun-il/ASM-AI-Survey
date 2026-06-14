import clsx from "clsx";
import { SurveyQuestion, TalliedOption } from "@/lib/types";

interface OptionRowProps {
  q: SurveyQuestion;
  opt: TalliedOption;
  selected: boolean;
  revealed: boolean;
  pct: number;
  tally: number;
  onToggle: (optId: string) => void;
}

export function OptionRow({
  q,
  opt,
  selected,
  revealed,
  pct,
  tally,
  onToggle,
}: OptionRowProps) {
  const multi = q.type === "multi";
  return (
    <button
      type="button"
      className={clsx(
        "relative flex w-full items-center justify-between gap-2.5 overflow-hidden rounded-card border p-4 text-left text-ink transition-[border-color,background-color,box-shadow,transform] duration-150 hover:border-line-2 active:scale-[0.992]",
        selected
          ? clsx(
              "border-accent shadow-[inset_0_0_0_1px_var(--color-accent)]",
              revealed ? "bg-surface" : "bg-accent-soft",
            )
          : "border-line bg-surface",
      )}
      onClick={() => onToggle(opt.id)}
      aria-pressed={selected}
    >
      {revealed && (
        <span
          className={clsx(
            "absolute inset-y-0 left-0 z-0 rounded-[inherit] transition-[width] duration-550 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
            selected ? "bg-accent opacity-15" : "bg-track",
          )}
          style={{ width: pct + "%" }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex min-w-0 items-center gap-3.25">
        <span
          className={clsx(
            "grid h-5 w-5 flex-none place-items-center border-[1.6px] text-white transition-[border-color,background-color] duration-150",
            multi ? "rounded-md" : "rounded-full",
            selected ? "border-accent bg-accent" : "border-line-2",
          )}
          aria-hidden="true"
        >
          {selected &&
            (multi ? (
              <svg viewBox="0 0 16 16" width="12" height="12">
                <path
                  d="M3 8.5l3 3 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span className="h-2 w-2 rounded-full bg-white" />
            ))}
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span className="text-[15.5px] font-[550] tracking-[-0.005em]">
            {opt.label}
          </span>
          {opt.desc && (
            <span
              className={clsx(
                "text-[12.5px]",
                selected ? "text-ink-2" : "text-muted",
              )}
            >
              {opt.desc}
            </span>
          )}
        </span>
      </span>
      {revealed && (
        <span className="relative z-10 inline-flex flex-none items-baseline gap-1.75 pl-2.5 tabular-nums">
          <b
            className={clsx(
              "text-[14.5px] font-bold",
              selected ? "text-accent" : "text-muted",
            )}
          >
            {Math.round(pct)}%
          </b>
          <span className="text-xs text-faint">{tally}</span>
        </span>
      )}
    </button>
  );
}
