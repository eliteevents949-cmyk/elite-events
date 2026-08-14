const express = require("express");

const eventosController =
    require("../controllers/eventos.controller");

const router = express.Router();


// Obtener todos los eventos
router.get(
    "/eventos",
    eventosController.obtenerEventos
);


// Crear un evento
router.post(
    "/eventos",
    eventosController.crearEvento
);


// Eliminar un evento
router.delete(
    "/eventos/:id",
    eventosController.eliminarEvento
);


module.exports = router;