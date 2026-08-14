const express = require("express");
const path = require("path");

const routes = require("./routes");

const app = express();


// Permite recibir JSON
app.use(express.json());


// Permite recibir datos de formularios
app.use(express.urlencoded({ extended: true }));


// Sirve los archivos HTML, CSS y JavaScript
app.use(express.static(path.join(__dirname, "../public")));


// Rutas de la aplicación
app.use("/", routes);


// Manejo de errores
app.use((err, req, res, next) => {

    console.error("Error:", err);

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });

});


module.exports = app;