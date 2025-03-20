import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { questionAssignments, questions } from "../../data/mockData";
import { Question } from "../../types";

const AssignmentFill: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Find the assignment
  const assignment = questionAssignments.find((a) => a.id === assignmentId);

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

  // Initialize formik
  const formik = useFormik({
    initialValues: assignedQuestions.reduce((acc, question) => {
      if (question.type === "checkbox") {
        acc[question.id] = [];
      } else {
        acc[question.id] = "";
      }
      return acc;
    }, {} as Record<string, string | string[]>),

    validationSchema: Yup.object().shape(
      assignedQuestions.reduce((acc, question) => {
        if (question.type === "checkbox") {
          acc[question.id] = Yup.array().min(
            1,
            "Please select at least one option"
          );
        } else {
          acc[question.id] = Yup.string().required("This field is required");
        }
        return acc;
      }, {} as Record<string, any>)
    ),

    onSubmit: (values: Record<string, string | string[]>) => {
      // Convert values to the format we want to send
      const formattedAnswers = Object.entries(values).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      console.log("Submission:", formattedAnswers);

      // In a real app, you would make an API call here
      // to save the user's responses

      // Redirect to the dashboard
      navigate("/user/dashboard");
    },
  });

  const handleCheckboxChange = (questionId: string, value: string) => {
    const currentValues = formik.values[questionId] as string[];
    if (currentValues.includes(value)) {
      formik.setFieldValue(
        questionId,
        currentValues.filter((v) => v !== value)
      );
    } else {
      formik.setFieldValue(questionId, [...currentValues, value]);
    }
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

  // If the assignment is already completed, redirect
  if (assignment.status === "completed") {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-8">
              <h2 className="text-xl font-medium text-blue-600">
                Assignment Already Submitted
              </h2>
              <p className="mt-2 text-gray-600">
                You have already completed this assignment.
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card title={`Assignment #${assignment.id}`}>
          <p className="text-gray-600 mb-6">
            Please answer all the questions below.
          </p>

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-10">
              {/* Render questions grouped by category */}
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
                            {question.type === "text" && (
                              <div>
                                <textarea
                                  id={question.id}
                                  name={question.id}
                                  value={formik.values[question.id] as string}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  rows={4}
                                  className={`w-full px-3 py-2 border ${
                                    formik.touched[question.id] &&
                                    formik.errors[question.id]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                  placeholder="Write your answer here..."
                                />
                                {formik.touched[question.id] &&
                                  formik.errors[question.id] && (
                                    <p className="mt-1 text-sm text-red-600">
                                      {formik.errors[question.id] as string}
                                    </p>
                                  )}
                              </div>
                            )}

                            {question.type === "multiple_choice" &&
                              question.options && (
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="radio"
                                        id={`${question.id}-${optIndex}`}
                                        name={question.id}
                                        value={option}
                                        checked={
                                          (formik.values[
                                            question.id
                                          ] as string) === option
                                        }
                                        onChange={formik.handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                      />
                                      <label
                                        htmlFor={`${question.id}-${optIndex}`}
                                        className="ml-3 block text-sm text-gray-700"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                                  {formik.touched[question.id] &&
                                    formik.errors[question.id] && (
                                      <p className="mt-1 text-sm text-red-600">
                                        {formik.errors[question.id] as string}
                                      </p>
                                    )}
                                </div>
                              )}

                            {question.type === "checkbox" &&
                              question.options && (
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`${question.id}-${optIndex}`}
                                        name={`${question.id}`}
                                        value={option}
                                        checked={(
                                          formik.values[question.id] as string[]
                                        ).includes(option)}
                                        onChange={() =>
                                          handleCheckboxChange(
                                            question.id,
                                            option
                                          )
                                        }
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <label
                                        htmlFor={`${question.id}-${optIndex}`}
                                        className="ml-3 block text-sm text-gray-700"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                                  {formik.touched[question.id] &&
                                    formik.errors[question.id] && (
                                      <p className="mt-1 text-sm text-red-600">
                                        {formik.errors[question.id] as string}
                                      </p>
                                    )}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/user/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Answers</Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentFill;
