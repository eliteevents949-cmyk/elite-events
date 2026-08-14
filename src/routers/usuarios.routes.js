const express = require("express");

const router = express.Router();

const usuariosController =
    require("../controllers/usuarios.controller");


router.post(
    "/registro",
    usuariosController.registrar
);


router.post(
    "/login",
    usuariosController.login
);


module.exports = router;