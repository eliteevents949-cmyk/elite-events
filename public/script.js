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

function reservar(nombreEvento) {

    const usuario = JSON.parse(
        localStorage.getItem("usuarioActual")
    );

    if (!usuario) {
        alert("⚠️ Primero debes iniciar sesión.");
        window.location.href = "login.html";
        return;
    }

    let reservas = JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

    reservas.push({
        id: Date.now(),
        usuario: usuario.correo,
        nombreUsuario: usuario.nombre,
        evento: nombreEvento,
        fecha: new Date().toLocaleDateString()
    });

    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );

    alert("🎟️ ¡Reserva realizada correctamente!");

    window.location.href = "reservas.html";
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
// ========================================
// INICIAR SECCION
// ========================================
function iniciarSesion(event) {

    event.preventDefault();

    const correo = document.getElementById("correoLogin").value.trim();
    const password = document.getElementById("passwordLogin").value;

    const usuarios = JSON.parse(
        localStorage.getItem("usuarios")
    ) || [];

    const usuario = usuarios.find(function(usuario) {
        return usuario.correo === correo &&
               usuario.password === password;
    });

    if (!usuario) {
        alert("❌ Correo o contraseña incorrectos.");
        return;
    }

    // GUARDAR EL USUARIO QUE INICIÓ SESIÓN
    localStorage.setItem(
        "usuarioActual",
        JSON.stringify({
            nombre: usuario.nombre,
            correo: usuario.correo
        })
    );

    alert("✅ Inicio de sesión exitoso.");

    window.location.href = "index.html";
}