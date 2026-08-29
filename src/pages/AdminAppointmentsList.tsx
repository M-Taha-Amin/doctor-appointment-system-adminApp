import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../lib/axios';
import type { ApiResponse, Appointment } from '../types/custom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AdminAppointmentsList = () => {
  const appointmentsQuery = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const res = await axiosClient<ApiResponse<Appointment[]>>(
        `${import.meta.env.VITE_SERVER_URL}/appointments`,
      );
      return res.data.data;
    },
  });

  if (appointmentsQuery.isPending) {
    return (
      <div className="mt-64 animate-bounce flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="px-8 pt-6">
      <h1 className="text-lg mb-2 text-gray-700 font-semibold">
        All Appointments
      </h1>
      <AppointmentsTable appointments={appointmentsQuery.data ?? []} />
    </div>
  );
};

const AppointmentsTable = ({
  appointments,
}: {
  appointments: Appointment[];
}) => {
  const queryClient = useQueryClient();
  const defaultImageUrl =
    'https://i.pinimg.com/474x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg';

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId }: { appointmentId: string }) => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/appointments/${appointmentId}/cancel`,
        {
          method: 'POST',
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });

  async function cancelAppointment(appointmentId: string) {
    toast.promise(cancelAppointmentMutation.mutateAsync({ appointmentId }), {
      pending: 'Cancelling...',
      success: 'Cancelled',
      error: 'Failed to Cancel',
    });
  }

  return (
    <table className="w-full bg-white ring ring-gray-200 shadow-sm border-collapse">
      <thead className="text-left border-b border-gray-300">
        <tr>
          <th>#</th>
          <th>Patient</th>
          <th>Date & Time</th>
          <th>Doctor</th>
          <th>Fees</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment, index) => (
          <tr className="border-b border-gray-300 text-gray-700">
            <td>{index + 1}</td>
            <td className="flex items-center gap-2">
              <img
                src={appointment.patient_image ?? defaultImageUrl}
                alt="patient image"
                className="size-8 rounded-full object-cover"
              />
              <span>{appointment.patient_name}</span>
            </td>
            <td>{format(appointment.booked_at, 'd MMM yyyy, h:mm a')}</td>
            <td className="flex items-center gap-2">
              <img
                src={appointment.doctor_image}
                alt="patient image"
                className="size-8 rounded-full object-cover"
                width={25}
              />
              <span>{appointment.doctor_name}</span>
            </td>
            <td>${appointment.doctor_fee}</td>
            {appointment.status === 'completed' ? (
              <td>
                <span className="text-green-400 text-sm">Completed</span>
              </td>
            ) : appointment.paid ? (
              <td>
                <span className="text-green-500 text-sm font-semibold">
                  Paid Online
                </span>
              </td>
            ) : (
              <td>
                {appointment.status === 'pending' && (
                  <button
                    className="bg-red-50 text-red-500 size-10 hover:scale-110 hover:shadow-sm rounded-full cursor-pointer text-sm"
                    onClick={() => cancelAppointment(appointment.id)}>
                    x
                  </button>
                )}
                {appointment.status === 'cancelled' && (
                  <span className="text-red-400 text-sm">Cancelled</span>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminAppointmentsList;
