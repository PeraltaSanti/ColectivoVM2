# Promos por Rubro/Local (Opción B2)

Objetivo: que el flujo sea **Rubro → Local → Promos**.

## 1) Migración en D1 (obligatorio)

1. Cloudflare Dashboard → **Workers & Pages** → **D1** → tu DB (`colectivovm2_db`).
2. Abrí la pestaña **Console**.
3. Pegá y ejecutá el SQL de:
   `cloudflare/d1_migrations/001_promos_add_rubro_local.sql`

Esto agrega 2 columnas a `promos`:
- `rubro` (TEXT)
- `local` (TEXT)

## 2) Worker PUBLIC (promos)

Tu front (Cloudflare Pages) consume:
- `https://...workers.dev/api/public/promos`

Y para imágenes:
- `https://...workers.dev/api/public/img/<image_key>`

1. Abrí tu Worker **PUBLIC** (`colectivovm2-public` o el nombre que uses).
2. Copiá/mergeá el código de:
   `cloudflare/worker_public_promos_rubro_local.js`
3. Asegurate de que los **bindings** estén:
   - D1: variable `DB` (o adaptá el código si tu binding es `colectivovm2_db`)
   - R2: variable `PROMOS_BUCKET` (o adaptá si tu binding es `colectivovm2_bucket`)

> Si no tenés R2, podés igual crear promos sin imagen (se verán como tarjetas). Para imagen sí o sí necesitas R2.

## 3) Worker ADMIN (panel)

1. Abrí tu Worker **ADMIN/API** (el que tiene `/admin`).
2. Reemplazá el contenido por:
   `cloudflare/worker_admin_promos_rubro_local.js`
3. Bindings:
   - D1: `DB` (o `colectivovm2_db`)
   - R2: `PROMOS_BUCKET` (o `colectivovm2_bucket`)
4. (Opcional) Seteá `ADMIN_EMAILS` con tu email para un “doble check”:
   - Ej: `ADMIN_EMAILS = tuemail@gmail.com`

## 4) Cómo cargar una promo (en /admin)

Campos recomendados:
- **Rubro**: "Comida", "Farmacia", "Ropa", etc (libre).
- **Local**: nombre del comercio (1 rubro por local).
- **Título/Subtítulo**: lo que se ve en el detalle.
- **URL**: link a Instagram/WhatsApp/Maps.
- **Imagen**: JPG/PNG/WEBP (opcional, pero recomendado).

## 5) Verificación rápida en la app

1. Abrí la app (Cloudflare Pages) en incógnito.
2. Entrá a **Ofertas y promociones**.
3. Debés ver:
   - Lista de **rubros** (categorías)
   - Al entrar a un rubro: lista de **locales**
   - Al entrar a un local: sus **promos**

Si no aparece:
- Revisá `Network → Fetch/XHR` que `/api/public/promos` responda 200.
- Revisá que `rubro` y `local` no estén vacíos en D1.
