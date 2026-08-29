import { useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '../lib/axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../types/custom';

type Speciality = {
  id: number;
  name: string;
};

export const addDoctorSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  about: z.string().nullish(),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.string().min(1, 'Address is required'),
  education_degree: z.string().min(1, 'Education is required'),
  years_of_experience: z.coerce.number().min(1, 'Experience is required'),
  fee_per_appointment: z.coerce.number().positive('Fee must be greater than 0'),
  speciality_id: z.coerce.number().min(1, 'Speciality is required'),
  available: z.boolean().nullish(),
});

type AddDoctorForm = z.infer<typeof addDoctorSchema>;

const AddDoctor = () => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddDoctorForm>({
    resolver: zodResolver(addDoctorSchema),
  });

  const specialitiesQuery = useQuery({
    queryKey: ['speciality'],
    queryFn: async () => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/specialities`,
      );
      return res.data.specialities;
    },
  });

  const addDoctorMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axiosClient(
        `${import.meta.env.VITE_SERVER_URL}/doctors`,
        {
          data,
          method: 'POST',
        },
      );
      return res.data.data;
    },
    onSuccess: () => {
      return navigate('/admin/add-doctor');
    },
    onError: (error: AxiosError<ApiResponse>) => {
      return toast.error(error.response?.data?.message);
    },
  });

  const onSubmit = async (data: AddDoctorForm) => {
    const formData = new FormData();
    for (const key of Object.keys(data) as Array<keyof AddDoctorForm>) {
      formData.append(key, data[key] as string);
    }

    if (file) {
      formData.append('doctor_image', file);
    } else {
      toast.error('Doctor Image is required');
      return;
    }

    toast.promise(addDoctorMutation.mutateAsync(formData), {
      success: 'Doctor Added',
      pending: 'Adding...',
    });
  };

  if (specialitiesQuery.isPending) {
    return (
      <div className="mt-64 animate-bounce flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="pl-8 pt-6 mb-12">
      <h1 className="text-lg mb-2 text-gray-700 font-semibold">Add Doctor</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white ring ring-gray-300 shadow-sm max-w-4xl px-6 py-6">
        {/* image select */}
        <div className="flex items-center gap-3 text-gray-700">
          <img
            src={previewUrl ? previewUrl : assets.upload_area}
            onClick={() => imageInputRef.current?.click()}
            className="rounded-full bg-purple/8 object-center cursor-pointer w-20 h-20 object-cover"
          />

          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            onChange={e => {
              if (e.target.files) {
                const file = e.target.files[0];
                const blob = new Blob([file], { type: file.type });
                const url = URL.createObjectURL(blob);

                setPreviewUrl(url);
                setFile(file);
              }
            }}
          />

          <p>
            Upload doctor
            <br />
            picture
          </p>
        </div>

        <div className="grid grid-cols-[350px_350px] mt-8 gap-x-8 gap-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Doctor name*</label>

            <input
              type="text"
              {...register('name')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg"
              placeholder="Name"
            />

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Speciality */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Speciality</label>

            <select
              {...register('speciality_id')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg">
              <option disabled selected value="">
                Select speciality
              </option>

              {specialitiesQuery.data.map((sp: Speciality) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>

            {errors.speciality_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.speciality_id.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Doctor Email*</label>

            <input
              type="email"
              {...register('email')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg"
              placeholder="Email"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Education */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Education*</label>

            <input
              type="text"
              {...register('education_degree')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg"
              placeholder="Education"
            />

            {errors.education_degree && (
              <p className="text-red-500 text-sm mt-1">
                {errors.education_degree.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Doctor Password*</label>

            <input
              type="password"
              {...register('password')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg"
              placeholder="Password"
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Address*</label>

            <input
              type="text"
              {...register('address')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg"
              placeholder="Address"
            />

            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1">Experience*</label>

            <select
              {...register('years_of_experience')}
              className="border border-gray-300 p-2 focus:outline-none rounded-lg text-gray-500">
              <option value="">Experience</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
              <option value="5">5 Years</option>
              <option value="6">6 Years</option>
              <option value="7">7 Years</option>
              <option value="8">8 Years</option>
              <option value="9">9 Years</option>
              <option value="10">10 Years</option>
            </select>

            {errors.years_of_experience && (
              <p className="text-red-500 text-sm mt-1">
                {errors.years_of_experience.message}
              </p>
            )}
          </div>
        </div>

        {/* Fee */}
        <div className="flex flex-col w-87.5 mt-4">
          <label className="text-gray-600 mb-1">Fees Per Appointment*</label>

          <input
            type="text"
            {...register('fee_per_appointment')}
            className="border border-gray-300 p-2 focus:outline-none rounded-lg"
            placeholder="Doctor's Fee"
          />

          {errors.fee_per_appointment && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fee_per_appointment.message}
            </p>
          )}
        </div>

        {/* About */}
        <div className="flex flex-col mt-4 w-183">
          <label className="text-gray-600 mb-1">About</label>

          <textarea
            {...register('about')}
            className="border border-gray-300 p-2 focus:outline-none rounded-lg resize-none"
            placeholder="Write about the Doctor"
            rows={5}
          />

          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-purple hover:bg-purple/85 text-sm text-white px-8 rounded-full cursor-pointer h-fit py-2 mt-4">
          Add Doctor
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;
