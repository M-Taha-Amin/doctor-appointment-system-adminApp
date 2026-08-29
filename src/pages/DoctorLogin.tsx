import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { axiosClient } from '../lib/axios';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { doctorLogin } from '../store/authSlice';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email must be valid email address'),
  password: z.string().min(8, 'Password must be 8 characters long'),
});

const DoctorLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { doctor, admin } = useAppSelector(state => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation<any, Error, FormData>({
    mutationFn: async userData => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/auth/doctor-login`,
        {
          method: 'POST',
          data: userData,
        },
      );
      return res.data;
    },
    onSuccess: response => {
      dispatch(doctorLogin(response?.data));
      return navigate('/doctor');
    },
  });

  type FormData = z.infer<typeof loginSchema>;

  const onSubmit = async (data: FormData) => {
    toast.promise(loginMutation.mutateAsync(data), {
      pending: 'Loading',
      error: 'Failed to Login',
    });
  };

  if (admin) {
    return <Navigate to="/admin/dashboard" />;
  }

  if (doctor) {
    return <Navigate to="/doctor/dashboard" />;
  }

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="shadow-md ring ring-gray-200 rounded-lg p-8 w-sm">
        <h1 className="text-center text-2xl font-semibold text-gray-700">
          <span className="text-purple">Doctor</span> Login
        </h1>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Email</label>
            <input
              {...register('email')}
              type="email"
              className="border border-gray-300 rounded-sm p-1"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-gray-600">Password</label>
            <input
              {...register('password')}
              type="password"
              className="border border-gray-300 rounded-sm p-1"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <button className="bg-purple hover:bg-purple/85 text-sm text-white w-full py-2 rounded-sm cursor-pointer">
            Login
          </button>
        </form>
        <p className="mt-2 text-sm align-middle">
          Admin Login?{' '}
          <Link
            to="/admin-login"
            className="text-purple underline cursor-pointer">
            Click here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
