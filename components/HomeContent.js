"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tractor, ClipboardList, Gauge, LogOut, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function HomeContent() {
  const [machines, setMachines] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("maquinas")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setMachines(data || []));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  };

  const filtered = machines.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.marca?.toLowerCase().includes(q) ||
      m.modelo?.toLowerCase().includes(q) ||
      m.cliente?.toLowerCase().includes(q) ||
      m.tipo?.toLowerCase().includes(q)
    );
  });

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
              <Link
                key={m.id}
                href={`/m/${m.id}`}
                className="rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
