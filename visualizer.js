function renderizarMatriz(config) {
    if (window.isFastForwarding) {
        return; // Saltear manipulación del DOM durante avance rápido en lote
    }

    d3.select("#root").remove();

    const {
        algoritmo,
        titulo,
        subtitulo,
        edges,
        seq1,
        seq2,
        gap = -2,
        matchScore = 1,
        mismatchScore = -1,
        highlightCoords,
        equation,
        currentCellInfo,
        alignmentInfo
    } = config;

    const n = seq1.length + 1; // Filas (Secuencia 1)
    const m = seq2.length + 1; // Columnas (Secuencia 2)

    let container = d3.select("#root-container");
    if (container.empty()) container = d3.select(".home");
    if (container.empty()) container = d3.select("body");

    const root = container.append("div").attr("id", "root");

    // Título y subtítulo
    root.append("h1").attr("class", "app-title").text(titulo);
    root.append("p").attr("class", "app-subtitle").html(subtitulo);

    // Dimensionamiento adaptable de celdas según largo de secuencias
    const maxAvailableWidth = 720;
    let cellSize = Math.floor(maxAvailableWidth / Math.max(m, 1));
    cellSize = Math.max(28, Math.min(50, cellSize));
    const rectPadding = Math.max(2, Math.floor(cellSize * 0.08));
    const rectCell = cellSize - rectPadding * 2;

    const margin = {
        top: 35,
        bottom: 20,
        left: 45,
        right: 20
    };

    const matrixWidth = m * cellSize;
    const matrixHeight = n * cellSize;
    const viewBoxWidth = matrixWidth + margin.left + margin.right;
    const viewBoxHeight = matrixHeight + margin.top + margin.bottom;

    // Asignar coordenadas a celdas
    edges.forEach((d) => {
        d.x = d.j * cellSize;
        d.y = d.i * cellSize;
        d.nodeSize = cellSize;
    });

    const matrixWrapper = root.append("div").attr("class", "matrix-scroll-wrapper");

    const svg = matrixWrapper
        .append("svg")
        .attr("class", "matrix-svg")
        .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
        .style("max-width", `${Math.min(viewBoxWidth, 800)}px`)
        .style("width", "100%");

    const defs = svg.append("defs");

    // Marcador de flecha para el traceback
    defs.append("marker")
        .attr("id", "marker-arrow")
        .attr("viewBox", "-1 -2 6 4")
        .attr("markerWidth", "5")
        .attr("markerHeight", "5")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 -1.5 L 3 0 L 0 1.5 z")
        .attr("fill", "#059669")
        .attr("stroke", "none");

    const group = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const groupHeaders = group.append("g").attr("class", "matrix-headers");
    const groupEdges = group.append("g").attr("class", "matrix-cells");

    const labelFontSize = Math.max(12, Math.min(18, Math.floor(cellSize * 0.44)));
    const numberFontSize = Math.max(11, Math.min(17, Math.floor(cellSize * 0.40)));

    // Etiquetas de filas (Secuencia 1 - Izquierda)
    for (let i = 0; i < n; i++) {
        const char = (i === 0) ? "—" : (seq1[i - 1] || "");
        groupHeaders.append("text")
            .attr("x", -12)
            .attr("y", i * cellSize + cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .attr("font-size", `${labelFontSize}px`)
            .attr("font-weight", (i === 0) ? "400" : "700")
            .attr("fill", (i === 0) ? "#94a3b8" : "#4338ca")
            .text(char);
    }

    // Etiquetas de columnas (Secuencia 2 - Arriba)
    for (let j = 0; j < m; j++) {
        const char = (j === 0) ? "—" : (seq2[j - 1] || "");
        groupHeaders.append("text")
            .attr("x", j * cellSize + cellSize / 2)
            .attr("y", -12)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", `${labelFontSize}px`)
            .attr("font-weight", (j === 0) ? "400" : "700")
            .attr("fill", (j === 0) ? "#94a3b8" : "#4338ca")
            .text(char);
    }

    // Dibujar celdas
    const cellGroups = groupEdges
        .selectAll("g.cell")
        .data(edges)
        .enter()
        .append("g")
        .attr("class", "cell")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    cellGroups.append("rect")
        .attr("class", "cell-bg")
        .attr("x", rectPadding)
        .attr("y", rectPadding)
        .attr("width", rectCell)
        .attr("height", rectCell)
        .attr("rx", Math.min(5, rectPadding * 2))
        .attr("fill", (d) => {
            if (d.camino === 2) return "#d1fae5"; // Ruta óptima (verde suave)
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "#e0e7ff"; // Celda actual (azul/índigo)
            if (d.i === 0 || d.j === 0) return "#f8fafc"; // Borde inicial
            return "#ffffff";
        })
        .attr("stroke", (d) => {
            if (d.camino === 2) return "#10b981";
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "#4f46e5";
            return "#cbd5e1";
        })
        .attr("stroke-width", (d) => {
            if (d.camino === 2 || (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j)) return "2";
            return "1";
        });

    // Flechas de traceback
    const arrowPath = (type) => {
        const cx = cellSize / 2;
        const cy = cellSize / 2;
        const len = rectCell * 0.38;
        if (type === 'diagonal') return `M ${cx} ${cy} L ${cx - len} ${cy - len}`;
        if (type === 'superior') return `M ${cx} ${cy} L ${cx} ${cy - len}`;
        if (type === 'lateral') return `M ${cx} ${cy} L ${cx - len} ${cy}`;
        return '';
    };

    cellGroups.filter((d) => d.diagonalF).append('path')
        .attr('d', () => arrowPath('diagonal'))
        .style("stroke", "#059669")
        .style("stroke-width", 2)
        .style("fill", "none")
        .attr("marker-end", "url(#marker-arrow)");

    cellGroups.filter((d) => d.superiorF).append('path')
        .attr('d', () => arrowPath('superior'))
        .style("stroke", "#059669")
        .style("stroke-width", 2)
        .style("fill", "none")
        .attr("marker-end", "url(#marker-arrow)");

    cellGroups.filter((d) => d.lateralF).append('path')
        .attr('d', () => arrowPath('lateral'))
        .style("stroke", "#059669")
        .style("stroke-width", 2)
        .style("fill", "none")
        .attr("marker-end", "url(#marker-arrow)");

    // Puntajes en las celdas
    cellGroups
        .filter((d) => d.puntaje !== undefined && d.puntaje !== null && d.puntaje !== "")
        .append("text")
        .attr("class", "cell-text")
        .attr("x", cellSize / 2)
        .attr("y", cellSize / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", `${numberFontSize}px`)
        .attr("font-weight", (d) => (d.camino === 2 || (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j)) ? "700" : "600")
        .attr("fill", (d) => {
            if (d.camino === 2) return "#065f46";
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "#3730a3";
            return "#1e293b";
        })
        .text((d) => d.puntaje);

    // Panel explicativo directo y conciso debajo de la matriz
    const infoBox = root.append("div").attr("class", "simple-info-panel");

    if (alignmentInfo) {
        // Traceback final
        const align = alignmentInfo;
        let matchPipes = "";
        const s1 = align.seq1 || "";
        const s2 = align.seq2 || "";
        const maxLen = Math.max(s1.length, s2.length);

        for (let k = 0; k < maxLen; k++) {
            const c1 = s1[k] || " ";
            const c2 = s2[k] || " ";
            if (c1 === c2 && c1 !== "-" && c1 !== " ") {
                matchPipes += "|";
            } else if (c1 === "-" || c2 === "-") {
                matchPipes += " ";
            } else {
                matchPipes += ":";
            }
        }

        infoBox.html(`
            <div class="info-title">🎯 Alineamiento Óptimo Resultante</div>
            <pre class="align-display">Secuencia 1: ${s1}\n             ${matchPipes}\nSecuencia 2: ${s2}</pre>
            <div class="score-line">Puntaje total: <strong>${align.score}</strong></div>
        `);
    } else if (currentCellInfo) {
        // Llenado de celda paso a paso
        const c = currentCellInfo;
        const matchText = (c.match === "coincidencia") ? "Coincidencia (+ " + c.score + ")" : "Discrepancia (" + c.score + ")";
        const flechas = c.puntajesMaximos.map(p => p === 'diagonal' ? '↖ Diag' : p === 'superior' ? '↑ Sup' : p === 'lateral' ? '← Lat' : '0').join(', ');

        infoBox.html(`
            <div class="step-summary">
                <span>Celda <strong>[${c.i}, ${c.j}]</strong> &nbsp;|&nbsp; <strong>${c.s1}</strong> vs <strong>${c.s2}</strong> (${matchText})</span>
            </div>
            <div class="step-calc">
                <span>↖ Diag: <strong>${c.diagonal}</strong></span> &nbsp;·&nbsp;
                <span>↑ Sup: <strong>${c.superior}</strong></span> &nbsp;·&nbsp;
                <span>← Lat: <strong>${c.lateral}</strong></span>
                ${algoritmo === 'sw' ? ' &nbsp;·&nbsp; <span>0 Local</span>' : ''}
                &nbsp; ➔ &nbsp; <strong>Máx: ${c.maximo}</strong> (${flechas})
            </div>
        `);
    } else {
        // Inicialización
        infoBox.html(`
            <div class="step-summary">
                <span>Matriz inicializada. Usa los botones de la barra lateral (<strong>Siguiente</strong> o <strong>Avanzar Rápido</strong>) para avanzar.</span>
            </div>
        `);
    }

    // Fórmula MathJax si existe
    if (equation) {
        const mathBox = root.append("div").attr("class", "mathjax-container");
        mathBox.append("p").html(`\\(${equation}\\)`);
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([mathBox.node()]).catch(err => console.warn(err));
        }
    }

    // Leyenda simple
    const legend = root.append("div").attr("class", "simple-legend");
    legend.html(`
        <span><span class="dot dot-active"></span> Celda actual</span>
        <span><span class="dot dot-trace"></span> Ruta óptima</span>
        <span><strong>↖</strong> Diagonal</span>
        <span><strong>↑</strong> Superior</span>
        <span><strong>←</strong> Lateral</span>
    `);
}
