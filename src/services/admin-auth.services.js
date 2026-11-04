const crypto = require("crypto");
const bcrypt = require("bcrypt");
const db = require("../config/database");

const secret = process.env.SESSION_SECRET || crypto.randomBytes(48).toString("base64url");

function correoAdministrador() {
    return String(process.env.ADMIN_EMAIL || process.env.MAIL_USER || "")
        .trim()
        .toLowerCase();
}

function asegurarCuentaAdministradora(correoLogin) {
    const correo = correoAdministrador();
    const passwordInicial = process.env.ADMIN_PASSWORD;

    if (
        !correo ||
        !passwordInicial ||
        String(correoLogin).trim().toLowerCase() !== correo
    ) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        db.query(
            "SELECT id FROM usuarios WHERE LOWER(correo) = ?",
            [correo],
            async (error, usuarios) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (usuarios.length) {
                    db.query(
                        "UPDATE usuarios SET rol = 'admin' WHERE id = ?",
                        [usuarios[0].id],
                        (errorActualizar) => {
                            if (errorActualizar) reject(errorActualizar);
                            else resolve();
                        }
                    );
                    return;
                }

                try {
                    const passwordHash = await bcrypt.hash(passwordInicial, 12);
                    db.query(
                        `INSERT INTO usuarios
                         (nombre, apellido, correo, password, rol)
                         VALUES (?, ?, ?, ?, 'admin')`,
                        ["Elite Events", "Admin", correo, passwordHash],
                        (errorCrear) => {
                            if (errorCrear) reject(errorCrear);
                            else resolve();
                        }
                    );
                } catch (errorHash) {
                    reject(errorHash);
                }
            }
        );
    });
}

function crearTokenAdministrador(usuario) {
    if (
        !secret ||
        usuario.rol !== "admin" ||
        !correoAdministrador() ||
        String(usuario.correo).trim().toLowerCase() !== correoAdministrador()
    ) {
        return null;
    }

    const payload = Buffer.from(JSON.stringify({
        id: usuario.id,
        correo: String(usuario.correo).trim().toLowerCase(),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    })).toString("base64url");
    const firma = crypto.createHmac("sha256", secret).update(payload).digest("base64url");

    return `${payload}.${firma}`;
}

function verificarTokenAdministrador(token) {
    if (!secret || typeof token !== "string") {
        return null;
    }

    const partes = token.split(".");
    if (partes.length !== 2) {
        return null;
    }

    const [payload, firma] = partes;
    const firmaEsperada = crypto.createHmac("sha256", secret).update(payload).digest();
    let firmaRecibida;

    try {
        firmaRecibida = Buffer.from(firma, "base64url");
    } catch (error) {
        return null;
    }

    if (
        firmaEsperada.length !== firmaRecibida.length ||
        !crypto.timingSafeEqual(firmaEsperada, firmaRecibida)
    ) {
        return null;
    }

    try {
        const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (
            !Number.isInteger(Number(datos.id)) ||
            datos.exp <= Math.floor(Date.now() / 1000) ||
            datos.correo !== correoAdministrador()
        ) {
            return null;
        }
        return datos;
    } catch (error) {
        return null;
    }
}

module.exports = {
    correoAdministrador,
    asegurarCuentaAdministradora,
    crearTokenAdministrador,
    verificarTokenAdministrador
};
