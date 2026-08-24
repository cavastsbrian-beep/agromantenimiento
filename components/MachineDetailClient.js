"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tractor, ArrowLeft, QrCode, User, ClipboardList, Gauge,
  Calendar, FileSpreadsheet, Download, ChevronRight, Clock, Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MachineDetailClient({ id, isAdmin }) {
  const router = useRouter();
  const [machine, setMachine] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteUrl, setSiteUrl] = useState("");
  const [seguimientos, setSeguimientos] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setSiteUrl(window.location.href);
  }, []);

  const load = async () => {
    const { data: m } = await supabase.from("maquinas").select("*").eq("id", id).single();
    const { data: r } = await supabase
      .from("mantenimientos")
      .select("*")
      .eq("maquina_id", id)
      .order("fecha", { ascending: false });
    setMachine(m);
    setRecords(r || []);

    if (r && r.length > 0) {
      const ids = r.map((rec) => rec.id);
      const { data: s } = await supabase
        .from("seguimientos")
        .select("*")
        .in("mantenimiento_id", ids);
      const grouped = {};
      (s || []).forEach((item) => {
        if (!grouped[item.mantenimiento_id]) grouped[item.mantenimiento_id] = [];
        grouped[item.mantenimiento_id].push(item);
      });
      setSeguimientos(grouped);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const totalHoras = (mantenimientoId) => {
    const list = seguimientos[mantenimientoId] || [];
    return list.reduce((sum, item) => sum + (Number(item.horas) || 0), 0);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("mantenimientos").delete().eq("id", toDelete.id);
    setDeleting(false);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-gray-500">Cargando...</main>;
  }

  if (!machine) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-gray-500">No se encontró esta máquina.</p>
      </main>
    );
  }

  const qrSrc = siteUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(siteUrl)}`
    : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="mb-6 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm sm:flex-row">
        <div className="h-36 w-full overflow-hidden rounded-xl bg-[#F1F3F5] sm:w-48">
          {machine.foto_url ? (
          <img src={machine.foto_url} alt={`${machine.marca} ${machine.modelo}`} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Tractor size={40} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">{machine.marca} {machine.modelo}</h1>
              <p className="text-sm text-gray-500">{machine.tipo} · Año {machine.anio || "—"}</p>
            </div>
            {qrSrc && (
              <div className="flex flex-col items-center gap-1 rounded-lg bg-[#F1F3F5] p-2">
                <img src={qrSrc} alt="Código QR de esta máquina" width={90} height={90} />
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <QrCode size={11} /> Acceso público
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Info label="Cliente" value={machine.cliente} icon={User} />
            <Info label="N° de serie" value={machine.numero_serie || "—"} icon={ClipboardList} />
          </div>
          {machine.observaciones && (
            <p className="mt-3 text-sm text-gray-500">{machine.observaciones}</p>
          )}
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold">Historial cronológico</h2>

      {records.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Todavía no hay mantenimientos registrados para esta máquina.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((t) => (
            <div key={t.id} className="relative rounded-xl bg-white p-5 shadow-sm">
              {isAdmin && (
                <button
                  onClick={() => setToDelete(t)}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <div className={`flex flex-wrap items-center justify-between gap-2 ${isAdmin ? "pr-8" : ""}`}>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: t.tipo === "Preventivo" ? "#198754" : "#FD7E14" }}
                  >
                    {t.tipo}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} /> {t.fecha}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-[#157347]">
                    <Clock size={14} /> Horas de trabajo: {totalHoras(t.id)}
                  </span>
                </div>
                {t.horas != null && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Gauge size={14} /> {t.horas} hs
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                <User size={14} /> Responsable:{" "}
                <span className="font-medium text-gray-700">{t.responsable}</span>
              </p>
              {t.descripcion && <p className="mt-2 text-sm text-gray-700">{t.descripcion}</p>}
              {t.repuestos && t.repuestos !== "-" && (
                <p className="mt-1 text-sm text-gray-500">Repuestos: {t.repuestos}</p>
              )}
              {t.observaciones && <p className="mt-1 text-sm text-gray-500">Obs.: {t.observaciones}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {t.excel_url && (
                  <>
                    <a
                      href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(t.excel_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FileSpreadsheet size={13} /> Ver planilla
                    </a>
                    <a
                      href={t.excel_url}
                      download
                      className="flex items-center gap-1.5 rounded-lg bg-[#157347] px-3 py-1.5 text-xs font-medium text-white"
                    >
                      <Download size={13} /> Descargar
                    </a>
                  </>
                )}
                <button
                  onClick={() => router.push(`/m/${id}/seguimiento/${t.id}`)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#157347] px-3 py-1.5 text-xs font-medium text-[#157347] hover:bg-green-50"
                >
                  <ChevronRight size={13} /> Seguimiento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-base font-bold text-gray-900">¿Eliminar este mantenimiento?</h3>
            <p className="mb-4 text-sm text-gray-500">
              Vas a eliminar el registro <span className="font-medium text-gray-800">{toDelete.tipo}</span> del {toDelete.fecha}.
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

function Info({ label, value, icon: Icon }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Icon size={12} /> {label}
      </div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}
