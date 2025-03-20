import axios from "axios";
import { ApiResponse } from "../types";
import { API_URL } from "../constants";
import { AssignQuestionRequest } from "../types/assignment.types";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const assignQuestionToUser = async (
  data: AssignQuestionRequest
): Promise<void> => {
  try {
    await axios.post<ApiResponse<void>>("/assignments", data);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to assign question to user");
  }
};
