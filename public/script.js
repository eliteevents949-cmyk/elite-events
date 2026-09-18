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

function reservar(eventoId) {

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    if (!usuario || !usuario.id) {
        procesarReserva(eventoId);
        return;
    }

    mostrarModalPago(eventoId);
}


function mostrarModalPago(eventoId) {

    const modalAnterior =
        document.getElementById("modalPago");

    if (modalAnterior) {
        modalAnterior.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "modalPago";
    modal.className = "modal-pago";

    modal.innerHTML = `
        <div class="modal-pago-contenido" role="dialog" aria-modal="true" aria-labelledby="tituloPago">
            <button type="button" class="modal-pago-cerrar" aria-label="Cerrar">&times;</button>
            <p class="bienvenida">RESERVA DE EVENTO</p>
            <h2 id="tituloPago">Método de pago</h2>
            <p class="modal-pago-nota">Demo de pago. No se realizará ningún cobro.</p>
            <form id="formPagoDemo">
                <label for="metodoPago">Selecciona el método</label>
                <select id="metodoPago" required>
                    <option value="">Seleccionar</option>
                    <option value="nequi">Nequi</option>
                    <option value="bancolombia">Bancolombia</option>
                </select>
                <label id="numeroPagoEtiqueta" for="numeroPago">Número de celular Nequi</label>
                <input id="numeroPago" type="text" inputmode="numeric" placeholder="3001234567" minlength="10" maxlength="10" pattern="[0-9]{10}" required>
                <label for="nombreTitular">Nombre del titular</label>
                <input id="nombreTitular" type="text" placeholder="Nombre completo" required>
                <button type="submit" class="btn-principal">Confirmar pago demo</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const metodoPago =
        modal.querySelector("#metodoPago");

    const numeroPagoEtiqueta =
        modal.querySelector("#numeroPagoEtiqueta");

    const numeroPago =
        modal.querySelector("#numeroPago");

    metodoPago.addEventListener("change", function () {

        const esNequi =
            metodoPago.value === "nequi";

        numeroPagoEtiqueta.textContent =
            esNequi
                ? "Número de celular Nequi"
                : "Número de cuenta Bancolombia";

        numeroPago.placeholder =
            esNequi
                ? "3001234567"
                : "12345678901";

        numeroPago.minLength =
            esNequi ? 10 : 11;

        numeroPago.maxLength =
            esNequi ? 10 : 11;

        numeroPago.pattern =
            esNequi ? "[0-9]{10}" : "[0-9]{11}";

        numeroPago.value = "";
    });

    const cerrar = function () {
        modal.remove();
    };

    modal.querySelector(".modal-pago-cerrar").addEventListener(
        "click",
        cerrar
    );

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            cerrar();
        }
    });

    modal.querySelector("#formPagoDemo").addEventListener(
        "submit",
        function (event) {
            event.preventDefault();
            cerrar();
            procesarReserva(eventoId);
        }
    );
}


async function procesarReserva(eventoId) {

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

            let imagenReserva = "";

            if (reserva.imagen) {

                let rutaImagen = reserva.imagen;

                if (!rutaImagen.startsWith("/")) {
                    rutaImagen = "/" + rutaImagen;
                }

                if (!rutaImagen.startsWith("/uploads/")) {
                    rutaImagen =
                        "/uploads/" +
                        rutaImagen.replace(/^\/+/, "");
                }

                imagenReserva = `
                    <img
                        class="imagen-reserva"
                        src="${rutaImagen}"
                        alt="${reserva.evento || "Evento"}"
                        onerror="this.style.display='none';"
                    >
                `;
            }

            tarjeta.innerHTML = `

                ${imagenReserva}

                <div class="contenido-reserva">

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
// ICONOS Y MENÚ DE NAVEGACIÓN
// ========================================

function unificarIconosNavegacion() {

    const paginaActual =
        window.location.pathname.split("/").pop() ||
        "index.html";

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    let navegacion = `
        <a href="index.html"
           class="${paginaActual === "index.html" ? "activo" : ""}">
           
            <svg width="18" height="18"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="1.8"
                 viewBox="0 0 24 24"
                 aria-hidden="true">

                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 12 9.75-9 9.75 9M4.5 10.5v9.75h15V10.5"
                />

            </svg>

            Inicio
        </a>


        <a href="eventos.html"
           class="${paginaActual === "eventos.html" ? "activo" : ""}">

            <svg width="18" height="18"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="1.8"
                 viewBox="0 0 24 24"
                 aria-hidden="true">

                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25Z"
                />

            </svg>

            Eventos
        </a>
    `;


    // ========================================
    // MIS PROYECTOS
    // SOLO APARECE SI HAY SESIÓN
    // ========================================

    if (usuario) {

        navegacion += `
            <a href="mis-proyectos.html"
               class="${paginaActual === "mis-proyectos.html" ? "activo" : ""}">

                <svg width="18" height="18"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="1.8"
                     viewBox="0 0 24 24"
                     aria-hidden="true">

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 7.5A2.25 2.25 0 0 1 5.25 5.25h4.5L12 7.5h6.75A2.25 2.25 0 0 1 21 9.75v8.25a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V7.5Z"
                    />

                </svg>

                Mis proyectos
            </a>
        `;
    }


    // ========================================
    // MIS RESERVAS
    // ========================================

    navegacion += `
        <a href="reservas.html"
           class="${paginaActual === "reservas.html" ? "activo" : ""}">

            <svg width="18" height="18"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="1.8"
                 viewBox="0 0 24 24"
                 aria-hidden="true">

                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 6.75h.75A2.25 2.25 0 0 1 19.5 9v6a2.25 2.25 0 0 1-2.25 2.25h-.75M7.5 6.75h-.75A2.25 2.25 0 0 0 4.5 9v6a2.25 2.25 0 0 0 2.25 2.25h.75m0-10.5h9m-9 10.5h9M9 6.75v10.5m6-10.5v10.5"
                />

            </svg>

            Mis reservas
        </a>


        <a href="crear-evento.html"
           class="${paginaActual === "crear-evento.html" ? "activo" : ""}">

            <svg width="18" height="18"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="1.8"
                 viewBox="0 0 24 24"
                 aria-hidden="true">

                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />

            </svg>

            Crear evento
        </a>

        <a href="soporte.html"
           class="${paginaActual === "soporte.html" ? "activo" : ""}">

            <svg width="18" height="18"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="1.8"
                 viewBox="0 0 24 24"
                 aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8.25 10.5h7.5m-7.5 3h4.5M6.75 19.5 3 21l1.5-4.5A8.25 8.25 0 1 1 6.75 19.5Z" />
            </svg>

            Ayuda
        </a>
    `;


    // ========================================
    // COLOCAR MENÚ
    // ========================================

    document.querySelectorAll("nav").forEach(
        function (menu) {

            menu.innerHTML = navegacion;

        }
    );


    // ========================================
    // BOTONES DE CUENTA
    // ========================================

    const btnLogin =
        document.getElementById("btnLogin");

    const btnRegistro =
        document.getElementById("btnRegistro");

    const btnCerrarSesion =
        document.getElementById("btnCerrarSesion");


    if (usuario) {

        // Ocultar iniciar sesión
        if (btnLogin) {
            btnLogin.style.display = "none";
        }

        // Ocultar registrarse
        if (btnRegistro) {
            btnRegistro.style.display = "none";
        }

        // Mostrar cerrar sesión
        if (btnCerrarSesion) {

            btnCerrarSesion.style.display =
                "inline-block";

            btnCerrarSesion.onclick =
                function () {

                    cerrarSesion();

                };
        }

    } else {

        // Mostrar iniciar sesión
        if (btnLogin) {
            btnLogin.style.display =
                "inline-block";
        }

        // Mostrar registrarse
        if (btnRegistro) {
            btnRegistro.style.display =
                "inline-block";
        }

        // Ocultar cerrar sesión
        if (btnCerrarSesion) {
            btnCerrarSesion.style.display =
                "none";
        }
    }
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

            const boletas =
                document.getElementById(
                    "boletasEvento"
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
                "boletas",
                boletas
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

                const fechaEvento =
                    evento.fecha
                        ? String(evento.fecha).slice(0, 10)
                        : "";

                const ahora =
                    new Date();

                const fechaHoy =
                    ahora.getFullYear() +
                    "-" +
                    String(ahora.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(ahora.getDate()).padStart(2, "0");

                const eventoDisponible =
                    fechaEvento > fechaHoy &&
                    Number(evento.boletas_disponibles) > 0;


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


                        ${eventoDisponible ? `
                            <p>
                                <strong>Precio:</strong>
                                $${evento.precio || 0}
                            </p>

                            <p>
                                <strong>Boletas disponibles:</strong>
                                ${evento.boletas_disponibles}
                            </p>
                        ` : `
                            <p class="evento-no-disponible">
                                Evento no disponible
                            </p>
                        `}


                        <p>

                            ${evento.descripcion || "Sin descripción"}

                        </p>


                        <button
                            class="btn-principal"
                            onclick="reservar(${evento.id})"
                            ${eventoDisponible ? "" : "disabled"}
                        >

                            ${eventoDisponible ? "Reservar" : "No disponible"}

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
// MOSTRAR MIS PROYECTOS
// ========================================

async function cargarMisProyectos() {

    const contenedor =
        document.getElementById("listaMisProyectos");

    if (!contenedor) {
        return;
    }

    const usuarioGuardado =
        localStorage.getItem("usuario");

    const usuario =
        usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

    if (!usuario || !usuario.id) {

        contenedor.innerHTML = `
            <div class="reserva-vacia">
                <h2>Inicia sesión</h2>
                <p>Debes iniciar sesión para ver tus eventos.</p>
                <a href="login.html" class="btn-principal">
                    Iniciar sesión
                </a>
            </div>
        `;

        return;
    }

    try {

        const respuesta =
            await fetch(
                "/api/eventos/usuario/" +
                usuario.id
            );

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar tus eventos");
        }

        const eventos =
            await respuesta.json();

        if (!Array.isArray(eventos) || eventos.length === 0) {

            contenedor.innerHTML = `
                <div class="reserva-vacia">
                    <h2>No tienes eventos creados</h2>
                    <p>Los eventos que crees aparecerán aquí.</p>
                    <a href="crear-evento.html" class="btn-principal">
                        Crear evento
                    </a>
                </div>
            `;

            return;
        }

        contenedor.innerHTML = "";

        eventos.forEach(function (evento) {

            const tarjeta =
                document.createElement("div");

            tarjeta.className = "tarjeta-evento";

            tarjeta.innerHTML = `
                ${evento.imagen ? `
                    <div class="imagen-evento">
                        <img src="${evento.imagen}" alt="${evento.nombre || "Evento"}">
                    </div>
                ` : ""}

                <div class="contenido-evento">
                    <h2>${evento.nombre || "Evento sin nombre"}</h2>
                    <p><strong>Categoría:</strong> ${evento.categoria || "Sin categoría"}</p>
                    <p><strong>Fecha:</strong> ${evento.fecha || "Sin fecha"}</p>
                    <p><strong>Hora:</strong> ${evento.hora || "Sin hora"}</p>
                    <p><strong>Lugar:</strong> ${evento.lugar || "Sin lugar"}</p>
                    <p><strong>Precio:</strong> $${evento.precio || 0}</p>
                </div>
            `;

            contenedor.appendChild(tarjeta);
        });

    } catch (error) {

        console.error("Error al cargar mis proyectos:", error);

        contenedor.innerHTML = `
            <p>Error al cargar tus eventos.</p>
        `;
    }
}


async function cargarSoporte() {

    const lista = document.getElementById("listaMensajesSoporte");
    const formulario = document.getElementById("formSoporte");

    if (!lista || !formulario) {
        return;
    }

    const usuarioGuardado = localStorage.getItem("usuario");
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    if (!usuario || !usuario.id) {
        lista.innerHTML = '<p class="centrado">Debes iniciar sesión para contactar al soporte.</p>';
        formulario.style.display = "none";
        return;
    }

    async function cargarMensajes() {

        const respuesta = await fetch("/api/soporte/" + usuario.id);
        const mensajes = await respuesta.json();

        lista.innerHTML = mensajes.length
            ? mensajes.map(function (item) {
                return `
                    <article class="mensaje-soporte ${item.autor_rol === "usuario" ? "mensaje-usuario" : "mensaje-admin"}">
                        <strong>${item.autor_rol === "usuario" ? "Tú" : "IA de soporte Elite Events"}</strong>
                        <p>${formatearMensajeSoporte(item.mensaje)}</p>
                        <small>${new Date(item.fecha).toLocaleString("es-CO")}</small>
                    </article>
                `;
            }).join("")
            : '<p class="centrado">Todavía no tienes mensajes de soporte.</p>';
    }

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const campo = document.getElementById("mensajeSoporte");
        const estado = document.getElementById("mensajeSoporteEstado");
        const respuesta = await fetch("/api/soporte/" + usuario.id, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: campo.value })
        });

        const datos = await respuesta.json();
        estado.textContent = datos.mensaje;

        if (respuesta.ok) {
            campo.value = "";
            await cargarMensajes();
        }
    });

    await cargarMensajes();
}


async function cargarSoporteAdmin() {

    const lista = document.getElementById("listaMensajesAdmin");

    if (!lista) {
        return;
    }

    const usuarioGuardado = localStorage.getItem("usuario");
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    if (!usuario || usuario.rol !== "admin") {
        lista.innerHTML = '<p class="centrado">No tienes permisos para ver esta bandeja.</p>';
        return;
    }

    const respuesta = await fetch("/api/soporte/admin?adminId=" + usuario.id);
    const mensajes = await respuesta.json();
    const usuarios = {};

    mensajes.forEach(function (item) {
        if (!usuarios[item.usuario_id]) {
            usuarios[item.usuario_id] = {
                nombre: `${item.nombre} ${item.apellido}`,
                correo: item.correo,
                mensajes: []
            };
        }
        usuarios[item.usuario_id].mensajes.push(item);
    });

    lista.innerHTML = Object.entries(usuarios).length
        ? Object.entries(usuarios).map(function (entrada) {
            const usuarioId = entrada[0];
            const caso = entrada[1];
            return `
                <article class="caso-soporte">
                    <h2>${caso.nombre}</h2>
                    <small>${caso.correo}</small>
                    <div class="historial-soporte">
                        ${caso.mensajes.map(item => `<p><strong>${escaparTexto(item.autor_rol)}:</strong> ${formatearMensajeSoporte(item.mensaje)}</p>`).join("")}
                    </div>
                    <form class="form-respuesta" data-usuario-id="${usuarioId}">
                        <textarea maxlength="1000" placeholder="Escribe una respuesta..." required></textarea>
                        <button type="submit" class="btn-principal">Responder</button>
                    </form>
                </article>
            `;
        }).join("")
        : '<p class="centrado">No hay mensajes pendientes.</p>';

    lista.querySelectorAll(".form-respuesta").forEach(function (formulario) {
        formulario.addEventListener("submit", async function (event) {
            event.preventDefault();
            const campo = formulario.querySelector("textarea");
            await fetch("/api/soporte/admin/responder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminId: usuario.id,
                    usuarioId: formulario.dataset.usuarioId,
                    mensaje: campo.value
                })
            });
            await cargarSoporteAdmin();
        });
    });
}


function escaparTexto(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatearMensajeSoporte(valor) {

    const mensaje = escaparTexto(valor);

    return mensaje.replace(
        /https:\/\/wa\.me\/\d+/g,
        function (enlace) {
            return `<a href="${enlace}" target="_blank" rel="noopener noreferrer" class="enlace-whatsapp">Hablar con el asesor por WhatsApp</a>`;
        }
    );
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

        cargarSoporte();

        cargarSoporteAdmin();

    }
);
document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarMisProyectos();

    }
);