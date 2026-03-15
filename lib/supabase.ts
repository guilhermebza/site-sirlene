import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sgeaxdtzpntpflsxolbp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZWF4ZHR6cG50cGZsc3hvbGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODIzNDksImV4cCI6MjA4OTE1ODM0OX0.kB5LLAm0sTXcpAYD73hAmw8jUApVh4K-owZx1_7jgDA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);