import axios from "axios";
import {
  User,
  ApiResponse,
  AuthResponse,
  LoginData,
  RegisterData,
} from "../types";
import { API_URL } from "../constants";
// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data.data;
  } catch (error: unknown) {
    const err = error as any;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Login failed");
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data;
  } catch (error: unknown) {
    const err = error as any;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Registration failed");
  }
};

export const checkAuth = async (): Promise<User> => {
  try {
    const response = await axios.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as any;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Authentication check failed");
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<ApiResponse<User[]>>("/auth/users");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as any;
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Failed to fetch users");
  }
};
