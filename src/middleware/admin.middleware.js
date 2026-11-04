const db = require("../config/database");
const authService = require("../services/admin-auth.services");

function requerirAdministrador(req, res, next) {
    const autorizacion = req.get("authorization") || "";
    const token = autorizacion.startsWith("Bearer ")
        ? autorizacion.slice(7)
        : "";
    const administrador = authService.verificarTokenAdministrador(token);

    if (!administrador) {
        return res.status(401).json({ mensaje: "Inicia sesión con la cuenta administradora." });
    }

    db.query(
        "SELECT id, correo, rol FROM usuarios WHERE id = ?",
        [administrador.id],
        (error, usuarios) => {
            if (error) {
                return res.status(500).json({ mensaje: "No se pudo verificar el permiso." });
            }

            const usuario = usuarios[0];
            const correoAdministrador = authService.correoAdministrador();
            if (
                !usuario ||
                usuario.rol !== "admin" ||
                String(usuario.correo).trim().toLowerCase() !== correoAdministrador
            ) {
                return res.status(403).json({ mensaje: "No tienes permisos de administrador." });
            }

            req.administrador = { id: usuario.id, correo: usuario.correo };
            next();
        }
    );
}

module.exports = requerirAdministrador;
