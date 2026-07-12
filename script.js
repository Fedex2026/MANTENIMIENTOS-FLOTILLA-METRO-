const STORAGE_KEY = "mantenimientoFlotilla";

let servicios = obtenerServicios();
let servicioSeleccionadoId = null;
let filtroGarantiasActual = "todas";

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

const seccionGarantia = document.getElementById("seccionGarantia");
const fechaInicioGarantia = document.getElementById(
  "fechaInicioGarantia"
);
const tiempoGarantia = document.getElementById("tiempoGarantia");
const unidadGarantia = document.getElementById("unidadGarantia");
const fechaFinGarantia = document.getElementById(
  "fechaFinGarantia"
);

const tablaRecientes = document.getElementById("tablaRecientes");
const tablaHistorial = document.getElementById("tablaHistorial");
const listaGarantias = document.getElementById("listaGarantias");

const sinRecientes = document.getElementById("sinRecientes");
const sinHistorial = document.getElementById("sinHistorial");
const sinGarantias = document.getElementById("sinGarantias");

const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtroEstado");
const filtroGarantia = document.getElementById("filtroGarantia");

const modalDetalle = document.getElementById("modalDetalle");
const detalleEconomico = document.getElementById(
  "detalleEconomico"
);
const contenidoDetalle = document.getElementById(
  "contenidoDetalle"
);

document.addEventListener("DOMContentLoaded", () => {
  colocarFechaActual();
  actualizarTodo();
});

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
    boton.addEventListener("click", prepararNuevoServicio);
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

garantia.addEventListener("change", mostrarCamposGarantia);

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

formServicio.addEventListener("submit", guardarServicio);

buscador.addEventListener("input", renderizarHistorial);
filtroEstado.addEventListener("change", renderizarHistorial);
filtroGarantia.addEventListener("change", renderizarHistorial);

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
      filtroGarantiasActual = boton.dataset.warrantyFilter;

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
    if (!servicioSeleccionadoId) return;

    cerrarModal();
    editarServicio(servicioSeleccionadoId);
  });

document
  .getElementById("btnEliminarDetalle")
  .addEventListener("click", () => {
    if (!servicioSeleccionadoId) return;

    eliminarServicio(servicioSeleccionadoId);
  });

function obtenerServicios() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);

    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error("No se pudieron cargar los registros:", error);
    return [];
  }
}

function guardarEnLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios));
}

function abrirSeccion(nombreSeccion) {
  secciones.forEach((seccion) => {
    seccion.classList.remove("active-section");
  });

  menuItems.forEach((item) => {
    item.classList.remove("active");
  });

  const seccionSeleccionada = document.getElementById(
    nombreSeccion
  );

  const menuSeleccionado = document.querySelector(
    `[data-section="${nombreSeccion}"]`
  );

  if (seccionSeleccionada) {
    seccionSeleccionada.classList.add("active-section");
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
  abrirSeccion("nuevo");

  document.getElementById("tituloFormulario").textContent =
    "Registrar servicio";

  document.getElementById("btnGuardar").textContent =
    "Guardar servicio";
}

function colocarFechaActual() {
  if (!fechaEntrada.value) {
    fechaEntrada.value = obtenerFechaLocal();
  }
}

function obtenerFechaLocal() {
  const fecha = new Date();
  const desplazamiento = fecha.getTimezoneOffset() * 60000;

  return new Date(fecha.getTime() - desplazamiento)
    .toISOString()
    .split("T")[0];
}

function mostrarCamposGarantia() {
  const tieneGarantia = garantia.value === "Sí";

  seccionGarantia.classList.toggle("hidden", !tieneGarantia);

  fechaInicioGarantia.required = tieneGarantia;
  tiempoGarantia.required = tieneGarantia;
  fechaFinGarantia.required = tieneGarantia;

  if (tieneGarantia && !fechaInicioGarantia.value) {
    fechaInicioGarantia.value =
      fechaEntrada.value || obtenerFechaLocal();
  }

  if (!tieneGarantia) {
    fechaInicioGarantia.value = "";
    tiempoGarantia.value = "";
    fechaFinGarantia.value = "";
  }
}

function calcularVencimientoGarantia() {
  const fechaInicio = fechaInicioGarantia.value;
  const cantidad = Number(tiempoGarantia.value);
  const unidad = unidadGarantia.value;

  if (!fechaInicio || !cantidad || cantidad <= 0) {
    fechaFinGarantia.value = "";
    return;
  }

  const fecha = crearFecha(fechaInicio);

  if (unidad === "días") {
    fecha.setDate(fecha.getDate() + cantidad);
  }

  if (unidad === "meses") {
    fecha.setMonth(fecha.getMonth() + cantidad);
  }

  if (unidad === "años") {
    fecha.setFullYear(fecha.getFullYear() + cantidad);
  }

  fechaFinGarantia.value = convertirFechaInput(fecha);
}

function guardarServicio(evento) {
  evento.preventDefault();

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

  const registro = {
    id: servicioId.value || generarId(),
    marca: marca.value.trim(),
    economico: economico.value.trim().toUpperCase(),
    fechaEntrada: fechaEntrada.value,
    estado: estado.value,
    falla: falla.value.trim(),
    refacciones: refacciones.value.trim(),
    refaccionaria: refaccionaria.value.trim(),
    garantia: garantia.value,
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
    fechaRegistro: new Date().toISOString()
  };

  const indiceExistente = servicios.findIndex(
    (servicio) => servicio.id === registro.id
  );

  if (indiceExistente >= 0) {
    registro.fechaRegistro =
      servicios[indiceExistente].fechaRegistro;

    servicios[indiceExistente] = registro;

    mostrarNotificacion(
      "Servicio actualizado",
      "Los cambios se guardaron correctamente."
    );
  } else {
    servicios.unshift(registro);

    mostrarNotificacion(
      "Servicio registrado",
      "El mantenimiento se guardó correctamente."
    );
  }

  guardarEnLocalStorage();
  actualizarTodo();
  limpiarFormulario();
  abrirSeccion("historial");
}

function generarId() {
  return `SRV-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
}

function actualizarTodo() {
  actualizarResumen();
  renderizarRecientes();
  renderizarHistorial();
  renderizarGarantias();
}

function actualizarResumen() {
  const hoy = inicioDelDia(new Date());

  const serviciosEnReparacion = servicios.filter(
    (servicio) => servicio.estado === "En reparación"
  );

  const serviciosConGarantia = servicios.filter(
    (servicio) => servicio.garantia === "Sí"
  );

  const vencidas = serviciosConGarantia.filter((servicio) => {
    if (!servicio.fechaFinGarantia) return false;

    return crearFecha(servicio.fechaFinGarantia) < hoy;
  });

  document.getElementById("totalServicios").textContent =
    servicios.length;

  document.getElementById("totalReparacion").textContent =
    serviciosEnReparacion.length;

  document.getElementById("totalGarantias").textContent =
    serviciosConGarantia.length;

  document.getElementById("garantiasVencidas").textContent =
    vencidas.length;
}

function renderizarRecientes() {
  tablaRecientes.innerHTML = "";

  const recientes = [...servicios]
    .sort(
      (a, b) =>
        new Date(b.fechaRegistro) -
        new Date(a.fechaRegistro)
    )
    .slice(0, 6);

  sinRecientes.style.display =
    recientes.length === 0 ? "block" : "none";

  if (recientes.length === 0) return;

  recientes.forEach((servicio) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${formatearFecha(servicio.fechaEntrada)}</td>

      <td>
        <button
          class="economic-link"
          onclick="verDetalle('${servicio.id}')"
        >
          ${escaparHTML(servicio.economico)}
        </button>
      </td>

      <td>${escaparHTML(servicio.marca)}</td>

      <td class="cell-ellipsis">
        ${escaparHTML(servicio.falla)}
      </td>

      <td>
        ${escaparHTML(servicio.refaccionaria)}
      </td>

      <td>
        ${crearBadgeGarantia(servicio)}
      </td>

      <td>
        ${crearBadgeEstado(servicio.estado)}
      </td>
    `;

    tablaRecientes.appendChild(fila);
  });
}

function renderizarHistorial() {
  tablaHistorial.innerHTML = "";

  const textoBusqueda = buscador.value
    .trim()
    .toLowerCase();

  const estadoSeleccionado = filtroEstado.value;
  const garantiaSeleccionada = filtroGarantia.value;

  const resultados = servicios.filter((servicio) => {
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
      textoCompleto.includes(textoBusqueda);

    const coincideEstado =
      !estadoSeleccionado ||
      servicio.estado === estadoSeleccionado;

    const coincideGarantia =
      !garantiaSeleccionada ||
      servicio.garantia === garantiaSeleccionada;

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideGarantia
    );
  });

  sinHistorial.style.display =
    resultados.length === 0 ? "block" : "none";

  if (resultados.length === 0) return;

  resultados.forEach((servicio) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${formatearFecha(servicio.fechaEntrada)}</td>

      <td class="economic-number">
        ${escaparHTML(servicio.economico)}
      </td>

      <td>${escaparHTML(servicio.marca)}</td>

      <td class="cell-ellipsis">
        ${escaparHTML(servicio.falla)}
      </td>

      <td class="cell-ellipsis">
        ${escaparHTML(servicio.refacciones)}
      </td>

      <td>
        ${escaparHTML(servicio.refaccionaria)}
      </td>

      <td>
        ${crearBadgeGarantia(servicio)}
      </td>

      <td>
        ${
          servicio.fechaFinGarantia
            ? formatearFecha(servicio.fechaFinGarantia)
            : "—"
        }
      </td>

      <td>
        ${crearBadgeEstado(servicio.estado)}
      </td>

      <td>
        <div class="action-buttons">

          <button
            class="icon-button"
            title="Ver detalle"
            onclick="verDetalle('${servicio.id}')"
          >
            👁
          </button>

          <button
            class="icon-button"
            title="Editar"
            onclick="editarServicio('${servicio.id}')"
          >
            ✎
          </button>

          <button
            class="icon-button delete"
            title="Eliminar"
            onclick="eliminarServicio('${servicio.id}')"
          >
            🗑
          </button>

        </div>
      </td>
    `;

    tablaHistorial.appendChild(fila);
  });
}

function renderizarGarantias() {
  listaGarantias.innerHTML = "";

  let registros = servicios.filter(
    (servicio) => servicio.garantia === "Sí"
  );

  registros = registros.filter((servicio) => {
    if (filtroGarantiasActual === "todas") return true;

    return (
      obtenerEstadoGarantia(servicio) ===
      filtroGarantiasActual
    );
  });

  sinGarantias.style.display =
    registros.length === 0 ? "block" : "none";

  if (registros.length === 0) return;

  registros
    .sort(
      (a, b) =>
        crearFecha(a.fechaFinGarantia) -
        crearFecha(b.fechaFinGarantia)
    )
    .forEach((servicio) => {
      const estadoGarantia =
        obtenerEstadoGarantia(servicio);

      const tarjeta = document.createElement("article");
      tarjeta.className = "warranty-card";

      tarjeta.innerHTML = `
        <div class="warranty-card-header">

          <div>
            <h3>${escaparHTML(servicio.economico)}</h3>

            <p>
              ${escaparHTML(servicio.marca)}
              ·
              ${escaparHTML(servicio.refaccionaria)}
            </p>
          </div>

          ${crearBadgeEstadoGarantia(estadoGarantia)}

        </div>

        <div class="warranty-information">

          <div>
            <span>Refacciones</span>
            <strong>
              ${escaparHTML(servicio.refacciones)}
            </strong>
          </div>

          <div>
            <span>Tiempo</span>
            <strong>
              ${servicio.tiempoGarantia}
              ${escaparHTML(servicio.unidadGarantia)}
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
            onclick="verDetalle('${servicio.id}')"
          >
            Ver detalle
          </button>

        </div>
      `;

      listaGarantias.appendChild(tarjeta);
    });
}

function crearBadgeEstado(estadoServicio) {
  if (estadoServicio === "Terminado") {
    return `<span class="badge green">Terminado</span>`;
  }

  if (estadoServicio === "En reparación") {
    return `<span class="badge orange">En reparación</span>`;
  }

  return `<span class="badge gray">Pendiente</span>`;
}

function crearBadgeGarantia(servicio) {
  if (servicio.garantia !== "Sí") {
    return `<span class="badge gray">Sin garantía</span>`;
  }

  const estadoGarantia = obtenerEstadoGarantia(servicio);

  if (estadoGarantia === "vencida") {
    return `<span class="badge red">Vencida</span>`;
  }

  if (estadoGarantia === "por-vencer") {
    return `<span class="badge orange">Por vencer</span>`;
  }

  return `<span class="badge green">Vigente</span>`;
}

function crearBadgeEstadoGarantia(estadoGarantia) {
  if (estadoGarantia === "vencida") {
    return `<span class="badge red">Vencida</span>`;
  }

  if (estadoGarantia === "por-vencer") {
    return `<span class="badge orange">Por vencer</span>`;
  }

  return `<span class="badge green">Vigente</span>`;
}

function obtenerEstadoGarantia(servicio) {
  if (!servicio.fechaFinGarantia) return "vencida";

  const hoy = inicioDelDia(new Date());
  const vencimiento = crearFecha(servicio.fechaFinGarantia);

  const diferenciaMilisegundos =
    vencimiento.getTime() - hoy.getTime();

  const diasRestantes = Math.ceil(
    diferenciaMilisegundos / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) {
    return "vencida";
  }

  if (diasRestantes <= 30) {
    return "por-vencer";
  }

  return "vigente";
}

function verDetalle(id) {
  const servicio = servicios.find(
    (elemento) => elemento.id === id
  );

  if (!servicio) return;

  servicioSeleccionadoId = id;

  detalleEconomico.textContent =
    `${servicio.economico} · ${servicio.marca}`;

  contenidoDetalle.innerHTML = `
    <div class="detail-item">

      <span>Fecha de entrada</span>

      <strong>
        ${formatearFecha(servicio.fechaEntrada)}
      </strong>

    </div>

    <div class="detail-item">

      <span>Estado</span>

      ${crearBadgeEstado(servicio.estado)}

    </div>

    <div class="detail-item full-width">

      <span>Falla presentada</span>

      <p>${escaparHTML(servicio.falla)}</p>

    </div>

    <div class="detail-item full-width">

      <span>Refacciones utilizadas</span>

      <p>${escaparHTML(servicio.refacciones)}</p>

    </div>

    <div class="detail-item">

      <span>Refaccionaria</span>

      <strong>
        ${escaparHTML(servicio.refaccionaria)}
      </strong>

    </div>

    <div class="detail-item">

      <span>Garantía</span>

      ${crearBadgeGarantia(servicio)}

    </div>

    ${
      servicio.garantia === "Sí"
        ? `
          <div class="detail-item">

            <span>Inicio de garantía</span>

            <strong>
              ${formatearFecha(
                servicio.fechaInicioGarantia
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>Tiempo de garantía</span>

            <strong>
              ${servicio.tiempoGarantia}
              ${escaparHTML(servicio.unidadGarantia)}
            </strong>

          </div>

          <div class="detail-item full-width">

            <span>Vencimiento de garantía</span>

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

function editarServicio(id) {
  const servicio = servicios.find(
    (elemento) => elemento.id === id
  );

  if (!servicio) return;

  servicioId.value = servicio.id;
  marca.value = servicio.marca;
  economico.value = servicio.economico;
  fechaEntrada.value = servicio.fechaEntrada;
  estado.value = servicio.estado;
  falla.value = servicio.falla;
  refacciones.value = servicio.refacciones;
  refaccionaria.value = servicio.refaccionaria;
  garantia.value = servicio.garantia;

  fechaInicioGarantia.value =
    servicio.fechaInicioGarantia || "";

  tiempoGarantia.value =
    servicio.tiempoGarantia || "";

  unidadGarantia.value =
    servicio.unidadGarantia || "meses";

  fechaFinGarantia.value =
    servicio.fechaFinGarantia || "";

  mostrarCamposGarantia();

  document.getElementById("tituloFormulario").textContent =
    "Editar servicio";

  document.getElementById("btnGuardar").textContent =
    "Guardar cambios";

  abrirSeccion("nuevo");
}

function eliminarServicio(id) {
  const servicio = servicios.find(
    (elemento) => elemento.id === id
  );

  if (!servicio) return;

  const confirmar = window.confirm(
    `¿Deseas eliminar el servicio de la unidad ${servicio.economico}?`
  );

  if (!confirmar) return;

  servicios = servicios.filter(
    (elemento) => elemento.id !== id
  );

  guardarEnLocalStorage();
  actualizarTodo();
  cerrarModal();

  mostrarNotificacion(
    "Registro eliminado",
    "El servicio se eliminó correctamente."
  );
}

function limpiarFormulario() {
  formServicio.reset();
  servicioId.value = "";

  document.getElementById("tituloFormulario").textContent =
    "Registrar servicio";

  document.getElementById("btnGuardar").textContent =
    "Guardar servicio";

  seccionGarantia.classList.add("hidden");

  fechaInicioGarantia.required = false;
  tiempoGarantia.required = false;
  fechaFinGarantia.required = false;

  colocarFechaActual();
}

function mostrarNotificacion(
  titulo,
  mensaje,
  tipo = "success"
) {
  const notificacion =
    document.getElementById("notification");

  const icono = notificacion.querySelector(
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

  setTimeout(() => {
    notificacion.classList.remove("show");
  }, 3200);
}

function formatearFecha(fechaTexto) {
  if (!fechaTexto) return "—";

  const fecha = crearFecha(fechaTexto);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(fecha);
}

function crearFecha(fechaTexto) {
  const partes = fechaTexto.split("-").map(Number);

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
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = texto || "";

  return elemento.innerHTML;
}

/*
  Se agregan las funciones al objeto window para que
  funcionen los botones creados dinámicamente en las tablas.
*/

window.verDetalle = verDetalle;
window.editarServicio = editarServicio;
window.eliminarServicio = eliminarServicio;
