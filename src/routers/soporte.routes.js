const express = require("express");
const soporteController = require("../controllers/soporte.controller");

const router = express.Router();

router.get("/admin", soporteController.obtenerMensajesAdmin);
router.post("/admin/responder", soporteController.responderComoAdmin);
router.get("/:usuarioId", soporteController.obtenerMensajes);
router.post("/:usuarioId", soporteController.enviarMensaje);

module.exports = router;
