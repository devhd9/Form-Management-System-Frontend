import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import QuestionList from "./pages/admin/QuestionList";
import QuestionCreate from "./pages/admin/QuestionCreate";
import AssignQuestions from "./pages/admin/AssignQuestions";
import UserDashboard from "./pages/user/Dashboard";
import AssignmentFill from "./pages/user/AssignmentFill";
import AssignmentView from "./pages/user/AssignmentView";

// Protected route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}> = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to={`/${currentUser?.role}/dashboard`} />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute requiredRole="admin">
            <QuestionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions/create"
        element={
          <ProtectedRoute requiredRole="admin">
            <QuestionCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions/assign"
        element={
          <ProtectedRoute requiredRole="admin">
            <AssignQuestions />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assignments/:assignmentId"
        element={
          <ProtectedRoute requiredRole="user">
            <AssignmentFill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assignments/:assignmentId/view"
        element={
          <ProtectedRoute requiredRole="user">
            <AssignmentView />
          </ProtectedRoute>
        }
      />

      {/* Default routes */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={`/${currentUser.role}/dashboard`} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="pb-12">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
