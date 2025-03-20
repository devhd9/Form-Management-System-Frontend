import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Icon from "../../components/Icon";
import { Question } from "../../types";
import {
  getQuestions,
  getCategories,
  deleteQuestion,
} from "../../services/questionService";

const QuestionList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
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

  // Fetch questions when filters change
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getQuestions();
        setQuestions(response.result);
      } catch (err) {
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSearchParams(category ? { category } : {});
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      setError("Failed to delete question");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    searchTerm
      ? q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage Questions
          </h1>
          <Link to="/admin/questions/create">
            <Button>Create New Question</Button>
          </Link>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700"
              >
                Search Questions
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="FaSearch" className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by question text or category"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="mt-6">
          {filteredQuestions.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Icon
                  icon="FaQuestionCircle"
                  className="mx-auto h-12 w-12 text-gray-400"
                />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No questions found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCategory
                    ? `No questions found in the ${selectedCategory} category.`
                    : "No questions match your search criteria."}
                </p>
                <div className="mt-6">
                  <Link to="/admin/questions/create">
                    <Button>Create New Question</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <li key={question.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {question.text}
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {question.category}
                            </span>
                            <span className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                              {question.type === "text"
                                ? "Text"
                                : question.type === "multiple_choice"
                                ? "Multiple Choice"
                                : "Checkbox"}
                            </span>
                          </div>
                        </div>
                        <div className="flex">
                          <Link
                            to={`/admin/questions/${question.id}/edit`}
                            className="ml-4 text-blue-600 hover:text-blue-900"
                          >
                            <Icon icon="FaEdit" className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            <Icon icon="FaTrashAlt" className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Icon
                              icon="FaRegClock"
                              className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                            />
                            Created{" "}
                            {new Date(question.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p className="text-sm text-gray-500">
                              {question.options.length} options
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
