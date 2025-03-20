import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../services/authService";

interface LoginValues {
  email: string;
  password: string;
}

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const loginValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const registerValidationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(6, "Must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const loginFormik = useFormik<LoginValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const response = await login(values);
        authLogin(response.user, response.token);
        if (response.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    },
  });

  const registerFormik = useFormik<RegisterValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const response = await register({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        authLogin(response.user, response.token);
        navigate("/user/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome
          </h2>
        </div>

        <Tabs
          activeTab={activeTab}
          onChange={(tab: string) => {
            setActiveTab(tab as "login" | "register");
            setError(null);
          }}
          tabs={[
            { id: "login", label: "Login" },
            { id: "register", label: "Register" },
          ]}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {activeTab === "login" ? (
          <form onSubmit={loginFormik.handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="Email address"
                value={loginFormik.values.email}
                onChange={loginFormik.handleChange}
                onBlur={loginFormik.handleBlur}
                error={
                  loginFormik.touched.email
                    ? loginFormik.errors.email
                    : undefined
                }
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Password"
                value={loginFormik.values.password}
                onChange={loginFormik.handleChange}
                onBlur={loginFormik.handleBlur}
                error={
                  loginFormik.touched.password
                    ? loginFormik.errors.password
                    : undefined
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginFormik.isSubmitting}
            >
              {loginFormik.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={registerFormik.handleSubmit}
            className="mt-8 space-y-6"
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={registerFormik.values.name}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
                error={
                  registerFormik.touched.name
                    ? registerFormik.errors.name
                    : undefined
                }
              />
              <Input
                id="register-email"
                name="email"
                type="email"
                label="Email"
                placeholder="Email address"
                value={registerFormik.values.email}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
                error={
                  registerFormik.touched.email
                    ? registerFormik.errors.email
                    : undefined
                }
              />
              <Input
                id="register-password"
                name="password"
                type="password"
                label="Password"
                placeholder="Password"
                value={registerFormik.values.password}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
                error={
                  registerFormik.touched.password
                    ? registerFormik.errors.password
                    : undefined
                }
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm password"
                value={registerFormik.values.confirmPassword}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
                error={
                  registerFormik.touched.confirmPassword
                    ? registerFormik.errors.confirmPassword
                    : undefined
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerFormik.isSubmitting}
            >
              {registerFormik.isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Login;
