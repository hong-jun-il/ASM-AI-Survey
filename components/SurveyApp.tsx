"use client";

import { useEffect, useRef, useState } from "react";
import { useSaveResponse, useSurveyCounts } from "@/lib/queries";
import { Answers } from "@/lib/types";
import {
  clearStore,
  loadStore,
  newRespondentId,
  saveStore,
} from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { Survey } from "./Survey";
import { Results } from "./Results";

function hasAnyAnswer(answers: Answers): boolean {
  return Object.values(answers).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v,
  );
}

export function SurveyApp() {
  const [view, setView] = useState<"survey" | "results">("survey");
  const [answers, setAnswers] = useState<Answers>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const respondentId = useRef<string>(newRespondentId());
  const created = useRef(false);
  const hydrated = useRef(false);

  const { data: counts } = useSurveyCounts(respondentId.current);
  const autosave = useSaveResponse();
  const submitMutation = useSaveResponse();

  // Restore draft/submitted state from localStorage after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const stored = loadStore();
    if (stored) {
      respondentId.current = stored.respondentId;
      created.current = stored.created;
      setAnswers(stored.answers);
      setView(stored.submitted ? "results" : "survey");
    }
    hydrated.current = true;
  }, []);

  // Persist draft answers / submission state locally.
  useEffect(() => {
    if (!hydrated.current) return;
    saveStore({
      respondentId: respondentId.current,
      answers,
      submitted: view === "results",
      created: created.current,
    });
  }, [answers, view]);

  // Autosave answers to Supabase as the user goes, so partial responses
  // aren't lost if they drop off before submitting.
  useEffect(() => {
    if (!hydrated.current || view !== "survey") return;
    if (!hasAnyAnswer(answers)) return;
    const t = setTimeout(() => {
      const wasCreated = created.current;
      autosave.mutate(
        { respondentId: respondentId.current, answers, created: wasCreated },
        {
          onSuccess: () => {
            if (!wasCreated) {
              created.current = true;
              saveStore({
                respondentId: respondentId.current,
                answers,
                submitted: false,
                created: true,
              });
            }
          },
        },
      );
    }, 400);
    return () => clearTimeout(t);
    // autosave.mutate is referentially stable; omitting `autosave` avoids
    // re-running this effect on every mutation status change (which would
    // otherwise re-fire the save in a loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, view]);

  const submit = () => {
    setSubmitError(null);
    submitMutation.mutate(
      {
        respondentId: respondentId.current,
        answers,
        completed: true,
        created: created.current,
      },
      {
        onSuccess: () => {
          created.current = true;
          setView("results");
          window.scrollTo({ top: 0, behavior: "auto" });
        },
        onError: (err) => {
          setSubmitError(
            err instanceof Error
              ? err.message
              : "제출에 실패했습니다. 다시 시도해주세요.",
          );
        },
      },
    );
  };

  const restart = () => {
    clearStore();
    respondentId.current = newRespondentId();
    created.current = false;
    setAnswers({});
    setSubmitError(null);
    setView("survey");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="min-h-screen">
      <div
        className="mx-auto max-w-165 px-[clamp(18px,5vw,36px)] pt-[clamp(28px,6vw,64px)] pb-40 max-[560px]:pb-37.5"
        key={view}
      >
        {!supabase && (
          <p className="mb-5 rounded-card border border-[#fde68a] bg-[#fffbeb] px-3.5 py-3 text-[13px] text-[#92400e] text-pretty">
            Supabase 설정이 필요합니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL /
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정하면 실시간 집계가
            표시됩니다.
          </p>
        )}
        {view === "survey" ? (
          <Survey
            answers={answers}
            setAnswers={setAnswers}
            counts={counts}
            onSubmit={submit}
            submitting={submitMutation.isPending}
            submitError={submitError}
          />
        ) : (
          <Results answers={answers} counts={counts} onRestart={restart} />
        )}
      </div>
    </div>
  );
}
