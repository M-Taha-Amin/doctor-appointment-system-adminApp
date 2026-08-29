import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import { ToastContainer } from 'react-toastify';
import DoctorLogin from './pages/DoctorLogin';
import AdminHome from './pages/AdminHome';
import { axiosClient } from './lib/axios';
import { useQuery } from '@tanstack/react-query';
import { logout, setAdmin, setDoctor } from './store/authSlice';
import { useAppDispatch } from './store/hooks';
import { useEffect } from 'react';
import AdminAppointmentsList from './pages/AdminAppointmentsList';
import AddDoctor from './pages/AddDoctor';
import DoctorList from './pages/DoctorList';
import DoctorHome from './pages/DoctorHome';
import DoctorAppointmentsList from './pages/DoctorAppointmentsList';
import DoctorProfile from './pages/DoctorProfile';
import { assets } from './assets/assets';

const App = () => {
  const dispatch = useAppDispatch();

  const getMeQuery = useQuery({
    queryKey: ['auth/admin'],
    queryFn: async () => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/auth/me`,
      );
      return res.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (getMeQuery.isSuccess) {
      const admin = getMeQuery.data.admin;
      const doctor = getMeQuery.data.doctor;
      if (admin) {
        dispatch(setAdmin(admin));
      } else if (doctor) {
        dispatch(setDoctor(doctor));
      }
    }
    if (getMeQuery.isError) {
      dispatch(logout());
    }
  }, [getMeQuery, getMeQuery.isSuccess, getMeQuery.isError]);

  if (getMeQuery) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <img className="animate-bounce" src={assets.admin_logo} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer autoClose={1500} position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/admin-login" />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="appointments" element={<AdminAppointmentsList />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="doctor-list" element={<DoctorList />} />
        </Route>
        <Route path="/doctor" element={<DoctorDashboard />}>
          <Route path="dashboard" element={<DoctorHome />} />
          <Route path="appointments" element={<DoctorAppointmentsList />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
