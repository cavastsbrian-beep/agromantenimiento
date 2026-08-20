import "./globals.css";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "AgroMantenimiento",
  description: "Gestión de mantenimiento de maquinaria agrícola",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;

  const { data } = await supabase
    .from("configuracion")
    .select("admin_password")
    .eq("id", 1)
    .single();

  const isAdmin = Boolean(session && data?.admin_password && session === data.admin_password);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F1F3F5] font-sans text-[#1F2937]">
        <Navbar isAdmin={isAdmin} />
        {children}
      </body>
    </html>
  );
}
