import type { Config, Context } from "@netlify/functions";
import { CATEGORIAS, json, listarTodo, store, texto } from "../lib/store.mts";

export default async (req: Request, context: Context) => {
  if (req.method === "GET") return json(await listarTodo(false));

  let d: any;
  try { d = await req.json(); } catch { return json({ error: "Datos inválidos" }, 400); }
  const titulo = texto(d.titulo, 90), problema = texto(d.problema, 1500), propuesta = texto(d.propuesta, 1500);
  if (!titulo || !problema || !propuesta) return json({ error: "Completá el título, qué pasa y qué proponés." }, 400);

  const s = store();
  // máximo una propuesta por minuto desde la misma conexión
  const ipKey = "t/" + (context.ip || "desconocida").replace(/[^a-zA-Z0-9.:-]/g, "_");
  const ultimo = Number(await s.get(ipKey)) || 0;
  if (Date.now() - ultimo < 60_000) return json({ error: "Esperá un minuto antes de enviar otra propuesta." }, 429);
  await s.set(ipKey, String(Date.now()));

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const item = {
    id, creado: Date.now(), titulo, problema, propuesta,
    categoria: CATEGORIAS.includes(d.categoria) ? d.categoria : "Otro",
    curso: texto(d.curso, 20), oculta: false,
  };
  await s.setJSON("p/" + id, item);
  return json({ ok: true, id }, 201);
};

export const config: Config = { path: "/api/propuestas", method: ["GET", "POST"] };
