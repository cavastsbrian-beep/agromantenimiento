import "./globals.css";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AgroMantenimiento",
  description: "Gestión de mantenimiento de maquinaria agrícola",
};

export default function RootLayout({ children }) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;
  const isAdmin = Boolean(session && session === process.env.ADMIN_PASSWORD);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F1F3F5] font-sans text-[#1F2937]">
        <Navbar isAdmin={isAdmin} />
        {children}
      </body>
    </html>
  );
}
