const nodemailer = require("nodemailer");
require("dotenv").config();


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
            pass: passwordCorreo.replace(/\s/g, "")
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
    correoUsuario,
    detalles = {}
) {

    const destinatarios = [
        process.env.ADMIN_EMAIL || process.env.MAIL_USER,
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
            <h2>Comprobante de reserva demo</h2>
            <p>Se registró una reserva para el evento:</p>
            <h3>${String(nombreEvento).replace(/[&<>"']/g, "")}</h3>
            <p><strong>Referencia:</strong> ${Number(detalles.referencia) || "Pendiente"}</p>
            <p><strong>Comprador:</strong> ${String(detalles.comprador || "Usuario").replace(/[&<>"']/g, "")}</p>
            <p><strong>Correo:</strong> ${String(correoUsuario || "").replace(/[&<>"']/g, "")}</p>
            <p><strong>Cantidad:</strong> ${Number(detalles.cantidad) || 1}</p>
            <p><strong>Valor por boleta:</strong> $${Number(precioBoleta || 0).toLocaleString("es-CO")}</p>
            <p><strong>Total de reserva:</strong> $${(Number(precioBoleta || 0) * (Number(detalles.cantidad) || 1)).toLocaleString("es-CO")}</p>
            <p>Esta plataforma registra reservas de demostración y no procesa ni confirma cobros reales.</p>
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