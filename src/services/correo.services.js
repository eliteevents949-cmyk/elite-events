const nodemailer = require("nodemailer");


// ========================================
// CONFIGURACIÓN DEL CORREO
// ========================================

function crearTransportador() {
    const usuarioCorreo = process.env.MAIL_USER;
    const passwordCorreo = process.env.MAIL_PASSWORD;

    if (!usuarioCorreo || !passwordCorreo) {
        throw new Error("Configura MAIL_USER y MAIL_PASSWORD para enviar correos");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: usuarioCorreo,
            pass: passwordCorreo
        }
    });
}


// ========================================
// ENVIAR NOTIFICACIÓN
// ========================================

async function enviarNotificacion(
    correoDestino,
    nombreEvento
) {

    const mensaje = {

        from: process.env.MAIL_USER,

        to: correoDestino,

        subject: "🔔 Nueva inscripción en Elite Events",

        html: `
            <h2>¡Nueva inscripción!</h2>

            <p>
                Alguien se ha inscrito a tu evento:
            </p>

            <h3>${nombreEvento}</h3>

            <p>
                Ingresa a Elite Events para revisar
                tus notificaciones.
            </p>

            <p>
                🎟️ Elite Events
            </p>
        `

    };

    await crearTransportador().sendMail(mensaje);

    console.log(
        "📧 Correo enviado a:",
        correoDestino
    );
}


async function enviarConfirmacionPago(
    nombreEvento,
    precioBoleta,
    correoUsuario
) {

    const destinatarios = [
        process.env.MAIL_USER,
        correoUsuario
    ].filter(
        (correo, indice, lista) =>
            correo && lista.indexOf(correo) === indice
    );

    const mensaje = {

        from: process.env.MAIL_USER,

        to: destinatarios,

        subject: "Confirmación de pago demo - Elite Events",

        html: `
            <h2>Pago demo confirmado</h2>
            <p>Se confirmó una reserva para el evento:</p>
            <h3>${nombreEvento}</h3>
            <p><strong>Precio de la boleta:</strong> $${Number(precioBoleta || 0).toLocaleString("es-CO")}</p>
            <p>Este mensaje corresponde a una demostración y no representa un cobro real.</p>
            <p>Elite Events</p>
        `
    };

    await crearTransportador().sendMail(mensaje);
}


async function enviarEnlaceRecuperacion(correoDestino, enlace) {
    await crearTransportador().sendMail({
        from: process.env.MAIL_USER,
        to: correoDestino,
        subject: "Recupera tu contraseña de Elite Events",
        html: `
            <h2>Restablece tu contraseña</h2>
            <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
            <p><a href="${enlace}">Crear una nueva contraseña</a></p>
            <p>Este enlace vence en una hora y solo puede utilizarse una vez.</p>
            <p>Si no solicitaste el cambio, puedes ignorar este mensaje.</p>
            <p>Elite Events</p>
        `
    });
}


module.exports = {
    enviarNotificacion,
    enviarConfirmacionPago,
    enviarEnlaceRecuperacion
};