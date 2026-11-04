const express = require("express");
const adminController = require("../controllers/admin.controller");
const requerirAdministrador = require("../middleware/admin.middleware");

const router = express.Router();

router.use(requerirAdministrador);
router.get("/eventos", adminController.obtenerEventos);
router.get("/usuarios", adminController.obtenerUsuarios);
router.get("/reservas", adminController.obtenerReservas);

module.exports = router;
