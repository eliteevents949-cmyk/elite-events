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
            mensaje:
                "No se pudieron obtener los eventos"
        });
    }
}


// ========================================
// OBTENER EVENTOS DEL USUARIO
// ========================================

async function obtenerEventosPorUsuario(req, res) {

    try {

        const usuarioId =
            Number(req.params.usuarioId);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {

            return res.status(400).json({
                mensaje: "ID de usuario inválido"
            });
        }

        const eventos =
            await eventosService.obtenerEventosPorUsuario(
                usuarioId
            );

        res.json(eventos);

    } catch (error) {

        console.error(
            "ERROR OBTENIENDO EVENTOS DEL USUARIO:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudieron obtener tus eventos"
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
            boletas,
            creado_por
        } = req.body;


        // ========================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // ========================================

        if (
            !nombre ||
            !categoria ||
            !fecha ||
            !hora ||
            !lugar ||
            !boletas
        ) {

            return res.status(400).json({

                mensaje:
                    "Faltan campos obligatorios"

            });
        }


        // ========================================
        // VALIDAR USUARIO
        // ========================================

        const usuarioId =
            Number(creado_por);

        const boletasDisponibles =
            Number(boletas);


        if (
            !Number.isInteger(usuarioId) ||
            usuarioId <= 0
        ) {

            return res.status(401).json({

                mensaje:
                    "Debes iniciar sesión para crear un evento"

            });
        }

        if (
            !Number.isInteger(boletasDisponibles) ||
            boletasDisponibles <= 0
        ) {

            return res.status(400).json({
                mensaje: "La cantidad de boletas debe ser un entero mayor que cero"
            });
        }


        // ========================================
        // OBTENER IMAGEN
        // ========================================

        let imagen = null;

        if (req.file) {

            imagen =
                "/uploads/" + req.file.filename;

        }


        // ========================================
        // CREAR OBJETO EVENTO
        // ========================================

        const evento = {

            nombre:
                nombre.trim(),

            categoria:
                categoria.trim(),

            fecha,

            hora,

            lugar:
                lugar.trim(),

            precio:
                Number(precio) || 0,

            boletas:
                boletasDisponibles,

            descripcion:
                descripcion
                    ? descripcion.trim()
                    : "",

            imagen,

            creado_por:
                usuarioId

        };


        console.log(
            "Evento recibido:",
            evento
        );


        // ========================================
        // GUARDAR EN MYSQL
        // ========================================

        const resultado =
            await eventosService.crearEvento(
                evento
            );


        res.status(201).json({

            mensaje:
                "Evento guardado correctamente",

            id:
                resultado.insertId

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

    obtenerEventosPorUsuario,

    crearEvento,

    eliminarEvento

};