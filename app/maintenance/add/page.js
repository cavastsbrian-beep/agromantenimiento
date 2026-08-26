"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileSpreadsheet, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const empty = {
  machineId: "", fecha: "", responsable: "", tipo: "Preventivo",
  horas: "", proximoHoras: "", descripcion: "", repuestos: "", observaciones: "",
};

export default function AddMaintenancePage() {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("maquinas")
      .select("id, cliente, marca, modelo")
      .order("marca")
      .then(({ data }) => setMachines(data || []));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20";

  const handleFile = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (!/\.(xlsx|xls)$/i.test(f.name)) {
      setError("Solo se aceptan archivos Excel (.xlsx o .xls).");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSave = async () => {
    setError("");

    if (!form.machineId || !form.fecha || !form.responsable) {
      setError("Completá los campos obligatorios.");
      return;
    }

    setSaving(true);
    let excelUrl = null;

    if (file) {
      const path = `${form.machineId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("planillas-excel")
        .upload(path, file);

      if (uploadError) {
        setSaving(false);
        setError("No se pudo subir el archivo Excel. Probá de nuevo.");
        return;
      }
      const { data: pub } = supabase.storage.from("planillas-excel").getPublicUrl(path);
      excelUrl = pub.publicUrl;
    }

    const horasNum = form.horas ? Number(form.horas) : null;
    const proximoHorasNum = form.proximoHoras ? Number(form.proximoHoras) : null;

    const { error: dbError } = await supabase.from("mantenimientos").insert({
      maquina_id: form.machineId,
      fecha: form.fecha,
      responsable: form.responsable,
      tipo: form.tipo,
      horas: horasNum,
      proximo_mantenimiento_horas: proximoHorasNum,
      aviso_enviado: false,
      descripcion: form.descripcion,
      repuestos: form.repuestos || "-",
      observaciones: form.observaciones,
      excel_url: excelUrl,
    });

    if (dbError) {
      setSaving(false);
      setError("Ocurrió un error al guardar el mantenimiento.");
      return;
    }

    if (horasNum) {
      const { data: machine } = await supabase
        .from("maquinas")
        .select("horas")
        .eq("id", form.machineId)
        .single();

      if (machine && horasNum > machine.horas) {
        await supabase.from("maquinas").update({ horas: horasNum }).eq("id", form.machineId);
      }
    }

    setSaving(false);
    router.push(`/m/${form.machineId}`);
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Agregar mantenimiento</h1>
      <p className="mb-6 text-sm text-gray-500">
        Registrá un nuevo mantenimiento y actualizá el historial de la máquina.
      </p>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Field label="Seleccionar máquina" required>
          <select className={inputCls} value={form.machineId} onChange={set("machineId")}>
            <option value="">Seleccionar...</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.marca} {m.modelo} — {m.cliente}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-x-6 sm:grid-cols-2">
          <Field label="Fecha" required>
            <input type="date" className={inputCls} value={form.fecha} onChange={set("fecha")} />
          </Field>

          <Field label="Responsable" required>
            <input className={inputCls} value={form.responsable} onChange={set("responsable")} />
          </Field>

          <Field label="Tipo de mantenimiento" required>
            <select className={inputCls} value={form.tipo} onChange={set("tipo")}>
              <option>Preventivo</option>
              <option>Correctivo</option>
            </select>
          </Field>

          <Field label="Horas para el próximo mantenimiento">
            <input
              type="number"
              className={inputCls}
              value={form.proximoHoras}
              onChange={set("proximoHoras")}
              placeholder="Ej: 1000"
            />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea rows={3} className={inputCls} value={form.descripcion} onChange={set("descripcion")} />
        </Field>

        <Field label="Repuestos utilizados">
          <input className={inputCls} value={form.repuestos} onChange={set("repuestos")} />
        </Field>

        <Field label="Observaciones">
          <textarea rows={2} className={inputCls} value={form.observaciones} onChange={set("observaciones")} />
        </Field>

        <Field label="Adjuntar planilla Excel">
          {file ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-[#F1F3F5] px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <FileSpreadsheet size={18} className="text-[#198754]" />
                {file.name}
                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-4 transition hover:border-[#157347] hover:bg-green-50/40">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 text-sm text-gray-500"
              >
                <FileSpreadsheet size={18} />
                Hacé clic para seleccionar un archivo .xlsx o .xls
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden" }}
                onChange={(e) => handleFile(e.target.files)}
              />
            </div>
          )}
        </Field>

        {error && (
          <div className="mb-4 rounded-lg bg-[#DC3545] px-3 py-2 text-sm text-white">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 flex items-center gap-2 rounded-lg bg-[#198754] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-60"
        >
          <Check size={16} /> {saving ? "Guardando..." : "Guardar mantenimiento"}
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
