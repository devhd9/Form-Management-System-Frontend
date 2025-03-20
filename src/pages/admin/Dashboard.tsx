import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import { Question, CreateQuestionData, QuestionType, User } from "../../types";
import {
  getQuestions,
  getCategories,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/questionService";
import { getUsers } from "../../services/authService";
import { assignQuestionToUser } from "../../services/assignmentService";
import { getUserForms } from "../../services/formService";
import { AssignmentStatus } from "../../types/assignment.types";

interface QuestionFormProps {
  question: CreateQuestionData;
  categories: string[];
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (question: CreateQuestionData) => void;
  submitLabel: string;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  categories,
  onSubmit,
  onCancel,
  onChange,
  submitLabel,
}) => {
  const [newOption, setNewOption] = useState("");

  const handleQuestionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    onChange({
      ...question,
      [name]: value,
    });
  };

  const handleAddOption = () => {
    if (newOption.trim() && question.options) {
      onChange({
        ...question,
        options: [...question.options, newOption],
      });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (question.options) {
      onChange({
        ...question,
        options: question.options.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
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

      <div>
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

      <div>
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
        <div className="p-4 bg-gray-50 rounded-md">
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

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            question.text.trim() === "" ||
            question.category.trim() === "" ||
            ((question.type === "multiple_choice" ||
              question.type === "checkbox") &&
              (!question.options || question.options.length < 2))
          }
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

// Define interfaces for tracking assignments and responses
interface QuestionAssignment {
  questionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: AssignmentStatus;
  // Add response data
  responseData?: {
    answer: string | string[];
    submittedAt?: string | null;
  };
}

interface CategoryProgress {
  category: string;
  totalAssigned: number;
  totalCompleted: number;
}

const AdminDashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionData>({
    text: "",
    type: "text",
    options: [],
    category: "",
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [newOption, setNewOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [questionsByCategory, setQuestionsByCategory] = useState<
    { category: string; questions: Question[] }[]
  >([]);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  // New state for tracking assignments and progress
  const [questionUserAssignments, setQuestionUserAssignments] = useState<
    Record<string, QuestionAssignment[]>
  >({});
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>(
    []
  );
  const [globalProgress, setGlobalProgress] = useState({
    totalAssigned: 0,
    totalCompleted: 0,
  });

  // Add a new state variable for active tab
  const [activeTab, setActiveTab] = useState<"assign" | "report">("assign");

  // Add state for export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
    "pdf"
  );
  const [exportLoading, setExportLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all questions
      const questionsResponse = await getQuestions();
      setQuestions(questionsResponse.result);
      // Fetch categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      // Group questions by category
      const groupedQuestions = categoriesData.map((category) => ({
        category,
        questions: questionsResponse.result.filter(
          (q) => q.category === category
        ),
      }));
      setQuestionsByCategory(groupedQuestions);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignments for all users to track which questions are assigned
  const fetchAssignmentsData = async () => {
    try {
      // Reset counters
      let totalAssigned = 0;
      let totalCompleted = 0;
      const categoryProgressData: Record<
        string,
        { totalAssigned: number; totalCompleted: number }
      > = {};
      const assignments: Record<string, QuestionAssignment[]> = {};

      // Fetch assignment data for each user
      for (const user of users) {
        const response = await getUserForms(user.id);

        response.data.forEach((assignment) => {
          const qId = assignment.question.id;

          // Create the assignment record with response data
          const assignmentRecord = {
            questionId: qId,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            status: assignment.status,
            // Add response data if available
            responseData:
              assignment.status === AssignmentStatus.COMPLETED &&
              assignment.responses &&
              assignment.responses.length > 0
                ? {
                    answer: assignment.responses[0].answer,
                    submittedAt: assignment.completedAt,
                  }
                : undefined,
          };

          // Add to the assignments collection
          if (!assignments[qId]) {
            assignments[qId] = [];
          }
          assignments[qId].push(assignmentRecord);

          // Update category progress
          const category = assignment.question.category;
          if (!categoryProgressData[category]) {
            categoryProgressData[category] = {
              totalAssigned: 0,
              totalCompleted: 0,
            };
          }

          categoryProgressData[category].totalAssigned++;
          totalAssigned++;

          if (assignment.status === AssignmentStatus.COMPLETED) {
            categoryProgressData[category].totalCompleted++;
            totalCompleted++;
          }
        });
      }

      // Update state with assignment data
      setQuestionUserAssignments(assignments);

      // Update category progress
      setCategoryProgress(
        Object.entries(categoryProgressData).map(([category, data]) => ({
          category,
          ...data,
        }))
      );

      // Update global progress
      setGlobalProgress({ totalAssigned, totalCompleted });
    } catch (err) {
      console.error("Error fetching assignments data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  // Fetch assignments once we have users and questions loaded
  useEffect(() => {
    if (users.length > 0 && questions.length > 0) {
      fetchAssignmentsData();
    }
  }, [users, questions]);

  const handleCreateQuestion = async () => {
    try {
      setError(null);
      await createQuestion(currentQuestion);

      // Reset form and close modal
      setCurrentQuestion({
        text: "",
        type: "text",
        options: [],
        category: "",
      });
      setIsCreateModalOpen(false);

      // Refresh the questions list
      await fetchDashboardData();
    } catch (err) {
      console.error("Error creating question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion({
      text: question.text,
      type: question.type as QuestionType,
      options: question.options || [],
      category: question.category,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestionId) return;

    try {
      setError(null);
      await updateQuestion(editingQuestionId, currentQuestion);

      // Reset form and close modal
      setCurrentQuestion({
        text: "",
        type: "text",
        options: [],
        category: "",
      });
      setIsEditModalOpen(false);
      setEditingQuestionId(null);

      // Refresh the questions list
      await fetchDashboardData();
    } catch (err) {
      console.error("Error updating question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update question"
      );
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    // Check if the question is assigned
    const existingAssignments = questionUserAssignments[questionId] || [];

    let confirmMessage = "Are you sure you want to delete this question?";
    if (existingAssignments.length > 0) {
      const userNames = existingAssignments.map((a) => a.userName).join(", ");
      confirmMessage = `This question is currently assigned to ${existingAssignments.length} user(s): ${userNames}. Deleting it will also remove all assignments. Continue?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setError(null);
      await deleteQuestion(questionId);

      // Refresh the questions list
      await fetchDashboardData();
      // Refresh assignments data after deleting a question
      fetchAssignmentsData();
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
    }
  };

  const handleAssignQuestion = (questionId: string) => {
    // We're setting the selectedQuestionId regardless
    setSelectedQuestionId(questionId);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedUserId || !selectedQuestionId) return;

    // Check if this user already has this question assigned
    const questionAssignments =
      questionUserAssignments[selectedQuestionId] || [];
    const alreadyAssignedToUser = questionAssignments.some(
      (assignment) => assignment.userId === selectedUserId
    );

    if (alreadyAssignedToUser) {
      window.alert("This question is already assigned to this user");
      return;
    }

    try {
      setError(null);
      await assignQuestionToUser({
        userId: selectedUserId,
        questionId: selectedQuestionId,
      });
      setIsAssignModalOpen(false);
      setSelectedUserId("");
      setSelectedQuestionId("");

      // Refresh assignments data after assigning a question
      fetchAssignmentsData();
    } catch (err) {
      console.error("Error assigning question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to assign question"
      );
    }
  };

  // Helper function to get the progress percentage
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 100; // Return 100% when no questions are assigned
    return Math.round((completed / total) * 100);
  };

  // Helper function to get assignment data for a question
  const getQuestionAssignments = (questionId: string) => {
    return questionUserAssignments[questionId] || [];
  };

  // Helper function to get progress for a category
  const getCategoryProgress = (category: string) => {
    const progress = categoryProgress.find((p) => p.category === category);
    if (!progress) return { totalAssigned: 0, totalCompleted: 0 };
    return progress;
  };

  // Helper function to check if a question is already assigned to a specific user
  const isQuestionAssignedToUser = (questionId: string, userId: string) => {
    const assignments = questionUserAssignments[questionId] || [];
    return assignments.some((assignment) => assignment.userId === userId);
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Function to prepare data for export
  const prepareExportData = () => {
    const exportData: any[] = [];

    // Process each user with assignments
    users.forEach((user) => {
      const userAssignments: {
        assignment: QuestionAssignment;
        question: Question;
      }[] = [];

      // Collect all assignments for this user
      Object.entries(questionUserAssignments).forEach(
        ([questionId, assignments]) => {
          const userAssignment = assignments.find((a) => a.userId === user.id);
          if (userAssignment) {
            const question = questions.find((q) => q.id === questionId);
            if (question) {
              userAssignments.push({
                assignment: userAssignment,
                question,
              });
            }
          }
        }
      );

      // Skip users with no assignments
      if (userAssignments.length === 0) return;

      userAssignments.forEach(({ assignment, question }) => {
        exportData.push({
          userName: user.name,
          userEmail: user.email,
          questionText: question.text,
          questionCategory: question.category,
          questionType: question.type,
          status: assignment.status,
          answer:
            assignment.status === AssignmentStatus.COMPLETED &&
            assignment.responseData
              ? typeof assignment.responseData.answer === "string"
                ? assignment.responseData.answer
                : assignment.responseData.answer.join(", ")
              : "Not answered",
          submittedAt: assignment.responseData?.submittedAt
            ? formatDate(assignment.responseData.submittedAt)
            : "N/A",
        });
      });
    });

    return exportData;
  };

  // Function to export CSV
  const exportToCSV = (data: any[]) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Convert data to CSV rows
    const csvRows = [
      // Headers row
      headers.join(","),
      // Data rows
      ...data.map((row) =>
        headers
          .map((header) => {
            // Escape commas and quotes in data
            const cell = row[header]?.toString() || "";
            return `"${cell.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    // Combine rows into a CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `assignment_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export Excel (actually CSV with Excel extension)
  const exportToExcel = (data: any[]) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Convert data to CSV rows
    const csvRows = [
      // Headers row
      headers.join(","),
      // Data rows
      ...data.map((row) =>
        headers
          .map((header) => {
            // Escape commas and quotes in data
            const cell = row[header]?.toString() || "";
            return `"${cell.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    // Combine rows into a CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob and trigger a download
    const blob = new Blob([csvString], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `assignment_report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export PDF (we'll use browser print for simplicity)
  const exportToPDF = () => {
    const data = prepareExportData();
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Create a new window for the PDF content
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to generate PDF");
      return;
    }

    // Get current date for the report header
    const currentDate = new Date().toLocaleDateString();

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assignment Report - ${currentDate}</title>
          <style>
            /* Reset CSS */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            /* Page settings */
            @page {
              size: auto;
              margin: 10mm;
            }
            
            /* Base styles */
            html, body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #333;
              line-height: 1.4;
              background: #fff;
            }
            
            /* Main container */
            .container {
              max-width: 100%;
              margin: 0;
              padding: 0;
              position: relative;
            }
            
            /* Header */
            .report-header {
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 1px solid #eaeaea;
              margin-bottom: 15px;
            }
            
            .report-title {
              color: #2563eb;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            
            .report-meta {
              text-align: right;
              font-size: 10px;
              color: #666;
              margin-bottom: 15px;
            }
            
            /* User sections */
            .user-section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .user-header {
              background-color: #f3f4f6;
              padding: 8px 10px;
              border-radius: 4px;
              margin-bottom: 10px;
              border-left: 4px solid #2563eb;
            }
            
            .user-name {
              font-size: 14px;
              font-weight: bold;
              margin: 0;
            }
            
            .user-email {
              font-size: 12px;
              color: #666;
              margin: 2px 0 0 0;
            }
            
            /* Questions */
            .question-card {
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 10px;
              background-color: white;
              page-break-inside: avoid;
            }
            
            .question-text {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 12px;
            }
            
            .question-meta {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            
            /* Answer section */
            .answer-section {
              background-color: #f9fafb;
              border-radius: 4px;
              padding: 8px 10px;
              margin-top: 8px;
            }
            
            .answer-header {
              font-size: 10px;
              text-transform: uppercase;
              color: #666;
              margin-bottom: 4px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 2px;
            }
            
            .answer-text {
              margin: 4px 0;
              font-size: 11px;
            }
            
            .answer-option {
              display: flex;
              align-items: center;
              margin: 4px 0;
              font-size: 11px;
            }
            
            .answer-bullet {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: #2563eb;
              margin-right: 6px;
              flex-shrink: 0;
            }
            
            .answer-checkbox {
              width: 6px;
              height: 6px;
              background-color: #2563eb;
              margin-right: 6px;
              flex-shrink: 0;
            }
            
            /* Status tags */
            .status-tag {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: bold;
              margin-left: 5px;
            }
            
            .status-completed {
              background-color: #dcfce7;
              color: #166534;
            }
            
            .status-assigned {
              background-color: #fef9c3;
              color: #854d0e;
            }
            
            .submitted-date {
              font-size: 9px;
              color: #666;
              margin-top: 6px;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                width: 100%;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .user-section {
                page-break-inside: avoid;
              }
              
              .user-section + .user-section {
                page-break-before: always;
              }
              
              .question-card {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="report-header">
              <div class="report-title">Question Assignments Report</div>
              <div class="report-meta">Generated on: ${currentDate}</div>
            </div>
    `;

    // Group data by user
    const userGroups: Record<string, typeof data> = {};
    data.forEach((item) => {
      if (!userGroups[item.userName]) {
        userGroups[item.userName] = [];
      }
      userGroups[item.userName].push(item);
    });

    // Generate content for each user
    let userSectionsHTML = "";

    // Convert user groups to array and sort by user name for consistency
    const sortedUsers = Object.entries(userGroups).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    sortedUsers.forEach(([userName, userItems], userIndex) => {
      const userEmail = userItems[0].userEmail;

      // Start user section - don't add page break class to first user section
      userSectionsHTML += `
        <div class="user-section">
          <div class="user-header">
            <p class="user-name">${userName}</p>
            <p class="user-email">${userEmail}</p>
          </div>
      `;

      // Generate content for each question - sort by category then question text
      const sortedItems = [...userItems].sort((a, b) => {
        if (a.questionCategory !== b.questionCategory) {
          return a.questionCategory.localeCompare(b.questionCategory);
        }
        return a.questionText.localeCompare(b.questionText);
      });

      sortedItems.forEach((item) => {
        const statusClass =
          item.status === AssignmentStatus.COMPLETED
            ? "status-completed"
            : "status-assigned";
        const statusText =
          item.status === AssignmentStatus.COMPLETED ? "Completed" : "Assigned";

        userSectionsHTML += `
          <div class="question-card">
            <p class="question-text">${item.questionText}</p>
            <p class="question-meta">
              Category: ${item.questionCategory} | Type: ${item.questionType}
              <span class="status-tag ${statusClass}">${statusText}</span>
            </p>
        `;

        // Only add answer section if completed
        if (
          item.status === AssignmentStatus.COMPLETED &&
          item.answer !== "Not answered"
        ) {
          userSectionsHTML += `
            <div class="answer-section">
              <p class="answer-header">${userName}'s Answer:</p>
          `;

          // Format answer based on question type
          if (item.questionType === "text") {
            userSectionsHTML += `<p class="answer-text">${item.answer}</p>`;
          } else if (item.questionType === "multiple_choice") {
            userSectionsHTML += `
              <div class="answer-option">
                <div class="answer-bullet"></div>
                <span>${item.answer}</span>
              </div>
            `;
          } else if (item.questionType === "checkbox") {
            const options = item.answer.split(", ");
            options.forEach((option: string) => {
              userSectionsHTML += `
                <div class="answer-option">
                  <div class="answer-checkbox"></div>
                  <span>${option}</span>
                </div>
              `;
            });
          }

          // Add submission date if available
          if (item.submittedAt && item.submittedAt !== "N/A") {
            userSectionsHTML += `<p class="submitted-date">Submitted on ${item.submittedAt}</p>`;
          }

          userSectionsHTML += `</div>`;
        }

        userSectionsHTML += `</div>`;
      });

      userSectionsHTML += `</div>`;
    });

    // Complete the HTML document
    const fullHTML =
      htmlContent +
      userSectionsHTML +
      `
          </div>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();

    // Add event listener to remove header/footer from print dialog if possible
    printWindow.onbeforeprint = function () {
      // Some browsers support this CSS to hide default headers/footers
      const style = printWindow.document.createElement("style");
      style.innerHTML = `
        @page {
          margin: 10mm;
          size: auto;
        }
      `;
      printWindow.document.head.appendChild(style);
    };

    // Set focus to the new window
    printWindow.focus();

    // Add a delay to ensure full rendering before printing
    setTimeout(() => {
      printWindow.print();
      // Keep the window open so the user can save as PDF
    }, 1000);
  };

  // Function to handle export based on format
  const handleExport = () => {
    setExportLoading(true);

    try {
      const data = prepareExportData();

      switch (exportFormat) {
        case "pdf":
          exportToPDF();
          break;
        case "excel":
          exportToExcel(data);
          break;
        case "csv":
          exportToCSV(data);
          break;
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("An error occurred while exporting data");
    } finally {
      setExportLoading(false);
      setIsExportModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New Question
          </Button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6">
          <Card>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Global Assignment Progress
            </h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {globalProgress.totalAssigned === 0
                  ? "No questions assigned yet"
                  : `${globalProgress.totalCompleted} of ${globalProgress.totalAssigned} assigned questions completed`}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {getProgressPercentage(
                  globalProgress.totalCompleted,
                  globalProgress.totalAssigned
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    globalProgress.totalCompleted,
                    globalProgress.totalAssigned
                  )}%`,
                }}
              ></div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600 bg-opacity-30">
                <Icon icon="FaQuestionCircle" className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Total Questions</p>
                <p className="text-2xl font-semibold">{questions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-600 bg-opacity-30">
                <Icon icon="FaUserCheck" className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Assigned Questions</p>
                <p className="text-2xl font-semibold">
                  {globalProgress.totalAssigned}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600 bg-opacity-30">
                <Icon icon="FaCheck" className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Completed Assignments</p>
                <p className="text-2xl font-semibold">
                  {globalProgress.totalCompleted}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("assign")}
              className={`${
                activeTab === "assign"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Assign Questions
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`${
                activeTab === "report"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              View Report
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "assign" ? (
          /* Questions by Category - Assign Tab */
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800">
              Questions by Category
            </h2>
            <div className="mt-4 grid gap-5 grid-cols-1 lg:grid-cols-2">
              {questionsByCategory.map(({ category, questions }) => {
                const progress = getCategoryProgress(category);
                const progressPercentage = getProgressPercentage(
                  progress.totalCompleted,
                  progress.totalAssigned
                );

                return (
                  <Card key={category} title={category}>
                    <div className="space-y-4">
                      <div>
                        {/* Category Progress Bar */}
                        {progress.totalAssigned > 0 ? (
                          <>
                            <div className="flex justify-between items-center text-sm mb-1">
                              <span className="font-medium text-gray-700">
                                {progress.totalCompleted} of{" "}
                                {progress.totalAssigned} completed
                              </span>
                              <span className="font-medium text-blue-600">
                                {progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500 mb-3">
                            No questions assigned yet in this category
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {questions.length} questions
                          </p>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {questions.map((question) => {
                          const assignments = getQuestionAssignments(
                            question.id
                          );

                          return (
                            <div key={question.id} className="py-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {question.text}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                                    {question.type}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleAssignQuestion(question.id)
                                    }
                                    className="text-green-600 hover:text-green-800"
                                    title="Assign to User"
                                  >
                                    <Icon icon="FaUserPlus" />
                                  </button>
                                  <button
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Icon icon="FaEdit" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteQuestion(question.id)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Icon icon="FaTrashAlt" />
                                  </button>
                                </div>
                              </div>
                              {question.options &&
                                question.options.length > 0 && (
                                  <div className="mt-1">
                                    <p className="text-xs text-gray-500">
                                      Options: {question.options.join(", ")}
                                    </p>
                                  </div>
                                )}

                              {/* Assignment Status */}
                              {assignments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {assignments.map((assignment, idx) => (
                                    <div key={idx} className="flex gap-1">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                          assignment.status ===
                                          AssignmentStatus.COMPLETED
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        <Icon
                                          icon={
                                            assignment.status ===
                                            AssignmentStatus.COMPLETED
                                              ? "FaCheck"
                                              : "FaClock"
                                          }
                                          className="mr-1 h-3 w-3"
                                        />
                                        {assignment.status ===
                                        AssignmentStatus.COMPLETED
                                          ? "Completed"
                                          : "Assigned"}
                                      </span>

                                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        <Icon
                                          icon="FaUser"
                                          className="mr-1 h-3 w-3"
                                        />
                                        {assignment.userName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* Assignments by User - Report Tab */
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                User Assignments Report
              </h2>

              {/* Add Export Button */}
              <Button
                variant="secondary"
                onClick={() => setIsExportModalOpen(true)}
                disabled={Object.keys(questionUserAssignments).length === 0}
              >
                <Icon icon="FaDownload" className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            <div className="mt-4 space-y-6">
              {users.length > 0 ? (
                users
                  .map((user) => {
                    // Get all assignments for this user
                    const userAssignments: {
                      assignment: QuestionAssignment;
                      question: Question;
                    }[] = [];

                    // Collect all assignments for this user
                    Object.entries(questionUserAssignments).forEach(
                      ([questionId, assignments]) => {
                        const userAssignment = assignments.find(
                          (a) => a.userId === user.id
                        );
                        if (userAssignment) {
                          const question = questions.find(
                            (q) => q.id === questionId
                          );
                          if (question) {
                            userAssignments.push({
                              assignment: userAssignment,
                              question,
                            });
                          }
                        }
                      }
                    );

                    if (userAssignments.length === 0) {
                      return null; // Skip users with no assignments
                    }

                    // Count completed assignments
                    const completedCount = userAssignments.filter(
                      (ua) =>
                        ua.assignment.status === AssignmentStatus.COMPLETED
                    ).length;

                    // Calculate progress
                    const progressPercentage = getProgressPercentage(
                      completedCount,
                      userAssignments.length
                    );

                    return (
                      <Card
                        key={user.id}
                        title={`${user.name} (${user.email})`}
                      >
                        <div className="space-y-4">
                          {/* User Progress Bar */}
                          <div>
                            <div className="flex justify-between items-center text-sm mb-1">
                              <span className="font-medium text-gray-700">
                                {completedCount} of {userAssignments.length}{" "}
                                completed
                              </span>
                              <span className="font-medium text-blue-600">
                                {progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* User's Assignments */}
                          <div className="divide-y divide-gray-200">
                            {userAssignments.map(
                              ({ assignment, question }, idx) => (
                                <div key={idx} className="py-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {question.text}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Category: {question.category} | Type:{" "}
                                        {question.type}
                                      </p>

                                      {/* Add answer display */}
                                      {assignment.status ===
                                        AssignmentStatus.COMPLETED &&
                                        assignment.responseData && (
                                          <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between mb-1">
                                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                                {assignment.userName}'s Answer:
                                              </p>
                                            </div>

                                            {question.type === "text" && (
                                              <p className="text-gray-800">
                                                {assignment.responseData.answer}
                                              </p>
                                            )}

                                            {question.type ===
                                              "multiple_choice" && (
                                              <div className="flex items-center">
                                                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                                <p className="text-gray-800">
                                                  {
                                                    assignment.responseData
                                                      .answer
                                                  }
                                                </p>
                                              </div>
                                            )}

                                            {question.type === "checkbox" && (
                                              <div className="space-y-1">
                                                {typeof assignment.responseData
                                                  .answer === "string" &&
                                                  assignment.responseData.answer
                                                    .split(",")
                                                    .map(
                                                      (
                                                        option: string,
                                                        idx: number
                                                      ) => (
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
                                            {assignment.responseData
                                              .submittedAt && (
                                              <p className="text-xs text-gray-500">
                                                Submitted on{" "}
                                                {new Date(
                                                  assignment.responseData.submittedAt
                                                ).toLocaleDateString()}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                          assignment.status ===
                                          AssignmentStatus.COMPLETED
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        <Icon
                                          icon={
                                            assignment.status ===
                                            AssignmentStatus.COMPLETED
                                              ? "FaCheck"
                                              : "FaClock"
                                          }
                                          className="mr-1 h-3 w-3"
                                        />
                                        {assignment.status ===
                                        AssignmentStatus.COMPLETED
                                          ? "Completed"
                                          : "Assigned"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                  .filter(Boolean) // Filter out null values (users with no assignments)
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No users found in the system
                </div>
              )}

              {users.length > 0 &&
                Object.keys(questionUserAssignments).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No assignments have been created yet
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Create Question Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Question"
      >
        <QuestionForm
          question={currentQuestion}
          categories={categories}
          onSubmit={handleCreateQuestion}
          onCancel={() => setIsCreateModalOpen(false)}
          onChange={setCurrentQuestion}
          submitLabel="Create Question"
        />
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingQuestionId(null);
          setCurrentQuestion({
            text: "",
            type: "text",
            options: [],
            category: "",
          });
        }}
        title="Edit Question"
      >
        <QuestionForm
          question={currentQuestion}
          categories={categories}
          onSubmit={handleUpdateQuestion}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingQuestionId(null);
            setCurrentQuestion({
              text: "",
              type: "text",
              options: [],
              category: "",
            });
          }}
          onChange={setCurrentQuestion}
          submitLabel="Update Question"
        />
      </Modal>

      {/* Assign Question Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUserId("");
          setSelectedQuestionId("");
        }}
        title="Assign Question to User"
      >
        <div className="space-y-4">
          {selectedQuestionId && (
            <div>
              {/* Show existing assignments for this question */}
              {questionUserAssignments[selectedQuestionId]?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Currently assigned to:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {questionUserAssignments[selectedQuestionId].map(
                      (assignment, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          <Icon icon="FaUser" className="mr-1 h-3 w-3" />
                          {assignment.userName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select User
              </label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a user</option>
                {users.map((user) => {
                  // Check if this question is already assigned to this user
                  const isAlreadyAssigned = isQuestionAssignedToUser(
                    selectedQuestionId,
                    user.id
                  );

                  return (
                    <option
                      key={user.id}
                      value={user.id}
                      disabled={isAlreadyAssigned}
                    >
                      {user.name} ({user.email}){" "}
                      {isAlreadyAssigned ? "- Already assigned" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedUserId("");
                setSelectedQuestionId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={!selectedUserId || !selectedQuestionId}
            >
              Assign Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Assignment Report"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="exportFormat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Export Format
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) =>
                setExportFormat(e.target.value as "pdf" | "excel" | "csv")
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="excel">Excel Spreadsheet (.xlsx)</option>
              <option value="csv">CSV File (.csv)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
