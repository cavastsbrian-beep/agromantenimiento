"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const empty = {
  cliente: "", tipo: "", marca: "", modelo: "", anio: "",
  numero_serie: "", horas: "", observaciones: "",
};

export default function AddMachinePage() {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20";

  const handleSave = async () => {
    setError("");
    if (!form.cliente || !form.marca || !form.modelo || !form.tipo) {
      setError("Completá los campos obligatorios.");
      return;
    }
    setSaving(true);
    const { error: dbError } = await supabase.from("maquinas").insert({
      cliente: form.cliente,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? Number(form.anio) : null,
      numero_serie: form.numero_serie,
      horas: form.horas ? Number(form.horas) : 0,
      observaciones: form.observaciones,
    });
    setSaving(false);
    if (dbError) {
      setError("Error: " + (dbError.message || JSON.stringify(dbError)));
      return;
    }
    router.push("/machinery");
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Agregar nueva maquinaria</h1>
      <p className="mb-6 text-sm text-gray-500">Completá los datos del equipo para registrarlo en el sistema.</p>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Field label="Cliente propietario" required>
            <input className={inputCls} value={form.cliente} onChange={set("cliente")} />
          </Field>
          <Field label="Tipo de maquinaria" required>
            <select className={inputCls} value={form.tipo} onChange={set("tipo")}>
              <option value="">Seleccionar...</option>
              <option>Tractor</option>
              <option>Cosechadora</option>
              <option>Sembradora</option>
              <option>Pulverizadora</option>
              <option>Otro</option>
            </select>
          </Field>
          <Field label="Marca" required>
            <input className={inputCls} value={form.marca} onChange={set("marca")} />
          </Field>
          <Field label="Modelo" required>
            <input className={inputCls} value={form.modelo} onChange={set("modelo")} />
          </Field>
          <Field label="Año">
            <input type="number" className={inputCls} value={form.anio} onChange={set("anio")} />
          </Field>
          <Field label="Número de serie">
            <input className={inputCls} value={form.numero_serie} onChange={set("numero_serie")} />
          </Field>
          <Field label="Horas actuales">
            <input type="number" className={inputCls} value={form.horas} onChange={set("horas")} />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea rows={3} className={inputCls} value={form.observaciones} onChange={set("observaciones")} />
        </Field>

        {error && (
          <div className="mb-4 rounded-lg bg-[#DC3545] px-3 py-2 text-sm text-white">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 flex items-center gap-2 rounded-lg bg-[#198754] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-60"
        >
          <Check size={16} /> {saving ? "Guardando..." : "Guardar maquinaria"}
        </button>
      </div>
    </main>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#DC3545]">*</span>}
      </span>
      {children}
    </label>
  );
}
