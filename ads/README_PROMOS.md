# Promociones en 30 segundos (StudioColectivo → ColectivoVM2)

Este archivo es un **paso a paso corto** para cargar **una promo nueva** sin tocar el código.

> Importante: **Promociones** se cargan en `ads/promos.json`.
> Los banners de la pantalla principal se cargan en `ads/ads.json`. **No se mezclan.**

---

## 1) Copiar assets (logo + imagen de promo)

Crear la carpeta del comercio (si no existe):

```
ads/sponsors/<sponsorId>/
  main/
    logo.svg
  promos/
    promo_1.webp
```

Formato recomendado:
- **Logo:** 512×512 (1:1), SVG (<200 KB) o PNG (<300 KB)
- **Promo:** WebP/JPG optimizado (<450 KB)

Regla: `sponsorId` en minúsculas, sin espacios (ej: `blacktucan`).

---

## 2) Editar `ads/promos.json`

1) **Subir `version`** (ej: 1 → 2). Esto forza a que el teléfono/PC recargue imágenes.
2) Agregar el comercio (si no está) dentro de `sponsors`.
3) Agregar la promo dentro de `promos`.

Ejemplo mínimo:

```json
{
  "version": 2,
  "assets_root": "ads/sponsors",
  "sponsors": [
    {
      "id": "blacktucan",
      "name": "Black Tucán",
      "active": true,
      "categories": ["Bares"],
      "main": {
        "logo_svg": "main/logo.svg",
        "instagram": "https://www.instagram.com/blacktucan/",
        "whatsapp": "https://wa.me/549XXXXXXXXXX"
      },
      "promos": [
        {
          "id": "2x1",
          "type": "image",
          "src": "promos/promo_1.webp",
          "href": "https://www.instagram.com/blacktucan/",
          "when": "week",
          "enabled": true
        }
      ]
    }
  ]
}
```

---

## 3) Probar rápido (sin volverse loco)

1) Abrí la app y entrá a **“Ofertas y promociones”**.
2) Si no ves cambios, hacé **Ctrl+F5**.
3) Abrí consola (DevTools) y buscá:
   - `[Promos][Validación]` → errores típicos (faltan campos, ids duplicados, etc.)
   - `[Promos][Asset]` → rutas de imágenes/logos que fallaron al cargar

Listo.
