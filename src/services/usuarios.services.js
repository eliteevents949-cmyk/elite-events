const db = require("../config/database");
const bcrypt = require("bcrypt");

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


module.exports = {
    registrarUsuario,
    buscarUsuarioPorCorreo,
    comprobarPassword
};