const express = require("express");

const eventosRoutes = require("./eventos.routes");

const router = express.Router();


// Todas las rutas de eventos
router.use("/", eventosRoutes);


module.exports = router;