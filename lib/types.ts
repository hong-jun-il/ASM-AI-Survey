export type QuestionType = "single" | "multi";

export interface SurveyOption {
  id: string;
  label: string;
  desc?: string;
  group?: string;
}

export interface SurveyQuestion {
  id: string;
  no: string;
  type: QuestionType;
  title: string;
  hint: string;
  required: boolean;
  groups?: boolean;
  options: SurveyOption[];
}

export interface SurveyMeta {
  title: string;
  subtitle: string;
  intro: string;
}

export interface SurveyDefinition {
  meta: SurveyMeta;
  questions: SurveyQuestion[];
}

/** answers[q.id] is string[] for multi questions, string | null for single questions */
export type Answers = Record<string, string[] | string | null | undefined>;

/** counts[questionId][optionId] = seeded/aggregate count from Supabase */
export type QuestionCounts = Record<string, number>;

export interface SurveyCounts {
  total: number;
  q1: QuestionCounts;
  q2: QuestionCounts;
  q3: QuestionCounts;
  q4: QuestionCounts;
  q5: QuestionCounts;
  [key: string]: QuestionCounts | number;
}

export interface TalliedOption extends SurveyOption {
  tally: number;
  mine: boolean;
}

export interface QuestionTally {
  opts: TalliedOption[];
  denom: number;
  voted: boolean;
}

export interface ResultBlockData {
  q: SurveyQuestion;
  opts: TalliedOption[];
  denom: number;
}

export interface ResponsePayload {
  q1: string[];
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
  updated_at: string;
  completed_at?: string;
}
