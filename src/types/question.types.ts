export type QuestionType = "text" | "multiple_choice" | "checkbox";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  category: string;
  createdAt: string;
  createdBy: string;
}

export interface QuestionFilters {
  category?: string;
  type?: QuestionType;
}

export interface CreateQuestionData {
  text: string;
  type: QuestionType;
  options?: string[];
  category: string;
}

export interface DashboardStats {
  questions: {
    total: number;
    byCategory: {
      category: string;
      questions: Question[];
    }[];
  };
  responses: {
    pending: number;
    completed: number;
  };
  assignments: {
    pending: number;
    completed: number;
  };
}

export interface CategoryResponse {
  data: string[];
  success: boolean;
}
