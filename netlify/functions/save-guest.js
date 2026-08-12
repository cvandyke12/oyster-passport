import { normalizePhone, json, getSupabase, toGuest } from "./utils.js";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: "Invalid request." }, 400);
  }

  const phone = normalizePhone(body.phone);
  if (!phone) return json({ error: "Enter a valid 10-digit phone number." }, 400);

  const updates = { updated_at: new Date().toISOString() };
  if (Array.isArray(body.visits)) updates.visits = body.visits;
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.email === "string") updates.email = body.email.trim() || null;
  if (typeof body.emailOptIn === "boolean") updates.email_opt_in = body.emailOptIn;

  const supabase = getSupabase();
  const { data, error } = await supabase.from("guests").update(updates).eq("phone", phone).select().single();

  if (error) return json({ error: "Could not save — " + error.message }, 500);
  return json({ guest: toGuest(data) });
};

export const config = { path: "/api/save-guest" };
