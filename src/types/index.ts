import { QuestionType } from "./question.types";

export * from "./api.types";
export * from "./auth.types";
export * from "./question.types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  category: string;
  createdAt: string;
  createdBy: string;
}

export interface QuestionResponse {
  result: Question[];
  success: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  createdBy: string;
}

export interface QuestionAssignment {
  id: string;
  questionIds: string[];
  userId: string;
  status: "pending" | "completed";
  assignedAt: string;
}

export interface UserResponse {
  id: string;
  assignmentId: string;
  userId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  submittedAt: string;
}

export type FormAssignment = QuestionAssignment;
export type FormResponse = UserResponse;
