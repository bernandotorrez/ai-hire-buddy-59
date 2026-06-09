import { createClient } from "https://esm.sh/@supabase/supabase-js@2.107.0";

export function createAuthedClient(req: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Supabase anon env vars are missing");

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });
}

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase service env vars are missing");

  return createClient(url, serviceKey);
}

export async function requireUser(req: Request) {
  const supabase = createAuthedClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user;
}

export async function requireRole(userId: string, role: "job_seeker" | "recruiter" | "admin") {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;
  if (!data?.some((item) => item.role === role || item.role === "admin")) {
    throw new Error("Forbidden");
  }
}

export async function enforceRateLimit(
  userId: string,
  functionName: string,
  maxRequests: number,
  windowHours = 24,
) {
  const supabase = createServiceClient();
  const now = new Date();
  const windowMs = windowHours * 60 * 60 * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs).toISOString();

  const { data } = await supabase
    .from("ai_rate_limits")
    .select("id, request_count")
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (data && data.request_count >= maxRequests) {
    throw new Error("rate_limit_exceeded");
  }

  if (data) {
    await supabase
      .from("ai_rate_limits")
      .update({ request_count: data.request_count + 1 })
      .eq("id", data.id);
  } else {
    await supabase.from("ai_rate_limits").insert({
      user_id: userId,
      function_name: functionName,
      window_start: windowStart,
      request_count: 1,
    });
  }
}
