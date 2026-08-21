"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Tractor, LogIn, LogOut, Menu, Lock } from "lucide-react";

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
  const pathname = usePathname();

  const locked = !isAdmin && /^\/m\/[^/]+$/.test(pathname || "");

  const [showLock, setShowLock] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [lockError, setLockError] = useState("");

  useEffect(() => {
    if (!locked) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setPendingHref(null);
      setShowLock(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [locked]);

  const handleNavClick = (e, href) => {
    if (!locked) return;
    e.preventDefault();
    setOpen(false);
    setPendingHref(href);
    setShowLock(true);
  };

  const checkPassword = async () => {
    setChecking(true);
    setLockError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowLock(false);
        setPassword("");
        window.location.href = pendingHref || "/";
      } else {
        setLockError("Contraseña incorrecta");
      }
    } catch (e) {
      setLockError("Error al verificar");
    }
    setChecking(false);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#157347] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" onClick={(e) => handleNavClick(e, "/")} className="flex items-center gap-2 text-white">
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
              onClick={(e) => handleNavClick(e, it.href)}
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
              onClick={(e) => handleNavClick(e, "/login")}
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
              onClick={(e) => handleNavClick(e, it.href)}
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
              onClick={(e) => handleNavClick(e, "/login")}
              className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
            >
              <LogIn size={15} /> Iniciar sesión
            </Link>
          )}
        </div>
      )}

      {showLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <Lock size={18} className="text-[#157347]" />
              <h3 className="text-base font-bold text-gray-900">Contraseña requerida</h3>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              Ingresá la contraseña de administrador para salir de esta página.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#157347]"
              placeholder="Contraseña"
              autoFocus
            />
            {lockError && <p className="mt-2 text-xs text-red-600">{lockError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setShowLock(false); setPassword(""); setLockError(""); setPendingHref(null); }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={checkPassword}
                disabled={checking}
                className="flex-1 rounded-lg bg-[#157347] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {checking ? "Verificando..." : "Ingresar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
