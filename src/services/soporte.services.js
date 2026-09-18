const db = require("../config/database");


function obtenerMensajes(usuarioId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                mensajes_soporte.id,
                mensajes_soporte.usuario_id,
                mensajes_soporte.autor_rol,
                mensajes_soporte.mensaje,
                mensajes_soporte.fecha,
                usuarios.nombre,
                usuarios.apellido
            FROM mensajes_soporte
            INNER JOIN usuarios
                ON usuarios.id = mensajes_soporte.usuario_id
            WHERE mensajes_soporte.usuario_id = ?
            ORDER BY mensajes_soporte.fecha ASC
        `;

        db.query(sql, [usuarioId], (error, resultados) => {

            if (error) {
                reject(error);
                return;
            }

            resolve(resultados);
        });
    });
}


function obtenerTodosLosMensajes() {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                mensajes_soporte.id,
                mensajes_soporte.usuario_id,
                mensajes_soporte.autor_rol,
                mensajes_soporte.mensaje,
                mensajes_soporte.fecha,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.correo
            FROM mensajes_soporte
            INNER JOIN usuarios
                ON usuarios.id = mensajes_soporte.usuario_id
            ORDER BY mensajes_soporte.fecha ASC
        `;

        db.query(sql, (error, resultados) => {

            if (error) {
                reject(error);
                return;
            }

            resolve(resultados);
        });
    });
}


function guardarMensaje(usuarioId, autorRol, mensaje) {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO mensajes_soporte
            (usuario_id, autor_rol, mensaje)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [usuarioId, autorRol, mensaje],
            (error, resultado) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(resultado);
            }
        );
    });
}


function obtenerRolUsuario(usuarioId) {

    return new Promise((resolve, reject) => {

        db.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [usuarioId],
            (error, resultados) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(resultados[0] ? resultados[0].rol : null);
            }
        );
    });
}


function generarRespuestaIA(mensaje) {

    const texto = mensaje.toLowerCase();
    const contactoAsesor =
        "\n\nSi necesitas un asesor humano, escríbenos por WhatsApp al +57 321 451 9458: https://wa.me/573214519458";

    let respuesta;

    if (texto.includes("reserva") || texto.includes("boleta")) {
        respuesta = "Puedo ayudarte con tu reserva. Revisa que hayas iniciado sesión, que el evento tenga boletas disponibles y que su fecha todavía no haya llegado.";
    }
    else if (texto.includes("pago") || texto.includes("nequi") || texto.includes("bancolombia")) {
        respuesta = "Sobre el pago: selecciona Nequi o Bancolombia y escribe el número solicitado. El pago actual es una demostración y no realiza cobros reales.";
    }
    else if (texto.includes("evento") || texto.includes("crear")) {
        respuesta = "Para crear un evento debes iniciar sesión y completar todos los campos, incluyendo la cantidad de boletas disponibles.";
    }
    else if (texto.includes("contraseña") || texto.includes("login") || texto.includes("sesión") || texto.includes("acceso")) {
        respuesta = "Si tienes problemas para entrar, verifica tu correo y contraseña. También puedes cerrar sesión y volver a iniciar el proceso.";
    }
    else {
        respuesta = "Gracias por escribirnos. Hemos recibido tu mensaje. Cuéntanos si el problema está relacionado con una reserva, un pago, un evento o el acceso a tu cuenta.";
    }

    return respuesta + contactoAsesor;
}


module.exports = {
    obtenerMensajes,
    obtenerTodosLosMensajes,
    guardarMensaje,
    obtenerRolUsuario,
    generarRespuestaIA
};
