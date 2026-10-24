function renderizarMatriz(config) {
    if (window.isFastForwarding) {
        return; // Saltear manipulación pesada del DOM durante saltos rápidos
    }

    d3.select("#root").remove();

    const {
        algoritmo,
        titulo,
        subtitulo,
        edges,
        nodes,
        seq1,
        seq2,
        gap = -2,
        matchScore = 1,
        mismatchScore = -1,
        paso,
        highlightCoords,
        equation,
        currentCellInfo,
        alignmentInfo
    } = config;

    const n = seq1.length + 1; // Filas (Secuencia 1)
    const m = seq2.length + 1; // Columnas (Secuencia 2)

    // Contenedor principal
    let container = d3.select("#root-container");
    if (container.empty()) container = d3.select(".home");
    if (container.empty()) container = d3.select("body");

    const root = container.append("div").attr("id", "root");

    // Título y subtítulo
    root.append("h1").attr("class", "app-title").text(titulo);
    root.append("p").attr("class", "app-subtitle").html(subtitulo);

    // Barra de controles de reproducción interactiva
    const toolbar = root.append("div").attr("class", "controls-toolbar");
    
    toolbar.append("div").attr("class", "toolbar-group").html(`
        <button class="ctrl-btn" id="btn-inicio" title="Reiniciar al paso 0" onclick="window.darPasoInicio()">
            <i class='bx bx-refresh'></i> Inicio
        </button>
        <button class="ctrl-btn" id="btn-prev" title="Paso anterior" onclick="window.darPasoAnterior()">
            <i class='bx bx-left-arrow-alt'></i> Anterior
        </button>
        <button class="ctrl-btn btn-primary" id="btn-autoplay" title="Reproducción automática paso a paso" onclick="window.toggleAutoPlay()">
            <i class='bx bx-play'></i> Auto
        </button>
        <button class="ctrl-btn btn-primary" id="btn-next" title="Avanzar 1 paso" onclick="window.darPasoSiguiente()">
            Siguiente <i class='bx bx-right-arrow-alt'></i>
        </button>
        <button class="ctrl-btn" id="btn-plus10" title="Avanzar 10 pasos" onclick="window.avanzar10Pasos()">
            +10 <i class='bx bx-fast-forward'></i>
        </button>
        <button class="ctrl-btn" id="btn-end" title="Completar todo el alineamiento" onclick="window.irAlFinal()">
            Final <i class='bx bx-skip-next'></i>
        </button>
    `);

    toolbar.append("div").attr("class", "toolbar-group").html(`
        <span class="status-badge" id="progress-badge">Paso ${paso || 0}</span>
    `);

    // Dimensionamiento adaptable de celdas
    const maxAvailableWidth = 750;
    let cellSize = Math.floor(maxAvailableWidth / Math.max(m, 1));
    cellSize = Math.max(28, Math.min(52, cellSize));
    const rectPadding = Math.max(2, Math.floor(cellSize * 0.08));
    const rectCell = cellSize - rectPadding * 2;

    const margin = {
        top: 38,
        bottom: 22,
        left: 48,
        right: 22
    };

    const matrixWidth = m * cellSize;
    const matrixHeight = n * cellSize;
    const viewBoxWidth = matrixWidth + margin.left + margin.right;
    const viewBoxHeight = matrixHeight + margin.top + margin.bottom;

    // Asignar coordenadas precisas para cada celda
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
        .style("max-width", `${Math.min(viewBoxWidth, 860)}px`)
        .style("width", "100%");

    const defs = svg.append("defs");

    // Marcador de flecha para el trazado hacia atrás
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

    // Etiquetas de filas (Secuencia 1 - Vertical a la izquierda)
    for (let i = 0; i < n; i++) {
        const char = (i === 0) ? "—" : (seq1[i - 1] || "");
        groupHeaders.append("text")
            .attr("x", -14)
            .attr("y", i * cellSize + cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .attr("font-size", `${labelFontSize}px`)
            .attr("font-weight", (i === 0) ? "400" : "700")
            .attr("fill", (i === 0) ? "#94a3b8" : "#4338ca")
            .text(char);
    }

    // Etiquetas de columnas (Secuencia 2 - Horizontal arriba)
    for (let j = 0; j < m; j++) {
        const char = (j === 0) ? "—" : (seq2[j - 1] || "");
        groupHeaders.append("text")
            .attr("x", j * cellSize + cellSize / 2)
            .attr("y", -14)
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
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .style("cursor", "pointer");

    // Rectángulo de fondo de la celda
    cellGroups.append("rect")
        .attr("class", "cell-bg")
        .attr("x", rectPadding)
        .attr("y", rectPadding)
        .attr("width", rectCell)
        .attr("height", rectCell)
        .attr("rx", Math.min(6, rectPadding * 2))
        .attr("fill", (d) => {
            if (d.camino === 2) return "#d1fae5"; // Ruta óptima (verde esmeralda)
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "#e0e7ff"; // Celda actual
            if (d.i === 0 || d.j === 0) return "#f8fafc"; // Celdas de inicialización
            return "#ffffff";
        })
        .attr("stroke", (d) => {
            if (d.camino === 2) return "#10b981";
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "#4f46e5";
            return "#cbd5e1";
        })
        .attr("stroke-width", (d) => {
            if (d.camino === 2) return "2.5";
            if (highlightCoords && d.i === highlightCoords.i && d.j === highlightCoords.j) return "2.5";
            return "1";
        });

    // Flechas de trazado hacia atrás (Traceback pointers)
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

    // Texto con el puntaje dentro de la celda
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

    // Eventos hover sobre celdas para inspeccionar cualquier cálculo
    cellGroups.on("mouseenter", function (e, d) {
        if (d.puntaje === undefined || d.puntaje === null) return;
        d3.select(this).select("rect.cell-bg").attr("stroke", "#2563eb").attr("stroke-width", "2.5");
        actualizarPanelExplicacionHover(d, seq1, seq2, gap, matchScore, mismatchScore, algoritmo);
    }).on("mouseleave", function (e, d) {
        d3.select(this).select("rect.cell-bg")
            .attr("stroke", (c) => {
                if (c.camino === 2) return "#10b981";
                if (highlightCoords && c.i === highlightCoords.i && c.j === highlightCoords.j) return "#4f46e5";
                return "#cbd5e1";
            })
            .attr("stroke-width", (c) => {
                if (c.camino === 2 || (highlightCoords && c.i === highlightCoords.i && c.j === highlightCoords.j)) return "2.5";
                return "1";
            });
        restaurarPanelExplicacionOriginal();
    });

    // Panel explicativo dinámico inferior
    const infoContainer = root.append("div").attr("id", "explanation-container").attr("style", "width: 100%; display: flex; flex-direction: column; align-items: center;");
    
    function renderOriginalInfoPanel() {
        infoContainer.html("");

        if (alignmentInfo) {
            // Modo Traceback (Alineamiento final o en progreso)
            const align = alignmentInfo;
            const tbCard = infoContainer.append("div").attr("class", "traceback-card");
            
            const totalTb = align.totalPasos || '';
            const currTb = (align.posicionActualCamino !== undefined) ? align.posicionActualCamino : '';
            const pasoStr = currTb ? `(Paso ${currTb}${totalTb ? ' de ' + totalTb : ''})` : '';

            tbCard.append("div").attr("class", "tb-title").html(`
                <i class='bx bx-check-double'></i> Reconstrucción del Alineamiento Óptimo ${pasoStr}
            `);

            // Generar marcas de coincidencia | o espacio o :
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

            tbCard.append("pre").attr("class", "alignment-code").text(
                `Secuencia 1: ${s1}\n` +
                `             ${matchPipes}\n` +
                `Secuencia 2: ${s2}`
            );

            tbCard.append("div").attr("class", "decision-banner").html(`
                <span>Puntaje total del alineamiento: <strong style="color: #059669; font-size: 1.15rem;">${align.score}</strong></span>
                <span style="color: #065f46; font-size: 0.85rem;"><i class='bx bx-info-circle'></i> Las líneas <code>|</code> indican coincidencias exactas, <code>:</code> discrepancias y espacios gaps.</span>
            `);

        } else if (currentCellInfo) {
            // Modo Llenado de matriz (paso a paso)
            const info = currentCellInfo;
            const card = infoContainer.append("div").attr("class", "info-panel");

            const header = card.append("div").attr("class", "info-header");
            header.append("div").attr("class", "info-title").html(`
                <i class='bx bx-calculator'></i> Cálculo de la Celda <strong>[Fila ${info.i}, Col ${info.j}]</strong>
            `);

            const isMatch = info.match === "coincidencia";
            const matchBadgeClass = isMatch ? "badge-match" : "badge-mismatch";
            const matchLabel = isMatch ? "Coincidencia (Match)" : "Discrepancia (Mismatch)";

            header.append("div").attr("class", "info-pills").html(`
                <span class="pill-seq">Sec 1 (Fila ${info.i}): <strong>${info.s1}</strong></span>
                <span class="pill-seq">Sec 2 (Col ${info.j}): <strong>${info.s2}</strong></span>
                <span class="pill-result ${matchBadgeClass}">${matchLabel} (${info.score >= 0 ? '+' + info.score : info.score})</span>
            `);

            const optionsGrid = card.append("div").attr("class", "options-grid");

            // Diagonal
            const isDiag = info.puntajesMaximos.includes('diagonal');
            optionsGrid.append("div")
                .attr("class", `option-card ${isDiag ? 'selected' : ''}`)
                .html(`
                    <div class="opt-title">
                        <span>↖ Diagonal (Alineamiento)</span>
                        ${isDiag ? '<span class="opt-tag">Elegido</span>' : ''}
                    </div>
                    <div class="opt-calc">
                        M[${info.i-1}, ${info.j-1}] + Score<br>
                        <strong>${info.diagPrev}</strong> + (${info.score}) = <strong>${info.diagonal}</strong>
                    </div>
                `);

            // Superior
            const isSup = info.puntajesMaximos.includes('superior');
            optionsGrid.append("div")
                .attr("class", `option-card ${isSup ? 'selected' : ''}`)
                .html(`
                    <div class="opt-title">
                        <span>↑ Superior (Gap en Sec 2)</span>
                        ${isSup ? '<span class="opt-tag">Elegido</span>' : ''}
                    </div>
                    <div class="opt-calc">
                        M[${info.i-1}, ${info.j}] + Gap<br>
                        <strong>${info.supPrev}</strong> + (${gap}) = <strong>${info.superior}</strong>
                    </div>
                `);

            // Lateral
            const isLat = info.puntajesMaximos.includes('lateral');
            optionsGrid.append("div")
                .attr("class", `option-card ${isLat ? 'selected' : ''}`)
                .html(`
                    <div class="opt-title">
                        <span>← Lateral (Gap en Sec 1)</span>
                        ${isLat ? '<span class="opt-tag">Elegido</span>' : ''}
                    </div>
                    <div class="opt-calc">
                        M[${info.i}, ${info.j-1}] + Gap<br>
                        <strong>${info.latPrev}</strong> + (${gap}) = <strong>${info.lateral}</strong>
                    </div>
                `);

            // Smith-Waterman cero
            if (algoritmo === "sw") {
                const isZero = info.puntajesMaximos.includes('zero');
                optionsGrid.append("div")
                    .attr("class", `option-card ${isZero ? 'selected' : ''}`)
                    .html(`
                        <div class="opt-title">
                            <span>0 Límite Local</span>
                            ${isZero ? '<span class="opt-tag">Elegido</span>' : ''}
                        </div>
                        <div class="opt-calc">
                            Valor mínimo = <strong>0</strong>
                        </div>
                    `);
            }

            const flechasDesc = info.puntajesMaximos.map(p => {
                if (p === 'diagonal') return '↖ Diagonal';
                if (p === 'superior') return '↑ Superior';
                if (p === 'lateral') return '← Lateral';
                return '0 (Sin flecha)';
            }).join(', ');

            card.append("div").attr("class", "decision-banner").html(`
                <span>Puntaje asignado: <strong>M[${info.i}, ${info.j}] = max(${info.diagonal}, ${info.superior}, ${info.lateral}${algoritmo === 'sw' ? ', 0' : ''}) = ${info.maximo}</strong></span>
                <span class="decision-arrow">Puntero: <strong>${flechasDesc}</strong></span>
            `);

        } else {
            // Modo Inicio
            const initCard = infoContainer.append("div").attr("class", "info-panel");
            initCard.append("div").attr("class", "info-title").html(`
                <i class='bx bx-info-circle'></i> Matriz Inicializada
            `);
            initCard.append("p").attr("class", "init-desc").html(
                algoritmo === 'nw'
                ? `La celda <code>[0, 0]</code> inicia en 0. La fila 0 y columna 0 se llenan con la penalización acumulativa por Gap (<strong>${gap}</strong>).<br>
                   Usa los controles superiores: <strong>Siguiente ▶</strong> (1 paso), <strong>+10 ⏩</strong> (10 pasos), <strong>Auto ▶</strong> (reproducción automática) o <strong>Final ⏭</strong> (resolver al instante).`
                : `En alineamiento local (Smith-Waterman), la fila 0 y columna 0 inician en <strong>0</strong> sin penalizar los extremos.<br>
                   Usa la barra de controles para comenzar el recorrido dinámico.`
            );
        }
    }

    renderOriginalInfoPanel();

    function restaurarPanelExplicacionOriginal() {
        renderOriginalInfoPanel();
    }

    function actualizarPanelExplicacionHover(d, s1, s2, g, mS, mmS, algo) {
        if (d.i === 0 || d.j === 0) {
            infoContainer.html(`
                <div class="info-panel" style="border-color: #94a3b8;">
                    <div class="info-title"><i class='bx bx-pointer'></i> Inspección: Celda Inicial [Fila ${d.i}, Col ${d.j}]</div>
                    <p class="init-desc">Puntaje de inicialización: <strong>${d.puntaje}</strong> (Valor base de gap para extremos).</p>
                </div>
            `);
            return;
        }

        const char1 = s1[d.i - 1] || '';
        const char2 = s2[d.j - 1] || '';
        const isMatch = char1 === char2;
        const scoreChar = isMatch ? mS : mmS;

        infoContainer.html(`
            <div class="info-panel" style="border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);">
                <div class="info-header">
                    <div class="info-title"><i class='bx bx-pointer'></i> Inspección de Celda [Fila ${d.i}, Col ${d.j}]</div>
                    <div class="info-pills">
                        <span class="pill-seq">Sec 1: <strong>${char1}</strong></span>
                        <span class="pill-seq">Sec 2: <strong>${char2}</strong></span>
                        <span class="pill-result ${isMatch ? 'badge-match' : 'badge-mismatch'}">${isMatch ? 'Match' : 'Mismatch'} (${scoreChar >= 0 ? '+' + scoreChar : scoreChar})</span>
                    </div>
                </div>
                <div class="options-grid">
                    <div class="option-card ${d.diagonal ? 'selected' : ''}">
                        <div class="opt-title"><span>↖ Diagonal</span> ${d.diagonal ? '<span class="opt-tag">Elegido</span>' : ''}</div>
                        <div class="opt-calc">M[${d.i-1},${d.j-1}] + Score<br><strong>${d.d !== undefined ? d.d : ''}</strong> + (${scoreChar})</div>
                    </div>
                    <div class="option-card ${d.superior ? 'selected' : ''}">
                        <div class="opt-title"><span>↑ Superior</span> ${d.superior ? '<span class="opt-tag">Elegido</span>' : ''}</div>
                        <div class="opt-calc">M[${d.i-1},${d.j}] + Gap<br><strong>${d.s !== undefined ? d.s : ''}</strong> + (${g})</div>
                    </div>
                    <div class="option-card ${d.lateral ? 'selected' : ''}">
                        <div class="opt-title"><span>← Lateral</span> ${d.lateral ? '<span class="opt-tag">Elegido</span>' : ''}</div>
                        <div class="opt-calc">M[${d.i},${d.j-1}] + Gap<br><strong>${d.l !== undefined ? d.l : ''}</strong> + (${g})</div>
                    </div>
                </div>
                <div class="decision-banner">
                    <span>Puntaje final: <strong>${d.puntaje}</strong></span>
                </div>
            </div>
        `);
    }

    // Fórmula MathJax
    if (equation) {
        const mathBox = root.append("div").attr("class", "mathjax-container");
        mathBox.append("p").html(`\\(${equation}\\)`);
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([mathBox.node()]).catch(err => console.warn(err));
        }
    }

    // Leyenda explicativa visual
    const legend = root.append("div").attr("class", "legend-bar");
    legend.html(`
        <span class="legend-item"><span class="legend-chip chip-active"></span> Celda evaluada</span>
        <span class="legend-item"><span class="legend-chip chip-traceback"></span> Ruta óptima (Traceback)</span>
        <span class="legend-item"><span class="legend-chip chip-boundary"></span> Inicialización (Gap)</span>
        <span class="legend-item"><strong>↖</strong> Diagonal (Alineamiento)</span>
        <span class="legend-item"><strong>↑</strong> Superior (Gap Sec 2)</span>
        <span class="legend-item"><strong>←</strong> Lateral (Gap Sec 1)</span>
    `);

    // Actualizar botones de control y badge
    if (typeof window.actualizarEstadoControles === 'function') {
        window.actualizarEstadoControles();
    }
}
