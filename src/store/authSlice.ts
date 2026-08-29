import { createSlice } from '@reduxjs/toolkit';
import type { Admin, Doctor } from '../types/custom';

interface AuthState {
  accessToken: string | null;
  admin: Admin | null;
  doctor: Doctor | null;
}

const initialState: AuthState = {
  accessToken: null,
  admin: null,
  doctor: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    adminLogin(state, action) {
      state.doctor = null;
      state.accessToken = action.payload.accessToken;
      state.admin = action.payload.admin;
    },
    doctorLogin(state, action) {
      state.admin = null;
      state.accessToken = action.payload.accessToken;
      state.doctor = action.payload.doctor;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setAdmin(state, action) {
      state.admin = action.payload;
      state.doctor = null;
    },
    setDoctor(state, action) {
      state.doctor = action.payload;
      state.admin = null;
    },
    logout(state) {
      state.accessToken = null;
      state.admin = null;
      state.doctor = null;
    },
  },
});

export const {
  adminLogin,
  doctorLogin,
  logout,
  setAccessToken,
  setAdmin,
  setDoctor,
} = authSlice.actions;

export default authSlice.reducer;
