var edges = [];
var nodes = [];
var paso = 0;
var traceback = [];
var limite = 0;
var algoritmo = "nw";
var caminos = [];
var posicionActualCamino = 0;
var final = 0;
var n = 0;
var m = 0;
var autoPlayTimer = null;
window.isFastForwarding = false;

$(document).ready(function () {
    const seq1Input = document.getElementById('seq_1');
    const seq2Input = document.getElementById('seq_2');
    
    if (seq1Input) seq1Input.addEventListener('input', convertirMayusculas);
    if (seq2Input) seq2Input.addEventListener('input', convertirMayusculas);

    d3.select("#root").remove();
    inicializar(algoritmo);

    $('.seq').on('input change', function () { inicializar(algoritmo); });
    $('.params').on('input change', function () { inicializar(algoritmo); });
    $('.btn-compute').on('click', function (e) {
        e.preventDefault();
        darPasoInicio();
    });

    $('#calculateButton').on('click', function (e) {
        e.preventDefault();
        darPasoInicio();
    });

    $('#siguiente').on('click', function (e) {
        e.preventDefault();
        darPasoSiguiente();
    });

    $('#anterior').on('click', function (e) {
        e.preventDefault();
        darPasoAnterior();
    });

    $('#sidebarAutoPlay').on('click', function (e) {
        e.preventDefault();
        toggleAutoPlay();
    });

    $('#sidebarPlus10').on('click', function (e) {
        e.preventDefault();
        avanzar10Pasos();
    });

    $('#sidebarToEnd').on('click', function (e) {
        e.preventDefault();
        irAlFinal();
    });
});

function darPasoSiguiente() {
    const totalMatriz = (n - 1) * (m - 1);

    if (final === 1 && paso === limite) {
        avanzar("nw", 0, 0);
        paso++;
        actualizarEstadoControles();
        return false;
    }

    if (paso <= totalMatriz) {
        siguiente(algoritmo, paso);
        paso++;
        actualizarEstadoControles();
        return true;
    } else {
        if (paso === totalMatriz + 1) {
            let matriz = edges;
            if (algoritmo === "sw") {
                caminos = tracebackSW(matriz);
                limite = paso + (caminos.length > 0 ? caminos[0].pasos.length : 0);
            }
            if (algoritmo === "nw") {
                caminos = tracebackNW(matriz);
                limite = paso + (caminos.pasos ? caminos.pasos.length : 0);
            }
        }
        if (paso < limite) {
            if (algoritmo === "sw" && caminos.length > 0) {
                avanzar(algoritmo, caminos[0].coordenadas[posicionActualCamino][0], caminos[0].coordenadas[posicionActualCamino][1], caminos[0].pasos[posicionActualCamino]);
                posicionActualCamino++;
                paso++;
                actualizarEstadoControles();
                return true;
            }
            if (algoritmo === "nw") {
                avanzar(algoritmo, caminos.coordenadas[posicionActualCamino][0], caminos.coordenadas[posicionActualCamino][1], caminos.pasos[posicionActualCamino]);
                posicionActualCamino++;
                paso++;
                if (paso === limite && algoritmo === "nw") final = 1;
                actualizarEstadoControles();
                return true;
            }
        }
    }
    actualizarEstadoControles();
    return false;
}

function darPasoAnterior() {
    detenerAutoPlay();
    const totalMatriz = (n - 1) * (m - 1);

    if (paso <= 2) {
        inicializar(algoritmo);
    } else if (paso > 2 && paso <= totalMatriz + 1) {
        anterior(algoritmo, paso - 2);
        paso--;
    } else if (paso === totalMatriz + 2) {
        if (algoritmo === "nw" && caminos.coordenadas && caminos.coordenadas.length > 0) {
            edges = borrarCamino(caminos.coordenadas[0][0], caminos.coordenadas[0][1]);
        } else if (algoritmo === "sw" && caminos.length > 0 && caminos[0].coordenadas.length > 0) {
            edges = borrarCamino(caminos[0].coordenadas[0][0], caminos[0].coordenadas[0][1]);
        }
        paso = paso - 2;
        siguiente(algoritmo, paso);
        paso++;
        posicionActualCamino = 0;
    } else if (paso > 2 && paso > totalMatriz + 2 && paso <= limite) {
        if (paso === limite && algoritmo === "nw") final = 0;

        if (algoritmo === "nw" && caminos.coordenadas) {
            retroceder(algoritmo, caminos.coordenadas[posicionActualCamino - 1][0], caminos.coordenadas[posicionActualCamino - 1][1], paso - 2);
        } else if (algoritmo === "sw" && caminos.length > 0) {
            retroceder(algoritmo, caminos[0].coordenadas[posicionActualCamino - 1][0], caminos[0].coordenadas[posicionActualCamino - 1][1], paso - 2);
        }
        posicionActualCamino--;
        paso--;
    } else if (paso === (limite + 1) && algoritmo === "nw") {
        retroceder(algoritmo, 0, 0, paso - 2);
        paso--;
    }
    actualizarEstadoControles();
}

function darPasoInicio() {
    detenerAutoPlay();
    inicializar(algoritmo);
}

function avanzar10Pasos() {
    detenerAutoPlay();
    for (let k = 0; k < 10; k++) {
        let ok = darPasoSiguiente();
        if (!ok) break;
    }
}

function irAlFinal() {
    detenerAutoPlay();
    const totalMatriz = (n - 1) * (m - 1);
    window.isFastForwarding = true;

    // 1. Completar celdas de la matriz
    while (paso <= totalMatriz) {
        siguiente(algoritmo, paso);
        paso++;
    }

    // 2. Inicializar traceback
    if (paso === totalMatriz + 1) {
        let matriz = edges;
        if (algoritmo === "nw") {
            caminos = tracebackNW(matriz);
            limite = paso + (caminos.pasos ? caminos.pasos.length : 0);
        } else {
            caminos = tracebackSW(matriz);
            limite = paso + (caminos.length > 0 ? caminos[0].pasos.length : 0);
        }
    }

    // 3. Marcar todo el camino de traceback
    if (algoritmo === "nw" && caminos && caminos.pasos) {
        while (posicionActualCamino < caminos.pasos.length) {
            marcarCamino(caminos.coordenadas[posicionActualCamino][0], caminos.coordenadas[posicionActualCamino][1], caminos.pasos[posicionActualCamino]);
            posicionActualCamino++;
            paso++;
        }
        final = 1;
        marcarCamino(0, 0, null);
    } else if (algoritmo === "sw" && caminos && caminos.length > 0 && caminos[0].pasos) {
        while (posicionActualCamino < caminos[0].pasos.length) {
            marcarCamino(caminos[0].coordenadas[posicionActualCamino][0], caminos[0].coordenadas[posicionActualCamino][1], caminos[0].pasos[posicionActualCamino]);
            posicionActualCamino++;
            paso++;
        }
    }

    window.isFastForwarding = false;

    // Renderizar estado final completo
    if (algoritmo === "nw") {
        avanzar(algoritmo, 0, 0);
    } else if (algoritmo === "sw" && caminos.length > 0 && caminos[0].coordenadas.length > 0) {
        let lastCoord = caminos[0].coordenadas[caminos[0].coordenadas.length - 1];
        let lastPaso = caminos[0].pasos[caminos[0].pasos.length - 1];
        avanzar(algoritmo, lastCoord[0], lastCoord[1], lastPaso);
    }
    actualizarEstadoControles();
}

function toggleAutoPlay() {
    if (autoPlayTimer) {
        detenerAutoPlay();
    } else {
        iniciarAutoPlay();
    }
}

function iniciarAutoPlay() {
    detenerAutoPlay();
    actualizarBotonesAuto(true);
    autoPlayTimer = setInterval(function () {
        let ok = darPasoSiguiente();
        if (!ok) {
            detenerAutoPlay();
        }
    }, 120);
}

function detenerAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
    actualizarBotonesAuto(false);
}

function actualizarBotonesAuto(isPlaying) {
    const btnTop = document.getElementById("btn-autoplay");
    if (btnTop) {
        btnTop.innerHTML = isPlaying 
            ? "<i class='bx bx-pause'></i> Pausa" 
            : "<i class='bx bx-play'></i> Auto";
        if (isPlaying) {
            btnTop.classList.add("btn-active-auto");
        } else {
            btnTop.classList.remove("btn-active-auto");
        }
    }
    const btnSidebar = document.getElementById("sidebarAutoPlayText");
    const iconSidebar = document.querySelector("#sidebarAutoPlay i");
    if (btnSidebar) btnSidebar.innerText = isPlaying ? "Pausa" : "Auto";
    if (iconSidebar) iconSidebar.className = isPlaying ? "bx bx-pause icon" : "bx bx-play icon";
}

function actualizarEstadoControles() {
    const totalMatriz = (n - 1) * (m - 1);
    const esInicio = (paso <= 1);
    const esFin = (final === 1 && paso > limite) || (algoritmo === "sw" && caminos.length > 0 && posicionActualCamino >= caminos[0].pasos.length);

    // Botones Anterior / Inicio
    const btnPrevTop = document.getElementById("btn-prev");
    const btnPrevSide = document.getElementById("anterior");
    const btnInicioTop = document.getElementById("btn-inicio");

    if (btnPrevTop) btnPrevTop.disabled = esInicio;
    if (btnPrevSide) $(btnPrevSide).css("pointer-events", esInicio ? "none" : "auto").css("opacity", esInicio ? "0.45" : "1");
    if (btnInicioTop) btnInicioTop.disabled = esInicio;

    // Botones Siguiente / +10 / Final / Auto
    const btnNextTop = document.getElementById("btn-next");
    const btnNextSide = document.getElementById("siguiente");
    const btnPlus10Top = document.getElementById("btn-plus10");
    const btnPlus10Side = document.getElementById("sidebarPlus10");
    const btnEndTop = document.getElementById("btn-end");
    const btnEndSide = document.getElementById("sidebarToEnd");
    const btnAutoTop = document.getElementById("btn-autoplay");
    const btnAutoSide = document.getElementById("sidebarAutoPlay");

    if (btnNextTop) btnNextTop.disabled = esFin;
    if (btnNextSide) $(btnNextSide).css("pointer-events", esFin ? "none" : "auto").css("opacity", esFin ? "0.45" : "1");
    if (btnPlus10Top) btnPlus10Top.disabled = esFin;
    if (btnPlus10Side) $(btnPlus10Side).css("pointer-events", esFin ? "none" : "auto").css("opacity", esFin ? "0.45" : "1");
    if (btnEndTop) btnEndTop.disabled = esFin;
    if (btnEndSide) $(btnEndSide).css("pointer-events", esFin ? "none" : "auto").css("opacity", esFin ? "0.45" : "1");
    if (btnAutoTop) btnAutoTop.disabled = esFin;
    if (btnAutoSide) $(btnAutoSide).css("pointer-events", esFin ? "none" : "auto").css("opacity", esFin ? "0.45" : "1");

    // Badge de progreso
    const badge = document.getElementById("progress-badge");
    if (badge) {
        if (paso <= 1) {
            badge.innerText = `Paso 0 de ${totalMatriz} (Inicio)`;
        } else if (paso <= totalMatriz + 1) {
            const pasoActual = Math.min(paso - 1, totalMatriz);
            const pct = Math.round((pasoActual / totalMatriz) * 100);
            badge.innerText = `Llenado: ${pasoActual}/${totalMatriz} (${pct}%)`;
        } else if (!esFin) {
            const totalTb = (algoritmo === "nw") ? (caminos.pasos ? caminos.pasos.length : 0) : (caminos[0] ? caminos[0].pasos.length : 0);
            badge.innerText = `Traceback: ${posicionActualCamino}/${totalTb}`;
        } else {
            badge.innerText = `✅ Alineamiento Completo`;
        }
    }
}

// Exponer globalmente para onclick de HTML
window.darPasoSiguiente = darPasoSiguiente;
window.darPasoAnterior = darPasoAnterior;
window.darPasoInicio = darPasoInicio;
window.avanzar10Pasos = avanzar10Pasos;
window.irAlFinal = irAlFinal;
window.toggleAutoPlay = toggleAutoPlay;
window.detenerAutoPlay = detenerAutoPlay;
window.actualizarEstadoControles = actualizarEstadoControles;

function convertirMayusculas(event) {
    const input = event.target;
    input.value = input.value.toUpperCase();
}

function inicializacionNW(edges, seq1, seq2, gap = -2) {
    const n = seq1.length;
    const m = seq2.length;
    const edge = edges.find(e => e.i === 0 && e.j === 0);
    if (edge) edge.puntaje = 0;

    for (let i = 1; i <= n; i++) {
        const edge = edges.find(e => e.i === i && e.j === 0);
        if (edge) edge.puntaje = gap * i;
    }

    for (let j = 1; j <= m; j++) {
        const edge = edges.find(e => e.i === 0 && e.j === j);
        if (edge) edge.puntaje = gap * j;
    }
    return edges;
}

function inicializacionSW(edges, seq1, seq2, gap = -2) {
    const n = seq1.length;
    const m = seq2.length;
    const edge = edges.find(e => e.i === 0 && e.j === 0);
    if (edge) edge.puntaje = 0;

    for (let i = 1; i <= n; i++) {
        const edge = edges.find(e => e.i === i && e.j === 0);
        if (edge) edge.puntaje = 0;
    }

    for (let j = 1; j <= m; j++) {
        const edge = edges.find(e => e.i === 0 && e.j === j);
        if (edge) edge.puntaje = 0;
    }
    return edges;
}

function encontrarCelda(matriz, i, j) {
    for (let celda of matriz) {
        if (celda.i === i && celda.j === j) {
            return celda;
        }
    }
    return null;
}

function tracebackSW(matriz) {
    let celdasValidas = matriz.filter(c => c.i > 0 && c.j > 0 && c.puntaje !== null && c.puntaje !== undefined);
    if (celdasValidas.length === 0) return [];
    
    let celdaInicial = celdasValidas.reduce((max, celda) => celda.puntaje > max.puntaje ? celda : max, celdasValidas[0]);
    if (!celdaInicial || celdaInicial.puntaje <= 0) return [];

    let camino = [celdaInicial];
    while (camino[camino.length - 1].puntaje > 0) {
        let celdaActual = camino[camino.length - 1];
        if (celdaActual.i <= 0 || celdaActual.j <= 0) break;

        let celdaDiag = encontrarCelda(matriz, celdaActual.i - 1, celdaActual.j - 1);
        let celdaSup = encontrarCelda(matriz, celdaActual.i - 1, celdaActual.j);
        let celdaLat = encontrarCelda(matriz, celdaActual.i, celdaActual.j - 1);

        let siguienteCelda = null;
        if (celdaActual.diagonal && celdaDiag) siguienteCelda = celdaDiag;
        else if (celdaActual.superior && celdaSup) siguienteCelda = celdaSup;
        else if (celdaActual.lateral && celdaLat) siguienteCelda = celdaLat;
        else break;

        if (siguienteCelda.puntaje <= 0) {
            camino.push(siguienteCelda);
            break;
        }
        camino.push(siguienteCelda);
    }

    let coordenadas = camino.map(c => [c.i, c.j]);
    let pasos = camino.map(c => {
        if (c.diagonal) return "diagonal";
        if (c.superior) return "superior";
        if (c.lateral) return "lateral";
        return "diagonal";
    });

    return [{ coordenadas, pasos }];
}

function tracebackNW(matriz) {
    let i = n - 1;
    let j = m - 1;
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();
    const matchScore = parseInt($('#matchScore').val(), 10) || 1;
    const mismatchScore = parseInt($('#mismatchScore').val(), 10) || -1;
    const gapPenalty = parseInt($('#gapScore').val(), 10) || -2;

    let camino = [];
    let coordenadas = [];
    let pasos = [];

    while (i > 0 || j > 0) {
        let celdaActual = encontrarCelda(matriz, i, j);
        if (!celdaActual) break;

        let celdaDiag = (i > 0 && j > 0) ? encontrarCelda(matriz, i - 1, j - 1) : null;
        let celdaSup = (i > 0) ? encontrarCelda(matriz, i - 1, j) : null;
        let celdaLat = (j > 0) ? encontrarCelda(matriz, i, j - 1) : null;
        let charScore = (i > 0 && j > 0 && seq1[i - 1] === seq2[j - 1]) ? matchScore : mismatchScore;

        if (i > 0 && j > 0 && celdaDiag && (celdaActual.puntaje === celdaDiag.puntaje + charScore)) {
            camino.push(celdaActual);
            coordenadas.push([i, j]);
            pasos.push("diagonal");
            i--;
            j--;
        } else if (i > 0 && celdaSup && (celdaActual.puntaje === celdaSup.puntaje + gapPenalty)) {
            camino.push(celdaActual);
            coordenadas.push([i, j]);
            pasos.push("superior");
            i--;
        } else if (j > 0 && celdaLat && (celdaActual.puntaje === celdaLat.puntaje + gapPenalty)) {
            camino.push(celdaActual);
            coordenadas.push([i, j]);
            pasos.push("lateral");
            j--;
        } else {
            // Fallback de seguridad hacia el origen
            if (i > 0 && j > 0) {
                camino.push(celdaActual);
                coordenadas.push([i, j]);
                pasos.push("diagonal");
                i--;
                j--;
            } else if (i > 0) {
                camino.push(celdaActual);
                coordenadas.push([i, j]);
                pasos.push("superior");
                i--;
            } else {
                camino.push(celdaActual);
                coordenadas.push([i, j]);
                pasos.push("lateral");
                j--;
            }
        }
    }

    return {
        camino: camino,
        coordenadas: coordenadas,
        pasos: pasos
    };
}

// Alternar entre Global (NW) y Local (SW)
const body = document.querySelector('body');
const sidebar = body.querySelector('nav');
const toggle = body.querySelector('.toggle');
const modeSwitch = body.querySelector('.toggle-switch');
const modeText = body.querySelector('.mode-text');

if (toggle) {
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('close');
    });
}

if (modeSwitch) {
    modeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            modeText.innerText = "Local";
            algoritmo = "sw";
            inicializar(algoritmo);
        } else {
            modeText.innerText = "Global";
            algoritmo = "nw";
            inicializar(algoritmo);
        }
    });
}
