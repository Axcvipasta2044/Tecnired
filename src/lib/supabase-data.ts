import { getSupabaseServerClient } from "@/lib/supabase-server";
import type {
  CategoryItem,
  Technician,
  TechnicianDetails,
  TechnicianService,
} from "@/types/marketplace";

async function getClient() {
  const client = await getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}

export async function getCategories(): Promise<CategoryItem[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon,is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  return data;
}

export async function getPublicTechnicians(): Promise<Technician[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("public_technicians")
    .select(
      "id,slug,headline,bio,years_experience,is_available,verification_status,display_name,avatar_url,department,city,district,category_name,category_slug,avg_rating,review_count",
    )
    .order("avg_rating", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`No se pudieron cargar los técnicos: ${error.message}`);
  if (!data.length) return [];

  const { data: services, error: servicesError } = await supabase
    .from("technician_services")
    .select("id,technician_id,title,description,pricing_type,price_min,price_max")
    .in("technician_id", data.map((technician) => technician.id))
    .eq("is_active", true);

  if (servicesError) {
    throw new Error(`No se pudieron cargar los servicios: ${servicesError.message}`);
  }

  const servicesByTechnician = new Map<string, TechnicianService[]>();
  for (const service of services) {
    const item: TechnicianService = {
      id: service.id,
      title: service.title,
      description: service.description,
      pricing_type: service.pricing_type,
      price_min: service.price_min,
      price_max: service.price_max,
    };
    const current = servicesByTechnician.get(service.technician_id) ?? [];
    current.push(item);
    servicesByTechnician.set(service.technician_id, current);
  }

  return data.map((record) => ({
    ...record,
    rating: Number(record.avg_rating ?? 0),
    review_count: record.review_count ?? 0,
    primary_category: record.category_name,
    services: servicesByTechnician.get(record.id) ?? [],
  }));
}

export async function getFeaturedTechnicians(limit = 3): Promise<Technician[]> {
  return (await getPublicTechnicians()).slice(0, limit);
}

export async function getTechnicianBySlugPublic(slug: string): Promise<Technician | null> {
  return (await getPublicTechnicians()).find((technician) => technician.slug === slug) ?? null;
}

export async function getTechnicianDetailsBySlug(slug: string): Promise<TechnicianDetails | null> {
  const supabase = await getClient();
  const technician = await getTechnicianBySlugPublic(slug);
  if (!technician) return null;

  const [experience, education, certifications, portfolio, reviews] = await Promise.all([
    supabase
      .from("work_experiences")
      .select("id,company,job_title,description,start_date,end_date,is_current")
      .eq("technician_id", technician.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("educations")
      .select("id,institution,degree,field_of_study,start_date,end_date,description")
      .eq("technician_id", technician.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("certifications")
      .select("id,name,issuer,issue_date,expiration_date,verification_status")
      .eq("technician_id", technician.id)
      .eq("verification_status", "verified"),
    supabase
      .from("portfolio_items")
      .select("id,title,description,image_storage_path")
      .eq("technician_id", technician.id)
      .order("position"),
    supabase
      .from("reviews")
      .select("id,rating,comment,created_at")
      .eq("technician_id", technician.id)
      .order("created_at", { ascending: false }),
  ]);

  const failedQuery = [experience, education, certifications, portfolio, reviews].find((result) => result.error);
  if (failedQuery?.error) {
    throw new Error(`No se pudo cargar el perfil profesional: ${failedQuery.error.message}`);
  }
  if (
    !experience.data ||
    !education.data ||
    !certifications.data ||
    !portfolio.data ||
    !reviews.data
  ) {
    throw new Error("Supabase devolvió un perfil profesional incompleto.");
  }

  return {
    ...technician,
    experience: experience.data,
    education: education.data,
    certifications: certifications.data,
    portfolio: portfolio.data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image_url: supabase.storage.from("portfolio").getPublicUrl(item.image_storage_path).data.publicUrl,
    })),
    reviews: reviews.data,
  };
}

export async function getPublicTechnicianById(id: string): Promise<Technician | null> {
  return (await getPublicTechnicians()).find((technician) => technician.id === id) ?? null;
}
