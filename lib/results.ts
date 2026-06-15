import { SURVEY } from "./survey-data";
import {
  Answers,
  QuestionCounts,
  QuestionTally,
  ResultBlockData,
  SurveyCounts,
  SurveyQuestion,
} from "./types";

function pickedIds(q: SurveyQuestion, answer: Answers[string]): string[] {
  if (q.type === "multi") return (answer as string[] | undefined) ?? [];
  return answer ? [answer as string] : [];
}

/** Live per-question tally: seeded counts + the user's current pick folded in. */
export function tallyQuestion(
  q: SurveyQuestion,
  answer: Answers[string],
  counts: SurveyCounts | undefined,
): QuestionTally {
  const picked = pickedIds(q, answer);
  const set = new Set(picked);
  const qCounts = (counts?.[q.id] as QuestionCounts | undefined) ?? {};
  const opts = q.options.map((o) => ({
    ...o,
    tally: (qCounts[o.id] ?? 0) + (set.has(o.id) ? 1 : 0),
    mine: set.has(o.id),
  }));
  // % is always "share of total picks for this question" so per-option bars
  // sum to 100% even for multi-select questions (where one respondent can
  // contribute to several options).
  const denom = opts.reduce((s, o) => s + o.tally, 0);
  // Respondent count (for "OOO명 응답") differs for multi-select, where one
  // respondent can pick multiple options.
  const respondents = q.type === "multi" ? (counts?.total ?? 0) + (picked.length ? 1 : 0) : denom;
  return { opts, denom, respondents, voted: picked.length > 0 };
}

/** Full results breakdown for every question, for the Results screen. */
export function buildResults(
  answers: Answers,
  counts: SurveyCounts | undefined,
): ResultBlockData[] {
  return SURVEY.questions.map((q) => {
    const { opts, denom } = tallyQuestion(q, answers[q.id], counts);
    return { q, opts, denom };
  });
}
