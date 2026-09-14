const db = require("../config/database");


// ========================================
// OBTENER NOTIFICACIONES DE UN USUARIO
// ========================================

async function obtenerNotificaciones(usuarioId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM notificaciones
            WHERE usuario_id = ?
            ORDER BY fecha DESC
        `;

        db.query(
            sql,
            [usuarioId],
            (error, resultados) => {

                if (error) {

                    console.error(
                        "ERROR OBTENIENDO NOTIFICACIONES:",
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
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ========================================

async function marcarComoLeida(id) {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE notificaciones
            SET leida = TRUE
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {

                    console.error(
                        "ERROR MARCANDO NOTIFICACIÓN:",
                        error
                    );

                    reject(error);
                    return;
                }

                resolve(resultado);
            }
        );
    });
}


module.exports = {
    obtenerNotificaciones,
    marcarComoLeida
};