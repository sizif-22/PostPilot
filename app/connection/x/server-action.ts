'use server';
import axios from 'axios';

export const refreshXFunc = async (channelId: string) => {
  try {
    await axios.post('https://uc7rd5x13i.execute-api.eu-north-1.amazonaws.com/prod/refreshX', { channelId });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error refreshing X access token:', error.message);
    } else {
      console.error('An unknown error occurred while refreshing the X access token.');
    }
  }
};
