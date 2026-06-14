import { SURVEY } from "./survey-data";
import { Answers, QuestionCounts, QuestionTally, ResultBlockData, SurveyCounts, SurveyQuestion } from "./types";

function pickedIds(q: SurveyQuestion, answer: Answers[string]): string[] {
  if (q.type === "multi") return (answer as string[] | undefined) ?? [];
  return answer ? [answer as string] : [];
}

/** Live per-question tally: seeded counts + the user's current pick folded in. */
export function tallyQuestion(
  q: SurveyQuestion,
  answer: Answers[string],
  counts: SurveyCounts | undefined
): QuestionTally {
  const picked = pickedIds(q, answer);
  const set = new Set(picked);
  const qCounts = (counts?.[q.id] as QuestionCounts | undefined) ?? {};
  const opts = q.options.map((o) => ({
    ...o,
    tally: (qCounts[o.id] ?? 0) + (set.has(o.id) ? 1 : 0),
    mine: set.has(o.id),
  }));
  const denom =
    q.type === "multi"
      ? (counts?.total ?? 0) + (picked.length ? 1 : 0)
      : opts.reduce((s, o) => s + o.tally, 0);
  return { opts, denom, voted: picked.length > 0 };
}

/** Full results breakdown for every question, for the Results screen. */
export function buildResults(answers: Answers, counts: SurveyCounts | undefined): ResultBlockData[] {
  return SURVEY.questions.map((q) => {
    const { opts, denom } = tallyQuestion(q, answers[q.id], counts);
    return { q, opts, denom };
  });
}
