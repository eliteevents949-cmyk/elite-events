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

        from: "TU_CORREO@gmail.com",

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


module.exports = {
    enviarNotificacion
};