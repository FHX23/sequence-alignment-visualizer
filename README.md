# 🧬 Sequence Alignment Visualizer

> Herramienta interactiva para la enseñanza y visualización paso a paso de algoritmos de **Alineamiento de Secuencias Biológicas** (ADN, ARN y proteínas) mediante programación dinámica. Implementa los algoritmos clásicos de **Needleman-Wunsch** (Alineamiento Global) y **Smith-Waterman** (Alineamiento Local) con renderizado dinámico en **D3.js** y formulación matemática en **MathJax**.

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?logo=github)](https://fhx23.github.io/sequence-alignment-visualizer/)
[![Tech: D3.js](https://img.shields.io/badge/Visualization-D3.js_v7-F9A03C?logo=d3.js&logoColor=white)](https://d3js.org/)
[![Tech: MathJax](https://img.shields.io/badge/Equations-MathJax_3-294172)](https://www.mathjax.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Demo en Vivo

Puedes probar la aplicación directamente en tu navegador sin instalar nada:  
👉 **[fhx23.github.io/sequence-alignment-visualizer](https://fhx23.github.io/sequence-alignment-visualizer/)**

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

- **Barra Lateral Fija de Parámetros:**
  - Ajuste en vivo de **Secuencia 1** y **Secuencia 2**.
  - Configuración dinámica de puntajes de *Match*, *Mismatch* y penalización de *Gap*.
  - Alternador instantáneo entre alineamiento **Global** y **Local**.
- **Controles de Avance:**
  - `[ Reiniciar ]`: Inicializa la matriz con los valores base.
  - `[ Anterior ]`: Retrocede una celda en la matriz o un paso de traceback.
  - `[ Siguiente ]`: Avanza exactamente una celda evaluando las opciones de programación dinámica.
  - `[ Avanzar Rápido ]`: Salto de 10 pasos por clic para agilizar demostraciones con secuencias largas.
- **Panel Pedagógico de Cálculo de Celdas:**
  - Desglose conciso celda a celda mostrando la comparación de caracteres ($S_1[i]$ vs $S_2[j]$), si es *Match* o *Mismatch*, los valores calculados por cada camino (↖ Diagonal, ↑ Superior, ← Lateral y 0 en Smith-Waterman) y el valor máximo elegido.
- **Trazado hacia Atrás (Traceback) en Vivo:**
  - Punteros vectoriales SVG indicando el origen del puntaje óptimo y ruta destacada en verde esmeralda.
  - Reconstrucción del alineamiento final con líneas de coincidencia (`|`), discrepancias (`:`) y huecos (`-`) junto al puntaje total.
- **Diseño Adaptativo:**
  - ViewBox SVG proporcional al número exacto de filas y columnas, sin desbordamientos verticales ni cortes en pantalla.
- **Renderizado Matemático:**
  - Notación formal en LaTeX renderizada mediante MathJax.

---

## 🚀 Ejecución Local

Dado que la aplicación está construida con tecnologías web estándar (HTML5, CSS3, JavaScript ES6), no requiere procesos de compilación ni dependencias pesadas de servidor:

### Opción 1: Directo en el Navegador
Abre el archivo `index.html` con doble clic o usando cualquier navegador moderno (Chrome, Firefox, Safari, Edge).

### Opción 2: Con Servidor Estático Local
```bash
# Clonar el repositorio
git clone https://github.com/FHX23/sequence-alignment-visualizer.git
cd sequence-alignment-visualizer

# Iniciar servidor local con Python
python -m http.server 8080

# O con npx serve
npx serve .
```
Accede a `http://localhost:8080`.

### Opción 3: Con Docker
```bash
# Construir la imagen Nginx ligera
docker build -t sequence-alignment-visualizer .

# Ejecutar el contenedor
docker run -d -p 8080:80 sequence-alignment-visualizer
```

---

## 👥 Autor

- **Matias Arenas** ([@FHX23](https://github.com/FHX23)) — *Universidad del Bío-Bío, Chile*
