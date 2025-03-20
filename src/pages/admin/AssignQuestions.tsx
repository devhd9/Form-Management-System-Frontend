import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { questions, users } from "../../data/mockData";
import { Question, User } from "../../types";

const AssignQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  // Get regular users (not admins)
  const regularUsers = users.filter((user) => user.role === "user");

  useEffect(() => {
    // Extract all unique categories
    const uniqueCategories = Array.from(
      new Set(questions.map((q) => q.category))
    );
    setCategories(uniqueCategories);
  }, []);

  useEffect(() => {
    let questionsList = [...questions];

    // Filter by category if selected
    if (selectedCategory) {
      questionsList = questionsList.filter(
        (q) => q.category === selectedCategory
      );
    }

    // Sort by category then by text
    questionsList.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.text.localeCompare(b.text);
    });

    setFilteredQuestions(questionsList);
  }, [selectedCategory]);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleCheckboxChange = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      // If all questions are already selected, deselect all
      setSelectedQuestions([]);
    } else {
      // Otherwise, select all filtered questions
      setSelectedQuestions(filteredQuestions.map((q) => q.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || selectedQuestions.length === 0) {
      alert("Please select a user and at least one question");
      return;
    }

    // In a real application, this would make an API call
    const newAssignment = {
      id: Date.now().toString(),
      questionIds: selectedQuestions,
      userId: selectedUser,
      status: "pending",
      assignedAt: new Date().toISOString(),
    };

    console.log("Assignment to be created:", newAssignment);

    // Show success message and redirect
    alert("Questions assigned successfully!");
    navigate("/admin/dashboard");
  };

  // Group questions by category for display
  const groupedQuestions: Record<string, Question[]> = {};
  filteredQuestions.forEach((question) => {
    if (!groupedQuestions[question.category]) {
      groupedQuestions[question.category] = [];
    }
    groupedQuestions[question.category].push(question);
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Assign Questions
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* User Selection */}
          <Card title="Select User">
            <div className="mb-4">
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign To
              </label>
              <select
                id="user"
                name="user"
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a user</option>
                {regularUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Question Selection */}
          <Card title="Select Questions">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Filter by Category
                </label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSelectAll}
                  variant={
                    selectedQuestions.length === filteredQuestions.length
                      ? "secondary"
                      : "primary"
                  }
                >
                  {selectedQuestions.length === filteredQuestions.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No questions available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Render by category if no category filter is applied */}
                  {!selectedCategory ? (
                    Object.entries(groupedQuestions).map(
                      ([category, categoryQuestions]) => (
                        <div key={category} className="space-y-2">
                          <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1">
                            {category}
                          </h3>
                          <ul className="space-y-2">
                            {categoryQuestions.map((question) => (
                              <li
                                key={question.id}
                                className="flex items-start"
                              >
                                <div className="flex items-center h-5 mt-1">
                                  <input
                                    id={`question-${question.id}`}
                                    name={`question-${question.id}`}
                                    type="checkbox"
                                    checked={selectedQuestions.includes(
                                      question.id
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(question.id)
                                    }
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  />
                                </div>
                                <label
                                  htmlFor={`question-${question.id}`}
                                  className="ml-3 text-sm text-gray-700"
                                >
                                  <div>{question.text}</div>
                                  <div className="mt-1 flex items-center">
                                    <span className="flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                      {question.type === "text"
                                        ? "Text"
                                        : question.type === "multiple_choice"
                                        ? "Multiple Choice"
                                        : "Checkbox"}
                                    </span>
                                    {question.options &&
                                      question.options.length > 0 && (
                                        <span className="ml-2 text-xs text-gray-500">
                                          {question.options.length} options
                                        </span>
                                      )}
                                  </div>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )
                  ) : (
                    // Flat list when category filter is applied
                    <ul className="space-y-2">
                      {filteredQuestions.map((question) => (
                        <li key={question.id} className="flex items-start">
                          <div className="flex items-center h-5 mt-1">
                            <input
                              id={`question-${question.id}`}
                              name={`question-${question.id}`}
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => handleCheckboxChange(question.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <label
                            htmlFor={`question-${question.id}`}
                            className="ml-3 text-sm text-gray-700"
                          >
                            <div>{question.text}</div>
                            <div className="mt-1 flex items-center">
                              <span className="flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                {question.type === "text"
                                  ? "Text"
                                  : question.type === "multiple_choice"
                                  ? "Multiple Choice"
                                  : "Checkbox"}
                              </span>
                              {question.options &&
                                question.options.length > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    {question.options.length} options
                                  </span>
                                )}
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Selected count */}
              <div className="mt-4 text-sm text-gray-700">
                {selectedQuestions.length}{" "}
                {selectedQuestions.length === 1 ? "question" : "questions"}{" "}
                selected
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedUser || selectedQuestions.length === 0}
            >
              Assign Questions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignQuestions;
