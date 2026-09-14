// ========================================
// ELITE EVENTS - SCRIPT.JS
// ========================================


// ========================================
// REGISTRO DE USUARIO
// ========================================

const formularioRegistro =
    document.getElementById("formRegistro");

if (formularioRegistro) {

    formularioRegistro.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const nombre =
                document.getElementById("nombreRegistro")
                    .value.trim();

            const apellido =
                document.getElementById("apellidoRegistro")
                    .value.trim();

            const correo =
                document.getElementById("correoRegistro")
                    .value.trim();

            const password =
                document.getElementById("passwordRegistro")
                    .value;

            const mensaje =
                document.getElementById("mensajeRegistro");

            mensaje.textContent =
                "Registrando usuario...";

            try {

                const respuesta = await fetch(
                    "/api/usuarios/registro",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            nombre: nombre,
                            apellido: apellido,
                            correo: correo,
                            password: password
                        })
                    }
                );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    mensaje.textContent =
                        "❌ " + datos.mensaje;

                    return;
                }

                mensaje.textContent =
                    "✅ " + datos.mensaje;

                formularioRegistro.reset();

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 1500);

            } catch (error) {

                console.error(error);

                mensaje.textContent =
                    "❌ No se pudo conectar con el servidor.";
            }
        }
    );
}


// ========================================
// INICIAR SESIÓN
// ========================================

const formularioLogin =
    document.getElementById("formLogin");

if (formularioLogin) {

    formularioLogin.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const correo =
                document.getElementById("correoLogin")
                    .value.trim();

            const password =
                document.getElementById("passwordLogin")
                    .value;

            const mensaje =
                document.getElementById("mensajeLogin");

            mensaje.textContent =
                "Iniciando sesión...";

            try {

                const respuesta = await fetch(
                    "/api/usuarios/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            correo: correo,
                            password: password
                        })
                    }
                );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    mensaje.textContent =
                        "❌ " + datos.mensaje;

                    return;
                }

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(datos.usuario)
                );

                mensaje.textContent =
                    "✅ Inicio de sesión correcto";

                setTimeout(function () {

                    window.location.href =
                        "eventos.html";

                }, 1000);

            } catch (error) {

                console.error(error);

                mensaje.textContent =
                    "❌ No se pudo conectar con el servidor.";
            }
        }
    );
}


// ========================================
// RESERVAR EVENTO
// ========================================

async function reservar(eventoId) {

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );

    if (!usuario) {

        alert(
            "⚠️ Primero debes iniciar sesión."
        );

        window.location.href =
            "login.html";

        return;
    }

    if (!usuario.id) {

        alert(
            "❌ No se encontró el ID del usuario."
        );

        return;
    }

    try {

        const respuesta =
            await fetch(
                "/api/reservas",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuarioId:
                            usuario.id,

                        eventoId:
                            eventoId
                    })
                }
            );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            console.error(
                "Error:",
                datos
            );

            alert(
                "❌ " +
                (
                    datos.mensaje ||
                    "Error al guardar reserva"
                )
            );

            return;
        }

        alert(
            "🎟️ ¡Reserva guardada correctamente!"
        );

        window.location.href =
            "reservas.html";

    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );
    }
}


// ========================================
// MOSTRAR RESERVAS
// ========================================

async function mostrarReservas() {

    const contenedor =
        document.getElementById("listaReservas");

    if (!contenedor) {
        return;
    }

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );

    if (!usuario) {

        contenedor.innerHTML = `
            <div class="reserva-vacia">

                <h2>🔐 Inicia sesión</h2>

                <p>
                    Debes iniciar sesión
                    para ver tus reservas.
                </p>

                <a href="login.html"
                   class="btn-principal">

                    Iniciar sesión

                </a>

            </div>
        `;

        return;
    }

    if (!usuario.id) {

        contenedor.innerHTML = `
            <p>
                ❌ No se encontró el ID del usuario.
            </p>
        `;

        console.error(
            "Usuario sin ID:",
            usuario
        );

        return;
    }

    contenedor.innerHTML =
        "<p>🔄 Cargando reservas...</p>";

    try {

        const respuesta = await fetch(
            "/api/reservas/usuario/" +
            usuario.id
        );

        const reservas =
            await respuesta.json();

        if (!respuesta.ok) {

            contenedor.innerHTML = `
                <p>
                    ❌ No se pudieron cargar las reservas.
                </p>
            `;

            return;
        }

        if (
            !Array.isArray(reservas) ||
            reservas.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="reserva-vacia">

                    <h2>🎟️ No tienes reservas</h2>

                    <p>
                        Todavía no has reservado
                        ningún evento.
                    </p>

                    <a href="eventos.html"
                       class="btn-principal">

                        Ver eventos

                    </a>

                </div>
            `;

            return;
        }

        contenedor.innerHTML = "";

        reservas.forEach(function (reserva) {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "tarjeta-evento";

            tarjeta.innerHTML = `

                <div class="icono-evento">
                    🎟️
                </div>

                <div>

                    <h2>
                        ${reserva.evento}
                    </h2>

                    <p>
                        <strong>Reserva #:</strong>
                        ${reserva.id}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${
                            reserva.fecha_reserva ||
                            reserva.fecha ||
                            "Sin fecha"
                        }
                    </p>

                </div>
            `;

            contenedor.appendChild(
                tarjeta
            );

        });

    } catch (error) {

        console.error(
            "Error al obtener reservas:",
            error
        );

        contenedor.innerHTML = `
            <p>
                ❌ Error al conectar con el servidor.
            </p>
        `;
    }
}


// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {

    localStorage.removeItem(
        "usuario"
    );

    localStorage.removeItem(
        "usuarioActual"
    );

    alert(
        "👋 Sesión cerrada correctamente."
    );

    window.location.href =
        "index.html";
}


// ========================================
// MOSTRAR USUARIO
// ========================================

function mostrarUsuario() {

    const elemento =
        document.getElementById(
            "usuarioActual"
        );

    if (!elemento) {
        return;
    }

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );

    if (!usuario) {

        elemento.textContent =
            "No has iniciado sesión.";

        return;
    }

    elemento.textContent =
        "👤 " +
        (
            usuario.nombre ||
            usuario.correo
        );
}


// ========================================
// EJECUTAR AL CARGAR LA PÁGINA
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostrarReservas();

        mostrarUsuario();

    }
);


// ========================================
// CREAR EVENTO
// ========================================

const formularioEvento =
    document.getElementById("formEvento");

if (formularioEvento) {

    formularioEvento.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const mensaje =
                document.getElementById(
                    "mensajeEvento"
                );

            const nombre =
                document.getElementById(
                    "nombreEvento"
                ).value.trim();

            const categoria =
                document.getElementById(
                    "categoriaEvento"
                ).value;

            const descripcion =
                document.getElementById(
                    "descripcionEvento"
                ).value.trim();

            const fecha =
                document.getElementById(
                    "fechaEvento"
                ).value;

            const hora =
                document.getElementById(
                    "horaEvento"
                ).value;

            const lugar =
                document.getElementById(
                    "lugarEvento"
                ).value.trim();

            const precio =
                document.getElementById(
                    "precioEvento"
                ).value;

            const archivoImagen =
                document.getElementById(
                    "imagenEvento"
                ).files[0];
            const usuario =
            JSON.parse(
                localStorage.getItem("usuario")
            );

            mensaje.textContent =
                "Guardando evento...";

            try {

                const formularioDatos =
                    new FormData();

                formularioDatos.append(
                    "nombre",
                    nombre
                );

                formularioDatos.append(
                    "categoria",
                    categoria
                );

                formularioDatos.append(
                    "descripcion",
                    descripcion
                );

                formularioDatos.append(
                    "fecha",
                    fecha
                );

                formularioDatos.append(
                    "hora",
                    hora
                );

                formularioDatos.append(
                    "lugar",
                    lugar
                );

                formularioDatos.append(
                    "precio",
                    precio
                );
                formularioDatos.append(
                    "creado_por",
                    usuario.id
                );

                if (archivoImagen) {

                    formularioDatos.append(
                        "imagen",
                        archivoImagen
                    );
                }

                const respuesta =
                    await fetch(
                        "/api/eventos",
                        {
                            method: "POST",
                            body: formularioDatos
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    mensaje.textContent =
                        "❌ " +
                        (
                            datos.mensaje ||
                            "No se pudo guardar el evento."
                        );

                    return;
                }

                mensaje.innerHTML =
                    "🎉 <strong>¡Evento guardado correctamente!</strong>";

                formularioEvento.reset();

            } catch (error) {

                console.error(
                    "ERROR:",
                    error
                );

                mensaje.textContent =
                    "❌ Error al guardar el evento.";
            }

        }
    );
}


// ========================================
// MOSTRAR EVENTOS
// ========================================

const listaEventos =
    document.getElementById(
        "listaEventos"
    );

if (listaEventos) {

    cargarEventos();
}


async function cargarEventos() {

    try {

        const respuesta =
            await fetch(
                "/api/eventos"
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los eventos"
            );
        }

        const eventos =
            await respuesta.json();

        listaEventos.innerHTML =
            "";

        if (
            !Array.isArray(eventos) ||
            eventos.length === 0
        ) {

            listaEventos.innerHTML = `
                <p>
                    No hay eventos disponibles.
                </p>
            `;

            return;
        }

        eventos.forEach(
            function(evento) {

                const tarjeta =
                    document.createElement(
                        "div"
                    );

                tarjeta.classList.add(
                    "tarjeta-evento"
                );

                tarjeta.innerHTML = `

                    ${
                        evento.imagen
                        ? `
                            <div class="imagen-evento">

                                <img
                                    src="/uploads/${evento.imagen}"
                                    alt="${evento.nombre}"
                                >

                            </div>
                        `
                        : ""
                    }

                    <div class="contenido-evento">

                        <h2>
                            ${evento.nombre}
                        </h2>

                        <p>
                            <strong>Categoría:</strong>
                            ${evento.categoria || "Sin categoría"}
                        </p>

                        <p>
                            <strong>Fecha:</strong>
                            ${evento.fecha || "Sin fecha"}
                        </p>

                        <p>
                            <strong>Hora:</strong>
                            ${evento.hora || "Sin hora"}
                        </p>

                        <p>
                            <strong>Lugar:</strong>
                            ${evento.lugar || "Sin lugar"}
                        </p>

                        <p>
                            <strong>Precio:</strong>
                            $${evento.precio || 0}
                        </p>

                        <p>
                            ${evento.descripcion || "Sin descripción"}
                        </p>

                        <button
                            class="btn-principal"
                            onclick="reservar(${evento.id})"
                        >
                            🎟️ Reservar
                        </button>

                    </div>
                `;

                listaEventos.appendChild(
                    tarjeta
                );

            }
        );

    } catch (error) {

        console.error(
            "Error al cargar eventos:",
            error
        );

        listaEventos.innerHTML = `
            <p>
                ❌ Error al cargar los eventos.
            </p>
        `;
    }
}
                