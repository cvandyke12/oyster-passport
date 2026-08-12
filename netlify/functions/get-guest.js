import { normalizePhone, json, getSupabase, toGuest } from "./utils.js";

export default async (req) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const phone = normalizePhone(url.searchParams.get("phone"));
  if (!phone) return json({ error: "Missing phone number." }, 400);

  const supabase = getSupabase();
  const { data, error } = await supabase.from("guests").select("*").eq("phone", phone).maybeSingle();
  if (error) return json({ error: "Database error." }, 500);
  if (!data) return json({ error: "Guest not found." }, 404);

  return json({ guest: toGuest(data) });
};

export const config = { path: "/api/get-guest" };
