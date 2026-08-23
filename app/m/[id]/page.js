import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import MachineDetailClient from "@/components/MachineDetailClient";

export default async function MachineDetailPage({ params }) {
  const { id } = params;
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;

  const { data } = await supabase
    .from("configuracion")
    .select("admin_password")
    .eq("id", 1)
    .single();

  const isAdmin = Boolean(session && data?.admin_password && session === data.admin_password);

  return <MachineDetailClient id={id} isAdmin={isAdmin} />;
}
