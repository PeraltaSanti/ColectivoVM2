document.addEventListener('DOMContentLoaded', () => {

    // ELEMENTOS
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    const pantallaTablas = document.getElementById('pantalla-tablas');

    const selectorParada = document.getElementById('selector-parada');
    const displayFecha = document.getElementById('fecha-hoy');
    const timelineContainer = document.getElementById('timeline-container');
    const mensajeError = document.getElementById('mensaje-error');

    // Línea / Temporada (UI)
    const selectorLinea = document.getElementById('selector-linea');
    const headerTitle = document.querySelector('header h1');
    const lineaButtons = document.querySelectorAll('.seg-btn[data-linea]');

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

        syncLineUI();
        syncSeasonUI();

        actualizarListaViajesPorFecha();
        llenarSelectorParadas();

        cargarFavoritaUI();
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
        const m = {
            A: '#00d2ff',
            E: '#ff7a00',
            ESTE: '#7c4dff',
            OESTE: '#ff3d71',
        };
        return m[lineKey] || '#00d2ff';
    }

    function makeStopIcon(isHighlighted) {
        return L.divIcon({
            className: 'stop-divicon',
            html: `<span class="stop-icon ${isHighlighted ? 'stop-icon--logical' : 'stop-icon--real'}"></span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -10],
        });
    }

    function makeUserIcon() {
        return L.divIcon({
            className: 'stop-divicon',
            html: '<span class="user-dot"></span>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
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
                    myLocationMarker = L.marker(latlng, { icon: makeUserIcon() }).addTo(map);
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

        // Si el mapa está abierto, lo refrescamos a la nueva línea
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

        // Cambia la lista de paradas lógicas (según temporada/día), por eso refrescamos mapa
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
        }
    }, 60000);

    iniciarApp();
});
