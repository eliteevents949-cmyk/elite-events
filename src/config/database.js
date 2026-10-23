require("dotenv").config();

const mysql = require("mysql2");


// ========================================
// CONEXIÓN A MYSQL
// ========================================

const usarSSL = process.env.DB_SSL === "true";

const connection = mysql.createConnection({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    ssl: usarSSL
        ? { rejectUnauthorized: false }
        : undefined

});


// ========================================
// CONECTAR
// ========================================

connection.connect((error) => {

    if (error) {

        console.log("❌ Error al conectar con MySQL:");
        console.log(error.message);

        return;
    }

    console.log("✅ Conectado a MySQL");


    // ========================================
    // TABLA MENSAJES DE SOPORTE
    // ========================================

    connection.query(
        `
        CREATE TABLE IF NOT EXISTS mensajes_soporte (

            id INT AUTO_INCREMENT PRIMARY KEY,

            usuario_id INT NOT NULL,

            autor_rol VARCHAR(20) NOT NULL,

            mensaje VARCHAR(1000) NOT NULL,

            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX (usuario_id),

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE

        )
        `,
        (error) => {

            if (error) {

                console.log(
                    "Error creando mensajes de soporte:",
                    error.message
                );

            }

        }
    );


    // ========================================
    // VERIFICAR BOLETAS DISPONIBLES
    // ========================================

    connection.query(
        `
        SELECT COUNT(*) AS existe

        FROM information_schema.columns

        WHERE table_schema = DATABASE()

          AND table_name = 'eventos'

          AND column_name = 'boletas_disponibles'
        `,
        (error, resultados) => {

            if (error) {

                console.log(
                    "Error verificando boletas:",
                    error.message
                );

                return;
            }


            if (resultados[0].existe > 0) {

                return;

            }


            // ========================================
            // AGREGAR COLUMNA
            // ========================================

            connection.query(
                `
                ALTER TABLE eventos

                ADD COLUMN boletas_disponibles
                INT NOT NULL DEFAULT 100
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