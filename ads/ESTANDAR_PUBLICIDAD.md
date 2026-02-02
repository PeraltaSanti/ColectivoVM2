# Estándar de datos de Publicidad (ColectivoVM2)

La app **ColectivoVM2** maneja **dos sistemas distintos** (no se mezclan):

1) **Publicidad de la pantalla principal**  
   - *Banner principal / takeover* + *banner secundario*.
   - Se configura en: `ads/ads.json`.

2) **Ofertas y Promociones (Sponsors)**  
   - Flujo: **Promociones → Rubro → Comercio → Pantalla del comercio**.
   - Se configura en: `ads/promos.json`.

La idea es que **StudioColectivo** (la app madre) luego pueda exportar **dos archivos** separados.

---

## 1) Publicidad de pantalla principal — `ads/ads.json`

Usado por:
- Banner principal (takeover)
- Banner secundario

Estructura (resumen):
- `version`: número (para cache busting de assets)
- `assets_root`: carpeta base de assets de sponsors (ej: `ads/sponsors`)
- `rotation`: tiempos de rotación
- `ads`: campañas/banners secundarios (si aplica)
- `sponsors`: sponsors del takeover (si aplica)

> Nota: un sponsor puede existir en `ads/ads.json` **sin** estar en `ads/promos.json`.

---

## 2) Ofertas y Promociones — `ads/promos.json`

Usado por:
- Botón **“Ofertas y promociones”**
- Pantallas de rubros / comercios / vista del comercio

Estructura (resumen):
- `version`: número
- `assets_root`: carpeta base de assets (ej: `ads/sponsors`)
- `sponsors`: lista de comercios con promos

Campos típicos de un comercio:
- `id` *(string, obligatorio)*: debe coincidir con la carpeta en `ads/sponsors/<id>/`
- `name` *(string, obligatorio)*
- `active` *(bool)*
- `category` o `categories` *(string o array)*: rubro (ej: `Bares`, `Kiosco`, `Taller`)
- `main`:
  - `logo_svg` o `logo_png` *(recomendado)*
  - `instagram` *(URL)*
  - `whatsapp` *(URL)*
  - `href` *(URL principal del comercio)*
- `promos`: lista de promociones

Campos típicos de una promo:
- `id` *(string)*
- `type`: `image` o `card`
- `src` *(si es image)*
- `title/subtitle/foot` *(si es card o si querés metadatos)*
- `href` *(URL al detalle: IG, WhatsApp, etc.)*
- `when`: `today` | `week` | `always` (también acepta `hoy/semana/siempre`)
- `enabled`: `true/false`

> Nota: un comercio puede existir en `ads/promos.json` **sin** estar en `ads/ads.json`.

---

## Assets: formato recomendado

### Estructura de carpetas recomendada (estándar)

> Regla: el campo `id` del comercio **debe coincidir** con el nombre de carpeta.

```
ads/
  ads.json                # Pantalla principal (banner principal + banner secundario)
  promos.json              # Ofertas y promociones (rubros → comercio → feed)
  sponsors/
    <sponsorId>/           # ej: blacktucan
      main/
        logo.svg
        logo.png           # opcional
        hero.webp          # opcional (solo si ese sponsor usa takeover en pantalla principal)
        hero.jpg           # opcional
      promos/
        promo_1.webp
        promo_2.jpg
```

Recomendaciones para `sponsorId`:
- minúsculas, sin espacios
- usar guiones (`black-tucan`) o todo junto (`blacktucan`)
- evitar caracteres raros (tildes, ñ) para no romper rutas

### Logos (pantallas de rubro/comercio)
- **Preferido:** `SVG` (liviano y nítido)
- Alternativa: `PNG` con fondo transparente
- Tamaño recomendado:
  - **512×512** (o mayor), relación 1:1
- Peso recomendado:
  - SVG: **< 200 KB**
  - PNG: **< 300 KB**
- Rutas sugeridas:
  - `ads/sponsors/<id>/main/logo.svg`
  - `ads/sponsors/<id>/main/logo.png` (o `logo_clean.png`)

### Imágenes de promo
- Si es estilo **“Pinterest”/masonry**:
  - 1080×1350 (4:5) o 1080×1080 (1:1)
- Si es tipo banner:
  - 1920×1080 (16:9)
- Peso recomendado: **< 450 KB** (ideal WebP/JPG optimizado)

---

## Reglas de separación (importante)

- **Pantalla principal** lee **solo** `ads/ads.json`.
- **Promociones/Sponsors** leen **solo** `ads/promos.json`.
- Esto evita mezclar la lógica del banner principal/secundario con el sistema de ofertas.

---

## Extra: validación automática

La app valida `ads/promos.json` al cargarlo y deja **warnings en consola** si falta algún campo o si hay errores típicos.

- Tag: `[Promos][Validación]`
- Cuando una imagen/logo falla al cargar, también se loguea con el tag: `[Promos][Asset]`

