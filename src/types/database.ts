import type {
  PricingType,
  RequestStatus,
  UserRole,
  VerificationStatus,
} from "@/lib/constants";

export type Profile = {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  city: string | null;
  district: string | null;
  contact_preference: "phone" | "whatsapp" | "email" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

export type TechnicianProfile = {
  id: string;
  user_id: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  primary_category_id: string | null;
  years_experience: number;
  is_available: boolean;
  is_published: boolean;
  verification_status: VerificationStatus;
  cv_storage_path: string | null;
  profile_views_count: number;
  created_at: string;
  updated_at: string;
};

export type TechnicianService = {
  id: string;
  technician_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  pricing_type: PricingType;
  price_min: number | null;
  price_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkExperience = {
  id: string;
  technician_id: string;
  company: string;
  job_title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
};

export type Education = {
  id: string;
  technician_id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
};

export type Certification = {
  id: string;
  technician_id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  expiration_date: string | null;
  storage_path: string | null;
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  technician_id: string;
  title: string;
  description: string | null;
  image_storage_path: string;
  category_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRequest = {
  id: string;
  client_id: string;
  technician_id: string;
  technician_service_id: string | null;
  title: string;
  description: string;
  service_address: string | null;
  department: string | null;
  city: string | null;
  district: string | null;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  contact_phone: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type RequestStatusHistory = {
  id: string;
  request_id: string;
  changed_by: string | null;
  old_status: RequestStatus | null;
  new_status: RequestStatus;
  note: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  request_id: string;
  client_id: string;
  technician_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  service_request_id: string | null;
  reason: string;
  description: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type PublicTechnicianCard = {
  id: string;
  slug: string;
  headline: string | null;
  years_experience: number;
  is_available: boolean;
  verification_status: VerificationStatus;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  city: string | null;
  district: string | null;
  category_name: string | null;
  category_slug: string | null;
  avg_rating: number | null;
  review_count: number;
};

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };
