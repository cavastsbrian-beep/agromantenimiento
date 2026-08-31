"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function FacturasPage() {
  const { id } = useParams();
  const router = useRouter();
  const [machine, setMachine] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [totalCorrectivo, setTotalCorrectivo] = useState(0);
  const [totalPreventivo, setTotalPreventivo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: m } = await supabase.from("maquinas").select("*").eq("id", id).single();
      const { data: todos } = await supabase
        .from("mantenimientos")
        .select("*")
        .eq("maquina_id", id);

      const correctivo = (todos || [])
        .filter((r) => r.tipo === "Correctivo")
        .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);
      const preventivo = (todos || [])
        .filter((r) => r.tipo === "Preventivo")
        .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);

      const conFactura = (todos || [])
        .filter((r) => r.factura_url)
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      setMachine(m);
      setFacturas(conFactura);
      setTotalCorrectivo(correctivo);
      setTotalPreventivo(preventivo);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-gray-500">Cargando...</main>;
  }

  const isPdf = (url) => /\.pdf($|\?)/i.test(url);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <h1 className="mb-1 text-2xl font-bold">Historial</h1>
      {machine && (
        <p className="mb-6 text-sm text-gray-500">{machine.marca} {machine.modelo} — {machine.cliente}</p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <div className="text-xs text-gray-400">Mantenimiento correctivo</div>
          <div className="text-lg font-bold text-[#FD7E14]">${totalCorrectivo}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Mantenimiento preventivo</div>
          <div className="text-lg font-bold text-[#198754]">${totalPreventivo}</div>
        </div>
      </div>

      {facturas.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Todavía no hay facturas cargadas para esta máquina.
        </div>
      ) : (
        <div className="space-y-3">
          {facturas.map((f) => (
            <div key={f.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Calendar size={14} className="text-gray-400" /> {f.fecha}
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: f.tipo === "Preventivo" ? "#198754" : "#FD7E14" }}
                    >
                      {f.tipo}
                    </span>
                  </div>
{f.precio_total != null && (
                    <div className="mt-1 text-sm text-gray-500">
                      Monto: <span className="font-semibold text-gray-800">${f.precio_total}</span>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Responsable: <span className="font-medium text-gray-700">{f.responsable}</span>
                  </p>
                  {f.observaciones && (
                    <p className="mt-1 text-sm text-gray-500">Obs.: {f.observaciones}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={
                      isPdf(f.factura_url)
                        ? f.factura_url
                        : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(f.factura_url)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FileText size={13} /> Ver planilla
                  </a>
                  <a
                    href={f.factura_url}
                    download
                    className="flex items-center gap-1.5 rounded-lg bg-[#157347] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    <Download size={13} /> Descargar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
