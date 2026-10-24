function retroceder(algoritmo, i, j, p) {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();

    edges = borrarCamino(i, j);

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
        subtitulo: `Trazado hacia atrás (Traceback): paso ${p} de ${totalPasos}`,
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

function borrarCamino(x, y) {
    const edge = edges.find(e => e.i === x && e.j === y);
    if (edge) {
        edge.camino = 0;
        edge.diagonalF = 0;
        edge.superiorF = 0;
        edge.lateralF = 0;
    }
    return edges;
}
