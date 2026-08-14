const usuariosService =
    require("../services/usuarios.services");


async function registrar(req, res) {

    try {

        const {
            nombre,
            apellido,
            correo,
            password
        } = req.body;


        if (
            !nombre ||
            !apellido ||
            !correo ||
            !password
        ) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });

        }


        await usuariosService.registrarUsuario(
            nombre,
            apellido,
            correo,
            password
        );


        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });


    } catch (error) {

        console.log(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });

        }

        res.status(500).json({
            mensaje: "Error al registrar usuario"
        });

    }

}


async function login(req, res) {

    try {

        const {
            correo,
            password
        } = req.body;


        if (!correo || !password) {

            return res.status(400).json({
                mensaje: "Correo y contraseña son obligatorios"
            });

        }


        const usuario =
            await usuariosService
                .buscarUsuarioPorCorreo(correo);


        if (!usuario) {

            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });

        }


        const passwordCorrecta =
            await usuariosService
                .comprobarPassword(
                    password,
                    usuario.password
                );


        if (!passwordCorrecta) {

            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });

        }


        res.json({

            mensaje: "Inicio de sesión correcto",

            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: usuario.rol
            }

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });

    }

}


module.exports = {
    registrar,
    login
};