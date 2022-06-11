import { createClient } from "@supabase/supabase-js";

export let supabase = createClient(
  "https://onpdfqzrehcefxpawzow.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGRmcXpyZWhjZWZ4cGF3em93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQ5MjQxNTEsImV4cCI6MTk3MDUwMDE1MX0.IBJFSLQ3-KJ1JI5AtiZhAGP6isTqWrMDTTqeSEyzBi8"
);