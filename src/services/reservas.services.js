const db = require("../config/database");

async function crearReserva(usuarioId, evento) {

    const sql = `
        INSERT INTO reservas
        (usuario_id, evento)
        VALUES (?, ?)
    `;

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            [usuarioId, evento],
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


async function obtenerReservas(usuarioId) {

    const sql = `
        SELECT
            id,
            usuario_id,
            evento,
            fecha_reserva
        FROM reservas
        WHERE usuario_id = ?
        ORDER BY fecha_reserva DESC
    `;

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            [usuarioId],
            (error, resultados) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(resultados);
            }
        );

    });
}


module.exports = {
    crearReserva,
    obtenerReservas
};