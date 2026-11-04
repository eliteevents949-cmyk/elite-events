
const eventosService = require("../services/eventos.services");

// ========================================
// OBTENER TODOS LOS EVENTOS
// ========================================

async function obtenerEventos(req, res) {
    try {
        const eventos = await eventosService.obtenerEventos();
        return res.status(200).json(eventos);
    } catch (error) {
        console.error("ERROR OBTENIENDO EVENTOS:", error);

        return res.status(500).json({
            mensaje: "No se pudieron obtener los eventos",
            error: error.message
        });
    }
}

// ========================================
// OBTENER EVENTOS POR USUARIO
// ========================================

async function obtenerEventosPorUsuario(req, res) {
    try {
        const usuarioId = Number(req.params.usuarioId);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({
                mensaje: "ID de usuario inválido"
            });
        }

        const eventos =
            await eventosService.obtenerEventosPorUsuario(usuarioId);

        return res.status(200).json(eventos);

    } catch (error) {
        console.error("ERROR OBTENIENDO EVENTOS DEL USUARIO:", error);

        return res.status(500).json({
            mensaje: "No se pudieron obtener tus eventos",
            error: error.message
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

        if (
            !nombre?.trim() ||
            !categoria?.trim() ||
            !fecha ||
            !hora ||
            !lugar?.trim()
        ) {
            return res.status(400).json({
                mensaje: "Completa los campos obligatorios"
            });
        }

        const usuarioId = Number(creado_por);
        const precioEvento = Number(precio ?? 0);
        const cantidadBoletas = Number(boletas);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({
                mensaje: "El usuario que crea el evento no es válido"
            });
        }

        if (!Number.isFinite(precioEvento) || precioEvento < 0) {
            return res.status(400).json({
                mensaje: "El precio no es válido"
            });
        }

        if (!Number.isInteger(cantidadBoletas) || cantidadBoletas <= 0) {
            return res.status(400).json({
                mensaje: "La cantidad de boletas debe ser mayor que cero"
            });
        }

        const imagen = req.file
            ? "/uploads/" + req.file.filename
            : null;

        const evento = {
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            fecha,
            hora,
            lugar: lugar.trim(),
            precio: precioEvento,
            boletas: cantidadBoletas,
            descripcion: descripcion || "",
            imagen,
            creado_por: usuarioId
        };

        const resultado = await eventosService.crearEvento(evento);

        return res.status(201).json({
            mensaje: "Evento creado correctamente",
            id: resultado.insertId
        });

    } catch (error) {
        console.error("ERROR CREANDO EVENTO:", error);

        return res.status(500).json({
            mensaje: "No se pudo crear el evento",
            error: error.message
        });
    }
}

// ========================================
// ELIMINAR EVENTO
// ========================================

async function eliminarEvento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: "ID de evento inválido"
            });
        }

        const resultado = await eventosService.eliminarEvento(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "El evento no existe"
            });
        }

        return res.status(200).json({
            mensaje: "Evento retirado de publicación; las reservas históricas se conservaron."
        });

    } catch (error) {
        console.error("ERROR ELIMINANDO EVENTO:", error);

        return res.status(500).json({
            mensaje: "No se pudo eliminar el evento",
            error: error.message
        });
    }
}


async function actualizarEvento(req, res) {
    const id = Number(req.params.id);
    const {
        nombre,
        categoria,
        fecha,
        hora,
        lugar,
        precio,
        descripcion,
        boletas
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ mensaje: "ID de evento inválido." });
    }

    if (!nombre?.trim() || !categoria?.trim() || !fecha || !hora || !lugar?.trim()) {
        return res.status(400).json({ mensaje: "Completa los campos obligatorios." });
    }

    const precioNumerico = Number(precio);
    const boletasNumericas = Number(boletas);
    if (!Number.isFinite(precioNumerico) || precioNumerico < 0) {
        return res.status(400).json({ mensaje: "El precio no es válido." });
    }
    if (!Number.isInteger(boletasNumericas) || boletasNumericas < 0) {
        return res.status(400).json({ mensaje: "La cantidad de boletas no es válida." });
    }

    try {
        const resultado = await eventosService.actualizarEvento(id, {
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            fecha,
            hora,
            lugar: lugar.trim(),
            precio: precioNumerico,
            boletas: boletasNumericas,
            descripcion: descripcion || "",
            imagen: req.file ? `/uploads/${req.file.filename}` : null
        });

        if (!resultado.affectedRows) {
            return res.status(404).json({ mensaje: "El evento no existe." });
        }
        return res.json({ mensaje: "Evento actualizado correctamente." });
    } catch (error) {
        console.error("ERROR ACTUALIZANDO EVENTO:", error.message);
        return res.status(500).json({ mensaje: "No se pudo actualizar el evento." });
    }
}

module.exports = {
    obtenerEventos,
    obtenerEventosPorUsuario,
    crearEvento,
    eliminarEvento,
    actualizarEvento
};
