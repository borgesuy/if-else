/**
 * PyLogic — Motor de Aplicación Interactiva
 * Docente: Andrea Borges - Ciencias Computacionales
 */

const PyLogic = (() => {
  // --- ESTADO GLOBAL DE LA APLICACIÓN ---
  let state = {
    estudiante: {
      nombre: '',
      usuario: '',
      grupo: '',
      liceo: '',
      fechaInicio: null
    },
    nivelActual: 1,
    puntos: 0,
    intentosTotales: 0,
    pistasTotales: 0,
    tiempoInicioNivel: Date.now(),
    tiempoSegundosAcumulado: 0,
    progresosNivel: {}, // { levelId: { completado, correctas, intentos, pistas, codigoValidado, fechaValidacion, indicioIA } }
    badges: [],
    pyodideReady: false,
    pyodideInstance: null
  };

  // --- CONFIGURACIÓN DE LOS 8 NIVELES + DESAFÍO FINAL ---
  const CONFIG_NIVELES = {
    1: {
      titulo: "¿Qué es una Condición?",
      badge: "🟢 NIVEL 1",
      teoria: `
        <p>En programación, una <strong>condición</strong> es una pregunta que solo puede tener dos respuestas posibles:</p>
        <ul>
          <li><strong>True</strong> (Verdadero)</li>
          <li><strong>False</strong> (Falso)</li>
        </ul>
        <p>Usamos la instrucción <code>if</code> (que significa <em>SI</em> condicional) para ejecutar un bloque de código cuando la condición es verdadera.</p>
        <pre><code>edad = 18
if edad >= 18:
    print("Es mayor de edad")</code></pre>
      `,
      consigna: "Crea una variable <code>edad = 20</code> y escribe un condicional <code>if</code> para comprobar si <code>edad >= 18</code>. Si es verdadero, imprime <code>\"Es mayor de edad\"</code>.",
      codigoInicial: "# Escribe tu código aquí\nedad = 20\n",
      pistas: [
        "Pensá qué condición necesita comprobar el programa.",
        "Recordá colocar los dos puntos ':' al final de la línea del if.",
        "El código dentro del if debe estar indentado con 4 espacios o un tabulador."
      ],
      validar: (codigo, salida) => {
        const tieneIf = /if\s+edad\s*>=\s*18\s*:/.test(codigo);
        const tienePrint = /print\s*\(\s*["']Es mayor de edad["']\s*\)/.test(codigo);
        const salidaCorrecta = salida.trim().includes("Es mayor de edad");
        return tieneIf && tienePrint && salidaCorrecta;
      }
    },
    2: {
      titulo: "Mi Primer IF y la Indentación",
      badge: "🟢 NIVEL 2",
      badgeReward: "🏅 Primer IF",
      teoria: `
        <p>Estructura de un <code>if</code> en Python:</p>
        <ol>
          <li>La palabra reservada <code>if</code></li>
          <li>La <strong>condición</strong></li>
          <li>Los dos puntos <code>:</code> al final</li>
          <li>La <strong>indentación</strong> (espacio hacia la derecha) en la siguiente línea.</li>
        </ol>
      `,
      consigna: "Declara la variable <code>puntaje = 85</code>. Escribe un <code>if</code> que verifique si <code>puntaje >= 70</code> e imprima <code>\"Aprobado\"</code>.",
      codigoInicial: "puntaje = 85\n",
      pistas: [
        "Revisá que después de 'if puntaje >= 70' aparezcan los dos puntos ':'.",
        "Recordá la indentación delante de print().",
        "La salida debe decir exactamente 'Aprobado'."
      ],
      validar: (codigo, salida) => {
        const tieneIf = /if\s+puntaje\s*>=\s*70\s*:/.test(codigo);
        const tieneIndent = /\n\s+print/.test(codigo);
        return tieneIf && tieneIndent && salida.trim().includes("Aprobado");
      }
    },
    3: {
      titulo: "Operadores de Comparación",
      badge: "🟢 NIVEL 3",
      badgeReward: "🔎 Detective de condiciones",
      teoria: `
        <p>En Python comparamos valores con estos operadores:</p>
        <ul>
          <li><code>&gt;</code> Mayor que | <code>&lt;</code> Menor que</li>
          <li><code>&gt;=</code> Mayor o igual | <code>&lt;=</code> Menor o igual</li>
          <li><code>==</code> <strong>Igual a</strong> (comprobación)</li>
        </ul>
        <p>⚠️ <strong>¡IMPORTANTE!</strong> Un solo <code>=</code> asigna un valor (<code>x = 5</code>). Dos <code>==</code> comprueban si dos valores son iguales (<code>if x == 5:</code>).</p>
      `,
      consigna: "Escribe un programa con la variable <code>clave = 1234</code>. Verifica con <code>==</code> si <code>clave == 1234</code> e imprime <code>\"Acceso concedido\"</code>.",
      codigoInicial: "clave = 1234\n",
      pistas: [
        "Asegurate de usar '==' para comparar y no un solo '='.",
        "Sintaxis: if clave == 1234:",
        "No olvides la indentación en el print."
      ],
      validar: (codigo, salida) => {
        const usaDobleIgual = /if\s+clave\s*==\s*1234\s*:/.test(codigo);
        return usaDobleIgual && salida.trim().includes("Acceso concedido");
      }
    },
    4: {
      titulo: "IF + ELSE (La Alternativa)",
      badge: "🟢 NIVEL 4",
      badgeReward: "🧩 Maestro del ELSE",
      teoria: `
        <p>La estructura <code>else</code> se ejecuta cuando la condición del <code>if</code> resulta ser <strong>falsa</strong>.</p>
        <pre><code>if edad >= 18:
    print("Puede entrar")
else:
    print("No puede entrar")</code></pre>
        <p><code>else</code> no lleva condición y también debe terminar en <code>:</code>.</p>
      `,
      consigna: "Declara <code>edad = 15</code>. Si <code>edad >= 18</code> imprime <code>\"Mayor\"</code>. En caso contrario (<code>else</code>), imprime <code>\"Menor\"</code>.",
      codigoInicial: "edad = 15\nif edad >= 18:\n    print(\"Mayor\")\n",
      pistas: [
        "El 'else:' debe ir alineado al mismo nivel del 'if' (sin indentación).",
        "Después de 'else' se colocan dos puntos ':'.",
        "Dentro del else, el print(\"Menor\") debe llevar indentación."
      ],
      validar: (codigo, salida) => {
        const tieneElse = /else\s*:/.test(codigo);
        const alineacionCorrecta = /^\s*else\s*:/m.test(codigo);
        return tieneElse && salida.trim().includes("Menor");
      }
    },
    5: {
      titulo: "Decisiones Cotidianas",
      badge: "🟢 NIVEL 5",
      teoria: `
        <p>Las decisiones condicionales se aplican a situaciones reales del entorno escolar o cotidiano.</p>
      `,
      consigna: "Crea una variable <code>temperatura = 30</code>. Si es mayor o igual a 25 (<code>temperatura >= 25</code>), imprime <code>\"Hace calor\"</code>. Sino (<code>else</code>), imprime <code>\"No hace calor\"</code>.",
      codigoInicial: "temperatura = 30\n",
      pistas: [
        "Estructura el if con la condición de temperatura.",
        "Añade el bloque else:.",
        "Verifica las mayúsculas en las cadenas de texto del print."
      ],
      validar: (codigo, salida) => {
        const estructura = /if\s+temperatura\s*>=\s*25\s*:[\s\S]*else\s*:/;
        return estructura.test(codigo) && salida.trim().includes("Hace calor");
      }
    },
    6: {
      titulo: "Introducción a ELIF",
      badge: "🟢 NIVEL 6",
      badgeReward: "⚡ Experto en ELIF",
      teoria: `
        <p>Cuando tenemos más de dos alternativas utilizaciones <code>elif</code> (abreviatura de <em>else if</em>).</p>
        <pre><code>nota = 8
if nota >= 9:
    print("Excelente")
elif nota >= 6:
    print("Aprobado")
else:
    print("Debe continuar practicando")</code></pre>
      `,
      consigna: "Declara <code>nota = 7</code>. Si <code>nota >= 9</code> imprime <code>\"Excelente\"</code>. Sino, si <code>nota >= 6</code> (<code>elif</code>), imprime <code>\"Aprobado\"</code>. Sino (<code>else</code>), imprime <code>\"Reprobado\"</code>.",
      codigoInicial: "nota = 7\n",
      pistas: [
        "El elif debe ir después del if y antes del else.",
        "Sintaxis: elif nota >= 6:",
        "Comprobá la indentación de los 3 bloques print."
      ],
      validar: (codigo, salida) => {
        const tieneElif = /elif\s+nota\s*>=\s*6\s*:/.test(codigo);
        return tieneElif && salida.trim().includes("Aprobado");
      }
    },
    7: {
      titulo: "Estructuras Completas IF + ELIF + ELSE",
      badge: "🟢 NIVEL 7",
      badgeReward: "🧠 Maestro de decisiones",
      teoria: `
        <p>Puedes conectar múltiples alternativas secuenciales. Python evaluará las condiciones de arriba hacia abajo y ejecutará solo la primera que sea verdadera.</p>
      `,
      consigna: "Crea un programa con la variable <code>hora = 14</code>. Si <code>hora < 12</code> imprime <code>\"Buenos días\"</code>. Sino, si <code>hora < 20</code> (<code>elif</code>) imprime <code>\"Buenas tardes\"</code>. Sino (<code>else</code>), imprime <code>\"Buenas noches\"</code>.",
      codigoInicial: "hora = 14\n",
      pistas: [
        "Utiliza la comparación < (menor que).",
        "Asegúrate de incluir if, elif y else.",
        "Verifica que la salida en pantalla sea exactamente 'Buenas tardes'."
      ],
      validar: (codigo, salida) => {
        const estructuraCompleta = /if[\s\S]*elif[\s\S]*else\s*:/;
        return estructuraCompleta.test(codigo) && salida.trim().includes("Buenas tardes");
      }
    },
    8: {
      titulo: "Desafío Final — Integración Total",
      badge: "🏆 DESAFÍO FINAL",
      badgeReward: "👑 PYLOGIC MASTER",
      teoria: `
        <p>¡Has llegado al Desafío Final! Demuestra todo lo aprendido construyendo una solución completa desde cero.</p>
      `,
      consigna: "Crea una variable <code>velocidad = 75</code>. Evalúa:\n1. Si <code>velocidad > 90</code>: imprime <code>\"Exceso grave\"</code>.\n2. Sino, si <code>velocidad > 60</code> (<code>elif</code>): imprime <code>\"Precaución\"</code>.\n3. Sino (<code>else</code>): imprime <code>\"Velocidad permitida\"</code>.",
      codigoInicial: "velocidad = 75\n# Escribe el programa completo aquí\n",
      pistas: [
        "Usa una variable 'velocidad = 75'.",
        "Combina if, elif y else con los operadores '>' correspondientes.",
        "Revisá la sintaxis de los dos puntos y las indentaciones."
      ],
      validar: (codigo, salida) => {
        const usaIf = /if\s+velocidad\s*>\s*90\s*:/.test(codigo);
        const usaElif = /elif\s+velocidad\s*>\s*60\s*:/.test(codigo);
        const usaElse = /else\s*:/.test(codigo);
        return usaIf && usaElif && usaElse && salida.trim().includes("Precaución");
      }
    }
  };

  // --- ESCALA OFICIAL DE CONVERSIÓN DE PORCENTAJE A NOTA PARA LIBRETA (1-10) ---
  function calcularNotaLibreta(porcentaje) {
    const p = Math.round(porcentaje);
    if (p <= 19) return { nota: 1, desc: "1: Requiere acompañamiento" };
    if (p <= 29) return { nota: 2, desc: "2: Nivel inicial" };
    if (p <= 39) return { nota: 3, desc: "3: Bajo nivel de logro" };
    if (p <= 49) return { nota: 4, desc: "4: En proceso, requiere apoyo" };
    if (p <= 59) return { nota: 5, desc: "5: En proceso" };
    if (p <= 69) return { nota: 6, desc: "6: Logro aceptable" };
    if (p <= 79) return { nota: 7, desc: "7: Buen desempeño" };
    if (p <= 89) return { nota: 8, desc: "8: Buen desempeño" };
    if (p <= 94) return { nota: 9, desc: "9: Muy buen desempeño" };
    return { nota: 10, desc: "10: Excelente desempeño" };
  }

  // --- INICIALIZACIÓN DE PYODIDE (MOTOR PYTHON) ---
  async function initPyodideEngine() {
    try {
      console.log("Cargando entorno Python (Pyodide)...");
      state.pyodideInstance = await loadPyodide();
      state.pyodideReady = true;
      console.log("Pyodide listo para ejecución.");
    } catch (err) {
      console.error("Error al cargar Pyodide:", err);
    }
  }

  // --- DETECTOR PEDAGÓGICO DE INDICIOS EXTERNOS / IA ---
  function analizarIndiciosExternos(codigoActual) {
    // Prohibiciones explícitas según contenidos
    const prohibidos = [/for\s+/g, /while\s+/g, /def\s+/g, /class\s+/g, /import\s+/g, /\[.*\]/g, /\{.*\}/g, /and\s+/g, /or\s+/g, /not\s+/g];
    let contadorIndicios = 0;

    prohibidos.forEach(regex => {
      if (regex.test(codigoActual)) contadorIndicios++;
    });

    // Análisis de extensión inusual
    if (codigoActual.length > 300) contadorIndicios++;

    if (contadorIndicios >= 2) {
      return "Alto";
    } else if (contadorIndicios === 1) {
      return "Moderado";
    }
    return "Ninguno";
  }

  // --- CICLO DE VIDA Y NAVEGACIÓN ---
  function registrarEstudiante(e) {
    e.preventDefault();
    state.estudiante.nombre = document.getElementById("inputNombre").value.trim();
    state.estudiante.usuario = document.getElementById("inputUsuario").value.trim();
    state.estudiante.grupo = document.getElementById("inputGrupo").value.trim();
    state.estudiante.liceo = document.getElementById("inputLiceo").value.trim();
    state.estudiante.fechaInicio = new Date().toISOString();

    guardarEnStorage();
    mostrarNivel(1);
    document.getElementById("headerProgressBox").style.display = "flex";
  }

  function mostrarNivel(idNivel) {
    state.nivelActual = idNivel;
    const cfg = CONFIG_NIVELES[idNivel];
    if (!cfg) return;

    // Actualizar Header Progreso
    document.getElementById("progressLabelText").innerText = `Nivel ${idNivel} de 8`;
    const porcHeader = (idNivel / 8) * 100;
    document.getElementById("headerProgressBar").style.width = `${porcHeader}%`;

    // Cargar Datos en Vista
    document.getElementById("levelBadge").innerText = cfg.badge;
    document.getElementById("levelTitle").innerText = cfg.titulo;
    document.getElementById("levelTheory").innerHTML = cfg.teoria;
    document.getElementById("levelConsigna").innerHTML = `<strong>🎯 Consigna:</strong> ${cfg.consigna}`;
    
    const editor = document.getElementById("codeEditor");
    
    // Cargar código previamente validado o el código inicial del nivel
    const progresoPrev = state.progresosNivel[idNivel];
    if (progresoPrev && progresoPrev.codigoValidado) {
      editor.value = progresoPrev.codigoValidado;
    } else {
      editor.value = cfg.codigoInicial;
    }

    document.getElementById("terminalOutput").innerText = "Presiona 'Ejecutar' para ver la salida...";
    document.getElementById("hintText").style.display = "none";
    document.getElementById("aiPedagogicalMessage").style.display = "none";
    document.getElementById("hintCount").innerText = (progresoPrev ? progresoPrev.pistas : 0);

    cambiarVista("viewLevel");
  }

  async function ejecutarCodigo() {
    const code = document.getElementById("codeEditor").value;
    const term = document.getElementById("terminalOutput");
    term.innerText = "Ejecutando Python en navegador...\n";

    if (!state.pyodideReady) {
      term.innerText = "Error: El motor de Python todavía se está cargando. Intenta de nuevo en unos segundos.";
      return;
    }

    try {
      // Redireccionar stdout de Pyodide
      state.pyodideInstance.runPython(`
import sys
import io
sys.stdout = io.StringIO()
      `);
      
      await state.pyodideInstance.runPythonAsync(code);
      
      const stdout = state.pyodideInstance.runPython("sys.stdout.getvalue()");
      term.innerText = stdout || "(El programa se ejecutó correctamente sin imprimir texto)";
      return stdout;
    } catch (err) {
      term.innerText = `❌ Error de Python:\n${err.message}`;
      return null;
    }
  }

  async function comprobarSolucion() {
    const id = state.nivelActual;
    const cfg = CONFIG_NIVELES[id];
    const code = document.getElementById("codeEditor").value;
    
    // Registrar intento
    state.intentosTotales++;
    if (!state.progresosNivel[id]) {
      state.progresosNivel[id] = { completado: false, correctas: 0, intentos: 0, pistas: 0, codigoValidado: "", fechaValidacion: null, indicioIA: "Ninguno" };
    }
    state.progresosNivel[id].intentos++;

    // Analizar indicios pedagógicos
    const indicioIA = analizarIndiciosExternos(code);
    state.progresosNivel[id].indicioIA = indicioIA;
    if (indicioIA === "Alto" || indicioIA === "Moderado") {
      document.getElementById("aiPedagogicalMessage").style.display = "block";
    }

    // Ejecutar código para evaluar salida real
    const salida = await ejecutarCodigo();
    
    if (salida !== null && cfg.validar(code, salida)) {
      // ¡Solución Correcta!
      state.progresosNivel[id].completado = true;
      state.progresosNivel[id].correctas = 1;
      state.progresosNivel[id].codigoValidado = code; // Conserva exactamente el último código validado
      state.progresosNivel[id].fechaValidacion = new Date().toISOString();

      if (cfg.badgeReward && !state.badges.includes(cfg.badgeReward)) {
        state.badges.push(cfg.badgeReward);
      }

      guardarEnStorage();

      alert(`🎉 ¡Excelente! Has completado el Nivel ${id}.`);

      if (id < 8) {
        mostrarNivel(id + 1);
      } else {
        finalizarAplicacion();
      }
    } else {
      alert("⚠️ La solución aún no cumple todos los requisitos de la consigna. Revisa el código, la terminal y los dos puntos o indentación.");
    }
  }

  function pedirPista() {
    const id = state.nivelActual;
    const cfg = CONFIG_NIVELES[id];
    if (!state.progresosNivel[id]) {
      state.progresosNivel[id] = { completado: false, correctas: 0, intentos: 0, pistas: 0, codigoValidado: "", fechaValidacion: null, indicioIA: "Ninguno" };
    }

    let pCount = state.progresosNivel[id].pistas;
    if (pCount < cfg.pistas.length) {
      const pistaActual = cfg.pistas[pCount];
      pCount++;
      state.progresosNivel[id].pistas = pCount;
      state.pistasTotales++;

      document.getElementById("hintCount").innerText = pCount;
      const hBox = document.getElementById("hintText");
      hBox.innerText = `💡 Pista ${pCount}: ${pistaActual}`;
      hBox.style.display = "block";
      guardarEnStorage();
    } else {
      alert("Has consultado todas las pistas disponibles para este nivel.");
    }
  }

  function limpiarEditor() {
    document.getElementById("codeEditor").value = "";
    document.getElementById("terminalOutput").innerText = "";
  }

  function finalizarAplicacion() {
    let completados = 0;
    Object.values(state.progresosNivel).forEach(p => {
      if (p.completado) completados++;
    });

    const porcentaje = (completados / 8) * 100;
    const notaObj = calcularNotaLibreta(porcentaje);

    document.getElementById("finalNotaLibreta").innerText = `${notaObj.nota}/10`;
    document.getElementById("finalInterpretacion").innerText = notaObj.desc;
    document.getElementById("finalPorcentaje").innerText = `${Math.round(porcentaje)}%`;
    document.getElementById("finalCorrectas").innerText = `${completados}/8`;
    document.getElementById("finalIntentos").innerText = state.intentosTotales;
    document.getElementById("finalPistas").innerText = state.pistasTotales;

    // Badges UI
    const bContainer = document.getElementById("finalBadgesContainer");
    bContainer.innerHTML = state.badges.map(b => `<span class="badge badge-gold">${b}</span>`).join(" ");

    cambiarVista("viewFinal");
  }

  // --- SISTEMA DE REPORTES DINÁMICOS Y PARCIALES ---
  function abrirReporteModal() {
    document.getElementById("repNombre").innerText = state.estudiante.nombre || "Estudiante";
    document.getElementById("repUsuario").innerText = state.estudiante.usuario || "-";
    document.getElementById("repGrupo").innerText = state.estudiante.grupo || "-";
    document.getElementById("repLiceo").innerText = state.estudiante.liceo || "-";

    let completados = 0;
    Object.values(state.progresosNivel).forEach(p => {
      if (p.completado) completados++;
    });

    const porcentaje = (completados / 8) * 100;
    const notaObj = calcularNotaLibreta(porcentaje);

    // Estado Parcial o Final
    const pill = document.getElementById("repEstadoPill");
    if (completados === 8) {
      pill.innerText = "🟢 Finalizado";
      pill.className = "report-state-pill pill-success";
    } else {
      pill.innerText = "🟡 En curso";
      pill.className = "report-state-pill pill-warning";
    }

    document.getElementById("repNotaLibreta").innerText = `${notaObj.nota}/10`;
    document.getElementById("repPorcentaje").innerText = `${Math.round(porcentaje)}%`;
    document.getElementById("repActividades").innerText = `${completados}/8`;
    document.getElementById("repIntentos").innerText = state.intentosTotales;
    document.getElementById("repPistas").innerText = state.pistasTotales;

    // Render Tabla Niveles
    const tbody = document.getElementById("repTablaNiveles");
    tbody.innerHTML = "";
    
    for (let i = 1; i <= 8; i++) {
      const p = state.progresosNivel[i];
      const row = document.createElement("tr");
      if (p && p.completado) {
        row.innerHTML = `
          <td>Nivel ${i} — ${CONFIG_NIVELES[i].titulo}</td>
          <td>🟢 Logrado</td>
          <td>1/1</td>
          <td>${p.intentos}</td>
          <td>${p.pistas}</td>
        `;
      } else if (p && p.intentos > 0) {
        row.innerHTML = `
          <td>Nivel ${i} — ${CONFIG_NIVELES[i].titulo}</td>
          <td>🟡 En proceso</td>
          <td>0/1</td>
          <td>${p.intentos}</td>
          <td>${p.pistas}</td>
        `;
      } else {
        row.innerHTML = `
          <td>Nivel ${i} — ${CONFIG_NIVELES[i].titulo}</td>
          <td>⏳ Pendiente</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
        `;
      }
      tbody.appendChild(row);
    }

    // Render Código Validado por Nivel
    const codeContainer = document.getElementById("repCodigoValidadoSec");
    codeContainer.innerHTML = "";

    for (let i = 1; i <= 8; i++) {
      const p = state.progresosNivel[i];
      const box = document.createElement("div");
      box.className = "code-evidence-box";
      
      let htmlContent = `<h5>🟢 NIVEL ${i} — ${CONFIG_NIVELES[i].titulo}</h5>`;
      if (p && p.codigoValidado) {
        htmlContent += `
          <p><small>Fecha de validación: ${new Date(p.fechaValidacion).toLocaleString()} | Intentos: ${p.intentos} | Pistas: ${p.pistas}</small></p>
          <pre class="code-block"><code>${escaparHtml(p.codigoValidado)}</code></pre>
        `;
      } else {
        htmlContent += `<p class="text-muted">Código validado: ⏳ Pendiente</p>`;
      }
      box.innerHTML = htmlContent;
      codeContainer.appendChild(box);
    }

    document.getElementById("modalReporte").style.display = "flex";
  }

  function descargarPDFReporte() {
    const el = document.getElementById("reporteContenidoImprimible");
    const opt = {
      margin:       10,
      filename:     `PyLogic_Reporte_${state.estudiante.usuario || 'estudiante'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(el).save();
  }

  // --- PANEL DOCENTE ---
  function abrirModalDocente() {
    document.getElementById("modalDocente").style.display = "flex";
  }

  function autenticarDocente() {
    const pass = document.getElementById("inputPassDocente").value;
    if (pass === "docente2026" || pass === "admin") {
      document.getElementById("docenteAuthBox").style.display = "none";
      document.getElementById("docenteDashboardBox").style.display = "block";
      cargarTablaDocente();
    } else {
      alert("Contraseña docente incorrecta.");
    }
  }

  function cargarTablaDocente() {
    // Cargar todos los usuarios guardados en localStorage
    const usuariosBD = JSON.parse(localStorage.getItem("pylogic_all_users") || "[]");
    
    // Si la sesión actual existe, agregar o actualizar
    if (state.estudiante.usuario) {
      const index = usuariosBD.findIndex(u => u.estudiante.usuario === state.estudiante.usuario);
      if (index >= 0) {
        usuariosBD[index] = state;
      } else {
        usuariosBD.push(state);
      }
      localStorage.setItem("pylogic_all_users", JSON.stringify(usuariosBD));
    }

    // Métricas
    document.getElementById("docTotalUsuarios").innerText = usuariosBD.length;
    let activos = 0, fin = 0, sumaNotas = 0;

    usuariosBD.forEach(u => {
      let comp = 0;
      Object.values(u.progresosNivel || {}).forEach(p => { if (p.completado) comp++; });
      if (comp > 0) activos++;
      if (comp === 8) fin++;

      const porc = (comp / 8) * 100;
      sumaNotas += calcularNotaLibreta(porc).nota;
    });

    document.getElementById("docUsuariosActivos").innerText = activos;
    document.getElementById("docFinalizados").innerText = fin;
    const prom = usuariosBD.length ? (sumaNotas / usuariosBD.length).toFixed(1) : "0.0";
    document.getElementById("docPromedioGeneral").innerText = `${prom} / 10`;

    // Render Tabla
    const tbody = document.getElementById("docTablaEstudiantes");
    tbody.innerHTML = "";

    usuariosBD.forEach(u => {
      let comp = 0;
      Object.values(u.progresosNivel || {}).forEach(p => { if (p.completado) comp++; });
      const porc = (comp / 8) * 100;
      const notaObj = calcularNotaLibreta(porc);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.estudiante.nombre || 'Sin nombre'}</td>
        <td><code>${u.estudiante.usuario || '-'}</code></td>
        <td>${u.estudiante.grupo || '-'}</td>
        <td>${Math.round(porc)}%</td>
        <td><strong>${notaObj.nota}/10</strong></td>
        <td>${comp === 8 ? '🟢 Finalizado' : '🟡 En curso'}</td>
        <td><button class="btn btn-small btn-primary" onclick="PyLogic.verReporteIndividualDocente('${u.estudiante.usuario}')">👁 VER REPORTE</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function verReporteIndividualDocente(usuarioKey) {
    const usuariosBD = JSON.parse(localStorage.getItem("pylogic_all_users") || "[]");
    const uData = usuariosBD.find(u => u.estudiante.usuario === usuarioKey);
    if (uData) {
      // Cargar temporalmente el estado en la vista de reporte
      const estadoBackup = { ...state };
      Object.assign(state, uData);
      abrirReporteModal();
      // Restaurar estado de sesión
      setTimeout(() => { Object.assign(state, estadoBackup); }, 500);
    }
  }

  // --- PERSISTENCIA LOCALSTORAGE ---
  function guardarEnStorage() {
    localStorage.setItem("pylogic_current_session", JSON.stringify(state));
    
    // Sincronizar en base general de usuarios
    const usuariosBD = JSON.parse(localStorage.getItem("pylogic_all_users") || "[]");
    if (state.estudiante.usuario) {
      const idx = usuariosBD.findIndex(u => u.estudiante.usuario === state.estudiante.usuario);
      if (idx >= 0) {
        usuariosBD[idx] = state;
      } else {
        usuariosBD.push(state);
      }
      localStorage.setItem("pylogic_all_users", JSON.stringify(usuariosBD));
    }
  }

  function cargarStorage() {
    const sesion = localStorage.getItem("pylogic_current_session");
    if (sesion) {
      try {
        const parsed = JSON.parse(sesion);
        Object.assign(state, parsed);
        if (state.estudiante.nombre) {
          document.getElementById("headerProgressBox").style.display = "flex";
          mostrarNivel(state.nivelActual || 1);
        }
      } catch (e) {
        console.error("Error al restaurar sesión:", e);
      }
    }
  }

  // --- UTILIDADES ---
  function cambiarVista(idVista) {
    document.querySelectorAll(".view-section").forEach(sec => sec.style.display = "none");
    document.getElementById(idVista).style.display = "block";
  }

  function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = "none";
  }

  function escaparHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function reiniciarAvance() {
    if (confirm("¿Estás seguro de reiniciar tu avance?")) {
      state.progresosNivel = {};
      state.intentosTotales = 0;
      state.pistasTotales = 0;
      state.badges = [];
      guardarEnStorage();
      mostrarNivel(1);
    }
  }

  // Inicialización Automática
  window.addEventListener("DOMContentLoaded", () => {
    initPyodideEngine();
    cargarStorage();
  });

  return {
    registrarEstudiante,
    ejecutarCodigo,
    comprobarSolucion,
    pedirPista,
    limpiarEditor,
    abrirReporteModal,
    descargarPDFReporte,
    abrirModalDocente,
    autenticarDocente,
    cerrarModal,
    reiniciarAvance,
    verReporteIndividualDocente
  };
})();