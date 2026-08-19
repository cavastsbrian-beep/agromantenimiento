"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Gauge, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SeguimientoHistorialPage() {
  const { mantenimientoId } = useParams();
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: m } = await supabase
        .from("mantenimientos")
        .select("*")
        .eq("id", mantenimientoId)
        .single();
      const { data: s } = await supabase
        .from("seguimientos")
        .select("*")
        .eq("mantenimiento_id", mantenimientoId)
        .order("fecha", { ascending: false });
      setMantenimiento(m);
      setSeguimientos(s || []);
      setLoading(false);
    };
    load();
  }, [mantenimientoId]);

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-gray-500">Cargando...</main>;
  }

  const totalHoras = seguimientos.reduce((sum, item) => sum + (Number(item.horas) || 0), 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Historial de seguimiento</h1>
        {mantenimiento && (
          <p className="mt-1 text-sm text-gray-500">
            {mantenimiento.tipo} · {mantenimiento.fecha} · Responsable: {mantenimiento.responsable}
          </p>
        )}
        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#157347]">
          <Clock size={15} /> Total de horas: {totalHoras}
        </p>
      </div>

      {seguimientos.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Todavía no hay seguimientos registrados.
        </div>
      ) : (
        <div className="space-y-3">
          {seguimientos.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Calendar size={14} /> {s.fecha}</span>
                <span className="flex items-center gap-1"><User size={14} /> {s.operario}</span>
                <span className="flex items-center gap-1"><Gauge size={14} /> {s.horas} hs</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
