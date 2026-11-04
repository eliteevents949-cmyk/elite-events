require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const db = require("../config/database");

const correo = String(process.env.ADMIN_EMAIL || process.env.MAIL_USER || "")
    .trim()
    .toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const archivoEnv = path.resolve(process.cwd(), ".env");

function guardarConfiguracionLocal() {
    let contenido = fs.existsSync(archivoEnv)
        ? fs.readFileSync(archivoEnv, "utf8")
        : "";
    const valores = {
        ADMIN_EMAIL: correo,
        SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(48).toString("base64url")
    };

    for (const [clave, valor] of Object.entries(valores)) {
        const patron = new RegExp(`^${clave}=.*$`, "m");
        if (patron.test(contenido)) {
            contenido = contenido.replace(patron, `${clave}=${valor}`);
        } else {
            contenido += `${contenido && !contenido.endsWith("\n") ? "\n" : ""}${clave}=${valor}\n`;
        }
        process.env[clave] = valor;
    }

    fs.writeFileSync(archivoEnv, contenido);
}

if (!correo) {
    console.error("Configura ADMIN_EMAIL en .env antes de promover la cuenta.");
    db.end();
    process.exitCode = 1;
} else if (!password || password.length < 8) {
    console.error("Define ADMIN_PASSWORD temporalmente con al menos 8 caracteres y vuelve a ejecutar el comando.");
    db.end();
    process.exitCode = 1;
} else {
    guardarConfiguracionLocal();
    bcrypt.hash(password, 12).then((passwordHash) => {
        db.query(
            "SELECT id FROM usuarios WHERE LOWER(correo) = ?",
            [correo],
            (error, usuarios) => {
                if (error) {
                    console.error("No se pudo consultar la cuenta:", error.message);
                    process.exitCode = 1;
                    db.end();
                    return;
                }

                const terminar = (errorGuardar) => {
                    if (errorGuardar) {
                        console.error("No se pudo configurar la cuenta:", errorGuardar.message);
                        process.exitCode = 1;
                    } else {
                        console.log("Cuenta administradora configurada. La contraseña quedó cifrada y no se guardó en .env.");
                        console.log("Cierra sesiones anteriores e inicia sesión de nuevo para entrar al panel.");
                    }
                    db.end();
                };

                if (usuarios.length) {
                    db.query(
                        "UPDATE usuarios SET password = ?, rol = 'admin' WHERE id = ?",
                        [passwordHash, usuarios[0].id],
                        (errorActualizar) => terminar(errorActualizar)
                    );
                    return;
                }

                db.query(
                    "INSERT INTO usuarios (nombre, apellido, correo, password, rol) VALUES (?, ?, ?, ?, 'admin')",
                    ["Elite Events", "Admin", correo, passwordHash],
                    (errorCrear) => terminar(errorCrear)
                );
            }
        );
    }).catch((error) => {
        console.error("No se pudo cifrar la contraseña:", error.message);
        process.exitCode = 1;
        db.end();
    });
}
