function siguiente(algoritmo, p) {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();
    const gap = parseInt($('#gapScore').val(), 10) || -2;
    const matchScore = parseInt($('#matchScore').val(), 10) || 1;
    const mismatchScore = parseInt($('#mismatchScore').val(), 10) || -1;

    let coordenadas = obtenerCoordenadas(paso);
    if (!coordenadas) return;

    let s1 = seq1[coordenadas[0] - 1] || '';
    let s2 = seq2[coordenadas[1] - 1] || '';
    let score = (s1 === s2) ? matchScore : mismatchScore;

    let tooltip = [
        obtenerPuntaje(coordenadas[0] - 1, coordenadas[1] - 1),
        obtenerPuntaje(coordenadas[0] - 1, coordenadas[1]),
        obtenerPuntaje(coordenadas[0], coordenadas[1] - 1)
    ];

    let diagonal = (tooltip[0] !== null ? tooltip[0] : 0) + score;
    let superior = (tooltip[1] !== null ? tooltip[1] : 0) + gap;
    let lateral = (tooltip[2] !== null ? tooltip[2] : 0) + gap;
    let zero = 0;

    let puntajes = (algoritmo === "nw") ? [diagonal, superior, lateral] : [diagonal, superior, lateral, zero];
    let maximoPuntaje = Math.max(...puntajes);

    let puntajesMaximos = [];
    if (diagonal === maximoPuntaje) puntajesMaximos.push('diagonal');
    if (superior === maximoPuntaje) puntajesMaximos.push('superior');
    if (lateral === maximoPuntaje) puntajesMaximos.push('lateral');
    if (algoritmo === "sw" && maximoPuntaje === 0) puntajesMaximos.push('zero');

    edges = inicializacion2(coordenadas[0], coordenadas[1], maximoPuntaje, puntajesMaximos, tooltip, (s1 === s2) ? "coincidencia" : "discrepancia");

    const currentCellInfo = {
        i: coordenadas[0],
        j: coordenadas[1],
        s1: s1,
        s2: s2,
        match: (s1 === s2) ? "coincidencia" : "discrepancia",
        score: score,
        diagPrev: tooltip[0],
        supPrev: tooltip[1],
        latPrev: tooltip[2],
        diagonal: diagonal,
        superior: superior,
        lateral: lateral,
        zero: zero,
        maximo: maximoPuntaje,
        puntajesMaximos: puntajesMaximos
    };

    const config = {
        algoritmo: algoritmo,
        titulo: algoritmo === "nw" ? "Alineamiento Global: Needleman-Wunsch" : "Alineamiento Local: Smith-Waterman",
        subtitulo: `Llenado de matriz: celda [${coordenadas[0]}, ${coordenadas[1]}] (paso ${p})`,
        edges: edges,
        nodes: nodes,
        seq1: seq1,
        seq2: seq2,
        gap: gap,
        matchScore: matchScore,
        mismatchScore: mismatchScore,
        paso: paso,
        highlightCoords: { i: coordenadas[0], j: coordenadas[1] },
        currentCellInfo: currentCellInfo,
        equation: createEquation(puntajesMaximos, algoritmo)
    };

    renderizarMatriz(config);
}

function inicializacion2(x, y, max, puntajes, tooltip, match) {
    const edge = edges.find(e => e.i === x && e.j === y);
    if (edge) {
        edge.puntaje = max;
        edge.diagonal = puntajes.includes('diagonal') ? 1 : 0;
        edge.superior = puntajes.includes('superior') ? 1 : 0;
        edge.lateral = puntajes.includes('lateral') ? 1 : 0;
        edge.zero = puntajes.includes('zero') ? 1 : 0;
        edge.d = tooltip[0];
        edge.s = tooltip[1];
        edge.l = tooltip[2];
        edge.max = max;
        edge.match = match;
    }
    return edges;
}

function obtenerCoordenadas(p) {
    const x = n - 1;
    const y = m - 1;
    if (p < 1 || p > x * y) {
        return null; 
    }
    const fila = Math.ceil(p / y); 
    const columna = p % y === 0 ? y : p % y; 
    return [fila, columna]; 
}

function obtenerPuntaje(i, j) {
    const cell = edges.find(c => c.i === i && c.j === j);
    return cell && cell.puntaje !== undefined && cell.puntaje !== null ? cell.puntaje : null;
}

function obtenerSecuencia(data, i, secuencia) {
    for (let elemento of data) {
        if (elemento.node === i) {
            return elemento[secuencia];
        }
    }
    return null;
}

function obtenerPaso(i, j, m) {
    return i * m + j;
}

function createEquation(highlights = [], algorithm = 'sw') {
    let diagonal = "M_{i-1,j-1} + S(a_i,b_j)";
    let superior = "M_{i-1,j} + Gap";
    let lateral = "M_{i,j-1} + Gap";
    let zero = "0";

    if (highlights.includes('diagonal')) {
        diagonal = "\\mathbf{" + diagonal + "}";
    }
    if (highlights.includes('superior')) {
        superior = "\\mathbf{" + superior + "}";
    }
    if (highlights.includes('lateral')) {
        lateral = "\\mathbf{" + lateral + "}";
    }
    if (highlights.includes('zero')) {
        zero = "\\mathbf{" + zero + "}";
    }

    if (algorithm === 'nw') {
        return `M_{ij} = \\max \\left\\{ \\begin{array}{ll} ${diagonal} & \\text{(Diagonal)} \\\\ ${superior} & \\text{(Superior)} \\\\ ${lateral} & \\text{(Lateral)} \\end{array} \\right.`;
    } else {
        return `M_{ij} = \\max \\left\\{ \\begin{array}{ll} ${diagonal} & \\text{(Diagonal)} \\\\ ${superior} & \\text{(Superior)} \\\\ ${lateral} & \\text{(Lateral)} \\\\ ${zero} & \\text{(Reinicio)} \\end{array} \\right.`;
    }
}
