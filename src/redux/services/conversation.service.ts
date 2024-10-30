import axios from "axios";
import { baseURL } from "./auth.service";

export const StartConversation = async (payload: { message: string }) => {
  const atk = sessionStorage.getItem("atk");
  console.log(atk, "token*****************");

  try {
    const headers = {
      Authorization: `Bearer ${atk}`,
    };
    const url = `${baseURL}/api/v1/conversation/converse`;

    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHistory = async () => {
  const atk = sessionStorage.getItem("atk");

  try {
    const headers = {
      Authorization: `Bearer ${atk}`,
    };
    const url = `${baseURL}/api/v1/conversation/history`;

    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};
