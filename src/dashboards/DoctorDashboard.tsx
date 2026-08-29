import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets';

const sidebarLinks = [
  {
    name: 'Dashboard',
    to: '/doctor/dashboard',
    icon: assets.home_icon,
  },
  {
    name: 'Appointments',
    to: '/doctor/appointments',
    icon: assets.appointment_icon,
  },
  {
    name: 'Profile',
    to: '/doctor/profile',
    icon: assets.people_icon,
  },
];

const DoctorDashboard = () => {
  const { doctor } = useAppSelector(state => state.auth);

  if (!doctor) {
    return <Navigate to="/doctor-login" />;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="ring ring-gray-200 w-60 pt-4">
          <div>
            {sidebarLinks.map(link => (
              <NavLink
                to={link.to}
                key={link.to}
                className={({ isActive }) =>
                  `flex pl-4 py-4 gap-3 relative ${isActive && 'bg-purple/10 active'}`
                }>
                {({ isActive }) => (
                  <>
                    <img src={link.icon} alt="sidebar icon" />
                    <span>{link.name}</span>
                    <span
                      className={`absolute right-0 top-0 bottom-0 bg-purple w-1 ${isActive ? 'block' : 'hidden'}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="bg-purple/5 flex-1 scrollbar-none">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DoctorDashboard;
