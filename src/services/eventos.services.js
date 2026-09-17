const db = require("../config/database");


// ========================================
// OBTENER TODOS LOS EVENTOS
// ========================================

async function obtenerEventos() {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM eventos
            ORDER BY fecha ASC
        `;

        db.query(
            sql,
            (error, resultados) => {

                if (error) {

                    console.error(
                        "ERROR OBTENIENDO EVENTOS:",
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
// OBTENER EVENTOS DE UN USUARIO
// ========================================

async function obtenerEventosPorUsuario(usuarioId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM eventos
            WHERE creado_por = ?
            ORDER BY fecha ASC
        `;

        db.query(
            sql,
            [usuarioId],
            (error, resultados) => {

                if (error) {

                    console.error(
                        "ERROR OBTENIENDO EVENTOS DEL USUARIO:",
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
// CREAR EVENTO
// ========================================

async function crearEvento(evento) {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO eventos
            (
                nombre,
                categoria,
                fecha,
                hora,
                lugar,
                precio,
                boletas_disponibles,
                descripcion,
                imagen,
                creado_por
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [

            evento.nombre,

            evento.categoria,

            evento.fecha,

            evento.hora,

            evento.lugar,

            evento.precio,

            evento.boletas,

            evento.descripcion,

            evento.imagen,

            evento.creado_por

        ];

        db.query(
            sql,
            valores,
            (error, resultado) => {

                if (error) {

                    console.error(
                        "ERROR CREANDO EVENTO:",
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


// ========================================
// ELIMINAR EVENTO
// ========================================

async function eliminarEvento(id) {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM eventos
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (error, resultado) => {

                if (error) {

                    console.error(
                        "ERROR ELIMINANDO EVENTO:",
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


// ========================================
// EXPORTAR
// ========================================

module.exports = {

    obtenerEventos,

    obtenerEventosPorUsuario,

    crearEvento,

    eliminarEvento

};