const adminUsuario = JSON.parse(localStorage.getItem("usuario") || "null");
const adminToken = localStorage.getItem("tokenAdministrador");

if (!adminUsuario || adminUsuario.rol !== "admin" || !adminToken) {
    window.location.replace("login.html");
} else {
    inicializarPanelAdministrador();
}

function escaparAdmin(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function fechaAdmin(valor) {
    return valor ? String(valor).slice(0, 10) : "Sin fecha";
}

async function solicitarAdmin(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            ...(opciones.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${adminToken}`,
            ...(opciones.headers || {})
        }
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("tokenAdministrador");
            window.location.replace("login.html");
        }
        throw new Error(datos.mensaje || "No se pudo completar la solicitud.");
    }
    return datos;
}

function inicializarPanelAdministrador() {
    const mensaje = document.getElementById("mensajeAdmin");
    document.getElementById("saludoAdmin").textContent = `Sesión de ${adminUsuario.nombre || adminUsuario.correo}`;

    document.querySelectorAll(".admin-tab").forEach((boton) => {
        boton.addEventListener("click", () => {
            document.querySelectorAll(".admin-tab").forEach((item) => item.classList.toggle("activo", item === boton));
            document.querySelectorAll(".admin-panel-seccion").forEach((panel) => {
                panel.hidden = panel.id !== boton.dataset.panel;
            });
            if (boton.dataset.panel === "usuariosAdmin") cargarUsuariosAdmin();
            if (boton.dataset.panel === "reservasAdmin") cargarReservasAdmin();
        });
    });

    document.getElementById("salirAdmin").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("tokenAdministrador");
        window.location.replace("index.html");
    });

    document.getElementById("recargarEventos").addEventListener("click", cargarEventosAdmin);
    document.getElementById("cancelarEdicionAdmin").addEventListener("click", () => {
        document.getElementById("formularioEdicionAdmin").hidden = true;
    });

    document.getElementById("formEventoAdmin").addEventListener("submit", async (event) => {
        event.preventDefault();
        const id = document.getElementById("eventoAdminId").value;
        const formulario = new FormData(event.currentTarget);
        try {
            await solicitarAdmin(`/api/eventos/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: formulario
            });
            mensaje.textContent = "Evento actualizado.";
            document.getElementById("formularioEdicionAdmin").hidden = true;
            event.currentTarget.reset();
            await cargarEventosAdmin();
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });

    cargarEventosAdmin();

    async function cargarEventosAdmin() {
        try {
            const eventos = await solicitarAdmin("/api/admin/eventos");
            const cuerpo = document.getElementById("filasEventosAdmin");
            cuerpo.replaceChildren();
            eventos.forEach((evento) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${escaparAdmin(evento.nombre)}<small>${escaparAdmin(evento.categoria)}</small></td>
                    <td>${escaparAdmin(fechaAdmin(evento.fecha))}</td>
                    <td>${escaparAdmin(evento.lugar)}</td>
                    <td>$${Number(evento.precio || 0).toLocaleString("es-CO")}</td>
                    <td>${Number(evento.boletas_disponibles || 0)}</td>
                    <td class="admin-acciones"><button type="button" class="admin-secondary" data-editar="${Number(evento.id)}">Editar</button><button type="button" class="admin-danger" data-eliminar="${Number(evento.id)}">Retirar del sitio</button></td>
                `;
                cuerpo.appendChild(fila);
                fila.querySelector("[data-editar]").addEventListener("click", () => editarEvento(evento));
                fila.querySelector("[data-eliminar]").addEventListener("click", () => eliminarEvento(evento));
            });
            if (!eventos.length) cuerpo.innerHTML = '<tr><td colspan="6">No hay eventos publicados.</td></tr>';
        } catch (error) {
            mensaje.textContent = error.message;
        }
    }

    function editarEvento(evento) {
        document.getElementById("eventoAdminId").value = evento.id;
        document.getElementById("nombreAdmin").value = evento.nombre || "";
        document.getElementById("categoriaAdmin").value = evento.categoria || "";
        document.getElementById("fechaAdmin").value = fechaAdmin(evento.fecha) === "Sin fecha" ? "" : fechaAdmin(evento.fecha);
        document.getElementById("horaAdmin").value = String(evento.hora || "").slice(0, 5);
        document.getElementById("lugarAdmin").value = evento.lugar || "";
        document.getElementById("precioAdmin").value = Number(evento.precio || 0);
        document.getElementById("boletasAdmin").value = Number(evento.boletas_disponibles || 0);
        document.getElementById("descripcionAdmin").value = evento.descripcion || "";
        document.getElementById("imagenAdmin").value = "";
        document.getElementById("formularioEdicionAdmin").hidden = false;
        document.getElementById("formularioEdicionAdmin").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function eliminarEvento(evento) {
        if (!window.confirm(`¿Retirar “${evento.nombre}” del sitio? Las reservas existentes se conservarán.`)) return;
        try {
            await solicitarAdmin(`/api/eventos/${encodeURIComponent(evento.id)}`, { method: "DELETE" });
            mensaje.textContent = "Evento retirado del sitio; las reservas históricas se conservaron.";
            await cargarEventosAdmin();
        } catch (error) {
            mensaje.textContent = error.message;
        }
    }

    async function cargarUsuariosAdmin() {
        const cuerpo = document.getElementById("filasUsuariosAdmin");
        try {
            const usuarios = await solicitarAdmin("/api/admin/usuarios");
            cuerpo.replaceChildren();
            usuarios.forEach((usuario) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `<td>${escaparAdmin(`${usuario.nombre || ""} ${usuario.apellido || ""}`.trim())}</td><td>${escaparAdmin(usuario.correo)}</td><td>${escaparAdmin(usuario.rol)}</td><td>${escaparAdmin(fechaAdmin(usuario.fecha_registro))}</td>`;
                cuerpo.appendChild(fila);
            });
            if (!usuarios.length) cuerpo.innerHTML = '<tr><td colspan="4">No hay perfiles registrados.</td></tr>';
        } catch (error) {
            mensaje.textContent = error.message;
        }
    }

    async function cargarReservasAdmin() {
        const cuerpo = document.getElementById("filasReservasAdmin");
        try {
            const reservas = await solicitarAdmin("/api/admin/reservas");
            cuerpo.replaceChildren();
            reservas.forEach((reserva) => {
                const fila = document.createElement("tr");
                const nombre = `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim();
                fila.innerHTML = `<td>#${Number(reserva.id)}</td><td>${escaparAdmin(nombre)}<small>${escaparAdmin(reserva.correo)}</small></td><td>${escaparAdmin(reserva.evento)}<small>${escaparAdmin(fechaAdmin(reserva.fecha_evento))} · ${escaparAdmin(reserva.lugar)}</small></td><td>${Number(reserva.cantidad || 0)}</td><td>$${Number(reserva.total || 0).toLocaleString("es-CO")}</td><td>${escaparAdmin(reserva.estado || "demo")}</td><td>${escaparAdmin(fechaAdmin(reserva.fecha_reserva))}</td>`;
                cuerpo.appendChild(fila);
            });
            if (!reservas.length) cuerpo.innerHTML = '<tr><td colspan="7">Aún no hay reservas.</td></tr>';
        } catch (error) {
            mensaje.textContent = error.message;
        }
    }
}
