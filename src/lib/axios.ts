import axios, { AxiosError } from 'axios';
import { store } from '../store';
import { refreshToken } from '../utils/auth';
import { logout, setAccessToken } from '../store/authSlice';

const axiosClient = axios.create({
  withCredentials: true,
});

axiosClient.interceptors.request.use(function (config) {
  const token = store.getState().auth.accessToken;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  function (config) {
    return config;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshToken();
        store.dispatch(setAccessToken(newToken));
        if (newToken) {
          error.config!.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosClient(error.config!);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export { axiosClient };
