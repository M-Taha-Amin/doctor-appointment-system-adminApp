import axios from 'axios';

export const refreshToken = async function () {
  const res = await axios(
    `${import.meta.env.VITE_SERVER_URL}/auth/refresh-token`,
    { withCredentials: true },
  );
  return res.data.accessToken;
};
