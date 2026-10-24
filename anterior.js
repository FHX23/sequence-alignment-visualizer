function anterior(algoritmo, p) {
    const seq1 = $('#seq_1').val().trim().toUpperCase();
    const seq2 = $('#seq_2').val().trim().toUpperCase();
    const gap = parseInt($('#gapScore').val(), 10) || -2;
    const matchScore = parseInt($('#matchScore').val(), 10) || 1;
    const mismatchScore = parseInt($('#mismatchScore').val(), 10) || -1;

    let coordenadas = obtenerCoordenadas(paso - 1);
    let coordenadas2 = obtenerCoordenadas(paso - 2);
    
    if (coordenadas) {
        edges = eliminarPuntaje(seq1, seq2, coordenadas[0], coordenadas[1]);
    }

    let currentCellInfo = null;
    if (coordenadas2) {
        const prevEdge = edges.find(e => e.i === coordenadas2[0] && e.j === coordenadas2[1]);
        if (prevEdge && prevEdge.puntaje !== null && prevEdge.puntaje !== undefined) {
            const s1 = seq1[coordenadas2[0] - 1] || '';
            const s2 = seq2[coordenadas2[1] - 1] || '';
            const isMatch = s1 === s2;
            const score = isMatch ? matchScore : mismatchScore;
            currentCellInfo = {
                i: coordenadas2[0],
                j: coordenadas2[1],
                s1: s1,
                s2: s2,
                match: isMatch ? "coincidencia" : "discrepancia",
                score: score,
                diagPrev: prevEdge.d !== undefined ? prevEdge.d : 0,
                supPrev: prevEdge.s !== undefined ? prevEdge.s : 0,
                latPrev: prevEdge.l !== undefined ? prevEdge.l : 0,
                diagonal: (prevEdge.d !== undefined ? prevEdge.d : 0) + score,
                superior: (prevEdge.s !== undefined ? prevEdge.s : 0) + gap,
                lateral: (prevEdge.l !== undefined ? prevEdge.l : 0) + gap,
                maximo: prevEdge.puntaje,
                puntajesMaximos: [
                    prevEdge.diagonal ? 'diagonal' : '',
                    prevEdge.superior ? 'superior' : '',
                    prevEdge.lateral ? 'lateral' : '',
                    prevEdge.zero ? 'zero' : ''
                ].filter(Boolean)
            };
        }
    }

    const config = {
        algoritmo: algoritmo,
        titulo: algoritmo === "nw" ? "Alineamiento Global: Needleman-Wunsch" : "Alineamiento Local: Smith-Waterman",
        subtitulo: "Llenado de matriz: paso " + p,
        edges: edges,
        nodes: nodes,
        seq1: seq1,
        seq2: seq2,
        gap: gap,
        matchScore: matchScore,
        mismatchScore: mismatchScore,
        paso: paso - 1,
        highlightCoords: coordenadas2 ? { i: coordenadas2[0], j: coordenadas2[1] } : null,
        currentCellInfo: currentCellInfo
    };
    
    renderizarMatriz(config);
}

function eliminarPuntaje(seq1, seq2, x, y) {
    const edge = edges.find(e => e.i === x && e.j === y);
    if (edge) {
        edge.puntaje = null;
        edge.diagonal = 0;
        edge.superior = 0;
        edge.lateral = 0;
        edge.zero = 0;
        edge.camino = 0;
        edge.diagonalF = 0;
        edge.superiorF = 0;
        edge.lateralF = 0;
    }
    return edges;
}
