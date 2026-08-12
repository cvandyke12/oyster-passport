import { normalizePhone, json, getSupabase } from "./utils.js";

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

  const supabase = getSupabase();
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("master_number,name")
    .eq("phone", phone)
    .maybeSingle();
  if (guestError) return json({ error: "Database error." }, 500);
  if (!guest) return json({ error: "Guest not found." }, 404);

  if (guest.master_number) return json({ masterNumber: guest.master_number });

  const { data: inducted, error: insertError } = await supabase
    .from("oyster_masters")
    .insert({ phone, name: guest.name })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingRow } = await supabase.from("oyster_masters").select("id").eq("phone", phone).single();
      if (existingRow) {
        await supabase.from("guests").update({ master_number: existingRow.id }).eq("phone", phone);
        return json({ masterNumber: existingRow.id });
      }
    }
    return json({ error: "Could not induct — " + insertError.message }, 500);
  }

  await supabase.from("guests").update({ master_number: inducted.id }).eq("phone", phone);
  return json({ masterNumber: inducted.id });
};

export const config = { path: "/api/claim-master-number" };
