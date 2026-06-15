import { SurveyDefinition } from "./types";

// Survey definition for the AI usage survey. Aggregate counts live in
// Supabase (see lib/queries.ts) rather than here.
export const SURVEY: SurveyDefinition = {
  meta: {
    title: "사내 AI 사용 현황 설문",
    subtitle: "각 문항을 선택하면 바로 전체 결과가 보여요.",
    intro:
      "로그인 없이 익명으로 참여합니다. 선택하면 그 자리에서 바로 분포가 열리고, 같은 항목을 다시 누르면 투표가 취소됩니다.",
  },
  questions: [
    {
      id: "q1",
      no: "Q1",
      type: "multi",
      title: "주로 사용하는 AI 서비스는?",
      hint: "복수 선택 가능",
      required: true,
      options: [
        { id: "chatgpt", label: "ChatGPT" },
        { id: "claude", label: "Claude" },
        { id: "gemini", label: "Gemini" },
        { id: "copilot", label: "Copilot" },
        { id: "inhouse", label: "사내 자체 AI" },
        { id: "etc", label: "기타" },
      ],
    },
    {
      id: "q2",
      no: "Q2",
      type: "single",
      title: "회사에서 AI를 어떻게 제공받고 있나요?",
      hint: "단일 선택",
      required: true,
      options: [
        {
          id: "enterprise",
          label: "회사 엔터프라이즈 플랜",
          desc: "중앙에서 통합 관리",
        },
        {
          id: "personal_sub",
          label: "개인 계정에 Pro/Max를 회사가 구독",
          desc: "후지급 또는 직접 지원",
        },
        { id: "credit", label: "크레딧·예산을 나눠받아 개인이 사용" },
        { id: "selfhosted", label: "사내 자체 구축 AI", desc: "사내망 등" },
        { id: "none_support", label: "회사 지원 없음 — 개인 비용으로 사용" },
        { id: "no_use", label: "AI 사용 안 함" },
      ],
    },
    {
      id: "q3",
      no: "Q3",
      type: "single",
      title: "현재 사용 중인 플랜은?",
      hint: "메인으로 쓰는 서비스 기준으로 선택",
      required: true,
      groups: true,
      options: [
        { id: "claude_free", group: "Claude", label: "Free" },
        { id: "claude_pro", group: "Claude", label: "Pro", desc: "$20/월" },
        { id: "claude_max20", group: "Claude", label: "Max $20" },
        { id: "claude_max100", group: "Claude", label: "Max $100" },
        { id: "claude_ent", group: "Claude", label: "Enterprise" },
        { id: "gpt_free", group: "ChatGPT", label: "Free" },
        { id: "gpt_go", group: "ChatGPT", label: "Go" },
        { id: "gpt_plus", group: "ChatGPT", label: "Plus" },
        { id: "gpt_pro_5x", group: "ChatGPT", label: "Pro 5x" },
        { id: "gpt_pro_20x", group: "ChatGPT", label: "Pro 20x" },
        { id: "gpt_team", group: "ChatGPT", label: "Team" },
        { id: "gpt_ent", group: "ChatGPT", label: "Enterprise" },
        {
          id: "etc",
          group: "기타",
          label: "기타",
          desc: "Gemini·Copilot·사내 자체 AI 등",
        },
      ],
    },
    {
      id: "q4",
      no: "Q4",
      type: "single",
      title: "하루 usage 소진율은?",
      hint: "단일 선택",
      required: true,
      options: [
        { id: "low", label: "거의 안 씀", desc: "20% 미만" },
        { id: "half", label: "절반 정도", desc: "20~60%" },
        { id: "high", label: "거의 다 씀", desc: "60~90%" },
        { id: "over", label: "한도 초과 경험 있음", desc: "100% · 추가 구매" },
        {
          id: "no_limit",
          label: "사용량 제한 없음",
          desc: "무제한 플랜·해당 없음",
        },
      ],
    },
    {
      id: "q5",
      no: "Q5",
      type: "single",
      title: "직군은?",
      hint: "선택 — 응답하지 않아도 됩니다",
      required: false,
      options: [
        { id: "dev", label: "개발" },
        { id: "pm", label: "기획 · PM" },
        { id: "design", label: "디자인" },
        { id: "marketing", label: "마케팅" },
        { id: "biz", label: "경영 · 전략" },
        { id: "etc", label: "기타" },
      ],
    },
  ],
};
