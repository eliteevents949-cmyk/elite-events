const soporteService =
    require("../services/soporte.services");


function obtenerUsuarioId(req) {
    return Number(req.params.usuarioId || req.body.usuarioId);
}


async function obtenerMensajes(req, res) {

    try {

        const usuarioId = obtenerUsuarioId(req);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ mensaje: "ID de usuario inválido" });
        }

        const mensajes =
            await soporteService.obtenerMensajes(usuarioId);

        res.json(mensajes);

    } catch (error) {
        console.error("ERROR OBTENIENDO MENSAJES:", error);
        res.status(500).json({ mensaje: "No se pudieron obtener los mensajes" });
    }
}


async function enviarMensaje(req, res) {

    try {

        const usuarioId = obtenerUsuarioId(req);
        const mensaje = String(req.body.mensaje || "").trim();

        if (!Number.isInteger(usuarioId) || usuarioId <= 0 || !mensaje) {
            return res.status(400).json({ mensaje: "Escribe un mensaje válido" });
        }

        if (mensaje.length > 1000) {
            return res.status(400).json({ mensaje: "El mensaje no puede superar 1000 caracteres" });
        }

        const rol = await soporteService.obtenerRolUsuario(usuarioId);

        if (!rol) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        await soporteService.guardarMensaje(usuarioId, rol === "admin" ? "admin" : "usuario", mensaje);

        if (rol !== "admin") {

            const respuestaIA =
                soporteService.generarRespuestaIA(mensaje);

            await soporteService.guardarMensaje(
                usuarioId,
                "ia",
                respuestaIA
            );
        }

        res.status(201).json({ mensaje: "Mensaje enviado. La IA de soporte respondió tu consulta." });

    } catch (error) {
        console.error("ERROR ENVIANDO MENSAJE:", error);
        res.status(500).json({ mensaje: "No se pudo enviar el mensaje" });
    }
}


async function obtenerMensajesAdmin(req, res) {

    try {

        const adminId = Number(req.query.adminId);
        const rol = await soporteService.obtenerRolUsuario(adminId);

        if (rol !== "admin") {
            return res.status(403).json({ mensaje: "No tienes permisos de administrador" });
        }

        res.json(await soporteService.obtenerTodosLosMensajes());

    } catch (error) {
        console.error("ERROR OBTENIENDO BANDEJA DE SOPORTE:", error);
        res.status(500).json({ mensaje: "No se pudo cargar la bandeja de soporte" });
    }
}


async function responderComoAdmin(req, res) {

    try {

        const adminId = Number(req.body.adminId);
        const usuarioId = Number(req.body.usuarioId);
        const mensaje = String(req.body.mensaje || "").trim();
        const rol = await soporteService.obtenerRolUsuario(adminId);

        if (rol !== "admin") {
            return res.status(403).json({ mensaje: "No tienes permisos de administrador" });
        }

        if (!Number.isInteger(usuarioId) || usuarioId <= 0 || !mensaje) {
            return res.status(400).json({ mensaje: "Respuesta inválida" });
        }

        await soporteService.guardarMensaje(usuarioId, "admin", mensaje);
        res.status(201).json({ mensaje: "Respuesta enviada" });

    } catch (error) {
        console.error("ERROR RESPONDIENDO SOPORTE:", error);
        res.status(500).json({ mensaje: "No se pudo enviar la respuesta" });
    }
}


module.exports = {
    obtenerMensajes,
    enviarMensaje,
    obtenerMensajesAdmin,
    responderComoAdmin
};
