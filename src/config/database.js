const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "elite_events"
});

connection.connect((error) => {

    if (error) {

        console.log(
            "❌ Error al conectar con MySQL:"
        );

        console.log(error.message);

        return;
    }

    console.log("✅ Conectado a MySQL");

    connection.query(
        `
            SELECT COUNT(*) AS existe
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'eventos'
              AND column_name = 'boletas_disponibles'
        `,
        (error, resultados) => {

            if (error || resultados[0].existe > 0) {
                return;
            }

            connection.query(
                `
                    ALTER TABLE eventos
                    ADD COLUMN boletas_disponibles INT NOT NULL DEFAULT 100
                `,
                (error) => {

                    if (error) {
                        console.log(
                            "Error agregando el límite de boletas:",
                            error.message
                        );
                    }
                }
            );
        }
    );

});

module.exports = connection;