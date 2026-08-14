const eventosService =
    require("../services/eventos.service");


// GET /eventos
async function obtenerEventos(req, res) {

    try {

        const eventos =
            await eventosService.obtenerEventos();

        res.json(eventos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudieron obtener los eventos"
        });

    }

}


// POST /eventos
async function crearEvento(req, res) {

    try {

        const {
            nombre,
            fecha,
            lugar,
            precio,
            categoria
        } = req.body;


        // Validación
        if (
            !nombre ||
            !fecha ||
            !lugar ||
            !categoria
        ) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });

        }


        const evento = {

            nombre,
            fecha,
            lugar,
            precio: Number(precio) || 0,
            categoria

        };


        const resultado =
            await eventosService.crearEvento(evento);


        res.status(201).json({
            mensaje: "Evento creado correctamente",
            id: resultado.insertId
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo crear el evento"
        });

    }

}


// DELETE /eventos/:id
async function eliminarEvento(req, res) {

    try {

        const id = Number(req.params.id);


        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                mensaje: "ID inválido"
            });

        }


        const resultado =
            await eventosService.eliminarEvento(id);


        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensaje: "Evento no encontrado"
            });

        }


        res.json({
            mensaje: "Evento eliminado correctamente"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo eliminar el evento"
        });

    }

}


module.exports = {

    obtenerEventos,
    crearEvento,
    eliminarEvento

};