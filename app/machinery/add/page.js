"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Camera, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const empty = {
  cliente: "", tipo: "", marca: "", modelo: "", anio: "",
  numero_serie: "", observaciones: "",
};

export default function AddMachinePage() {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20";

  const handleFile = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Solo se aceptan archivos de imagen (JPG, PNG, etc.).");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSave = async () => {
    setError("");
    if (!form.cliente || !form.marca || !form.modelo || !form.tipo) {
      setError("Completá los campos obligatorios.");
      return;
    }
    setSaving(true);

    let fotoUrl = null;
    if (file) {
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Fotos-maquinaria")
        .upload(path, file);
      if (uploadError) {
        setSaving(false);
        setError("Error real: " + uploadError.message + "");
        return;
      }
      const { data: pub } = supabase.storage.from("Fotos-maquinaria").getPublicUrl(path);
      fotoUrl = pub.publicUrl;
    }

    const { error: dbError } = await supabase.from("maquinas").insert({
      cliente: form.cliente,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? Number(form.anio) : null,
      numero_serie: form.numero_serie,
      observaciones: form.observaciones,
      foto_url: fotoUrl,
    });
    setSaving(false);
    if (dbError) {
      setError("Ocurrió un error al guardar. Probá de nuevo.");
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
        </div>

        <Field label="Fotografía">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Vista previa" className="h-40 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative rounded-lg border border-dashed border-gray-300 px-4 py-6 transition hover:border-[#157347] hover:bg-green-50/40">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 text-sm text-gray-500"
              >
                <Camera size={18} />
                Hacé clic para seleccionar una foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden" }}
                onChange={(e) => handleFile(e.target.files)}
              />
            </div>
          )}
        </Field>

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
