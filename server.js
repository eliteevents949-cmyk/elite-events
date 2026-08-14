const express = require("express");
const path = require("path");


const app = express();

const PORT = 3000;


// JSON
app.use(express.json());


// Formularios
app.use(
    express.urlencoded({
        extended: true
    })
);


// Archivos HTML, CSS y JS
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// Rutas de usuarios
const usuariosRoutes =
    require("./src/routers/usuarios.routes");


app.use(
    "/api/usuarios",
    usuariosRoutes
);
const reservasRoutes =
    require("./src/routers/reservas.routes");
 app.use(
"/api/reservas",
reservasRoutes
);

// Página principal
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// Servidor
app.listen(PORT, () => {

    console.log(
        `🎉 Elite Events funcionando en http://localhost:${PORT}`
    );

});