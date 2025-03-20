import {
  User,
  Form,
  Question,
  QuestionAssignment,
  UserResponse,
} from "../types";

export const users: User[] = [
  { id: "1", name: "admin", email: "admin@admin.com", role: "admin" },
  { id: "2", name: "user", email: "user@user.com", role: "user" },
];

export const questions: Question[] = [
  {
    id: "1",
    text: "How satisfied are you with our service?",
    type: "multiple_choice",
    options: [
      "Very Satisfied",
      "Satisfied",
      "Neutral",
      "Dissatisfied",
      "Very Dissatisfied",
    ],
    category: "Feedback",
    createdAt: "2023-01-10T08:30:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    text: "What features would you like to see improved?",
    type: "text",
    category: "Feedback",
    createdAt: "2023-01-11T09:45:00Z",
    createdBy: "1",
  },
  {
    id: "3",
    text: "Which of the following services have you used?",
    type: "checkbox",
    options: ["Customer Support", "Technical Support", "Sales", "Billing"],
    category: "Usage",
    createdAt: "2023-01-12T14:20:00Z",
    createdBy: "1",
  },
  {
    id: "4",
    text: "How likely are you to recommend our product to others?",
    type: "multiple_choice",
    options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"],
    category: "Feedback",
    createdAt: "2023-01-15T11:10:00Z",
    createdBy: "1",
  },
  {
    id: "5",
    text: "Please provide any additional comments or suggestions.",
    type: "text",
    category: "Additional",
    createdAt: "2023-01-15T11:15:00Z",
    createdBy: "1",
  },
  {
    id: "6",
    text: "How often do you use our product?",
    type: "multiple_choice",
    options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
    category: "Usage",
    createdAt: "2023-01-16T10:30:00Z",
    createdBy: "1",
  },
  {
    id: "7",
    text: "Which features do you find most useful?",
    type: "checkbox",
    options: ["Dashboard", "Reports", "User Management", "Integrations", "API"],
    category: "Features",
    createdAt: "2023-01-17T13:45:00Z",
    createdBy: "1",
  },
  {
    id: "8",
    text: "What industry do you work in?",
    type: "text",
    category: "Demographics",
    createdAt: "2023-01-18T16:20:00Z",
    createdBy: "1",
  },
];

export const forms: Form[] = [
  {
    id: "1",
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services by providing your feedback.",
    questions: [questions[0], questions[1], questions[3], questions[4]],
    createdAt: "2023-01-15T08:30:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    title: "Product Usage Survey",
    description: "Please tell us about your experience with our products.",
    questions: [questions[2], questions[3], questions[4]],
    createdAt: "2023-02-20T10:15:00Z",
    createdBy: "1",
  },
];

export const questionAssignments: QuestionAssignment[] = [
  {
    id: "1",
    questionIds: ["1", "2", "4"],
    userId: "2",
    status: "completed",
    assignedAt: "2023-01-20T09:00:00Z",
  },
  {
    id: "2",
    questionIds: ["3", "6", "7"],
    userId: "2",
    status: "pending",
    assignedAt: "2023-02-22T11:30:00Z",
  },
  {
    id: "3",
    questionIds: ["5", "8"],
    userId: "2",
    status: "pending",
    assignedAt: "2023-03-05T14:15:00Z",
  },
];

export const userResponses: UserResponse[] = [
  {
    id: "1",
    assignmentId: "1",
    userId: "2",
    answers: [
      { questionId: "1", answer: "Satisfied" },
      { questionId: "2", answer: "The dashboard could be more intuitive." },
      { questionId: "4", answer: "Likely" },
    ],
    submittedAt: "2023-01-22T14:30:00Z",
  },
];
