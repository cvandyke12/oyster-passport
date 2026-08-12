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

  const name = (body.name || "").trim() || "Guest";
  const email = (body.email || "").trim() || null;
  const emailOptIn = !!body.emailOptIn && !!email;

  const supabase = getSupabase();

  const { data: existing } = await supabase.from("guests").select("*").eq("phone", phone).maybeSingle();
  if (existing) return json({ guest: toGuest(existing) });

  const { data: seq, error: seqError } = await supabase.rpc("next_passport_no");
  if (seqError) return json({ error: "Could not assign a passport number." }, 500);
  const passportNo = "HS-" + String(seq).padStart(6, "0");

  const { data, error } = await supabase
    .from("guests")
    .insert({
      phone,
      name,
      email,
      email_opt_in: emailOptIn,
      first_visit: new Date().toISOString(),
      passport_no: passportNo,
      visits: []
    })
    .select()
    .single();

  if (error) return json({ error: "Could not create your passport — " + error.message }, 500);
  return json({ guest: toGuest(data) });
};

export const config = { path: "/api/create-guest" };
