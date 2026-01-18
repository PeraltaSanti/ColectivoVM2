document.addEventListener('DOMContentLoaded', () => {

    // ELEMENTOS
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    const pantallaTablas = document.getElementById('pantalla-tablas');

    const selectorParada = document.getElementById('selector-parada');
    const displayFecha = document.getElementById('fecha-hoy');
    const timelineContainer = document.getElementById('timeline-container');
    const mensajeError = document.getElementById('mensaje-error');

    // Publicidad
    const adSlotTop = document.getElementById('ad-slot-top');

    // Marca / fondo (skin)
    const brandBg = document.getElementById('brand-bg');
    const brandLogo = document.getElementById('brand-logo');

    // Línea / Temporada (UI)
    const selectorLinea = document.getElementById('selector-linea');
    const headerTitle = document.querySelector('header h1');
    const lineaButtons = document.querySelectorAll('.seg-btn[data-linea]');

    // Tema de fondo (claro/oscuro)
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const btnThemeLight = document.getElementById('btn-theme-light');

    const selectorTemporada = document.getElementById('selector-temporada');
    const btnSegRegular = document.getElementById('seg-regular');
    const btnSegVerano = document.getElementById('seg-verano');

    // Favoritas
    const btnGuardarFav = document.getElementById('btn-guardar-fav');
    const btnUsarFav = document.getElementById('btn-usar-fav');
    const favInfo = document.getElementById('fav-info');

    // Timeline
    const prevHora = document.getElementById('prev-hora');
    const mainHora = document.getElementById('main-hora');
    const mainCountdown = document.getElementById('main-countdown');
    const next1Hora = document.getElementById('next1-hora');
    const next1Diff = document.getElementById('next1-diff');
    const next2Hora = document.getElementById('next2-hora');
    const next2Diff = document.getElementById('next2-diff');

    // Botones y Tablas
    const btnVerTablas = document.getElementById('btn-ver-tablas');
    const btnVolver = document.getElementById('btn-volver');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tablaHead = document.querySelector('#tabla-completa thead');
    const tablaBody = document.querySelector('#tabla-completa tbody');

    // Mapa
    const btnVerMapa = document.getElementById('btn-ver-mapa');
    const pantallaMapa = document.getElementById('pantalla-mapa');
    const btnVolverMapa = document.getElementById('btn-volver-mapa');
    const btnCentrarMapa = document.getElementById('btn-centrar-mapa');
    const chkTodasParadas = document.getElementById('chk-todas-paradas');
    const btnMiUbicacion = document.getElementById('btn-mi-ubicacion');
    const inpBuscarParada = document.getElementById('inp-buscar-parada');
    const buscarResultados = document.getElementById('buscar-resultados');
    const selModoMapa = document.getElementById('sel-modo-mapa');
    const selParadaLogica = document.getElementById('sel-parada-logica');
    const btnResetMapeo = document.getElementById('btn-reset-mapeo');
    const mapHint = document.getElementById('map-hint');

    const MAP_DATA = window.MAP_DATA || {};

    // --- DATOS ---
    const HORARIOS_APP = window.HORARIOS_APP || {};

    // --- VARIABLES DE ESTADO ---
    let lineaActualKey = (selectorLinea && selectorLinea.value) ? selectorLinea.value : "A";
    let temporadaActualKey = (selectorTemporada && selectorTemporada.value) ? selectorTemporada.value : "regular";

    let diaActualKey = "";
    let listaViajesActual = [];

    // --- MAPA: ESTADO ---
    let isMapOpen = false;
    let map = null;
    let routePolyline = null;
    let stopsGroup = null;
    let myLocationMarker = null;
    let currentMapData = null;
    let currentStopMarkersById = {};
    let highlightedStopId = null;

    const MAP_STORAGE_PREFIX = 'mi_colectivo_mapeo_v1_';
    const defaultMappingCache = {}; // por línea + lista de paradas lógicas
    const userMappingCache = {}; // por línea

    // --- PUBLICIDAD ---
    const ADS_CFG_URL = 'ads/ads.json';
    const ADS_STATS_KEY = 'mi_colectivo_ads_stats_v1';
    const ADS_CUSTOM_KEY = 'mi_colectivo_ads_custom_v1';
    const ADS_SETTINGS_KEY = 'mi_colectivo_ads_settings_v1';
    const ADS_ADMIN_PW_KEY = 'mi_colectivo_ads_admin_pw_v1';
    const ADS_DEFAULT_ROTATE_MS = 5000;
    let adsCfg = null;
    let adsTimer = null;
    let adsLastId = null;
    let adsRotateMs = ADS_DEFAULT_ROTATE_MS;

    // --- THEMES (Color por línea) + UI Theme (Claro/Oscuro) ---
    const UI_THEME_KEY = 'mi_colectivo_ui_theme_v1';
    const UI_THEME_LIGHT_META = '#f4f6f8';
    let uiTheme = 'dark';

    // --- SKIN (Fondo / Logo de marca) ---
    // Podés cambiar esto sin tocar el JS desde index.html (window.APP_SKIN)
    // Overlay del takeover (sombreado) pensado para que:
    // - el header quede oscuro (como tu diseño propuesto)
    // - la imagen se vea clara en el medio
    // - vuelva a oscurecer suave hacia abajo
    const DEFAULT_OVERLAY_DARK = { top: 0.86, mid: 0.18, bot: 0.72 };
    const DEFAULT_OVERLAY_LIGHT = { top: 0.55, mid: 0.10, bot: 0.42 };

    // --- SKIN (Fondo / Logo de marca) ---
    // Podés cambiar esto sin tocar el JS desde index.html (window.APP_SKIN)
    // Skin base de la app.
    // IMPORTANTE: por defecto NO hay fondo de sponsor.
    // El takeover se activa únicamente si la publicidad activa trae takeover_bg/takeover_logo.
    const DEFAULT_APP_SKIN = {
        bg: null,
        logo: null,
        // Defaults pensados para takeovers (si un anuncio solo define bg, esto se usa como fallback)
        opacity_dark: 1,
        opacity_light: 0.70,
        blur_px: 0,
        scale: 1,
        pos: 'center 35%',
        overlay_dark: DEFAULT_OVERLAY_DARK,
        overlay_light: DEFAULT_OVERLAY_LIGHT
    };

    // Skin base de la app (se usa cuando no hay sponsor takeover)
    let baseSkin = null;
    // Skin actualmente aplicada
    let activeSkin = null;

    function normalizeSkin(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const bg = raw.bg || raw.background || raw.bg_src || raw.bgUrl || raw.takeover_bg || raw.takeoverBg || null;
        const logo = raw.logo || raw.logo_src || raw.logoUrl || raw.takeover_logo || raw.takeoverLogo || null;
        const pos = raw.pos || raw.position || raw.bg_pos || raw.bgPos || raw.background_position || raw.backgroundPosition || null;

        const opacity_dark = Number(raw.opacity_dark ?? raw.opacityDark ?? raw.bg_opacity_dark ?? raw.takeover_opacity_dark ?? raw.takeoverOpacityDark);
        const opacity_light = Number(raw.opacity_light ?? raw.opacityLight ?? raw.bg_opacity_light ?? raw.takeover_opacity_light ?? raw.takeoverOpacityLight);
        const blur_px = Number(raw.blur_px ?? raw.blur ?? raw.bg_blur_px ?? raw.takeover_blur_px ?? raw.takeoverBlurPx);
        const scale = Number(raw.scale ?? raw.bg_scale ?? raw.takeover_scale ?? raw.takeoverScale);

        // Overlay (cuanto sombreado arriba/medio/abajo). Si no se provee, usamos defaults.
        const odTop = Number(raw.overlay_dark_top ?? raw.overlayDarkTop ?? raw.overlay_top ?? raw.overlayTop ?? (raw.overlay_dark && raw.overlay_dark.top));
        const odMid = Number(raw.overlay_dark_mid ?? raw.overlayDarkMid ?? raw.overlay_mid ?? raw.overlayMid ?? (raw.overlay_dark && raw.overlay_dark.mid));
        const odBot = Number(raw.overlay_dark_bot ?? raw.overlayDarkBot ?? raw.overlay_bot ?? raw.overlayBot ?? (raw.overlay_dark && raw.overlay_dark.bot));

        const olTop = Number(raw.overlay_light_top ?? raw.overlayLightTop ?? (raw.overlay_light && raw.overlay_light.top));
        const olMid = Number(raw.overlay_light_mid ?? raw.overlayLightMid ?? (raw.overlay_light && raw.overlay_light.mid));
        const olBot = Number(raw.overlay_light_bot ?? raw.overlayLightBot ?? (raw.overlay_light && raw.overlay_light.bot));

        const overlay_dark = {
            top: Number.isFinite(odTop) ? odTop : (DEFAULT_APP_SKIN.overlay_dark?.top ?? DEFAULT_OVERLAY_DARK.top),
            mid: Number.isFinite(odMid) ? odMid : (DEFAULT_APP_SKIN.overlay_dark?.mid ?? DEFAULT_OVERLAY_DARK.mid),
            bot: Number.isFinite(odBot) ? odBot : (DEFAULT_APP_SKIN.overlay_dark?.bot ?? DEFAULT_OVERLAY_DARK.bot)
        };

        const overlay_light = {
            top: Number.isFinite(olTop) ? olTop : (DEFAULT_APP_SKIN.overlay_light?.top ?? DEFAULT_OVERLAY_LIGHT.top),
            mid: Number.isFinite(olMid) ? olMid : (DEFAULT_APP_SKIN.overlay_light?.mid ?? DEFAULT_OVERLAY_LIGHT.mid),
            bot: Number.isFinite(olBot) ? olBot : (DEFAULT_APP_SKIN.overlay_light?.bot ?? DEFAULT_OVERLAY_LIGHT.bot)
        };

        return {
            bg: bg ? String(bg) : null,
            logo: logo ? String(logo) : null,
            pos: pos ? String(pos) : (DEFAULT_APP_SKIN.pos || 'center'),
            opacity_dark: Number.isFinite(opacity_dark) ? opacity_dark : DEFAULT_APP_SKIN.opacity_dark,
            opacity_light: Number.isFinite(opacity_light) ? opacity_light : DEFAULT_APP_SKIN.opacity_light,
            blur_px: Number.isFinite(blur_px) ? blur_px : DEFAULT_APP_SKIN.blur_px,
            scale: Number.isFinite(scale) ? scale : DEFAULT_APP_SKIN.scale,
            overlay_dark,
            overlay_light
        };
    }

    function getAppSkin() {
        const fromWindow = normalizeSkin(window.APP_SKIN);
        const skin = fromWindow || DEFAULT_APP_SKIN;
        const normalized = normalizeSkin(skin);
        return normalized;
    }

    function applyBrandSkin(skin) {
        activeSkin = skin;
        const root = document.documentElement;
        const hasBg = !!(skin && skin.bg);

        // Pre-cargamos la imagen para evitar parpadeos en el cambio
        if (hasBg) {
            try {
                const img = new Image();
                img.src = skin.bg;
            } catch { /* noop */ }
        }

        // Vars de CSS para el fondo
        root.style.setProperty('--brand-bg-url', hasBg ? `url("${skin.bg}")` : 'none');
        root.style.setProperty('--brand-bg-blur', hasBg ? `${Math.max(0, Number(skin.blur_px) || 0)}px` : '0px');
        root.style.setProperty('--brand-bg-scale', hasBg ? String(Number(skin.scale) || 1) : '1');
        root.style.setProperty('--brand-bg-pos', hasBg ? String(skin.pos || DEFAULT_APP_SKIN.pos || 'center') : 'center');

        // Opacidad depende del modo claro/oscuro
        const op = hasBg ? (uiTheme === 'light' ? skin.opacity_light : skin.opacity_dark) : 0;
        root.style.setProperty('--brand-bg-opacity', String(op));

        // Overlay para que el contenido se lea sin tapar la marca
        const ov = hasBg ? (uiTheme === 'light' ? skin.overlay_light : skin.overlay_dark) : (uiTheme === 'light' ? DEFAULT_OVERLAY_LIGHT : DEFAULT_OVERLAY_DARK);
        root.style.setProperty('--brand-overlay-top', String(ov.top));
        root.style.setProperty('--brand-overlay-mid', String(ov.mid));
        root.style.setProperty('--brand-overlay-bot', String(ov.bot));

        // Reducimos MUCHO los "glows" cuando hay fondo de marca para que la foto se vea real (sin velo arriba)
        const glow = hasBg ? 0.10 : 1;
        root.style.setProperty('--glow-opacity', String(glow));

        document.body.classList.toggle('has-brand-skin', hasBg);

        // Logo pill (header):
        // - Sin sponsor/takeover: mostramos logo de la app.
        // - Con sponsor/takeover: lo ocultamos para que el fondo quede "limpio".
        if (brandLogo) {
            const defaultAppLogo = 'brand/app_logo.svg';
            if (hasBg) {
                brandLogo.removeAttribute('src');
                brandLogo.classList.add('hidden');
            } else {
                const src = (skin && skin.logo) ? skin.logo : defaultAppLogo;
                brandLogo.src = src;
                brandLogo.classList.remove('hidden');
            }
        }
    }

    function refreshBrandSkinForUiTheme() {
        if (!activeSkin) return;
        const root = document.documentElement;
        const hasBg = !!activeSkin.bg;

        const op = hasBg ? (uiTheme === 'light' ? activeSkin.opacity_light : activeSkin.opacity_dark) : 0;
        root.style.setProperty('--brand-bg-opacity', String(op));

        const ov = hasBg ? (uiTheme === 'light' ? activeSkin.overlay_light : activeSkin.overlay_dark) : (uiTheme === 'light' ? DEFAULT_OVERLAY_LIGHT : DEFAULT_OVERLAY_DARK);
        root.style.setProperty('--brand-overlay-top', String(ov.top));
        root.style.setProperty('--brand-overlay-mid', String(ov.mid));
        root.style.setProperty('--brand-overlay-bot', String(ov.bot));

        const glow = hasBg ? (uiTheme === 'light' ? 0.18 : 0.30) : 1;
        root.style.setProperty('--glow-opacity', String(glow));
    }

    // Negro + color por línea
    const THEMES = {
        A:    { primary: '#b00020', accent: '#ff3b30', meta: '#ff3b30' },  // Rojo
        E:    { primary: '#1b5e20', accent: '#34c759', meta: '#34c759' },  // Verde
        ESTE: { primary: '#b08900', accent: '#ffd60a', meta: '#ffd60a' },  // Amarillo
        OESTE:{ primary: '#004aad', accent: '#0a84ff', meta: '#0a84ff' }   // Azul
    };

    function hexToRgbTuple(hex) {
        try {
            if (!hex) return [0, 0, 0];
            let h = String(hex).trim().replace('#', '');
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            if (h.length !== 6) return [0, 0, 0];
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            return [Number.isFinite(r) ? r : 0, Number.isFinite(g) ? g : 0, Number.isFinite(b) ? b : 0];
        } catch {
            return [0, 0, 0];
        }
    }

    function getLineTheme(lineKey) {
        const k = String(lineKey || 'A').toUpperCase();
        return THEMES[k] || THEMES.A;
    }

    function updateMetaThemeColor(lineKey) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        if (uiTheme === 'light') {
            meta.setAttribute('content', UI_THEME_LIGHT_META);
            return;
        }
        const t = getLineTheme(lineKey);
        meta.setAttribute('content', t.meta || t.accent || '#121212');
    }

    function applyThemeForLine(lineKey) {
        const t = getLineTheme(lineKey);
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--accent', t.accent);
        root.style.setProperty('--primary-rgb', hexToRgbTuple(t.primary).join(', '));
        root.style.setProperty('--accent-rgb', hexToRgbTuple(t.accent).join(', '));
        document.body.dataset.linea = String(lineKey || 'A').toUpperCase();
        updateMetaThemeColor(lineKey);
    }

    function loadUiTheme() {
        try {
            const raw = localStorage.getItem(UI_THEME_KEY);
            return (raw === 'light' || raw === 'dark') ? raw : 'dark';
        } catch {
            return 'dark';
        }
    }

    function applyUiTheme(next, opts = {}) {
        const mode = (next === 'light') ? 'light' : 'dark';
        uiTheme = mode;
        document.body.dataset.uiTheme = mode;

        if (btnThemeDark && btnThemeLight) {
            btnThemeDark.classList.toggle('active', mode === 'dark');
            btnThemeLight.classList.toggle('active', mode === 'light');
        }

        updateMetaThemeColor(lineaActualKey);
        refreshBrandSkinForUiTheme();

        if (opts.persist) {
            try { localStorage.setItem(UI_THEME_KEY, mode); } catch { /* noop */ }
        }
    }

    function bindUiThemeToggle() {
        if (btnThemeDark) {
            btnThemeDark.addEventListener('click', () => applyUiTheme('dark', { persist: true }));
        }
        if (btnThemeLight) {
            btnThemeLight.addEventListener('click', () => applyUiTheme('light', { persist: true }));
        }
    }

    function loadAdsSettings() {
        try {
            const raw = localStorage.getItem(ADS_SETTINGS_KEY);
            if (!raw) return { rotate_ms: ADS_DEFAULT_ROTATE_MS };
            const s = JSON.parse(raw);
            const rotate_ms = Number(s?.rotate_ms || ADS_DEFAULT_ROTATE_MS);
            return {
                rotate_ms: Number.isFinite(rotate_ms) && rotate_ms >= 5000 ? rotate_ms : ADS_DEFAULT_ROTATE_MS
            };
        } catch {
            return { rotate_ms: ADS_DEFAULT_ROTATE_MS };
        }
    }

    function saveAdsSettings(partial) {
        const cur = loadAdsSettings();
        const next = { ...cur, ...partial };
        try { localStorage.setItem(ADS_SETTINGS_KEY, JSON.stringify(next)); } catch { /* noop */ }
        return next;
    }

    function loadCustomAds() {
        try {
            const raw = localStorage.getItem(ADS_CUSTOM_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    function saveCustomAds(ads) {
        try { localStorage.setItem(ADS_CUSTOM_KEY, JSON.stringify(Array.isArray(ads) ? ads : [])); } catch { /* noop */ }
    }

    function getAdsContext() {
        return {
            placement: 'horarios_top',
            linea: lineaActualKey,
            temporada: temporadaActualKey,
            dia: diaActualKey,
            now: new Date()
        };
    }

    function parseDateISO(dateStr) {
        // Espera "YYYY-MM-DD" (sin hora). Se interpreta como medianoche local.
        if (!dateStr || typeof dateStr !== 'string') return null;
        const m = /^\d{4}-\d{2}-\d{2}$/.exec(dateStr.trim());
        if (!m) return null;
        const [y, mo, d] = dateStr.split('-').map(Number);
        return new Date(y, (mo - 1), d, 0, 0, 0, 0);
    }

    function isAdEligible(ad, ctx) {
        if (!ad || typeof ad !== 'object') return false;
        if (!ad.id) return false;

        // enabled (por defecto true)
        if (ad.enabled === false) return false;

        if (ad.enabled === false) return false;

        // placement
        if (Array.isArray(ad.placements) && ad.placements.length) {
            if (!ad.placements.includes(ctx.placement)) return false;
        }

        // líneas
        if (Array.isArray(ad.lines) && ad.lines.length) {
            if (!(ad.lines.includes('ALL') || ad.lines.includes(ctx.linea))) return false;
        }

        // fechas
        const start = parseDateISO(ad.start_date);
        const end = parseDateISO(ad.end_date);
        if (start && ctx.now < start) return false;
        if (end) {
            // end inclusive
            const endInclusive = new Date(end.getTime() + (24 * 60 * 60 * 1000) - 1);
            if (ctx.now > endInclusive) return false;
        }

        return true;
    }

    function pickWeighted(ads) {
        const items = ads.map(a => ({ a, w: Number(a.weight || 1) })).filter(x => x.w > 0);
        if (!items.length) return null;
        const total = items.reduce((s, x) => s + x.w, 0);
        let r = Math.random() * total;
        for (const x of items) {
            r -= x.w;
            if (r <= 0) return x.a;
        }
        return items[items.length - 1].a;
    }

    function bumpAdStat(adId, kind) {
        try {
            const raw = localStorage.getItem(ADS_STATS_KEY);
            const stats = raw ? JSON.parse(raw) : {};
            if (!stats[adId]) stats[adId] = { impressions: 0, clicks: 0 };
            if (kind === 'impression') stats[adId].impressions += 1;
            if (kind === 'click') stats[adId].clicks += 1;
            localStorage.setItem(ADS_STATS_KEY, JSON.stringify(stats));
        } catch { /* noop */ }
    }

    function clearAdSlot(slot) {
        if (!slot) return;
        while (slot.firstChild) slot.removeChild(slot.firstChild);
    }

    function renderAd(slot, ad) {
        if (!slot) return;
        clearAdSlot(slot);

        if (!ad) {
            slot.classList.add('hidden');
            return;
        }

        slot.classList.remove('hidden');

        // Sin cartelito: la publicidad se muestra tal cual la pieza del negocio.

        const clickable = document.createElement(ad.href ? 'a' : 'div');
        clickable.className = ad.href ? 'ad-link' : 'ad-link';
        if (ad.href) {
            clickable.href = ad.href;
            clickable.target = '_blank';
            clickable.rel = 'noopener noreferrer';
            clickable.addEventListener('click', () => bumpAdStat(ad.id, 'click'));
        }

        const type = (ad.type || 'image').toLowerCase();
        if (type === 'video') {
            const video = document.createElement('video');
            video.className = 'ad-media';
            video.src = ad.src;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'metadata';
            clickable.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.className = 'ad-media';
            img.src = ad.src;
            img.alt = ad.alt || 'Publicidad';
            img.loading = 'lazy';
            clickable.appendChild(img);
        }

        slot.appendChild(clickable);
        bumpAdStat(ad.id, 'impression');
    }

    // --- SPONSOR TAKEOVER (skin según publicidad activa) ---
    let lastTakeoverKey = null;

    function getTakeoverSkinFromAd(ad) {
        if (!ad) return null;
        if (ad.takeover === false) return null;

        let raw = null;
        if (ad.takeover && typeof ad.takeover === 'object') {
            raw = ad.takeover;
        } else {
            const bg = ad.takeover_bg || ad.takeoverBg || ad.takeover_background || ad.takeoverBackground || null;
            const logo = ad.takeover_logo || ad.takeoverLogo || ad.takeover_brand_logo || ad.takeoverBrandLogo || null;
            const pos = ad.takeover_pos || ad.takeoverPos || ad.bg_pos || ad.bgPos || ad.position || ad.pos || null;
            const opacity_dark = ad.takeover_opacity_dark || ad.takeoverOpacityDark || null;
            const opacity_light = ad.takeover_opacity_light || ad.takeoverOpacityLight || null;
            const blur_px = ad.takeover_blur_px || ad.takeoverBlurPx || null;
            const scale = ad.takeover_scale || ad.takeoverScale || null;

            // overlays opcionales
            const overlay_dark_top = ad.takeover_overlay_dark_top || ad.takeoverOverlayDarkTop || null;
            const overlay_dark_mid = ad.takeover_overlay_dark_mid || ad.takeoverOverlayDarkMid || null;
            const overlay_dark_bot = ad.takeover_overlay_dark_bot || ad.takeoverOverlayDarkBot || null;
            const overlay_light_top = ad.takeover_overlay_light_top || ad.takeoverOverlayLightTop || null;
            const overlay_light_mid = ad.takeover_overlay_light_mid || ad.takeoverOverlayLightMid || null;
            const overlay_light_bot = ad.takeover_overlay_light_bot || ad.takeoverOverlayLightBot || null;

            if (bg || logo) {
                raw = {
                    bg,
                    logo,
                    pos,
                    opacity_dark,
                    opacity_light,
                    blur_px,
                    scale,
                    overlay_dark_top,
                    overlay_dark_mid,
                    overlay_dark_bot,
                    overlay_light_top,
                    overlay_light_mid,
                    overlay_light_bot
                };
            }
        }

        const skin = normalizeSkin(raw);
        if (!skin) return null;
        if (!skin.bg && !skin.logo) return null;
        return skin;
    }

    function applySponsorTakeoverFromAd(ad) {
        // Si no hay configuración base aún, la obtenemos (fallback).
        if (!baseSkin) baseSkin = getAppSkin();

        const takeoverSkin = getTakeoverSkinFromAd(ad);
        const key = takeoverSkin
            ? `takeover:${ad?.id || ''}:${takeoverSkin.bg || ''}:${takeoverSkin.logo || ''}`
            : 'base';

        if (key === lastTakeoverKey) return;
        lastTakeoverKey = key;

        if (takeoverSkin) {
            applyBrandSkin(takeoverSkin);
        } else {
            applyBrandSkin(baseSkin);
        }
    }

    async function loadAdsConfig() {
        // Si falla el fetch, usamos un fallback embebido.
        const fallback = {
            ads: [
                {
                    id: 'demo_vm_1',
                    type: 'image',
                    src: 'ads/demo_la_esquina.svg',
                    href: 'https://wa.me/5490000000000',
                    alt: 'Publicidad - Demo (La Esquina)',
                    placements: ['horarios_top'],
                    lines: ['ALL'],
                    weight: 1
                },
                {
                    id: 'demo_vm_2',
                    type: 'image',
                    src: 'ads/demo_taller.svg',
                    href: 'https://instagram.com',
                    alt: 'Publicidad - Demo (Taller)',
                    placements: ['horarios_top'],
                    lines: ['ALL'],
                    weight: 1
                }
            ]
        };

        let base = fallback;
        try {
            const res = await fetch(`${ADS_CFG_URL}?v=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                if (json && Array.isArray(json.ads)) base = json;
            }
        } catch {
            // dejamos fallback
        }

        // Merge: base + custom (custom sobreescribe por id)
        const custom = loadCustomAds();
        const byId = new Map();
        (base.ads || []).forEach(a => { if (a?.id) byId.set(a.id, { ...a, __origin: 'base' }); });
        custom.forEach(a => {
            if (!a?.id) return;
            const prev = byId.get(a.id);
            byId.set(a.id, { ...(prev || {}), ...a, __origin: 'custom' });
        });
        return { ...base, ads: Array.from(byId.values()) };
    }

    function showNextAd() {
        if (!adSlotTop) return;
        if (!adsCfg || !Array.isArray(adsCfg.ads)) {
            renderAd(adSlotTop, null);
            applySponsorTakeoverFromAd(null);
            return;
        }

        const ctx = getAdsContext();
        const eligible = adsCfg.ads.filter(a => isAdEligible(a, ctx));
        if (!eligible.length) {
            renderAd(adSlotTop, null);
            applySponsorTakeoverFromAd(null);
            return;
        }

        // Evitar repetir la misma pieza si hay alternativas
        let pool = eligible;
        if (eligible.length > 1 && adsLastId) {
            const filtered = eligible.filter(a => a.id !== adsLastId);
            if (filtered.length) pool = filtered;
        }

        const picked = pickWeighted(pool);
        adsLastId = picked?.id || null;
        renderAd(adSlotTop, picked);
        applySponsorTakeoverFromAd(picked);
    }

    function ensureCurrentAdForContext() {
        // No forzar cambio de publicidad en cada interacción.
        // Solo rotamos por timer, pero si la pieza actual NO aplica al nuevo contexto (línea/día/fecha), cambiamos.
        if (!adSlotTop) return;
        if (!adsCfg || !Array.isArray(adsCfg.ads)) return;
        if (!adsLastId) return;

        const ctx = getAdsContext();
        const current = adsCfg.ads.find(a => a?.id === adsLastId);
        if (!current || !isAdEligible(current, ctx)) {
            showNextAd();
        }
    }


    async function initAds() {
        if (!adSlotTop) return;

        // Rotación fija 5s (para que el anunciante tenga tiempo de verse).
        adsRotateMs = 5000;
        saveAdsSettings({ rotate_ms: adsRotateMs });

        adsCfg = await loadAdsConfig();
        showNextAd();

        if (adsTimer) clearInterval(adsTimer);
        adsTimer = setInterval(() => {
            if (document.hidden) return;
            showNextAd();
        }, adsRotateMs);

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) showNextAd();
        });
    }

    // --- ADMIN ADS (panel oculto) ---
    const adminModal = document.getElementById('admin-ads-modal');
    const btnAdminCerrar = document.getElementById('btn-admin-ads-cerrar');
    const adminLock = document.getElementById('admin-ads-lock');
    const adminPanel = document.getElementById('admin-ads-panel');
    const adminPassInp = document.getElementById('admin-ads-pass');
    const btnAdminLogin = document.getElementById('btn-admin-ads-login');
    const btnAdminSetPass = document.getElementById('btn-admin-ads-setpass');
    const adminMsg = document.getElementById('admin-ads-msg');
    const adminTabs = Array.from(document.querySelectorAll('.admin-tab'));
    const pageCampanas = document.getElementById('admin-page-campanas');
    const pageNueva = document.getElementById('admin-page-nueva');
    const pageStats = document.getElementById('admin-page-stats');
    const pageAjustes = document.getElementById('admin-page-ajustes');

    let adminAuthed = false;
    let adminPendingUploadDataUrl = null;

    function getAdminPassword() {
        try { return localStorage.getItem(ADS_ADMIN_PW_KEY) || ''; } catch { return ''; }
    }

    function setAdminPassword(pw) {
        try { localStorage.setItem(ADS_ADMIN_PW_KEY, pw); } catch { /* noop */ }
    }

    function setAdminMsg(text) {
        if (adminMsg) adminMsg.textContent = text || '';
    }

    function openAdminModal() {
        if (!adminModal) return;
        adminModal.classList.remove('hidden');
        adminAuthed = false;
        if (adminPanel) adminPanel.classList.add('hidden');
        if (adminLock) adminLock.classList.remove('hidden');
        const hasPw = !!getAdminPassword();
        setAdminMsg(hasPw ? 'Ingresá la clave para administrar campañas.' : 'No hay clave configurada. Usá “Crear / Cambiar clave”.');
        if (adminPassInp) {
            adminPassInp.value = '';
            setTimeout(() => adminPassInp.focus(), 50);
        }
    }

    function closeAdminModal() {
        if (!adminModal) return;
        adminModal.classList.add('hidden');
    }

    function authAdmin() {
        const stored = getAdminPassword();
        if (!stored) {
            setAdminMsg('Primero creá una clave en “Crear / Cambiar clave”.');
            return;
        }
        const typed = (adminPassInp?.value || '').trim();
        if (!typed) {
            setAdminMsg('Ingresá la clave.');
            return;
        }
        if (typed !== stored) {
            setAdminMsg('Clave incorrecta.');
            return;
        }
        adminAuthed = true;
        if (adminLock) adminLock.classList.add('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');
        showAdminTab('campanas');
        renderAdminAll();
        setAdminMsg('');
    }

    function promptChangePassword() {
        const current = getAdminPassword();
        if (current) {
            const typed = prompt('Ingresá la clave actual:');
            if (typed === null) return;
            if (typed !== current) {
                setAdminMsg('Clave actual incorrecta.');
                return;
            }
        }
        const nw = prompt('Elegí una nueva clave (mínimo 4 caracteres):');
        if (nw === null) return;
        const pw = String(nw).trim();
        if (pw.length < 4) {
            setAdminMsg('La clave debe tener al menos 4 caracteres.');
            return;
        }
        setAdminPassword(pw);
        setAdminMsg('Clave actualizada.');
    }

    function showAdminTab(tab) {
        adminTabs.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
        const map = {
            campanas: pageCampanas,
            nueva: pageNueva,
            stats: pageStats,
            ajustes: pageAjustes
        };
        Object.entries(map).forEach(([k, el]) => {
            if (!el) return;
            el.classList.toggle('hidden', k !== tab);
        });

        // refresco puntual
        if (tab === 'campanas') renderAdminCampaigns();
        if (tab === 'nueva') renderAdminNew();
        if (tab === 'stats') renderAdminStats();
        if (tab === 'ajustes') renderAdminSettings();
    }

    function renderAdminAll() {
        renderAdminCampaigns();
        renderAdminNew();
        renderAdminStats();
        renderAdminSettings();
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"]+/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m] || m));
    }

    function normalizeAdForSave(ad) {
        const clean = { ...ad };
        delete clean.__origin;
        return clean;
    }

    function getMergedAdsList() {
        return (adsCfg?.ads && Array.isArray(adsCfg.ads)) ? adsCfg.ads : [];
    }

    function upsertCustomAd(ad) {
        const list = loadCustomAds();
        const idx = list.findIndex(x => x?.id === ad.id);
        if (idx >= 0) list[idx] = normalizeAdForSave(ad);
        else list.unshift(normalizeAdForSave(ad));
        saveCustomAds(list);
    }

    function deleteCustomAd(adId) {
        const list = loadCustomAds().filter(a => a?.id !== adId);
        saveCustomAds(list);
    }

    function makeDisableOverride(adId) {
        upsertCustomAd({ id: adId, enabled: false });
    }

    function renderAdminCampaigns() {
        if (!pageCampanas) return;
        const ads = getMergedAdsList();
        const items = ads.slice().sort((a,b) => String(a.id).localeCompare(String(b.id)));

        const html = [];
        html.push(`<div class="admin-section"><div class="admin-row" style="justify-content:space-between;">
            <div>
                <div class="admin-label">Campañas</div>
                <div class="admin-small">Base + personalizadas (lo que agregues desde el celu)</div>
            </div>
            <button id="btn-admin-reload-ads" class="btn-mini btn-outline" type="button">Recargar</button>
        </div></div>`);

        html.push('<div class="admin-list">');
        for (const ad of items) {
            const on = ad.enabled !== false;
            const origin = ad.__origin === 'custom' ? 'Personalizada' : 'Base';
            const lines = Array.isArray(ad.lines) ? ad.lines.join(', ') : 'ALL';
            const dates = `${ad.start_date || '—'} → ${ad.end_date || '—'}`;
            const title = ad.alt || ad.name || ad.id;
            html.push(`<div class="admin-item" data-ad="${escapeHtml(ad.id)}">
                <div class="admin-item-head">
                    <div>
                        <p class="admin-item-title">${escapeHtml(title)}</p>
                        <div class="admin-small">ID: <b>${escapeHtml(ad.id)}</b> · ${escapeHtml(origin)} · Líneas: ${escapeHtml(lines)} · Fechas: ${escapeHtml(dates)}</div>
                    </div>
                    <div class="admin-badge ${on ? '' : 'off'}">${on ? 'ACTIVA' : 'PAUSADA'}</div>
                </div>
                <div class="admin-row" style="margin-top:10px;">
                    <button class="btn-mini ${on ? 'btn-outline' : 'btn-primary'}" type="button" data-action="toggle">${on ? 'Pausar' : 'Activar'}</button>
                    <button class="btn-mini btn-outline" type="button" data-action="edit">Editar</button>
                    <button class="btn-mini btn-outline" type="button" data-action="delete">Eliminar</button>
                    <span class="hint" style="margin-left:auto;">Tipo: ${escapeHtml(ad.type || 'image')} · Weight: ${escapeHtml(ad.weight || 1)}</span>
                </div>
            </div>`);
        }
        html.push('</div>');

        pageCampanas.innerHTML = html.join('');

        const btnReload = document.getElementById('btn-admin-reload-ads');
        if (btnReload) {
            btnReload.addEventListener('click', async () => {
                adsCfg = await loadAdsConfig();
                showNextAd();
                renderAdminCampaigns();
                renderAdminStats();
            });
        }

        // actions
        pageCampanas.querySelectorAll('.admin-item').forEach(card => {
            const adId = card.getAttribute('data-ad');
            const ad = items.find(a => a.id === adId);
            if (!ad) return;
            card.querySelectorAll('button[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const act = btn.getAttribute('data-action');
                    if (act === 'toggle') {
                        // toggle via custom override
                        const nextEnabled = !(ad.enabled !== false);
                        upsertCustomAd({ id: ad.id, enabled: nextEnabled });
                        // recargar
                        loadAdsConfig().then(cfg => {
                            adsCfg = cfg;
                            showNextAd();
                            renderAdminCampaigns();
                        });
                    }
                    if (act === 'delete') {
                        if (ad.__origin === 'custom') {
                            if (confirm('¿Eliminar esta campaña personalizada?')) {
                                deleteCustomAd(ad.id);
                                loadAdsConfig().then(cfg => {
                                    adsCfg = cfg;
                                    showNextAd();
                                    renderAdminCampaigns();
                                    renderAdminStats();
                                });
                            }
                        } else {
                            // base: crear override disabled
                            if (confirm('Esta campaña es de base. ¿Querés ocultarla (pausarla) en tu app?')) {
                                makeDisableOverride(ad.id);
                                loadAdsConfig().then(cfg => {
                                    adsCfg = cfg;
                                    showNextAd();
                                    renderAdminCampaigns();
                                });
                            }
                        }
                    }
                    if (act === 'edit') {
                        // Abrimos pestaña "Nueva" en modo editar
                        showAdminTab('nueva');
                        renderAdminNew(ad);
                    }
                });
            });
        });
    }

    function slugify(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 40) || 'ad';
    }

    function buildLinesCheckboxes(selected) {
        const all = ['ALL', 'A', 'E', 'ESTE', 'OESTE'];
        const sel = Array.isArray(selected) && selected.length ? selected : ['ALL'];
        return all.map(k => {
            const checked = sel.includes(k) ? 'checked' : '';
            const label = k === 'ALL' ? 'Todas' : k;
            return `<label class="chk-inline" style="margin:0;">
                <input type="checkbox" class="ad-lines" value="${k}" ${checked}>
                <span>${label}</span>
            </label>`;
        }).join('');
    }

    function renderAdminNew(adToEdit = null) {
        if (!pageNueva) return;
        adminPendingUploadDataUrl = null;

        const isEdit = !!adToEdit;
        const ad = adToEdit ? { ...adToEdit } : {
            id: '',
            type: 'image',
            src: '',
            href: '',
            alt: '',
            placements: ['horarios_top'],
            lines: ['ALL'],
            start_date: '',
            end_date: '',
            weight: 1,
            enabled: true
        };

        const safeId = escapeHtml(ad.id || '');
        const safeAlt = escapeHtml(ad.alt || '');
        const safeSrc = escapeHtml(ad.src || '');
        const safeHref = escapeHtml(ad.href || '');
        const safeStart = escapeHtml(ad.start_date || '');
        const safeEnd = escapeHtml(ad.end_date || '');
        const safeWeight = escapeHtml(ad.weight || 1);
        const safeEnabled = ad.enabled !== false;

        pageNueva.innerHTML = `
            <div class="admin-section">
                <div class="admin-row" style="justify-content:space-between;">
                    <div>
                        <div class="admin-label">${isEdit ? 'Editar campaña' : 'Nueva campaña'}</div>
                        <div class="admin-small">Imágenes/GIF se pueden cargar desde el celu (se guardan en el dispositivo). Video: pegá un link MP4/WebM.</div>
                    </div>
                </div>

                <div class="admin-grid">
                    <div>
                        <div class="admin-label">Nombre (Alt)</div>
                        <input id="ad-form-alt" class="admin-input" type="text" placeholder="Ej: Pizzería Don Pepe" value="${safeAlt}">
                    </div>
                    <div>
                        <div class="admin-label">Tipo</div>
                        <select id="ad-form-type" class="admin-select">
                            <option value="image" ${String(ad.type).toLowerCase() !== 'video' ? 'selected' : ''}>Imagen / GIF</option>
                            <option value="video" ${String(ad.type).toLowerCase() === 'video' ? 'selected' : ''}>Video</option>
                        </select>
                    </div>
                </div>

                <div class="admin-label">Archivo (src)</div>
                <div class="admin-row">
                    <input id="ad-form-src" class="admin-input" type="text" placeholder="URL o ruta (ads/mi_banner.webp)" value="${safeSrc}">
                    <input id="ad-form-file" class="sr-only" type="file" accept="image/*">
                    <button id="ad-form-pick" class="btn-mini btn-outline" type="button">Cargar imagen</button>
                </div>
                <p class="hint">Tip: para WhatsApp usá: https://wa.me/549XXXXXXXXXX?text=Hola%20... (link directo)</p>

                <div class="admin-grid">
                    <div>
                        <div class="admin-label">Link (href)</div>
                        <input id="ad-form-href" class="admin-input" type="text" placeholder="https://wa.me/..." value="${safeHref}">
                    </div>
                    <div>
                        <div class="admin-label">Peso (rotación)</div>
                        <input id="ad-form-weight" class="admin-input" type="number" min="1" step="1" value="${safeWeight}">
                    </div>
                </div>

                <div class="admin-label">Segmentación (líneas)</div>
                <div class="admin-row" style="gap:14px;">${buildLinesCheckboxes(ad.lines)}</div>

                <div class="admin-grid" style="margin-top:10px;">
                    <div>
                        <div class="admin-label">Inicio</div>
                        <input id="ad-form-start" class="admin-input" type="date" value="${safeStart}">
                    </div>
                    <div>
                        <div class="admin-label">Fin</div>
                        <input id="ad-form-end" class="admin-input" type="date" value="${safeEnd}">
                    </div>
                </div>

                <div class="admin-row" style="margin-top:10px;">
                    <label class="chk-inline" style="margin:0;">
                        <input id="ad-form-enabled" type="checkbox" ${safeEnabled ? 'checked' : ''}>
                        <span>Activa</span>
                    </label>
                    <span class="hint">Placement: horarios_top</span>
                </div>

                <div class="admin-actions">
                    <button id="ad-form-save" class="btn-mini btn-primary" type="button">${isEdit ? 'Guardar cambios' : 'Crear campaña'}</button>
                    ${isEdit ? '<button id="ad-form-dup" class="btn-mini btn-outline" type="button">Duplicar</button>' : ''}
                    <button id="ad-form-clear" class="btn-mini btn-outline" type="button">Limpiar</button>
                </div>

                <div id="ad-form-preview" class="admin-preview hidden"></div>
                <p id="ad-form-msg" class="hint"></p>
            </div>
        `;

        const elMsg = document.getElementById('ad-form-msg');
        const setMsg = (t) => { if (elMsg) elMsg.textContent = t || ''; };

        const elType = document.getElementById('ad-form-type');
        const elSrc = document.getElementById('ad-form-src');
        const elAlt = document.getElementById('ad-form-alt');
        const elHref = document.getElementById('ad-form-href');
        const elWeight = document.getElementById('ad-form-weight');
        const elStart = document.getElementById('ad-form-start');
        const elEnd = document.getElementById('ad-form-end');
        const elEnabled = document.getElementById('ad-form-enabled');
        const elPreview = document.getElementById('ad-form-preview');
        const elFile = document.getElementById('ad-form-file');

        function updatePreview() {
            if (!elPreview) return;
            const type = (elType?.value || 'image').toLowerCase();
            const src = (adminPendingUploadDataUrl || elSrc?.value || '').trim();
            if (!src) {
                elPreview.classList.add('hidden');
                elPreview.innerHTML = '';
                return;
            }
            elPreview.classList.remove('hidden');
            if (type === 'video') {
                elPreview.innerHTML = `<video src="${escapeHtml(src)}" controls muted playsinline style="max-height:260px;"></video>`;
            } else {
                elPreview.innerHTML = `<img src="${escapeHtml(src)}" alt="preview">`;
            }
        }

        updatePreview();
        if (elType) elType.addEventListener('change', updatePreview);
        if (elSrc) elSrc.addEventListener('input', updatePreview);

        const btnPick = document.getElementById('ad-form-pick');
        if (btnPick && elFile) {
            btnPick.addEventListener('click', () => elFile.click());
            elFile.addEventListener('change', () => {
                const f = elFile.files && elFile.files[0];
                if (!f) return;
                // límite para que no rompa localStorage
                const maxBytes = 450 * 1024; // ~450 KB
                if (f.size > maxBytes) {
                    setMsg('La imagen es muy pesada para guardar en el dispositivo. Usá una URL o una imagen más liviana (ideal < 450KB).');
                    elFile.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    adminPendingUploadDataUrl = String(reader.result || '');
                    setMsg('Imagen cargada desde el dispositivo (se guarda dentro de la app).');
                    updatePreview();
                };
                reader.readAsDataURL(f);
            });
        }

        function collectLines() {
            const checked = Array.from(pageNueva.querySelectorAll('input.ad-lines:checked')).map(x => x.value);
            return checked.length ? checked : ['ALL'];
        }

        function buildAdPayload(baseId) {
            const alt = (elAlt?.value || '').trim();
            const type = (elType?.value || 'image').toLowerCase();
            const src = (adminPendingUploadDataUrl || elSrc?.value || '').trim();
            const href = (elHref?.value || '').trim();
            const weight = Math.max(1, Number(elWeight?.value || 1) || 1);
            const start_date = (elStart?.value || '').trim();
            const end_date = (elEnd?.value || '').trim();
            const enabled = !!(elEnabled?.checked);
            const lines = collectLines();

            return {
                id: baseId,
                type,
                src,
                href,
                alt: alt || baseId,
                placements: ['horarios_top'],
                lines,
                start_date: start_date || undefined,
                end_date: end_date || undefined,
                weight,
                enabled
            };
        }

        const btnSave = document.getElementById('ad-form-save');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const baseId = isEdit && ad.id ? ad.id : `custom_${slugify(elAlt?.value || '')}_${Date.now()}`;
                const payload = buildAdPayload(baseId);
                if (!payload.src) {
                    setMsg('Falta el archivo (src). Cargá una imagen o pegá una URL/ruta.');
                    return;
                }
                if ((payload.type === 'video') && !/^https?:\/\//i.test(payload.src)) {
                    setMsg('Para video, usá una URL (MP4/WebM).');
                    return;
                }

                upsertCustomAd(payload);
                adsCfg = await loadAdsConfig();
                showNextAd();
                setMsg('Guardado ✅');
                renderAdminCampaigns();
                renderAdminStats();
            });
        }

        const btnClear = document.getElementById('ad-form-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                renderAdminNew(null);
            });
        }

        const btnDup = document.getElementById('ad-form-dup');
        if (btnDup) {
            btnDup.addEventListener('click', () => {
                const newId = `custom_${slugify(elAlt?.value || ad.id)}_${Date.now()}`;
                const payload = buildAdPayload(newId);
                upsertCustomAd(payload);
                loadAdsConfig().then(cfg => {
                    adsCfg = cfg;
                    showNextAd();
                    renderAdminCampaigns();
                    renderAdminStats();
                    setMsg('Duplicado ✅');
                });
            });
        }
    }

    function renderAdminStats() {
        if (!pageStats) return;
        let stats = {};
        try {
            const raw = localStorage.getItem(ADS_STATS_KEY);
            stats = raw ? JSON.parse(raw) : {};
        } catch { stats = {}; }

        const ads = getMergedAdsList();
        const rows = Object.entries(stats).map(([id, s]) => ({
            id,
            alt: (ads.find(a => a.id === id)?.alt) || id,
            impressions: Number(s?.impressions || 0),
            clicks: Number(s?.clicks || 0)
        })).sort((a,b) => b.impressions - a.impressions);

        const html = [];
        html.push(`<div class="admin-section">
            <div class="admin-row" style="justify-content:space-between;">
                <div>
                    <div class="admin-label">Estadísticas (locales)</div>
                    <div class="admin-small">Se guardan en este dispositivo (localStorage).</div>
                </div>
                <div class="admin-row">
                    <button id="btn-ads-export-stats" class="btn-mini btn-outline" type="button">Exportar</button>
                    <button id="btn-ads-reset-stats" class="btn-mini btn-outline" type="button">Reset</button>
                </div>
            </div>
        </div>`);

        if (!rows.length) {
            html.push('<p class="hint">Todavía no hay datos (impresiones/clicks).</p>');
            pageStats.innerHTML = html.join('');
        } else {
            html.push(`
                <div class="admin-section" style="overflow:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                        <thead><tr>
                            <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(255,255,255,0.10);">Campaña</th>
                            <th style="text-align:right; padding:8px; border-bottom:1px solid rgba(255,255,255,0.10);">Impresiones</th>
                            <th style="text-align:right; padding:8px; border-bottom:1px solid rgba(255,255,255,0.10);">Clicks</th>
                            <th style="text-align:right; padding:8px; border-bottom:1px solid rgba(255,255,255,0.10);">CTR</th>
                        </tr></thead>
                        <tbody>
            `);
            rows.forEach(r => {
                const ctr = r.impressions ? ((r.clicks / r.impressions) * 100) : 0;
                html.push(`<tr>
                    <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.06);">${escapeHtml(r.alt)}</td>
                    <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.06); text-align:right;">${r.impressions}</td>
                    <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.06); text-align:right;">${r.clicks}</td>
                    <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.06); text-align:right;">${ctr.toFixed(1)}%</td>
                </tr>`);
            });
            html.push('</tbody></table></div>');
            pageStats.innerHTML = html.join('');
        }

        const btnExport = document.getElementById('btn-ads-export-stats');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), stats }, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mi_colectivo_ads_stats.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 500);
            });
        }

        const btnReset = document.getElementById('btn-ads-reset-stats');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (!confirm('¿Borrar estadísticas locales?')) return;
                try { localStorage.removeItem(ADS_STATS_KEY); } catch { /* noop */ }
                renderAdminStats();
            });
        }
    }

    function renderAdminSettings() {
        if (!pageAjustes) return;
        const s = loadAdsSettings();
        const rotateSec = Math.round((s.rotate_ms || ADS_DEFAULT_ROTATE_MS) / 1000);

        pageAjustes.innerHTML = `
            <div class="admin-section">
                <div class="admin-label">Rotación</div>
                <div class="admin-row">
                    <input id="ads-rotate-sec" class="admin-input" type="number" min="5" step="1" value="${escapeHtml(rotateSec)}" style="max-width:140px;">
                    <span class="admin-small">segundos por pieza</span>
                    <button id="btn-ads-save-settings" class="btn-mini btn-primary" type="button">Guardar</button>
                </div>
                <p class="hint">Si querés que un anunciante salga más, subí su “Peso (rotación)”.</p>
            </div>

            <div class="admin-section">
                <div class="admin-label">Campañas personalizadas</div>
                <div class="admin-row">
                    <button id="btn-ads-export-custom" class="btn-mini btn-outline" type="button">Exportar JSON</button>
                    <input id="inp-ads-import" class="sr-only" type="file" accept="application/json">
                    <button id="btn-ads-import" class="btn-mini btn-outline" type="button">Importar JSON</button>
                    <button id="btn-ads-clear-custom" class="btn-mini btn-outline" type="button">Borrar todas</button>
                </div>
                <p class="hint">Exportar/Importar sirve para migrar campañas entre dispositivos.</p>
            </div>
        `;

        const btnSave = document.getElementById('btn-ads-save-settings');
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                const sec = Number(document.getElementById('ads-rotate-sec')?.value || rotateSec);
                const ms = Math.max(5000, Math.round(sec * 1000));
                saveAdsSettings({ rotate_ms: ms });
                adsRotateMs = ms;
                if (adsTimer) clearInterval(adsTimer);
                adsTimer = setInterval(() => {
                    if (document.hidden) return;
                    showNextAd();
                }, adsRotateMs);
                alert('Guardado ✅');
            });
        }

        const btnExport = document.getElementById('btn-ads-export-custom');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                const payload = { exported_at: new Date().toISOString(), custom_ads: loadCustomAds() };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mi_colectivo_ads_custom.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 500);
            });
        }

        const inpImport = document.getElementById('inp-ads-import');
        const btnImport = document.getElementById('btn-ads-import');
        if (btnImport && inpImport) {
            btnImport.addEventListener('click', () => inpImport.click());
            inpImport.addEventListener('change', async () => {
                const f = inpImport.files && inpImport.files[0];
                if (!f) return;
                try {
                    const text = await f.text();
                    const json = JSON.parse(text);
                    const list = Array.isArray(json?.custom_ads) ? json.custom_ads : (Array.isArray(json) ? json : []);
                    if (!Array.isArray(list)) throw new Error('Formato inválido');
                    // merge by id (import pisa)
                    const current = loadCustomAds();
                    const byId = new Map(current.filter(a => a?.id).map(a => [a.id, a]));
                    list.filter(a => a?.id).forEach(a => byId.set(a.id, a));
                    saveCustomAds(Array.from(byId.values()));
                    adsCfg = await loadAdsConfig();
                    showNextAd();
                    renderAdminCampaigns();
                    renderAdminStats();
                    alert('Importado ✅');
                } catch {
                    alert('No se pudo importar. Verificá el JSON.');
                } finally {
                    inpImport.value = '';
                }
            });
        }

        const btnClear = document.getElementById('btn-ads-clear-custom');
        if (btnClear) {
            btnClear.addEventListener('click', async () => {
                if (!confirm('¿Borrar TODAS las campañas personalizadas?')) return;
                saveCustomAds([]);
                adsCfg = await loadAdsConfig();
                showNextAd();
                renderAdminCampaigns();
                renderAdminStats();
            });
        }
    }

    function bindAdminTriggers() {
        if (btnAdminCerrar) btnAdminCerrar.addEventListener('click', closeAdminModal);
        if (adminModal) {
            adminModal.addEventListener('click', (e) => {
                if (e.target === adminModal) closeAdminModal();
            });
        }
        if (btnAdminLogin) btnAdminLogin.addEventListener('click', authAdmin);
        if (btnAdminSetPass) btnAdminSetPass.addEventListener('click', promptChangePassword);
        if (adminPassInp) adminPassInp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') authAdmin();
            if (e.key === 'Escape') closeAdminModal();
        });

        adminTabs.forEach(t => t.addEventListener('click', () => {
            if (!adminAuthed) return;
            showAdminTab(t.getAttribute('data-tab'));
        }));

        // Abrir con Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && adminModal && !adminModal.classList.contains('hidden')) closeAdminModal();
            if (e.ctrlKey && e.shiftKey && String(e.key).toLowerCase() === 'p') {
                openAdminModal();
            }
        });

        // Abrir con mantener presionado sobre la publicidad (banner)
        if (adSlotTop) {
            let holdTimer = null;
            let startX = 0;
            let startY = 0;

            const clear = () => {
                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }
            };

            adSlotTop.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                startX = e.clientX || 0;
                startY = e.clientY || 0;
                clear();
                holdTimer = setTimeout(() => {
                    clear();
                    openAdminModal();
                }, 1200);
            });

            adSlotTop.addEventListener('pointermove', (e) => {
                if (!holdTimer) return;
                const dx = Math.abs((e.clientX || 0) - startX);
                const dy = Math.abs((e.clientY || 0) - startY);
                if (dx > 10 || dy > 10) clear();
            });

            ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => adSlotTop.addEventListener(ev, clear));
        }
    }

// --- HELPERS ---
    function formatearFecha(fecha) {
        const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
        const fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
        return fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
    }

    function determinarDiaKey(fecha) {
        const d = fecha.getDay(); // 0 Dom, 6 Sab
        if (d === 0) return "domingos";
        if (d === 6) return "sabados";
        return "lunes_a_viernes";
    }

    function normalizeText(s) {
        if (!s) return "";
        return s
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getLogicalStopsList() {
        // Las paradas lógicas vienen de los horarios (selector)
        if (!selectorParada) return [];
        return Array.from(selectorParada.options)
            .map(o => o.value)
            .filter(v => v && typeof v === 'string');
    }

    function getMapDataForLine(lineKey) {
        return (MAP_DATA && MAP_DATA[lineKey]) ? MAP_DATA[lineKey] : null;
    }

    function getLineaData() {
        return HORARIOS_APP[lineaActualKey] || null;
    }

    function getHorariosLineaTemporada() {
        const linea = getLineaData();
        if (!linea || !linea.temporadas) return null;
        return linea.temporadas[temporadaActualKey] || null;
    }

    function actualizarListaViajesPorFecha() {
        diaActualKey = determinarDiaKey(new Date());
        const horarios = getHorariosLineaTemporada();
        listaViajesActual = (horarios && Array.isArray(horarios[diaActualKey])) ? horarios[diaActualKey] : [];
    }

    function setSegmentActive(btns, activeBtn) {
        btns.forEach(b => {
            b.classList.toggle('active', b === activeBtn);
            b.setAttribute('aria-selected', b === activeBtn ? 'true' : 'false');
        });
    }

    function syncSeasonUI() {
        if (!selectorTemporada) return;

        if (temporadaActualKey !== selectorTemporada.value) selectorTemporada.value = temporadaActualKey;

        if (btnSegRegular && btnSegVerano) {
            if (temporadaActualKey === "regular") setSegmentActive([btnSegRegular, btnSegVerano], btnSegRegular);
            else setSegmentActive([btnSegRegular, btnSegVerano], btnSegVerano);
        }

        const lineaData = getLineaData();
        // Aplica colores del entorno según la línea
        applyThemeForLine(lineaActualKey);

        if (headerTitle && lineaData && lineaData.nombre) {
            headerTitle.textContent = lineaData.nombre;
            document.title = `${lineaData.nombre} - Mi Colectivo`;
        }
    }

    function syncLineUI() {
        if (selectorLinea && selectorLinea.value !== lineaActualKey) selectorLinea.value = lineaActualKey;

        if (lineaButtons && lineaButtons.length) {
            const activo = Array.from(lineaButtons).find(b => b.getAttribute('data-linea') === lineaActualKey);
            if (activo) setSegmentActive(Array.from(lineaButtons), activo);
        }

        const lineaData = getLineaData();
        // Aplica colores del entorno según la línea
        applyThemeForLine(lineaActualKey);

        if (headerTitle && lineaData && lineaData.nombre) {
            headerTitle.textContent = lineaData.nombre;
            document.title = `${lineaData.nombre} - Mi Colectivo`;
        }
    }

    function mostrarSinDatos(mensaje) {
        selectorParada.innerHTML = `<option disabled selected>${mensaje}</option>`;
        timelineContainer.classList.add('hidden');
        mensajeError.classList.remove('hidden');
        mensajeError.textContent = mensaje;
    }

    // --- 1. INICIALIZACIÓN ---
    function iniciarApp() {
        const fecha = new Date();
        displayFecha.textContent = formatearFecha(fecha);

        // Tema de fondo (claro/oscuro)
        applyUiTheme(loadUiTheme(), { persist: false });
        bindUiThemeToggle();

        // Skin de marca (fondo + logo)
        baseSkin = getAppSkin();
        applyBrandSkin(baseSkin);

        syncLineUI();
        syncSeasonUI();

        actualizarListaViajesPorFecha();
        llenarSelectorParadas();

        cargarFavoritaUI();

        // Publicidades
        initAds();
        bindAdminTriggers();
    }

    // --- 2. LLENAR SELECTOR ---
    function llenarSelectorParadas() {
        if (!listaViajesActual || listaViajesActual.length === 0) {
            const lineaNombre = getLineaData()?.nombre || "esta línea";
            const temporadaNombre = (temporadaActualKey === "regular") ? "Ciclo lectivo" : "Receso de verano";
            mostrarSinDatos(`Sin horarios cargados para ${lineaNombre} (${temporadaNombre})`);
            return;
        }

        const filaReferencia = listaViajesActual.find(v => v && typeof v === "object");
        if (!filaReferencia) {
            mostrarSinDatos("Sin datos disponibles");
            return;
        }

        const paradas = Object.keys(filaReferencia);

        selectorParada.innerHTML = '<option value="" disabled selected>Selecciona tu parada...</option>';
        paradas.forEach(parada => {
            const option = document.createElement('option');
            option.value = parada;
            option.textContent = parada;
            selectorParada.appendChild(option);
        });

        mensajeError.classList.add('hidden');
    }

    // --- 3. LÓGICA DE TIEMPO Y TIMELINE ---
    function actualizarTimeline() {
        const parada = selectorParada.value;
        if (!parada) return;

        if (!listaViajesActual || listaViajesActual.length === 0) {
            mensajeError.classList.remove('hidden');
            mensajeError.textContent = "No hay horarios para mostrar.";
            timelineContainer.classList.add('hidden');
            return;
        }

        const ahora = new Date();
        const minutosActuales = (ahora.getHours() * 60) + ahora.getMinutes();

        const viajesValidos = listaViajesActual.filter(v => v && v[parada] && v[parada] !== "---" && v[parada] !== null);

        let indiceProximo = -1;

        for (let i = 0; i < viajesValidos.length; i++) {
            const horarioStr = viajesValidos[i][parada];
            if (!horarioStr || typeof horarioStr !== "string") continue;

            const parts = horarioStr.split(':');
            if (parts.length < 2) continue;

            const h = Number(parts[0]);
            const m = Number(parts[1]);
            if (Number.isNaN(h) || Number.isNaN(m)) continue;

            let minutosViaje = (h * 60) + m;

            if (h < 4) minutosViaje += 24 * 60;

            if (minutosViaje > minutosActuales) {
                indiceProximo = i;
                break;
            }
        }

        if (indiceProximo !== -1) {
            timelineContainer.classList.remove('hidden');
            mensajeError.classList.add('hidden');

            if (indiceProximo > 0) {
                prevHora.textContent = viajesValidos[indiceProximo - 1][parada];
                prevHora.parentElement.classList.remove('hidden');
            } else {
                prevHora.parentElement.classList.add('hidden');
            }

            const horarioActual = viajesValidos[indiceProximo][parada];
            const [hStr, mStr] = horarioActual.split(':');
            const h = Number(hStr);
            const m = Number(mStr);

            let minViaje = (h * 60) + m;
            if (h < 4) minViaje += 24 * 60;

            const dif = minViaje - minutosActuales;

            mainHora.textContent = horarioActual;

            if (dif === 0) {
                mainCountdown.textContent = "¡Llegando!";
                mainCountdown.style.background = "#4caf50";
            } else if (dif < 60) {
                mainCountdown.textContent = `En ${dif} min`;
                mainCountdown.style.background = "rgba(0,0,0,0.25)";
            } else {
                const horas = Math.floor(dif / 60);
                const mins = dif % 60;
                mainCountdown.textContent = `En ${horas}h ${mins}m`;
                mainCountdown.style.background = "rgba(0,0,0,0.25)";
            }

            if (indiceProximo + 1 < viajesValidos.length) {
                const hNext1 = viajesValidos[indiceProximo + 1][parada];
                next1Hora.textContent = hNext1;

                const [h1, m1] = hNext1.split(':').map(Number);
                let min1 = (h1 * 60) + m1;
                if (h1 < 4) min1 += 24 * 60;
                next1Diff.textContent = (min1 - minutosActuales) + " min";

                next1Hora.parentElement.classList.remove('hidden');
            } else {
                next1Hora.parentElement.classList.add('hidden');
            }

            if (indiceProximo + 2 < viajesValidos.length) {
                const hNext2 = viajesValidos[indiceProximo + 2][parada];
                next2Hora.textContent = hNext2;

                const [h2, m2] = hNext2.split(':').map(Number);
                let min2 = (h2 * 60) + m2;
                if (h2 < 4) min2 += 24 * 60;
                next2Diff.textContent = (min2 - minutosActuales) + " min";

                next2Hora.parentElement.classList.remove('hidden');
            } else {
                next2Hora.parentElement.classList.add('hidden');
            }

        } else {
            timelineContainer.classList.add('hidden');
            mensajeError.classList.remove('hidden');
            mensajeError.textContent = "No hay más servicios por hoy.";
        }
    }

    // --- 4. TABLAS COMPLETAS ---
    function mostrarTablas() {
        pantallaPrincipal.classList.add('hidden');
        pantallaTablas.classList.remove('hidden');
        renderizarTabla(diaActualKey);

        tabButtons.forEach(btn => btn.classList.remove('active'));
        const btnActivo = document.querySelector(`.tab-btn[data-dia="${diaActualKey}"]`);
        if (btnActivo) btnActivo.classList.add('active');
    }

    function cerrarTablas() {
        pantallaTablas.classList.add('hidden');
        pantallaPrincipal.classList.remove('hidden');
    }

    function renderizarTabla(keyDia) {
        const horarios = getHorariosLineaTemporada();
        const datos = (horarios && Array.isArray(horarios[keyDia])) ? horarios[keyDia] : [];

        tablaHead.innerHTML = '';
        tablaBody.innerHTML = '';

        if (!datos || datos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = "Sin datos";
            td.colSpan = 1;
            tr.appendChild(td);
            tablaBody.appendChild(tr);
            return;
        }

        const filaRef = datos.find(d => d && typeof d === "object") || datos[0];
        const paradas = Object.keys(filaRef);

        const trHead = document.createElement('tr');
        paradas.forEach(p => {
            const th = document.createElement('th');
            th.textContent = p;
            trHead.appendChild(th);
        });
        tablaHead.appendChild(trHead);

        datos.forEach(viaje => {
            const tr = document.createElement('tr');
            paradas.forEach(p => {
                const td = document.createElement('td');
                td.textContent = viaje[p] || '-';
                tr.appendChild(td);
            });
            tablaBody.appendChild(tr);
        });
    }

    // --- 5. MAPA ---
    function loadUserMapping(lineKey) {
        if (userMappingCache[lineKey]) return userMappingCache[lineKey];
        try {
            const raw = localStorage.getItem(MAP_STORAGE_PREFIX + lineKey);
            const parsed = raw ? JSON.parse(raw) : null;
            userMappingCache[lineKey] = (parsed && typeof parsed === 'object') ? parsed : {};
        } catch {
            userMappingCache[lineKey] = {};
        }
        return userMappingCache[lineKey];
    }

    function saveUserMapping(lineKey, mapping) {
        userMappingCache[lineKey] = mapping || {};
        try {
            localStorage.setItem(MAP_STORAGE_PREFIX + lineKey, JSON.stringify(userMappingCache[lineKey]));
        } catch {
            // sin almacenamiento, seguimos igual
        }
    }

    function computeDefaultMapping(lineKey, logicalStops, stops) {
        const cacheKey = lineKey + '|' + logicalStops.join('||');
        if (defaultMappingCache[cacheKey]) return defaultMappingCache[cacheKey];

        const byNorm = new Map();
        stops.forEach(s => {
            const n = normalizeText(s.name);
            if (!n) return;
            if (!byNorm.has(n)) byNorm.set(n, s.id);
        });

        const stopTokens = stops.map(s => ({
            id: s.id,
            norm: normalizeText(s.name),
            tokens: new Set(normalizeText(s.name).split(' ').filter(Boolean)),
        }));

        const mapping = {};
        logicalStops.forEach(ls => {
            const norm = normalizeText(ls);
            if (!norm) return;
            if (byNorm.has(norm)) {
                mapping[ls] = byNorm.get(norm);
                return;
            }
            const lt = new Set(norm.split(' ').filter(Boolean));
            let best = { id: null, score: -1 };
            stopTokens.forEach(st => {
                if (!st.norm) return;
                // score simple por tokens compartidos
                let common = 0;
                lt.forEach(t => { if (st.tokens.has(t)) common++; });
                if (common === 0) return;
                const lenPenalty = Math.abs(st.tokens.size - lt.size) * 0.25;
                const score = common - lenPenalty;
                if (score > best.score) best = { id: st.id, score };
            });
            if (best.id !== null && best.score >= 1) mapping[ls] = best.id;
        });

        defaultMappingCache[cacheKey] = mapping;
        return mapping;
    }

    function getEffectiveMapping(lineKey) {
        const mapData = getMapDataForLine(lineKey);
        if (!mapData) return { mapping: {}, defaults: {} };
        const logicalStops = getLogicalStopsList();
        const defaults = computeDefaultMapping(lineKey, logicalStops, mapData.stops || []);
        const user = loadUserMapping(lineKey);
        return { mapping: { ...defaults, ...user }, defaults };
    }

    function reverseMapping(mapping) {
        const rev = {};
        Object.keys(mapping || {}).forEach(ls => {
            const id = mapping[ls];
            if (id === null || id === undefined) return;
            if (!rev[id]) rev[id] = [];
            rev[id].push(ls);
        });
        return rev;
    }

    function getLineColor(lineKey) {
        const t = getLineTheme(lineKey);
        return (t && t.accent) ? t.accent : '#ff3b30';
    }

    // --- ICONOS DEL MAPA (v19) ---
    // Paradas: icono chico (círculo con colectivo) + destacado (pin con colectivo)
    // Mi ubicación: pin azul con personita

    const BUS_GLYPH_SVG = `
      <svg class="mk-glyph mk-glyph--bus" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4.5" width="12" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M6 10h12" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="8.5" cy="18.2" r="1.2" fill="currentColor"/>
        <circle cx="15.5" cy="18.2" r="1.2" fill="currentColor"/>
      </svg>
    `.trim();

    const PERSON_GLYPH_SVG = `
      <svg class="mk-glyph mk-glyph--person" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M5.5 20c1.2-4 11.8-4 13 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `.trim();

    function makeStopIcon(isHighlighted) {
        if (isHighlighted) {
            return L.divIcon({
                className: 'stop-divicon',
                html: `
                    <div class="mk-marker mk-marker--stop mk-marker--pin" aria-hidden="true">
                        <svg class="mk-pin-svg" viewBox="0 0 32 44" focusable="false" aria-hidden="true">
                            <path class="mk-pin-shape" d="M16 1C9.4 1 4 6.4 4 13c0 9.8 12 29 12 29s12-19.2 12-29C28 6.4 22.6 1 16 1z"></path>
                            <circle class="mk-pin-inner" cx="16" cy="13" r="8.5"></circle>
                        </svg>
                        <div class="mk-pin-glyph">${BUS_GLYPH_SVG}</div>
                    </div>
                `.trim(),
                iconSize: [32, 44],
                iconAnchor: [16, 44],
                popupAnchor: [0, -38],
            });
        }

        return L.divIcon({
            className: 'stop-divicon',
            html: `
                <div class="mk-marker mk-marker--stop mk-marker--badge" aria-hidden="true">
                    <div class="mk-badge">${BUS_GLYPH_SVG}</div>
                </div>
            `.trim(),
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            popupAnchor: [0, -14],
        });
    }

    function makeUserIcon() {
        return L.divIcon({
            className: 'stop-divicon',
            html: `
                <div class="mk-marker mk-marker--user mk-marker--pin" aria-hidden="true">
                    <svg class="mk-pin-svg" viewBox="0 0 32 44" focusable="false" aria-hidden="true">
                        <path class="mk-pin-shape" d="M16 1C9.4 1 4 6.4 4 13c0 9.8 12 29 12 29s12-19.2 12-29C28 6.4 22.6 1 16 1z"></path>
                        <circle class="mk-pin-inner" cx="16" cy="13" r="8.5"></circle>
                    </svg>
                    <div class="mk-pin-glyph">${PERSON_GLYPH_SVG}</div>
                </div>
            `.trim(),
            iconSize: [32, 44],
            iconAnchor: [16, 44],
            popupAnchor: [0, -38],
        });
    }

    function initMapIfNeeded() {
        if (map || !pantallaMapa) return;
        map = L.map('map', {
            zoomControl: true,
        });
        // base map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        routePolyline = L.polyline([], { color: getLineColor(lineaActualKey), weight: 5, opacity: 0.85 });
        routePolyline.addTo(map);
        stopsGroup = L.layerGroup();
        stopsGroup.addTo(map);
    }

    function clearSearchResults() {
        if (!buscarResultados) return;
        buscarResultados.innerHTML = '';
        buscarResultados.classList.add('hidden');
    }

    function fillLogicalStopsSelect() {
        if (!selParadaLogica) return;
        const logicalStops = getLogicalStopsList();
        selParadaLogica.innerHTML = '<option value="" disabled selected>Elegí una parada…</option>';
        logicalStops.forEach(ls => {
            const opt = document.createElement('option');
            opt.value = ls;
            opt.textContent = ls;
            selParadaLogica.appendChild(opt);
        });
    }

    function getNextTimesForLogicalStop(ls, maxCount = 3) {
        if (!ls || !listaViajesActual || !listaViajesActual.length) return [];
        const now = new Date();
        const hNow = now.getHours();
        const mNow = now.getMinutes();
        let minNow = hNow * 60 + mNow;
        if (hNow < 4) minNow += 24 * 60;

        const valid = listaViajesActual
            .filter(v => v && v[ls])
            .map(v => v[ls])
            .map(hm => {
                const [hS, mS] = hm.split(':');
                const h = Number(hS);
                const m = Number(mS);
                let mn = h * 60 + m;
                if (h < 4) mn += 24 * 60;
                return { hm, mn };
            })
            .sort((a, b) => a.mn - b.mn);

        const next = valid.filter(x => x.mn >= minNow).slice(0, maxCount).map(x => x.hm);
        return next;
    }

    function openStopPopup(stop, revMap, effectiveMapping) {
        if (!stop || !map || !currentStopMarkersById[stop.id]) return;
        const marker = currentStopMarkersById[stop.id];
        const logicals = revMap[String(stop.id)] || [];

        let extra = '';
        if (logicals.length) {
            extra += `<div class="stop-popup__sub">Parada(s) en grilla: <b>${logicals.join(', ')}</b></div>`;
        }

        const selectedLogical = selectorParada?.value;
        if (selectedLogical && effectiveMapping[selectedLogical] === stop.id) {
            const next = getNextTimesForLogicalStop(selectedLogical, 3);
            if (next.length) {
                extra += `<div class="stop-popup__meta">Próximos: ${next.join(' • ')}</div>`;
            }
        } else if (logicals.length) {
            const next = getNextTimesForLogicalStop(logicals[0], 3);
            if (next.length) {
                extra += `<div class="stop-popup__meta">Próximos (${logicals[0]}): ${next.join(' • ')}</div>`;
            }
        }

        const html = `
            <div class="stop-popup">
                <div class="stop-popup__head">
                    <div class="stop-popup__title">${stop.name || 'Parada'}</div>
                    ${extra}
                </div>
            </div>
        `;
        marker.bindPopup(html, { closeButton: true }).openPopup();
    }

    function setHighlightedStop(stopId) {
        if (!currentStopMarkersById) return;
        if (highlightedStopId !== null && currentStopMarkersById[highlightedStopId]) {
            currentStopMarkersById[highlightedStopId].setIcon(makeStopIcon(false));
        }
        highlightedStopId = stopId;
        if (stopId !== null && currentStopMarkersById[stopId]) {
            currentStopMarkersById[stopId].setIcon(makeStopIcon(true));
        }
    }

    function highlightLogicalStopOnMap(logicalStop, opts = {}) {
        const { pan = true } = opts;
        if (!logicalStop || !map) return;
        const { mapping } = getEffectiveMapping(lineaActualKey);
        const sid = mapping[logicalStop];
        if (sid === null || sid === undefined) return;
        setHighlightedStop(sid);
        const m = currentStopMarkersById[sid];
        if (pan && m) {
            map.panTo(m.getLatLng(), { animate: true, duration: 0.5 });
        }
    }

    function refreshMapForLine(lineKey, opts = {}) {
        const { keepView = false } = opts;
        initMapIfNeeded();
        if (!map) return;

        const mapData = getMapDataForLine(lineKey);
        currentMapData = mapData;
        currentStopMarkersById = {};
        highlightedStopId = null;

        if (!mapData) {
            if (mapHint) mapHint.textContent = 'No hay datos de mapa para esta línea.';
            routePolyline.setLatLngs([]);
            stopsGroup.clearLayers();
            return;
        }

        // Route
        const routeLatLngs = (mapData.route || []).map(([lon, lat]) => [lat, lon]);
        routePolyline.setStyle({ color: getLineColor(lineKey) });
        routePolyline.setLatLngs(routeLatLngs);

        // Mapping
        const logicalStops = getLogicalStopsList();
        const { mapping, defaults } = getEffectiveMapping(lineKey);
        const rev = reverseMapping(mapping);

        // Enable restore if user modified something
        const user = loadUserMapping(lineKey);
        const hasUser = user && Object.keys(user).length > 0;
        if (btnResetMapeo) btnResetMapeo.disabled = !hasUser;

        // Stops
        stopsGroup.clearLayers();

        const showAll = chkTodasParadas ? chkTodasParadas.checked : true;
        const assignedIds = new Set(Object.values(mapping || {}).map(v => String(v)));

        (mapData.stops || []).forEach(stop => {
            const marker = L.marker([stop.lat, stop.lon], {
                icon: makeStopIcon(false),
                title: stop.name,
            });

            marker.on('click', () => {
                const modo = selModoMapa ? selModoMapa.value : 'ver';
                const selectedLogical = selParadaLogica ? selParadaLogica.value : '';
                if (modo === 'asignar' && selectedLogical) {
                    const merged = { ...defaults, ...loadUserMapping(lineKey) };
                    merged[selectedLogical] = stop.id;
                    // Guardamos solo override (diff) para mantener defaults vivos
                    const toSave = { ...loadUserMapping(lineKey) };
                    toSave[selectedLogical] = stop.id;
                    saveUserMapping(lineKey, toSave);
                    if (btnResetMapeo) btnResetMapeo.disabled = false;
                    if (mapHint) mapHint.textContent = `Asignado: "${selectedLogical}" → ${stop.name}`;
                    // refresh to update assigned filter + popups
                    refreshMapForLine(lineKey, { keepView: true });
                    setHighlightedStop(stop.id);
                    return;
                }

                setHighlightedStop(stop.id);
                openStopPopup(stop, rev, mapping);
            });

            currentStopMarkersById[stop.id] = marker;

            if (showAll || assignedIds.has(String(stop.id))) {
                marker.addTo(stopsGroup);
            }
        });

        // Fit view
        if (!keepView && routeLatLngs.length) {
            map.fitBounds(routePolyline.getBounds(), { padding: [20, 20] });
        }

        // Highlight selected logical stop if any
        const lsSelected = selectorParada ? selectorParada.value : '';
        if (lsSelected && mapping[lsSelected] !== undefined && mapping[lsSelected] !== null) {
            const sid = mapping[lsSelected];
            setHighlightedStop(sid);
        }
    }

    function showMapScreen() {
        if (!pantallaMapa) return;
        pantallaPrincipal.classList.add('hidden');
        pantallaTablas.classList.add('hidden');
        pantallaMapa.classList.remove('hidden');
        isMapOpen = true;

        fillLogicalStopsSelect();
        refreshMapForLine(lineaActualKey);
        updateModeUI();

        // Si ya hay una parada seleccionada en la pantalla principal, la marcamos
        if (selectorParada && selectorParada.value) {
            highlightLogicalStopOnMap(selectorParada.value, { pan: false });
        }

        // Leaflet necesita esto cuando el div estaba oculto
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 50);
    }

    function hideMapScreen() {
        if (!pantallaMapa) return;
        pantallaMapa.classList.add('hidden');
        pantallaPrincipal.classList.remove('hidden');
        isMapOpen = false;
        clearSearchResults();
        if (inpBuscarParada) inpBuscarParada.value = '';
    }

    function centerMapOnRoute() {
        if (!map || !routePolyline) return;
        const b = routePolyline.getBounds();
        if (b && b.isValid()) map.fitBounds(b, { padding: [20, 20] });
    }

    function goToMyLocation() {
        if (!map) return;
        if (!navigator.geolocation) {
            if (mapHint) mapHint.textContent = 'Tu navegador no soporta geolocalización.';
            return;
        }
        if (mapHint) mapHint.textContent = 'Buscando tu ubicación…';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = [pos.coords.latitude, pos.coords.longitude];
                if (!myLocationMarker) {
                    myLocationMarker = L.marker(latlng, { icon: makeUserIcon(), zIndexOffset: 2000 }).addTo(map);
                } else {
                    myLocationMarker.setLatLng(latlng);
                }
                map.setView(latlng, 15);
                if (mapHint) mapHint.textContent = 'Ubicación actual.';
            },
            () => {
                if (mapHint) mapHint.textContent = 'No pude acceder a tu ubicación.';
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
        );
    }

    function updateModeUI() {
        const modo = selModoMapa ? selModoMapa.value : 'ver';
        const assigning = modo === 'asignar';
        if (selParadaLogica) selParadaLogica.disabled = !assigning;
        if (mapHint) {
            mapHint.textContent = assigning
                ? 'Elegí una parada de la grilla y tocá una parada del mapa para asignarla.'
                : 'Tocá una parada para ver su info. Podés buscar por nombre.';
        }
    }

    function handleSearchInput() {
        if (!inpBuscarParada || !buscarResultados || !currentMapData) return;
        const q = normalizeText(inpBuscarParada.value);
        if (!q) {
            clearSearchResults();
            return;
        }
        const stops = currentMapData.stops || [];
        const matches = stops
            .map(s => ({ s, n: normalizeText(s.name) }))
            .filter(x => x.n.includes(q))
            .slice(0, 12);

        buscarResultados.innerHTML = '';
        matches.forEach(({ s }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = `${s.name}`;
            btn.addEventListener('click', () => {
                clearSearchResults();
                inpBuscarParada.value = s.name;
                if (map) {
                    map.setView([s.lat, s.lon], 16);
                }
                setHighlightedStop(s.id);
                const { mapping } = getEffectiveMapping(lineaActualKey);
                const rev = reverseMapping(mapping);
                openStopPopup(s, rev, mapping);
            });
            buscarResultados.appendChild(btn);
        });

        buscarResultados.classList.toggle('hidden', matches.length === 0);
    }

    // --- 5. FAVORITA ---
    const FAV_KEY = "mi_colectivo_favorita_v1";

    function guardarFavorita() {
        const parada = selectorParada.value;
        if (!parada) {
            if (favInfo) favInfo.textContent = "Elegí una parada antes de guardar.";
            return;
        }
        const payload = { linea: lineaActualKey, parada };
        localStorage.setItem(FAV_KEY, JSON.stringify(payload));
        cargarFavoritaUI();
        if (favInfo) favInfo.textContent = `Favorita: ${parada} (${getLineaData()?.nombre || lineaActualKey})`;
    }

    function cargarFavoritaUI() {
        try {
            const raw = localStorage.getItem(FAV_KEY);
            if (!raw) {
                if (btnUsarFav) btnUsarFav.disabled = true;
                if (favInfo) favInfo.textContent = "Favorita: —";
                return;
            }
            const fav = JSON.parse(raw);
            if (btnUsarFav) btnUsarFav.disabled = !(fav && fav.parada && fav.linea);
            if (favInfo) favInfo.textContent = `Favorita: ${fav.parada} (${HORARIOS_APP[fav.linea]?.nombre || fav.linea})`;
        } catch {
            if (btnUsarFav) btnUsarFav.disabled = true;
            if (favInfo) favInfo.textContent = "Favorita: —";
        }
    }

    function irAFavorita() {
        const raw = localStorage.getItem(FAV_KEY);
        if (!raw) return;
        let fav = null;
        try { fav = JSON.parse(raw); } catch { return; }
        if (!fav || !fav.linea || !fav.parada) return;

        aplicarLinea(fav.linea, { keepParada: fav.parada });
    }

    // --- 6. CAMBIOS DE LÍNEA / TEMPORADA ---
    function aplicarLinea(nuevaLinea, opts = {}) {
        const { keepParada } = opts;
        lineaActualKey = nuevaLinea;
        syncLineUI();

        const paradaPrev = keepParada || selectorParada.value;

        actualizarListaViajesPorFecha();
        llenarSelectorParadas();

        if (paradaPrev) {
            const existe = Array.from(selectorParada.options).some(o => o.value === paradaPrev);
            if (existe) {
                selectorParada.value = paradaPrev;
                actualizarTimeline();
            }
        }

        if (pantallaTablas && !pantallaTablas.classList.contains('hidden')) {
            renderizarTabla(document.querySelector('.tab-btn.active')?.getAttribute('data-dia') || diaActualKey);
        }

        // Publicidad: NO cambiar al cambiar de línea (solo por timer).
        // Si la pieza actual no aplica a esta línea, recién ahí rotamos.
        ensureCurrentAdForContext();

        if (isMapOpen) {
            fillLogicalStopsSelect();
            refreshMapForLine(lineaActualKey);
        }
    }

    function aplicarTemporada(nuevaTemporada) {
        temporadaActualKey = nuevaTemporada;
        syncSeasonUI();

        const paradaPrev = selectorParada.value;

        actualizarListaViajesPorFecha();
        llenarSelectorParadas();

        if (paradaPrev) {
            const existe = Array.from(selectorParada.options).some(o => o.value === paradaPrev);
            if (existe) {
                selectorParada.value = paradaPrev;
                actualizarTimeline();
            }
        }

        if (pantallaTablas && !pantallaTablas.classList.contains('hidden')) {
            renderizarTabla(document.querySelector('.tab-btn.active')?.getAttribute('data-dia') || diaActualKey);
        }

        // Publicidad: NO cambiar al cambiar de temporada (solo por timer).
        // Si la pieza actual no aplica a esta temporada/día, recién ahí rotamos.
        ensureCurrentAdForContext();

        if (isMapOpen) {
            fillLogicalStopsSelect();
            refreshMapForLine(lineaActualKey, { keepView: true });
            if (selectorParada && selectorParada.value) {
                highlightLogicalStopOnMap(selectorParada.value, { pan: false });
            }
        }
    }

    // --- EVENT LISTENERS ---
    selectorParada.addEventListener('change', () => {
        actualizarTimeline();
        if (isMapOpen && selectorParada.value) {
            highlightLogicalStopOnMap(selectorParada.value);
        }
    });
    setInterval(() => {
        if (selectorParada.value) actualizarTimeline();
    }, 30000);

    btnVerTablas.addEventListener('click', mostrarTablas);
    btnVolver.addEventListener('click', cerrarTablas);

    // Mapa
    if (btnVerMapa) btnVerMapa.addEventListener('click', showMapScreen);
    if (btnVolverMapa) btnVolverMapa.addEventListener('click', hideMapScreen);
    if (btnCentrarMapa) btnCentrarMapa.addEventListener('click', centerMapOnRoute);
    if (chkTodasParadas) chkTodasParadas.addEventListener('change', () => {
        if (isMapOpen) refreshMapForLine(lineaActualKey, { keepView: true });
    });
    if (btnMiUbicacion) btnMiUbicacion.addEventListener('click', goToMyLocation);
    if (selModoMapa) selModoMapa.addEventListener('change', () => {
        updateModeUI();
    });
    if (btnResetMapeo) btnResetMapeo.addEventListener('click', () => {
        saveUserMapping(lineaActualKey, {});
        if (btnResetMapeo) btnResetMapeo.disabled = true;
        refreshMapForLine(lineaActualKey, { keepView: true });
        if (mapHint) mapHint.textContent = 'Mapeo restaurado.';
    });
    if (inpBuscarParada) {
        inpBuscarParada.addEventListener('input', handleSearchInput);
        inpBuscarParada.addEventListener('focus', handleSearchInput);
    }
    document.addEventListener('click', (e) => {
        if (!buscarResultados || buscarResultados.classList.contains('hidden')) return;
        const wrap = e.target.closest?.('.search-wrap');
        if (!wrap) clearSearchResults();
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderizarTabla(e.target.getAttribute('data-dia'));
        });
    });

    if (btnSegRegular && btnSegVerano && selectorTemporada) {
        btnSegRegular.addEventListener('click', () => aplicarTemporada("regular"));
        btnSegVerano.addEventListener('click', () => aplicarTemporada("receso_verano"));
    }

    if (lineaButtons && lineaButtons.length && selectorLinea) {
        lineaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lk = btn.getAttribute('data-linea');
                if (lk) aplicarLinea(lk);
            });
        });
    }

    if (btnGuardarFav) btnGuardarFav.addEventListener('click', guardarFavorita);
    if (btnUsarFav) btnUsarFav.addEventListener('click', irAFavorita);

    // Recalcular día a medianoche (por si queda abierta la app)
    setInterval(() => {
        const nuevoDiaKey = determinarDiaKey(new Date());
        if (nuevoDiaKey !== diaActualKey) {
            actualizarListaViajesPorFecha();
            llenarSelectorParadas();
            if (selectorParada.value) actualizarTimeline();

            // Publicidad: no forzar cambio, solo si la pieza actual no aplica al nuevo día
            ensureCurrentAdForContext();
        }
    }, 60000);

    iniciarApp();
});
