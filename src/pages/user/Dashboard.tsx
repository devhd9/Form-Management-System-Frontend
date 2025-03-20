import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { useAuth } from "../../context/AuthContext";
import {
  AssignmentStatus,
  UserFormQuestion,
} from "../../types/assignment.types";
import { getUserForms, submitFormResponse } from "../../services/formService";
import { UserFormResponseRequestPayload } from "../../types/response.types";

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [forms, setForms] = useState<UserFormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<
    "pending" | "completed"
  >("pending");

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUserForms(currentUser!.id);
        setForms(response.data);

        // Initialize answers structure with existing responses
        const initialAnswers: Record<string, string | string[]> = {};
        response.data.forEach((form) => {
          // For completed forms, prepopulate with existing answers if they exist
          if (
            form.status === AssignmentStatus.COMPLETED &&
            form.responses &&
            form.responses.length > 0
          ) {
            const response = form.responses[0];
            if (
              form.question.type === "checkbox" &&
              typeof response.answer === "string"
            ) {
              initialAnswers[form.id] = response.answer.split(",");
            } else {
              initialAnswers[form.id] = response.answer;
            }
          }
          // For pending forms, initialize with empty values
          else if (form.status !== AssignmentStatus.COMPLETED) {
            if (form.question.type === "checkbox") {
              initialAnswers[form.id] = [];
            } else {
              initialAnswers[form.id] = "";
            }
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load your questions"
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchForms();
    }
  }, [currentUser]);

  const handleTextChange = (formId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [formId]: value,
    }));
  };

  const handleMultipleChoiceChange = (formId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [formId]: value,
    }));
  };

  const handleCheckboxChange = (formId: string, value: string) => {
    setAnswers((prev) => {
      const currentValues = prev[formId] as string[];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [formId]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [formId]: [...currentValues, value],
        };
      }
    });
  };

  const handleSubmit = async (formId: string) => {
    try {
      setSubmitting((prev) => ({ ...prev, [formId]: true }));

      const answer = answers[formId];
      if (!answer) return;

      // Format answer for checkbox questions if needed
      let formattedAnswer: string;
      if (Array.isArray(answer)) {
        formattedAnswer = answer.join(",");
      } else {
        formattedAnswer = answer;
      }

      // Create the payload
      const payload: UserFormResponseRequestPayload = {
        assignmentId: formId,
        answer: formattedAnswer,
      };

      // Make the API call
      await submitFormResponse(payload);

      // Optimistically update the UI
      setForms((prev) =>
        prev.map((form) =>
          form.id === formId
            ? {
                ...form,
                status: AssignmentStatus.COMPLETED,
                completedAt: new Date().toISOString(),
              }
            : form
        )
      );
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit your answer"
      );
    } finally {
      setSubmitting((prev) => ({ ...prev, [formId]: false }));
    }
  };

  const handleSubmitAll = async () => {
    const pendingForms = forms.filter(
      (form) =>
        form.status === AssignmentStatus.IN_PROGRESS ||
        form.status === AssignmentStatus.ASSIGNED
    );

    // Check if all pending forms have answers
    const allFormsHaveAnswers = pendingForms.every((form) => {
      const answer = answers[form.id];
      if (!answer) return false;
      if (
        form.question.type === "text" &&
        (!answer || (answer as string).trim() === "")
      )
        return false;
      if (
        form.question.type === "checkbox" &&
        (!answer || (answer as string[]).length === 0)
      )
        return false;
      return true;
    });

    if (!allFormsHaveAnswers) {
      setError("Please answer all questions before submitting");
      return;
    }

    // Submit all pending forms
    for (const form of pendingForms) {
      if (!submitting[form.id]) {
        await handleSubmit(form.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-10 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center h-60">
            <div className="text-center">
              <Icon
                icon="FaSpinner"
                className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-4"
              />
              <p className="text-gray-600 text-lg">Loading your questions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingForms = forms.filter(
    (form) =>
      form.status === AssignmentStatus.IN_PROGRESS ||
      form.status === AssignmentStatus.ASSIGNED
  );
  const completedForms = forms.filter(
    (form) => form.status === AssignmentStatus.COMPLETED
  );

  // Calculate progress percentage
  const totalForms = forms.length;
  const completedCount = completedForms.length;
  const progressPercentage =
    totalForms > 0 ? Math.round((completedCount / totalForms) * 100) : 0;

  return (
    <div className="py-10 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-16 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="absolute -bottom-6 left-6">
              <div className="bg-white rounded-full p-2 shadow-md">
                <Icon
                  icon="FaClipboardList"
                  className="h-8 w-8 text-blue-600"
                />
              </div>
            </div>
          </div>
          <div className="pt-8 px-6 pb-6">
            <h1 className="text-2xl font-bold text-gray-800 mt-1 ml-12">
              My Questions Form
            </h1>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Your progress
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {progressPercentage}% complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <div className="flex items-center">
                  <Icon
                    icon="FaExclamationCircle"
                    className="mr-2 h-5 w-5 text-red-500"
                  />
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {pendingForms.length === 0 && completedForms.length === 0 ? (
          <Card className="bg-white shadow-sm mb-8">
            <div className="text-center py-16">
              <Icon
                icon="FaClipboardList"
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions assigned
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You don't have any questions assigned to you yet. Please check
                back later.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Pending Questions - Google Form Style */}
            {pendingForms.length > 0 && (
              <div className="space-y-6 mb-12">
                {pendingForms.map((form, index) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="p-6 border-l-4 border-blue-500">
                      <div className="mb-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {form.question.text}
                          </h3>
                        </div>
                      </div>

                      <div className="pl-9">
                        {form.question.type === "text" && (
                          <div>
                            <textarea
                              rows={3}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                              placeholder="Your answer"
                              value={(answers[form.id] as string) || ""}
                              onChange={(e) =>
                                handleTextChange(form.id, e.target.value)
                              }
                            />
                          </div>
                        )}

                        {form.question.type === "multiple_choice" &&
                          form.question.options && (
                            <div className="space-y-2">
                              {form.question.options.map((option, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center hover:bg-gray-50 p-2 rounded-md"
                                >
                                  <input
                                    id={`option-${form.id}-${idx}`}
                                    name={`options-${form.id}`}
                                    type="radio"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    checked={answers[form.id] === option}
                                    onChange={() =>
                                      handleMultipleChoiceChange(
                                        form.id,
                                        option
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`option-${form.id}-${idx}`}
                                    className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer w-full"
                                  >
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                        {form.question.type === "checkbox" &&
                          form.question.options && (
                            <div className="space-y-2">
                              {form.question.options.map((option, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center hover:bg-gray-50 p-2 rounded-md"
                                >
                                  <input
                                    id={`checkbox-${form.id}-${idx}`}
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    checked={(
                                      (answers[form.id] as string[]) || []
                                    ).includes(option)}
                                    onChange={() =>
                                      handleCheckboxChange(form.id, option)
                                    }
                                  />
                                  <label
                                    htmlFor={`checkbox-${form.id}-${idx}`}
                                    className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer w-full"
                                  >
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                        <div className="mt-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="shadow-sm hover:bg-blue-50"
                            onClick={() => handleSubmit(form.id)}
                            disabled={
                              submitting[form.id] ||
                              (form.question.type === "text" &&
                                (!answers[form.id] ||
                                  (answers[form.id] as string).trim() ===
                                    "")) ||
                              (form.question.type === "multiple_choice" &&
                                !answers[form.id]) ||
                              (form.question.type === "checkbox" &&
                                (!answers[form.id] ||
                                  (answers[form.id] as string[]).length === 0))
                            }
                          >
                            {submitting[form.id] ? (
                              <span className="flex items-center">
                                <Icon
                                  icon="FaSpinner"
                                  className="animate-spin mr-2 h-3 w-3"
                                />
                                Submitting...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Icon
                                  icon="FaPaperPlane"
                                  className="mr-1 h-3 w-3"
                                />
                                Submit
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Submit All Button */}
                {pendingForms.length > 1 && (
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-4 z-10">
                    <div className="max-w-3xl mx-auto flex justify-end">
                      <Button
                        onClick={handleSubmitAll}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <span className="flex items-center">
                          <Icon icon="FaPaperPlane" className="mr-2 h-4 w-4" />
                          Submit All Responses
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completed Questions Section */}
            {completedForms.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div
                  className="p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "completed" ? "pending" : "completed"
                    )
                  }
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Completed Questions
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      You've answered {completedForms.length} question
                      {completedForms.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Icon
                    icon={
                      expandedSection === "completed"
                        ? "FaChevronUp"
                        : "FaChevronDown"
                    }
                    className="h-5 w-5 text-gray-400"
                  />
                </div>

                {expandedSection === "completed" && (
                  <div className="divide-y divide-gray-100">
                    {completedForms.map((form, index) => (
                      <div
                        key={form.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex">
                          <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                              {form.question.text}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mb-3">
                              <span className="mr-3">
                                <Icon
                                  icon="FaCalendarAlt"
                                  className="inline mr-1 h-3 w-3"
                                />
                                {form.completedAt
                                  ? new Date(
                                      form.completedAt
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Completed
                              </span>
                            </div>

                            {/* Display the answer based on question type */}
                            <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
                                Your Answer:
                              </p>

                              {form.responses && form.responses.length > 0 && (
                                <>
                                  {form.question.type === "text" && (
                                    <p className="text-gray-800">
                                      {form.responses[0].answer}
                                    </p>
                                  )}

                                  {form.question.type === "multiple_choice" && (
                                    <div className="flex items-center">
                                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                      <p className="text-gray-800">
                                        {form.responses[0].answer}
                                      </p>
                                    </div>
                                  )}

                                  {form.question.type === "checkbox" &&
                                    form.responses[0].answer && (
                                      <div className="space-y-1">
                                        {typeof form.responses[0].answer ===
                                          "string" &&
                                          form.responses[0].answer
                                            .split(",")
                                            .map(
                                              (option: string, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center"
                                                >
                                                  <div className="h-3 w-3 rounded-sm bg-blue-500 mr-2"></div>
                                                  <p className="text-gray-800">
                                                    {option.trim()}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                      </div>
                                    )}
                                </>
                              )}

                              {(!form.responses ||
                                form.responses.length === 0) && (
                                <p className="text-gray-500 italic">
                                  Response data not available
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
