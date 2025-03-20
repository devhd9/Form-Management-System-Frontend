import axios from "axios";
import { GetUserFormQuestionsResponse } from "../types/assignment.types";
import { UserFormResponseRequestPayload } from "../types/response.types";
import { ApiResponse } from "../types";
import { API_URL } from "../constants";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const getUserForms = async (
  userId: string
): Promise<GetUserFormQuestionsResponse> => {
  try {
    const response = await axios.get<GetUserFormQuestionsResponse>(
      `/assignments`,
      {
        params: { userId },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch your forms");
  }
};

// Add a function to submit form responses
export const submitFormResponse = async (
  payload: UserFormResponseRequestPayload
): Promise<void> => {
  try {
    await axios.post<ApiResponse<void>>("/responses", payload);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to submit your response");
  }
};
