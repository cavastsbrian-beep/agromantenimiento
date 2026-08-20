"use client";

import { useState } from "react";
import { Lock, ShieldCheck, Palette, Save } from "lucide-react";

export default function SettingsPage() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage("Contraseña actualizada correctamente.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOpen(false);
      } else {
        setError(json.error || "No se pudo cambiar la contraseña.");
      }
    } catch (e) {
      setError("Error de conexión.");
    }
    setSaving(false);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Configuración</h1>
      <p className="mb-6 text-sm text-gray-500">
        Estas opciones se gestionan desde Supabase y Vercel, no dentro de la app.
      </p>

      <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        <div className="px-5 py-4">
          <span className="flex items-center gap-3 text-sm font-medium">
            <Lock size={16} className="text-gray-400" /> Cambiar contraseña de administrador
          </span>
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-2 ml-7 rounded-lg border border-[#157347] px-3 py-1.5 text-xs font-medium text-[#157347] hover:bg-green-50"
            >
              Cambiar contraseña
            </button>
          ) : (
            <div className="mt-3 ml-7 space-y-2">
              <input
                type="password"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
              />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
              />
              <input
                type="password"
                placeholder="Repetir nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setOpen(false); setError(""); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#157347] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  <Save size={13} /> {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}
          {message && <p className="mt-2 ml-7 text-xs font-medium text-[#157347]">{message}</p>}
        </div>

        <div className="px-5 py-4">
          <span className="flex items-center gap-3 text-sm font-medium">
            <ShieldCheck size={16} className="text-gray-400" /> Copia de seguridad de los datos
          </span>
          <p className="mt-1.5 pl-7 text-xs text-gray-500">
            Supabase hace copias de seguridad automáticas de tu base de datos. Podés descargar una manual desde Supabase → Database → Backups.
          </p>
        </div>

        <div className="px-5 py-4">
          <span className="flex items-center gap-3 text-sm font-medium">
            <Palette size={16} className="text-gray-400" /> Cambiar colores del sistema
          </span>
          <p className="mt-1.5 pl-7 text-xs text-gray-500">
            Pedime el cambio de color y te actualizo el código del proyecto.
          </p>
        </div>
      </div>
    </main>
  );
}
