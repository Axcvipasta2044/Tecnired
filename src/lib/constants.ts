/** Nombre centralizado de la plataforma — cambiar aquí para renombrar. */
export const APP_NAME = "TecniRed";

export const APP_TAGLINE = "Encuentra al técnico que necesitas.";

export const APP_DESCRIPTION =
  "Plataforma peruana que conecta clientes con técnicos y profesionales independientes.";

export const CURRENCY = "PEN" as const;
export const CURRENCY_SYMBOL = "S/";
export const TIMEZONE = "America/Lima";
export const LOCALE = "es-PE";
export const MARKET_COUNTRY = "PE";

export const CONTACT_EMAIL = "contacto@tecnired.pe";

/** Límites de archivos */
export const MAX_AVATAR_SIZE_MB = 2;
export const MAX_PORTFOLIO_IMAGE_SIZE_MB = 5;
export const MAX_DOCUMENT_SIZE_MB = 10;

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_PDF_MIME = ["application/pdf"] as const;

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  portfolio: "portfolio",
  documents: "technician-documents",
} as const;

export const USER_ROLES = ["client", "technician", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

/** Transiciones permitidas por rol */
export const CLIENT_STATUS_TRANSITIONS: Partial<
  Record<RequestStatus, RequestStatus[]>
> = {
  pending: ["cancelled"],
};

export const TECHNICIAN_STATUS_TRANSITIONS: Partial<
  Record<RequestStatus, RequestStatus[]>
> = {
  pending: ["accepted", "rejected"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
};

export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PRICING_TYPES = [
  "fixed",
  "range",
  "hourly",
  "quote",
] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: "Precio fijo",
  range: "Rango de precios",
  hourly: "Por hora",
  quote: "Cotización previa",
};

export const PERU_DEPARTMENTS = [
  "Amazonas",
  "Áncash",
  "Apurímac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huánuco",
  "Ica",
  "Junín",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martín",
  "Tacna",
  "Tumbes",
  "Ucayali",
] as const;

export const PAGE_SIZE = 12;

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  client: "/cliente",
  technician: "/tecnico",
  admin: "/admin",
};
