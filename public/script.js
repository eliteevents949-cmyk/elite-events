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
                document.getElementById("nombreRegistro").value.trim();

            const apellido =
                document.getElementById("apellidoRegistro").value.trim();

            const correo =
                document.getElementById("correoRegistro").value.trim();

            const password =
                document.getElementById("passwordRegistro").value;

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

                // Guardar usuario de MySQL
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

    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    // Comprobar sesión
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

    // Comprobar ID
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

        // No hay reservas
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

        // Limpiar contenedor
        contenedor.innerHTML = "";

        // Mostrar reservas
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

    const usuario = JSON.parse(
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

            const imagen =
                document.getElementById(
                    "imagenEvento"
                ).value.trim();


            mensaje.textContent =
                "Guardando evento...";


            try {

                const respuesta =
                    await fetch(
                        "/api/eventos",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                nombre: nombre,

                                categoria: categoria,

                                descripcion: descripcion,

                                fecha: fecha,

                                hora: hora,

                                lugar: lugar,

                                precio: precio,

                                imagen: imagen || null

                            })
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    mensaje.textContent =
                        "❌ " +
                        (datos.mensaje ||
                        "No se pudo guardar el evento.");

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

const listaEventos = document.getElementById("listaEventos");

if (listaEventos) {
    cargarEventos();
}

async function cargarEventos() {

    try {

        const respuesta = await fetch("/api/eventos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los eventos");
        }

        const eventos = await respuesta.json();

        listaEventos.innerHTML = "";

        if (eventos.length === 0) {
            listaEventos.innerHTML = `
                <p>No hay eventos disponibles.</p>
            `;
            return;
        }

        eventos.forEach(function(evento) {

            const tarjeta = document.createElement("div");

            tarjeta.classList.add("tarjeta-evento");

            const imagenEvento =
                evento.imagen ||
                (
                    evento.categoria === "Música"
                        ? "https://pixabay.com/es/music/"

                        : evento.categoria === "Tecnología"
                        ? "https://www.google.com/imgres?q=tecnologia%20evento&imgurl=https%3A%2F%2Fwww.muycomputerpro.com%2Fwp-content%2Fuploads%2F2020%2F01%2Fescenario-1000x600.jpeg&imgrefurl=https%3A%2F%2Fwww.muycomputerpro.com%2F2020%2F01%2F08%2Fguia-mcpro-eventos-tecnologicos&docid=bU9GXpmPZpvVBM&tbnid=9bM6d-fCEWw4aM&vet=12ahUKEwiajJykkeKWAxVIfzABHd9MHUEQnPAOegQIMhAA..i&w=1000&h=600&hcb=2&ved=2ahUKEwiajJykkeKWAxVIfzABHd9MHUEQnPAOegQIMhAA"

                        : evento.categoria === "Arte"
                        ? "https://www.google.com/imgres?q=arte%20evento&imgurl=https%3A%2F%2Fwww.1st-art-gallery.com%2Fcdn-cgi%2Fimage%2Fformat%3Dwebp%2Cquality%3D85%2Cwidth%3D380%2Fmedia%2Fmagefan_blog%2Fcelebrations-and-festivals-around-the-world.jpg&imgrefurl=https%3A%2F%2Fwww.1st-art-gallery.com%2Fes%2Farticle%2Fdiscover-the-worlds-finest-art-festivals-celebrating-creativity-and-culture%2F%3Fsrsltid%3DAfmBOoobQhwz2VXTOVjNnBBat4l0bW7y4W77q5NGDbFa1jlomted0kMt&docid=B11CZr5CnKlm0M&tbnid=Nr2y55RMpCO1NM&vet=12ahUKEwjarLy4keKWAxVuTDABHYxIISYQnPAOegQIfBAA..i&w=380&h=285&hcb=2&ved=2ahUKEwjarLy4keKWAxVuTDABHYxIISYQnPAOegQIfBAA"

                        : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
                );

            tarjeta.innerHTML = `

                <div class="imagen-evento">

                    <img
                        src="${imagenEvento}"
                        alt="${evento.nombre}"
                        onerror="this.src='hptt //:3000/public/img/imagen-no-disponible.jpg"
                    >

                </div>

                <div class="contenido-evento">

                    <h2>${evento.nombre}</h2>

                    <p>📂 ${evento.categoria}</p>

                    <p>📅 ${evento.fecha}</p>

                    <p>🕐 ${evento.hora}</p>

                    <p>📍 ${evento.lugar}</p>

                    <p>
                        💰 $${Number(evento.precio)
                            .toLocaleString("es-CO")}
                    </p>

                    <p>
                        ${evento.descripcion || ""}
                    </p>

                    <button
                        class="btn-principal"
                        onclick="reservar(${evento.id})"
                    >
                        🎟️ Reservar entrada
                    </button>

                </div>
            `;

            listaEventos.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "ERROR CARGANDO EVENTOS:",
            error
        );

        listaEventos.innerHTML = `
            <p>
                ❌ No se pudieron cargar los eventos.
            </p>
        `;
    }
}