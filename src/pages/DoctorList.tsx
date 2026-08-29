import type { Doctor } from '../types/custom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../lib/axios';

export const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  return (
    <div
      className={`flex flex-col object-cover border-gray-200 border-2 rounded-lg select-none`}>
      {/* Doctor Image */}
      <div className="bg-purple/8">
        <img
          className="w-62.5 h-62.5 object-cover"
          src={doctor.image}
          alt="doctor image"
        />
      </div>

      {/* Doctor Details */}
      <div className="text-left py-4 px-4">
        <p>
          {doctor.available ? (
            <span className="size-2 bg-green-500 inline-block rounded-full"></span>
          ) : (
            <span className="size-2 bg-red-500 inline-block rounded-full"></span>
          )}
          {doctor.available ? (
            <span className="inline-block ml-2 text-sm font-medium text-green-400">
              Available
            </span>
          ) : (
            <span className="inline-block ml-2 text-sm font-medium text-red-400">
              Unavailable
            </span>
          )}
        </p>
        <h3 className="text-lg font-semibold">{doctor.name}</h3>
        <p className="text-gray-600 text-sm">{doctor.speciality}</p>
      </div>
    </div>
  );
};

const DoctorList = () => {
  const doctorsQuery = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/doctors`,
      );
      return res.data.data;
    },
  });

  if (doctorsQuery.isPending) {
    return (
      <div className="mt-64 animate-bounce flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="pl-8 pt-6 mb-12">
      <h1 className="text-lg mb-2 text-gray-700 font-semibold">All Doctors</h1>
      <div className="grid grid-cols-5 gap-4">
        {doctorsQuery.data.map((doc: Doctor) => (
          <>
            <DoctorCard doctor={doc} />
          </>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
