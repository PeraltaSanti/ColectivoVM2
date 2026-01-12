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

    // --- DATOS ---
    const HORARIOS_APP = window.HORARIOS_APP || {};

    // --- VARIABLES DE ESTADO ---
    let lineaActualKey = (selectorLinea && selectorLinea.value) ? selectorLinea.value : "A";
    let temporadaActualKey = (selectorTemporada && selectorTemporada.value) ? selectorTemporada.value : "regular";

    let diaActualKey = "";
    let listaViajesActual = [];

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
    }

    function syncLineUI() {
        if (selectorLinea && selectorLinea.value !== lineaActualKey) selectorLinea.value = lineaActualKey;

        if (lineaButtons && lineaButtons.length) {
            const activo = Array.from(lineaButtons).find(b => b.getAttribute('data-linea') === lineaActualKey);
            if (activo) setSegmentActive(Array.from(lineaButtons), activo);
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
    }

    // --- EVENT LISTENERS ---
    selectorParada.addEventListener('change', actualizarTimeline);
    setInterval(() => {
        if (selectorParada.value) actualizarTimeline();
    }, 30000);

    btnVerTablas.addEventListener('click', mostrarTablas);
    btnVolver.addEventListener('click', cerrarTablas);

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
