import { createClient } from "@supabase/supabase-js";

export function normalizePhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits[0] === "1") return digits.slice(1);
  return null;
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function toGuest(row) {
  if (!row) return null;
  return {
    name: row.name,
    phone: row.phone,
    email: row.email,
    emailOptIn: row.email_opt_in,
    firstVisit: row.first_visit,
    passportNo: row.passport_no,
    masterNumber: row.master_number,
    visits: row.visits || []
  };
}
