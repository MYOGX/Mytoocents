// Database types

export interface Profile {
  id: string;
  created_at: string;
  display_name: string | null;
  cents_balance: number;
  answer_streak: number;
  last_answer_date: string | null;
}

export interface Question {
  id: string;
  created_at: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  active_date: string;
}

export interface Answer {
  id: string;
  created_at: string;
  user_id: string;
  question_id: string;
  chosen_option: 'A' | 'B' | 'C' | 'D';
}

export interface RewardTransaction {
  id: string;
  created_at: string;
  user_id: string;
  amount_cents: number;
  type: string;
  meta?: any;
}

export interface QuestionWithAnswer extends Question {
  user_answer?: Answer | null;
}

export interface AnswerStats {
  option: string;
  count: number;
  percentage: number;
}
