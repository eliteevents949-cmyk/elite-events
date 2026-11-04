const db = require("../config/database");

let estadoPublicacionListo;

function asegurarEstadoPublicacion() {
    if (!estadoPublicacionListo) {
        estadoPublicacionListo = new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS existe
                 FROM information_schema.columns
                 WHERE table_schema = DATABASE()
                   AND table_name = 'eventos'
                   AND column_name = 'activo'`,
                (error, resultados) => {
                    if (error) {
                        estadoPublicacionListo = null;
                        reject(error);
                        return;
                    }

                    if (resultados[0].existe > 0) {
                        resolve();
                        return;
                    }

                    db.query(
                        "ALTER TABLE eventos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1",
                        (errorMigracion) => {
                            if (errorMigracion) {
                                estadoPublicacionListo = null;
                                reject(errorMigracion);
                                return;
                            }
                            resolve();
                        }
                    );
                }
            );
        });
    }

    return estadoPublicacionListo;
}


// ========================================
// OBTENER TODOS LOS EVENTOS
// ========================================

async function obtenerEventos() {

    await asegurarEstadoPublicacion();

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM eventos
            WHERE activo = 1
            ORDER BY fecha ASC
        `;

        db.query(
            sql,
            (error, resultados) => {

                if (error) {

                  console.error("ERROR SQL:", error.code);
                  console.error("MENSAJE SQL:", error.message);

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

    await asegurarEstadoPublicacion();

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM eventos
            WHERE creado_por = ? AND activo = 1
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

    await asegurarEstadoPublicacion();

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE eventos
            SET activo = 0
            WHERE id = ? AND activo = 1
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


async function actualizarEvento(id, evento) {
    await asegurarEstadoPublicacion();
    return new Promise((resolve, reject) => {
        const columnas = [
            "nombre = ?",
            "categoria = ?",
            "fecha = ?",
            "hora = ?",
            "lugar = ?",
            "precio = ?",
            "boletas_disponibles = ?",
            "descripcion = ?"
        ];
        const valores = [
            evento.nombre,
            evento.categoria,
            evento.fecha,
            evento.hora,
            evento.lugar,
            evento.precio,
            evento.boletas,
            evento.descripcion
        ];

        if (evento.imagen) {
            columnas.push("imagen = ?");
            valores.push(evento.imagen);
        }

        valores.push(id);
        db.query(
            `UPDATE eventos SET ${columnas.join(", ")} WHERE id = ? AND activo = 1`,
            valores,
            (error, resultado) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (resultado.affectedRows > 0) {
                    resolve(resultado);
                    return;
                }

                db.query(
                    "SELECT id FROM eventos WHERE id = ? AND activo = 1",
                    [id],
                    (errorExistencia, filas) => {
                        if (errorExistencia) {
                            reject(errorExistencia);
                            return;
                        }
                        resolve({
                            ...resultado,
                            affectedRows: filas.length ? 1 : 0
                        });
                    }
                );
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

    eliminarEvento,

    actualizarEvento

};