# Te Escuchamos · Centro de Estudiantes E.J.E

Buzón de propuestas del Centro de Estudiantes E.J.E Juramento de la Bandera.
Los alumnos cuentan qué quieren mejorar, apoyan las ideas de otros y siguen la respuesta del Centro.

## Cómo está armado

| Qué | Dónde |
| --- | --- |
| La página (diseño, textos, temas) | `public/index.html` |
| Logo | `public/logo.webp` |
| Guardar y listar propuestas | `netlify/functions/propuestas.mts` |
| Apoyos | `netlify/functions/apoyar.mts` |
| Panel del Centro (responder, ocultar, borrar) | `netlify/functions/admin.mts` |

Las propuestas se guardan en Netlify Blobs (store `te-escuchamos`).

## Configuración en Netlify

- Variable de entorno `ADMIN_PASSWORD`: contraseña del Centro de Estudiantes.
  Después de cambiarla hay que volver a publicar (Deploys → Trigger deploy).
- Para entrar como administrador: al final de la página, **Acceso Centro de Estudiantes**.
