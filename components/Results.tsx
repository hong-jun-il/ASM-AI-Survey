"use client";

import { useMemo, useState } from "react";
import { buildResults } from "@/lib/results";
import { Answers, SurveyCounts } from "@/lib/types";
import { ResultBlock } from "./ResultBlock";

interface ResultsProps {
  answers: Answers;
  counts: SurveyCounts | undefined;
  onRestart: () => void;
}

export function Results({ answers, counts, onRestart }: ResultsProps) {
  const blocks = useMemo(() => buildResults(answers, counts), [answers, counts]);
  const respondents = counts?.total ?? 0;
  const [copied, setCopied] = useState(false);

  const share = () => {
    const url = location.href;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done);
    } else {
      done();
    }
  };

  return (
    <div className="motion-safe:animate-page-in">
      <header className="mb-2">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-accent">
          실시간 결과
        </span>
        <h1 className="m-0 mb-3 text-[clamp(28px,6vw,38px)] font-bold leading-[1.18] tracking-[-0.02em] text-balance">
          전체 응답 현황
        </h1>
        <p className="m-0 mb-5.5 text-[14.5px] text-ink-2 text-pretty">
          방금 당신의 응답이 반영됐어요. 막대에서 <span className="font-[650] text-accent">내 응답</span>을 확인해보세요.
        </p>
        <div className="flex items-baseline gap-2 rounded-card border border-line bg-surface px-5 py-4.5">
          <span className="text-[34px] font-[750] tracking-[-0.02em] tabular-nums">{respondents.toLocaleString()}</span>
          <span className="text-[15px] font-[550] text-muted">명 참여</span>
        </div>
      </header>

      <div className="mt-8.5 flex flex-col gap-10">
        {blocks.map((b) => (
          <ResultBlock key={b.q.id} block={b} />
        ))}
      </div>

      <div className="mt-11 flex gap-3 max-[560px]:flex-col">
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-full border border-line-2 bg-surface px-[22px] py-[13px] text-center text-[15px] font-semibold tracking-[-0.01em] text-ink-2 transition-[background-color,border-color,color,transform,opacity] duration-150 hover:border-faint hover:text-ink active:scale-[0.985] max-[560px]:px-[18px] max-[560px]:text-[14.5px]"
          onClick={onRestart}
        >
          다시 참여하기
        </button>
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-full border border-transparent bg-accent px-[22px] py-[13px] text-center text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[background-color,border-color,color,transform,opacity] duration-150 hover:brightness-[1.07] active:scale-[0.985] max-[560px]:px-[18px] max-[560px]:text-[14.5px]"
          onClick={share}
        >
          {copied ? "링크 복사됨 ✓" : "결과 링크 공유"}
        </button>
      </div>
      <p className="mt-5.5 text-center text-[12.5px] text-faint text-pretty">
        이 설문은 사내 AI 토큰 사용량 트래킹 대시보드 기획을 위한 익명 시장 조사입니다.
      </p>
    </div>
  );
}
