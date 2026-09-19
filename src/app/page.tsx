import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

/**
 * Root page: if user is already logged in, redirect to dashboard.
 * Otherwise, show the landing page with scan flow.
 */
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <HomeClient />;
}
