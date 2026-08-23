"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tractor, Gauge, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function HomeContent() {
  const [machines, setMachines] = useState([]);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMachines = () => {
    supabase
      .from("maquinas")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setMachines(data || []));
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const filtered = machines.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.marca?.toLowerCase().includes(q) ||
      m.modelo?.toLowerCase().includes(q) ||
      m.cliente?.toLowerCase().includes(q) ||
      m.tipo?.toLowerCase().includes(q)
    );
  });

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("maquinas").delete().eq("id", toDelete.id);
    setDeleting(false);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    setMachines((prev) => prev.filter((m) => m.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <main>
      <section className="bg-gradient-to-b from-[#157347] to-[#0F5132] px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Tractor size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Gestión de mantenimiento de maquinaria agrícola
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Registrá, organizá y consultá el historial de mantenimiento de cada máquina
            desde un solo lugar — con acceso directo por enlace o código QR.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-lg font-bold">Máquinas registradas</h2>

        <div className="relative mt-4">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo o cliente..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#157347]"
          />
        </div>

        {machines.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Todavía no hay máquinas registradas.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No se encontraron máquinas con esa búsqueda.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <div key={m.id} className="relative rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setToDelete(m);
                  }}
                  className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/95 p-1.5 text-gray-400 shadow hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
                <Link href={`/m/${m.id}`} className="block text-left">
                  <div className="mb-3 h-28 overflow-hidden rounded-lg bg-[#F1F3F5]">
                    {m.foto_url ? (
                      <img src={m.foto_url} alt={`${m.marca} ${m.modelo}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Tractor size={30} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{m.marca} {m.modelo}</div>
                  <div className="text-sm text-gray-500">{m.cliente}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Gauge size={13} /> {m.horas} hs
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-base font-bold text-gray-900">¿Eliminar esta máquina?</h3>
            <p className="mb-4 text-sm text-gray-500">
              Vas a eliminar <span className="font-medium text-gray-800">{toDelete.marca} {toDelete.modelo}</span> ({toDelete.cliente}).
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
