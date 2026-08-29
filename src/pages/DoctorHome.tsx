import { assets } from '../assets/assets';
import { format } from 'date-fns';
import type { ApiResponse, Appointment } from '../types/custom';
import { axiosClient } from '../lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/hooks';

const DoctorHome = () => {
  const queryClient = useQueryClient();
  const { doctor } = useAppSelector(state => state.auth);

  const statsQuery = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: async () => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/stats/doctor?id=${doctor!.id}`,
      );
      return res.data.data;
    },
  });

  const appointmentsQuery = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const res = await axiosClient<ApiResponse<Appointment[]>>(
        `${import.meta.env.VITE_SERVER_URL}/appointments/doctor?id=${doctor!.id}`,
      );
      return res.data.data;
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId }: { appointmentId: string }) => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/appointments/${appointmentId}/cancel`,
        {
          method: 'POST',
          data: { doctorId: doctor!.id },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });

  const completeAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId }: { appointmentId: string }) => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/appointments/${appointmentId}/complete`,
        {
          method: 'POST',
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
  });

  async function cancelAppointment(appointmentId: string) {
    toast.promise(cancelAppointmentMutation.mutateAsync({ appointmentId }), {
      pending: 'Cancelling...',
      success: 'Cancelled',
      error: 'Failed to Cancel',
    });
  }

  async function completeAppointment(appointmentId: string) {
    toast.promise(completeAppointmentMutation.mutateAsync({ appointmentId }), {
      pending: 'Loading...',
      success: 'Appointment Completed',
      error: 'Failed to Complete Appointment',
    });
  }

  const isFetching = statsQuery.isPending || appointmentsQuery.isPending;

  if (isFetching) {
    return (
      <div className="mt-64 animate-bounce flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="pl-6 pt-6">
      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-white w-fit pl-4 pr-24 py-3 flex gap-3 items-center text-gray-700 rounded-lg">
          <img src={assets.earning_icon} alt="earning icon" />
          <div className="flex flex-col">
            <span className="text-xl font-semibold">
              ${statsQuery.data.earnings}
            </span>
            <span>Earnings</span>
          </div>
        </div>
        <div className="bg-white w-fit pl-4 pr-16 py-3 flex gap-3 items-center text-gray-700 rounded-lg">
          <img src={assets.appointments_icon} alt="appointment icon" />
          <div className="flex flex-col">
            <span className="text-xl font-semibold">
              {statsQuery.data.appointments}
            </span>
            <span>Appointments</span>
          </div>
        </div>
        <div className="bg-white w-fit pl-4 pr-16 py-3 flex gap-3 items-center text-gray-700 rounded-lg">
          <img src={assets.patients_icon} alt="patients icon" />
          <div className="flex flex-col">
            <span className="text-xl font-semibold">
              {statsQuery.data.patients}
            </span>
            <span>Patients</span>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="mt-8 bg-white w-188 py-4 px-4 mb-12">
        <div className="flex gap-2">
          <img src={assets.list_icon} alt="list icon" width={25} />
          <h3 className="text-lg font-medium">Latest Bookings</h3>
        </div>
        <hr className="my-2 border border-gray-200" />
        <div className="pt-2">
          {appointmentsQuery.data?.slice(0, 6).map(appointment => (
            <div className="p-2 rounded-sm flex gap-2 text-sm items-center">
              {/* doctor's image */}
              <img
                src={appointment.doctor_image}
                alt="doctor pfp"
                className="w-12 h-12 object-center rounded-full object-cover"
              />
              {/* doctor's details */}
              <div className="flex flex-col text-gray-700">
                <h4 className="font-semibold">{appointment.doctor_name}</h4>
                <span>
                  Booking on {format(appointment.booked_at, 'dd MMM yyyy')}
                </span>
              </div>
              {appointment.status === 'completed' ? (
                <span className="text-green-400 font-medium ml-auto">
                  Completed
                </span>
              ) : appointment.paid ? (
                <button
                  className="bg-green-50 border border-green-500 text-green-500 size-10 hover:scale-110 hover:shadow-sm rounded-full cursor-pointer ml-auto"
                  onClick={() => completeAppointment(appointment.id)}>
                  ✓
                </button>
              ) : (
                <div className="ml-auto">
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        className="bg-red-50 border border-red-500 text-red-500 size-10 hover:scale-110 hover:shadow-sm rounded-full cursor-pointer"
                        onClick={() => cancelAppointment(appointment.id)}>
                        x
                      </button>
                      <button
                        className="bg-green-50 border border-green-500 text-green-500 size-10 hover:scale-110 hover:shadow-sm rounded-full cursor-pointer ml-auto"
                        onClick={() => completeAppointment(appointment.id)}>
                        ✓
                      </button>
                    </div>
                  )}
                  {appointment.status === 'cancelled' && (
                    <span className="text-red-400 font-medium">Cancelled</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
