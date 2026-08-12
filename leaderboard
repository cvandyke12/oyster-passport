import { normalizePhone, json, getSupabase } from "./utils.js";

export default async (req) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const requesterPhone = normalizePhone(url.searchParams.get("phone"));

  const supabase = getSupabase();
  const { data, error } = await supabase.from("guests").select("phone,name,visits");
  if (error) return json({ error: "Could not load leaderboard." }, 500);

  return json({
    guests: (data || []).map((row) => ({
      name: row.name,
      visits: row.visits || [],
      isYou: !!(requesterPhone && row.phone === requesterPhone)
    }))
  });
};

export const config = { path: "/api/leaderboard" };
