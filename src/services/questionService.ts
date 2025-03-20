import axios from "axios";
import {
  Question,
  CreateQuestionData,
  DashboardStats,
  ApiResponse,
  QuestionResponse,
} from "../types";
import { API_URL } from "../constants";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const createQuestion = async (
  data: CreateQuestionData
): Promise<Question> => {
  try {
    const response = await axios.post<ApiResponse<Question>>(
      `/questions`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to create question");
  }
};

export const getQuestions = async (): Promise<QuestionResponse> => {
  try {
    const response = await axios.get(`/questions`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch questions");
  }
};

export const getQuestion = async (id: string): Promise<Question> => {
  try {
    const response = await axios.get<ApiResponse<Question>>(`/questions/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch question");
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get<ApiResponse<string[]>>(
      `/questions/categories`
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch categories");
  }
};

export const updateQuestion = async (
  id: string,
  data: CreateQuestionData
): Promise<Question> => {
  try {
    const response = await axios.put<ApiResponse<Question>>(
      `/questions/${id}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to update question");
  }
};

export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    await axios.delete<ApiResponse<void>>(`/questions/${id}`);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to delete question");
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats"
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch dashboard statistics");
  }
};
