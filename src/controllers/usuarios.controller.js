const usuariosService =
    require("../services/usuarios.services");
const correoService =
    require("../services/correo.services");

const solicitudesRecuperacion = new Map();
const intervaloRecuperacion = 60 * 1000;


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


async function solicitarRecuperacion(req, res) {
    const respuestaGenerica = {
        mensaje: "Si el correo pertenece a una cuenta, recibirás un enlace para restablecer la contraseña."
    };

    try {
        const correo = String(req.body.correo || "").trim().toLowerCase();
        if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return res.status(400).json({ mensaje: "Escribe un correo válido." });
        }

        const direccionIp = req.ip || "desconocida";
        const ultimaSolicitud = solicitudesRecuperacion.get(direccionIp) || 0;
        if (Date.now() - ultimaSolicitud < intervaloRecuperacion) {
            return res.status(200).json(respuestaGenerica);
        }
        solicitudesRecuperacion.set(direccionIp, Date.now());

        const urlAplicacion = process.env.APP_URL ||
            (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");

        if (!urlAplicacion) {
            throw new Error("Falta configurar APP_URL para enlaces de recuperación");
        }

        const solicitud = await usuariosService.crearTokenRecuperacion(correo);
        if (solicitud) {
            const baseUrl = urlAplicacion.replace(/\/$/, "");
            const enlace = `${baseUrl}/recuperar.html?token=${encodeURIComponent(solicitud.token)}`;
            try {
                await correoService.enviarEnlaceRecuperacion(solicitud.correo, enlace);
            } catch (errorCorreo) {
                console.error("No se pudo enviar el correo de recuperación:", errorCorreo.message);
            }
        }

        return res.status(200).json(respuestaGenerica);
    } catch (error) {
        console.error("Error al solicitar recuperación:", error.message);
        return res.status(200).json(respuestaGenerica);
    }
}


async function restablecerPassword(req, res) {
    try {
        const token = String(req.body.token || "");
        const password = String(req.body.password || "");

        if (!/^[a-f0-9]{64}$/.test(token)) {
            return res.status(400).json({ mensaje: "El enlace no es válido o ya venció." });
        }

        if (password.length < 6) {
            return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres." });
        }

        const actualizado = await usuariosService.restablecerPassword(token, password);
        if (!actualizado) {
            return res.status(400).json({ mensaje: "El enlace no es válido o ya venció." });
        }

        return res.status(200).json({ mensaje: "Contraseña actualizada. Ya puedes iniciar sesión." });
    } catch (error) {
        console.error("Error al restablecer contraseña:", error.message);
        return res.status(500).json({ mensaje: "No se pudo actualizar la contraseña." });
    }
}


module.exports = {
    registrar,
    login,
    solicitarRecuperacion,
    restablecerPassword
};