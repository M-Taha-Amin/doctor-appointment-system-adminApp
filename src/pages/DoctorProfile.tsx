import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { axiosClient } from '../lib/axios';
import { toast } from 'react-toastify';
import type { Doctor } from '../types/custom';
import { setDoctor } from '../store/authSlice';

const updateDoctorSchema = z.object({
  about: z.string().nullish(),
  fee_per_appointment: z.coerce
    .number()
    .min(1, 'Appointment fee must be valid'),
  available: z.coerce.boolean(),
});

type UpdateDoctorForm = z.infer<typeof updateDoctorSchema>;

const DoctorProfile = () => {
  const { doctor } = useAppSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UpdateDoctorForm>({
    resolver: zodResolver(updateDoctorSchema),
    defaultValues: {
      about: doctor!.about,
      available: doctor!.available,
      fee_per_appointment: doctor!.fee_per_appointment,
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: async (data: UpdateDoctorForm) => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/doctors/${doctor!.id}`,
        {
          method: 'PATCH',
          data,
        },
      );
      return res.data.doctor;
    },
    onSuccess: (doc: Doctor) => {
      dispatch(setDoctor(doc));
      setEditing(false);
    },
  });

  const onSubmit = async (data: UpdateDoctorForm) => {
    toast.promise(updateDoctorMutation.mutateAsync(data), {
      pending: 'Updating...',
      success: 'Profile Updated',
      error: 'Failed to Update',
    });
  };

  if (!doctor) return;

  return (
    <div className="pl-6 pt-6">
      <img
        src={doctor.image}
        width={300}
        alt="doctor image"
        className="bg-purple h-75 rounded-lg "
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-sm rounded-lg my-4 p-3 max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl flex gap-2 items-center font-semibold">
            {doctor.name}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            {doctor.education_degree} - {doctor.speciality}{' '}
            <span className="border border-gray-500 px-2 py-1 rounded-full">
              {doctor.years_of_experience}{' '}
              {doctor.years_of_experience > 1 ? 'Years' : 'Year'}
            </span>
          </p>
          <h3 className="flex gap-1 font-semibold items-center">About</h3>
          {!editing ? (
            <p className="text-gray-500">{doctor.about}</p>
          ) : (
            <textarea
              {...register('about')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg resize-none scrollbar-none"
              placeholder="Write about the Doctor"
              rows={5}
            />
          )}
          <p className="text-gray-600">
            Appointment fee:{' '}
            {!editing ? (
              <span className="text-gray-800 font-semibold">
                ${doctor.fee_per_appointment}
              </span>
            ) : (
              <>
                <input
                  type="number"
                  className="border border-gray-400 focus:outline-none rounded-lg p-1 text-sm text-gray-600"
                  max="10000"
                  {...register('fee_per_appointment')}
                />
                {errors.fee_per_appointment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fee_per_appointment.message}
                  </p>
                )}
              </>
            )}
          </p>
          {!editing ? (
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
          ) : (
            <div className="flex items-center gap-2">
              <label
                className="text-gray-800 font-semibold"
                htmlFor="available">
                Available
              </label>
              <input
                id="available"
                type="checkbox"
                {...register('available')}
                className="accent-purple size-4 mt-1"
              />
            </div>
          )}
        </div>
        {!editing ? (
          <div
            className="bg-purple hover:bg-purple/85 text-sm text-white px-8 rounded-full cursor-pointer h-fit py-2 mt-3 w-fit"
            onClick={() => setEditing(true)}>
            Edit
          </div>
        ) : (
          <button
            className="border border-purple text-purple hover:bg-purple text-sm hover:text-white px-8 rounded-full cursor-pointer h-fit py-2 mt-3"
            type="submit">
            Save
          </button>
        )}
      </form>
    </div>
  );
};

export default DoctorProfile;
