const notificacionesService =
    require("../services/notificaciones.services");


// ========================================
// OBTENER NOTIFICACIONES
// ========================================

async function obtenerNotificaciones(req, res) {

    try {

        const usuarioId =
            Number(req.params.usuarioId);

        if (
            !Number.isInteger(usuarioId) ||
            usuarioId <= 0
        ) {

            return res.status(400).json({
                mensaje: "ID de usuario inválido"
            });
        }

        const notificaciones =
            await notificacionesService.obtenerNotificaciones(
                usuarioId
            );

        res.json(notificaciones);

    } catch (error) {

        console.error(
            "ERROR OBTENIENDO NOTIFICACIONES:",
            error
        );

        res.status(500).json({

            mensaje:
                "Error al obtener las notificaciones",

            error:
                error.message

        });
    }
}


// ========================================
// MARCAR COMO LEÍDA
// ========================================

async function marcarComoLeida(req, res) {

    try {

        const id =
            Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                mensaje: "ID de notificación inválido"
            });
        }

        await notificacionesService.marcarComoLeida(id);

        res.json({

            mensaje:
                "Notificación marcada como leída"

        });

    } catch (error) {

        console.error(
            "ERROR MARCANDO NOTIFICACIÓN:",
            error
        );

        res.status(500).json({

            mensaje:
                "Error al marcar la notificación",

            error:
                error.message

        });
    }
}


// ========================================
// EXPORTAR
// ========================================

module.exports = {

    obtenerNotificaciones,
    marcarComoLeida

};