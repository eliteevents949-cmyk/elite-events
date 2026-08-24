const db = require("../config/database");


// ========================================
// CREAR RESERVA
// ========================================

async function crearReserva(usuarioId, eventoId) {

    return new Promise((resolve, reject) => {

        // Comprobar que el evento existe
        const buscarEvento = `
            SELECT id
            FROM eventos
            WHERE id = ?
        `;

        db.query(
            buscarEvento,
            [eventoId],
            (error, resultados) => {

                if (error) {
                    console.log(
                        "Error buscando evento:",
                        error
                    );

                    reject(error);
                    return;
                }

                if (resultados.length === 0) {

                    reject(
                        new Error(
                            "El evento no existe"
                        )
                    );

                    return;
                }


                // Guardar reserva
                const sql = `
                    INSERT INTO reservas
                    (usuario_id, evento_id)
                    VALUES (?, ?)
                `;

                db.query(
                    sql,
                    [usuarioId, eventoId],
                    (error, resultado) => {

                        if (error) {

                            console.log(
                                "Error guardando reserva:",
                                error
                            );

                            reject(error);
                            return;
                        }

                        resolve(resultado);
                    }
                );
            }
        );
    });
}


// ========================================
// OBTENER RESERVAS
// ========================================

async function obtenerReservas(usuarioId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                reservas.id,
                reservas.usuario_id,
                reservas.evento_id,
                eventos.nombre AS evento,
                reservas.fecha_reserva
            FROM reservas
            INNER JOIN eventos
                ON reservas.evento_id = eventos.id
            WHERE reservas.usuario_id = ?
            ORDER BY reservas.fecha_reserva DESC
        `;

        db.query(
            sql,
            [usuarioId],
            (error, resultados) => {

                if (error) {
                    console.log(
                        "Error obteniendo reservas:",
                        error
                    );

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