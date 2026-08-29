export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Admin {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: 'admin';
  image: unknown;
  created_at: Date;
}

export type Doctor = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'doctor';
  speciality: string;
  image: string;
  available: boolean;
  education_degree: string;
  years_of_experience: number;
  about: string | null;
  fee_per_appointment: number;
  address: string;
  created_at: Date;
};

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_image?: string;
  doctor_id: string;
  doctor_image: string;
  doctor_name: string;
  address: string | null;
  doctor_speciality: string;
  doctor_fee: number;
  status: 'pending' | 'completed' | 'cancelled';
  paid: boolean;
  created_at: Date;
  booked_at: Date;
}
