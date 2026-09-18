const reservasService = require("../services/reservas.services");

// ========================================
// CREAR RESERVA
// ========================================

async function crearReserva(req, res) {

    try {

        const {
            usuarioId,
            eventoId
        } = req.body;

        console.log("Datos recibidos:", {
            usuarioId,
            eventoId
        });

        if (!usuarioId || !eventoId) {

            return res.status(400).json({
                mensaje: "Faltan datos para crear la reserva"
            });
        }

        await reservasService.crearReserva(
            usuarioId,
            eventoId
        );

        res.status(201).json({
            mensaje: "Reserva guardada correctamente"
        });

    } catch (error) {

        console.log("ERROR RESERVA:", error);

        const eventoNoDisponible =
            error.message ===
            "El evento ya no está disponible";

        res.status(eventoNoDisponible ? 409 : 500).json({
            mensaje: eventoNoDisponible
                ? error.message
                : "Error al guardar la reserva",
            error: error.message
        });
    }
}


// ========================================
// OBTENER RESERVAS
// ========================================

async function obtenerReservas(req, res) {

    try {

        const usuarioId = req.params.usuarioId;

        const reservas =
            await reservasService.obtenerReservas(usuarioId);

        res.json(reservas);

    } catch (error) {

        console.log("ERROR OBTENIENDO RESERVAS:", error);

        res.status(500).json({
            mensaje: "Error al obtener reservas",
            error: error.message
        });
    }
}


// ========================================
// EXPORTAR FUNCIONES
// ========================================

module.exports = {
    crearReserva,
    obtenerReservas
};