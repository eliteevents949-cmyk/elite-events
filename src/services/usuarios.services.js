const db = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

let tablaRecuperacionLista;

function asegurarTablaRecuperacion() {
    if (!tablaRecuperacionLista) {
        tablaRecuperacionLista = new Promise((resolve, reject) => {
            db.query(
                `
                    CREATE TABLE IF NOT EXISTS recuperacion_contrasenas (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        usuario_id INT NOT NULL,
                        token_hash CHAR(64) NOT NULL UNIQUE,
                        vence DATETIME NOT NULL,
                        usado_en DATETIME NULL,
                        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX (usuario_id),
                        INDEX (vence),
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                            ON DELETE CASCADE
                    )
                `,
                (error) => {
                    if (error) {
                        tablaRecuperacionLista = null;
                        reject(error);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    return tablaRecuperacionLista;
}

function ejecutarConsulta(sql, valores) {
    return new Promise((resolve, reject) => {
        db.query(sql, valores, (error, resultado) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(resultado);
        });
    });
}

async function registrarUsuario(
    nombre,
    apellido,
    correo,
    password
) {

    const passwordEncriptada =
        await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO usuarios
        (nombre, apellido, correo, password, rol)
        VALUES (?, ?, ?, ?, 'usuario')
    `;

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            [
                nombre,
                apellido,
                correo,
                passwordEncriptada
            ],
            (error, resultado) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(resultado);
            }
        );

    });
}


async function buscarUsuarioPorCorreo(correo) {

    const sql = `
        SELECT id, nombre, apellido, correo, password, rol
        FROM usuarios
        WHERE correo = ?
    `;

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            [correo],
            (error, resultados) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(resultados[0]);
            }
        );

    });
}


async function comprobarPassword(
    password,
    passwordGuardada
) {

    return await bcrypt.compare(
        password,
        passwordGuardada
    );

}


async function crearTokenRecuperacion(correo) {
    await asegurarTablaRecuperacion();

    const usuario = await buscarUsuarioPorCorreo(correo);
    if (!usuario) {
        return null;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const vence = new Date(Date.now() + 60 * 60 * 1000);

    await ejecutarConsulta(
        "DELETE FROM recuperacion_contrasenas WHERE usuario_id = ?",
        [usuario.id]
    );
    await ejecutarConsulta(
        `
            INSERT INTO recuperacion_contrasenas (usuario_id, token_hash, vence)
            VALUES (?, ?, ?)
        `,
        [usuario.id, tokenHash, vence]
    );

    return { token, correo: usuario.correo };
}


async function restablecerPassword(token, nuevaPassword) {
    await asegurarTablaRecuperacion();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const passwordEncriptada = await bcrypt.hash(nuevaPassword, 10);

    const resultado = await ejecutarConsulta(
        `
            UPDATE usuarios AS u
            INNER JOIN recuperacion_contrasenas AS r
                ON r.usuario_id = u.id
            SET u.password = ?, r.usado_en = CURRENT_TIMESTAMP
            WHERE r.token_hash = ?
              AND r.usado_en IS NULL
              AND r.vence > CURRENT_TIMESTAMP
        `,
        [passwordEncriptada, tokenHash]
    );

    return resultado.affectedRows > 0;
}


module.exports = {
    registrarUsuario,
    buscarUsuarioPorCorreo,
    comprobarPassword,
    crearTokenRecuperacion,
    restablecerPassword
};