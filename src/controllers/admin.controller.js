const db = require("../config/database");
const eventosService = require("../services/eventos.services");
const reservasService = require("../services/reservas.services");

function ejecutarConsulta(sql, valores = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, valores, (error, resultados) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(resultados);
        });
    });
}

async function obtenerUsuarios(req, res) {
    try {
        const usuarios = await ejecutarConsulta(`
            SELECT id, nombre, apellido, correo, rol, fecha_registro
            FROM usuarios
            ORDER BY fecha_registro DESC
        `);
        return res.json(usuarios);
    } catch (error) {
        console.error("Error listando perfiles para administración:", error.message);
        return res.status(500).json({ mensaje: "No se pudieron cargar los perfiles." });
    }
}

async function obtenerEventos(req, res) {
    try {
        const eventos = await eventosService.obtenerEventos();
        return res.json(eventos);
    } catch (error) {
        console.error("Error listando eventos para administración:", error.message);
        return res.status(500).json({ mensaje: "No se pudieron cargar los eventos." });
    }
}

async function obtenerReservas(req, res) {
    try {
        await reservasService.asegurarPrecioReserva();
        const reservas = await ejecutarConsulta(`
            SELECT
                reservas.id,
                reservas.usuario_id,
                reservas.evento_id,
                reservas.cantidad,
                reservas.estado,
                reservas.fecha_reserva,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.correo,
                eventos.nombre AS evento,
                eventos.fecha AS fecha_evento,
                eventos.lugar,
                reservas.precio_unitario,
                reservas.precio_unitario * reservas.cantidad AS total
            FROM reservas
            INNER JOIN usuarios ON usuarios.id = reservas.usuario_id
            INNER JOIN eventos ON eventos.id = reservas.evento_id
            ORDER BY reservas.fecha_reserva DESC
        `);
        return res.json(reservas);
    } catch (error) {
        console.error("Error listando comprobantes de reserva:", error.message);
        return res.status(500).json({ mensaje: "No se pudieron cargar las reservas." });
    }
}

module.exports = {
    obtenerEventos,
    obtenerUsuarios,
    obtenerReservas
};
