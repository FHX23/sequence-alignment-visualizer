function avanzar(algoritmo, i, j, flecha) {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();

    if (i !== undefined && j !== undefined && flecha !== undefined) {
        edges = marcarCamino(i, j, flecha);
    }

    let alineamientos = (algoritmo === "nw") ? alineamientoNW() : alineamientoSW();
    let alineamientoSeq1 = alineamientos.seq1.replace(/_/g, '\\_');
    let alineamientoSeq2 = alineamientos.seq2.replace(/_/g, '\\_');
    let puntajeAlineamiento = alineamientos.puntaje;

    const totalPasos = (algoritmo === "nw") ? (caminos.pasos ? caminos.pasos.length : 0) : (caminos[0] ? caminos[0].pasos.length : 0);

    const alignmentInfo = {
        seq1: alineamientos.seq1,
        seq2: alineamientos.seq2,
        score: puntajeAlineamiento,
        posicionActualCamino: posicionActualCamino,
        totalPasos: totalPasos
    };

    let equation = `\\begin{array}{ll} \\text{Secuencia 1:} & \\texttt{${alineamientoSeq1}} \\\\ \\text{Secuencia 2:} & \\texttt{${alineamientoSeq2}} \\\\ \\text{Puntaje Total:} & \\mathbf{${puntajeAlineamiento}} \\end{array}`;

    const config = {
        algoritmo: algoritmo,
        titulo: algoritmo === "nw" ? "Alineamiento Global: Needleman-Wunsch" : "Alineamiento Local: Smith-Waterman",
        subtitulo: `Trazado hacia atrás (Traceback): paso ${posicionActualCamino} de ${totalPasos}`,
        edges: edges,
        nodes: nodes,
        seq1: seq1,
        seq2: seq2,
        paso: paso,
        caminos: caminos,
        highlightCoords: { i: i, j: j },
        alignmentInfo: alignmentInfo,
        equation: equation
    };
    
    renderizarMatriz(config);
}

function marcarCamino(x, y, flecha) {
    const edge = edges.find(e => e.i === x && e.j === y);
    if (edge) {
        if (flecha === 'diagonal') edge.diagonalF = 1;
        if (flecha === 'superior') edge.superiorF = 1;
        if (flecha === 'lateral') edge.lateralF = 1;
        edge.camino = 2;
    }
    return edges;
}

function alineamientoSW() {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();
    if (!caminos || !caminos[0]) return { seq1: "", seq2: "", puntaje: 0 };

    let camino = caminos[0];
    let coordenadas = camino.coordenadas;
    let pasos = camino.pasos;
    let alineamientoSeq1 = "";
    let alineamientoSeq2 = "";
    let puntaje = 0;

    for (let i = 0; i < pasos.length; i++) {
        let paso = pasos[i];
        let coordenada = coordenadas[i];
        switch (paso) {
            case "diagonal":
                alineamientoSeq1 += seq1[coordenada[0] - 1] || "";
                alineamientoSeq2 += seq2[coordenada[1] - 1] || "";
                if (seq1[coordenada[0] - 1] == seq2[coordenada[1] - 1]) {
                    puntaje += parseInt($('#matchScore').val(), 10);
                } else {
                    puntaje += parseInt($('#mismatchScore').val(), 10);
                }
                break;
            case "superior":
                alineamientoSeq1 += "-";
                alineamientoSeq2 += seq2[coordenada[1] - 1] || "";
                puntaje += parseInt($('#gapScore').val(), 10);
                break;
            case "lateral":
                alineamientoSeq1 += seq1[coordenada[0] - 1] || "";
                alineamientoSeq2 += "-";
                puntaje += parseInt($('#gapScore').val(), 10);
                break;
        }
    }
    alineamientoSeq1 = alineamientoSeq1.split('').reverse().join('');
    alineamientoSeq2 = alineamientoSeq2.split('').reverse().join('');
    return { seq1: alineamientoSeq1, seq2: alineamientoSeq2, puntaje: puntaje };
}

function alineamientoNW() {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();
    if (!caminos || !caminos.camino) return { seq1: "", seq2: "", puntaje: 0 };

    let camino = caminos.camino;
    let pasos = caminos.pasos;
    let alineamientoSeq1 = "";
    let alineamientoSeq2 = "";
    let puntaje = 0;

    for (let i = 0; i < pasos.length; i++) {
        let pasoActual = pasos[i];
        let nodoActual = camino[i];
        switch (pasoActual) {
            case "diagonal":
                alineamientoSeq1 += seq1[nodoActual.i - 1] || "";
                alineamientoSeq2 += seq2[nodoActual.j - 1] || "";
                if (nodoActual.match === "coincidencia" || seq1[nodoActual.i - 1] === seq2[nodoActual.j - 1]) {
                    puntaje += parseInt($('#matchScore').val(), 10);
                } else {
                    puntaje += parseInt($('#mismatchScore').val(), 10);
                }
                break;
            case "lateral":
                alineamientoSeq1 += "-";
                alineamientoSeq2 += seq2[nodoActual.j - 1] || "";
                puntaje += parseInt($('#gapScore').val(), 10);
                break;
            case "superior":
                alineamientoSeq1 += seq1[nodoActual.i - 1] || "";
                alineamientoSeq2 += "-";
                puntaje += parseInt($('#gapScore').val(), 10);
                break;
        }
    }
    alineamientoSeq1 = alineamientoSeq1.split('').reverse().join('');
    alineamientoSeq2 = alineamientoSeq2.split('').reverse().join('');
    return { seq1: alineamientoSeq1, seq2: alineamientoSeq2, puntaje: puntaje };
}
