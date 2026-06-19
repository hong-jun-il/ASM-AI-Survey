import { Dispatch, SetStateAction } from "react";
import { SURVEY } from "@/lib/survey-data";
import { Answers, SurveyCounts } from "@/lib/types";
import { Question } from "./Question";

interface SurveyProps {
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  counts: SurveyCounts | undefined;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}

export function Survey({
  answers,
  setAnswers,
  counts,
  onSubmit,
  submitting,
  submitError,
}: SurveyProps) {
  const all = SURVEY.questions;
  const answeredCount = all.filter((q) => {
    const v = answers[q.id];
    return q.type === "multi" ? !!(v as string[] | undefined)?.length : !!v;
  }).length;
  const ready = answeredCount > 0;
  const pct = Math.round((answeredCount / all.length) * 100);

  const setOne = (
    qid: string,
    updater: (cur: Answers[string]) => Answers[string],
  ) => {
    setAnswers((prev) => ({ ...prev, [qid]: updater(prev[qid]) }));
  };

  return (
    <div>
      <header className="motion-safe:animate-page-in">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-accent">
          AI 사용 현황 설문 · 익명
        </span>
        <h1 className="m-0 mb-3 text-[clamp(28px,6vw,38px)] font-bold leading-[1.18] tracking-[-0.02em] text-balance">
          {SURVEY.meta.title}
        </h1>
        <p className="m-0 mb-4.5 max-w-[44ch] text-[clamp(16px,3.4vw,18px)] text-ink-2 text-pretty">
          {SURVEY.meta.subtitle}
        </p>
        <p className="m-0 rounded-card border border-line bg-surface px-4 py-3.5 text-sm text-muted text-pretty">
          {SURVEY.meta.intro}
        </p>
      </header>

      <div className="mt-[clamp(36px,7vw,56px)] flex flex-col gap-[clamp(34px,6vw,48px)] motion-safe:animate-page-in-delayed">
        {all.map((q) => (
          <Question
            key={q.id}
            q={q}
            value={answers[q.id]}
            counts={counts}
            onChange={(updater) => setOne(q.id, updater)}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-[clamp(18px,5vw,36px)] pt-5 pb-[22px] [background:linear-gradient(to_top,var(--color-bg)_62%,rgba(250,250,250,0))]">
        <div className="mx-auto flex max-w-165 items-center gap-4 max-[560px]:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.75">
            <div className="h-[5px] overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                style={{ width: pct + "%" }}
              />
            </div>
            <span className="text-[12.5px] text-muted tabular-nums">
              {answeredCount}/{all.length} 응답
            </span>
            {submitError && (
              <span className="mt-3 block text-right text-[12.5px] text-red-600">
                {submitError}
              </span>
            )}
          </div>
          <button
            type="button"
            className="flex-none cursor-pointer rounded-full border border-transparent bg-accent px-[22px] py-[13px] text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[background-color,border-color,color,transform,opacity] duration-150 hover:brightness-[1.07] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-line-2 disabled:text-white disabled:shadow-none max-[560px]:px-[18px] max-[560px]:text-[14.5px]"
            disabled={!ready || submitting}
            onClick={onSubmit}
          >
            {submitting ? "제출 중…" : "전체 결과 모아 보기"}
          </button>
        </div>
      </div>
    </div>
  );
}
