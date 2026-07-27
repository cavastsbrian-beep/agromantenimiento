"use client";

import { Lock, ShieldCheck, Palette } from "lucide-react";

const rows = [
  {
    label: "Cambiar contraseña de administrador",
    icon: Lock,
    text: "Andá a tu proyecto en Vercel → Settings → Environment Variables → editá ADMIN_PASSWORD → volvé a desplegar (Redeploy).",
  },
  {
    label: "Copia de seguridad de los datos",
    icon: ShieldCheck,
    text: "Supabase hace copias de seguridad automáticas de tu base de datos. Podés descargar una manual desde Supabase → Database → Backups.",
  },
  {
    label: "Cambiar colores del sistema",
    icon: Palette,
    text: "Pedime el cambio de color y te actualizo el código del proyecto.",
  },
];

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Configuración</h1>
      <p className="mb-6 text-sm text-gray-500">
        Estas opciones se gestionan desde Supabase y Vercel, no dentro de la app.
      </p>

      <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {rows.map((r) => (
          <div key={r.label} className="px-5 py-4">
            <span className="flex items-center gap-3 text-sm font-medium">
              <r.icon size={16} className="text-gray-400" /> {r.label}
            </span>
            <p className="mt-1.5 pl-7 text-xs text-gray-500">{r.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
