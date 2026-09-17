const nodemailer = require("nodemailer");


// ========================================
// CONFIGURACIÓN DEL CORREO
// ========================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: "eliteevents949@gmail.com",
        pass: "docv hgvu yjjr tfqr"
    }

});


// ========================================
// ENVIAR NOTIFICACIÓN
// ========================================

async function enviarNotificacion(
    correoDestino,
    nombreEvento
) {

    const mensaje = {

        from: "eliteevents949@gmail.com",

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

    await transporter.sendMail(mensaje);

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
        "eliteevents949@gmail.com",
        correoUsuario
    ].filter(
        (correo, indice, lista) =>
            correo && lista.indexOf(correo) === indice
    );

    const mensaje = {

        from: "eliteevents949@gmail.com",

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

    await transporter.sendMail(mensaje);
}


module.exports = {
    enviarNotificacion,
    enviarConfirmacionPago
};