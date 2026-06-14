import { ResultBlockData, TalliedOption } from "@/lib/types";
import { Bar } from "./Bar";

interface ResultBlockProps {
  block: ResultBlockData;
}

export function ResultBlock({ block }: ResultBlockProps) {
  const { q, opts, denom } = block;

  if (q.groups) {
    const groups: { name: string; items: TalliedOption[] }[] = [];
    opts.forEach((o) => {
      let g = groups.find((x) => x.name === o.group);
      if (!g) {
        g = { name: o.group!, items: [] };
        groups.push(g);
      }
      g.items.push(o);
    });
    return (
      <section>
        <div className="mb-4.5 flex flex-wrap items-baseline gap-2.5">
          <span className="flex-none pt-0.5 text-[13px] font-bold tracking-[0.02em] text-accent tabular-nums">
            {q.no}
          </span>
          <h2 className="m-0 text-[clamp(18px,3.6vw,21px)] font-[650] leading-[1.3] tracking-[-0.01em]">
            {q.title}
          </h2>
        </div>
        {groups.map((g) => (
          <div className="mb-5.5 last:mb-0" key={g.name}>
            <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.04em] text-muted">
              {g.name}
            </div>
            <div className="flex flex-col gap-3.75">
              {g.items.map((o, i) => (
                <Bar key={o.id} opt={o} denom={denom} delay={i * 55} />
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4.5 flex flex-wrap items-baseline gap-2.5">
        <span className="flex-none pt-0.5 text-[13px] font-bold tracking-[0.02em] text-accent tabular-nums">
          {q.no}
        </span>
        <h2 className="m-0 text-[clamp(18px,3.6vw,21px)] font-[650] leading-[1.3] tracking-[-0.01em]">
          {q.title}
        </h2>
        {q.type === "multi" && (
          <span className="rounded-full bg-track px-2.25 py-0.75 text-[11.5px] font-semibold text-muted">
            복수 응답
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3.75">
        {opts.map((o, i) => (
          <Bar key={o.id} opt={o} denom={denom} delay={i * 55} />
        ))}
      </div>
    </section>
  );
}
