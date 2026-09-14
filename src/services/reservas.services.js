const db = require("../config/database");

const correoService =
    require("./correo.services");


// ========================================
// CREAR RESERVA
// ========================================

async function crearReserva(usuarioId, eventoId) {

    return new Promise((resolve, reject) => {

        // ========================================
        // BUSCAR EVENTO, DUEÑO Y CORREO
        // ========================================

        const buscarEvento = `
            SELECT
                eventos.id,
                eventos.nombre,
                eventos.creado_por,
                usuarios.correo AS correo_creador
            FROM eventos
            LEFT JOIN usuarios
                ON eventos.creado_por = usuarios.id
            WHERE eventos.id = ?
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

                const evento = resultados[0];


                // ========================================
                // GUARDAR RESERVA
                // ========================================

                const sql = `
                    INSERT INTO reservas
                    (usuario_id, evento_id)
                    VALUES (?, ?)
                `;

                db.query(
                    sql,
                    [usuarioId, eventoId],
                    async (error, resultado) => {

                        if (error) {

                            console.log(
                                "Error guardando reserva:",
                                error
                            );

                            reject(error);
                            return;
                        }


                        // ========================================
                        // CREAR NOTIFICACIÓN
                        // ========================================

                        if (
                            evento.creado_por &&
                            Number(evento.creado_por) !==
                            Number(usuarioId)
                        ) {

                            const mensaje =
                                `🎟️ Un usuario se ha inscrito a tu evento "${evento.nombre}".`;

                            const notificacion = `
                                INSERT INTO notificaciones
                                (usuario_id, mensaje)
                                VALUES (?, ?)
                            `;

                            db.query(
                                notificacion,
                                [
                                    evento.creado_por,
                                    mensaje
                                ],
                                async (error) => {

                                    if (error) {

                                        console.log(
                                            "Error creando notificación:",
                                            error
                                        );

                                        // La reserva ya se guardó.
                                        // No la eliminamos por un
                                        // problema con la notificación.

                                    }


                                    // ========================================
                                    // ENVIAR CORREO
                                    // ========================================

                                    if (evento.correo_creador) {

                                        try {

                                            await correoService
                                                .enviarNotificacion(
                                                    evento.correo_creador,
                                                    evento.nombre
                                                );

                                            console.log(
                                                "📧 Correo enviado correctamente"
                                            );

                                        } catch (error) {

                                            console.log(
                                                "Error enviando correo:",
                                                error
                                            );

                                        }

                                    }


                                    resolve(resultado);

                                }
                            );

                        } else {

                            resolve(resultado);

                        }

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


// ========================================
// EXPORTAR
// ========================================

module.exports = {
    crearReserva,
    obtenerReservas
};