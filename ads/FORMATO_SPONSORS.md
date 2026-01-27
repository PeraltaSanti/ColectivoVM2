# Formato estándar de Sponsors (Publicidad)

Este proyecto usa 2 piezas sincronizadas:

- **Banner Principal (takeover / hero)**: muestra la empresa activa (rota cada `rotation.main_ms`)
- **Banner Secundario (promos)**: muestra promociones de esa empresa (rota cada `rotation.promo_ms`)

Todo se configura en `ads/ads.json`.

---

## 1) Estructura de carpetas (estándar)

Cada sponsor vive en:

```
ads/
  ads.json
  sponsors/
    <sponsor_id>/
      main/
        hero.webp            # recomendado
        hero.jpg             # fallback
        takeover.webp        # recomendado (fondo blur)
        takeover.jpg         # fallback
        hero.svg             # opcional (si usás SVG en lugar de fotos)
      promos/
        promo_01.webp        # recomendado
        promo_01.jpg         # fallback
        promo_01.svg         # opcional
        promo_02.webp
        ...
```

> Nota: si usás `hero_svg`, podés omitir `hero.webp/jpg`.
> Para BlackTucan usamos `hero.webp + hero.jpg` y `takeover.webp + takeover.jpg`.

---

## 2) Recomendación de formatos y tamaños

### Banner Principal (hero)
- **Formato recomendado:** `WEBP` (calidad 70–82)
- **Fallback:** `JPG` (calidad 75–85)
- **Tamaño recomendado:** **1600×900** (16:9) o **1440×810**
- **Peso objetivo:** 150–350 KB (WEBP)

**Tips**
- Mantener una “zona segura” sin texto cerca de bordes (por el recorte en móviles).
- Si el arte es muy ilustrado, 1920×1080 también funciona, pero cuidá el peso.

### Fondo Takeover (blur / background)
- **Formato recomendado:** `WEBP`
- **Tamaño recomendado:** **1920×1080** o **1600×900**
- **Peso objetivo:** 120–300 KB (porque va blur y no necesita ultra detalle)

### Banner Secundario (promos)
Este banner se ve como tarjeta baja (90px móvil / 110px desktop).

- **Formato recomendado:** `WEBP`
- **Tamaño recomendado:** **1200×360** (≈ 3.33:1) o **1200×420** (≈ 2.86:1)
- **Peso objetivo:** 40–120 KB

**Tip de legibilidad**
- Textos grandes y contraste alto (es una zona chica).
- Si una promo es “solo texto”, conviene usar `type:"card"` en `ads.json` (no hace falta imagen).

---

## 3) Configuración en ads.json (Opción A)

Ejemplo mínimo:

```json
{
  "version": 28,
  "assets_root": "ads/sponsors",
  "rotation": { "main_ms": 15000, "promo_ms": 5000 },
  "sponsors": [
    {
      "id": "blacktucan",
      "name": "BlackTucan",
      "active": true,
      "main": {
        "hero_webp": "main/hero.webp",
        "hero_fallback": "main/hero.jpg",
        "takeover_webp": "main/takeover.webp",
        "takeover_fallback": "main/takeover.jpg",
        "href": "https://www.instagram.com/blacktucan/",
        "alt": "BlackTucan — Burger & Birra"
      },
      "promos": [
        { "type": "image", "src": "promos/promo_01.webp", "href": "..." },
        { "type": "card", "title": "2×1", "subtitle": "Solo martes", "foot": "..." }
      ]
    }
  ]
}
```

**Importante**
- Las rutas dentro de `main` y `promos` son **relativas al sponsor** (se resuelven como `ads/sponsors/<id>/...`).
- Para forzar actualización en GitHub Pages, aumentá `version` (ej. 28 → 29). Eso actualiza el cache-buster de assets.

