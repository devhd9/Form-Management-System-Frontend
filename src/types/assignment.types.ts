import { User } from "./auth.types";
import { Question } from "./question.types";

export enum AssignmentStatus {
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export interface AssignQuestionRequest {
  userId: string;
  questionId: string;
}

export interface GetUserFormQuestionsResponse {
  success: boolean;
  data: UserFormQuestion[];
}

export interface UserFormQuestion {
  id: string;
  status: AssignmentStatus;
  batchId: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  question: Question;
  responses: any[];
}
