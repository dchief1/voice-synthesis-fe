import { UserTypes } from "@/types/auth.types";
import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const Register = async (payload: UserTypes) => {
  try {
    const url = `${baseURL}/api/v1/user/signup`;
    const response = await axios.post(url, payload);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const LoginUser = async (payload: { email: string; password: string }) => {
  try {
    const url = `${baseURL}/api/v1/user/login`;
    const response = await axios.post(url, payload);

    const token = response.data.data.token;

    sessionStorage.setItem("atk", token);

    return response.data;
  } catch (error) {
    throw error;
  }
};
