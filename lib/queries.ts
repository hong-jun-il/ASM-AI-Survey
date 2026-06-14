import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { Answers, ResponsePayload, SurveyCounts } from "./types";

export const SURVEY_COUNTS_KEY = ["survey-counts"] as const;

// Counts exclude the caller's own row (see get_survey_counts), since the UI
// already folds the user's current picks in locally via tallyQuestion's
// "mine" bonus — including them in both places would double-count.
export function useSurveyCounts(respondentId: string) {
  return useQuery({
    queryKey: [...SURVEY_COUNTS_KEY, respondentId],
    queryFn: async (): Promise<SurveyCounts> => {
      const { data, error } = await supabase!.rpc("get_survey_counts", {
        p_respondent_id: respondentId,
      });
      if (error) throw error;
      return data as SurveyCounts;
    },
    enabled: !!supabase,
    refetchInterval: 5000,
  });
}

function toResponsePayload(
  answers: Answers,
  completed: boolean,
): ResponsePayload {
  return {
    q1: (answers.q1 as string[] | undefined) ?? [],
    q2: (answers.q2 as string | undefined) ?? null,
    q3: (answers.q3 as string | undefined) ?? null,
    q4: (answers.q4 as string | undefined) ?? null,
    q5: (answers.q5 as string | undefined) ?? null,
    updated_at: new Date().toISOString(),
    ...(completed ? { completed_at: new Date().toISOString() } : {}),
  };
}

interface SaveResponseArgs {
  respondentId: string;
  answers: Answers;
  completed?: boolean;
  // Whether the row for respondentId has already been inserted. The first
  // save inserts the row; later saves update it by id. We avoid upsert
  // (INSERT ... ON CONFLICT DO UPDATE) because Postgres evaluates RLS SELECT
  // policies for the conflicting row in that case, and this table
  // intentionally has no SELECT policy for anon (raw responses stay private).
  created: boolean;
}

// Persists the respondent's row, so partial answers survive even if the user
// never reaches the submit button (autosave on every change, plus a final
// update with completed_at on submit).
export function useSaveResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      respondentId,
      answers,
      completed,
      created,
    }: SaveResponseArgs) => {
      if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
      const payload = toResponsePayload(answers, !!completed);
      const { error } = created
        ? await supabase
            .from("responses")
            .update(payload)
            .eq("id", respondentId)
        : await supabase
            .from("responses")
            .insert({ id: respondentId, ...payload });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      if (variables.completed) {
        queryClient.invalidateQueries({ queryKey: SURVEY_COUNTS_KEY });
      }
    },
  });
}
