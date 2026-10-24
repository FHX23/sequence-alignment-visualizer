# 🧬 Sequence Alignment Visualizer

> Herramienta interactiva para la enseñanza y visualización paso a paso de algoritmos de **Alineamiento de Secuencias Biológicas** (ADN, ARN y proteínas) mediante programación dinámica. Implementa los algoritmos clásicos de **Needleman-Wunsch** (Alineamiento Global) y **Smith-Waterman** (Alineamiento Local) con renderizado dinámico en **D3.js** y ecuaciones en **MathJax**.

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?logo=github)](https://fhx23.github.io/codigo-2-bioinformatica/)
[![Tech: D3.js](https://img.shields.io/badge/Visualization-D3.js_v7-F9A03C?logo=d3.js&logoColor=white)](https://d3js.org/)
[![Tech: MathJax](https://img.shields.io/badge/Equations-MathJax_3-294172)](https://www.mathjax.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Demo en Vivo

Puedes probar la aplicación directamente en tu navegador sin instalar nada:  
👉 **[fhx23.github.io/codigo-2-bioinformatica](https://fhx23.github.io/codigo-2-bioinformatica/)**

---

## 📌 Contexto Académico

Este visualizador fue desarrollado en el marco de trabajo de tesis e investigación en bioinformática en la **Universidad del Bío-Bío (UBB)**, con el objetivo de facilitar la comprensión pedagógica de las matrices de sustitución y los vectores de retroceso (*traceback*) en la alineación de biosecuencias.

---

## ⚙️ Algoritmos Implementados

| Algoritmo | Tipo de Alineamiento | Formulación de Recurrencia |
|---|---|---|
| **Needleman-Wunsch** | **Global** (secuencias completas) | $M(i,j) = \max \begin{cases} M(i-1, j-1) + S(x_i, y_j) \\ M(i-1, j) + g \\ M(i, j-1) + g \end{cases}$ |
| **Smith-Waterman** | **Local** (sub-regiones óptimas) | $M(i,j) = \max \begin{cases} 0 \\ M(i-1, j-1) + S(x_i, y_j) \\ M(i-1, j) + g \\ M(i, j-1) + g \end{cases}$ |

---

## ✨ Características Principales

- **Configuración de Puntuaciones en Vivo:** Ajuste dinámico de parámetros de *Match* (coincidencia), *Mismatch* (discrepancia) y penalización por *Gap*.
- **Paso a Paso Controlado:** Botones **Siguiente** y **Anterior** que permiten al estudiante o investigador inspeccionar el llenado celda a celda de la matriz de programación dinámica.
- **Traceback Interactivo:** Rastreo visual y animación del camino óptimo mediante flechas vectoriales SVG (diagonal, superior y lateral).
- **Renderizado Matemático:** Visualización formal del alineamiento final y la ecuación de puntaje en notación LaTeX renderizada en tiempo real con MathJax.
- **Alternador Global / Local:** Selector rápido en la barra lateral para alternar entre ambos algoritmos conservando las secuencias de entrada.

---

## 🚀 Ejecución Local

Dado que la aplicación está construida con tecnologías web estándar (HTML5, CSS3, JavaScript ES6), no requiere procesos de compilación ni dependencias pesadas de servidor:

### Opción 1: Directo en el Navegador
Abre el archivo `index.html` con doble clic o usando cualquier navegador moderno (Chrome, Firefox, Safari, Edge).

### Opción 2: Con Servidor Estático Local
```bash
# Con Python 3
python -m http.server 8080

# O con npx serve
npx serve .
```
Accede a `http://localhost:8080`.

### Opción 3: Con Docker
```bash
# Construir la imagen Nginx ligera
docker build -t sequence-aligner .

# Ejecutar el contenedor
docker run -d -p 8080:80 sequence-aligner
```

---

## 👥 Autor

- **Matias Arenas** ([@FHX23](https://github.com/FHX23)) — *Universidad del Bío-Bío, Chile*
