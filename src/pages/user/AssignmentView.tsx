import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  questionAssignments,
  questions,
  userResponses,
} from "../../data/mockData";
import { Question } from "../../types";

const AssignmentView: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Find the assignment
  const assignment = questionAssignments.find((a) => a.id === assignmentId);

  // Find the user's response for this assignment
  const response = userResponses.find((r) => r.assignmentId === assignmentId);

  // Get all questions for this assignment
  const assignedQuestions = assignment
    ? questions.filter((q) => assignment.questionIds.includes(q.id))
    : [];

  // Group questions by category for better organization
  const groupQuestionsByCategory = (questions: Question[]) => {
    const result: Record<string, Question[]> = {};

    questions.forEach((question) => {
      if (!result[question.category]) {
        result[question.category] = [];
      }
      result[question.category].push(question);
    });

    return result;
  };

  const groupedQuestions = groupQuestionsByCategory(assignedQuestions);

  // Find the answer for a specific question
  const getAnswer = (questionId: string) => {
    if (!response) return null;
    const answer = response.answers.find(
      (a) => a.questionId === questionId
    )?.answer;
    return answer !== undefined ? answer : null;
  };

  // Format the answer for display
  const formatAnswer = (answer: string | string[] | null) => {
    if (answer === null) return "No answer provided";
    if (Array.isArray(answer)) return answer.join(", ");
    return answer;
  };

  // Handle the case where the assignment doesn't exist
  if (!assignment) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-8">
              <h2 className="text-xl font-medium text-red-600">
                Assignment Not Found
              </h2>
              <p className="mt-2 text-gray-600">
                The assignment you're looking for doesn't exist or you don't
                have permission to access it.
              </p>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/user/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Handle the case where the assignment is not completed
  if (assignment.status !== "completed") {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-8">
              <h2 className="text-xl font-medium text-amber-600">
                Assignment Not Completed
              </h2>
              <p className="mt-2 text-gray-600">
                This assignment has not been completed yet.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => navigate(`/user/assignments/${assignmentId}`)}
                >
                  Complete Assignment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card title={`Assignment #${assignment.id}`}>
          <p className="text-gray-600 mb-2">Your submitted answers</p>
          {response && (
            <p className="text-sm text-gray-500 mb-6">
              Submitted on {new Date(response.submittedAt).toLocaleString()}
            </p>
          )}

          <div className="space-y-10">
            {/* Render questions and answers grouped by category */}
            {Object.entries(groupedQuestions).map(
              ([category, categoryQuestions]) => (
                <div key={category} className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    {category}
                  </h2>

                  <div className="space-y-8">
                    {categoryQuestions.map((question, questionIndex) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          {questionIndex + 1}. {question.text}
                        </h3>

                        <div className="mt-4">
                          <div className="bg-white p-3 border border-gray-200 rounded">
                            <p className="text-sm text-gray-500 mb-1">
                              Your Answer:
                            </p>
                            <p className="text-gray-900">
                              {formatAnswer(getAnswer(question.id))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => navigate("/user/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentView;
