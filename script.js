import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ======================================================
   CONFIGURACIÓN REAL DE FIREBASE
====================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyB_TGANBa25toDvj8LXLtQLq3_-YCsbQ0A",

  authDomain:
    "mantenimiento--de-flotilla.firebaseapp.com",

  databaseURL:
    "https://mantenimiento--de-flotilla-default-rtdb.firebaseio.com",

  projectId:
    "mantenimiento--de-flotilla",

  storageBucket:
    "mantenimiento--de-flotilla.firebasestorage.app",

  messagingSenderId:
    "348935340353",

  appId:
    "1:348935340353:web:92eb3021548ec9ec9321c0"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const serviciosReferencia = ref(
  database,
  "mantenimientos"
);

/* ======================================================
   VARIABLES GENERALES
====================================================== */

let servicios = [];
let servicioSeleccionadoId = null;
let filtroGarantiasActual = "todas";
let guardandoServicio = false;

/* ======================================================
   ELEMENTOS DEL HTML
====================================================== */

const menuItems = document.querySelectorAll(".menu-item");
const secciones = document.querySelectorAll(".page-section");

const formServicio = document.getElementById("formServicio");
const servicioId = document.getElementById("servicioId");

const marca = document.getElementById("marca");
const economico = document.getElementById("economico");
const fechaEntrada = document.getElementById("fechaEntrada");
const estado = document.getElementById("estado");
const falla = document.getElementById("falla");
const refacciones = document.getElementById("refacciones");
const refaccionaria = document.getElementById("refaccionaria");
const garantia = document.getElementById("garantia");

const seccionGarantia = document.getElementById(
  "seccionGarantia"
);

const fechaInicioGarantia = document.getElementById(
  "fechaInicioGarantia"
);

const tiempoGarantia = document.getElementById(
  "tiempoGarantia"
);

const unidadGarantia = document.getElementById(
  "unidadGarantia"
);

const fechaFinGarantia = document.getElementById(
  "fechaFinGarantia"
);

const tablaRecientes = document.getElementById(
  "tablaRecientes"
);

const tablaHistorial = document.getElementById(
  "tablaHistorial"
);

const listaGarantias = document.getElementById(
  "listaGarantias"
);

const sinRecientes = document.getElementById(
  "sinRecientes"
);

const sinHistorial = document.getElementById(
  "sinHistorial"
);

const sinGarantias = document.getElementById(
  "sinGarantias"
);

const buscador = document.getElementById("buscador");

const filtroEstado = document.getElementById(
  "filtroEstado"
);

const filtroGarantia = document.getElementById(
  "filtroGarantia"
);

const modalDetalle = document.getElementById(
  "modalDetalle"
);

const detalleEconomico = document.getElementById(
  "detalleEconomico"
);

const contenidoDetalle = document.getElementById(
  "contenidoDetalle"
);

const btnGuardar = document.getElementById(
  "btnGuardar"
);

/* ======================================================
   INICIAR SISTEMA
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  colocarFechaActual();
  escucharServiciosFirebase();
});

/* ======================================================
   EVENTOS DEL MENÚ
====================================================== */

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    abrirSeccion(item.dataset.section);
  });
});

document
  .getElementById("btnNuevoServicio")
  .addEventListener("click", prepararNuevoServicio);

document
  .querySelectorAll(".btn-abrir-nuevo")
  .forEach((boton) => {
    boton.addEventListener(
      "click",
      prepararNuevoServicio
    );
  });

document
  .getElementById("btnVerHistorial")
  .addEventListener("click", () => {
    abrirSeccion("historial");
  });

document
  .getElementById("btnCancelar")
  .addEventListener("click", () => {
    limpiarFormulario();
    abrirSeccion("inicio");
  });

garantia.addEventListener(
  "change",
  mostrarCamposGarantia
);

fechaInicioGarantia.addEventListener(
  "change",
  calcularVencimientoGarantia
);

tiempoGarantia.addEventListener(
  "input",
  calcularVencimientoGarantia
);

unidadGarantia.addEventListener(
  "change",
  calcularVencimientoGarantia
);

formServicio.addEventListener(
  "submit",
  guardarServicio
);

buscador.addEventListener(
  "input",
  renderizarHistorial
);

filtroEstado.addEventListener(
  "change",
  renderizarHistorial
);

filtroGarantia.addEventListener(
  "change",
  renderizarHistorial
);

document
  .querySelectorAll(".warranty-filter")
  .forEach((boton) => {
    boton.addEventListener("click", () => {
      document
        .querySelectorAll(".warranty-filter")
        .forEach((elemento) => {
          elemento.classList.remove("active");
        });

      boton.classList.add("active");

      filtroGarantiasActual =
        boton.dataset.warrantyFilter;

      renderizarGarantias();
    });
  });

document
  .getElementById("cerrarModal")
  .addEventListener("click", cerrarModal);

document
  .getElementById("cerrarModalOverlay")
  .addEventListener("click", cerrarModal);

document
  .getElementById("btnEditarDetalle")
  .addEventListener("click", () => {
    if (!servicioSeleccionadoId) {
      return;
    }

    const id = servicioSeleccionadoId;

    cerrarModal();
    editarServicio(id);
  });

document
  .getElementById("btnEliminarDetalle")
  .addEventListener("click", () => {
    if (!servicioSeleccionadoId) {
      return;
    }

    eliminarServicio(servicioSeleccionadoId);
  });

/* ======================================================
   ESCUCHAR FIREBASE EN TIEMPO REAL
====================================================== */

function escucharServiciosFirebase() {
  onValue(
    serviciosReferencia,

    (snapshot) => {
      const datos = snapshot.val();

      if (!datos) {
        servicios = [];
        actualizarTodo();
        return;
      }

      servicios = Object.entries(datos).map(
        ([id, registro]) => ({
          id,
          ...registro
        })
      );

      servicios.sort((a, b) => {
        const fechaA = new Date(
          a.fechaRegistro || 0
        );

        const fechaB = new Date(
          b.fechaRegistro || 0
        );

        return fechaB - fechaA;
      });

      actualizarTodo();
    },

    (error) => {
      console.error(
        "Error al leer Firebase:",
        error
      );

      mostrarNotificacion(
        "Error de conexión",
        "No se pudieron cargar los registros de Firebase.",
        "error"
      );
    }
  );
}

/* ======================================================
   NAVEGACIÓN
====================================================== */

function abrirSeccion(nombreSeccion) {
  secciones.forEach((seccion) => {
    seccion.classList.remove("active-section");
  });

  menuItems.forEach((item) => {
    item.classList.remove("active");
  });

  const seccionSeleccionada =
    document.getElementById(nombreSeccion);

  const menuSeleccionado =
    document.querySelector(
      `[data-section="${nombreSeccion}"]`
    );

  if (seccionSeleccionada) {
    seccionSeleccionada.classList.add(
      "active-section"
    );
  }

  if (menuSeleccionado) {
    menuSeleccionado.classList.add("active");
  }

  if (nombreSeccion === "historial") {
    renderizarHistorial();
  }

  if (nombreSeccion === "garantias") {
    renderizarGarantias();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function prepararNuevoServicio() {
  limpiarFormulario();

  document.getElementById(
    "tituloFormulario"
  ).textContent = "Registrar servicio";

  btnGuardar.textContent = "Guardar servicio";

  abrirSeccion("nuevo");
}

/* ======================================================
   FECHAS Y GARANTÍA
====================================================== */

function colocarFechaActual() {
  if (!fechaEntrada.value) {
    fechaEntrada.value = obtenerFechaLocal();
  }
}

function obtenerFechaLocal() {
  const fecha = new Date();

  const desplazamiento =
    fecha.getTimezoneOffset() * 60000;

  return new Date(
    fecha.getTime() - desplazamiento
  )
    .toISOString()
    .split("T")[0];
}

function mostrarCamposGarantia() {
  const tieneGarantia =
    garantia.value === "Sí";

  seccionGarantia.classList.toggle(
    "hidden",
    !tieneGarantia
  );

  fechaInicioGarantia.required = tieneGarantia;
  tiempoGarantia.required = tieneGarantia;
  fechaFinGarantia.required = tieneGarantia;

  if (
    tieneGarantia &&
    !fechaInicioGarantia.value
  ) {
    fechaInicioGarantia.value =
      fechaEntrada.value ||
      obtenerFechaLocal();
  }

  if (!tieneGarantia) {
    fechaInicioGarantia.value = "";
    tiempoGarantia.value = "";
    fechaFinGarantia.value = "";
  }
}

function calcularVencimientoGarantia() {
  const fechaInicio =
    fechaInicioGarantia.value;

  const cantidad = Number(
    tiempoGarantia.value
  );

  const unidad = unidadGarantia.value;

  if (
    !fechaInicio ||
    !cantidad ||
    cantidad <= 0
  ) {
    fechaFinGarantia.value = "";
    return;
  }

  const fecha = crearFecha(fechaInicio);

  if (unidad === "días") {
    fecha.setDate(
      fecha.getDate() + cantidad
    );
  }

  if (unidad === "meses") {
    fecha.setMonth(
      fecha.getMonth() + cantidad
    );
  }

  if (unidad === "años") {
    fecha.setFullYear(
      fecha.getFullYear() + cantidad
    );
  }

  fechaFinGarantia.value =
    convertirFechaInput(fecha);
}

/* ======================================================
   GUARDAR EN FIREBASE
====================================================== */

async function guardarServicio(evento) {
  evento.preventDefault();

  if (guardandoServicio) {
    return;
  }

  if (!formServicio.checkValidity()) {
    formServicio.reportValidity();
    return;
  }

  if (
    garantia.value === "Sí" &&
    !fechaFinGarantia.value
  ) {
    mostrarNotificacion(
      "Información incompleta",
      "Ingresa correctamente el tiempo de garantía.",
      "error"
    );

    return;
  }

  guardandoServicio = true;
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  const idExistente = servicioId.value;

  const registro = {
    marca: marca.value.trim(),

    economico:
      economico.value.trim().toUpperCase(),

    fechaEntrada:
      fechaEntrada.value,

    estado:
      estado.value,

    falla:
      falla.value.trim(),

    refacciones:
      refacciones.value.trim(),

    refaccionaria:
      refaccionaria.value.trim(),

    garantia:
      garantia.value,

    fechaInicioGarantia:
      garantia.value === "Sí"
        ? fechaInicioGarantia.value
        : "",

    tiempoGarantia:
      garantia.value === "Sí"
        ? Number(tiempoGarantia.value)
        : 0,

    unidadGarantia:
      garantia.value === "Sí"
        ? unidadGarantia.value
        : "",

    fechaFinGarantia:
      garantia.value === "Sí"
        ? fechaFinGarantia.value
        : "",

    fechaActualizacion:
      new Date().toISOString()
  };

  try {
    if (idExistente) {
      const servicioAnterior =
        servicios.find(
          (servicio) =>
            servicio.id === idExistente
        );

      registro.fechaRegistro =
        servicioAnterior?.fechaRegistro ||
        new Date().toISOString();

      await update(
        ref(
          database,
          `mantenimientos/${idExistente}`
        ),
        registro
      );

      mostrarNotificacion(
        "Servicio actualizado",
        "Los cambios se guardaron en Firebase."
      );
    } else {
      registro.fechaRegistro =
        new Date().toISOString();

      const nuevaReferencia = push(
        serviciosReferencia
      );

      await set(
        nuevaReferencia,
        registro
      );

      mostrarNotificacion(
        "Servicio registrado",
        "El mantenimiento se guardó en la nube."
      );
    }

    limpiarFormulario();
    abrirSeccion("historial");
  } catch (error) {
    console.error(
      "Error al guardar en Firebase:",
      error
    );

    mostrarNotificacion(
      "No se pudo guardar",
      "Revisa la conexión y las reglas de Firebase.",
      "error"
    );
  } finally {
    guardandoServicio = false;
    btnGuardar.disabled = false;
    btnGuardar.textContent =
      "Guardar servicio";
  }
}

/* ======================================================
   ACTUALIZAR PANTALLAS
====================================================== */

function actualizarTodo() {
  actualizarResumen();
  renderizarRecientes();
  renderizarHistorial();
  renderizarGarantias();
}

function actualizarResumen() {
  const hoy = inicioDelDia(new Date());

  const serviciosEnReparacion =
    servicios.filter(
      (servicio) =>
        servicio.estado === "En reparación"
    );

  const serviciosConGarantia =
    servicios.filter(
      (servicio) =>
        servicio.garantia === "Sí"
    );

  const vencidas =
    serviciosConGarantia.filter(
      (servicio) => {
        if (!servicio.fechaFinGarantia) {
          return false;
        }

        return (
          crearFecha(
            servicio.fechaFinGarantia
          ) < hoy
        );
      }
    );

  document.getElementById(
    "totalServicios"
  ).textContent = servicios.length;

  document.getElementById(
    "totalReparacion"
  ).textContent =
    serviciosEnReparacion.length;

  document.getElementById(
    "totalGarantias"
  ).textContent =
    serviciosConGarantia.length;

  document.getElementById(
    "garantiasVencidas"
  ).textContent = vencidas.length;
}

/* ======================================================
   SERVICIOS RECIENTES
====================================================== */

function renderizarRecientes() {
  tablaRecientes.innerHTML = "";

  const recientes = [...servicios]
    .sort((a, b) => {
      return (
        new Date(
          b.fechaRegistro || 0
        ) -
        new Date(
          a.fechaRegistro || 0
        )
      );
    })
    .slice(0, 6);

  sinRecientes.style.display =
    recientes.length === 0
      ? "block"
      : "none";

  if (recientes.length === 0) {
    return;
  }

  recientes.forEach((servicio) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        ${formatearFecha(
          servicio.fechaEntrada
        )}
      </td>

      <td>
        <button
          class="economic-link"
          data-action="ver"
          data-id="${servicio.id}"
        >
          ${escaparHTML(
            servicio.economico
          )}
        </button>
      </td>

      <td>
        ${escaparHTML(
          servicio.marca
        )}
      </td>

      <td class="cell-ellipsis">
        ${escaparHTML(
          servicio.falla
        )}
      </td>

      <td>
        ${escaparHTML(
          servicio.refaccionaria
        )}
      </td>

      <td>
        ${crearBadgeGarantia(
          servicio
        )}
      </td>

      <td>
        ${crearBadgeEstado(
          servicio.estado
        )}
      </td>
    `;

    tablaRecientes.appendChild(fila);
  });
}

/* ======================================================
   HISTORIAL
====================================================== */

function renderizarHistorial() {
  tablaHistorial.innerHTML = "";

  const textoBusqueda =
    buscador.value
      .trim()
      .toLowerCase();

  const estadoSeleccionado =
    filtroEstado.value;

  const garantiaSeleccionada =
    filtroGarantia.value;

  const resultados =
    servicios.filter((servicio) => {
      const textoCompleto = [
        servicio.economico,
        servicio.marca,
        servicio.falla,
        servicio.refacciones,
        servicio.refaccionaria
      ]
        .join(" ")
        .toLowerCase();

      const coincideBusqueda =
        !textoBusqueda ||
        textoCompleto.includes(
          textoBusqueda
        );

      const coincideEstado =
        !estadoSeleccionado ||
        servicio.estado ===
          estadoSeleccionado;

      const coincideGarantia =
        !garantiaSeleccionada ||
        servicio.garantia ===
          garantiaSeleccionada;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideGarantia
      );
    });

  sinHistorial.style.display =
    resultados.length === 0
      ? "block"
      : "none";

  if (resultados.length === 0) {
    return;
  }

  resultados.forEach((servicio) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        ${formatearFecha(
          servicio.fechaEntrada
        )}
      </td>

      <td class="economic-number">
        ${escaparHTML(
          servicio.economico
        )}
      </td>

      <td>
        ${escaparHTML(
          servicio.marca
        )}
      </td>

      <td class="cell-ellipsis">
        ${escaparHTML(
          servicio.falla
        )}
      </td>

      <td class="cell-ellipsis">
        ${escaparHTML(
          servicio.refacciones
        )}
      </td>

      <td>
        ${escaparHTML(
          servicio.refaccionaria
        )}
      </td>

      <td>
        ${crearBadgeGarantia(
          servicio
        )}
      </td>

      <td>
        ${
          servicio.fechaFinGarantia
            ? formatearFecha(
                servicio.fechaFinGarantia
              )
            : "—"
        }
      </td>

      <td>
        ${crearBadgeEstado(
          servicio.estado
        )}
      </td>

      <td>
        <div class="action-buttons">

          <button
            class="icon-button"
            title="Ver detalle"
            data-action="ver"
            data-id="${servicio.id}"
          >
            👁
          </button>

          <button
            class="icon-button"
            title="Editar"
            data-action="editar"
            data-id="${servicio.id}"
          >
            ✎
          </button>

          <button
            class="icon-button delete"
            title="Eliminar"
            data-action="eliminar"
            data-id="${servicio.id}"
          >
            🗑
          </button>

        </div>
      </td>
    `;

    tablaHistorial.appendChild(fila);
  });
}

/* ======================================================
   GARANTÍAS
====================================================== */

function renderizarGarantias() {
  listaGarantias.innerHTML = "";

  let registros = servicios.filter(
    (servicio) =>
      servicio.garantia === "Sí"
  );

  registros = registros.filter(
    (servicio) => {
      if (
        filtroGarantiasActual === "todas"
      ) {
        return true;
      }

      return (
        obtenerEstadoGarantia(
          servicio
        ) === filtroGarantiasActual
      );
    }
  );

  sinGarantias.style.display =
    registros.length === 0
      ? "block"
      : "none";

  if (registros.length === 0) {
    return;
  }

  registros
    .sort((a, b) => {
      return (
        crearFecha(
          a.fechaFinGarantia
        ) -
        crearFecha(
          b.fechaFinGarantia
        )
      );
    })
    .forEach((servicio) => {
      const estadoGarantia =
        obtenerEstadoGarantia(servicio);

      const tarjeta =
        document.createElement("article");

      tarjeta.className =
        "warranty-card";

      tarjeta.innerHTML = `
        <div class="warranty-card-header">

          <div>
            <h3>
              ${escaparHTML(
                servicio.economico
              )}
            </h3>

            <p>
              ${escaparHTML(
                servicio.marca
              )}
              ·
              ${escaparHTML(
                servicio.refaccionaria
              )}
            </p>
          </div>

          ${crearBadgeEstadoGarantia(
            estadoGarantia
          )}

        </div>

        <div class="warranty-information">

          <div>
            <span>Refacciones</span>

            <strong>
              ${escaparHTML(
                servicio.refacciones
              )}
            </strong>
          </div>

          <div>
            <span>Tiempo</span>

            <strong>
              ${servicio.tiempoGarantia}
              ${escaparHTML(
                servicio.unidadGarantia
              )}
            </strong>
          </div>

          <div>
            <span>Inicio</span>

            <strong>
              ${formatearFecha(
                servicio.fechaInicioGarantia
              )}
            </strong>
          </div>

          <div>
            <span>Vencimiento</span>

            <strong>
              ${formatearFecha(
                servicio.fechaFinGarantia
              )}
            </strong>
          </div>

        </div>

        <div style="margin-top: 15px;">

          <button
            class="secondary-button"
            data-action="ver"
            data-id="${servicio.id}"
          >
            Ver detalle
          </button>

        </div>
      `;

      listaGarantias.appendChild(tarjeta);
    });
}

/* ======================================================
   BOTONES DINÁMICOS
====================================================== */

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest(
    "[data-action]"
  );

  if (!boton) {
    return;
  }

  const accion = boton.dataset.action;
  const id = boton.dataset.id;

  if (accion === "ver") {
    verDetalle(id);
  }

  if (accion === "editar") {
    editarServicio(id);
  }

  if (accion === "eliminar") {
    eliminarServicio(id);
  }
});

/* ======================================================
   BADGES
====================================================== */

function crearBadgeEstado(estadoServicio) {
  if (estadoServicio === "Terminado") {
    return `
      <span class="badge green">
        Terminado
      </span>
    `;
  }

  if (estadoServicio === "En reparación") {
    return `
      <span class="badge orange">
        En reparación
      </span>
    `;
  }

  return `
    <span class="badge gray">
      Pendiente
    </span>
  `;
}

function crearBadgeGarantia(servicio) {
  if (servicio.garantia !== "Sí") {
    return `
      <span class="badge gray">
        Sin garantía
      </span>
    `;
  }

  const estadoGarantia =
    obtenerEstadoGarantia(servicio);

  if (estadoGarantia === "vencida") {
    return `
      <span class="badge red">
        Vencida
      </span>
    `;
  }

  if (estadoGarantia === "por-vencer") {
    return `
      <span class="badge orange">
        Por vencer
      </span>
    `;
  }

  return `
    <span class="badge green">
      Vigente
    </span>
  `;
}

function crearBadgeEstadoGarantia(
  estadoGarantia
) {
  if (estadoGarantia === "vencida") {
    return `
      <span class="badge red">
        Vencida
      </span>
    `;
  }

  if (estadoGarantia === "por-vencer") {
    return `
      <span class="badge orange">
        Por vencer
      </span>
    `;
  }

  return `
    <span class="badge green">
      Vigente
    </span>
  `;
}

function obtenerEstadoGarantia(servicio) {
  if (!servicio.fechaFinGarantia) {
    return "vencida";
  }

  const hoy = inicioDelDia(new Date());

  const vencimiento = crearFecha(
    servicio.fechaFinGarantia
  );

  const diferenciaMilisegundos =
    vencimiento.getTime() -
    hoy.getTime();

  const diasRestantes = Math.ceil(
    diferenciaMilisegundos /
      (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) {
    return "vencida";
  }

  if (diasRestantes <= 30) {
    return "por-vencer";
  }

  return "vigente";
}

/* ======================================================
   DETALLE
====================================================== */

function verDetalle(id) {
  const servicio = servicios.find(
    (elemento) =>
      elemento.id === id
  );

  if (!servicio) {
    return;
  }

  servicioSeleccionadoId = id;

  detalleEconomico.textContent =
    `${servicio.economico} · ${servicio.marca}`;

  contenidoDetalle.innerHTML = `
    <div class="detail-item">

      <span>Fecha de entrada</span>

      <strong>
        ${formatearFecha(
          servicio.fechaEntrada
        )}
      </strong>

    </div>

    <div class="detail-item">

      <span>Estado</span>

      ${crearBadgeEstado(
        servicio.estado
      )}

    </div>

    <div class="detail-item full-width">

      <span>Falla presentada</span>

      <p>
        ${escaparHTML(
          servicio.falla
        )}
      </p>

    </div>

    <div class="detail-item full-width">

      <span>Refacciones utilizadas</span>

      <p>
        ${escaparHTML(
          servicio.refacciones
        )}
      </p>

    </div>

    <div class="detail-item">

      <span>Refaccionaria</span>

      <strong>
        ${escaparHTML(
          servicio.refaccionaria
        )}
      </strong>

    </div>

    <div class="detail-item">

      <span>Garantía</span>

      ${crearBadgeGarantia(
        servicio
      )}

    </div>

    ${
      servicio.garantia === "Sí"
        ? `
          <div class="detail-item">

            <span>
              Inicio de garantía
            </span>

            <strong>
              ${formatearFecha(
                servicio.fechaInicioGarantia
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Tiempo de garantía
            </span>

            <strong>
              ${servicio.tiempoGarantia}
              ${escaparHTML(
                servicio.unidadGarantia
              )}
            </strong>

          </div>

          <div class="detail-item full-width">

            <span>
              Vencimiento de garantía
            </span>

            <strong>
              ${formatearFecha(
                servicio.fechaFinGarantia
              )}
            </strong>

          </div>
        `
        : ""
    }
  `;

  modalDetalle.classList.remove("hidden");
}

function cerrarModal() {
  modalDetalle.classList.add("hidden");
  servicioSeleccionadoId = null;
}

/* ======================================================
   EDITAR
====================================================== */

function editarServicio(id) {
  const servicio = servicios.find(
    (elemento) =>
      elemento.id === id
  );

  if (!servicio) {
    return;
  }

  servicioId.value = servicio.id;
  marca.value = servicio.marca || "";
  economico.value = servicio.economico || "";
  fechaEntrada.value = servicio.fechaEntrada || "";

  estado.value =
    servicio.estado || "En reparación";

  falla.value = servicio.falla || "";
  refacciones.value = servicio.refacciones || "";
  refaccionaria.value = servicio.refaccionaria || "";
  garantia.value = servicio.garantia || "No";

  fechaInicioGarantia.value =
    servicio.fechaInicioGarantia || "";

  tiempoGarantia.value =
    servicio.tiempoGarantia || "";

  unidadGarantia.value =
    servicio.unidadGarantia || "meses";

  fechaFinGarantia.value =
    servicio.fechaFinGarantia || "";

  mostrarCamposGarantia();

  document.getElementById(
    "tituloFormulario"
  ).textContent = "Editar servicio";

  btnGuardar.textContent = "Guardar cambios";

  abrirSeccion("nuevo");
}

/* ======================================================
   ELIMINAR DE FIREBASE
====================================================== */

async function eliminarServicio(id) {
  const servicio = servicios.find(
    (elemento) =>
      elemento.id === id
  );

  if (!servicio) {
    return;
  }

  const confirmar = window.confirm(
    `¿Deseas eliminar el servicio de la unidad ${servicio.economico}?`
  );

  if (!confirmar) {
    return;
  }

  try {
    await remove(
      ref(
        database,
        `mantenimientos/${id}`
      )
    );

    cerrarModal();

    mostrarNotificacion(
      "Registro eliminado",
      "El servicio fue eliminado de Firebase."
    );
  } catch (error) {
    console.error(
      "Error al eliminar:",
      error
    );

    mostrarNotificacion(
      "No se pudo eliminar",
      "Revisa tu conexión y las reglas de Firebase.",
      "error"
    );
  }
}

/* ======================================================
   LIMPIAR FORMULARIO
====================================================== */

function limpiarFormulario() {
  formServicio.reset();
  servicioId.value = "";

  document.getElementById(
    "tituloFormulario"
  ).textContent = "Registrar servicio";

  btnGuardar.textContent = "Guardar servicio";

  seccionGarantia.classList.add("hidden");

  fechaInicioGarantia.required = false;
  tiempoGarantia.required = false;
  fechaFinGarantia.required = false;

  colocarFechaActual();
}

/* ======================================================
   NOTIFICACIONES
====================================================== */

function mostrarNotificacion(
  titulo,
  mensaje,
  tipo = "success"
) {
  const notificacion =
    document.getElementById("notification");

  const icono =
    notificacion.querySelector(
      ".notification-icon"
    );

  document.getElementById(
    "notificationTitle"
  ).textContent = titulo;

  document.getElementById(
    "notificationText"
  ).textContent = mensaje;

  if (tipo === "error") {
    icono.textContent = "!";
    icono.style.color = "#d92d20";
    icono.style.background = "#fef3f2";
  } else {
    icono.textContent = "✓";
    icono.style.color = "#039855";
    icono.style.background = "#ecfdf3";
  }

  notificacion.classList.add("show");

  window.setTimeout(() => {
    notificacion.classList.remove("show");
  }, 3200);
}

/* ======================================================
   FUNCIONES AUXILIARES
====================================================== */

function formatearFecha(fechaTexto) {
  if (!fechaTexto) {
    return "—";
  }

  const fecha = crearFecha(fechaTexto);

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(fecha);
}

function crearFecha(fechaTexto) {
  if (!fechaTexto) {
    return new Date(0);
  }

  const partes = fechaTexto
    .split("-")
    .map(Number);

  return new Date(
    partes[0],
    partes[1] - 1,
    partes[2],
    12,
    0,
    0
  );
}

function inicioDelDia(fecha) {
  const nuevaFecha = new Date(fecha);

  nuevaFecha.setHours(0, 0, 0, 0);

  return nuevaFecha;
}

function convertirFechaInput(fecha) {
  const anio = fecha.getFullYear();

  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function escaparHTML(texto) {
  const elemento =
    document.createElement("div");

  elemento.textContent = texto || "";

  return elemento.innerHTML;
}
