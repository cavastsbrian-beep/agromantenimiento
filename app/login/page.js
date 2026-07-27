"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = params.get("next") || "/machinery";
        router.push(next);
        router.refresh();
      } else {
        setError("Contraseña incorrecta. Intentá nuevamente.");
      }
    } catch (e) {
      setError("Ocurrió un error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <div className="w-full rounded-2xl bg-white p-8 shadow-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#157347] text-white">
          <Lock size={20} />
        </div>
        <h1 className="text-center text-xl font-bold">Acceso administrador</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Ingresá la contraseña para gestionar maquinaria y mantenimientos.
        </p>

        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-16 text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500"
            >
              {show ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#DC3545] px-3 py-2 text-sm text-white">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-[#157347] py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </div>
    </main>
  );
}
