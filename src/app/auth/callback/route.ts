import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/auth/finish";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/auth/finish";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", requestUrl.origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const cookie of cookiesToSet) {
              cookieStore.set(cookie.name, cookie.value, {
                ...cookie.options,
                path: cookie.options?.path ?? "/",
              });
            }
          } catch {
            // Ignored during server action or endpoint execution.
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", requestUrl.origin));
  }

  if (next === "/auth/finish") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,display_name")
      .eq("id", data.user.id)
      .single();
    if (profileError) {
      return NextResponse.redirect(new URL("/login?error=profile_unavailable", requestUrl.origin));
    }

    if (profile.role === "technician") {
      const { data: existing, error: existingError } = await supabase
        .from("technician_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (existingError) {
        return NextResponse.redirect(new URL("/login?error=profile_unavailable", requestUrl.origin));
      }

      if (!existing) {
        const baseSlug = (profile.display_name ?? "tecnico")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const { error: insertError } = await supabase.from("technician_profiles").insert({
          user_id: data.user.id,
          slug: `${baseSlug || "tecnico"}-${data.user.id.slice(0, 8)}`,
        });
        if (insertError) {
          return NextResponse.redirect(new URL("/login?error=profile_unavailable", requestUrl.origin));
        }
      }

      return NextResponse.redirect(new URL("/tecnico", requestUrl.origin));
    }

    return NextResponse.redirect(new URL(profile.role === "admin" ? "/admin" : "/cliente", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
