document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const selector = document.getElementById('selector-parada');
    const selectorTemporada = document.getElementById('selector-temporada');
    const segRegular = document.getElementById('seg-regular');
    const segVerano = document.getElementById('seg-verano');
    const displayFecha = document.getElementById('fecha-hoy');
    const timelineContainer = document.getElementById('timeline-container');
    const mensajeError = document.getElementById('mensaje-error');

    // Favoritos / recordar selección
    const btnGuardarFav = document.getElementById('btn-guardar-fav');
    const btnUsarFav = document.getElementById('btn-usar-fav');
    const favInfo = document.getElementById('fav-info');
    
    // Elementos del Timeline
    const prevHora = document.getElementById('prev-hora');
    const mainHora = document.getElementById('main-hora');
    const mainCountdown = document.getElementById('main-countdown');
    const next1Hora = document.getElementById('next1-hora');
    const next1Diff = document.getElementById('next1-diff');
    const next2Hora = document.getElementById('next2-hora');
    const next2Diff = document.getElementById('next2-diff');

    // Botones
    const btnVerTablas = document.getElementById('btn-ver-tablas');
    const btnVerMapa = document.getElementById('btn-ver-mapa');
    const btnVolverMapa = document.getElementById('btn-volver-mapa');
    const btnVolver = document.getElementById('btn-volver');

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tablaHead = document.querySelector('#tabla-completa thead');
    const tablaBody = document.querySelector('#tabla-completa tbody');
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    const pantallaTablas = document.getElementById('pantalla-tablas');
    const pantallaMapa = document.getElementById('pantalla-mapa');

    // Controles del mapa
    const mapHint = document.getElementById('map-hint');
    const selModoMapa = document.getElementById('sel-modo-mapa');
    const selParadaLogica = document.getElementById('sel-parada-logica');
    const chkTodasParadas = document.getElementById('chk-todas-paradas');
    const btnResetMapeo = document.getElementById('btn-reset-mapeo');
    const btnCentrarMapa = document.getElementById('btn-centrar-mapa');
    const btnMiUbicacion = document.getElementById('btn-mi-ubicacion');
    const inpBuscarParada = document.getElementById('inp-buscar-parada');
    const buscarResultados = document.getElementById('buscar-resultados');


    // --- BASE DE DATOS DE HORARIOS ---
    const datosHorariosRegular = {
        "lunes_a_viernes": [
            {"Salida Facultad": "05:18", "Terminal": "05:30", "Balcarce y Urquiza": "05:44", "L.Guillet y G. Paz": "05:51", "Entrada Ate 2": "06:03", "Salida F. Sarmiento": "06:17", "Nelson e Yrigoyen": "06:31", "G. Paz y Maipú": "06:47", "Llegada Facultad": "07:02"},
            {"Salida Facultad": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate 2": "06:37", "Salida F. Sarmiento": "06:51", "Nelson e Yrigoyen": "07:05", "G. Paz y Maipú": "07:21", "Llegada Facultad": "07:36"},
            {"Salida Facultad": "06:09", "Terminal": "06:21", "Balcarce y Urquiza": "06:35", "L.Guillet y G. Paz": "06:42", "Entrada Ate 2": "06:54", "Salida F. Sarmiento": "07:08", "Nelson e Yrigoyen": "07:22", "G. Paz y Maipú": "07:38", "Llegada Facultad": "07:53"},
            {"Salida Facultad": "06:26", "Terminal": "06:38", "Balcarce y Urquiza": "06:52", "L.Guillet y G. Paz": "06:59", "Entrada Ate 2": "07:11", "Salida F. Sarmiento": "07:25", "Nelson e Yrigoyen": "07:39", "G. Paz y Maipú": "07:55", "Llegada Facultad": "08:10"},
            {"Salida Facultad": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate 2": "07:28", "Salida F. Sarmiento": "07:42", "Nelson e Yrigoyen": "07:56", "G. Paz y Maipú": "08:12", "Llegada Facultad": "08:27"},
            {"Salida Facultad": "07:00", "Terminal": "07:12", "Balcarce y Urquiza": "07:26", "L.Guillet y G. Paz": "07:33", "Entrada Ate 2": "07:45", "Salida F. Sarmiento": "07:59", "Nelson e Yrigoyen": "08:13", "G. Paz y Maipú": "08:29", "Llegada Facultad": "08:44"},
            {"Salida Facultad": "07:17", "Terminal": "07:29", "Balcarce y Urquiza": "07:43", "L.Guillet y G. Paz": "07:50", "Entrada Ate 2": "08:02", "Salida F. Sarmiento": "08:16", "Nelson e Yrigoyen": "08:30", "G. Paz y Maipú": "08:46", "Llegada Facultad": "09:01"},
            {"Salida Facultad": "07:34", "Terminal": "07:46", "Balcarce y Urquiza": "08:00", "L.Guillet y G. Paz": "08:07", "Entrada Ate 2": "08:19", "Salida F. Sarmiento": "08:33", "Nelson e Yrigoyen": "08:47", "G. Paz y Maipú": "09:03", "Llegada Facultad": "09:18"},
            {"Salida Facultad": "07:51", "Terminal": "08:03", "Balcarce y Urquiza": "08:17", "L.Guillet y G. Paz": "08:24", "Entrada Ate 2": "08:36", "Salida F. Sarmiento": "08:50", "Nelson e Yrigoyen": "09:04", "G. Paz y Maipú": "09:20", "Llegada Facultad": "09:35"},
            {"Salida Facultad": "08:08", "Terminal": "08:20", "Balcarce y Urquiza": "08:34", "L.Guillet y G. Paz": "08:41", "Entrada Ate 2": "08:53", "Salida F. Sarmiento": "09:07", "Nelson e Yrigoyen": "09:21", "G. Paz y Maipú": "09:37", "Llegada Facultad": "09:52"},
            {"Salida Facultad": "08:25", "Terminal": "08:37", "Balcarce y Urquiza": "08:51", "L.Guillet y G. Paz": "08:58", "Entrada Ate 2": "09:10", "Salida F. Sarmiento": "09:24", "Nelson e Yrigoyen": "09:38", "G. Paz y Maipú": "09:54", "Llegada Facultad": "10:09"},
            {"Salida Facultad": "08:42", "Terminal": "08:54", "Balcarce y Urquiza": "09:08", "L.Guillet y G. Paz": "09:15", "Entrada Ate 2": "09:27", "Salida F. Sarmiento": "09:41", "Nelson e Yrigoyen": "09:55", "G. Paz y Maipú": "10:11", "Llegada Facultad": "10:26"},
            {"Salida Facultad": "08:59", "Terminal": "09:11", "Balcarce y Urquiza": "09:25", "L.Guillet y G. Paz": "09:32", "Entrada Ate 2": "09:44", "Salida F. Sarmiento": "09:58", "Nelson e Yrigoyen": "10:12", "G. Paz y Maipú": "10:28", "Llegada Facultad": "10:43"},
            {"Salida Facultad": "09:16", "Terminal": "09:28", "Balcarce y Urquiza": "09:42", "L.Guillet y G. Paz": "09:49", "Entrada Ate 2": "10:01", "Salida F. Sarmiento": "10:15", "Nelson e Yrigoyen": "10:29", "G. Paz y Maipú": "10:45", "Llegada Facultad": "11:00"},
            {"Salida Facultad": "09:33", "Terminal": "09:45", "Balcarce y Urquiza": "09:59", "L.Guillet y G. Paz": "10:06", "Entrada Ate 2": "10:18", "Salida F. Sarmiento": "10:32", "Nelson e Yrigoyen": "10:46", "G. Paz y Maipú": "11:02", "Llegada Facultad": "11:17"},
            {"Salida Facultad": "09:50", "Terminal": "10:02", "Balcarce y Urquiza": "10:16", "L.Guillet y G. Paz": "10:23", "Entrada Ate 2": "10:35", "Salida F. Sarmiento": "10:49", "Nelson e Yrigoyen": "11:03", "G. Paz y Maipú": "11:19", "Llegada Facultad": "11:34"},
            {"Salida Facultad": "10:07", "Terminal": "10:19", "Balcarce y Urquiza": "10:33", "L.Guillet y G. Paz": "10:40", "Entrada Ate 2": "10:52", "Salida F. Sarmiento": "11:06", "Nelson e Yrigoyen": "11:20", "G. Paz y Maipú": "11:36", "Llegada Facultad": "11:51"},
            {"Salida Facultad": "10:24", "Terminal": "10:36", "Balcarce y Urquiza": "10:50", "L.Guillet y G. Paz": "10:57", "Entrada Ate 2": "11:09", "Salida F. Sarmiento": "11:23", "Nelson e Yrigoyen": "11:37", "G. Paz y Maipú": "11:53", "Llegada Facultad": "12:08"},
            {"Salida Facultad": "10:41", "Terminal": "10:53", "Balcarce y Urquiza": "11:07", "L.Guillet y G. Paz": "11:14", "Entrada Ate 2": "11:26", "Salida F. Sarmiento": "11:40", "Nelson e Yrigoyen": "11:54", "G. Paz y Maipú": "12:10", "Llegada Facultad": "12:25"},
            {"Salida Facultad": "10:58", "Terminal": "11:10", "Balcarce y Urquiza": "11:24", "L.Guillet y G. Paz": "11:31", "Entrada Ate 2": "11:43", "Salida F. Sarmiento": "11:57", "Nelson e Yrigoyen": "12:11", "G. Paz y Maipú": "12:27", "Llegada Facultad": "12:42"},
            {"Salida Facultad": "11:15", "Terminal": "11:27", "Balcarce y Urquiza": "11:41", "L.Guillet y G. Paz": "11:48", "Entrada Ate 2": "12:00", "Salida F. Sarmiento": "12:14", "Nelson e Yrigoyen": "12:28", "G. Paz y Maipú": "12:44", "Llegada Facultad": "12:59"},
            {"Salida Facultad": "11:32", "Terminal": "11:44", "Balcarce y Urquiza": "11:58", "L.Guillet y G. Paz": "12:05", "Entrada Ate 2": "12:17", "Salida F. Sarmiento": "12:31", "Nelson e Yrigoyen": "12:45", "G. Paz y Maipú": "13:01", "Llegada Facultad": "13:16"},
            {"Salida Facultad": "11:49", "Terminal": "12:01", "Balcarce y Urquiza": "12:15", "L.Guillet y G. Paz": "12:22", "Entrada Ate 2": "12:34", "Salida F. Sarmiento": "12:48", "Nelson e Yrigoyen": "13:02", "G. Paz y Maipú": "13:18", "Llegada Facultad": "13:33"},
            {"Salida Facultad": "12:06", "Terminal": "12:18", "Balcarce y Urquiza": "12:32", "L.Guillet y G. Paz": "12:39", "Entrada Ate 2": "12:51", "Salida F. Sarmiento": "13:05", "Nelson e Yrigoyen": "13:19", "G. Paz y Maipú": "13:35", "Llegada Facultad": "13:50"},
            {"Salida Facultad": "12:23", "Terminal": "12:35", "Balcarce y Urquiza": "12:49", "L.Guillet y G. Paz": "12:56", "Entrada Ate 2": "13:08", "Salida F. Sarmiento": "13:22", "Nelson e Yrigoyen": "13:36", "G. Paz y Maipú": "13:52", "Llegada Facultad": "14:07"},
            {"Salida Facultad": "12:40", "Terminal": "12:52", "Balcarce y Urquiza": "13:06", "L.Guillet y G. Paz": "13:13", "Entrada Ate 2": "13:25", "Salida F. Sarmiento": "13:39", "Nelson e Yrigoyen": "13:53", "G. Paz y Maipú": "14:09", "Llegada Facultad": "14:24"},
            {"Salida Facultad": "12:57", "Terminal": "13:09", "Balcarce y Urquiza": "13:23", "L.Guillet y G. Paz": "13:30", "Entrada Ate 2": "13:42", "Salida F. Sarmiento": "13:56", "Nelson e Yrigoyen": "14:10", "G. Paz y Maipú": "14:26", "Llegada Facultad": "14:41"},
            {"Salida Facultad": "13:14", "Terminal": "13:26", "Balcarce y Urquiza": "13:40", "L.Guillet y G. Paz": "13:47", "Entrada Ate 2": "13:59", "Salida F. Sarmiento": "14:13", "Nelson e Yrigoyen": "14:27", "G. Paz y Maipú": "14:43", "Llegada Facultad": "14:58"},
            {"Salida Facultad": "13:31", "Terminal": "13:43", "Balcarce y Urquiza": "13:57", "L.Guillet y G. Paz": "14:04", "Entrada Ate 2": "14:16", "Salida F. Sarmiento": "14:30", "Nelson e Yrigoyen": "14:44", "G. Paz y Maipú": "15:00", "Llegada Facultad": "15:15"},
            {"Salida Facultad": "14:05", "Terminal": "14:17", "Balcarce y Urquiza": "14:31", "L.Guillet y G. Paz": "14:38", "Entrada Ate 2": "14:50", "Salida F. Sarmiento": "15:04", "Nelson e Yrigoyen": "15:18", "G. Paz y Maipú": "15:34", "Llegada Facultad": "15:49"},
            {"Salida Facultad": "14:22", "Terminal": "14:34", "Balcarce y Urquiza": "14:48", "L.Guillet y G. Paz": "14:55", "Entrada Ate 2": "15:07", "Salida F. Sarmiento": "15:21", "Nelson e Yrigoyen": "15:35", "G. Paz y Maipú": "15:51", "Llegada Facultad": "16:06"},
            {"Salida Facultad": "14:56", "Terminal": "15:08", "Balcarce y Urquiza": "15:22", "L.Guillet y G. Paz": "15:29", "Entrada Ate 2": "15:41", "Salida F. Sarmiento": "15:55", "Nelson e Yrigoyen": "16:09", "G. Paz y Maipú": "16:25", "Llegada Facultad": "16:40"},
            {"Salida Facultad": "15:13", "Terminal": "15:25", "Balcarce y Urquiza": "15:39", "L.Guillet y G. Paz": "15:46", "Entrada Ate 2": "15:58", "Salida F. Sarmiento": "16:12", "Nelson e Yrigoyen": "16:26", "G. Paz y Maipú": "16:42", "Llegada Facultad": "16:57"},
            {"Salida Facultad": "16:04", "Terminal": "16:16", "Balcarce y Urquiza": "16:30", "L.Guillet y G. Paz": "16:37", "Entrada Ate 2": "16:49", "Salida F. Sarmiento": "17:03", "Nelson e Yrigoyen": "17:17", "G. Paz y Maipú": "17:33", "Llegada Facultad": "17:48"},
            {"Salida Facultad": "16:21", "Terminal": "16:33", "Balcarce y Urquiza": "16:47", "L.Guillet y G. Paz": "16:54", "Entrada Ate 2": "17:06", "Salida F. Sarmiento": "17:20", "Nelson e Yrigoyen": "17:34", "G. Paz y Maipú": "17:50", "Llegada Facultad": "18:05"},
            {"Salida Facultad": "16:38", "Terminal": "16:50", "Balcarce y Urquiza": "17:04", "L.Guillet y G. Paz": "17:11", "Entrada Ate 2": "17:23", "Salida F. Sarmiento": "17:37", "Nelson e Yrigoyen": "17:51", "G. Paz y Maipú": "18:07", "Llegada Facultad": "18:22"},
            {"Salida Facultad": "16:55", "Terminal": "17:07", "Balcarce y Urquiza": "17:21", "L.Guillet y G. Paz": "17:28", "Entrada Ate 2": "17:40", "Salida F. Sarmiento": "17:54", "Nelson e Yrigoyen": "18:08", "G. Paz y Maipú": "18:24", "Llegada Facultad": "18:39"},
            {"Salida Facultad": "17:12", "Terminal": "17:24", "Balcarce y Urquiza": "17:38", "L.Guillet y G. Paz": "17:45", "Entrada Ate 2": "17:57", "Salida F. Sarmiento": "18:11", "Nelson e Yrigoyen": "18:25", "G. Paz y Maipú": "18:41", "Llegada Facultad": "18:56"},
            {"Salida Facultad": "17:29", "Terminal": "17:41", "Balcarce y Urquiza": "17:55", "L.Guillet y G. Paz": "18:02", "Entrada Ate 2": "18:14", "Salida F. Sarmiento": "18:28", "Nelson e Yrigoyen": "18:42", "G. Paz y Maipú": "18:58", "Llegada Facultad": "19:13"},
            {"Salida Facultad": "18:03", "Terminal": "18:15", "Balcarce y Urquiza": "18:29", "L.Guillet y G. Paz": "18:36", "Entrada Ate 2": "18:48", "Salida F. Sarmiento": "19:02", "Nelson e Yrigoyen": "19:16", "G. Paz y Maipú": "19:32", "Llegada Facultad": "19:47"},
            {"Salida Facultad": "18:20", "Terminal": "18:32", "Balcarce y Urquiza": "18:46", "L.Guillet y G. Paz": "18:53", "Entrada Ate 2": "19:05", "Salida F. Sarmiento": "19:19", "Nelson e Yrigoyen": "19:33", "G. Paz y Maipú": "19:49", "Llegada Facultad": "20:04"},
            {"Salida Facultad": "18:37", "Terminal": "18:49", "Balcarce y Urquiza": "19:03", "L.Guillet y G. Paz": "19:10", "Entrada Ate 2": "19:22", "Salida F. Sarmiento": "19:36", "Nelson e Yrigoyen": "19:50", "G. Paz y Maipú": "20:06", "Llegada Facultad": "20:21"},
            {"Salida Facultad": "18:54", "Terminal": "19:06", "Balcarce y Urquiza": "19:20", "L.Guillet y G. Paz": "19:27", "Entrada Ate 2": "19:39", "Salida F. Sarmiento": "19:53", "Nelson e Yrigoyen": "20:07", "G. Paz y Maipú": "20:23", "Llegada Facultad": "20:38"},
            {"Salida Facultad": "19:11", "Terminal": "19:23", "Balcarce y Urquiza": "19:37", "L.Guillet y G. Paz": "19:44", "Entrada Ate 2": "19:56", "Salida F. Sarmiento": "20:10", "Nelson e Yrigoyen": "20:24", "G. Paz y Maipú": null, "Llegada Facultad": "20:50"},
            {"Salida Facultad": "19:28", "Terminal": "19:40", "Balcarce y Urquiza": "19:54", "L.Guillet y G. Paz": "20:01", "Entrada Ate 2": "20:13", "Salida F. Sarmiento": "20:27", "Nelson e Yrigoyen": "20:41", "G. Paz y Maipú": "20:57", "Llegada Facultad": "21:12"},
            {"Salida Facultad": "20:19", "Terminal": "20:31", "Balcarce y Urquiza": "20:45", "L.Guillet y G. Paz": "20:52", "Entrada Ate 2": "21:04", "Salida F. Sarmiento": "21:18", "Nelson e Yrigoyen": null, "G. Paz y Maipú": null, "Llegada Facultad": null},
            {"Salida Facultad": "20:36", "Terminal": "20:48", "Balcarce y Urquiza": "21:02", "L.Guillet y G. Paz": "21:09", "Entrada Ate 2": "21:21", "Salida F. Sarmiento": "21:35", "Nelson e Yrigoyen": "21:49", "G. Paz y Maipú": "22:05", "Llegada Facultad": "22:20"},
            {"Salida Facultad": "20:53", "Terminal": "21:05", "Balcarce y Urquiza": "21:19", "L.Guillet y G. Paz": "21:26", "Entrada Ate 2": "21:38", "Salida F. Sarmiento": "21:52", "Nelson e Yrigoyen": "22:06", "G. Paz y Maipú": "22:22", "Llegada Facultad": "22:37"},
            {"Salida Facultad": "21:27", "Terminal": "21:39", "Balcarce y Urquiza": "21:53", "L.Guillet y G. Paz": "22:00", "Entrada Ate 2": "22:12", "Salida F. Sarmiento": "22:26", "Nelson e Yrigoyen": "22:40", "G. Paz y Maipú": "22:56", "Llegada Facultad": "23:11"},
            {"Salida Facultad": "22:35", "Terminal": "22:47", "Balcarce y Urquiza": "23:01", "L.Guillet y G. Paz": "23:08", "Entrada Ate 2": "23:20", "Salida F. Sarmiento": "23:34", "Nelson e Yrigoyen": "23:48", "G. Paz y Maipú": null, "Llegada Facultad": "00:15"},
            {"Salida Facultad": "23:30", "Terminal": "00:02", "Balcarce y Urquiza": "00:09", "L.Guillet y G. Paz": "00:16", "Entrada Ate 2": null, "Salida F. Sarmiento": "00:30", "Nelson e Yrigoyen": null, "G. Paz y Maipú": null, "Llegada Facultad": null}
        ],
        "sabados": [
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "05:14", "Salida F. Sarmiento": "05:27", "Nelson e Irigoyen": "05:40", "Gral. Paz y Maipú": "05:54", "Llega Cruce descanso": "06:06"},
            {"Salida del Cruce": "05:27", "Terminal": "05:37", "Balcarce y Urquiza": "05:50", "L.Guillet y G. Paz": "05:56", "Entrada Ate II": "06:08", "Salida F. Sarmiento": "06:21", "Nelson e Irigoyen": "06:34", "Gral. Paz y Maipú": "06:48", "Llega Cruce descanso": "07:00"},
            {"Salida del Cruce": "06:21", "Terminal": "06:31", "Balcarce y Urquiza": "06:44", "L.Guillet y G. Paz": "06:50", "Entrada Ate II": "07:02", "Salida F. Sarmiento": "07:15", "Nelson e Irigoyen": "07:28", "Gral. Paz y Maipú": "07:42", "Llega Cruce descanso": "07:54"},
            {"Salida del Cruce": "07:15", "Terminal": "07:25", "Balcarce y Urquiza": "07:38", "L.Guillet y G. Paz": "07:44", "Entrada Ate II": "07:56", "Salida F. Sarmiento": "08:09", "Nelson e Irigoyen": "08:22", "Gral. Paz y Maipú": "08:36", "Llega Cruce descanso": "08:48"},
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "08:23", "Salida F. Sarmiento": "08:36", "Nelson e Irigoyen": "08:49", "Gral. Paz y Maipú": "09:03", "Llega Cruce descanso": "09:15"},
            {"Salida del Cruce": "08:09", "Terminal": "08:19", "Balcarce y Urquiza": "08:32", "L.Guillet y G. Paz": "08:38", "Entrada Ate II": "08:50", "Salida F. Sarmiento": "09:03", "Nelson e Irigoyen": "09:16", "Gral. Paz y Maipú": "09:30", "Llega Cruce descanso": "09:42"},
            {"Salida del Cruce": null, "Terminal": "08:46", "Balcarce y Urquiza": "08:59", "L.Guillet y G. Paz": "09:05", "Entrada Ate II": "09:17", "Salida F. Sarmiento": "09:30", "Nelson e Irigoyen": "09:43", "Gral. Paz y Maipú": "09:57", "Llega Cruce descanso": "10:09"},
            {"Salida del Cruce": "09:03", "Terminal": "09:13", "Balcarce y Urquiza": "09:26", "L.Guillet y G. Paz": "09:32", "Entrada Ate II": "09:44", "Salida F. Sarmiento": "09:57", "Nelson e Irigoyen": "10:10", "Gral. Paz y Maipú": "10:24", "Llega Cruce descanso": "10:36"},
            {"Salida del Cruce": "09:30", "Terminal": "09:40", "Balcarce y Urquiza": "09:53", "L.Guillet y G. Paz": "09:59", "Entrada Ate II": "10:11", "Salida F. Sarmiento": "10:24", "Nelson e Irigoyen": "10:37", "Gral. Paz y Maipú": "10:51", "Llega Cruce descanso": "11:03"},
            {"Salida del Cruce": "09:57", "Terminal": "10:07", "Balcarce y Urquiza": "10:20", "L.Guillet y G. Paz": "10:26", "Entrada Ate II": "10:38", "Salida F. Sarmiento": "10:51", "Nelson e Irigoyen": "11:04", "Gral. Paz y Maipú": "11:18", "Llega Cruce descanso": "11:30"},
            {"Salida del Cruce": "10:24", "Terminal": "10:34", "Balcarce y Urquiza": "10:47", "L.Guillet y G. Paz": "10:53", "Entrada Ate II": "11:05", "Salida F. Sarmiento": "11:18", "Nelson e Irigoyen": "11:31", "Gral. Paz y Maipú": "11:45", "Llega Cruce descanso": "11:57"},
            {"Salida del Cruce": "10:51", "Terminal": "11:01", "Balcarce y Urquiza": "11:14", "L.Guillet y G. Paz": "11:20", "Entrada Ate II": "11:32", "Salida F. Sarmiento": "11:45", "Nelson e Irigoyen": "11:58", "Gral. Paz y Maipú": "12:12", "Llega Cruce descanso": "12:24"},
            {"Salida del Cruce": "11:18", "Terminal": "11:28", "Balcarce y Urquiza": "11:41", "L.Guillet y G. Paz": "11:47", "Entrada Ate II": "11:59", "Salida F. Sarmiento": "12:12", "Nelson e Irigoyen": "12:25", "Gral. Paz y Maipú": "12:39", "Llega Cruce descanso": "12:51"},
            {"Salida del Cruce": "11:45", "Terminal": "11:55", "Balcarce y Urquiza": "12:08", "L.Guillet y G. Paz": "12:14", "Entrada Ate II": "12:26", "Salida F. Sarmiento": "12:39", "Nelson e Irigoyen": "12:52", "Gral. Paz y Maipú": "13:06", "Llega Cruce descanso": "13:18"},
            {"Salida del Cruce": "12:12", "Terminal": "12:22", "Balcarce y Urquiza": "12:35", "L.Guillet y G. Paz": "12:41", "Entrada Ate II": "12:53", "Salida F. Sarmiento": "13:06", "Nelson e Irigoyen": "13:19", "Gral. Paz y Maipú": "13:33", "Llega Cruce descanso": "13:45"},
            {"Salida del Cruce": "12:39", "Terminal": "12:49", "Balcarce y Urquiza": "13:02", "L.Guillet y G. Paz": "13:08", "Entrada Ate II": "13:20", "Salida F. Sarmiento": "13:33", "Nelson e Irigoyen": "13:46", "Gral. Paz y Maipú": "14:00", "Llega Cruce descanso": "14:12"},
            {"Salida del Cruce": "13:06", "Terminal": "13:16", "Balcarce y Urquiza": "13:29", "L.Guillet y G. Paz": "13:35", "Entrada Ate II": "13:47", "Salida F. Sarmiento": "14:00", "Nelson e Irigoyen": "14:13", "Gral. Paz y Maipú": "14:27", "Llega Cruce descanso": "14:39"},
            {"Salida del Cruce": "13:33", "Terminal": "13:43", "Balcarce y Urquiza": "13:56", "L.Guillet y G. Paz": "14:02", "Entrada Ate II": "14:14", "Salida F. Sarmiento": "14:27", "Nelson e Irigoyen": "14:40", "Gral. Paz y Maipú": "14:54", "Llega Cruce descanso": "15:06"},
            {"Salida del Cruce": "14:00", "Terminal": "14:10", "Balcarce y Urquiza": "14:23", "L.Guillet y G. Paz": "14:29", "Entrada Ate II": "14:41", "Salida F. Sarmiento": "14:54", "Nelson e Irigoyen": "15:07", "Gral. Paz y Maipú": "15:21", "Llega Cruce descanso": "15:33"},
            {"Salida del Cruce": "14:27", "Terminal": "14:37", "Balcarce y Urquiza": "14:50", "L.Guillet y G. Paz": "14:56", "Entrada Ate II": "15:08", "Salida F. Sarmiento": "15:21", "Nelson e Irigoyen": "15:34", "Gral. Paz y Maipú": "15:48", "Llega Cruce descanso": "16:00"},
            {"Salida del Cruce": "14:54", "Terminal": "15:04", "Balcarce y Urquiza": "15:17", "L.Guillet y G. Paz": "15:23", "Entrada Ate II": "15:35", "Salida F. Sarmiento": "15:48", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "15:21", "Terminal": "15:31", "Balcarce y Urquiza": "15:44", "L.Guillet y G. Paz": "15:50", "Entrada Ate II": "16:02", "Salida F. Sarmiento": "16:15", "Nelson e Irigoyen": "16:28", "Gral. Paz y Maipú": "16:42", "Llega Cruce descanso": "16:54"},
            {"Salida del Cruce": "15:48", "Terminal": "15:58", "Balcarce y Urquiza": "16:11", "L.Guillet y G. Paz": "16:17", "Entrada Ate II": "16:29", "Salida F. Sarmiento": "16:42", "Nelson e Irigoyen": "16:55", "Gral. Paz y Maipú": "17:09", "Llega Cruce descanso": "17:21"},
            {"Salida del Cruce": "16:15", "Terminal": "16:25", "Balcarce y Urquiza": "16:38", "L.Guillet y G. Paz": "16:44", "Entrada Ate II": "16:56", "Salida F. Sarmiento": "17:09", "Nelson e Irigoyen": "17:22", "Gral. Paz y Maipú": "17:36", "Llega Cruce descanso": "17:48"},
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "17:23", "Salida F. Sarmiento": "17:36", "Nelson e Irigoyen": "17:49", "Gral. Paz y Maipú": "18:03", "Llega Cruce descanso": "18:15"},
            {"Salida del Cruce": "16:42", "Terminal": "16:52", "Balcarce y Urquiza": "17:05", "L.Guillet y G. Paz": "17:11", "Entrada Ate II": "17:23", "Salida F. Sarmiento": "17:36", "Nelson e Irigoyen": "17:49", "Gral. Paz y Maipú": "18:03", "Llega Cruce descanso": "18:15"},
            {"Salida del Cruce": "17:09", "Terminal": "17:19", "Balcarce y Urquiza": "17:32", "L.Guillet y G. Paz": "17:38", "Entrada Ate II": "17:50", "Salida F. Sarmiento": "18:03", "Nelson e Irigoyen": "18:16", "Gral. Paz y Maipú": "18:30", "Llega Cruce descanso": "18:42"},
            {"Salida del Cruce": "17:36", "Terminal": "17:46", "Balcarce y Urquiza": "17:59", "L.Guillet y G. Paz": "18:05", "Entrada Ate II": "18:17", "Salida F. Sarmiento": "18:30", "Nelson e Irigoyen": "18:43", "Gral. Paz y Maipú": "18:57", "Llega Cruce descanso": "19:09"},
            {"Salida del Cruce": "18:03", "Terminal": "18:13", "Balcarce y Urquiza": "18:26", "L.Guillet y G. Paz": "18:32", "Entrada Ate II": "18:44", "Salida F. Sarmiento": "18:57", "Nelson e Irigoyen": "19:10", "Gral. Paz y Maipú": "19:24", "Llega Cruce descanso": "19:36"},
            {"Salida del Cruce": "18:30", "Terminal": "18:40", "Balcarce y Urquiza": "18:53", "L.Guillet y G. Paz": "18:59", "Entrada Ate II": "19:11", "Salida F. Sarmiento": "19:24", "Nelson e Irigoyen": "19:37", "Gral. Paz y Maipú": "19:51", "Llega Cruce descanso": "20:03"},
            {"Salida del Cruce": "18:57", "Terminal": "19:07", "Balcarce y Urquiza": "19:20", "L.Guillet y G. Paz": "19:26", "Entrada Ate II": "19:38", "Salida F. Sarmiento": "19:50", "Nelson e Irigoyen": "20:02", "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "19:24", "Terminal": "19:34", "Balcarce y Urquiza": "19:47", "L.Guillet y G. Paz": "19:53", "Entrada Ate II": "20:05", "Salida F. Sarmiento": "20:18", "Nelson e Irigoyen": "20:31", "Gral. Paz y Maipú": "20:45", "Llega Cruce descanso": "20:57"},
            {"Salida del Cruce": "19:51", "Terminal": "20:00", "Balcarce y Urquiza": "20:13", "L.Guillet y G. Paz": "20:18", "Entrada Ate II": "20:30", "Salida F. Sarmiento": "20:38", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "20:18", "Terminal": "20:28", "Balcarce y Urquiza": "20:41", "L.Guillet y G. Paz": "20:47", "Entrada Ate II": "20:59", "Salida F. Sarmiento": "21:12", "Nelson e Irigoyen": "21:25", "Gral. Paz y Maipú": "21:39", "Llega Cruce descanso": "21:51"},
            {"Salida del Cruce": "20:39", "Terminal": "20:49", "Balcarce y Urquiza": "21:02", "L.Guillet y G. Paz": "21:08", "Entrada Ate II": "21:20", "Salida F. Sarmiento": "21:33", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "21:12", "Terminal": "21:22", "Balcarce y Urquiza": "21:35", "L.Guillet y G. Paz": "21:41", "Entrada Ate II": "21:53", "Salida F. Sarmiento": "22:06", "Nelson e Irigoyen": "22:19", "Gral. Paz y Maipú": "22:33", "Llega Cruce descanso": "22:45"},
            {"Salida del Cruce": "22:06", "Terminal": "22:16", "Balcarce y Urquiza": "22:29", "L.Guillet y G. Paz": "22:35", "Entrada Ate II": "22:47", "Salida F. Sarmiento": "23:00", "Nelson e Irigoyen": "23:13", "Gral. Paz y Maipú": "23:27", "Llega Cruce descanso": "23:39"},
            {"Salida del Cruce": "23:00", "Terminal": "23:10", "Balcarce y Urquiza": "23:23", "L.Guillet y G. Paz": "23:29", "Entrada Ate II": "23:41", "Salida F. Sarmiento": "23:54", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "23:54", "Terminal": "00:04", "Balcarce y Urquiza": "00:17", "L.Guillet y G. Paz": "00:23", "Entrada Ate II": "00:35", "Salida F. Sarmiento": "00:48", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null}
        ],
        "domingos": [
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "05:20", "Salida F. Sarmiento": "05:33", "Nelson e Irigoyen": "05:45", "Gral. Paz y Maipú": "05:57", "Llega Cruce descanso": "06:07"},
            {"Salida del Cruce": "06:22", "Terminal": "06:31", "Balcarce y Urquiza": "06:41", "L.Guillet y G. Paz": "06:47", "Entrada Ate II": "06:59", "Salida F. Sarmiento": "07:12", "Nelson e Irigoyen": "07:24", "Gral. Paz y Maipú": "07:36", "Llega Cruce descanso": "07:46"},
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "08:05", "Salida F. Sarmiento": "08:18", "Nelson e Irigoyen": "08:30", "Gral. Paz y Maipú": "08:42", "Llega Cruce descanso": "08:52"},
            {"Salida del Cruce": "08:01", "Terminal": "08:10", "Balcarce y Urquiza": "08:20", "L.Guillet y G. Paz": "08:26", "Entrada Ate II": "08:38", "Salida F. Sarmiento": "08:51", "Nelson e Irigoyen": "09:03", "Gral. Paz y Maipú": "09:15", "Llega Cruce descanso": "09:25"},
            {"Salida del Cruce": "08:34", "Terminal": "08:43", "Balcarce y Urquiza": "08:53", "L.Guillet y G. Paz": "08:59", "Entrada Ate II": "09:11", "Salida F. Sarmiento": "09:24", "Nelson e Irigoyen": "09:36", "Gral. Paz y Maipú": "09:48", "Llega Cruce descanso": "09:58"},
            {"Salida del Cruce": "09:07", "Terminal": "09:16", "Balcarce y Urquiza": "09:26", "L.Guillet y G. Paz": "09:32", "Entrada Ate II": "09:44", "Salida F. Sarmiento": "09:57", "Nelson e Irigoyen": "10:09", "Gral. Paz y Maipú": "10:21", "Llega Cruce descanso": "10:31"},
            {"Salida del Cruce": "09:40", "Terminal": "09:49", "Balcarce y Urquiza": "09:59", "L.Guillet y G. Paz": "10:05", "Entrada Ate II": "10:17", "Salida F. Sarmiento": "10:30", "Nelson e Irigoyen": "10:42", "Gral. Paz y Maipú": "10:54", "Llega Cruce descanso": "11:04"},
            {"Salida del Cruce": "10:13", "Terminal": "10:22", "Balcarce y Urquiza": "10:32", "L.Guillet y G. Paz": "10:38", "Entrada Ate II": "10:50", "Salida F. Sarmiento": "11:03", "Nelson e Irigoyen": "11:15", "Gral. Paz y Maipú": "11:27", "Llega Cruce descanso": "11:37"},
            {"Salida del Cruce": "10:46", "Terminal": "10:55", "Balcarce y Urquiza": "11:05", "L.Guillet y G. Paz": "11:11", "Entrada Ate II": "11:23", "Salida F. Sarmiento": "11:36", "Nelson e Irigoyen": "11:48", "Gral. Paz y Maipú": "12:00", "Llega Cruce descanso": "12:10"},
            {"Salida del Cruce": "11:19", "Terminal": "11:28", "Balcarce y Urquiza": "11:38", "L.Guillet y G. Paz": "11:44", "Entrada Ate II": "11:56", "Salida F. Sarmiento": "12:09", "Nelson e Irigoyen": "12:21", "Gral. Paz y Maipú": "12:33", "Llega Cruce descanso": "12:43"},
            {"Salida del Cruce": "11:52", "Terminal": "12:01", "Balcarce y Urquiza": "12:11", "L.Guillet y G. Paz": "12:17", "Entrada Ate II": "12:29", "Salida F. Sarmiento": "12:42", "Nelson e Irigoyen": "12:54", "Gral. Paz y Maipú": "13:06", "Llega Cruce descanso": "13:16"},
            {"Salida del Cruce": "12:25", "Terminal": "12:34", "Balcarce y Urquiza": "12:44", "L.Guillet y G. Paz": "12:50", "Entrada Ate II": "13:02", "Salida F. Sarmiento": "13:15", "Nelson e Irigoyen": "13:27", "Gral. Paz y Maipú": "13:39", "Llega Cruce descanso": "13:49"},
            {"Salida del Cruce": "12:58", "Terminal": "13:07", "Balcarce y Urquiza": "13:17", "L.Guillet y G. Paz": "13:23", "Entrada Ate II": "13:35", "Salida F. Sarmiento": "13:48", "Nelson e Irigoyen": "14:00", "Gral. Paz y Maipú": "14:12", "Llega Cruce descanso": "14:22"},
            {"Salida del Cruce": "13:31", "Terminal": "13:40", "Balcarce y Urquiza": "13:50", "L.Guillet y G. Paz": "13:56", "Entrada Ate II": "14:08", "Salida F. Sarmiento": "14:21", "Nelson e Irigoyen": "14:33", "Gral. Paz y Maipú": "14:45", "Llega Cruce descanso": "14:55"},
            {"Salida del Cruce": "14:04", "Terminal": "14:13", "Balcarce y Urquiza": "14:23", "L.Guillet y G. Paz": "14:29", "Entrada Ate II": "14:41", "Salida F. Sarmiento": "14:54", "Nelson e Irigoyen": "15:06", "Gral. Paz y Maipú": "15:18", "Llega Cruce descanso": "15:28"},
            {"Salida del Cruce": "14:37", "Terminal": "14:46", "Balcarce y Urquiza": "14:56", "L.Guillet y G. Paz": "15:02", "Entrada Ate II": "15:14", "Salida F. Sarmiento": "15:27", "Nelson e Irigoyen": "15:39", "Gral. Paz y Maipú": "15:51", "Llega Cruce descanso": "16:01"},
            {"Salida del Cruce": "15:10", "Terminal": "15:19", "Balcarce y Urquiza": "15:29", "L.Guillet y G. Paz": "15:35", "Entrada Ate II": "15:47", "Salida F. Sarmiento": "16:00", "Nelson e Irigoyen": "16:12", "Gral. Paz y Maipú": "16:24", "Llega Cruce descanso": "16:34"},
            {"Salida del Cruce": "15:43", "Terminal": "15:52", "Balcarce y Urquiza": "16:02", "L.Guillet y G. Paz": "16:08", "Entrada Ate II": "16:20", "Salida F. Sarmiento": "16:33", "Nelson e Irigoyen": "16:45", "Gral. Paz y Maipú": "16:57", "Llega Cruce descanso": "17:07"},
            {"Salida del Cruce": "16:16", "Terminal": "16:25", "Balcarce y Urquiza": "16:35", "L.Guillet y G. Paz": "16:41", "Entrada Ate II": "16:53", "Salida F. Sarmiento": "17:06", "Nelson e Irigoyen": "17:18", "Gral. Paz y Maipú": "17:30", "Llega Cruce descanso": "17:40"},
            {"Salida del Cruce": "16:49", "Terminal": "16:58", "Balcarce y Urquiza": "17:08", "L.Guillet y G. Paz": "17:14", "Entrada Ate II": "17:26", "Salida F. Sarmiento": "17:39", "Nelson e Irigoyen": "17:51", "Gral. Paz y Maipú": "18:03", "Llega Cruce descanso": "18:13"},
            {"Salida del Cruce": "17:22", "Terminal": "17:31", "Balcarce y Urquiza": "17:41", "L.Guillet y G. Paz": "17:47", "Entrada Ate II": "17:59", "Salida F. Sarmiento": "18:12", "Nelson e Irigoyen": "18:24", "Gral. Paz y Maipú": "18:36", "Llega Cruce descanso": "18:46"},
            {"Salida del Cruce": "17:55", "Terminal": "18:04", "Balcarce y Urquiza": "18:14", "L.Guillet y G. Paz": "18:20", "Entrada Ate II": "18:32", "Salida F. Sarmiento": "18:45", "Nelson e Irigoyen": "18:57", "Gral. Paz y Maipú": "19:09", "Llega Cruce descanso": "19:19"},
            {"Salida del Cruce": "18:28", "Terminal": "18:37", "Balcarce y Urquiza": "18:47", "L.Guillet y G. Paz": "18:53", "Entrada Ate II": "19:05", "Salida F. Sarmiento": "19:18", "Nelson e Irigoyen": "19:30", "Gral. Paz y Maipú": "19:42", "Llega Cruce descanso": "19:52"},
            {"Salida del Cruce": "19:01", "Terminal": "19:10", "Balcarce y Urquiza": "19:20", "L.Guillet y G. Paz": "19:26", "Entrada Ate II": "19:38", "Salida F. Sarmiento": "19:51", "Nelson e Irigoyen": "20:03", "Gral. Paz y Maipú": "20:15", "Llega Cruce descanso": "20:25"},
            {"Salida del Cruce": "19:34", "Terminal": "19:43", "Balcarce y Urquiza": "19:53", "L.Guillet y G. Paz": "19:59", "Entrada Ate II": "20:11", "Salida F. Sarmiento": "20:24", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "20:07", "Terminal": "20:16", "Balcarce y Urquiza": "20:26", "L.Guillet y G. Paz": "20:32", "Entrada Ate II": "20:44", "Salida F. Sarmiento": "20:57", "Nelson e Irigoyen": "21:09", "Gral. Paz y Maipú": "21:21", "Llega Cruce descanso": "21:31"},
            {"Salida del Cruce": "20:40", "Terminal": "20:49", "Balcarce y Urquiza": "20:59", "L.Guillet y G. Paz": "21:05", "Entrada Ate II": "21:17", "Salida F. Sarmiento": "21:30", "Nelson e Irigoyen": "21:42", "Gral. Paz y Maipú": "21:54", "Llega Cruce descanso": "22:04"},
            {"Salida del Cruce": "21:46", "Terminal": "21:55", "Balcarce y Urquiza": "22:05", "L.Guillet y G. Paz": "22:11", "Entrada Ate II": "22:23", "Salida F. Sarmiento": "22:36", "Nelson e Irigoyen": "22:48", "Gral. Paz y Maipú": "23:00", "Llega Cruce descanso": "23:10"},
            {"Salida del Cruce": "22:19", "Terminal": "22:28", "Balcarce y Urquiza": "22:38", "L.Guillet y G. Paz": "22:44", "Entrada Ate II": "22:56", "Salida F. Sarmiento": "23:09", "Nelson e IrigGoyen": "23:21", "Gral. Paz y Maipú": "23:33", "Llega Cruce descanso": "23:43"},
            {"Salida del Cruce": "23:25", "Terminal": "23:34", "Balcarce y Urquiza": "23:42", "L.Guillet y G. Paz": "23:46", "Entrada Ate II": null, "Salida F. Sarmiento": "00:11", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null}
        ]
    };

    // --- HORARIOS: RECESO DE VERANO (LUNES A VIERNES) ---
    const horariosLunVieRecesoVerano = [
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "05:14", "Salida F. Sarmiento": "05:27", "Nelson e Irigoyen": "05:41", "Gral. Paz y Maipú": "05:56", "Llega Cruce descanso": "06:08"},
            {"Salida del Cruce": "05:27", "Terminal": "05:37", "Balcarce y Urquiza": "05:52", "L.Guillet y G. Paz": "05:58", "Entrada Ate II": "06:10", "Salida F. Sarmiento": "06:23", "Nelson e Irigoyen": "06:37", "Gral. Paz y Maipú": "06:52", "Llega Cruce descanso": "07:04"},
            {"Salida del Cruce": "06:23", "Terminal": "06:33", "Balcarce y Urquiza": "06:48", "L.Guillet y G. Paz": "06:54", "Entrada Ate II": "07:06", "Salida F. Sarmiento": "07:19", "Nelson e Irigoyen": "07:33", "Gral. Paz y Maipú": "07:48", "Llega Cruce descanso": "08:00"},
            {"Salida del Cruce": "07:19", "Terminal": "07:29", "Balcarce y Urquiza": "07:44", "L.Guillet y G. Paz": "07:50", "Entrada Ate II": "08:02", "Salida F. Sarmiento": "08:15", "Nelson e Irigoyen": "08:29", "Gral. Paz y Maipú": "08:44", "Llega Cruce descanso": "08:56"},
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "08:30", "Salida F. Sarmiento": "08:43", "Nelson e Irigoyen": "08:57", "Gral. Paz y Maipú": "09:12", "Llega Cruce descanso": "09:24"},
            {"Salida del Cruce": "08:15", "Terminal": "08:25", "Balcarce y Urquiza": "08:40", "L.Guillet y G. Paz": "08:46", "Entrada Ate II": "08:58", "Salida F. Sarmiento": "09:11", "Nelson e Irigoyen": "09:25", "Gral. Paz y Maipú": "09:40", "Llega Cruce descanso": "09:52"},
            {"Salida del Cruce": null, "Terminal": "08:53", "Balcarce y Urquiza": "09:08", "L.Guillet y G. Paz": "09:14", "Entrada Ate II": "09:26", "Salida F. Sarmiento": "09:39", "Nelson e Irigoyen": "09:53", "Gral. Paz y Maipú": "10:08", "Llega Cruce descanso": "10:20"},
            {"Salida del Cruce": "09:11", "Terminal": "09:21", "Balcarce y Urquiza": "09:36", "L.Guillet y G. Paz": "09:42", "Entrada Ate II": "09:54", "Salida F. Sarmiento": "10:07", "Nelson e Irigoyen": "10:21", "Gral. Paz y Maipú": "10:36", "Llega Cruce descanso": "10:48"},
            {"Salida del Cruce": "09:39", "Terminal": "09:49", "Balcarce y Urquiza": "10:04", "L.Guillet y G. Paz": "10:10", "Entrada Ate II": "10:22", "Salida F. Sarmiento": "10:35", "Nelson e Irigoyen": "10:49", "Gral. Paz y Maipú": "11:04", "Llega Cruce descanso": "11:16"},
            {"Salida del Cruce": "10:07", "Terminal": "10:17", "Balcarce y Urquiza": "10:32", "L.Guillet y G. Paz": "10:38", "Entrada Ate II": "10:50", "Salida F. Sarmiento": "11:03", "Nelson e Irigoyen": "11:17", "Gral. Paz y Maipú": "11:32", "Llega Cruce descanso": "11:44"},
            {"Salida del Cruce": "10:35", "Terminal": "10:45", "Balcarce y Urquiza": "11:00", "L.Guillet y G. Paz": "11:06", "Entrada Ate II": "11:18", "Salida F. Sarmiento": "11:31", "Nelson e Irigoyen": "11:45", "Gral. Paz y Maipú": "12:00", "Llega Cruce descanso": "12:12"},
            {"Salida del Cruce": "11:03", "Terminal": "11:13", "Balcarce y Urquiza": "11:28", "L.Guillet y G. Paz": "11:34", "Entrada Ate II": "11:46", "Salida F. Sarmiento": "11:59", "Nelson e Irigoyen": "12:13", "Gral. Paz y Maipú": "12:28", "Llega Cruce descanso": "12:40"},
            {"Salida del Cruce": "11:31", "Terminal": "11:41", "Balcarce y Urquiza": "11:56", "L.Guillet y G. Paz": "12:02", "Entrada Ate II": "12:14", "Salida F. Sarmiento": "12:27", "Nelson e Irigoyen": "12:41", "Gral. Paz y Maipú": "12:56", "Llega Cruce descanso": "13:08"},
            {"Salida del Cruce": "11:59", "Terminal": "12:09", "Balcarce y Urquiza": "12:24", "L.Guillet y G. Paz": "12:30", "Entrada Ate II": "12:42", "Salida F. Sarmiento": "12:55", "Nelson e Irigoyen": "13:09", "Gral. Paz y Maipú": "13:24", "Llega Cruce descanso": "13:36"},
            {"Salida del Cruce": "12:27", "Terminal": "12:37", "Balcarce y Urquiza": "12:52", "L.Guillet y G. Paz": "12:58", "Entrada Ate II": "13:10", "Salida F. Sarmiento": "13:23", "Nelson e Irigoyen": "13:37", "Gral. Paz y Maipú": "13:52", "Llega Cruce descanso": "14:04"},
            {"Salida del Cruce": "12:55", "Terminal": "13:05", "Balcarce y Urquiza": "13:20", "L.Guillet y G. Paz": "13:26", "Entrada Ate II": "13:38", "Salida F. Sarmiento": "13:51", "Nelson e Irigoyen": "14:05", "Gral. Paz y Maipú": "14:20", "Llega Cruce descanso": "14:32"},
            {"Salida del Cruce": "13:23", "Terminal": "13:33", "Balcarce y Urquiza": "13:48", "L.Guillet y G. Paz": "13:54", "Entrada Ate II": "14:06", "Salida F. Sarmiento": "14:19", "Nelson e Irigoyen": "14:33", "Gral. Paz y Maipú": "14:48", "Llega Cruce descanso": "15:00"},
            {"Salida del Cruce": "13:51", "Terminal": "14:01", "Balcarce y Urquiza": "14:16", "L.Guillet y G. Paz": "14:22", "Entrada Ate II": "14:34", "Salida F. Sarmiento": "14:47", "Nelson e Irigoyen": "15:01", "Gral. Paz y Maipú": "15:16", "Llega Cruce descanso": "15:28"},
            {"Salida del Cruce": "14:19", "Terminal": "14:29", "Balcarce y Urquiza": "14:44", "L.Guillet y G. Paz": "14:50", "Entrada Ate II": "15:02", "Salida F. Sarmiento": "15:15", "Nelson e Irigoyen": "15:29", "Gral. Paz y Maipú": "15:44", "Llega Cruce descanso": "15:56"},
            {"Salida del Cruce": "14:47", "Terminal": "14:57", "Balcarce y Urquiza": "15:12", "L.Guillet y G. Paz": "15:18", "Entrada Ate II": "15:30", "Salida F. Sarmiento": "15:43", "Nelson e Irigoyen": "15:57", "Gral. Paz y Maipú": "16:12", "Llega Cruce descanso": "16:24"},
            {"Salida del Cruce": "15:15", "Terminal": "15:25", "Balcarce y Urquiza": "15:40", "L.Guillet y G. Paz": "15:46", "Entrada Ate II": "15:58", "Salida F. Sarmiento": "16:11", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "15:43", "Terminal": "15:53", "Balcarce y Urquiza": "16:08", "L.Guillet y G. Paz": "16:14", "Entrada Ate II": "16:26", "Salida F. Sarmiento": "16:39", "Nelson e Irigoyen": "16:53", "Gral. Paz y Maipú": "17:08", "Llega Cruce descanso": "17:20"},
            {"Salida del Cruce": "16:11", "Terminal": "16:21", "Balcarce y Urquiza": "16:36", "L.Guillet y G. Paz": "16:42", "Entrada Ate II": "16:54", "Salida F. Sarmiento": "17:07", "Nelson e Irigoyen": "17:21", "Gral. Paz y Maipú": "17:36", "Llega Cruce descanso": "17:48"},
            {"Salida del Cruce": "16:39", "Terminal": "16:49", "Balcarce y Urquiza": "17:04", "L.Guillet y G. Paz": "17:10", "Entrada Ate II": "17:22", "Salida F. Sarmiento": "17:35", "Nelson e Irigoyen": "17:49", "Gral. Paz y Maipú": "18:04", "Llega Cruce descanso": "18:16"},
            {"Salida del Cruce": null, "Terminal": null, "Balcarce y Urquiza": null, "L.Guillet y G. Paz": null, "Entrada Ate II": "17:50", "Salida F. Sarmiento": "18:03", "Nelson e Irigoyen": "18:17", "Gral. Paz y Maipú": "18:32", "Llega Cruce descanso": "18:44"},
            {"Salida del Cruce": "17:35", "Terminal": "17:45", "Balcarce y Urquiza": "18:00", "L.Guillet y G. Paz": "18:06", "Entrada Ate II": "18:18", "Salida F. Sarmiento": "18:31", "Nelson e Irigoyen": "18:45", "Gral. Paz y Maipú": "19:00", "Llega Cruce descanso": "19:12"},
            {"Salida del Cruce": "18:03", "Terminal": "18:13", "Balcarce y Urquiza": "18:28", "L.Guillet y G. Paz": "18:34", "Entrada Ate II": "18:46", "Salida F. Sarmiento": "18:59", "Nelson e Irigoyen": "19:13", "Gral. Paz y Maipú": "19:28", "Llega Cruce descanso": "19:40"},
            {"Salida del Cruce": "18:31", "Terminal": "18:41", "Balcarce y Urquiza": "18:56", "L.Guillet y G. Paz": "19:02", "Entrada Ate II": "19:14", "Salida F. Sarmiento": "19:27", "Nelson e Irigoyen": "19:41", "Gral. Paz y Maipú": "19:56", "Llega Cruce descanso": "20:08"},
            {"Salida del Cruce": "18:59", "Terminal": "19:09", "Balcarce y Urquiza": "19:24", "L.Guillet y G. Paz": "19:30", "Entrada Ate II": "19:42", "Salida F. Sarmiento": "19:55", "Nelson e Irigoyen": "20:09", "Gral. Paz y Maipú": "20:24", "Llega Cruce descanso": "20:36"},
            {"Salida del Cruce": "19:27", "Terminal": "19:37", "Balcarce y Urquiza": "19:52", "L.Guillet y G. Paz": "19:58", "Entrada Ate II": "20:10", "Salida F. Sarmiento": "20:23", "Nelson e Irigoyen": "20:37", "Gral. Paz y Maipú": "20:52", "Llega Cruce descanso": "21:04"},
            {"Salida del Cruce": "19:55", "Terminal": "20:05", "Balcarce y Urquiza": "20:20", "L.Guillet y G. Paz": "20:26", "Entrada Ate II": "20:38", "Salida F. Sarmiento": "20:51", "Nelson e Irigoyen": "21:05", "Gral. Paz y Maipú": "21:20", "Llega Cruce descanso": "21:32"},
            {"Salida del Cruce": "20:23", "Terminal": "20:33", "Balcarce y Urquiza": "20:48", "L.Guillet y G. Paz": "20:54", "Entrada Ate II": "21:06", "Salida F. Sarmiento": "21:19", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "20:51", "Terminal": "21:00", "Balcarce y Urquiza": "21:12", "L.Guillet y G. Paz": "21:17", "Entrada Ate II": "21:28", "Salida F. Sarmiento": "21:40", "Nelson e Irigoyen": "21:52", "Gral. Paz y Maipú": "22:05", "Llega Cruce descanso": "22:17"},
            {"Salida del Cruce": "21:47", "Terminal": "21:56", "Balcarce y Urquiza": "22:08", "L.Guillet y G. Paz": "22:13", "Entrada Ate II": "22:24", "Salida F. Sarmiento": "22:36", "Nelson e Irigoyen": "22:48", "Gral. Paz y Maipú": "23:01", "Llega Cruce descanso": "23:13"},
            {"Salida del Cruce": "22:32", "Terminal": "22:41", "Balcarce y Urquiza": "22:53", "L.Guillet y G. Paz": "22:58", "Entrada Ate II": "23:09", "Salida F. Sarmiento": "23:21", "Nelson e Irigoyen": "23:33", "Gral. Paz y Maipú": "23:46", "Llega Cruce descanso": "23:58"},
            {"Salida del Cruce": "23:28", "Terminal": "23:37", "Balcarce y Urquiza": "23:49", "L.Guillet y G. Paz": "23:54", "Entrada Ate II": "00:05", "Salida F. Sarmiento": "00:17", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null},
            {"Salida del Cruce": "00:13", "Terminal": "00:22", "Balcarce y Urquiza": "00:34", "L.Guillet y G. Paz": "00:39", "Entrada Ate II": "00:50", "Salida F. Sarmiento": "01:02", "Nelson e Irigoyen": null, "Gral. Paz y Maipú": null, "Llega Cruce descanso": null}
        ];

    // --- HORARIOS POR TEMPORADA ---
    const datosHorarios = {
        regular: datosHorariosRegular,
        receso_verano: {
            lunes_a_viernes: horariosLunVieRecesoVerano,
            sabados: datosHorariosRegular.sabados,
            domingos: datosHorariosRegular.domingos
        }
    };



    // --- VARIABLES DE ESTADO ---
    let listaViajesActual = [];
    let diaActualKey = "";

    let temporadaActual = 'regular';

    // --- STORAGE (recordar parada + favoritos) ---
    const STORAGE = {
        lastTemporada: 'mc_last_temporada',
        lastParadaRegular: 'mc_last_parada_regular',
        lastParadaVerano: 'mc_last_parada_verano',
        favTemporada: 'mc_fav_temporada',
        favParada: 'mc_fav_parada'
    };

    function nombreTemporadaHumana(temp) {
        return (temp === 'receso_verano') ? 'Receso de verano' : 'Ciclo lectivo';
    }

    function getLastParada(temp) {
        const key = (temp === 'receso_verano') ? STORAGE.lastParadaVerano : STORAGE.lastParadaRegular;
        return localStorage.getItem(key) || '';
    }

    function saveLastParada(temp, parada) {
        if (!parada) return;
        const key = (temp === 'receso_verano') ? STORAGE.lastParadaVerano : STORAGE.lastParadaRegular;
        localStorage.setItem(key, parada);
        localStorage.setItem(STORAGE.lastTemporada, temp);
    }

    function actualizarSegmentedUI(temp) {
        if (!segRegular || !segVerano) return;
        const isRegular = (temp !== 'receso_verano');
        segRegular.classList.toggle('active', isRegular);
        segVerano.classList.toggle('active', !isRegular);
        segRegular.setAttribute('aria-selected', isRegular ? 'true' : 'false');
        segVerano.setAttribute('aria-selected', !isRegular ? 'true' : 'false');
    }

    function seleccionarParadaSiExiste(parada) {
        if (!parada) return false;
        const existe = [...selector.options].some(o => o.value === parada);
        if (!existe) return false;
        selector.value = parada;
        return true;
    }

    function actualizarFavoritoUI() {
        const favTemp = localStorage.getItem(STORAGE.favTemporada);
        const favParada = localStorage.getItem(STORAGE.favParada);
        const hayFav = !!(favTemp && favParada);

        if (favInfo) {
            favInfo.textContent = hayFav ? `Favorita: ${favParada} · ${nombreTemporadaHumana(favTemp)}` : 'Favorita: —';
        }
        if (btnUsarFav) {
            btnUsarFav.disabled = !hayFav;
        }
    }

    function aplicarTemporada(nuevaTemporada, opts = {}) {
        const tempValida = datosHorarios[nuevaTemporada] ? nuevaTemporada : 'regular';
        temporadaActual = tempValida;

        if (selectorTemporada) selectorTemporada.value = tempValida;
        actualizarSegmentedUI(tempValida);
        if (opts.persist !== false) localStorage.setItem(STORAGE.lastTemporada, tempValida);

        const fecha = new Date();
        const diaSemana = fecha.getDay(); // 0 Dom, 6 Sab
        if (diaSemana === 0) diaActualKey = 'domingos';
        else if (diaSemana === 6) diaActualKey = 'sabados';
        else diaActualKey = 'lunes_a_viernes';

        listaViajesActual = datosHorarios[tempValida][diaActualKey] || [];

        // Reset UI
        selector.value = "";
        timelineContainer.classList.add('hidden');
        mensajeError.classList.remove('hidden');
        mensajeError.textContent = "Selecciona una parada";

        // Recargar paradas
        llenarSelector();

        // Preselección
        const paradaPreferida = opts.preselectParada || getLastParada(tempValida);
        if (seleccionarParadaSiExiste(paradaPreferida)) {
            mensajeError.classList.add('hidden');
            actualizarTimeline();
            if (opts.persistLastParada !== false) saveLastParada(tempValida, paradaPreferida);
        } else if (opts.preselectParada) {
            mensajeError.textContent = "La parada favorita no existe en este horario.";
        }

        // Si está abierta la grilla, refrescar la tabla que esté activa
        const btnActivo = document.querySelector('.tab-btn.active');
        const diaRender = btnActivo ? btnActivo.getAttribute('data-dia') : diaActualKey;
        renderizarTabla(diaRender);

        actualizarFavoritoUI();
    }

    // --- 1. INICIALIZACIÓN ---
    function iniciarApp() {
        const fecha = new Date();
        const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
        const fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
        displayFecha.textContent = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

        const tempInicial = selectorTemporada ? selectorTemporada.value : 'regular';
        aplicarTemporada(tempInicial, { persist: false, persistLastParada: false });
        actualizarFavoritoUI();
    }

    // --- 2. LLENAR SELECTOR INTELIGENTE ---
    function llenarSelector() {
        // Busca la primera fila con datos válidos para sacar los nombres de las paradas
        let filaReferencia = listaViajesActual.find(v => v && Object.keys(v).length > 3);
        
        if(!filaReferencia) {
            selector.innerHTML = '<option disabled>Sin datos para hoy</option>';
            return;
        }

        const paradas = Object.keys(filaReferencia);
        
        selector.innerHTML = '<option value="" disabled selected>Selecciona tu parada...</option>';
        paradas.forEach(parada => {
            const option = document.createElement('option');
            option.value = parada;
            option.textContent = parada;
            selector.appendChild(option);
        });
    }

    // --- 3. LÓGICA DE TIEMPO Y TIMELINE ---
    function actualizarTimeline() {
        const parada = selector.value;
        if (!parada) return;

        const ahora = new Date();
        let minutosActuales = (ahora.getHours() * 60) + ahora.getMinutes();
        if (ahora.getHours() < 4) minutosActuales += 24 * 60; // Día de servicio (madrugada)

        // Filtrar solo los viajes que tienen horario válido para esta parada
        const viajesValidos = listaViajesActual.filter(v => v[parada] && v[parada] !== "---" && v[parada] !== null);

        // Buscar el índice del próximo colectivo
        let indiceProximo = -1;

        for (let i = 0; i < viajesValidos.length; i++) {
            const horarioStr = viajesValidos[i][parada];
            if (!horarioStr) continue;
            
            const [h, m] = horarioStr.split(':').map(Number);
            let minutosViaje = (h * 60) + m;
            
            if (h < 4) minutosViaje += 24 * 60; // Ajuste madrugada

            if (minutosViaje > minutosActuales) {
                indiceProximo = i;
                break;
            }
        }

        // Renderizar resultados
        if (indiceProximo !== -1) {
            timelineContainer.classList.remove('hidden');
            mensajeError.classList.add('hidden');

            // 1. ANTERIOR
            if (indiceProximo > 0) {
                prevHora.textContent = viajesValidos[indiceProximo - 1][parada];
                prevHora.parentElement.classList.remove('hidden');
            } else {
                prevHora.parentElement.classList.add('hidden');
            }

            // 2. ACTUAL (PRINCIPAL)
            const horarioActual = viajesValidos[indiceProximo][parada];
            const [h, m] = horarioActual.split(':').map(Number);
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

            // 3. SIGUIENTE +1
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

            // 4. SIGUIENTE +2
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

    // --- 4. LÓGICA DE TABLAS COMPLETAS ---
    function mostrarTablas() {
        pantallaPrincipal.classList.add('hidden');
        pantallaTablas.classList.remove('hidden');
        renderizarTabla(diaActualKey);
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const btnActivo = document.querySelector(`.tab-btn[data-dia="${diaActualKey}"]`);
        if(btnActivo) btnActivo.classList.add('active');
    }

    function cerrarTablas() {
        pantallaTablas.classList.add('hidden');
        pantallaPrincipal.classList.remove('hidden');
    }

    // --- 4b. MAPA Y PARADAS ---
    const MAP_STORAGE_KEY = 'lineaA_stopMapping_v1';

    let map = null;
    let layerRoute = null;
    let layerAllStops = null;
    let layerLogicalStops = null;

    let iconRealStop = null;
    let iconLogicalStop = null;
    let iconUser = null;

    let realMarkersById = new Map();
    let userMarker = null;
    let nearestRing = null;
    let popupUpdateTimer = null;
    let popupUpdateMarker = null;

    function normText(s) {
        return (s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function bestOptionMatch(target, options) {
        const t = normText(target);
        let best = null;
        for (const opt of options) {
            const o = normText(opt.value);
            if (!o) continue;
            let score = 0;
            if (o === t) score = 1;
            else {
                // token overlap + simple ratio
                const tt = new Set(t.split(' ').filter(Boolean));
                const oo = new Set(o.split(' ').filter(Boolean));
                const inter = [...tt].filter(x => oo.has(x)).length;
                const token = inter / Math.max(1, tt.size);
                // ratio aproximado
                const ratio = 1 - (Math.abs(o.length - t.length) / Math.max(1, Math.max(o.length, t.length)));
                score = 0.7 * token + 0.3 * ratio;
            }
            if (!best || score > best.score) best = { score, value: opt.value };
        }
        return best ? best.value : null;
    }

    function makeStopIcon(kind) {
        const isLogical = kind === 'logical';
        const klass = isLogical ? 'stop-icon stop-icon--logical' : 'stop-icon stop-icon--real';
        const size = isLogical ? 26 : 16;
        return L.divIcon({
            className: 'stop-divicon',
            html: `<div class="${klass}"></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    }

    function makeUserIcon() {
        return L.divIcon({
            className: 'stop-divicon',
            html: `<div class="user-dot"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });
    }

    function haversineMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (d) => d * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function setNearestRing(lat, lon) {
        if (!map) return;
        if (nearestRing) {
            try { map.removeLayer(nearestRing); } catch (e) {}
            nearestRing = null;
        }
        nearestRing = L.circleMarker([lat, lon], {
            radius: 18,
            weight: 3,
            opacity: 0.95,
            color: '#00d2ff',
            fillOpacity: 0
        }).addTo(map);
    }

    function openSearch() {
        if (buscarResultados) buscarResultados.classList.remove('hidden');
    }

    function closeSearch() {
        if (buscarResultados) {
            buscarResultados.classList.add('hidden');
            buscarResultados.innerHTML = '';
        }
    }

    function selectStopByLogicalKey(key, closeOnSelect) {
        const best = bestOptionMatch(key, [...selector.options]);
        if (best) {
            selector.value = best;
            saveLastParada(temporadaActual, selector.value);
            actualizarTimeline();
            setHint(`Parada seleccionada: ${best}`);
            if (closeOnSelect) cerrarMapa();
            return true;
        }
        setHint('Esta parada no está disponible en la grilla actual.');
        return false;
    }

    function updateSearchResults(query) {
        if (!map || !window.LINEA_A_MAP || !buscarResultados) return;
        const q = normText(query);
        if (!q) {
            closeSearch();
            return;
        }
        const stops = window.LINEA_A_MAP.stops || [];
        const results = [];
        for (const s of stops) {
            if (normText(s.name).includes(q)) {
                results.push(s);
                if (results.length >= 8) break;
            }
        }
        if (!results.length) {
            buscarResultados.innerHTML = '<button type="button" disabled style="opacity:.55;cursor:not-allowed">Sin resultados</button>';
            openSearch();
            return;
        }
        buscarResultados.innerHTML = results.map(s => (
            `<button type="button" data-id="${s.id}">${s.name}<span class="sub">Tocar para centrar</span></button>`
        )).join('');
        openSearch();
        buscarResultados.querySelectorAll('button[data-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const stop = stops.find(x => x.id === id);
                if (!stop) return;
                const mk = realMarkersById.get(stop.id);
                const latlng = mk ? mk.getLatLng() : L.latLng(stop.lat, stop.lon);
                map.setView(latlng, Math.max(map.getZoom(), 16), { animate: true });
                setNearestRing(stop.lat, stop.lon);
                if (mk) mk.openTooltip();
                setHint(stop.name);
                closeSearch();
                if (inpBuscarParada) inpBuscarParada.blur();
            });
        });
    }

    function locateUserAndSuggest() {
        if (!navigator.geolocation) {
            setHint('Tu navegador no permite ubicación.');
            return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
            if (!map || !window.LINEA_A_MAP) return;

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // Marcador de usuario
            if (userMarker) {
                try { map.removeLayer(userMarker); } catch (e) {}
                userMarker = null;
            }
            userMarker = L.marker([lat, lon], { icon: iconUser, keyboard: false, zIndexOffset: 1200 }).addTo(map);
            map.setView([lat, lon], Math.max(map.getZoom(), 15), { animate: true });

            // Parada lógica más cercana (según mapeo)
            const mapping = loadMapping();
            const stops = window.LINEA_A_MAP.stops || [];
            let best = null;

            for (const [key, stopId] of Object.entries(mapping)) {
                const s = stops.find(x => x.id === stopId);
                if (!s) continue;
                const d = haversineMeters(lat, lon, s.lat, s.lon);
                if (!best || d < best.dist) best = { key, stop: s, dist: d };
            }

            if (!best) {
                setHint('Ubicación obtenida, pero no pude calcular la parada más cercana.');
                return;
            }

            // Resaltar parada sugerida
            setNearestRing(best.stop.lat, best.stop.lon);
            const mk = realMarkersById.get(best.stop.id);
            if (mk) mk.openTooltip();

            // Seleccionar en la grilla (si existe)
            const ok = selectStopByLogicalKey(best.key, false);
            const meters = Math.round(best.dist);
            if (ok) setHint(`Más cercana: ${best.key} • ${meters} m`);
            else setHint(`Más cercana (en el mapa): ${best.stop.name} • ${meters} m`);

        }, () => {
            setHint('No pude obtener tu ubicación (permiso denegado o sin señal).');
        }, {
            enableHighAccuracy: true,
            maximumAge: 15000,
            timeout: 12000
        });
    }

    function getLogicalStopKeys() {
        // Preferimos la grilla actual (selector), así el mapa siempre “habla el mismo idioma”
        const opts = [...selector.options].filter(o => o.value);
        const values = opts.map(o => o.value);
        return values.length ? values : Object.keys((window.LINEA_A_MAP && window.LINEA_A_MAP.defaultLogicalMapping) || {});
    }

    function loadMapping() {
        const def = (window.LINEA_A_MAP && window.LINEA_A_MAP.defaultLogicalMapping) ? window.LINEA_A_MAP.defaultLogicalMapping : {};
        try {
            const raw = localStorage.getItem(MAP_STORAGE_KEY);
            if (!raw) return { ...def };
            const parsed = JSON.parse(raw);
            return { ...def, ...parsed };
        } catch (e) {
            return { ...def };
        }
    }

    function saveMapping(mapObj) {
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(mapObj));
    }

    function setHint(text) {
        if (!mapHint) return;
        mapHint.textContent = text;
    }

    function mostrarMapa() {
        pantallaPrincipal.classList.add('hidden');
        pantallaMapa.classList.remove('hidden');

        // Inicializar una sola vez
        if (!map) {
            initMapa();
        } else {
            setTimeout(() => map.invalidateSize(), 50);
        }
    }

    function cerrarMapa() {
        pantallaMapa.classList.add('hidden');
        pantallaPrincipal.classList.remove('hidden');
        stopPopupAutoUpdate();
    }

    function initMapa() {
        if (!window.LINEA_A_MAP || !window.LINEA_A_MAP.route || !window.LINEA_A_MAP.stops) {
            setHint('No se pudo cargar el mapa (faltan datos).');
            return;
        }

        const routeLatLngs = window.LINEA_A_MAP.route.map(([lon, lat]) => [lat, lon]);
        const stops = window.LINEA_A_MAP.stops;

        // Iconos (más visibles)
        iconRealStop = makeStopIcon('real');
        iconLogicalStop = makeStopIcon('logical');
        iconUser = makeUserIcon();

        map = L.map('map', {
            zoomControl: true
        });

        // Base map (OSM)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        layerRoute = L.polyline(routeLatLngs, {
            weight: 5,
            opacity: 0.85
        }).addTo(map);

        // Paradas “reales” (90)
        layerAllStops = L.layerGroup();
        realMarkersById = new Map();
        stops.forEach((s) => {
            const m = L.marker([s.lat, s.lon], {
                icon: iconRealStop,
                riseOnHover: true,
                keyboard: false
            });
            m.bindTooltip(s.name, { direction: 'top', offset: [0, -10], opacity: 0.92 });
            m.on('click', () => onClickParadaReal(s));
            layerAllStops.addLayer(m);
            realMarkersById.set(s.id, m);
        });

        // Paradas “lógicas” (las de la grilla)
        layerLogicalStops = L.layerGroup();

        // UI inicial
        const mapping = loadMapping();
        buildLogicalLayer(mapping, { closeOnSelect: false });
        layerAllStops.addTo(map);

        fitToRoute();

        // Toolbar wiring
        if (btnCentrarMapa) btnCentrarMapa.addEventListener('click', fitToRoute);

        if (chkTodasParadas) {
            chkTodasParadas.addEventListener('change', () => {
                if (chkTodasParadas.checked) {
                    layerAllStops.addTo(map);
                } else {
                    map.removeLayer(layerAllStops);
                }
            });
        }

        // Ubicación + búsqueda
        if (btnMiUbicacion) {
            btnMiUbicacion.addEventListener('click', locateUserAndSuggest);
        }

        if (inpBuscarParada) {
            inpBuscarParada.addEventListener('input', (e) => updateSearchResults(e.target.value));
            inpBuscarParada.addEventListener('focus', (e) => updateSearchResults(e.target.value));
        }

        // Click en el mapa: cerrar lista de búsqueda
        map.on('click', () => closeSearch());

        if (selModoMapa) {
            selModoMapa.addEventListener('change', () => {
                const modo = selModoMapa.value;
                const assign = modo === 'asignar';
                if (selParadaLogica) selParadaLogica.disabled = !assign;
                if (btnResetMapeo) btnResetMapeo.disabled = !assign;

                if (assign) {
                    setHint('Elegí una parada lógica y tocá una parada real del mapa para asignarla.');
                    // Asegurar que se vean todas para asignar
                    if (chkTodasParadas) chkTodasParadas.checked = true;
                    layerAllStops.addTo(map);
                    layerLogicalStops.addTo(map);
                } else {
                    setHint('Tocá una parada lógica para seleccionarla y ver el próximo horario.');
                    layerLogicalStops.addTo(map);
                }
            });
        }

        if (selParadaLogica) {
            // Poblar selector con las paradas actuales
            const keys = Object.keys(mapping);
            selParadaLogica.innerHTML = '<option value="" disabled selected>Elegí una parada…</option>' +
                keys.map(k => `<option value="${k}">${k}</option>`).join('');
        }

        if (btnResetMapeo) {
            btnResetMapeo.addEventListener('click', () => {
                const def = (window.LINEA_A_MAP && window.LINEA_A_MAP.defaultLogicalMapping) ? window.LINEA_A_MAP.defaultLogicalMapping : {};
                saveMapping(def);
                buildLogicalLayer(def, { closeOnSelect: false });
                setHint('Asignaciones restauradas.');
            });
        }

        // Asegurar tamaño correcto
        setTimeout(() => map.invalidateSize(), 60);
    }

    function fitToRoute() {
        if (!map || !layerRoute) return;
        const b = layerRoute.getBounds();
        if (b && b.isValid()) map.fitBounds(b.pad(0.12));
    }

    function buildLogicalLayer(mapping, { closeOnSelect }) {
        if (!map || !window.LINEA_A_MAP) return;

        if (layerLogicalStops) {
            try { map.removeLayer(layerLogicalStops); } catch (e) {}
        }
        layerLogicalStops = L.layerGroup();

        const stops = window.LINEA_A_MAP.stops;

        // Iconos (más visibles)
        iconRealStop = makeStopIcon('real');
        iconLogicalStop = makeStopIcon('logical');
        iconUser = makeUserIcon();
        const logicalKeys = Object.keys(mapping);

        logicalKeys.forEach((key) => {
            const stopId = mapping[key];
            const s = stops.find(x => x.id === stopId);
            if (!s) return;

            const mk = L.marker([s.lat, s.lon], { icon: iconLogicalStop, keyboard: false, riseOnHover: true, zIndexOffset: 1000 });
            mk.bindTooltip(key, { direction: 'top', offset: [0, -8], opacity: 0.95, sticky: true });

            // Contexto para popup dinámico
            mk._logicalKey = key;
            mk._logicalStopName = s.name;

            mk.bindPopup('Cargando...', { maxWidth: 280, closeButton: true, autoPanPadding: [20, 90] });

            mk.on('click', () => onClickParadaLogica(key, s, mk, closeOnSelect));

            layerLogicalStops.addLayer(mk);
        });

        layerLogicalStops.addTo(map);

        // repoblar selector de asignación (para que incluya todas)
        if (selParadaLogica) {
            const keys = logicalKeys.slice().sort((a,b)=>a.localeCompare(b,'es'));
            selParadaLogica.innerHTML = '<option value="" disabled selected>Elegí una parada…</option>' +
                keys.map(k => `<option value="${k}">${k}</option>`).join('');
        }
    }

    
    // --- POPUP DE HORARIOS EN EL MAPA (paradas lógicas) ---
    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function nombreDiaHumano(keyDia) {
        if (keyDia === 'sabados') return 'Sábados';
        if (keyDia === 'domingos') return 'Domingos/Feriados';
        return 'Lunes a viernes';
    }

    function calcUpcomingForParada(parada) {
        if (!parada) return { ok: false, message: 'Seleccioná una parada.' };

        const ahora = new Date();
        let minutosActuales = (ahora.getHours() * 60) + ahora.getMinutes();
        if (ahora.getHours() < 4) minutosActuales += 24 * 60; // Día de servicio (madrugada)

        const viajesValidos = listaViajesActual
            .filter(v => v && v[parada] && v[parada] !== "---" && v[parada] !== null)
            .map(v => v[parada]);

        const times = [];
        for (const horarioStr of viajesValidos) {
            const parts = String(horarioStr).split(':').map(Number);
            if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) continue;
            const h = parts[0];
            const m = parts[1];
            let minViaje = (h * 60) + m;
            if (h < 4) minViaje += 24 * 60;
            times.push({ t: horarioStr, min: minViaje });
        }

        // ordenar por si hay algún dato desordenado
        times.sort((a, b) => a.min - b.min);

        let idx = -1;
        for (let i = 0; i < times.length; i++) {
            if (times[i].min > minutosActuales) { idx = i; break; }
        }
        if (idx === -1) return { ok: false, message: 'No hay más servicios por hoy.' };

        const next = times[idx];
        const prev = (idx > 0) ? times[idx - 1] : null;
        const next1 = (idx + 1 < times.length) ? times[idx + 1] : null;
        const next2 = (idx + 2 < times.length) ? times[idx + 2] : null;

        const dif = next.min - minutosActuales;

        let countdown = '';
        if (dif === 0) countdown = '¡Llegando!';
        else if (dif < 60) countdown = `En ${dif} min`;
        else {
            const horas = Math.floor(dif / 60);
            const mins = dif % 60;
            countdown = `En ${horas}h ${mins}m`;
        }

        const diffMin = (o) => (o ? String(o.min - minutosActuales) : '');

        return {
            ok: true,
            prev: prev ? prev.t : null,
            next: next.t,
            countdown,
            next1: next1 ? next1.t : null,
            next1Diff: next1 ? diffMin(next1) : null,
            next2: next2 ? next2.t : null,
            next2Diff: next2 ? diffMin(next2) : null,
            nowLabel: ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };
    }

    function renderLogicalStopPopupHtml(logicalKey, stopName) {
        const temporadaHumana = nombreTemporadaHumana(temporadaActual);
        const diaHumano = nombreDiaHumano(diaActualKey);

        const match = bestOptionMatch(logicalKey, [...selector.options]);
        const paradaGrilla = match || '';
        const selected = (selector && selector.value && paradaGrilla && selector.value === paradaGrilla);

        const baseHeader = `
            <div class="stop-popup__head">
                <div class="stop-popup__title">${escapeHtml(logicalKey)}</div>
                <div class="stop-popup__sub">${escapeHtml(stopName)}</div>
                <div class="stop-popup__meta">${escapeHtml(temporadaHumana)} · ${escapeHtml(diaHumano)} · ${selected ? 'Seleccionada' : 'Mapa'}</div>
            </div>
        `;

        if (!paradaGrilla) {
            return `
                <div class="stop-popup">
                    ${baseHeader}
                    <div class="stop-popup__warn">Esta parada no está en la grilla actual.</div>
                    <div class="stop-popup__actions">
                        <button class="popup-btn" data-action="tablas">Ver grilla</button>
                        <button class="popup-btn secondary" data-action="inicio">Volver</button>
                    </div>
                </div>
            `;
        }

        const info = calcUpcomingForParada(paradaGrilla);

        if (!info.ok) {
            return `
                <div class="stop-popup">
                    ${baseHeader}
                    <div class="stop-popup__warn">${escapeHtml(info.message)}</div>
                    <div class="stop-popup__actions">
                        <button class="popup-btn" data-action="tablas">Ver grilla</button>
                        <button class="popup-btn secondary" data-action="inicio">Ir al inicio</button>
                    </div>
                </div>
            `;
        }

        const line1 = info.next1 ? `<div class="stop-popup__row"><span>Luego</span><strong>${escapeHtml(info.next1)}</strong><em>${escapeHtml(info.next1Diff)} min</em></div>` : '';
        const line2 = info.next2 ? `<div class="stop-popup__row"><span>Después</span><strong>${escapeHtml(info.next2)}</strong><em>${escapeHtml(info.next2Diff)} min</em></div>` : '';

        return `
            <div class="stop-popup">
                ${baseHeader}

                <div class="stop-popup__next">
                    <div class="stop-popup__label">PRÓXIMO</div>
                    <div class="stop-popup__time">${escapeHtml(info.next)}</div>
                    <div class="stop-popup__count">${escapeHtml(info.countdown)}</div>
                </div>

                <div class="stop-popup__list">
                    ${line1}
                    ${line2}
                </div>

                <div class="stop-popup__actions">
                    <button class="popup-btn" data-action="guardarFav">Guardar favorita</button>
                    <button class="popup-btn secondary" data-action="inicio">Ir al inicio</button>
                    <button class="popup-btn secondary" data-action="tablas">Ver grilla</button>
                </div>

                <div class="stop-popup__foot">Actualizado: ${escapeHtml(info.nowLabel)}</div>
            </div>
        `;
    }

    function stopPopupAutoUpdate() {
        if (popupUpdateTimer) {
            clearInterval(popupUpdateTimer);
            popupUpdateTimer = null;
        }
        popupUpdateMarker = null;
    }

    function startPopupAutoUpdate(marker, logicalKey, stopName, closeOnSelect) {
        stopPopupAutoUpdate();
        popupUpdateMarker = marker;

        popupUpdateTimer = setInterval(() => {
            if (!marker || !marker.getPopup || !marker.isPopupOpen || !marker.isPopupOpen()) {
                stopPopupAutoUpdate();
                return;
            }
            try {
                marker.setPopupContent(renderLogicalStopPopupHtml(logicalKey, stopName));
                wireLogicalStopPopup(marker, logicalKey, stopName, closeOnSelect);
            } catch (e) {}
        }, 30000);
    }

    function wireLogicalStopPopup(marker, logicalKey, stopName, closeOnSelect) {
        const popup = marker && marker.getPopup ? marker.getPopup() : null;
        const el = popup && popup.getElement ? popup.getElement() : null;
        if (!el) return;

        const btns = el.querySelectorAll('button[data-action]');
        btns.forEach((b) => {
            // Evitar doble binding si el HTML se re-renderiza
            if (b.dataset.bound === '1') return;
            b.dataset.bound = '1';

            b.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();

                const act = b.getAttribute('data-action');

                if (act === 'inicio') {
                    if (closeOnSelect) cerrarMapa();
                    else cerrarMapa();
                    return;
                }

                if (act === 'tablas') {
                    cerrarMapa();
                    mostrarTablas();
                    return;
                }

                if (act === 'guardarFav') {
                    const match = bestOptionMatch(logicalKey, [...selector.options]);
                    if (!match) {
                        setHint('No pude guardar: esta parada no está en la grilla actual.');
                        return;
                    }
                    selector.value = match;
                    saveLastParada(temporadaActual, selector.value);
                    actualizarTimeline();
                    localStorage.setItem(STORAGE.favTemporada, temporadaActual);
                    localStorage.setItem(STORAGE.favParada, selector.value);
                    actualizarFavoritoUI();
                    setHint('Parada favorita guardada.');
                    // refrescar popup (para que diga "Seleccionada" y quede coherente)
                    marker.setPopupContent(renderLogicalStopPopupHtml(logicalKey, stopName));
                    wireLogicalStopPopup(marker, logicalKey, stopName, closeOnSelect);
                    return;
                }
            });
        });
    }

    function onClickParadaLogica(logicalKey, stop, marker, closeOnSelect) {
        const modo = selModoMapa ? selModoMapa.value : 'ver';

        if (modo === 'asignar') {
            if (selParadaLogica) selParadaLogica.value = logicalKey;
            setHint('Elegí una parada real del mapa para asignarla a la parada lógica seleccionada.');
            return;
        }

        // En modo ver: mostrar popup con próximos horarios
        if (stop && typeof stop.lat === 'number' && typeof stop.lon === 'number') {
            setNearestRing(stop.lat, stop.lon);
        }

        // Seleccionar en la grilla (si existe) para mantener coherencia con la app
        selectStopByLogicalKey(logicalKey, false);

        const html = renderLogicalStopPopupHtml(logicalKey, stop ? stop.name : '');
        if (marker && marker.setPopupContent) marker.setPopupContent(html);
        if (marker && marker.openPopup) marker.openPopup();

        // Wiring + autorefresco
        setTimeout(() => wireLogicalStopPopup(marker, logicalKey, stop ? stop.name : '', closeOnSelect), 0);
        startPopupAutoUpdate(marker, logicalKey, stop ? stop.name : '', closeOnSelect);
    }

function onClickParadaReal(stop) {
        const modo = selModoMapa ? selModoMapa.value : 'ver';
        if (modo !== 'asignar') {
            // En modo ver: solo mostrar info
            setHint(stop.name);
            return;
        }

        const logical = selParadaLogica ? selParadaLogica.value : '';
        if (!logical) {
            setHint('Primero elegí una “parada lógica” para asignar.');
            return;
        }

        const mapping = loadMapping();
        mapping[logical] = stop.id;
        saveMapping(mapping);
        buildLogicalLayer(mapping, { closeOnSelect: false });

        setHint(`Asignado: ${logical} → ${stop.name}`);
    }

    function renderizarTabla(keyDia) {
        const datos = (datosHorarios[temporadaActual] && datosHorarios[temporadaActual][keyDia]) ? datosHorarios[temporadaActual][keyDia] : datosHorarios.regular[keyDia];
        tablaHead.innerHTML = '';
        tablaBody.innerHTML = '';

        if (!datos || datos.length === 0) return;

        const filaRef = datos.find(d => Object.keys(d).length > 3);
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

    // --- EVENT LISTENERS ---
    selector.addEventListener('change', () => {
        saveLastParada(temporadaActual, selector.value);
        actualizarTimeline();
    });

    // Segmented control
    if (segRegular) {
        segRegular.addEventListener('click', () => aplicarTemporada('regular'));
    }
    if (segVerano) {
        segVerano.addEventListener('click', () => aplicarTemporada('receso_verano'));
    }

    // Fallback (select oculto)
    if (selectorTemporada) {
        selectorTemporada.addEventListener('change', () => aplicarTemporada(selectorTemporada.value || 'regular'));
    }

    // Favoritos
    if (btnGuardarFav) {
        btnGuardarFav.addEventListener('click', () => {
            const parada = selector.value;
            if (!parada) {
                mensajeError.classList.remove('hidden');
                mensajeError.textContent = "Primero selecciona una parada.";
                return;
            }
            localStorage.setItem(STORAGE.favTemporada, temporadaActual);
            localStorage.setItem(STORAGE.favParada, parada);
            actualizarFavoritoUI();

            const txtOriginal = btnGuardarFav.textContent;
            btnGuardarFav.textContent = "Guardada";
            setTimeout(() => { btnGuardarFav.textContent = txtOriginal; }, 900);
        });
    }
    if (btnUsarFav) {
        btnUsarFav.addEventListener('click', () => {
            const favTemp = localStorage.getItem(STORAGE.favTemporada);
            const favParada = localStorage.getItem(STORAGE.favParada);
            if (!favTemp || !favParada) return;
            aplicarTemporada(favTemp, { preselectParada: favParada });
        });
    }


    setInterval(() => {
        if(selector.value) actualizarTimeline();
    }, 30000);

    if (btnVerMapa) btnVerMapa.addEventListener('click', mostrarMapa);
    if (btnVolverMapa) btnVolverMapa.addEventListener('click', cerrarMapa);

    btnVerTablas.addEventListener('click', mostrarTablas);
    btnVolver.addEventListener('click', cerrarTablas);

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderizarTabla(e.target.getAttribute('data-dia'));
        });
    });

    // Inicial: restaurar temporada guardada
    const tempGuardada = localStorage.getItem(STORAGE.lastTemporada);
    if (tempGuardada && selectorTemporada && datosHorarios[tempGuardada]) {
        selectorTemporada.value = tempGuardada;
    }
    actualizarSegmentedUI(selectorTemporada ? selectorTemporada.value : 'regular');
    actualizarFavoritoUI();

    iniciarApp();
});
