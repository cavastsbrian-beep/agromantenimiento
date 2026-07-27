"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tractor, LogIn, LogOut, Menu } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/machinery/add", label: "Agregar maquinaria" },
  { href: "/machinery", label: "Máquinas registradas" },
  { href: "/maintenance/add", label: "Agregar mantenimiento" },
  { href: "/settings", label: "Configuración" },
];

export default function Navbar({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#157347] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Tractor size={20} />
          </div>
          <div className="text-left leading-tight">
            <div className="font-bold tracking-tight">AgroMantenimiento</div>
            <div className="text-[11px] text-white/70">Gestión de maquinaria agrícola</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {it.label}
            </Link>
          ))}
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#157347] transition hover:bg-white/90"
            >
              <LogIn size={15} /> Iniciar sesión
            </Link>
          )}
        </nav>

        <button className="text-white md:hidden" onClick={() => setOpen((v) => !v)}>
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0F5132] px-4 py-2 md:hidden">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {it.label}
            </Link>
          ))}
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
            >
              <LogIn size={15} /> Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
