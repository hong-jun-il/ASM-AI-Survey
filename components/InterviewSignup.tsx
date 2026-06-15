"use client";

import { useState } from "react";
import { useSubmitInterviewSignup } from "@/lib/queries";

export function InterviewSignup() {
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);
  const mutation = useSubmitInterviewSignup();

  const submit = () => {
    const value = contact.trim();
    if (!value) return;
    mutation.mutate(value, { onSuccess: () => setDone(true) });
  };

  return (
    <div className="mt-8.5 rounded-card border border-line bg-surface px-5 py-4.5">
      <h3 className="m-0 mb-1.5 text-[15px] font-[650] tracking-[-0.01em]">
        인터뷰 참여 의향이 있으신가요?
      </h3>
      <p className="m-0 mb-3.5 text-[13px] text-muted text-pretty">
        선택 사항입니다. 연락처를 남겨주시면 추후 인터뷰 요청을 위해 따로
        연락드릴게요. 설문 응답과는 연결되지 않습니다.
      </p>
      {done ? (
        <p className="m-0 text-[14px] font-[600] text-accent">
          감사합니다! 연락처가 전달되었어요.
        </p>
      ) : (
        <>
          <div className="flex gap-2.5 max-[560px]:flex-col">
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="이메일 또는 전화번호"
              className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-4 py-2.75 text-[14.5px] text-ink outline-none focus:border-accent"
            />
            <button
              type="button"
              disabled={!contact.trim() || mutation.isPending}
              onClick={submit}
              className="flex-none cursor-pointer rounded-full border border-transparent bg-accent px-[20px] py-2.75 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[background-color,border-color,color,transform,opacity] duration-150 hover:brightness-[1.07] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-line-2 disabled:text-white disabled:shadow-none"
            >
              {mutation.isPending ? "제출 중…" : "제출"}
            </button>
          </div>
          {mutation.isError && (
            <p className="mt-2.5 text-[12.5px] text-red-600">
              제출에 실패했습니다. 다시 시도해주세요.
            </p>
          )}
        </>
      )}
    </div>
  );
}
