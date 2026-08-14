const reservasService =
    require("../services/reservas.services");


async function crearReserva(req, res) {

    try {

        const {
            usuarioId,
            evento
        } = req.body;


        if (!usuarioId || !evento) {

            return res.status(400).json({
                mensaje: "Faltan datos para crear la reserva"
            });

        }


        await reservasService.crearReserva(
            usuarioId,
            evento
        );


        res.status(201).json({
            mensaje: "Reserva guardada correctamente"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al guardar la reserva"
        });

    }

}


async function obtenerReservas(req, res) {

    try {

        const usuarioId =
            req.params.usuarioId;


        const reservas =
            await reservasService.obtenerReservas(
                usuarioId
            );


        res.json(reservas);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener reservas"
        });

    }

}


module.exports = {
    crearReserva,
    obtenerReservas
};