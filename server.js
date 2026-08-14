const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;


// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==============================
// ARCHIVOS PUBLIC
// ==============================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==============================
// RUTAS USUARIOS
// ==============================

const usuariosRoutes =
    require("./src/routers/usuarios.routes");

app.use(
    "/api/usuarios",
    usuariosRoutes
);


// ==============================
// PÁGINA PRINCIPAL
// ==============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ==============================
// SERVIDOR
// ==============================

app.listen(PORT, () => {

    console.log(
        `🎉 Elite Events funcionando en http://localhost:${PORT}`
    );

});