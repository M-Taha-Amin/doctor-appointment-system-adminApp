import { useMutation } from '@tanstack/react-query';
import { assets } from '../assets/assets';
import { useAppDispatch } from '../store/hooks';
import { axiosClient } from '../lib/axios';
import { logout } from '../store/authSlice';
import { toast } from 'react-toastify';

const Navbar = ({ admin = false }: { admin?: boolean }) => {
  const dispatch = useAppDispatch();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient(`${import.meta.env.VITE_SERVER_URL}/auth/logout`);
      return res.data;
    },
    onSuccess: () => {
      dispatch(logout());
    },
  });

  return (
    <nav className="flex justify-between px-12 ring ring-gray-200 py-3 items-center">
      <div className="flex items-center gap-2">
        <img src={assets.admin_logo} width={150} alt="admin app logo" />
        <span className="border border-gray-800 text-gray-800 px-2 py-0.5 text-sm rounded-full mt-auto select-none">
          {admin ? 'Admin' : 'Doctor'}
        </span>
      </div>
      <button
        onClick={() => {
          toast.promise(logoutMutation.mutateAsync(), {
            pending: 'Logging out',
          });
        }}
        className="bg-purple hover:bg-purple/85 text-sm text-white px-8 rounded-full cursor-pointer h-fit py-2">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
