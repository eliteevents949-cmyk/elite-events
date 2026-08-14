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

async function reservar(nombreEvento) {

    // Obtener usuario que inició sesión
    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    // Comprobar sesión
    if (!usuario) {

        alert(
            "⚠️ Primero debes iniciar sesión."
        );

        window.location.href =
            "login.html";

        return;
    }

    // Comprobar que el usuario tenga ID
    if (!usuario.id) {

        alert(
            "❌ No se encontró el ID del usuario."
        );

        console.error(
            "Usuario guardado:",
            usuario
        );

        return;
    }

    try {

        const respuesta = await fetch(
            "/api/reservas",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    usuarioId:
                        usuario.id,

                    evento:
                        nombreEvento

                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                "❌ " +
                (datos.mensaje ||
                "No se pudo guardar la reserva.")
            );

            return;
        }

        alert(
            "🎟️ ¡Reserva guardada correctamente en MySQL!"
        );

        window.location.href =
            "reservas.html";

    } catch (error) {

        console.error(
            "Error al reservar:",
            error
        );

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