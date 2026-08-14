const express = require("express");

const router = express.Router();

const reservasController =
    require("../controllers/reservas.controller");


router.post(
    "/",
    reservasController.crearReserva
);


router.get(
    "/usuario/:usuarioId",
    reservasController.obtenerReservas
);


module.exports = router;