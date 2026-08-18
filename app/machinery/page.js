"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tractor, Search, Filter, ClipboardList, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MachineryPage() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("maquinas")
      .select("*, mantenimientos(count)")
      .order("created_at", { ascending: false });
    setMachines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.cliente?.toLowerCase().includes(q) ||
        m.marca?.toLowerCase().includes(q) ||
        m.modelo?.toLowerCase().includes(q) ||
        m.numero_serie?.toLowerCase().includes(q);
      const matchesTipo = !filterTipo || m.tipo === filterTipo;
      return matchesSearch && matchesTipo;
    });
  }, [machines, search, filterTipo]);

  const handleDelete = async (id, label) => {
    if (!confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    await supabase.from("maquinas").delete().eq("id", id);
    load();
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Máquinas registradas</h1>
      <p className="mb-6 text-sm text-gray-500">Buscá, filtrá y accedé al historial de cada equipo.</p>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className={inputCls + " pl-9"}
            placeholder="Buscar por cliente, marca, modelo o N° de serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className={inputCls + " pl-9"}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option>Tractor</option>
            <option>Cosechadora</option>
            <option>Sembradora</option>
            <option>Pulverizadora</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          No se encontraron máquinas con esos criterios.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-[#F1F3F5]">
                <Tractor size={30} className="text-gray-400" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{m.marca} {m.modelo}</div>
                  <div className="text-sm text-gray-500">{m.cliente}</div>
                </div>
                <span className="rounded-full bg-[#157347]/10 px-2 py-0.5 text-[11px] font-semibold text-[#157347]">
                  {m.tipo}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <ClipboardList size={13} /> {m.mantenimientos?.[0]?.count || 0} mantenimientos
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/m/${m.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#157347] py-2 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Ver historial <ChevronRight size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(m.id, `${m.marca} ${m.modelo}`)}
                  className="rounded-lg border border-[#DC3545] px-3 text-sm text-[#DC3545] transition hover:bg-red-50"
                  title="Eliminar maquinaria"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
