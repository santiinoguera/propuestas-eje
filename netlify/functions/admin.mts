import type { Config } from "@netlify/functions";
import { ESTADOS, esAdmin, json, listarTodo, store, texto } from "../lib/store.mts";

export default async (req: Request) => {
  if (!esAdmin(req)) return json({ error: "Contraseña incorrecta" }, 401);
  if (req.method === "GET") return json(await listarTodo(true));

  let d: any;
  try { d = await req.json(); } catch { return json({ error: "Datos inválidos" }, 400); }
  const id = texto(d.id, 40);
  const s = store();
  const p: any = await s.get("p/" + id, { type: "json" });
  if (!p) return json({ error: "No existe esa propuesta" }, 404);

  if (d.accion === "responder") {
    const estado = ESTADOS.includes(d.estado) ? d.estado : "recibida";
    await s.setJSON("r/" + id, { estado, respuesta: texto(d.respuesta, 1500), fecha: Date.now() });
  } else if (d.accion === "ocultar" || d.accion === "mostrar") {
    await s.setJSON("p/" + id, { ...p, oculta: d.accion === "ocultar" });
  } else if (d.accion === "borrar") {
    const { blobs } = await s.list({ prefix: `v/${id}/` });
    await Promise.all([s.delete("p/" + id), s.delete("r/" + id), ...blobs.map(b => s.delete(b.key))]);
  } else return json({ error: "Acción desconocida" }, 400);
  return json({ ok: true });
};

export const config: Config = { path: "/api/admin", method: ["GET", "POST"] };
