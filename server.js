const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// ========================================
// JSON
// ========================================

app.use(express.json());


// ========================================
// FORMULARIOS
// ========================================

app.use(
    express.urlencoded({
        extended: true
    })
);


// ========================================
// ARCHIVOS HTML, CSS Y JS
// ========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ========================================
// RUTAS DE USUARIOS
// ========================================

const usuariosRoutes =
    require("./src/routers/usuarios.routes");

app.use(
    "/api/usuarios",
    usuariosRoutes
);
const notificacionesRoutes =
    require("./src/routers/notificaciones.routes");

app.use(
    "/api/notificaciones",
    notificacionesRoutes
);


// ========================================
// RUTAS DE RESERVAS
// ========================================

const reservasRoutes =
    require("./src/routers/reservas.routes");

app.use(
    "/api/reservas",
    reservasRoutes
);


// ========================================
// RUTAS DE EVENTOS
// ========================================

const eventosRoutes =
    require("./src/routers/eventos.routes");

app.use(
    "/api/eventos",
    eventosRoutes
);


// ========================================
// PÁGINA PRINCIPAL
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ========================================
// SERVIDOR
// ========================================

app.listen(PORT, () => {

    console.log(
        ` Elite Events funcionando en http://localhost:${PORT}`
    );

});