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

    $('#avanzarRapido').on('click', function (e) {
        e.preventDefault();
        avanzarRapido();
    });
});

function darPasoSiguiente() {
    const totalMatriz = (n - 1) * (m - 1);

    if (final === 1 && paso === limite) {
        avanzar("nw", 0, 0);
        paso++;
        return false;
    }

    if (paso <= totalMatriz) {
        siguiente(algoritmo, paso);
        paso++;
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
                return true;
            }
            if (algoritmo === "nw") {
                avanzar(algoritmo, caminos.coordenadas[posicionActualCamino][0], caminos.coordenadas[posicionActualCamino][1], caminos.pasos[posicionActualCamino]);
                posicionActualCamino++;
                paso++;
                if (paso === limite && algoritmo === "nw") final = 1;
                return true;
            }
        }
    }
    return false;
}

function darPasoAnterior() {
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
}

function darPasoInicio() {
    inicializar(algoritmo);
}

function avanzarRapido() {
    for (let k = 0; k < 10; k++) {
        let ok = darPasoSiguiente();
        if (!ok) break;
    }
}

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
const modeSwitch = document.querySelector('.toggle-switch');
const modeText = document.querySelector('.mode-text');

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
