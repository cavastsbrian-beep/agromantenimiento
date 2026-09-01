"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tractor, ArrowLeft, QrCode, User, ClipboardList, Gauge,
  Calendar, FileSpreadsheet, Download, ChevronRight, Clock, Pencil, Trash2, Save, X, FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MachineDetailClient({ id, isAdmin }) {
  const router = useRouter();
  const [machine, setMachine] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteUrl, setSiteUrl] = useState("");
  const [seguimientos, setSeguimientos] = useState({});
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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

  const openEdit = (t) => {
    setEditing(t);
    setEditForm({
      tipo: t.tipo || "",
      fecha: t.fecha || "",
      responsable: t.responsable || "",
      descripcion: t.descripcion || "",
      repuestos: t.repuestos || "",
      observaciones: t.observaciones || "",
    });
    setConfirmingDelete(false);
  };

  const closeEdit = () => {
    setEditing(null);
    setConfirmingDelete(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("mantenimientos")
      .update(editForm)
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...editForm } : r)));
    closeEdit();
  };

  const confirmDelete = async () => {
    if (!editing) return;
    setDeleting(true);
    const { error } = await supabase.from("mantenimientos").delete().eq("id", editing.id);
    setDeleting(false);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== editing.id));
    closeEdit();
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

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#157347]";

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
              {machine.telefono && (
                <p className="mt-1 text-sm text-gray-500">📞 {machine.telefono}</p>
              )}
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

      <button
        onClick={() => router.push(`/m/${id}/facturas`)}
        className="mb-6 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white p-4 text-sm font-semibold text-[#157347] shadow-sm hover:bg-gray-50"
      >
        <FileText size={16} /> Historial de facturación
      </button>

      {records.length > 0 && records[0].proximo_mantenimiento_horas != null && (
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <div className="text-xs text-gray-400">Próximo mantenimiento</div>
            <div className="text-lg font-bold text-[#157347]">{records[0].proximo_mantenimiento_horas} hs</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Horas actuales</div>
            <div className="text-lg font-bold text-gray-800">{totalHoras(records[0].id)} hs</div>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold">Historial cronológico</h2>

      {records.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Todavía no hay mantenimientos registrados para esta máquina.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((t) => (
            <div key={t.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <div className="flex items-center gap-2">
                      {t.horas != null && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Gauge size={14} /> {t.horas} hs
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-full p-1.5 text-gray-800 hover:bg-gray-100"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                    </div>
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
                  {t.precio_total != null && (
                    <p className="mt-1 text-sm text-gray-500">
                      Monto: <span className="font-semibold text-gray-800">${t.precio_total}</span>
                    </p>
                  )}

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
                  </div>

                  {t.factura_url && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={
                          /\.pdf($|\?)/i.test(t.factura_url)
                            ? t.factura_url
                            : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(t.factura_url)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <FileText size={13} /> Ver factura
                      </a>
                      <a
                        href={t.factura_url}
                        download
                        className="flex items-center gap-1.5 rounded-lg bg-[#157347] px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <Download size={13} /> Descargar
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/m/${id}/seguimiento/${t.id}`)}
                  className="flex w-24 flex-shrink-0 flex-col items-center justify-center gap-2 self-stretch rounded-lg border border-[#157347] px-2 py-3 text-xs font-semibold text-[#157347] hover:bg-green-50"
                >
                  <ChevronRight size={16} />
                  <span>Seguimiento</span>
                  <span className="text-2xl">🚜</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Editar mantenimiento</h3>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            {!confirmingDelete ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
                    <select
                      className={inputCls}
                      value={editForm.tipo}
                      onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                    >
                      <option value="Correctivo">Correctivo</option>
                      <option value="Preventivo">Preventivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={editForm.fecha}
                      onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Responsable</label>
                    <input
                      className={inputCls}
                      value={editForm.responsable}
                      onChange={(e) => setEditForm({ ...editForm, responsable: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Descripción</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={editForm.descripcion}
                      onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Repuestos</label>
                    <input
                      className={inputCls}
                      value={editForm.repuestos}
                      onChange={(e) => setEditForm({ ...editForm, repuestos: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Observaciones</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={editForm.observaciones}
                      onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#157347] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Save size={14} /> {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Eliminar mantenimiento
                </button>
              </>
            ) : (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  ¿Seguro que querés eliminar este mantenimiento? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
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
            )}
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
