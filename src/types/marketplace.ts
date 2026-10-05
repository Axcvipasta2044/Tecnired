import type { PricingType, VerificationStatus } from "@/lib/constants";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
};

export type TechnicianService = {
  id: string;
  title: string;
  description: string | null;
  pricing_type: PricingType;
  price_min: number | null;
  price_max: number | null;
};

export type Technician = {
  id: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  department: string | null;
  city: string | null;
  district: string | null;
  years_experience: number;
  is_available: boolean;
  verification_status: VerificationStatus;
  primary_category: string | null;
  category_slug: string | null;
  rating: number;
  review_count: number;
  services: TechnicianService[];
};

export type TechnicianDetails = Technician & {
  experience: {
    id: string;
    company: string;
    job_title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issue_date: string | null;
    expiration_date: string | null;
    verification_status: VerificationStatus;
  }[];
  portfolio: {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[];
};
