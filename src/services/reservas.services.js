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
                eventos.precio,
                eventos.creado_por,
                eventos.boletas_disponibles,
                usuarios.correo AS correo_creador,
                comprador.correo AS correo_comprador
            FROM eventos
            LEFT JOIN usuarios
                ON eventos.creado_por = usuarios.id
            LEFT JOIN usuarios AS comprador
                ON comprador.id = ?
            WHERE eventos.id = ?
        `;

        db.query(
            buscarEvento,
            [usuarioId, eventoId],
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

                const descontarBoleta = `
                    UPDATE eventos
                    SET boletas_disponibles = boletas_disponibles - 1
                    WHERE id = ?
                      AND boletas_disponibles > 0
                                            AND fecha > CURDATE()
                `;

                db.query(
                    descontarBoleta,
                    [eventoId],
                    (error, descuento) => {

                        if (error) {
                            reject(error);
                            return;
                        }

                        if (descuento.affectedRows === 0) {
                            reject(
                                new Error(
                                    "El evento ya no está disponible"
                                )
                            );
                            return;
                        }


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

                                    db.query(
                                        "UPDATE eventos SET boletas_disponibles = boletas_disponibles + 1 WHERE id = ?",
                                        [eventoId]
                                    );

                            console.log(
                                "Error guardando reserva:",
                                error
                            );

                                    reject(error);
                                    return;
                                }

                            try {

                            await correoService.enviarConfirmacionPago(
                                evento.nombre,
                                evento.precio,
                                evento.correo_comprador
                            );

                            } catch (error) {

                            console.log(
                                "Error enviando confirmación de pago:",
                                error
                            );
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
                eventos.imagen,
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