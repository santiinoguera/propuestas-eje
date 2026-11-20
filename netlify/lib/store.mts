import { getStore } from "@netlify/blobs";

export const ESTADOS = ["recibida", "revision", "marcha", "resuelta", "noviable"];
export const CATEGORIAS = ["Infraestructura y edificio", "Clases y evaluaciones", "Convivencia y normas",
  "Actividades y eventos", "Cantina y recreos", "Limpieza e higiene", "Otro"];

// Claves:  p/<id> propuesta · r/<id> respuesta del Centro · v/<id>/<votante> apoyo · t/<ip> último envío
export const store = () => getStore({ name: "te-escuchamos", consistency: "strong" });

export const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

export async function listarTodo(incluirOcultas: boolean) {
  const s = store();
  const [ps, rs, vs] = await Promise.all([
    s.list({ prefix: "p/" }), s.list({ prefix: "r/" }), s.list({ prefix: "v/" }),
  ]);
  const apoyos: Record<string, number> = {};
  for (const b of vs.blobs) { const id = b.key.split("/")[1]; apoyos[id] = (apoyos[id] || 0) + 1; }
  const respuestas: Record<string, any> = {};
  await Promise.all(rs.blobs.map(async b => { respuestas[b.key.slice(2)] = await s.get(b.key, { type: "json" }); }));
  const items = await Promise.all(ps.blobs.map(b => s.get(b.key, { type: "json" })));
  return items
    .filter((p: any) => p && (incluirOcultas || !p.oculta))
    .map((p: any) => {
      const r = respuestas[p.id] || {};
      return { ...p, estado: ESTADOS.includes(r.estado) ? r.estado : "recibida", respuesta: r.respuesta || "", apoyos: apoyos[p.id] || 0 };
    });
}

export function esAdmin(req: Request) {
  const clave = Netlify.env.get("ADMIN_PASSWORD");
  return !!clave && req.headers.get("x-admin-key") === clave;
}
