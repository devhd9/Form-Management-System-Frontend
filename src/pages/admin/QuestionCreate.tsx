import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Icon from "../../components/Icon";
import { Question } from "../../types";
import { createQuestion, getCategories } from "../../services/questionService";

const QuestionCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [question, setQuestion] = useState<
    Omit<Question, "id" | "createdAt" | "createdBy">
  >({
    text: "",
    type: "text",
    options: [],
    category: "",
  });

  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleQuestionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setQuestion({
      ...question,
      [name]: value,
    });
  };

  const handleAddOption = () => {
    if (newOption.trim() && question.options) {
      setQuestion({
        ...question,
        options: [...question.options, newOption],
      });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (question.options) {
      setQuestion({
        ...question,
        options: question.options.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.text || !question.category) {
      setError("Question text and category are required");
      return;
    }

    if (
      (question.type === "multiple_choice" || question.type === "checkbox") &&
      (!question.options || question.options.length < 2)
    ) {
      setError("Please add at least two options");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createQuestion(question);
      navigate("/admin/questions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Question
          </h1>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          <Card title="Question Details">
            <div className="mb-4">
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Text
              </label>
              <textarea
                id="text"
                name="text"
                value={question.text}
                onChange={handleQuestionChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter your question here"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <input
                id="category"
                name="category"
                value={question.category}
                onChange={handleQuestionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., Feedback, Usage, Demographics"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="mb-4">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Type
              </label>
              <select
                id="type"
                name="type"
                value={question.type}
                onChange={handleQuestionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="text">Text (Free Response)</option>
                <option value="multiple_choice">
                  Multiple Choice (Single Selection)
                </option>
                <option value="checkbox">Checkbox (Multiple Selection)</option>
              </select>
            </div>

            {(question.type === "multiple_choice" ||
              question.type === "checkbox") && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>

                <div className="flex mb-3">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add an option"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none flex items-center"
                  >
                    <Icon icon="FaPlus" className="mr-1" /> Add
                  </button>
                </div>

                {question.options && question.options.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {question.options.map((option, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
                      >
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon icon="FaTrashAlt" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No options added yet. Add at least two options.
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/questions")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                question.text.trim() === "" ||
                question.category.trim() === "" ||
                ((question.type === "multiple_choice" ||
                  question.type === "checkbox") &&
                  (!question.options || question.options.length < 2))
              }
            >
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionCreate;
