import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import HomeContent from "@/components/HomeContent";
import HomeLock from "@/components/HomeLock";

export default async function HomePage() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;

  const { data } = await supabase
    .from("configuracion")
    .select("admin_password")
    .eq("id", 1)
    .single();

  const isAdmin = Boolean(session && data?.admin_password && session === data.admin_password);

  if (!isAdmin) {
    return <HomeLock />;
  }

  return <HomeContent />;
}
