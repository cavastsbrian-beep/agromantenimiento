"use client";

import { useState } from "react";
import { Lock, Tractor } from "lucide-react";

export default function HomeLock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.ok) {
        window.location.reload();
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (e) {
      setError("Error de conexión");
    }
    setChecking(false);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#157347]/10">
          <Lock size={26} className="text-[#157347]" />
        </div>
        <div className="mb-1 flex items-center justify-center gap-2 text-lg font-bold">
          <Tractor size={18} /> AgroMantenimiento
        </div>
        <p className="mb-5 text-sm text-gray-500">
          Ingresá la contraseña de administrador para acceder.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#157347]"
          autoFocus
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={checking}
          className="mt-4 w-full rounded-lg bg-[#157347] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {checking ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </main>
  );
}
