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
                            nombre,
                            apellido,
                            correo,
                            password
                        })
                    }
                );

                const datos = await respuesta.json();

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
// LOGIN DE USUARIO
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
                        "❌ " + datos.mensaje;

                    return;
                }

                // Guardar usuario que inició sesión
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

    const usuario =
        JSON.parse(
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

    try {

        const respuesta = await fetch(
            "/api/reservas",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    usuarioId: usuario.id,
                    evento: nombreEvento
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                "❌ " + datos.mensaje
            );

            return;
        }

        alert(
            "🎟️ Reserva realizada correctamente."
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
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {

    localStorage.removeItem("usuario");

    // También eliminamos el antiguo
    // por si quedó guardado de pruebas anteriores
    localStorage.removeItem("usuarioActual");

    alert(
        "👋 Sesión cerrada correctamente."
    );

    window.location.href =
        "index.html";
}