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
                        datos.mensaje ||
                        "No se pudo registrar el usuario.";

                    return;
                }

                mensaje.textContent =
                    datos.mensaje ||
                    "Usuario registrado correctamente.";

                formularioRegistro.reset();

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 1500);

            } catch (error) {

                console.error(
                    "Error en registro:",
                    error
                );

                mensaje.textContent =
                    "No se pudo conectar con el servidor.";
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
                            "Content-Type":
                                "application/json"
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
                        datos.mensaje ||
                        "Correo o contraseña incorrectos.";

                    return;
                }

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(datos.usuario)
                );

                // Eliminar datos antiguos para evitar conflictos
                localStorage.removeItem("usuarioActual");

                mensaje.textContent =
                    "Inicio de sesión correcto.";

                setTimeout(function () {

                    window.location.href =
                        "eventos.html";

                }, 1000);

            } catch (error) {

                console.error(
                    "Error en login:",
                    error
                );

                mensaje.textContent =
                    "No se pudo conectar con el servidor.";
            }
        }
    );
}


// ========================================
// RESERVAR EVENTO
// ========================================

async function reservar(eventoId) {

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    if (!usuario) {

        mostrarNotificacion(
            "Primero debes iniciar sesión.",
            "error"
        );

        setTimeout(function () {

            window.location.href =
                "login.html";

        }, 1500);

        return;
    }

    if (!usuario.id) {

        mostrarNotificacion(
            "No se encontró el ID del usuario.",
            "error"
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
                "Error al reservar:",
                datos
            );

            mostrarNotificacion(
                datos.mensaje ||
                "Error al guardar la reserva.",
                "error"
            );

            return;
        }

        mostrarNotificacion(
            "¡Reserva guardada correctamente!",
            "success"
        );

        setTimeout(function () {

            window.location.href =
                "reservas.html";

        }, 2000);

    } catch (error) {

        console.error(
            "Error al reservar:",
            error
        );

        mostrarNotificacion(
            "No se pudo conectar con el servidor.",
            "error"
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

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    if (!usuario) {

        contenedor.innerHTML = `

            <div class="reserva-vacia">

                <h2>Inicia sesión</h2>

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
                No se encontró el ID del usuario.
            </p>

        `;

        console.error(
            "Usuario sin ID:",
            usuario
        );

        return;
    }

    contenedor.innerHTML =
        "<p>Cargando reservas...</p>";

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
                    No se pudieron cargar las reservas.
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

                    <h2>No tienes reservas</h2>

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
                </div>

                <div>

                    <h2>
                        ${reserva.evento || "Evento"}
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
                Error al conectar con el servidor.
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

    mostrarNotificacion(
        "Sesión cerrada correctamente.",
        "success"
    );

    setTimeout(function () {

        window.location.href =
            "index.html";

    }, 1500);
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

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    if (!usuario) {

        elemento.textContent =
            "No has iniciado sesión.";

        return;
    }

    elemento.textContent =
        usuario.nombre ||
        usuario.correo ||
        "Usuario";
}


// ========================================
// ICONOS DE NAVEGACIÓN
// ========================================

function unificarIconosNavegacion() {

    const paginaActual =
        window.location.pathname.split("/").pop() ||
        "index.html";

    const navegacion = `
        <a href="index.html" class="${paginaActual === "index.html" ? "activo" : ""}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 9.75-9 9.75 9M4.5 10.5v9.75h15V10.5" /></svg>
            Inicio
        </a>
        <a href="eventos.html" class="${paginaActual === "eventos.html" ? "activo" : ""}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25Z" /></svg>
            Eventos
        </a>
        <a href="reservas.html" class="${paginaActual === "reservas.html" ? "activo" : ""}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6.75h.75A2.25 2.25 0 0 1 19.5 9v6a2.25 2.25 0 0 1-2.25 2.25h-.75M7.5 6.75h-.75A2.25 2.25 0 0 0 4.5 9v6a2.25 2.25 0 0 0 2.25 2.25h.75m0-10.5h9m-9 10.5h9M9 6.75v10.5m6-10.5v10.5" /></svg>
            Mis reservas
        </a>
        <a href="crear-evento.html" class="${paginaActual === "crear-evento.html" ? "activo" : ""}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            Crear evento
        </a>
    `;

    document.querySelectorAll("nav").forEach(function (menu) {
        menu.innerHTML = navegacion;
    });


    const iconoCuenta = {

        "btn-login":
            '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg>',

        "btn-registro":
            '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0M19 8v6m3-3h-6" /></svg>'
    };


    document.querySelectorAll(
        ".cuenta a.btn-login, .cuenta a.btn-registro"
    ).forEach(
        function (enlace) {

            const tipo =
                enlace.classList.contains("btn-login")
                    ? "btn-login"
                    : "btn-registro";

            const icono =
                iconoCuenta[tipo];

            const iconoActual =
                enlace.querySelector(
                    "svg, .icono"
                );

            if (iconoActual) {

                iconoActual.outerHTML =
                    icono;

            } else {

                enlace.insertAdjacentHTML(
                    "afterbegin",
                    icono
                );
            }
        }
    );
}


// ========================================
// CREAR EVENTO
// ========================================

const formularioEvento =
    document.getElementById("formEvento");

if (formularioEvento) {

    formularioEvento.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const mensaje =
                document.getElementById(
                    "mensajeEvento"
                );

            const usuarioGuardado =
                localStorage.getItem("usuario");

            const usuario =
                usuarioGuardado
                    ? JSON.parse(usuarioGuardado)
                    : null;


            // Verificar sesión

            if (!usuario || !usuario.id) {

                mostrarNotificacion(
                    "Debes iniciar sesión para crear un evento.",
                    "error"
                );

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 1500);

                return;
            }


            // Obtener campos

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

            const inputImagen =
                document.getElementById(
                    "imagenEvento"
                );

            const archivoImagen =
                inputImagen &&
                inputImagen.files.length > 0
                    ? inputImagen.files[0]
                    : null;


            // Crear FormData

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


            // Agregar imagen

            if (archivoImagen) {

                formularioDatos.append(
                    "imagen",
                    archivoImagen
                );
            }


            mensaje.textContent =
                "Guardando evento...";


            try {

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

                    console.error(
                        "Respuesta del servidor:",
                        datos
                    );

                    mensaje.textContent =
                        datos.mensaje ||
                        "No se pudo guardar el evento.";

                    mostrarNotificacion(
                        datos.mensaje ||
                        "No se pudo guardar el evento.",
                        "error"
                    );

                    return;
                }


                mostrarNotificacion(
                    "El evento se ha guardado correctamente.",
                    "success"
                );


                formularioEvento.reset();


                // Actualizar lista si existe

                if (listaEventos) {
                    cargarEventos();
                }

            } catch (error) {

                console.error(
                    "ERROR AL GUARDAR EVENTO:",
                    error
                );

                mensaje.textContent =
                    "Error al guardar el evento.";

                mostrarNotificacion(
                    "Error al conectar con el servidor.",
                    "error"
                );
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

    if (!listaEventos) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                "/api/eventos"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los eventos."
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
            function (evento) {

                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.classList.add(
                    "tarjeta-evento"
                );


                // ========================================
                // IMAGEN DEL EVENTO
                // ========================================

                let imagenHTML = "";


                if (evento.imagen) {

                    let rutaImagen =
                        evento.imagen;


                    // Si la BD ya guarda /uploads/
                    // no volver a agregarlo

                    if (
                        !rutaImagen.startsWith("/")
                    ) {

                        rutaImagen =
                            "/" + rutaImagen;
                    }


                    if (
                        !rutaImagen.startsWith(
                            "/uploads/"
                        )
                    ) {

                        rutaImagen =
                            "/uploads/" +
                            rutaImagen.replace(
                                /^\/+/,
                                ""
                            );
                    }


                    imagenHTML = `

                        <div class="imagen-evento">

                            <img
                                src="${rutaImagen}"
                                alt="${evento.nombre || "Evento"}"
                                onerror="this.parentElement.style.display='none';"
                            >

                        </div>

                    `;
                }


                tarjeta.innerHTML = `

                    ${imagenHTML}


                    <div class="contenido-evento">

                        <h2>
                            ${evento.nombre || "Evento sin nombre"}
                        </h2>


                        <p>

                            <strong>
                                Categoría:
                            </strong>

                            ${evento.categoria || "Sin categoría"}

                        </p>


                        <p>

                            <strong>
                                Fecha:
                            </strong>

                            ${evento.fecha || "Sin fecha"}

                        </p>


                        <p>

                            <strong>
                                Hora:
                            </strong>

                            ${evento.hora || "Sin hora"}

                        </p>


                        <p>

                            <strong>
                                Lugar:
                            </strong>

                            ${evento.lugar || "Sin lugar"}

                        </p>


                        <p>

                            <strong>
                                Precio:
                            </strong>

                            $${evento.precio || 0}

                        </p>


                        <p>

                            ${evento.descripcion || "Sin descripción"}

                        </p>


                        <button
                            class="btn-principal"
                            onclick="reservar(${evento.id})"
                        >

                            Reservar

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
                Error al cargar los eventos.
            </p>

        `;
    }
}


// ========================================
// NOTIFICACIÓN PERSONALIZADA
// ========================================

function mostrarNotificacion(
    mensaje,
    tipo = "success"
) {

    // Eliminar notificaciones anteriores

    document
        .querySelectorAll(".notificacion")
        .forEach(function (notificacion) {

            notificacion.remove();

        });


    const notificacion =
        document.createElement("div");


    notificacion.className =
        `notificacion ${tipo}`;


    notificacion.innerHTML = `

        <div class="notificacion-icono">

            ${tipo === "error" ? "!" : "✓"}

        </div>


        <div class="notificacion-mensaje">

            <p>
                ${mensaje}
            </p>

        </div>


        <button
            class="cerrar-notificacion"
            type="button"
            aria-label="Cerrar notificación"
        >

            ×

        </button>

    `;


    const botonCerrar =
        notificacion.querySelector(
            ".cerrar-notificacion"
        );


    botonCerrar.addEventListener(
        "click",
        function () {

            notificacion.remove();

        }
    );


    document.body.appendChild(
        notificacion
    );


    setTimeout(function () {

        if (!notificacion.isConnected) {
            return;
        }


        notificacion.classList.add(
            "ocultar"
        );


        setTimeout(function () {

            if (notificacion.isConnected) {

                notificacion.remove();

            }

        }, 400);

    }, 3500);
}


// ========================================
// EJECUTAR AL CARGAR LA PÁGINA
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        unificarIconosNavegacion();

        mostrarReservas();

        mostrarUsuario();

    }
);