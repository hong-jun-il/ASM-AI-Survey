import { tallyQuestion } from "@/lib/results";
import { Answers, SurveyCounts, SurveyQuestion } from "@/lib/types";
import { OptionRow } from "./OptionRow";

interface QuestionProps {
  q: SurveyQuestion;
  value: Answers[string];
  counts: SurveyCounts | undefined;
  onChange: (updater: (cur: Answers[string]) => Answers[string]) => void;
}

export function Question({ q, value, counts, onChange }: QuestionProps) {
  const handle = (optId: string) => {
    if (q.type === "multi") {
      onChange((cur) => {
        const arr = (cur as string[] | undefined) ?? [];
        return arr.includes(optId) ? arr.filter((x) => x !== optId) : [...arr, optId];
      });
    } else {
      onChange((cur) => (cur === optId ? null : optId));
    }
  };

  const isSelected = (optId: string) =>
    q.type === "multi" ? ((value as string[] | undefined) ?? []).includes(optId) : value === optId;

  const { opts, denom, voted } = tallyQuestion(q, value, counts);
  const stat = new Map(opts.map((o) => [o.id, { pct: denom ? (o.tally / denom) * 100 : 0, tally: o.tally }]));

  const renderOption = (o: (typeof opts)[number]) => {
    const s = stat.get(o.id)!;
    return (
      <OptionRow
        key={o.id}
        q={q}
        opt={o}
        selected={isSelected(o.id)}
        onToggle={handle}
        revealed={voted}
        pct={s.pct}
        tally={s.tally}
      />
    );
  };

  let body: React.ReactNode;
  if (q.groups) {
    const groups: { name: string; items: typeof opts }[] = [];
    opts.forEach((o) => {
      let g = groups.find((x) => x.name === o.group);
      if (!g) {
        g = { name: o.group!, items: [] };
        groups.push(g);
      }
      g.items.push(o);
    });
    body = (
      <div className="flex flex-col gap-5.5">
        {groups.map((g) => (
          <div key={g.name}>
            <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.04em] text-muted">{g.name}</div>
            <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">{g.items.map(renderOption)}</div>
          </div>
        ))}
      </div>
    );
  } else {
    body = <div className="flex flex-col gap-2.5">{opts.map(renderOption)}</div>;
  }

  return (
    <section className="scroll-mt-6" id={q.id}>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="flex-none pt-0.5 text-[13px] font-bold tracking-[0.02em] text-accent tabular-nums">
          {q.no}
        </span>
        <div className="flex flex-col gap-0.75">
          <h2 className="m-0 text-[clamp(19px,4vw,22px)] font-[650] leading-[1.3] tracking-[-0.01em] text-pretty">
            {q.title}
          </h2>
          <span className="text-[13px] text-faint">{voted ? "다시 누르면 취소돼요" : q.hint}</span>
        </div>
      </div>
      {body}
      {voted && (
        <div className="mt-3 text-[12.5px] text-faint tabular-nums">{denom.toLocaleString()}명 응답 · 당신 포함</div>
      )}
    </section>
  );
}
