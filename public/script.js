
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
                document.getElementById(
                    "nombreRegistro"
                ).value.trim();


            const apellido =
                document.getElementById(
                    "apellidoRegistro"
                ).value.trim();


            const correo =
                document.getElementById(
                    "correoRegistro"
                ).value.trim();


            const password =
                document.getElementById(
                    "passwordRegistro"
                ).value;


            const mensaje =
                document.getElementById(
                    "mensajeRegistro"
                );


            mensaje.textContent =
                "Registrando usuario...";


            try {

                const respuesta = await fetch(
                    "/api/usuarios/registro",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nombre,
                            apellido,
                            correo,
                            password
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


// ==========================================
// INICIAR SESIÓN
// ==========================================

function iniciarSesion(event) {

    event.preventDefault();

    const correo = document.getElementById("correoLogin").value;
    const password = document.getElementById("passwordLogin").value;

    const usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuario = usuarios.find(function(usuario) {
        return usuario.correo === correo &&
               usuario.password === password;
    });

    if (!usuario) {
        alert("Correo o contraseña incorrectos.");
        return;
    }

    localStorage.setItem(
        "usuarioActual",
        JSON.stringify(usuario)
    );

    alert("¡Inicio de sesión exitoso!");

    window.location.href = "index.html";
}


// ==========================================
// CREAR EVENTO
// ==========================================

function crearEvento(event) {

    event.preventDefault();

    const nombre = document.getElementById("nombreEvento").value;
    const descripcion = document.getElementById("descripcionEvento").value;
    const fecha = document.getElementById("fechaEvento").value;
    const lugar = document.getElementById("lugarEvento").value;

    let eventos =
        JSON.parse(localStorage.getItem("eventos")) || [];

    eventos.push({
        id: Date.now(),
        nombre: nombre,
        descripcion: descripcion,
        fecha: fecha,
        lugar: lugar
    });

    localStorage.setItem(
        "eventos",
        JSON.stringify(eventos)
    );

    alert("🎉 Evento creado correctamente.");

    window.location.href = "eventos.html";
}


// ==========================================
// RESERVAR
// ==========================================

function reservar(nombreEvento) {

    const usuario =
        JSON.parse(localStorage.getItem("usuarioActual"));

    if (!usuario) {

        alert("⚠️ Primero debes iniciar sesión.");

        window.location.href = "login.html";

        return;
    }

    let reservas =
        JSON.parse(localStorage.getItem("reservas")) || [];

    reservas.push({
        id: Date.now(),
        usuario: usuario.correo,
        evento: nombreEvento
    });

    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );

    alert("🎟️ Reserva realizada correctamente.");

    window.location.href = "reservas.html";
}