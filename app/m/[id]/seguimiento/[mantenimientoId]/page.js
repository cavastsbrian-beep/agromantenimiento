"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Gauge, Clock, Save, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SeguimientoHistorialPage() {
  const { mantenimientoId } = useParams();
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ operario: "", horas: "", fecha: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [lockError, setLockError] = useState("");

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

  useEffect(() => {
    load();
  }, [mantenimientoId]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowLock(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const checkPassword = async () => {
    setChecking(true);
    setLockError("");
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.ok) {
        if (mantenimiento?.maquina_id) {
          window.location.href = `/m/${mantenimiento.maquina_id}`;
        } else {
          window.location.href = "/";
        }
      } else {
        setLockError("Contraseña incorrecta");
      }
    } catch (e) {
      setLockError("Error al verificar");
    }
    setChecking(false);
  };

  const submitSeguimiento = async () => {
    if (!formData.operario || !formData.horas || !formData.fecha) return;
    setSaving(true);
    const { error } = await supabase.from("seguimientos").insert({
      mantenimiento_id: mantenimientoId,
      operario: formData.operario,
      horas: Number(formData.horas),
      fecha: formData.fecha,
    });
    setSaving(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    setFormData({ operario: "", horas: "", fecha: new Date().toISOString().slice(0, 10) });
    load();
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-gray-500">Cargando...</main>;
  }

  const totalHoras = seguimientos.reduce((sum, item) => sum + (Number(item.horas) || 0), 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <button
        onClick={() => setShowLock(true)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Seguimiento</h1>
        {mantenimiento && (
          <p className="mt-1 text-sm text-gray-500">
            {mantenimiento.tipo} · {mantenimiento.fecha} · Responsable: {mantenimiento.responsable}
          </p>
        )}
        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#157347]">
          <Clock size={15} /> Horas de trabajo: {totalHoras}
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-bold">Cargar nuevo registro</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Operario</label>
            <input
              type="text"
              value={formData.operario}
              onChange={(e) => setFormData({ ...formData, operario: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Horas de trabajo</label>
            <input
              type="number"
              value={formData.horas}
              onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
            />
          </div>
        </div>
        <button
          onClick={submitSeguimiento}
          disabled={saving}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#157347] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          <Save size={13} /> {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <h2 className="mb-3 text-lg font-bold">Historial</h2>
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

      {showLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <Lock size={18} className="text-[#157347]" />
              <h3 className="text-base font-bold">Contraseña requerida</h3>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              Ingresá la contraseña de administrador para salir de esta página.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#157347]"
              placeholder="Contraseña"
              autoFocus
            />
            {lockError && <p className="mt-2 text-xs text-red-600">{lockError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setShowLock(false); setPassword(""); setLockError(""); }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={checkPassword}
                disabled={checking}
                className="flex-1 rounded-lg bg-[#157347] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {checking ? "Verificando..." : "Ingresar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
