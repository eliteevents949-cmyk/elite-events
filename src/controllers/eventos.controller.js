const eventosService =
    require("../services/eventos.services");


// ========================================
// OBTENER TODOS LOS EVENTOS
// ========================================

async function obtenerEventos(req, res) {

    try {

        const eventos =
            await eventosService.obtenerEventos();

        res.json(eventos);

    } catch (error) {

        console.error(
            "ERROR OBTENIENDO EVENTOS:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudieron obtener los eventos"
        });
    }
}


// ========================================
// CREAR EVENTO
// ========================================

async function crearEvento(req, res) {

    try {

        const {
            nombre,
            categoria,
            fecha,
            hora,
            lugar,
            precio,
            descripcion,
            imagen
        } = req.body;


        // Validar campos obligatorios
        if (
            !nombre ||
            !categoria ||
            !fecha ||
            !hora ||
            !lugar
        ) {

            return res.status(400).json({
                mensaje:
                    "Faltan campos obligatorios"
            });
        }


        const evento = {

            nombre: nombre.trim(),

            categoria: categoria.trim(),

            fecha,

            hora,

            lugar: lugar.trim(),

            precio:
                Number(precio) || 0,

            descripcion:
                descripcion
                    ? descripcion.trim()
                    : "",

            imagen:
                imagen || null

        };


        console.log(
            "Evento recibido:",
            evento
        );


        const resultado =
            await eventosService.crearEvento(
                evento
            );


        res.status(201).json({
            mensaje: "Evento guardado correctamente",
            id: resultado.insertId
        });


    } catch (error) {

        console.error(
            "ERROR CREANDO EVENTO:",
            error
        );

        res.status(500).json({

            mensaje:
                "No se pudo crear el evento",

            error:
                error.message

        });
    }
}


// ========================================
// ELIMINAR EVENTO
// ========================================

async function eliminarEvento(req, res) {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                mensaje:
                    "ID inválido"

            });
        }


        const resultado =
            await eventosService.eliminarEvento(
                id
            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({

                mensaje:
                    "Evento no encontrado"

            });
        }


        res.json({

            mensaje:
                "Evento eliminado correctamente"

        });


    } catch (error) {

        console.error(
            "ERROR ELIMINANDO EVENTO:",
            error
        );

        res.status(500).json({

            mensaje:
                "No se pudo eliminar el evento",

            error:
                error.message

        });
    }
}


// ========================================
// EXPORTAR
// ========================================

module.exports = {

    obtenerEventos,

    crearEvento,

    eliminarEvento

};