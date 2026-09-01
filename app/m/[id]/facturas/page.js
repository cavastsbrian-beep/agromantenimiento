"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function FacturasPage() {
  const { id } = useParams();
  const router = useRouter();
  const [machine, setMachine] = useState(null);
  const [years, setYears] = useState([]);
  const [totalCorrectivo, setTotalCorrectivo] = useState(0);
  const [totalPreventivo, setTotalPreventivo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: m } = await supabase.from("maquinas").select("*").eq("id", id).single();
      const { data: todos } = await supabase
        .from("mantenimientos")
        .select("*")
        .eq("maquina_id", id)
        .order("fecha", { ascending: false });

      const registros = todos || [];

      const correctivo = registros
        .filter((r) => r.tipo === "Correctivo")
        .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);
      const preventivo = registros
        .filter((r) => r.tipo === "Preventivo")
        .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);

      const porAnio = {};
      registros.forEach((r) => {
        const anio = r.fecha ? r.fecha.slice(0, 4) : "Sin fecha";
        if (!porAnio[anio]) porAnio[anio] = [];
        porAnio[anio].push(r);
      });

      const gruposOrdenados = Object.keys(porAnio)
        .sort((a, b) => b.localeCompare(a))
        .map((anio) => {
          const items = porAnio[anio];
          const totalAnio = items.reduce((s, r) => s + (Number(r.precio_total) || 0), 0);
          const correctivoAnio = items
            .filter((r) => r.tipo === "Correctivo")
            .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);
          const preventivoAnio = items
            .filter((r) => r.tipo === "Preventivo")
            .reduce((s, r) => s + (Number(r.precio_total) || 0), 0);
          const conFactura = items.filter((r) => r.factura_url);
          return { anio, totalAnio, correctivoAnio, preventivoAnio, conFactura };
        });

      setMachine(m);
      setYears(gruposOrdenados);
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

      {years.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Todavía no hay mantenimientos registrados para esta máquina.
        </div>
      ) : (
        <div className="space-y-8">
          {years.map((grupo) => (
            <div key={grupo.anio}>
              <div className="mb-3 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-base font-bold text-gray-800">Balance {grupo.anio}</h2>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-400">Total gastado</div>
                    <div className="font-bold text-gray-800">${grupo.totalAnio}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Correctivo</div>
                    <div className="font-bold text-[#FD7E14]">${grupo.correctivoAnio}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Preventivo</div>
                    <div className="font-bold text-[#198754]">${grupo.preventivoAnio}</div>
                  </div>
                </div>
              </div>

              {grupo.conFactura.length === 0 ? (
                <p className="mb-2 pl-1 text-xs text-gray-400">Sin facturas cargadas este año.</p>
              ) : (
                <div className="space-y-3">
                  {grupo.conFactura.map((f) => (
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
                            <FileText size={13} /> Ver factura
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
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
