const db = require("../config/database");


// Obtener todos los eventos
async function obtenerEventos() {

    const [rows] = await db.execute(
        "SELECT * FROM eventos ORDER BY fecha ASC"
    );

    return rows;

}


// Crear evento
async function crearEvento(evento) {

    const [resultado] = await db.execute(

        `INSERT INTO eventos
        (nombre, fecha, lugar, precio, categoria)
        VALUES (?, ?, ?, ?, ?)`,

        [
            evento.nombre,
            evento.fecha,
            evento.lugar,
            evento.precio,
            evento.categoria
        ]

    );

    return resultado;

}


// Eliminar evento
async function eliminarEvento(id) {

    const [resultado] = await db.execute(

        "DELETE FROM eventos WHERE id = ?",

        [id]

    );

    return resultado;

}


module.exports = {

    obtenerEventos,
    crearEvento,
    eliminarEvento

};