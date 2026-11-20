import type { Config } from "@netlify/functions";
import { json, store } from "../lib/store.mts";

const ok = (v: unknown) => typeof v === "string" && /^[a-z0-9]{6,40}$/i.test(v);

export default async (req: Request) => {
  let d: any;
  try { d = await req.json(); } catch { return json({ error: "Datos inválidos" }, 400); }
  if (!ok(d.id) || !ok(d.votante)) return json({ error: "Datos inválidos" }, 400);
  const s = store();
  if (!(await s.getMetadata("p/" + d.id))) return json({ error: "No existe esa propuesta" }, 404);
  // un apoyo = una clave propia por votante, así nunca se pisan dos apoyos
  const key = `v/${d.id}/${d.votante}`;
  if (d.apoyar) await s.set(key, "1"); else await s.delete(key);
  const { blobs } = await s.list({ prefix: `v/${d.id}/` });
  return json({ apoyos: blobs.length });
};

export const config: Config = { path: "/api/apoyar", method: "POST" };
