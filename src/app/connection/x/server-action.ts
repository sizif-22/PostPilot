"use server";
import axios from "axios";

export const refreshXFunc = async (channelId: string) => {
  try {
    const res = await axios.post(
      "https://uc7rd5x13i.execute-api.eu-north-1.amazonaws.com/prod/refreshX",
      { channelId }
    );
  } catch (error: any) {
    console.error("Error refreshing X access token:", error);
  }
};
