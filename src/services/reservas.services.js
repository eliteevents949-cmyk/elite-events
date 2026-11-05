const db = require("../config/database");

const correoService =
    require("./correo.services");

let precioReservaListo;

async function asegurarPrecioReserva() {
    if (!precioReservaListo) {
        precioReservaListo = new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS existe
                 FROM information_schema.columns
                 WHERE table_schema = DATABASE()
                   AND table_name = 'reservas'
                   AND column_name = 'precio_unitario'`,
                (error, resultados) => {
                    if (error) {
                        precioReservaListo = null;
                        reject(error);
                        return;
                    }

                    const completarMigracion = () => {
                        db.query(
                            `UPDATE reservas
                             INNER JOIN eventos ON eventos.id = reservas.evento_id
                             SET reservas.precio_unitario = eventos.precio
                             WHERE reservas.precio_unitario IS NULL`,
                            (errorActualizacion) => {
                                if (errorActualizacion) {
                                    precioReservaListo = null;
                                    reject(errorActualizacion);
                                    return;
                                }
                                resolve();
                            }
                        );
                    };

                    if (resultados[0].existe > 0) {
                        completarMigracion();
                        return;
                    }

                    db.query(
                        "ALTER TABLE reservas ADD COLUMN precio_unitario DECIMAL(10, 2) NULL",
                        (errorMigracion) => {
                            if (errorMigracion) {
                                precioReservaListo = null;
                                reject(errorMigracion);
                                return;
                            }
                            completarMigracion();
                        }
                    );
                }
            );
        });
    }

    return precioReservaListo;
}


// ========================================
// CREAR RESERVA
// ========================================

async function crearReserva(usuarioId, eventoId) {

    await asegurarPrecioReserva();

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
                comprador.correo AS correo_comprador,
                comprador.nombre AS nombre_comprador,
                comprador.apellido AS apellido_comprador
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
                    (usuario_id, evento_id, cantidad, precio_unitario)
                    VALUES (?, ?, 1, ?)
                `;

                        db.query(
                            sql,
                            [usuarioId, eventoId, evento.precio],
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
                                evento.correo_comprador,
                                {
                                    referencia: resultado.insertId,
                                    comprador: `${evento.nombre_comprador || ""} ${evento.apellido_comprador || ""}`.trim(),
                                    cantidad: 1
                                }
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
                eventos.fecha AS fecha_evento,
                eventos.hora AS hora_evento,
                eventos.lugar AS lugar_evento,
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
    obtenerReservas,
    asegurarPrecioReserva
};