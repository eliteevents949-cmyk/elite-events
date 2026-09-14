const express = require("express");

const notificacionesController =
    require("../controllers/notificaciones.controller");

const router = express.Router();


// ========================================
// OBTENER NOTIFICACIONES DE UN USUARIO
// ========================================

router.get(
    "/usuario/:usuarioId",
    notificacionesController.obtenerNotificaciones
);


// ========================================
// MARCAR COMO LEÍDA
// ========================================

router.put(
    "/:id/leida",
    notificacionesController.marcarComoLeida
);


module.exports = router;