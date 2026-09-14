const express = require("express");
const multer = require("multer");

const eventosController =
    require("../controllers/eventos.controller");

const router = express.Router();


// ========================================
// CONFIGURACIÓN PARA GUARDAR IMÁGENES
// ========================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "public/uploads");

    },

    filename: function (req, file, cb) {

        const nombreArchivo =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, nombreArchivo);

    }

});


const upload = multer({
    storage: storage
});


// ========================================
// OBTENER TODOS LOS EVENTOS
// ========================================

router.get(
    "/",
    eventosController.obtenerEventos
);


// ========================================
// CREAR UN EVENTO
// ========================================

router.post(
    "/",
    upload.single("imagen"),
    eventosController.crearEvento
);


// ========================================
// ELIMINAR UN EVENTO
// ========================================

router.delete(
    "/:id",
    eventosController.eliminarEvento
);


module.exports = router;