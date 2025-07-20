import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "Set" : "Missing",
    key: supabaseKey ? "Set" : "Missing"
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
